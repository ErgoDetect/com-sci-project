import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useNavigationEffect = (userInitiatedCheck: { current: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attach event listener to all navigation links
    const handleNavigationStart = () => {
      userInitiatedCheck.current = true;
    };

    // Example: you can bind this to a global event or React Router's navigation start
    window.addEventListener('beforeunload', handleNavigationStart);

    return () => {
      window.removeEventListener('beforeunload', handleNavigationStart);
    };
  }, [navigate, location, userInitiatedCheck]);

  // You could also integrate with React Router's useNavigationType or history listener
};
export default useNavigationEffect;
