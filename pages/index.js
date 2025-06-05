import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Button, Card,
} from 'react-bootstrap';
import Link from 'next/link';
import {
  FaPlay, FaUsers, FaTrophy, FaBrain, FaRocket, FaStar,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { quizAPI, matchAPI } from '../utils/api';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeMatches: 0,
    totalPlayers: 0,
  });
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch basic stats and featured content
        const [quizzesRes, matchesRes] = await Promise.all([
          quizAPI.getQuizzes({ limit: 3 }),
          matchAPI.getMatches(),
        ]);

        setFeaturedQuizzes(quizzesRes.data.results || []);
        setStats({
          totalQuizzes: quizzesRes.data.count || 0,
          activeMatches: matchesRes.data.filter((m) => m.status === 'waiting').length,
          totalPlayers: 1250, // This could come from a stats API
        });
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <Container fluid className="px-0">
      {/* Hero Section */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6}>
              <h1 className="display-3 fw-bold text-white mb-4">
                Welcome to <span className="gradient-text">QuizHub</span>
              </h1>
              <p className="lead text-white mb-4">
                Challenge your knowledge, compete with friends, and climb the leaderboard
                in the most exciting quiz platform ever created!
              </p>

              {isAuthenticated ? (
                <div className="d-flex gap-3 flex-wrap">
                  <Link href="/dashboard" passHref>
                    <Button size="lg" className="btn-gradient">
                      <FaPlay className="me-2" />
                      Continue Playing
                    </Button>
                  </Link>
                  <Link href="/matches" passHref>
                    <Button size="lg" className="btn-glass">
                      <FaUsers className="me-2" />
                      Join Match
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 flex-wrap">
                  <Link href="/register" passHref>
                    <Button size="lg" className="btn-gradient">
                      <FaRocket className="me-2" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button size="lg" className="btn-glass">
                      <FaPlay className="me-2" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-4 glass-card p-3 d-inline-block">
                  <small className="text-white-50">Welcome back, </small>
                  <strong className="text-white">{user.username}</strong>
                  <span className="ms-3">
                    <FaStar className="text-warning me-1" />
                    {user.points} points
                  </span>
                </div>
              )}
            </Col>

            <Col lg={6} className="text-center">
              <div className="glass-card p-5">
                <FaBrain size={120} className="text-white mb-4 pulse" />
                <h3 className="text-white mb-3">Test Your Knowledge</h3>
                <p className="text-white-50 mb-0">
                  Join thousands of players in epic quiz battles
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <Card className="glass-card text-center border-0 h-100">
                <Card.Body className="p-4">
                  <FaTrophy size={50} className="text-warning mb-3" />
                  <h3 className="text-white fw-bold">{stats.totalQuizzes}</h3>
                  <p className="text-white-50 mb-0">Available Quizzes</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="glass-card text-center border-0 h-100">
                <Card.Body className="p-4">
                  <FaUsers size={50} className="text-info mb-3" />
                  <h3 className="text-white fw-bold">{stats.activeMatches}</h3>
                  <p className="text-white-50 mb-0">Active Matches</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="glass-card text-center border-0 h-100">
                <Card.Body className="p-4">
                  <FaBrain size={50} className="text-success mb-3" />
                  <h3 className="text-white fw-bold">{stats.totalPlayers}</h3>
                  <p className="text-white-50 mb-0">Total Players</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Quizzes */}
      {featuredQuizzes.length > 0 && (
        <section className="py-5">
          <Container>
            <h2 className="text-white text-center mb-5">Featured Quizzes</h2>
            <Row className="g-4">
              {featuredQuizzes.map((quiz) => (
                <Col md={4} key={quiz.id}>
                  <Card className="quiz-card border-0 h-100">
                    <Card.Body>
                      <h5 className="text-white fw-bold">{quiz.title}</h5>
                      <p className="text-white-50 small">{quiz.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-primary">{quiz.category_name}</span>
                        <Link href={`/quiz/${quiz.id}`} passHref>
                          <Button size="sm" className="btn-gradient">
                            Play Now
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
    </Container>
  );
}
