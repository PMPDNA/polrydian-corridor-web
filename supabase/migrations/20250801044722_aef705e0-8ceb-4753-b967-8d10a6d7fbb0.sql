-- Reactivate LinkedIn credentials for the user
UPDATE social_media_credentials 
SET is_active = true, updated_at = now()
WHERE platform = 'linkedin' 
AND user_id = 'c6b248a3-1fc1-4427-b49c-6591d1b4ef52'
AND id = '33ecccdb-30b6-4265-82bd-e379107126b5';