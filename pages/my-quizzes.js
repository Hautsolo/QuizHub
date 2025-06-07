// // pages/my-quizzes.js - Complete fixed version
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Table
// } from 'react-bootstrap';
// import {
//   FaPlus, FaEdit, FaTrash, FaEye, FaPlay, FaQuestion,
//   FaTrophy, FaSave, FaTimes, FaCheck, FaExclamationTriangle
// } from 'react-icons/fa';
// import { useAuth } from '../hooks/useAuth';
// import { quizAPI } from '../utils/api';
// import Loading from '../components/Loading';
// import toast from 'react-hot-toast';

// export default function MyQuizzesPage() {
//   const { isAuthenticated } = useAuth();

//   // State management
//   const [myQuizzes, setMyQuizzes] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedQuiz, setSelectedQuiz] = useState(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     category: '',
//     max_questions: 10,
//     time_limit: '',
//     is_public: true
//   });

//   const loadData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [quizzesRes, categoriesRes] = await Promise.all([
//         quizAPI.getMyQuizzes(),
//         quizAPI.getCategories()
//       ]);

//       setMyQuizzes(quizzesRes.data.results || quizzesRes.data || []);
//       setCategories(categoriesRes.data.results || categoriesRes.data || []);
//     } catch (error) {
//       toast.error('Failed to load your quizzes');
//       console.error('Error loading quizzes:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       loadData();
//     }
//   }, [isAuthenticated, loadData]);

//   const handleCreateQuiz = async (e) => {
//     e.preventDefault();

//     try {
//       const quizData = {
//         ...formData,
//         time_limit: formData.time_limit ? parseInt(formData.time_limit, 10) * 60 : null, // Convert to seconds
//         category: parseInt(formData.category, 10)
//       };

//       const response = await quizAPI.createQuiz(quizData);

//       if (response.data) {
//         toast.success('Quiz created successfully!');
//         setShowCreateModal(false);
//         setFormData({
//           title: '',
//           description: '',
//           category: '',
//           max_questions: 10,
//           time_limit: '',
//           is_public: true
//         });
//         loadData(); // Reload the quizzes
//       }
//     } catch (error) {
//       toast.error('Failed to create quiz');
//       console.error('Error creating quiz:', error);
//     }
//   };

//   const handleEditQuiz = async (e) => {
//     e.preventDefault();

//     try {
//       const quizData = {
//         ...formData,
//         time_limit: formData.time_limit ? parseInt(formData.time_limit, 10) * 60 : null,
//         category: parseInt(formData.category, 10)
//       };

//       await quizAPI.updateQuiz(selectedQuiz.id, quizData);
//       toast.success('Quiz updated successfully!');
//       setShowEditModal(false);
//       loadData();
//     } catch (error) {
//       toast.error('Failed to update quiz');
//       console.error('Error updating quiz:', error);
//     }
//   };

//   const handleDeleteQuiz = async () => {
//     try {
//       await quizAPI.deleteQuiz(selectedQuiz.id);
//       toast.success('Quiz deleted successfully!');
//       setShowDeleteModal(false);
//       setSelectedQuiz(null);
//       loadData();
//     } catch (error) {
//       toast.error('Failed to delete quiz');
//       console.error('Error deleting quiz:', error);
//     }
//   };

//   const openEditModal = (quiz) => {
//     setSelectedQuiz(quiz);
//     setFormData({
//       title: quiz.title,
//       description: quiz.description || '',
//       category: quiz.category.toString(),
//       max_questions: quiz.max_questions,
//       time_limit: quiz.time_limit ? Math.floor(quiz.time_limit / 60).toString() : '',
//       is_public: quiz.is_public
//     });
//     setShowEditModal(true);
//   };

//   const openDeleteModal = (quiz) => {
//     setSelectedQuiz(quiz);
//     setShowDeleteModal(true);
//   };

//   const openCreateModal = () => {
//     setFormData({
//       title: '',
//       description: '',
//       category: '',
//       max_questions: 10,
//       time_limit: '',
//       is_public: true
//     });
//     setShowCreateModal(true);
//   };

//   if (!isAuthenticated) {
//     return (
//       <Container className="py-5 text-center">
//         <Alert variant="warning">
//           <h4>Authentication Required</h4>
//           <p>Please log in to manage your quizzes.</p>
//         </Alert>
//       </Container>
//     );
//   }

//   if (loading) {
//     return <Loading message="Loading your quizzes..." />;
//   }

//   return (
//     <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
//       <Container className="py-4">
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-5">
//           <div>
//             <h1 className="display-5 fw-bold text-white mb-2">My Quizzes</h1>
//             <p className="text-white-50">Create, manage, and share your custom quizzes</p>
//           </div>
//           <Button
//             className="btn-gradient px-4 py-3 fw-bold"
//             onClick={openCreateModal}
//           >
//             <FaPlus className="me-2" />
//             Create New Quiz
//           </Button>
//         </div>

//         {/* Stats Cards */}
//         <Row className="mb-4">
//           <Col md={3}>
//             <Card className="glass-card border-0 text-white text-center">
//               <Card.Body className="p-3">
//                 <FaTrophy size={30} className="mb-2 text-warning" />
//                 <h5 className="mb-0">{myQuizzes.length}</h5>
//                 <small>Total Quizzes</small>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="glass-card border-0 text-white text-center">
//               <Card.Body className="p-3">
//                 <FaEye size={30} className="mb-2 text-info" />
//                 <h5 className="mb-0">{myQuizzes.filter(q => q.is_public).length}</h5>
//                 <small>Public Quizzes</small>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="glass-card border-0 text-white text-center">
//               <Card.Body className="p-3">
//                 <FaPlay size={30} className="mb-2 text-success" />
//                 <h5 className="mb-0">
//                   {myQuizzes.reduce((sum, quiz) => sum + (quiz.play_count || 0), 0)}
//                 </h5>
//                 <small>Total Plays</small>
//               </Card.Body>
//             </Card>
//           </Col>
//           <Col md={3}>
//             <Card className="glass-card border-0 text-white text-center">
//               <Card.Body className="p-3">
//                 <FaQuestion size={30} className="mb-2 text-primary" />
//                 <h5 className="mb-0">
//                   {myQuizzes.reduce((sum, quiz) => sum + (quiz.questions_count || 0), 0)}
//                 </h5>
//                 <small>Total Questions</small>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Quizzes Table */}
//         <Card className="border-0 shadow-lg">
//           <Card.Header className="bg-gradient text-white p-4">
//             <h4 className="mb-0">Your Quizzes</h4>
//           </Card.Header>
//           <Card.Body className="p-0">
//             {myQuizzes.length > 0 ? (
//               <Table hover responsive className="mb-0">
//                 <thead className="bg-light">
//                   <tr>
//                     <th>Quiz Title</th>
//                     <th>Category</th>
//                     <th className="text-center">Questions</th>
//                     <th className="text-center">Plays</th>
