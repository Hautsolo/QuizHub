import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import NavBar from '../components/NavBar';
import { AuthProvider } from '../hooks/useAuth';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Import Bootstrap JS on client side
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <AuthProvider>
      <div className="min-vh-100">
        <NavBar />
        <main style={{ paddingTop: '80px' }}>
          <Component {...pageProps} />
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: '#333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.shape({}).isRequired, // Changed from PropTypes.object to PropTypes.shape({})
};

export default MyApp;
