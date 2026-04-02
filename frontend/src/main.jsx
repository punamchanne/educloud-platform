import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';

// Dev-only: if running in development and no token present,
// set a developer token from Vite env to make testing easier.
if (import.meta.env.MODE !== 'production') {
  const devToken = import.meta.env.VITE_DEV_TOKEN;
  try {
    if (devToken && !localStorage.getItem('token')) {
      localStorage.setItem('token', devToken);
      console.info('Dev token injected into localStorage');
    }
  } catch (e) {
    // ignore in environments without localStorage
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
