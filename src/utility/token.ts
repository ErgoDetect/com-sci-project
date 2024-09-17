import { jwtDecode } from 'jwt-decode'; // Correct the default import
import Cookies from 'js-cookie';
import { useResData } from '../context';

// Define the shape of the JWT payload
interface JwtPayload {
  exp: number;
  [key: string]: any; // Extend this interface as needed for your payload
}

// Utility function to get the token from cookies
export const getToken = (): string | undefined => Cookies.get('access_token');

// Utility function to set the token in cookies
export const setToken = (token: string) =>
  Cookies.set('access_token', token, { expires: 7, path: '/' });

// Utility function to remove the token from cookies
export const removeToken = (): void =>
  Cookies.remove('access_token', { path: '/' });

// Function to check if the token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token', error);
    return true; // Treat token as expired if decoding fails
  }
};

// Function to handle token check and redirection
export const checkAndHandleToken = async (): Promise<boolean> => {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    console.log('Token expired or not found');
    removeToken(); // Remove expired or nonexistent token
    return false; // Token is invalid or expired
  }
  console.log('Token is valid');
  return true; // Token is valid
};

// Function to refresh the token
export const RefreshToken = async (): Promise<void> => {
  const { url } = useResData();
  try {
    const response = await fetch(
      `http://${url}/auth/refresh-token/`, // Make sure this matches your server URL
      {
        method: 'POST',
        credentials: 'include', // Send cookies with this request
        headers: {
          'Content-Type': 'application/json', // Ensure proper headers are sent
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json(); // Parse the JSON response
    const newAccessToken = data.access_token; // Extract access_token from the response

    if (newAccessToken) {
      setToken(newAccessToken); // Set new access token in cookies
    } else {
      throw new Error('No access token returned');
    }
  } catch (error) {
    console.error('Error refreshing token', error);
    removeToken(); // Remove token on failure
    // Optionally: Redirect to login or handle token refresh failure
  }
};
