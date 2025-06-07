// pages/my-quizzes.js - Complete fixed version
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Table,
} from 'react-bootstrap';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaPlay, FaQuestion,
  FaTrophy, FaSave, FaTimes, FaCheck, FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { quizAPI } from '../utils/api';
import Loading from '../components/Loading';

export default function MyQuizzesPage() {
  const { isAuthenticated } = useAuth();

  // State management
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    max_questions: 10,
    time_limit: '',
    is_public: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [quizzesRes, categoriesRes] = await Promise.all([
        quizAPI.getMyQuizzes(),
        quizAPI.getCategories(),
      ]);

      setMyQuizzes(quizzesRes.data.results || quizzesRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
    } catch (error) {
      toast.error('Failed to load your quizzes');
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    try {
      const quizData = {
        ...formData,
        time_limit: formData.time_limit ? parseInt(formData.time_limit, 10) * 60 : null, // Convert to seconds
        category: parseInt(formData.category, 10),
      };

      const response = await quizAPI.createQuiz(quizData);

      if (response.data) {
        toast.success('Quiz created successfully!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          max_questions: 10,
          time_limit: '',
          is_public: true,
        });
        loadData(); // Reload the quizzes
      }
    } catch (error) {
      toast.error('Failed to create quiz');
      console.error('Error creating quiz:', error);
    }
  };

  const handleEditQuiz = async (e) => {
    e.preventDefault();

    try {
      const quizData = {
        ...formData,
        time_limit: formData.time_limit ? parseInt(formData.time_limit, 10) * 60 : null,
        category: parseInt(formData.category, 10),
      };

      await quizAPI.updateQuiz(selectedQuiz.id, quizData);
      toast.success('Quiz updated successfully!');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to update quiz');
      console.error('Error updating quiz:', error);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await quizAPI.deleteQuiz(selectedQuiz.id);
      toast.success('Quiz deleted successfully!');
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete quiz');
      console.error('Error deleting quiz:', error);
    }
  };

  const openEditModal = (quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      category: quiz.category.toString(),
      max_questions: quiz.max_questions,
      time_limit: quiz.time_limit ? Math.floor(quiz.time_limit / 60).toString() : '',
      is_public: quiz.is_public,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (quiz) => {
    setSelectedQuiz(quiz);
    setShowDeleteModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      max_questions: 10,
      time_limit: '',
      is_public: true,
    });
    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const {
      name, value, type, checked,
    } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h4>Authentication Required</h4>
          <p>Please log in to manage your quizzes.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <Loading message="Loading your quizzes..." />;
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="display-5 fw-bold text-white mb-2">My Quizzes</h1>
            <p className="text-white-50">Create, manage, and share your custom quizzes</p>
          </div>
          <Button
            className="btn-gradient px-4 py-3 fw-bold"
            onClick={openCreateModal}
          >
            <FaPlus className="me-2" />
            Create New Quiz
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaTrophy size={30} className="mb-2 text-warning" />
                <h5 className="mb-0">{myQuizzes.length}</h5>
                <small>Total Quizzes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaEye size={30} className="mb-2 text-info" />
                <h5 className="mb-0">{myQuizzes.filter((q) => q.is_public).length}</h5>
                <small>Public Quizzes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaPlay size={30} className="mb-2 text-success" />
                <h5 className="mb-0">
                  {myQuizzes.reduce((sum, quiz) => sum + (quiz.play_count || 0), 0)}
                </h5>
                <small>Total Plays</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="glass-card border-0 text-white text-center">
              <Card.Body className="p-3">
                <FaQuestion size={30} className="mb-2 text-primary" />
                <h5 className="mb-0">
                  {myQuizzes.reduce((sum, quiz) => sum + (quiz.questions_count || 0), 0)}
                </h5>
                <small>Total Questions</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quizzes Table */}
        <Card className="border-0 shadow-lg">
          <Card.Header className="bg-gradient text-white p-4">
            <h4 className="mb-0">Your Quizzes</h4>
          </Card.Header>
          <Card.Body className="p-0">
            {myQuizzes.length > 0 ? (
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th className="text-center">Questions</th>
                    <th className="text-center">Plays</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Created</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myQuizzes.map((quiz) => (
                    <tr key={quiz.id}>
                      <td>
                        <div>
                          <div className="fw-semibold">{quiz.title}</div>
                          {quiz.description && (
                            <small className="text-muted">
                              {quiz.description.substring(0, 50)}
                              {quiz.description.length > 50 ? '...' : ''}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>{quiz.category_name}</td>
                      <td className="text-center">
                        <Badge bg="info" className="me-1">
                          {quiz.questions_count || 0}
                        </Badge>
                        / {quiz.max_questions}
                      </td>
                      <td className="text-center">
                        <Badge bg="success">
                          {quiz.play_count || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={quiz.is_public ? 'success' : 'secondary'}>
                          {quiz.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <small className="text-muted">
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => openEditModal(quiz)}
                            title="Edit Quiz"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-info"
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => openDeleteModal(quiz)}
                            title="Delete Quiz"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-5">
                <FaQuestion size={60} className="text-muted mb-3" />
                <h5 className="text-muted mb-3">No quizzes yet</h5>
                <p className="text-muted mb-4">
                  Create your first quiz to get started!
                </p>
                <Button
                  className="btn-gradient"
                  onClick={openCreateModal}
                >
                  <FaPlus className="me-2" />
                  Create Your First Quiz
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Create Quiz Modal */}
        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>Create New Quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <Form onSubmit={handleCreateQuiz}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quiz Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="text-dark">
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-transparent text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Questions</Form.Label>
                    <Form.Control
                      type="number"
                      name="max_questions"
                      value={formData.max_questions}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Limit (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="time_limit"
                      value={formData.time_limit}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Optional"
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="is_public"
                  label="Make this quiz public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="text-white"
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  className="btn-gradient flex-fill"
                >
                  <FaSave className="me-2" />
                  Create Quiz
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setShowCreateModal(false)}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit Quiz Modal */}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="bg-dark text-white">
            <Modal.Title>Edit Quiz</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-white">
            <Form onSubmit={handleEditQuiz}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quiz Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id} className="text-dark">
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-transparent text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Questions</Form.Label>
                    <Form.Control
                      type="number"
                      name="max_questions"
                      value={formData.max_questions}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Limit (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="time_limit"
                      value={formData.time_limit}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Optional"
                      className="bg-transparent text-white"
                      style={{ border: '1px solid rgba(255,255,255,0.3)' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="is_public"
                  label="Make this quiz public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="text-white"
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  type="submit"
                  className="btn-gradient flex-fill"
                >
                  <FaCheck className="me-2" />
                  Update Quiz
                </Button>
                <Button
                  variant="outline-light"
                  onClick={() => setShowEditModal(false)}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Body className="p-4 text-center" style={{ background: 'linear-gradient(45deg, #dc3545, #c82333)', color: 'white' }}>
            <FaExclamationTriangle size={60} className="mb-3 text-warning" />
            <h4 className="mb-3">Delete Quiz</h4>
            <p className="mb-4">
              Are you sure you want to delete &quot;{selectedQuiz?.title}&quot;?
              This action cannot be undone.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button
                variant="light"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteQuiz}
              >
                <FaTrash className="me-2" />
                Delete Quiz
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
