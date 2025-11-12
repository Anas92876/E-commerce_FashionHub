import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Filter out browser extension errors in development
if (process.env.NODE_ENV === 'development') {
  // Filter console errors from extensions
  const originalError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    // Filter out CSSPeeper and other common extension errors
    if (
      errorMessage.includes('csspeeper') ||
      errorMessage.includes('inspector-tools') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://')
    ) {
      return; // Suppress extension errors
    }
    originalError.apply(console, args);
  };

  // Filter uncaught errors from extensions
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorString = String(message || '');
    if (
      errorString.includes('csspeeper') ||
      errorString.includes('inspector-tools') ||
      source?.includes('chrome-extension://') ||
      source?.includes('moz-extension://')
    ) {
      return true; // Suppress extension errors
    }
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
