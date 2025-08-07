import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Schedule() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to contact section on home page
    navigate('/#contact', { replace: true });
  }, [navigate]);

  return null;
}