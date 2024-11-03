/* eslint-disable react/button-has-type */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance';

// Simple styling for the UI components
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '20px',
  } as React.CSSProperties,
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  },
  countdownContainer: {
    marginTop: '1rem',
  },
  countdownMessage: {
    fontSize: '1rem',
    color: 'gray',
  },
  resendButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

const EmailVerification = () => {
  const [resendCountdown, setResendCountdown] = useState(60); // Countdown for resending the email
  const [isResending, setIsResending] = useState(false);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const userEmail = queryParams.get('email');

  // Countdown logic for re-enabling the resend button
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
      }); // Call the resendEmail function passed as prop
    } catch (error) {
      console.error('Error resending email:', error);
    }
    setIsResending(false);
    setResendCountdown(60); // Reset countdown after resending email
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Verify Your Email</h1>
      <p style={styles.message}>
        We sent an email to <strong />. Please check your inbox and click on the
        verification link to verify your email address.
      </p>
      <p>
        If you haven`&apos`t received the email, you can resend it after the
        timer below expires.
      </p>

      <div style={styles.countdownContainer}>
        {resendCountdown > 0 ? (
          <p style={styles.countdownMessage}>
            You can resend the verification email in {resendCountdown} seconds.
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            style={styles.resendButton}
            disabled={isResending}
          >
            {isResending ? 'Resending...' : 'Resend Email'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
