import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      console.log('AuthCallback: Component mounted');
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      console.log('AuthCallback: Current URL:', window.location.href);
      console.log('AuthCallback: Search params:', Object.fromEntries(urlParams.entries()));
      console.log('AuthCallback: Authorization code from URL:', !!code);

      if (code && !isProcessing) {
        setIsProcessing(true);
        console.log('AuthCallback: Found authorization code, exchanging for token');
        
        try {
          console.log('AuthCallback: Making POST request to /api/auth/callback');
          const response = await axios.post('http://localhost:5001/api/auth/callback', { code });
          
          console.log('AuthCallback: Server response status:', response.status);
          console.log('AuthCallback: Server response headers:', response.headers);
          console.log('AuthCallback: Server response data:', response.data);
          
          if (response.data.token) {
            console.log('AuthCallback: Received token from server, storing in localStorage');
            localStorage.setItem('token', response.data.token);
            console.log('AuthCallback: Token stored successfully');
            
            // Only clean up the URL after successful token storage
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('AuthCallback: Redirecting to ACC dashboard');
            navigate('/acc');
          } else {
            console.error('AuthCallback: No token in server response');
            navigate('/login');
          }
        } catch (error) {
          console.error('AuthCallback: Error exchanging code for token:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers
            }
          });
          navigate('/login');
        }
      } else if (!code) {
        console.error('AuthCallback: No authorization code found in URL');
        navigate('/login');
      }
    };

    processAuth();
  }, [navigate, isProcessing]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback; 