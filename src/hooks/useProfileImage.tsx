import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import patrickProfileFallback from '@/assets/patrick-profile.jpg';

export const useProfileImage = () => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>(patrickProfileFallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        // Try to get the current user's profile image
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.avatar_url) {
            setProfileImageUrl(profile.avatar_url);
          }
        } else {
          // For public access, try to find Patrick's profile
          // This assumes Patrick's profile exists with a known user_id or email
          const { data: profiles } = await supabase
            .from('profiles')
            .select('avatar_url')
            .not('avatar_url', 'is', null)
            .limit(1);
          
          if (profiles && profiles.length > 0 && profiles[0].avatar_url) {
            setProfileImageUrl(profiles[0].avatar_url);
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
        // Keep fallback image
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileImage();

    // Listen for profile updates
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          loadProfileImage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    profileImageUrl,
    isLoading,
    refreshProfileImage: () => {
      setIsLoading(true);
      // Re-run the effect
      setProfileImageUrl(patrickProfileFallback);
    }
  };
};
