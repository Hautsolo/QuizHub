// pages/matches.js - Complete Live Multiplayer Matches Page
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Modal, Form, Table, InputGroup,
} from 'react-bootstrap';
import {
  FaUsers, FaPlay, FaPlus, FaSearch, FaGamepad, FaTrophy,
  FaEye, FaLock, FaUnlock, FaCode, FaRefresh, FaUserFriends, FaGlobe,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { matchAPI, quizAPI } from '../utils/api';
import Loading from '../components/Loading';

export default function MatchesPage() {
  const { isAuthenticated, loginAsGuest } = useAuth();

  // State management
  const [matches, setMatches] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    quiz: '',
    is_private: false,
    allow_guests: true,
    max_players: 4,
  });
  const [joinForm, setJoinForm] = useState({
    room_code: '',
    guest_name: '',
  });
  const [guestName, setGuestName] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('waiting');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [, quizzesRes] = await Promise.all([
        matchAPI.getMatches(),
        quizAPI.getQuizzes({ limit: 20 }),
      ]);

      // Mock data for demonstration - replace with real API calls
      const mockMatches = [
        {
          id: 1,
          quiz_title: 'General Knowledge Quiz',
          created_by: 'QuizMaster92',
          status: 'waiting',
          players_count: 2,
          max_players: 4,
          is_private: false,
          allow_guests: true,
          room_code: 'ABC123',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          quiz_title: 'Science Trivia',
          created_by: 'Brainiac',
          status: 'in_progress',
          players_count: 3,
          max_players: 3,
          is_private: false,
          allow_guests: true,
          room_code: 'DEF456',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          quiz_title: 'Movie Trivia Night',
          created_by: 'FilmBuff',
          status: 'waiting',
          players_count: 1,
          max_players: 6,
          is_private: true,
          allow_guests: false,
          room_code: 'GHI789',
          created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
      ];

      setMatches(mockMatches);

      if (quizzesRes.data) {
        setQuizzes(quizzesRes.data.results || quizzesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMatches = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();

    // Set up auto-refresh every 10 seconds
    const interval = setInterval(refreshMatches, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle creating a match
  const handleCreateMatch = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowGuestModal(true);
      return;
    }

    try {
      const response = await matchAPI.createMatch(createForm);
      if (response.data) {
        setShowCreateModal(false);
        setCreateForm({
          quiz: '',
          is_private: false,
          allow_guests: true,
          max_players: 4,
        });
        refreshMatches();
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  // Handle joining a match
  const handleJoinMatch = async (matchId = null, roomCode = null) => {
    try {
      if (roomCode) {
        // Join by room code
        const response = await matchAPI.joinByCode({
          room_code: roomCode,
          guest_name: !isAuthenticated ? joinForm.guest_name : undefined,
        });
        if (response.data) {
          setShowJoinModal(false);
          // Redirect to match page or handle success
        }
      } else if (matchId) {
        // Join specific match
        if (!isAuthenticated) {
          setShowGuestModal(true);
          return;
        }

        const response = await matchAPI.joinMatch(matchId);
        if (response.data) {
          // Redirect to match page or handle success
        }
      }
    } catch (error) {
      console.error('Error joining match:', error);
    }
  };

  // Handle guest login
  const handleGuestLogin = async () => {
    if (!guestName.trim()) return;

    const result = await loginAsGuest(guestName.trim());
    if (result.success) {
      setShowGuestModal(false);
      setGuestName('');
    }
  };

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    const matchesSearch = !searchTerm
      || match.quiz_title.toLowerCase().includes(searchTerm.toLowerCase())
      || match.created_by.toLowerCase().includes(searchTerm.toLowerCase())
      || match.room_code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'secondary';
      default: return 'light';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (loading) {
    return <Loading message="Loading matches..." />;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="display-5 fw-bold text-white mb-2">
              <FaGamepad className="me-3" />
              Live Matches
            </h1>
            <p className="text-white-50">Join or create real-time quiz battles!</p>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              onClick={refreshMatches}
              disabled={refreshing}
              className="d-flex align-items-center"
            >
              <FaRefresh className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="btn-gradient px-4"
              onClick={() => setShowJoinModal(true)}
            >
              <FaCode className="me-2" />
              Join by Code
            </Button>
            <Button
              className="btn-gradient px-4"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-2" />
              Create Match
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaUsers size={30} className="mb-2 text-info" />
                <h5 className="mb-0">{matches.filter((m) => m.status === 'waiting').length}</h5>
                <small>Waiting for Players</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaPlay size={30} className="mb-2 text-warning" />
                <h5 className="mb-0">{matches.filter((m) => m.status === 'in_progress').length}</h5>
                <small>In Progress</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaTrophy size={30} className="mb-2 text-success" />
                <h5 className="mb-0">{matches.reduce((sum, m) => sum + m.players_count, 0)}</h5>
                <small>Total Players</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaGlobe size={30} className="mb-2 text-primary" />
                <h5 className="mb-0">{matches.filter((m) => !m.is_private).length}</h5>
                <small>Public Matches</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="glass-card border-0 mb-4">
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white' }}>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search matches, creators, or room codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'white' }}
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <div className="d-flex justify-content-end gap-2">
                  {['all', 'waiting', 'in_progress'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'light' : 'outline-light'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="text-capitalize"
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Matches List */}
        <Card className="border-0 shadow-lg">
          <Card.Header className="bg-gradient text-white p-4">
            <h4 className="mb-0">Available Matches</h4>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredMatches.length > 0 ? (
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Quiz</th>
                    <th>Host</th>
                    <th className="text-center">Players</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Room Code</th>
                    <th className="text-center">Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-semibold">{match.quiz_title}</div>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              {match.is_private ? (
                                <FaLock className="text-warning" size={12} title="Private Match" />
                              ) : (
                                <FaUnlock className="text-success" size={12} title="Public Match" />
                              )}
                              {match.allow_guests && (
                                <FaUserFriends className="text-info" size={12} title="Guests Allowed" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold">{match.created_by}</span>
                      </td>
                      <td className="text-center">
                        <Badge bg="info" className="px-3 py-2">
                          {match.players_count}/{match.max_players}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={getStatusColor(match.status)} className="px-3 py-2 text-capitalize">
                          {match.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <code className="bg-light px-2 py-1 rounded">{match.room_code}</code>
                      </td>
                      <td className="text-center">
                        <small className="text-muted">{formatTimeAgo(match.created_at)}</small>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          {match.status === 'waiting' && match.players_count < match.max_players && (
                            <Button
                              size="sm"
                              className="btn-gradient"
                              onClick={() => handleJoinMatch(match.id)}
                            >
                              <FaPlay className="me-1" size={12} />
                              Join
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-primary"
                            title="Spectate"
                          >
                            <FaEye size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-5">
                <FaGamepad size={60} className="text-muted mb-3" />
                <h5 className="text-muted mb-3">No matches found</h5>
                <p className="text-muted mb-4">
                  {statusFilter !== 'all'
                    ? `No ${statusFilter.replace('_', ' ')} matches available.`
                    : 'Be the first to create a match!'}
                </p>
                <Button
                  className="btn-gradient"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus className="me-2" />
                  Create New Match
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Create Match Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>Create New Match</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <Form onSubmit={handleCreateMatch}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Quiz</Form.Label>
                    <Form.Select
                      value={createForm.quiz}
                      onChange={(e) => setCreateForm({ ...createForm, quiz: e.target.value })}
                      required
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <option value="">Choose a quiz...</option>
                      {quizzes.map((quiz) => (
                        <option key={quiz.id} value={quiz.id} className="text-dark">
                          {quiz.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Players</Form.Label>
                    <Form.Select
                      value={createForm.max_players}
                      onChange={(e) => setCreateForm({ ...createForm, max_players: parseInt(e.target.value, 10) })}
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num} className="text-dark">
                          {num} players
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Private Match"
                    checked={createForm.is_private}
                    onChange={(e) => setCreateForm({ ...createForm, is_private: e.target.checked })}
                    className="text-white"
                  />
                  <small className="text-white-50">Private matches require room code to join</small>
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="checkbox"
                    label="Allow Guests"
                    checked={createForm.allow_guests}
                    onChange={(e) => setCreateForm({ ...createForm, allow_guests: e.target.checked })}
                    className="text-white"
                  />
                  <small className="text-white-50">Let non-registered users join</small>
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button type="submit" className="btn-gradient flex-fill">
                  <FaGamepad className="me-2" />
                  Create Match
                </Button>
                <Button variant="outline-light" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Join by Code Modal */}
        <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} centered>
          <Modal.Body className="p-4 text-center" style={{ background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', color: 'white' }}>
            <FaCode size={50} className="mb-3" />
            <h4 className="mb-3">Join Match by Code</h4>
            <p className="mb-4">Enter the room code to join a match</p>

            <Form onSubmit={(e) => { e.preventDefault(); handleJoinMatch(null, joinForm.room_code); }}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter room code (e.g., ABC123)"
                  value={joinForm.room_code}
                  onChange={(e) => setJoinForm({ ...joinForm, room_code: e.target.value.toUpperCase() })}
                  className="text-center py-3 rounded-pill text-uppercase"
                  style={{ fontSize: '18px', letterSpacing: '2px' }}
                  maxLength={6}
                />
              </Form.Group>

              {!isAuthenticated && (
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Your display name"
                    value={joinForm.guest_name}
                    onChange={(e) => setJoinForm({ ...joinForm, guest_name: e.target.value })}
                    className="text-center py-2 rounded-pill"
                  />
                </Form.Group>
              )}

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  disabled={!joinForm.room_code || (!isAuthenticated && !joinForm.guest_name)}
                  className="btn-gradient flex-fill py-3 rounded-pill"
                >
                  Join Match
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setShowJoinModal(false)}
                  className="py-2 rounded-pill"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Guest Login Modal */}
        <Modal show={showGuestModal} onHide={() => setShowGuestModal(false)} centered>
          <Modal.Body className="p-4 text-center" style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px' }}>
            <FaUserFriends size={50} className="text-primary mb-3" />
            <h4 className="fw-bold">Join as Guest</h4>
            <p className="text-muted">Choose a username to join the match!</p>

            <Form onSubmit={(e) => { e.preventDefault(); handleGuestLogin(); }}>
              <Form.Group className="mb-4">
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-center py-3 rounded-pill"
                  maxLength={20}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  disabled={!guestName.trim()}
                  className="py-3 rounded-pill fw-bold btn-gradient"
                >
                  Join as Guest
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
      </Container>
    </div>
  );
}
