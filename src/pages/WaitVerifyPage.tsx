import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Spin, Card } from 'antd';
import MailIcon from '../icons/mail.png';
import axiosInstance from '../utility/axiosInstance';

const EmailVerification = () => {
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const userEmail = queryParams.get('email') || '';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResendClick = async () => {
    setIsResending(true);
    try {
      await axiosInstance.post('/auth/resend-verification', {
        email: userEmail,
      });
    } catch (errors) {
      setError('Failed to resend email. Please try again later.');
    } finally {
      setIsResending(false);
      setResendCountdown(30);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Card
        style={{
          background: '#fff',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          width: '45%',
          borderRadius: '12px',
          // margin: '15px',
        }}
      >
        <div
          style={{
            padding: '10px 20px',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <img src={MailIcon} alt="mail icon" style={{ width: '15%' }} />
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: '#333' }}>
          <h2>Check Email</h2>
          <p>
            Please check your email inbox and click on the provided link to
            verify your email.
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              <p style={{ color: '#555', fontSize: '16px' }}>
                If you don’t receive the email,
                {resendCountdown > 0 ? (
                  <span style={{ color: '#888', marginLeft: 14 }}>
                    Will resend in <strong>{resendCountdown}</strong> seconds
                  </span>
                ) : (
                  <Button
                    type="text"
                    onClick={handleResendClick}
                    style={{ color: '#007BFF', textDecoration: 'underline' }}
                  >
                    {isResending ? <Spin size="small" /> : 'Resend Email'}
                  </Button>
                )}
              </p>
            </div>
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button type="link" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;
