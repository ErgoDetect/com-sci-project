import { useEffect } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const useGoogleSignIn = (
  clientId: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void,
) => {
  useEffect(() => {
    // Check if the script tag already exists
    let script = document.getElementById(
      'google-api-script',
    ) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Identity Services after the script has loaded
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: onSuccess,
        });

        // Optionally, render the Google Sign-In button
        window.google?.accounts.id.renderButton(
          document.getElementById('buttonDiv'), // Ensure this element exists in your component
          { theme: 'outline', size: 'large' }, // Customization attributes
        );

        // Optionally, prompt the user to sign in automatically if they have already signed in
        window.google?.accounts.id.prompt();
      };

      script.onerror = (error) => {
        onFailure(error);
      };
    }

    return () => {
      // Clean up the script tag only if it was added by this hook
      if (script && !script.hasAttribute('data-existing')) {
        document.body.removeChild(script);
      }
    };
  }, [clientId, onSuccess, onFailure]); // The effect depends on clientId, onSuccess, and onFailure
};

export default useGoogleSignIn;
