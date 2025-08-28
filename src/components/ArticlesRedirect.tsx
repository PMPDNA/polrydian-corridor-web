import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ArticlesRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Track the redirect for analytics
    (window as any).gtag?.('event', 'page_redirect', {
      event_category: 'navigation',
      event_label: 'articles_to_insights',
      redirect_from: '/articles',
      redirect_to: '/insights'
    });
    
    // Redirect to insights page
    navigate('/insights', { replace: true });
  }, [navigate]);

  return null;
};