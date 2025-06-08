// pages/dashboard.js - Complete Dashboard Page (ESLint Fixed)
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Row, Col, Card, Button, Badge, ProgressBar, Alert,
} from 'react-bootstrap';
import Link from 'next/link';
import {
  FaPlay, FaTrophy, FaFire, FaStar, FaUsers, FaClock,
  FaQuestion, FaChartLine, FaCalendar,
  FaGamepad, FaMedal, FaCrown, FaCheck,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { quizAPI } from '../utils/api';
import Loading from '../components/Loading';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    streakDays: 0,
    quizzesPlayed: 0,
    averageScore: 0,
    globalRank: null,
    weeklyRank: null,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // Mock API functions - replace with real implementations
  const getUserStats = async () => ({
    totalPoints: user?.points || 0,
    streakDays: user?.streak_days || 0,
    quizzesPlayed: Math.floor(Math.random() * 25) + 5,
    averageScore: Math.floor(Math.random() * 30) + 70,
  });

  const getRecentQuizzes = async () => [
    {
      id: 1,
      title: 'World Geography',
      score: 85,
      percentage: 85,
      category: 'Geography',
      completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      questions_answered: 10,
      total_questions: 10,
    },
    {
      id: 2,
      title: 'JavaScript Basics',
      score: 92,
      percentage: 92,
      category: 'Programming',
      completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      questions_answered: 12,
      total_questions: 12,
    },
    {
      id: 3,
      title: 'Movie Trivia',
      score: 78,
      percentage: 78,
      category: 'Entertainment',
      completed_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      questions_answered: 8,
      total_questions: 10,
    },
  ];

  const getLeaderboardPosition = async () => ({
    globalRank: Math.floor(Math.random() * 1000) + 100,
    weeklyRank: Math.floor(Math.random() * 100) + 10,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Simulate API calls - replace with real endpoints when available
      const [
        userStatsRes,
        recentQuizzesRes,
        availableQuizzesRes,
        leaderboardRes,
      ] = await Promise.allSettled([
        getUserStats(),
        getRecentQuizzes(),
        quizAPI.getQuizzes({ limit: 6 }),
        getLeaderboardPosition(),
      ]);

      // Process successful responses
      if (recentQuizzesRes.status === 'fulfilled') {
        setRecentQuizzes(recentQuizzesRes.value);
      }

      if (availableQuizzesRes.status === 'fulfilled') {
        setAvailableQuizzes(availableQuizzesRes.value.data.results || []);
      }

      if (userStatsRes.status === 'fulfilled') {
        setStats(userStatsRes.value);
      }

      if (leaderboardRes.status === 'fulfilled') {
        setStats((prev) => ({ ...prev, ...leaderboardRes.value }));
      }

      // Generate sample achievements
      setAchievements([
        {
          id: 1, name: 'First Steps', description: 'Completed your first quiz', earned: true, icon: '🎯',
        },
        {
          id: 2, name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', earned: user?.points > 50, icon: '⚡',
        },
        {
          id: 3, name: 'Perfect Score', description: 'Get 100% on any quiz', earned: user?.points > 100, icon: '💯',
        },
        {
          id: 4, name: 'Social Butterfly', description: 'Add 5 friends', earned: false, icon: '🦋',
        },
        {
          id: 5, name: 'Quiz Master', description: 'Create 3 public quizzes', earned: false, icon: '👑',
        },
      ]);

      // Generate daily challenge
      setDailyChallenge({
        title: 'Science Saturday',
        description: 'Complete 3 science quizzes today',
        progress: Math.floor(Math.random() * 3),
        target: 3,
        reward: '50 bonus points',
        timeLeft: '12h 34m',
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.points]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, router, loadDashboardData]);

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {/* Welcome Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="display-5 fw-bold text-white mb-2">
                  Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-white-50 mb-0">
                  Ready to test your knowledge and climb the leaderboard?
                </p>
              </div>
              {user?.isGuest && (
                <Alert variant="info" className="mb-0">
                  <strong>Guest Mode:</strong> Sign up to save your progress!
                </Alert>
              )}
            </div>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center h-100">
              <Card.Body className="p-4">
                <FaStar size={40} className="mb-3 text-warning" />
                <h3 className="fw-bold mb-1">{stats.totalPoints.toLocaleString()}</h3>
                <p className="mb-0">Total Points</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center h-100">
              <Card.Body className="p-4">
                <FaFire size={40} className="mb-3 text-danger" />
                <h3 className="fw-bold mb-1">{stats.streakDays}</h3>
                <p className="mb-0">Day Streak</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center h-100">
              <Card.Body className="p-4">
                <FaTrophy size={40} className="mb-3 text-success" />
                <h3 className="fw-bold mb-1">#{stats.globalRank || '---'}</h3>
                <p className="mb-0">Global Rank</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center h-100">
              <Card.Body className="p-4">
                <FaChartLine size={40} className="mb-3 text-info" />
                <h3 className="fw-bold mb-1">{stats.averageScore}%</h3>
                <p className="mb-0">Avg Score</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 shadow-lg" style={{ background: 'linear-gradient(45deg, #f59e0b, #f97316)' }}>
                <Card.Body className="p-4 text-white">
                  <Row className="align-items-center">
                    <Col md={8}>
                      <div className="d-flex align-items-center mb-3">
                        <FaCalendar size={30} className="me-3" />
                        <div>
                          <h4 className="mb-1 fw-bold">{dailyChallenge.title}</h4>
                          <p className="mb-0">{dailyChallenge.description}</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="flex-grow-1">
                          <ProgressBar
                            now={(dailyChallenge.progress / dailyChallenge.target) * 100}
                            className="mb-2"
                            style={{ height: '8px' }}
                          />
                          <small>{dailyChallenge.progress}/{dailyChallenge.target} completed</small>
                        </div>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      <div className="mb-2">
                        <Badge bg="light" text="dark" className="px-3 py-2 mb-2">
                          <FaClock className="me-1" />
                          {dailyChallenge.timeLeft} left
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <small>Reward: {dailyChallenge.reward}</small>
                      </div>
                      <Link href="/quizzes?category=science" passHref legacyBehavior>
                        <Button variant="light" className="fw-bold">
                          Start Challenge
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          {/* Recent Activity */}
          <Col lg={8}>
            <Card className="border-0 shadow-lg mb-4">
              <Card.Header className="bg-gradient text-white p-4">
                <h5 className="mb-0 fw-bold">
                  <FaClock className="me-2" />
                  Recent Quiz Results
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {recentQuizzes.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="list-group-item border-0 p-4">
                        <Row className="align-items-center">
                          <Col md={6}>
                            <h6 className="mb-1 fw-bold">{quiz.title}</h6>
                            <p className="text-muted mb-0 small">{quiz.category}</p>
                          </Col>
                          <Col md={3} className="text-center">
                            <Badge
                              bg={getScoreColor(quiz.percentage)}
                              className="px-3 py-2"
                            >
                              {quiz.percentage}%
                            </Badge>
                            <div className="small text-muted mt-1">
                              {quiz.questions_answered}/{quiz.total_questions} questions
                            </div>
                          </Col>
                          <Col md={3} className="text-end">
                            <div className="d-flex align-items-center justify-content-end gap-2">
                              <FaStar className="text-warning" />
                              <span className="fw-bold">{quiz.score}</span>
                              <small className="text-muted">pts</small>
                            </div>
                            <small className="text-muted">{formatTimeAgo(quiz.completed_at)}</small>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaQuestion size={50} className="text-muted mb-3" />
                    <h6 className="text-muted mb-3">No quiz results yet</h6>
                    <Link href="/quizzes" passHref legacyBehavior>
                      <Button className="btn-gradient">
                        <FaPlay className="me-2" />
                        Start Your First Quiz
                      </Button>
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Row className="g-3">
              <Col md={6}>
                <Card className="border-0 h-100" style={{ background: 'linear-gradient(45deg, #10b981, #059669)' }}>
                  <Card.Body className="p-4 text-white text-center">
                    <FaPlay size={40} className="mb-3" />
                    <h5 className="fw-bold mb-2">Solo Challenge</h5>
                    <p className="mb-3">Test your knowledge and earn points</p>
                    <Link href="/quizzes" passHref legacyBehavior>
                      <Button variant="light" className="fw-bold">
                        Browse Quizzes
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 h-100" style={{ background: 'linear-gradient(45deg, #ec4899, #be185d)' }}>
                  <Card.Body className="p-4 text-white text-center">
                    <FaUsers size={40} className="mb-3" />
                    <h5 className="fw-bold mb-2">Live Matches</h5>
                    <p className="mb-3">Compete with other players in real-time</p>
                    <Link href="/matches" passHref legacyBehavior>
                      <Button variant="light" className="fw-bold">
                        Join Match
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Leaderboard Position */}
            <Card className="border-0 shadow-lg mb-4">
              <Card.Header className="bg-gradient text-white p-3">
                <h6 className="mb-0 fw-bold">
                  <FaTrophy className="me-2" />
                  Your Rankings
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Global Rank</span>
                  <Badge bg="warning" className="px-3 py-2">
                    <FaCrown className="me-1" />
                    #{stats.globalRank || '---'}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Weekly Rank</span>
                  <Badge bg="info" className="px-3 py-2">
                    <FaMedal className="me-1" />
                    #{stats.weeklyRank || '---'}
                  </Badge>
                </div>
                <Link href="/leaderboard" passHref legacyBehavior>
                  <Button variant="outline-primary" size="sm" className="w-100">
                    View Full Leaderboard
                  </Button>
                </Link>
              </Card.Body>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-lg mb-4">
              <Card.Header className="bg-gradient text-white p-3">
                <h6 className="mb-0 fw-bold">
                  <FaMedal className="me-2" />
                  Achievements
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                {achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`d-flex align-items-center mb-3 p-2 rounded ${
                      achievement.earned ? 'bg-success bg-opacity-10' : 'bg-light'
                    }`}
                  >
                    <span className="me-3" style={{ fontSize: '24px' }}>
                      {achievement.icon}
                    </span>
                    <div className="flex-grow-1">
                      <h6 className={`mb-0 ${achievement.earned ? 'text-success' : 'text-muted'}`}>
                        {achievement.name}
                      </h6>
                      <small className="text-muted">{achievement.description}</small>
                    </div>
                    {achievement.earned && (
                      <FaCheck className="text-success" />
                    )}
                  </div>
                ))}
                <Button variant="outline-primary" size="sm" className="w-100">
                  View All Achievements
                </Button>
              </Card.Body>
            </Card>

            {/* Quick Quiz */}
            {availableQuizzes.length > 0 && (
              <Card className="border-0 shadow-lg">
                <Card.Header className="bg-gradient text-white p-3">
                  <h6 className="mb-0 fw-bold">
                    <FaGamepad className="me-2" />
                    Featured Quiz
                  </h6>
                </Card.Header>
                <Card.Body className="p-3">
                  {(() => {
                    const featuredQuiz = availableQuizzes[0];
                    return (
                      <div>
                        <h6 className="fw-bold mb-2">{featuredQuiz.title}</h6>
                        <p className="text-muted small mb-3">
                          {featuredQuiz.description || 'Test your knowledge!'}
                        </p>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Badge bg="info" className="px-2 py-1">
                            {featuredQuiz.category_name}
                          </Badge>
                          <small className="text-muted">
                            {featuredQuiz.questions_count || featuredQuiz.max_questions} questions
                          </small>
                        </div>
                        <Link href={`/solo-quiz/${featuredQuiz.id}`} passHref legacyBehavior>
                          <Button className="btn-gradient w-100">
                            <FaPlay className="me-2" />
                            Play Now
                          </Button>
                        </Link>
                      </div>
                    );
                  })()}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
