// pages/login.js
import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert,
} from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        paddingTop: '80px',
        paddingBottom: '40px',
      }}
    >
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="glass-card border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="text-white fw-bold mb-2">Welcome Back</h2>
                  <p className="text-white-50">Sign in to continue to QuizHub</p>
                </div>

                {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
                )}

                {/* Social Login Section */}
                <div className="mb-4">
                  <SocialLoginButtons />
                </div>

                {/* Divider */}
                <div className="d-flex align-items-center mb-4">
                  <hr className="flex-grow-1" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <span className="px-3 text-white-50 small">OR</span>
                  <hr className="flex-grow-1" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                </div>

                {/* Email/Password Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-transparent text-white"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                      placeholder="Enter your email"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-white">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="bg-transparent text-white"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                      placeholder="Enter your password"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-gradient w-100 py-3 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="text-white-50 mb-0">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-white fw-semibold">
                      Sign up
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
