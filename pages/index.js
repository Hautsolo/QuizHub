// pages/index.js - Fixed ESLint errors
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Button, Card, Badge, Modal, Form,
} from 'react-bootstrap';
import Link from 'next/link';
import {
  FaPlay, FaUsers, FaTrophy, FaBrain, FaRocket, FaStar, FaCrown, FaFire, FaUser,
  FaImage, FaVideo, FaVolumeUp, FaClock, FaQuestion,
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
  const [featuredQuiz, setFeaturedQuiz] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, categoriesRes] = await Promise.all([
          quizAPI.getQuizzes({ limit: 6 }),
          fetch('http://localhost:8000/api/categories/'),
        ]);

        const quizzesData = quizzesRes.data.results || [];
        setQuizzes(quizzesData);

        // Set featured quiz (first one with highest engagement)
        if (quizzesData.length > 0) {
          setFeaturedQuiz(quizzesData[0]);
        }

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

  const getMediaIcon = () => {
    // Mock multimedia detection - in real app this would come from backend
    const randomType = Math.random();
    if (randomType < 0.3) return <FaImage className="text-info me-1" size={14} />;
    if (randomType < 0.6) return <FaVolumeUp className="text-warning me-1" size={14} />;
    if (randomType < 0.8) return <FaVideo className="text-danger me-1" size={14} />;
    return null;
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
                Learn. Compete. Master.
              </h1>
              <p className="lead text-white-50 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                Challenge yourself with multimedia quizzes, compete in real-time matches, and climb the global leaderboard.
                Now with enhanced solo play and rich media content!
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

        {/* Featured Quiz Spotlight */}
        {featuredQuiz && (
          <Row className="mb-5">
            <Col>
              <Card
                className="glass-card border-0 text-white overflow-hidden"
                style={{ borderRadius: '20px' }}
              >
                <Card.Body className="p-5">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center mb-3">
                        <FaCrown className="text-warning me-2" size={30} />
                        <h3 className="mb-0">Featured Quiz</h3>
                      </div>
                      <h4 className="mb-3">{featuredQuiz.title}</h4>
                      <p className="mb-4 text-white-50">
                        {featuredQuiz.description || 'Experience our most popular quiz with multimedia content and engaging questions!'}
                      </p>
                      <div className="d-flex gap-3 mb-4">
                        <Badge bg="info" className="px-3 py-2">
                          <FaQuestion className="me-1" />
                          {featuredQuiz.questions_count || featuredQuiz.max_questions} Questions
                        </Badge>
                        <Badge bg="success" className="px-3 py-2">
                          <FaTrophy className="me-1" />
                          Up to {(featuredQuiz.questions_count || featuredQuiz.max_questions) * 10}+ Points
                        </Badge>
                        {getMediaIcon()}
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="mb-3">
                        <FaTrophy size={60} className="text-warning mb-3" />
                        <div className="h5">Challenge Yourself</div>
                      </div>
                      <Link href={`/solo-quiz/${featuredQuiz.id}`} passHref legacyBehavior>
                        <Button
                          size="lg"
                          className="px-4 py-3 fw-bold"
                          style={{
                            background: 'linear-gradient(45deg, #f59e0b, #f97316)',
                            border: 'none',
                            borderRadius: '15px',
                          }}
                        >
                          <FaPlay className="me-2" />
                          Play Now
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Game Mode Cards */}
        <Row className="mb-5">
          <Col>
            <h3 className="text-white text-center mb-4 fw-bold">Choose Your Adventure</h3>
            <Row className="g-4">
              {/* Solo Play */}
              <Col md={6}>
                <Card
                  className="mode-card h-100 border-0 shadow-lg text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Card.Body className="p-5 text-center">
                    <FaTrophy size={50} className="mb-3" />
                    <h4 className="mb-3">Solo Challenge</h4>
                    <p className="mb-4">
                      Test your knowledge at your own pace. Earn points, track your progress, and climb the leaderboard!
                    </p>
                    <div className="d-flex justify-content-center gap-3 mb-4">
                      <Badge bg="light" text="dark" className="px-3 py-2">
                        <FaClock className="me-1" />
                        Self-Paced
                      </Badge>
                      <Badge bg="light" text="dark" className="px-3 py-2">
                        <FaStar className="me-1" />
                        Earn Points
                      </Badge>
                    </div>
                    <Link href="/quizzes" passHref legacyBehavior>
                      <Button variant="light" size="lg" className="fw-bold px-4">
                        Start Solo Quiz
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              {/* Multiplayer */}
              <Col md={6}>
                <Card
                  className="mode-card h-100 border-0 shadow-lg text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Card.Body className="p-5 text-center">
                    <FaUsers size={50} className="mb-3" />
                    <h4 className="mb-3">Live Matches</h4>
                    <p className="mb-4">
                      Compete with friends and players worldwide in real-time quiz battles. May the smartest win!
                    </p>
                    <div className="d-flex justify-content-center gap-3 mb-4">
                      <Badge bg="light" text="dark" className="px-3 py-2">
                        <FaUsers className="me-1" />
                        Real-time
                      </Badge>
                      <Badge bg="light" text="dark" className="px-3 py-2">
                        <FaFire className="me-1" />
                        Competitive
                      </Badge>
                    </div>
                    <Link href="/matches" passHref legacyBehavior>
                      <Button variant="light" size="lg" className="fw-bold px-4">
                        Join Match
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Categories with Enhanced Design */}
        {categories.length > 0 && (
          <Row className="mb-5">
            <Col>
              <h3 className="text-white text-center mb-4 fw-bold">Explore Categories</h3>
              <Row className="g-3">
                {categories.slice(0, 6).map((category) => (
                  <Col key={category.id} xs={6} md={4} lg={2}>
                    <Card
                      className="category-card text-center border-0 h-100"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: '16px',
                      }}
                    >
                      <Card.Body className="p-3">
                        <div
                          className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center text-white fw-bold"
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
                        <div className="mt-2">
                          {getMediaIcon()}
                          <small className="text-white-50">Rich media</small>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        {/* Popular Quizzes */}
        {quizzes.length > 0 && (
          <Row>
            <Col>
              <h3 className="text-white text-center mb-4 fw-bold">Popular Quizzes</h3>
              <Row className="g-4">
                {quizzes.map((quiz) => (
                  <Col key={quiz.id} md={6} lg={4}>
                    <Card
                      className="quiz-card border-0 h-100"
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
                            style={{ backgroundColor: getDifficultyColor(3) }}
                          >
                            {quiz.category_name}
                          </Badge>
                          <div className="d-flex align-items-center">
                            {getMediaIcon()}
                            <FaCrown className="text-warning" size={16} />
                          </div>
                        </div>

                        <h5 className="fw-bold mb-2" style={{ color: '#1f2937' }}>
                          {quiz.title}
                        </h5>
                        <p className="text-muted small mb-3" style={{ fontSize: '14px' }}>
                          {quiz.description || 'Test your knowledge with multimedia questions!'}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex gap-2">
                            <Badge bg="light" text="dark" className="px-2 py-1">
                              <FaQuestion className="me-1" size={10} />
                              {quiz.questions_count || quiz.max_questions} Q&apos;s
                            </Badge>
                            <Badge bg="light" text="dark" className="px-2 py-1">
                              <FaTrophy className="me-1" size={10} />
                              +{(quiz.questions_count || quiz.max_questions) * 10} pts
                            </Badge>
                          </div>
                        </div>

                        <Link href={`/solo-quiz/${quiz.id}`} passHref legacyBehavior>
                          <Button
                            className="w-100 fw-bold"
                            style={{
                              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                              border: 'none',
                              borderRadius: '12px',
                            }}
                          >
                            <FaPlay className="me-2" size={12} />
                            Play Now
                          </Button>
                        </Link>
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
                <h4 className="text-white mb-4 fw-bold">Ready for More?</h4>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link href="/quizzes" passHref legacyBehavior>
                    <Button
                      className="px-4 py-3 rounded-pill fw-bold"
                      style={{
                        background: 'linear-gradient(45deg, #10b981, #059669)',
                        border: 'none',
                      }}
                    >
                      <FaTrophy className="me-2" />
                      Solo Challenge
                    </Button>
                  </Link>
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
                      <FaCrown className="me-2" />
                      Leaderboard
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* Stats Section for Authenticated Users */}
        {isAuthenticated && user && (
          <Row className="mt-5">
            <Col>
              <Card className="glass-card border-0">
                <Card.Body className="p-4">
                  <h5 className="text-white text-center mb-4">Your Progress</h5>
                  <Row className="text-center">
                    <Col md={3}>
                      <div className="stat-item">
                        <FaStar size={30} className="text-warning mb-2" />
                        <div className="h4 text-white">{user.points || 0}</div>
                        <small className="text-white-50">Total Points</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <FaFire size={30} className="text-danger mb-2" />
                        <div className="h4 text-white">{user.streak_days || 0}</div>
                        <small className="text-white-50">Day Streak</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <FaTrophy size={30} className="text-success mb-2" />
                        <div className="h4 text-white">-</div>
                        <small className="text-white-50">Global Rank</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stat-item">
                        <FaQuestion size={30} className="text-info mb-2" />
                        <div className="h4 text-white">-</div>
                        <small className="text-white-50">Quizzes Played</small>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
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
