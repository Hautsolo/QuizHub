import { Button } from 'react-bootstrap';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider) => {
    // Redirect to Django social login endpoint
    window.location.href = `http://localhost:8000/accounts/${provider}/login/`;
  };

  return (
    <div className="d-grid gap-3">
      <Button
        variant="outline-light"
        onClick={() => handleSocialLogin('google')}
        className="btn-glass d-flex align-items-center justify-content-center py-3"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <FaGoogle className="me-3" size={20} style={{ color: '#DB4437' }} />
        <span className="fw-semibold">Continue with Google</span>
      </Button>

      <Button
        variant="outline-light"
        onClick={() => handleSocialLogin('facebook')}
        className="btn-glass d-flex align-items-center justify-content-center py-3"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <FaFacebook className="me-3" size={20} style={{ color: '#4267B2' }} />
        <span className="fw-semibold">Continue with Facebook</span>
      </Button>
    </div>
  );
}
