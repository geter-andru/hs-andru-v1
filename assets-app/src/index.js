import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Basic environment check
if (process.env.NODE_ENV === 'development') {
  if (!process.env.REACT_APP_AIRTABLE_BASE_ID) {
    console.warn('⚠️ REACT_APP_AIRTABLE_BASE_ID is not set');
  }
  if (!process.env.REACT_APP_AIRTABLE_API_KEY) {
    console.warn('⚠️ REACT_APP_AIRTABLE_API_KEY is not set');
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);