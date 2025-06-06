import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Button, Card, Badge, Modal, Form,
} from 'react-bootstrap';
import Link from 'next/link';
import {
  FaPlay, FaUsers, FaTrophy, FaBrain, FaRocket, FaStar, FaCrown, FaFire, FaUser,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { quizAPI } from '../utils/api';

export default function Home() {
  const { isAuthenticated, user, loginAsGuest } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, categoriesRes] = await Promise.all([
          quizAPI.getQuizzes({ limit: 6 }),
          fetch('http://localhost:8000/api/categories/'),
        ]);

        setQuizzes(quizzesRes.data.results || []);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.results || categoriesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleGuestLogin = async () => {
    if (!guestName.trim()) return;

    setLoading(true);
    const result = await loginAsGuest(guestName.trim());
    setLoading(false);

    if (result.success) {
      setShowGuestModal(false);
      setGuestName('');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      1: '#10b981', // green
      2: '#f59e0b', // yellow
      3: '#f97316', // orange
      4: '#ef4444', // red
      5: '#8b5cf6', // purple
    };
    return colors[difficulty] || '#6b7280';
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingTop: '80px' }}>
      <Container className="py-4">
        {/* Hero Section */}
        <Row className="text-center mb-5">
          <Col>
            <div className="mb-4">
              <FaBrain size={80} className="text-white mb-3 pulse" />
              <h1 className="display-4 fw-bold text-white mb-3">
                Learn. Compete. Win.
              </h1>
              <p className="lead text-white-50 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                Challenge yourself with thousands of quizzes, compete with friends, and climb the global leaderboard
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/register" passHref legacyBehavior>
                  <Button
                    size="lg"
                    className="px-4 py-3 fw-bold rounded-pill"
                    style={{
                      background: 'linear-gradient(45deg, #10b981, #059669)',
                      border: 'none',
                      minWidth: '160px',
                    }}
                  >
                    <FaRocket className="me-2" />
                    Get Started
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="outline-light"
                  className="px-4 py-3 fw-bold rounded-pill"
                  style={{ minWidth: '160px' }}
                  onClick={() => setShowGuestModal(true)}
                >
                  <FaPlay className="me-2" />
                  Play as Guest
                </Button>
              </div>
            ) : (
              <div className="glass-card p-4 d-inline-block rounded-4">
                <div className="d-flex align-items-center mb-3">
                  <FaUser className="text-white me-2" />
                  <span className="text-white fw-bold">{user?.username}</span>
                  {user?.isGuest && <Badge bg="secondary" className="ms-2">Guest</Badge>}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <Badge bg="warning" className="px-3 py-2">
                    <FaStar className="me-1" />
                    {user?.points || 0} Points
                  </Badge>
                  <Badge bg="info" className="px-3 py-2">
                    <FaFire className="me-1" />
                    {user?.streak_days || 0} Day Streak
                  </Badge>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {/* Categories */}
        {categories.length > 0 && (
          <Row className="mb-5">
            <Col>
              <h3 className="text-white text-center mb-4 fw-bold">Explore Categories</h3>
              <Row className="g-3">
                {categories.slice(0, 5).map((category) => (
                  <Col key={category.id} xs={6} md={4} lg={2}>
                    <Card
                      className="text-center border-0 h-100 category-card"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Card.Body className="p-3">
                        <div
                          className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                            fontSize: '24px',
                          }}
                        >
                          {category.name.charAt(0)}
                        </div>
                        <h6 className="text-white fw-bold mb-1">{category.name}</h6>
                        <small className="text-white-50">{category.topics_count} topics</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        {/* Featured Quizzes */}
        {quizzes.length > 0 && (
          <Row>
            <Col>
              <h3 className="text-white text-center mb-4 fw-bold">Popular Quizzes</h3>
              <Row className="g-4">
                {quizzes.map((quiz) => (
                  <Col key={quiz.id} md={6} lg={4}>
                    <Card
                      className="border-0 h-100 quiz-card"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Badge
                            className="px-3 py-2 rounded-pill fw-bold"
                            style={{
                              background: getDifficultyColor(3),
                              fontSize: '12px',
                            }}
                          >
                            {quiz.category_name}
                          </Badge>
                          <FaCrown className="text-warning" size={20} />
                        </div>

                        <h5 className="fw-bold mb-2" style={{ color: '#1f2937' }}>
                          {quiz.title}
                        </h5>
                        <p className="text-muted small mb-3" style={{ fontSize: '14px' }}>
                          {quiz.description || 'Test your knowledge!'}
                        </p>

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            <Badge bg="light" text="dark" className="px-2 py-1">
                              <FaUsers className="me-1" size={12} />
                              {Math.floor(Math.random() * 500) + 100}
                            </Badge>
                            <Badge bg="light" text="dark" className="px-2 py-1">
                              {quiz.questions_count || quiz.max_questions} Q&apos;s
                            </Badge>
                          </div>

                          <Button
                            size="sm"
                            className="rounded-pill px-3 fw-bold"
                            style={{
                              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                              border: 'none',
                            }}
                          >
                            <FaPlay className="me-1" size={12} />
                            Play
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="text-center mt-4">
                <Link href="/quizzes" passHref legacyBehavior>
                  <Button
                    variant="outline-light"
                    className="px-4 py-2 rounded-pill fw-bold"
                  >
                    View All Quizzes
                  </Button>
                </Link>
              </div>
            </Col>
          </Row>
        )}

        {/* Quick Actions for Authenticated Users */}
        {isAuthenticated && (
          <Row className="mt-5">
            <Col>
              <div className="text-center">
                <h4 className="text-white mb-4 fw-bold">Ready to Play?</h4>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/matches" passHref legacyBehavior>
                    <Button
                      className="px-4 py-3 rounded-pill fw-bold"
                      style={{
                        background: 'linear-gradient(45deg, #f59e0b, #f97316)',
                        border: 'none',
                      }}
                    >
                      <FaUsers className="me-2" />
                      Join Match
                    </Button>
                  </Link>
                  <Link href="/leaderboard" passHref legacyBehavior>
                    <Button
                      className="px-4 py-3 rounded-pill fw-bold"
                      style={{
                        background: 'linear-gradient(45deg, #ec4899, #be185d)',
                        border: 'none',
                      }}
                    >
                      <FaTrophy className="me-2" />
                      Leaderboard
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Guest Login Modal */}
      <Modal show={showGuestModal} onHide={() => setShowGuestModal(false)} centered>
        <Modal.Body className="p-4" style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px' }}>
          <div className="text-center mb-4">
            <FaPlay size={50} className="text-primary mb-3" />
            <h4 className="fw-bold">Play as Guest</h4>
            <p className="text-muted">Choose a username to get started!</p>
          </div>

          <Form onSubmit={(e) => { e.preventDefault(); handleGuestLogin(); }}>
            <Form.Group className="mb-4">
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="text-center py-3 rounded-pill"
                style={{ fontSize: '18px', border: '2px solid #e5e7eb' }}
                maxLength={20}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                type="submit"
                disabled={!guestName.trim() || loading}
                className="py-3 rounded-pill fw-bold"
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  border: 'none',
                }}
              >
                {loading ? 'Creating Account...' : 'Start Playing'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowGuestModal(false)}
                className="py-2 rounded-pill"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
