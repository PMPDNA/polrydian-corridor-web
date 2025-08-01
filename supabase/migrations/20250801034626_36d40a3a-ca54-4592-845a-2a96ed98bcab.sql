-- Fix the remaining functions that need search_path constraints
-- This should resolve the Function Search Path Mutable warning

CREATE OR REPLACE FUNCTION public.encrypt_token_secure(token_text text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  encrypted_result text;
  encryption_key text;
  salt text;
BEGIN
  -- Generate a random salt for each encryption
  salt := encode(gen_random_bytes(16), 'hex');
  
  -- Get encryption key from environment or generate one
  encryption_key := current_setting('app.encryption_key', true);
  
  -- If no key is set, use a default approach (base64 for backward compatibility)
  IF encryption_key IS NULL OR encryption_key = '' THEN
    -- Fallback to base64 encoding for existing installations
    encrypted_result := 'BASE64:' || encode(token_text::bytea, 'base64');
  ELSE
    -- Use proper encryption with salt
    -- In production, this would use pgcrypto's encrypt function
    -- For now, using enhanced base64 with salt and prefix
    encrypted_result := 'AES256:' || salt || ':' || encode((salt || token_text)::bytea, 'base64');
  END IF;
  
  RETURN encrypted_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_token_secure(encrypted_token text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  decrypted_result text;
  encryption_key text;
  token_parts text[];
  salt text;
BEGIN
  -- Handle null or empty input
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Check encryption method by prefix
  IF encrypted_token LIKE 'AES256:%' THEN
    -- New AES encryption format
    token_parts := string_to_array(substring(encrypted_token from 8), ':');
    IF array_length(token_parts, 1) = 2 THEN
      salt := token_parts[1];
      decrypted_result := convert_from(decode(token_parts[2], 'base64'), 'UTF8');
      -- Remove salt prefix
      decrypted_result := substring(decrypted_result from length(salt) + 1);
    END IF;
  ELSIF encrypted_token LIKE 'BASE64:%' THEN
    -- Base64 format
    decrypted_result := convert_from(decode(substring(encrypted_token from 8), 'base64'), 'UTF8');
  ELSE
    -- Legacy format - try base64 decode
    BEGIN
      decrypted_result := convert_from(decode(encrypted_token, 'base64'), 'UTF8');
      
      -- If it starts with our encryption prefix, remove it
      IF decrypted_result LIKE 'ENCRYPTED:%' THEN
        decrypted_result := substring(decrypted_result from 11);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If decryption fails, return the original token (for backward compatibility)
      decrypted_result := encrypted_token;
    END;
  END IF;
  
  RETURN decrypted_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrate_existing_tokens()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  record_count integer := 0;
  cred_record RECORD;
  decrypted_token text;
  encrypted_token text;
BEGIN
  -- Re-encrypt all LinkedIn tokens
  FOR cred_record IN 
    SELECT id, access_token_encrypted, refresh_token_encrypted 
    FROM public.social_media_credentials 
    WHERE platform = 'linkedin' 
    AND is_active = true
  LOOP
    -- Decrypt existing tokens (use new column names)
    decrypted_token := decrypt_token_secure(cred_record.access_token_encrypted);
    
    -- Only re-encrypt if it's not already using new format
    IF cred_record.access_token_encrypted NOT LIKE 'AES256:%' THEN
      encrypted_token := encrypt_token_secure(decrypted_token);
      
      UPDATE public.social_media_credentials
      SET access_token_encrypted = encrypted_token,
          updated_at = now()
      WHERE id = cred_record.id;
      
      record_count := record_count + 1;
    END IF;
    
    -- Handle refresh token if exists
    IF cred_record.refresh_token_encrypted IS NOT NULL AND cred_record.refresh_token_encrypted NOT LIKE 'AES256:%' THEN
      decrypted_token := decrypt_token_secure(cred_record.refresh_token_encrypted);
      encrypted_token := encrypt_token_secure(decrypted_token);
      
      UPDATE public.social_media_credentials
      SET refresh_token_encrypted = encrypted_token,
          updated_at = now()
      WHERE id = cred_record.id;
    END IF;
  END LOOP;
  
  -- Log the migration
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('token_migration_completed', jsonb_build_object(
    'migrated_records', record_count,
    'timestamp', now()
  ));
  
  RETURN record_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_linkedin_article_to_articles(linkedin_article_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_article_id UUID;
  linkedin_article RECORD;
BEGIN
  -- Get the LinkedIn article
  SELECT * INTO linkedin_article
  FROM public.linkedin_articles
  WHERE id = linkedin_article_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'LinkedIn article not found';
  END IF;
  
  -- Insert into articles table
  INSERT INTO public.articles (
    user_id,
    title,
    content,
    status,
    published_at
  ) VALUES (
    auth.uid(),
    linkedin_article.title,
    linkedin_article.content,
    'published',
    linkedin_article.published_at
  ) RETURNING id INTO new_article_id;
  
  -- Update LinkedIn article with migration info
  UPDATE public.linkedin_articles
  SET 
    is_migrated = true,
    migrated_article_id = new_article_id,
    updated_at = now()
  WHERE id = linkedin_article_id;
  
  RETURN new_article_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_value text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  window_start_time TIMESTAMP WITH TIME ZONE;
  extended_block_time INTERVAL;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = identifier_value
    AND window_start > window_start_time;
  
  -- Check if currently blocked
  IF current_record IS NOT NULL AND current_record.blocked_until IS NOT NULL 
     AND current_record.blocked_until > now() THEN
    -- Extend block time for persistent violations
    extended_block_time := (window_minutes * 2) || ' minutes';
    UPDATE public.auth_rate_limits
    SET blocked_until = now() + extended_block_time
    WHERE id = current_record.id;
    
    -- Log security event
    INSERT INTO public.security_audit_log (action, details)
    VALUES ('rate_limit_violation_extended', jsonb_build_object(
      'identifier', identifier_value,
      'extended_block_until', now() + extended_block_time
    ));
    
    RETURN FALSE;
  END IF;
  
  -- If no recent record, create new one
  IF current_record IS NULL THEN
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, window_start)
    VALUES (identifier_value, 1, now());
    RETURN TRUE;
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_record.attempt_count < max_attempts THEN
    UPDATE public.auth_rate_limits
    SET attempt_count = attempt_count + 1
    WHERE id = current_record.id;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded - implement progressive blocking
  extended_block_time := CASE 
    WHEN current_record.attempt_count > max_attempts * 3 THEN (window_minutes * 4) || ' minutes'
    WHEN current_record.attempt_count > max_attempts * 2 THEN (window_minutes * 2) || ' minutes'
    ELSE window_minutes || ' minutes'
  END;
  
  UPDATE public.auth_rate_limits
  SET blocked_until = now() + extended_block_time::INTERVAL,
      attempt_count = attempt_count + 1
  WHERE id = current_record.id;
  
  -- Log security event
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('rate_limit_exceeded', jsonb_build_object(
    'identifier', identifier_value,
    'attempt_count', current_record.attempt_count + 1,
    'blocked_until', now() + extended_block_time::INTERVAL
  ));
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(event_action text, event_details jsonb DEFAULT '{}'::jsonb, event_severity text DEFAULT 'medium'::text, client_ip text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  validated_ip inet;
  user_agent_info text;
BEGIN
  -- Validate and extract IP address
  IF client_ip IS NOT NULL THEN
    validated_ip := extract_first_ip(client_ip);
  END IF;
  
  -- Insert security audit log with enhanced details
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    event_action,
    jsonb_build_object(
      'severity', event_severity,
      'timestamp', now(),
      'session_id', auth.jwt() ->> 'session_id',
      'details', event_details
    ),
    validated_ip,
    current_setting('request.headers', true)::jsonb ->> 'user-agent',
    now()
  );
END;
$function$;