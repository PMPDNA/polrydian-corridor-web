-- Enable pgcrypto extension for real encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop the fake encryption functions
DROP FUNCTION IF EXISTS public.encrypt_token_secure(text);
DROP FUNCTION IF EXISTS public.decrypt_token_secure(text);

-- Create REAL encryption function using pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_token_secure(token_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  encryption_key text;
  encrypted_result text;
BEGIN
  -- Handle null or empty input
  IF token_text IS NULL OR token_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Get encryption key from Supabase secrets
  encryption_key := current_setting('app.encryption_key', true);
  
  -- If no key is set, generate a secure error
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'SECURITY_ERROR: Encryption key not configured. Cannot encrypt tokens.';
  END IF;
  
  -- Use pgcrypto's pgp_sym_encrypt for real AES encryption
  encrypted_result := encode(pgp_sym_encrypt(token_text, encryption_key), 'base64');
  
  -- Prefix to indicate real encryption
  RETURN 'PGP_AES:' || encrypted_result;
END;
$$;

-- Create REAL decryption function using pgcrypto
CREATE OR REPLACE FUNCTION public.decrypt_token_secure(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decrypted_result text;
  encryption_key text;
  encrypted_data text;
BEGIN
  -- Handle null or empty input
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Get encryption key from Supabase secrets
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    RAISE EXCEPTION 'SECURITY_ERROR: Encryption key not configured. Cannot decrypt tokens.';
  END IF;
  
  -- Handle new PGP encryption format
  IF encrypted_token LIKE 'PGP_AES:%' THEN
    encrypted_data := substring(encrypted_token from 9);
    decrypted_result := pgp_sym_decrypt(decode(encrypted_data, 'base64'), encryption_key);
    
  -- Backward compatibility for fake encrypted tokens (migrate them)
  ELSIF encrypted_token LIKE 'AES256:%' THEN
    -- These are fake encrypted - just base64 decode and re-encrypt properly
    DECLARE
      token_parts text[];
    BEGIN
      token_parts := string_to_array(substring(encrypted_token from 8), ':');
      IF array_length(token_parts, 1) >= 3 THEN
        encrypted_data := token_parts[3];
        decrypted_result := convert_from(decode(encrypted_data, 'base64'), 'UTF8');
        -- Remove salt and IV prefix that was fake
        decrypted_result := substring(decrypted_result from 33);
      END IF;
    END;
    
  -- Handle legacy base64 tokens
  ELSIF encrypted_token LIKE 'BASE64:%' THEN
    decrypted_result := convert_from(decode(substring(encrypted_token from 8), 'base64'), 'UTF8');
    
  ELSE
    -- Try legacy base64 decode as fallback
    BEGIN
      decrypted_result := convert_from(decode(encrypted_token, 'base64'), 'UTF8');
      IF decrypted_result LIKE 'ENCRYPTED:%' THEN
        decrypted_result := substring(decrypted_result from 11);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If all decryption fails, log error and return null
      INSERT INTO public.security_audit_log (action, details)
      VALUES ('token_decryption_failed', jsonb_build_object(
        'error', 'Failed to decrypt token - may be corrupted',
        'token_format', substring(encrypted_token from 1 for 20) || '...',
        'severity', 'high'
      ));
      RETURN NULL;
    END;
  END IF;
  
  RETURN decrypted_result;
END;
$$;

-- Create function to migrate all existing tokens to real encryption
CREATE OR REPLACE FUNCTION public.migrate_existing_tokens()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  record_count integer := 0;
  cred_record RECORD;
  decrypted_token text;
  encrypted_token text;
BEGIN
  -- Check if encryption key is configured
  IF current_setting('app.encryption_key', true) IS NULL OR current_setting('app.encryption_key', true) = '' THEN
    RAISE EXCEPTION 'SECURITY_ERROR: Encryption key must be configured before token migration. Please set app.encryption_key in Supabase secrets.';
  END IF;
  
  -- Re-encrypt all social media tokens with REAL encryption
  FOR cred_record IN 
    SELECT id, access_token_encrypted, refresh_token_encrypted, platform
    FROM public.social_media_credentials 
    WHERE is_active = true
  LOOP
    -- Migrate access token
    IF cred_record.access_token_encrypted IS NOT NULL THEN
      -- Decrypt using old method (handles all legacy formats)
      decrypted_token := decrypt_token_secure(cred_record.access_token_encrypted);
      
      IF decrypted_token IS NOT NULL AND NOT cred_record.access_token_encrypted LIKE 'PGP_AES:%' THEN
        -- Re-encrypt with REAL encryption
        encrypted_token := encrypt_token_secure(decrypted_token);
        
        UPDATE public.social_media_credentials
        SET access_token_encrypted = encrypted_token,
            updated_at = now()
        WHERE id = cred_record.id;
        
        record_count := record_count + 1;
      END IF;
    END IF;
    
    -- Migrate refresh token
    IF cred_record.refresh_token_encrypted IS NOT NULL THEN
      decrypted_token := decrypt_token_secure(cred_record.refresh_token_encrypted);
      
      IF decrypted_token IS NOT NULL AND NOT cred_record.refresh_token_encrypted LIKE 'PGP_AES:%' THEN
        encrypted_token := encrypt_token_secure(decrypted_token);
        
        UPDATE public.social_media_credentials
        SET refresh_token_encrypted = encrypted_token,
            updated_at = now()
        WHERE id = cred_record.id;
      END IF;
    END IF;
  END LOOP;
  
  -- Log the migration with real encryption
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('real_token_encryption_migration_completed', jsonb_build_object(
    'migrated_records', record_count,
    'encryption_method', 'pgcrypto_pgp_sym_encrypt',
    'timestamp', now(),
    'severity', 'high'
  ));
  
  RETURN record_count;
END;
$$;