// pages/quizzes.js - Fixed ESLint errors
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal, Alert,
} from 'react-bootstrap';
import { useRouter } from 'next/router';
import {
  FaSearch, FaPlay, FaUsers, FaImage, FaVideo, FaVolumeUp,
  FaTrophy, FaClock, FaQuestion, FaEye, FaStar, FaFire,
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { quizAPI } from '../utils/api';
import Loading from '../components/Loading';

// Move QuizCard outside component to avoid re-creation on renders
function QuizCard({ quiz, onShowDetails, onStartQuiz }) {
  const getMediaIcons = () => {
    // Mock multimedia detection - in real app this would come from backend
    const icons = [];
    const randomType = Math.random();

    if (randomType < 0.3) icons.push(<FaImage key="image" className="text-info me-1" />);
    else if (randomType < 0.6) icons.push(<FaVolumeUp key="audio" className="text-warning me-1" />);
    else if (randomType < 0.8) icons.push(<FaVideo key="video" className="text-danger me-1" />);

    return icons;
  };

  return (
    <Card
      className="quiz-card h-100 border-0 shadow-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Badge
            className="px-3 py-2 rounded-pill"
            style={{ backgroundColor: '#6366f1' }}
          >
            {quiz.category_name}
          </Badge>
          <div className="d-flex align-items-center">
            {getMediaIcons()}
            <FaEye className="text-muted" size={14} />
            <small className="text-muted ms-1">{Math.floor(Math.random() * 1000) + 100}</small>
          </div>
        </div>

        {/* Title and Description */}
        <h5 className="fw-bold mb-2" style={{ color: '#1f2937' }}>
          {quiz.title}
        </h5>
        <p className="text-muted small mb-3" style={{ fontSize: '14px', lineHeight: '1.4' }}>
          {quiz.description || 'Test your knowledge with this engaging quiz!'}
        </p>

        {/* Stats */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-3">
            <div className="d-flex align-items-center">
              <FaQuestion className="text-primary me-1" size={12} />
              <small className="text-muted">{quiz.questions_count || quiz.max_questions} Q&apos;s</small>
            </div>
            {quiz.time_limit && (
              <div className="d-flex align-items-center">
                <FaClock className="text-warning me-1" size={12} />
                <small className="text-muted">{Math.floor(quiz.time_limit / 60)}m</small>
              </div>
            )}
            <div className="d-flex align-items-center">
              <FaTrophy className="text-success me-1" size={12} />
              <small className="text-muted">+{(quiz.questions_count || quiz.max_questions) * 10} pts</small>
            </div>
          </div>

          <Badge bg="light" text="dark" className="px-2 py-1">
            <FaUsers className="me-1" size={10} />
            {Math.floor(Math.random() * 500) + 50}
          </Badge>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            className="flex-fill"
            onClick={() => onShowDetails(quiz)}
          >
            <FaEye className="me-1" size={12} />
            Details
          </Button>
          <Button
            className="flex-fill"
            size="sm"
            style={{
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              border: 'none',
            }}
            onClick={() => onStartQuiz(quiz.id)}
          >
            <FaPlay className="me-1" size={12} />
            Play Solo
          </Button>
        </div>

        {/* Creator */}
        <div className="text-center mt-3 pt-3 border-top">
          <small className="text-muted">
            by <span className="fw-semibold">{quiz.creator_name}</span>
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}

QuizCard.propTypes = {
  quiz: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category_name: PropTypes.string.isRequired,
    questions_count: PropTypes.number,
    max_questions: PropTypes.number,
    time_limit: PropTypes.number,
    creator_name: PropTypes.string.isRequired,
  }).isRequired,
  onShowDetails: PropTypes.func.isRequired,
  onStartQuiz: PropTypes.func.isRequired,
};

export default function QuizzesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // State management
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const sortQuizzes = useCallback((quizList, sortOption) => {
    const sorted = [...quizList];
    switch (sortOption) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'difficulty':
        return sorted.sort((a, b) => (a.difficulty || 1) - (b.difficulty || 1));
      case 'questions_count':
        return sorted.sort((a, b) => (b.questions_count || 0) - (a.questions_count || 0));
      case 'created_at':
      default:
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const [quizzesRes, categoriesRes] = await Promise.all([
        quizAPI.getQuizzes(params),
        quizAPI.getCategories(),
      ]);

      let quizzesData = quizzesRes.data.results || quizzesRes.data || [];

      // Sort quizzes
      quizzesData = sortQuizzes(quizzesData, sortBy);

      setQuizzes(quizzesData);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
    } catch (error) {
      toast.error('Failed to load quizzes');
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchTerm, sortQuizzes]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    loadData();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const showQuizDetails = async (quiz) => {
    try {
      const response = await quizAPI.getQuiz(quiz.id);
      setSelectedQuiz(response.data);
      setShowQuizModal(true);
    } catch (error) {
      toast.error('Failed to load quiz details');
    }
  };

  const startSoloQuiz = (quizId) => {
    if (!isAuthenticated) {
      toast.error('Please login to play quizzes');
      return;
    }
    router.push(`/solo-quiz/${quizId}`);
  };

  if (loading) {
    return <Loading message="Loading quizzes..." />;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">
            <FaTrophy className="me-3" />
            Quiz Library
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '600px' }}>
            Challenge yourself with thousands of quizzes across various topics. Play solo, compete with friends, and climb the leaderboard!
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card border-0 mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSearch}
                  >
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>
              <Col md={6}>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <option value="created_at">Latest</option>
                    <option value="title">Title</option>
                    <option value="questions_count">Most Questions</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Quick Stats */}
        {isAuthenticated && (
          <Row className="mb-4">
            <Col md={4}>
              <Card className="glass-card border-0 text-white text-center">
                <Card.Body className="p-3">
                  <FaStar size={30} className="mb-2 text-warning" />
                  <h5 className="mb-0">{user?.points || 0}</h5>
                  <small>Total Points</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="glass-card border-0 text-white text-center">
                <Card.Body className="p-3">
                  <FaFire size={30} className="mb-2 text-danger" />
                  <h5 className="mb-0">{user?.streak_days || 0}</h5>
                  <small>Day Streak</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="glass-card border-0 text-white text-center">
                <Card.Body className="p-3">
                  <FaTrophy size={30} className="mb-2 text-success" />
                  <h5 className="mb-0">-</h5>
                  <small>Rank</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <Row className="g-4">
            {quizzes.map((quiz) => (
              <Col key={quiz.id} lg={4} md={6}>
                <QuizCard
                  quiz={quiz}
                  onShowDetails={showQuizDetails}
                  onStartQuiz={startSoloQuiz}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="info" className="text-center py-5">
            <h4>No quizzes found</h4>
            <p>Try adjusting your search criteria or check back later for new quizzes!</p>
          </Alert>
        )}

        {/* Quiz Details Modal */}
        <Modal
          show={showQuizModal}
          onHide={() => setShowQuizModal(false)}
          centered
          size="lg"
        >
          {selectedQuiz && (
            <Modal.Body className="p-0">
              <div
                className="p-5 text-white position-relative"
                style={{ background: 'linear-gradient(45deg, #6366f1, #8b5cf6)' }}
              >
                <Button
                  variant="link"
                  className="position-absolute top-0 end-0 m-3 text-white"
                  onClick={() => setShowQuizModal(false)}
                  style={{ fontSize: '1.5rem', textDecoration: 'none' }}
                >
                  ×
                </Button>

                <div className="text-center">
                  <FaTrophy size={50} className="mb-3" />
                  <h3 className="mb-3">{selectedQuiz.title}</h3>
                  <p className="mb-4">{selectedQuiz.description}</p>

                  <Row className="mb-4">
                    <Col md={4}>
                      <div className="stat-item">
                        <FaQuestion size={25} className="mb-2" />
                        <div className="fw-bold">{selectedQuiz.questions_count || selectedQuiz.max_questions}</div>
                        <small>Questions</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <FaClock size={25} className="mb-2" />
                        <div className="fw-bold">
                          {selectedQuiz.time_limit ? `${Math.floor(selectedQuiz.time_limit / 60)}m` : 'No Limit'}
                        </div>
                        <small>Time Limit</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <FaTrophy size={25} className="mb-2" />
                        <div className="fw-bold">
                          Up to {(selectedQuiz.questions_count || selectedQuiz.max_questions) * 10}+
                        </div>
                        <small>Points</small>
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex gap-3 justify-content-center">
                    <Button
                      variant="light"
                      onClick={() => setShowQuizModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      style={{
                        background: 'linear-gradient(45deg, #10b981, #059669)',
                        border: 'none',
                      }}
                      onClick={() => {
                        setShowQuizModal(false);
                        startSoloQuiz(selectedQuiz.id);
                      }}
                    >
                      <FaPlay className="me-2" />
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </div>
            </Modal.Body>
          )}
        </Modal>
      </Container>
    </div>
  );
}
