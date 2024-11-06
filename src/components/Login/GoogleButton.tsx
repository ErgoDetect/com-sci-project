// src/components/Login/GoogleButton.tsx
import { Button } from 'antd';
import GoogleIcon from '../../icons/googleIcon.svg';
import useAuth from '../../hooks/useAuth'; // Use the centralized hook

const GoogleButton: React.FC = () => {
  const { loading, loginWithGoogle } = useAuth(); // Use the centralized hook

  return (
    <Button
      style={{ width: '100%', margin: '20px 0', padding: '18px 0' }}
      onClick={loginWithGoogle}
      loading={loading}
      aria-label="Continue with Google"
    >
      <img src={GoogleIcon} alt="Google Icon" style={{ marginRight: '8px' }} />
      Continue with Google
    </Button>
  );
};

export default GoogleButton;
