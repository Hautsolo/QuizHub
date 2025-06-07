// pages/leaderboard.js - Complete fixed version
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Badge, Button, Nav, Table, Modal,
} from 'react-bootstrap';
import {
  FaTrophy, FaCrown, FaMedal, FaStar, FaFire, FaCalendar, FaGlobe,
  FaChartLine, FaUsers, FaPlay,
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { leaderboardAPI, quizAPI } from '../utils/api';
import Loading from '../components/Loading';

// Move components outside to avoid re-creation
function LeaderboardEntry({
  entry, rank, isCurrentUser, onUserClick,
}) {
  const getRankIcon = (rankNum) => {
    switch (rankNum) {
      case 1:
        return <FaCrown className="text-warning" size={20} />;
      case 2:
        return <FaMedal className="text-secondary" size={18} />;
      case 3:
        return <FaMedal className="text-warning" size={16} />;
      default:
        return <span className="fw-bold text-primary">#{rankNum}</span>;
    }
  };

  return (
    <tr
      className={`${isCurrentUser ? 'bg-primary bg-opacity-10 border-primary' : ''} cursor-pointer`}
      onClick={() => onUserClick(entry.user, entry.user_name)}
      style={{ cursor: 'pointer' }}
    >
      <td className="text-center">
        <div className="d-flex align-items-center justify-content-center">
          {getRankIcon(rank)}
          {isCurrentUser && <Badge bg="primary" className="ms-2" style={{ fontSize: '10px' }}>YOU</Badge>}
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-bold me-3"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
            }}
          >
            {(entry.user_name || entry.guest_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="fw-semibold">{entry.user_name || entry.guest_name || 'Anonymous'}</div>
            <small className="text-muted">
              {entry.total_quizzes || 0} quizzes • {(entry.average_percentage || 0).toFixed(1)}% avg
            </small>
          </div>
        </div>
      </td>
      <td className="text-center">
        <Badge bg="warning" className="px-3 py-2">
          <FaStar className="me-1" />
          {(entry.score || 0).toLocaleString()}
        </Badge>
      </td>
      <td className="text-center">
        <Badge bg="info" className="px-2 py-1">
          <FaFire className="me-1" />
          {entry.best_streak || 0}
        </Badge>
      </td>
      <td className="text-center">
        <small className="text-muted">
          {entry.total_quizzes || 0} completed
        </small>
      </td>
    </tr>
  );
}

LeaderboardEntry.propTypes = {
  entry: PropTypes.shape({
    user: PropTypes.number,
    user_name: PropTypes.string,
    guest_name: PropTypes.string,
    score: PropTypes.number,
    total_quizzes: PropTypes.number,
    average_percentage: PropTypes.number,
    best_streak: PropTypes.number,
  }).isRequired,
  rank: PropTypes.number.isRequired,
  isCurrentUser: PropTypes.bool,
  onUserClick: PropTypes.func.isRequired,
};

LeaderboardEntry.defaultProps = {
  isCurrentUser: false,
};

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [globalRes, categoriesRes] = await Promise.all([
        leaderboardAPI.getGlobalRankings(),
        quizAPI.getCategories(),
      ]);

      setGlobalLeaderboard(globalRes.data.entries || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);

      // Find current user's rank
      if (isAuthenticated && user) {
        const userEntry = (globalRes.data.entries || []).find((entry) => entry.user === user.id || (entry.user_name === user.username));
        setUserRank(userEntry || null);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard data');
      console.error('Leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load data on component mount
  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  const loadCategoryLeaderboard = async (categoryId) => {
    try {
      const response = await leaderboardAPI.getCategoryRankings(categoryId);
      setSelectedCategory(categoryId);
      setCategoryLeaderboards(response.data.entries || []);
    } catch (error) {
      toast.error('Failed to load category leaderboard');
    }
  };

  const showUserProfile = async (userId, userName) => {
    try {
      // For demo purposes, we'll create a mock user profile
      // In a real app, you'd fetch from userAPI.getUserProfile(userId)
      setSelectedUser({
        id: userId,
        username: userName,
        points: Math.floor(Math.random() * 5000) + 1000,
        streak_days: Math.floor(Math.random() * 30) + 1,
        quizzes_completed: Math.floor(Math.random() * 50) + 10,
        average_score: Math.floor(Math.random() * 30) + 70,
        achievements: ['Quiz Master', 'Speed Demon', 'Perfect Score'],
        join_date: '2024-01-15',
      });
      setShowUserModal(true);
    } catch (error) {
      toast.error('Failed to load user profile');
    }
  };

  if (loading) {
    return <Loading message="Loading leaderboards..." />;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <FaTrophy size={60} className="text-warning mb-3" />
          <h1 className="display-4 fw-bold text-white mb-3">Leaderboard</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: '600px' }}>
            See how you stack up against other quiz masters. Climb the ranks and become a legend!
          </p>
        </div>

        {/* User Stats Card (if authenticated) */}
        {isAuthenticated && userRank && (
          <Card className="glass-card border-0 mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-bold me-3"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-white mb-1">Your Ranking</h5>
                      <div className="d-flex align-items-center gap-3">
                        <Badge bg="warning" className="px-3 py-2">
                          <FaTrophy className="me-1" />
                          Rank #{userRank.rank}
                        </Badge>
                        <Badge bg="success" className="px-3 py-2">
                          <FaStar className="me-1" />
                          {(userRank.score || 0).toLocaleString()} pts
                        </Badge>
                        <Badge bg="info" className="px-3 py-2">
                          <FaFire className="me-1" />
                          {userRank.best_streak || 0} streak
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Button
                    className="btn-gradient"
                    onClick={() => { window.location.href = '/quizzes'; }}
                  >
                    <FaPlay className="me-2" />
                    Play More Quizzes
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Card className="glass-card border-0 mb-4">
          <Card.Body className="p-3">
            <Nav variant="pills" className="justify-content-center">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'global'}
                  onClick={() => setActiveTab('global')}
                  className="text-white mx-2"
                >
                  <FaGlobe className="me-2" />
                  Global Rankings
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'category'}
                  onClick={() => setActiveTab('category')}
                  className="text-white mx-2"
                >
                  <FaChartLine className="me-2" />
                  By Category
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === 'daily'}
                  onClick={() => setActiveTab('daily')}
                  className="text-white mx-2"
                >
                  <FaCalendar className="me-2" />
                  Daily Leaders
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>

        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-gradient text-white p-4">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">
                    <FaGlobe className="me-2" />
                    Global Rankings
                  </h4>
                  <small>Top players across all categories</small>
                </Col>
                <Col xs="auto">
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <FaUsers className="me-1" />
                    {globalLeaderboard.length} Players
                  </Badge>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {globalLeaderboard.length > 0 ? (
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-center" width="10%">Rank</th>
                      <th width="40%">Player</th>
                      <th className="text-center" width="20%">Points</th>
                      <th className="text-center" width="15%">Best Streak</th>
                      <th className="text-center" width="15%">Quizzes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalLeaderboard.slice(0, 50).map((entry, index) => (
                      <LeaderboardEntry
                        key={`global-${entry.user || entry.guest || entry.id || `entry-${index}`}`}
                        entry={entry}
                        rank={index + 1}
                        isCurrentUser={
                          isAuthenticated
                          && (entry.user === user?.id || entry.user_name === user?.username)
                        }
                        onUserClick={showUserProfile}
                      />
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <FaTrophy size={50} className="text-muted mb-3" />
                  <h5 className="text-muted">No rankings yet</h5>
                  <p className="text-muted">Be the first to play and claim the top spot!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Category Leaderboard */}
        {activeTab === 'category' && (
          <>
            {/* Category Selection */}
            <Row className="mb-4">
              {categories.map((category) => (
                <Col key={category.id} md={4} lg={3} className="mb-3">
                  <Card
                    className={`category-card cursor-pointer ${
                      selectedCategory === category.id ? 'border-primary bg-primary bg-opacity-10' : 'glass-card border-0'
                    }`}
                    onClick={() => loadCategoryLeaderboard(category.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="text-center p-3">
                      <div
                        className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: '50px',
                          height: '50px',
                          background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                        }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <h6 className="text-white mb-1">{category.name}</h6>
                      <small className="text-white-50">{category.topics_count} topics</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Category Rankings */}
            {selectedCategory && (
              <Card className="border-0 shadow-lg">
                <Card.Header className="bg-gradient text-white p-4">
                  <h4 className="mb-0">
                    <FaChartLine className="me-2" />
                    {categories.find((c) => c.id === selectedCategory)?.name} Rankings
                  </h4>
                </Card.Header>
                <Card.Body className="p-0">
                  {categoryLeaderboards.length > 0 ? (
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="text-center" width="10%">Rank</th>
                          <th width="40%">Player</th>
                          <th className="text-center" width="20%">Points</th>
                          <th className="text-center" width="15%">Best Streak</th>
                          <th className="text-center" width="15%">Quizzes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryLeaderboards.map((entry, index) => (
                          <LeaderboardEntry
                            key={`category-${entry.user || entry.guest || entry.id || `entry-${index}`}`}
                            entry={entry}
                            rank={index + 1}
                            isCurrentUser={
                              isAuthenticated
                              && (entry.user === user?.id || entry.user_name === user?.username)
                            }
                            onUserClick={showUserProfile}
                          />
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-5">
                      <FaChartLine size={50} className="text-muted mb-3" />
                      <h5 className="text-muted">No rankings in this category yet</h5>
                      <p className="text-muted">Be the first to play quizzes in this category!</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* Daily Leaders */}
        {activeTab === 'daily' && (
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-gradient text-white p-4">
              <h4 className="mb-0">
                <FaCalendar className="me-2" />
                Today&apos;s Top Performers
              </h4>
              <small>Rankings reset daily at midnight</small>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <FaCalendar size={50} className="text-muted mb-3" />
              <h5 className="text-muted">Daily leaderboards coming soon!</h5>
              <p className="text-muted">We&apos;re working on daily rankings to make competition even more exciting.</p>
            </Card.Body>
          </Card>
        )}

        {/* User Profile Modal */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
          {selectedUser && (
            <Modal.Body className="p-5" style={{ background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', color: 'white' }}>
              <div className="text-center">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>

                <h3 className="mb-3">{selectedUser.username}</h3>

                <Row className="mb-4">
                  <Col>
                    <div className="stat-box">
                      <FaStar size={30} className="mb-2" />
                      <div className="h4">{selectedUser.points?.toLocaleString()}</div>
                      <small>Total Points</small>
                    </div>
                  </Col>
                  <Col>
                    <div className="stat-box">
                      <FaFire size={30} className="mb-2" />
                      <div className="h4">{selectedUser.streak_days}</div>
                      <small>Day Streak</small>
                    </div>
                  </Col>
                  <Col>
                    <div className="stat-box">
                      <FaPlay size={30} className="mb-2" />
                      <div className="h4">{selectedUser.quizzes_completed}</div>
                      <small>Quizzes</small>
                    </div>
                  </Col>
                </Row>

                <div className="mb-4">
                  <h6>Achievements</h6>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {selectedUser.achievements?.map((achievement) => (
                      <Badge key={achievement} bg="warning" className="px-3 py-2">
                        <FaTrophy className="me-1" />
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="light"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </Button>
              </div>
            </Modal.Body>
          )}
        </Modal>
      </Container>
    </div>
  );
}
