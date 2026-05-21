import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';

// For development, you can disable Google OAuth verification
// This will allow you to test the Google Sign-In without configuring the Google Cloud Console
const googleClientId = "806966749944-7a90n7s3kbbr5fi63u5e7ln5l207br5q.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={googleClientId}
      onScriptLoadError={() => console.error('Google Sign-In script load error')}
      onScriptLoadSuccess={() => console.log('Google Sign-In script loaded successfully')}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
