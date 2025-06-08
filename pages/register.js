// pages/register.js - Complete Registration Page
import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, InputGroup,
} from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import SocialLoginButtons from '../components/SocialLoginButtons';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete newErrors.password;
        }

        // Revalidate confirm password if it exists
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const isValid = Object.keys(formData).every((field) => validateField(field, formData[field]));

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/(?=.*[a-z])/.test(password)) strength += 1;
    if (/(?=.*[A-Z])/.test(password)) strength += 1;
    if (/(?=.*\d)/.test(password)) strength += 1;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength += 1;

    const levels = [
      { label: 'Very Weak', color: '#dc3545' },
      { label: 'Weak', color: '#fd7e14' },
      { label: 'Fair', color: '#ffc107' },
      { label: 'Good', color: '#20c997' },
      { label: 'Strong', color: '#198754' },
    ];

    return { strength, ...levels[strength - 1] || levels[0] };
  };

  const passwordStrength = getPasswordStrength();

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
                  <h2 className="text-white fw-bold mb-2">Join QuizHub</h2>
                  <p className="text-white-50">Create your account and start your quiz journey!</p>
                </div>

                {errors.submit && (
                  <Alert variant="danger" className="mb-4">
                    {errors.submit}
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

                {/* Registration Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text
                        className="bg-transparent border-end-0"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <FaUser />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        isInvalid={!!errors.username}
                        isValid={formData.username && !errors.username}
                        className="bg-transparent text-white border-start-0"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                        }}
                        placeholder="Choose a username"
                      />
                      {formData.username && !errors.username && (
                        <InputGroup.Text
                          className="bg-transparent border-start-0"
                          style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: '#198754' }}
                        >
                          <FaCheckCircle />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    {errors.username && (
                      <div className="text-danger small mt-1">{errors.username}</div>
                    )}
                  </Form.Group>

                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text
                        className="bg-transparent border-end-0"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        isValid={formData.email && !errors.email}
                        className="bg-transparent text-white border-start-0"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                        }}
                        placeholder="Enter your email"
                      />
                      {formData.email && !errors.email && (
                        <InputGroup.Text
                          className="bg-transparent border-start-0"
                          style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: '#198754' }}
                        >
                          <FaCheckCircle />
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                    {errors.email && (
                      <div className="text-danger small mt-1">{errors.email}</div>
                    )}
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text
                        className="bg-transparent border-end-0"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        isValid={formData.password && !errors.password}
                        className="bg-transparent text-white border-0"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                        }}
                        placeholder="Create a strong password"
                      />
                      <InputGroup.Text
                        className="bg-transparent border-start-0 cursor-pointer"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <small className="text-white-50">Password strength:</small>
                          <small style={{ color: passwordStrength.color || '#6c757d' }}>
                            {passwordStrength.label || 'Very Weak'}
                          </small>
                        </div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${(passwordStrength.strength / 5) * 100}%`,
                              backgroundColor: passwordStrength.color || '#6c757d',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <div className="text-danger small mt-1">{errors.password}</div>
                    )}
                  </Form.Group>

                  {/* Confirm Password Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white">Confirm Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text
                        className="bg-transparent border-end-0"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        isValid={formData.confirmPassword && !errors.confirmPassword}
                        className="bg-transparent text-white border-0"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                        }}
                        placeholder="Confirm your password"
                      />
                      <InputGroup.Text
                        className="bg-transparent border-start-0 cursor-pointer"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroup.Text>
                    </InputGroup>
                    {errors.confirmPassword && (
                      <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                    )}
                  </Form.Group>

                  {/* Terms and Conditions */}
                  <div className="text-center mb-4">
                    <small className="text-white-50">
                      By signing up, you agree to our{' '}
                      <Link href="/terms" className="text-white">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-white">
                        Privacy Policy
                      </Link>
                    </small>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="btn-gradient w-100 py-3 fw-semibold"
                    disabled={loading || Object.keys(errors).length > 0}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-white-50 mb-0">
                    Already have an account?{' '}
                    <Link href="/login" className="text-white fw-semibold">
                      Sign in
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
