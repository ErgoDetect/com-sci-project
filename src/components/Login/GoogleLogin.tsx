import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

const GoogleLoginButton: React.FC = () => {
  const [tokens, setTokens] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const handleGoogleLogin = async () => {
    try {
      const tokenResponse = await window.electron.ipcRenderer.openAuthWindow();
      setTokens(tokenResponse);
      const operations = window.crypto.subtle;

      // if Web Crypto or SubtleCrypto is not supported, notify the user
      if (!operations) {
        alert('Web Crypto is not supported on this browser');
        console.warn('Web Crypto API not supported');
      }
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await response.json();
      console.log('User Profile:', profileData);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (tokens?.access_token) {
      fetchUserProfile(tokens.access_token)
        .then((profileData) => {
          console.log('Fetched Profile:', profileData);
          return profileData;
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
          throw error;
        });
    }
  }, [tokens]);

  return (
    <div>
      <Button onClick={handleGoogleLogin}>Continue with Google</Button>
      {tokens && (
        <div>
          <h3>OAuth Response:</h3>
          <pre>{JSON.stringify(tokens, null, 2)}</pre>
        </div>
      )}
      {profile && (
        <div>
          <h3>User Profile:</h3>
          <img src={profile.picture} alt="User Profile" />
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
