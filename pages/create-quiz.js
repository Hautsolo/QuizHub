// // pages/create-quiz.js - Complete Quiz Creation Page
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Container, Row, Col, Card, Button, Form, Alert, Badge, Modal,
//   Accordion, InputGroup, ProgressBar, Tabs, Tab,
// } from 'react-bootstrap';
// import {
//   FaPlus, FaTrash, FaEdit, FaSave, FaEye, FaUpload, FaImage,
//   FaVolumeUp, FaVideo, FaGripVertical, FaCheck, FaTimes, FaQuestion,
//   FaClock, FaUsers, FaGlobe, FaLock, FaArrowUp, FaArrowDown,
// } from 'react-icons/fa';
// import { useAuth } from '../hooks/useAuth';
// import { quizAPI } from '../utils/api';
// import Loading from '../components/Loading';

// const handleQuizIconUpload = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     // Validate file size (max 5MB) and type
//     if (file.size > 5 * 1024 * 1024) {
//       alert('Quiz icon must be smaller than 5MB');
//       return;
//     }
//     if (!file.type.startsWith('image/')) {
//       alert('Please select an image file');
//       return;
//     }
//     setQuizData((prev) => ({ ...prev, quiz_icon: file }));
//   }
// };

// export default function CreateQuizPage() {
//   const { user, isAuthenticated } = useAuth();
//   const router = useRouter();

//   // Quiz metadata state
//   const [quizData, setQuizData] = useState({
//     title: '',
//     description: '',
//     time_limit: '',
//     max_questions: 10,
//     is_public: true,
//     difficulty: 3,
//     quiz_icon: null, // NEW: Quiz icon/image
//   });

//   // Questions state
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [showQuestionModal, setShowQuestionModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);

//   // Form state
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [activeTab, setActiveTab] = useState('metadata');

//   // Question form state
//   const [questionForm, setQuestionForm] = useState({
//     text: '',
//     type: 'multiple_choice',
//     difficulty: 3,
//     media_type: 'text',
//     image: null,
//     audio: null,
//     video: null,
//     media_description: '',
//     answers: [
//       {
//         text: '', is_correct: false, media_type: 'text', order: 0,
//       },
//       {
//         text: '', is_correct: false, media_type: 'text', order: 1,
//       },
//       {
//         text: '', is_correct: false, media_type: 'text', order: 2,
//       },
//       {
//         text: '', is_correct: false, media_type: 'text', order: 3,
//       },
//     ],
//   });

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login');
//     }
//   }, [isAuthenticated, router]);

//   const validateQuizData = () => {
//     const newErrors = {};

//     if (!quizData.title.trim()) {
//       newErrors.title = 'Quiz title is required';
//     }

//     if (questions.length === 0) {
//       newErrors.questions = 'Add at least one question';
//     }

//     // Validate each question has at least one correct answer
//     questions.forEach((question, index) => {
//       const hasCorrectAnswer = question.answers.some((answer) => answer.is_correct);
//       if (!hasCorrectAnswer) {
//         newErrors[`question_${index}`] = `Question ${index + 1} needs at least one correct answer`;
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleQuizDataChange = (field, value) => {
//     setQuizData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors((prev) => ({ ...prev, [field]: undefined }));
//     }
//   };

//   const openQuestionModal = (question = null, index = null) => {
//     if (question) {
//       setQuestionForm(question);
//       setCurrentQuestion(index);
//     } else {
//       setQuestionForm({
//         text: '',
//         type: 'multiple_choice',
//         difficulty: 3,
//         media_type: 'text',
//         image: null,
//         audio: null,
//         video: null,
//         media_description: '',
//         answers: [
//           {
//             text: '', is_correct: false, media_type: 'text', order: 0,
//           },
//           {
//             text: '', is_correct: false, media_type: 'text', order: 1,
//           },
//           {
//             text: '', is_correct: false, media_type: 'text', order: 2,
//           },
//           {
//             text: '', is_correct: false, media_type: 'text', order: 3,
//           },
//         ],
//       });
//       setCurrentQuestion(null);
//     }
//     setShowQuestionModal(true);
//   };

//   const saveQuestion = () => {
//     // Validate question
//     if (!questionForm.text.trim() && questionForm.media_type === 'text') {
//       alert('Question text is required');
//       return;
//     }

//     const hasCorrectAnswer = questionForm.answers.some((answer) => answer.is_correct);
//     if (!hasCorrectAnswer) {
//       alert('Please mark at least one answer as correct');
//       return;
//     }

//     const hasAnswerText = questionForm.answers.some((answer) => answer.text.trim());
//     if (!hasAnswerText) {
//       alert('Please provide at least one answer option');
//       return;
//     }

//     if (currentQuestion !== null) {
//       // Update existing question
//       setQuestions((prev) => prev.map((q, index) => (index === currentQuestion ? questionForm : q)));
//     } else {
//       // Add new question
//       setQuestions((prev) => [...prev, questionForm]);
//     }

//     setShowQuestionModal(false);
//     setCurrentQuestion(null);
//   };

//   const deleteQuestion = (index) => {
//     if (window.confirm('Are you sure you want to delete this question?')) {
//       setQuestions((prev) => prev.filter((_, i) => i !== index));
//     }
//   };

//   const moveQuestion = (index, direction) => {
//     const newQuestions = [...questions];
//     const newIndex = direction === 'up' ? index - 1 : index + 1;

//     if (newIndex >= 0 && newIndex < questions.length) {
//       [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
//       setQuestions(newQuestions);
//     }
//   };

//   const handleAnswerChange = (answerIndex, field, value) => {
//     setQuestionForm((prev) => ({
//       ...prev,
//       answers: prev.answers.map((answer, index) => (index === answerIndex ? { ...answer, [field]: value } : answer)),
//     }));
//   };

//   const addAnswer = () => {
//     setQuestionForm((prev) => ({
//       ...prev,
//       answers: [...prev.answers, {
//         text: '',
//         is_correct: false,
//         media_type: 'text',
//         order: prev.answers.length,
//       }],
//     }));
//   };

//   const removeAnswer = (index) => {
//     if (questionForm.answers.length > 2) {
//       setQuestionForm((prev) => ({
//         ...prev,
//         answers: prev.answers.filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const handleMediaUpload = (event, type) => {
//     const file = event.target.files[0];
//     if (file) {
//       setQuestionForm((prev) => ({
//         ...prev,
//         [type]: file,
//         media_type: type,
//       }));
//     }
//   };

//   const saveQuiz = async (isDraft = false) => {
//     if (!validateQuizData()) {
//       setActiveTab('metadata');
//       return;
//     }

//     setSaving(true);

//     try {
//       const quizPayload = {
//         ...quizData,
//         questions,
//         is_public: !isDraft && quizData.is_public,
//         time_limit: quizData.time_limit ? parseInt(quizData.time_limit, 10) : null, // Keep in seconds
//       };

//       const response = await quizAPI.createQuiz(quizPayload);

//       if (response.data) {
//         alert(`Quiz ${isDraft ? 'saved as draft' : 'published'} successfully!`);
//         router.push('/my-quizzes');
//       }
//     } catch (error) {
//       console.error('Error saving quiz:', error);
//       alert('Failed to save quiz. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getDifficultyColor = (difficulty) => {
//     const colors = {
//       1: '#10b981', 2: '#f59e0b', 3: '#f97316', 4: '#ef4444', 5: '#8b5cf6',
//     };
//     return colors[difficulty] || '#6b7280';
//   };

//   if (loading) {
//     return <Loading message="Loading quiz builder..." />;
//   }

//   return (
//     <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
//       <Container className="py-4">
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <div>
//             <h1 className="display-5 fw-bold text-white mb-2">Create Quiz</h1>
//             <p className="text-white-50">Build engaging quizzes with multimedia content</p>
//           </div>
//           <div className="d-flex gap-2">
//             <Button
//               variant="outline-light"
//               onClick={() => setShowPreviewModal(true)}
//               disabled={questions.length === 0}
//             >
//               <FaEye className="me-2" />
//               Preview
//             </Button>
//             <Button
//               variant="light"
//               onClick={() => saveQuiz(true)}
//               disabled={saving}
//             >
//               <FaSave className="me-2" />
//               Save Draft
//             </Button>
//             <Button
//               className="btn-gradient"
//               onClick={() => saveQuiz(false)}
//               disabled={saving}
//             >
//               <FaGlobe className="me-2" />
//               Publish Quiz
//             </Button>
//           </div>
//         </div>

//         {/* Progress indicator */}
//         <Card className="glass-card border-0 mb-4">
//           <Card.Body className="p-3">
//             <div className="d-flex align-items-center justify-content-between text-white">
//               <span>Progress: {Math.round(((quizData.title ? 1 : 0) + (questions.length > 0 ? 1 : 0)) / 2 * 100)}%</span>
//               <Badge bg="info">{questions.length} Questions Added</Badge>
//             </div>
//             <ProgressBar
//               now={((quizData.title ? 1 : 0) + (questions.length > 0 ? 1 : 0)) / 2 * 100}
//               className="mt-2"
//             />
//           </Card.Body>
//         </Card>

//         {/* Error Summary */}
//         {Object.keys(errors).length > 0 && (
//           <Alert variant="danger" className="mb-4">
//             <strong>Please fix the following errors:</strong>
//             <ul className="mb-0 mt-2">
//               {Object.entries(errors).map(([field, error]) => (
//                 <li key={field}>{error}</li>
//               ))}
//             </ul>
//           </Alert>
//         )}

//         {/* Main Content */}
//         <Row>
//           <Col lg={8}>
//             <Tabs activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-4">
//               {/* Quiz Metadata Tab */}
//               <Tab eventKey="metadata" title="Quiz Details">
//                 <Card className="border-0 shadow-lg">
//                   <Card.Header className="bg-gradient text-white p-4">
//                     <h5 className="mb-0">Quiz Information</h5>
//                   </Card.Header>
//                   <Card.Body className="p-4">
//                     {/* Quiz Icon Upload */}
//                     <div className="text-center mb-4">
//                       <div className="position-relative d-inline-block">
//                         {quizData.quiz_icon ? (
//                           <img
//                             src={URL.createObjectURL(quizData.quiz_icon)}
//                             alt="Quiz Icon"
//                             className="rounded-3 border"
//                             style={{ width: '120px', height: '120px', objectFit: 'cover' }}
//                           />
//                         ) : (
//                           <div
//                             className="d-flex align-items-center justify-content-center rounded-3 border border-dashed"
//                             style={{
//                               width: '120px',
//                               height: '120px',
//                               borderColor: '#6366f1',
//                               background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
//                             }}
//                           >
//                             <div className="text-center">
//                               <FaImage size={24} className="text-primary mb-2" />
//                               <small className="text-muted d-block">Quiz Icon</small>
//                             </div>
//                           </div>
//                         )}
//                         <label
//                           className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle"
//                           style={{ width: '32px', height: '32px', transform: 'translate(25%, 25%)' }}
//                         >
//                           <FaUpload size={12} />
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleQuizIconUpload}
//                             style={{ display: 'none' }}
//                           />
//                         </label>
//                       </div>
//                       <div className="mt-2">
//                         <small className="text-muted">
//                           Upload a quiz icon (Square image recommended, max 5MB)
//                         </small>
//                       </div>
//                     </div>

//                     <Row>
//                       <Col md={12}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Quiz Title *</Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={quizData.title}
//                             onChange={(e) => handleQuizDataChange('title', e.target.value)}
//                             isInvalid={!!errors.title}
//                             placeholder="Enter an engaging quiz title"
//                           />
//                           <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Form.Group className="mb-3">
//                       <Form.Label>Description</Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={3}
//                         value={quizData.description}
//                         onChange={(e) => handleQuizDataChange('description', e.target.value)}
//                         placeholder="Describe what your quiz is about..."
//                       />
//                     </Form.Group>

//                     <Row>
//                       <Col md={4}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Time Limit (seconds)</Form.Label>
//                           <Form.Control
//                             type="number"
//                             value={quizData.time_limit}
//                             onChange={(e) => handleQuizDataChange('time_limit', e.target.value)}
//                             placeholder="Optional (e.g., 300 for 5 minutes)"
//                             min="30"
//                             max="7200"
//                           />
//                           <small className="text-muted">
//                             Leave empty for no time limit. 300 = 5 minutes
//                           </small>
//                         </Form.Group>
//                       </Col>
//                       <Col md={4}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Max Questions</Form.Label>
//                           <Form.Control
//                             type="number"
//                             value={quizData.max_questions}
//                             onChange={(e) => handleQuizDataChange('max_questions', parseInt(e.target.value, 10))}
//                             min="1"
//                             max="50"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={4}>
//                         <Form.Group className="mb-3">
//                           <Form.Label>Difficulty</Form.Label>
//                           <Form.Select
//                             value={quizData.difficulty}
//                             onChange={(e) => handleQuizDataChange('difficulty', parseInt(e.target.value, 10))}
//                           >
//                             {[1, 2, 3, 4, 5].map((level) => (
//                               <option key={level} value={level}>
//                                 Level {level} {level === 1 ? '(Easy)' : level === 5 ? '(Expert)' : ''}
//                               </option>
//                             ))}
//                           </Form.Select>
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <div className="d-flex gap-3">
//                       <Form.Check
//                         type="checkbox"
//                         label="Make this quiz public"
//                         checked={quizData.is_public}
//                         onChange={(e) => handleQuizDataChange('is_public', e.target.checked)}
//                       />
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Tab>

//               {/* Questions Tab */}
//               <Tab eventKey="questions" title={`Questions (${questions.length})`}>
//                 <Card className="border-0 shadow-lg">
//                   <Card.Header className="bg-gradient text-white p-4">
//                     <div className="d-flex justify-content-between align-items-center">
//                       <h5 className="mb-0">Quiz Questions</h5>
//                       <Button
//                         variant="light"
//                         onClick={() => openQuestionModal()}
//                       >
//                         <FaPlus className="me-2" />
//                         Add Question
//                       </Button>
//                     </div>
//                   </Card.Header>
//                   <Card.Body className="p-0">
//                     {questions.length > 0 ? (
//                       <div className="list-group list-group-flush">
//                         {questions.map((question, index) => (
//                           <div key={index} className="list-group-item p-4">
//                             <div className="d-flex justify-content-between align-items-start">
//                               <div className="flex-grow-1">
//                                 <div className="d-flex align-items-center gap-3 mb-2">
//                                   <Badge bg="primary">Q{index + 1}</Badge>
//                                   <Badge
//                                     style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
//                                   >
//                                     Level {question.difficulty}
//                                   </Badge>
//                                   {question.media_type !== 'text' && (
//                                     <Badge bg="info">
//                                       {question.media_type === 'image' && <FaImage className="me-1" />}
//                                       {question.media_type === 'audio' && <FaVolumeUp className="me-1" />}
//                                       {question.media_type === 'video' && <FaVideo className="me-1" />}
//                                       {question.media_type}
//                                     </Badge>
//                                   )}
//                                 </div>
//                                 <h6 className="mb-2">{question.text || 'Media Question'}</h6>
//                                 <small className="text-muted">
//                                   {question.answers.filter((a) => a.text.trim()).length} answers,
//                                   {question.answers.filter((a) => a.is_correct).length} correct
//                                 </small>
//                               </div>
//                               <div className="d-flex gap-1">
//                                 <Button
//                                   size="sm"
//                                   variant="outline-secondary"
//                                   onClick={() => moveQuestion(index, 'up')}
//                                   disabled={index === 0}
//                                 >
//                                   <FaArrowUp size={12} />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="outline-secondary"
//                                   onClick={() => moveQuestion(index, 'down')}
//                                   disabled={index === questions.length - 1}
//                                 >
//                                   <FaArrowDown size={12} />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="outline-primary"
//                                   onClick={() => openQuestionModal(question, index)}
//                                 >
//                                   <FaEdit size={12} />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="outline-danger"
//                                   onClick={() => deleteQuestion(index)}
//                                 >
//                                   <FaTrash size={12} />
//                                 </Button>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-5">
//                         <FaQuestion size={60} className="text-muted mb-3" />
//                         <h5 className="text-muted mb-3">No questions added yet</h5>
//                         <p className="text-muted mb-4">Create engaging questions to build your quiz</p>
//                         <Button
//                           className="btn-gradient"
//                           onClick={() => openQuestionModal()}
//                         >
//                           <FaPlus className="me-2" />
//                           Add Your First Question
//                         </Button>
//                       </div>
//                     )}
//                   </Card.Body>
//                 </Card>
//               </Tab>
//             </Tabs>
//           </Col>

//           {/* Sidebar */}
//           <Col lg={4}>
//             <Card className="glass-card border-0 mb-4">
//               <Card.Header className="text-white p-3">
//                 <h6 className="mb-0">Quiz Summary</h6>
//               </Card.Header>
//               <Card.Body className="text-white p-3">
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>Title:</span>
//                   <span className="fw-bold">{quizData.title || 'Untitled Quiz'}</span>
//                 </div>
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>Questions:</span>
//                   <span className="fw-bold">{questions.length}</span>
//                 </div>
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>Time Limit:</span>
//                   <span className="fw-bold">
//                     {quizData.time_limit
//                       ? `${Math.floor(quizData.time_limit / 60)}:${(quizData.time_limit % 60).toString().padStart(2, '0')}`
//                       : 'No limit'}
//                   </span>
//                 </div>
//                 <div className="d-flex justify-content-between mb-2">
//                   <span>Visibility:</span>
//                   <span className="fw-bold">
//                     {quizData.is_public ? (
//                       <><FaGlobe className="me-1" />Public</>
//                     ) : (
//                       <><FaLock className="me-1" />Private</>
//                     )}
//                   </span>
//                 </div>
//                 <div className="d-flex justify-content-between">
//                   <span>Has Icon:</span>
//                   <span className="fw-bold">
//                     {quizData.quiz_icon ? (
//                       <><FaCheck className="me-1 text-success" />Yes</>
//                     ) : (
//                       <><FaTimes className="me-1 text-muted" />No</>
//                     )}
//                   </span>
//                 </div>
//               </Card.Body>
//             </Card>

//             <Card className="glass-card border-0">
//               <Card.Header className="text-white p-3">
//                 <h6 className="mb-0">Tips</h6>
//               </Card.Header>
//               <Card.Body className="text-white p-3">
//                 <ul className="mb-0 small">
//                   <li className="mb-2">Keep questions clear and concise</li>
//                   <li className="mb-2">Upload a square quiz icon for best appearance</li>
//                   <li className="mb-2">Include 4-6 answer options for multiple choice</li>
//                   <li className="mb-2">Time limits are in seconds (300 = 5 minutes)</li>
//                   <li>Mark at least one correct answer per question</li>
//                 </ul>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Question Modal */}
//         <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)} size="lg" centered>
//           <Modal.Header closeButton className="bg-dark text-white">
//             <Modal.Title>
//               {currentQuestion !== null ? 'Edit Question' : 'Add New Question'}
//             </Modal.Title>
//           </Modal.Header>
//           <Modal.Body className="bg-dark text-white">
//             <Form>
//               <Row>
//                 <Col md={8}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Question Text</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={2}
//                       value={questionForm.text}
//                       onChange={(e) => setQuestionForm((prev) => ({ ...prev, text: e.target.value }))}
//                       placeholder="Enter your question..."
//                       className="bg-transparent text-white"
//                       style={{ border: '1px solid rgba(255,255,255,0.3)' }}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Difficulty</Form.Label>
//                     <Form.Select
//                       value={questionForm.difficulty}
//                       onChange={(e) => setQuestionForm((prev) => ({ ...prev, difficulty: parseInt(e.target.value, 10) }))}
//                       className="bg-transparent text-white"
//                       style={{ border: '1px solid rgba(255,255,255,0.3)' }}
//                     >
//                       {[1, 2, 3, 4, 5].map((level) => (
//                         <option key={level} value={level} className="text-dark">
//                           Level {level}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               {/* Media Upload Section */}
//               <Form.Group className="mb-4">
//                 <Form.Label>Media (Optional)</Form.Label>
//                 <div className="d-flex gap-2 mb-2">
//                   <Button
//                     size="sm"
//                     variant={questionForm.media_type === 'text' ? 'primary' : 'outline-light'}
//                     onClick={() => setQuestionForm((prev) => ({ ...prev, media_type: 'text' }))}
//                   >
//                     Text Only
//                   </Button>
//                   <label className="btn btn-outline-light btn-sm">
//                     <FaImage className="me-1" />
//                     Image
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleMediaUpload(e, 'image')}
//                       style={{ display: 'none' }}
//                     />
//                   </label>
//                   <label className="btn btn-outline-light btn-sm">
//                     <FaVolumeUp className="me-1" />
//                     Audio
//                     <input
//                       type="file"
//                       accept="audio/*"
//                       onChange={(e) => handleMediaUpload(e, 'audio')}
//                       style={{ display: 'none' }}
//                     />
//                   </label>
//                   <label className="btn btn-outline-light btn-sm">
//                     <FaVideo className="me-1" />
//                     Video
//                     <input
//                       type="file"
//                       accept="video/*"
//                       onChange={(e) => handleMediaUpload(e, 'video')}
//                       style={{ display: 'none' }}
//                     />
//                   </label>
//                 </div>

//                 {questionForm.media_type !== 'text' && (
//                   <Form.Control
//                     type="text"
//                     placeholder="Media description (for accessibility)"
//                     value={questionForm.media_description}
//                     onChange={(e) => setQuestionForm((prev) => ({ ...prev, media_description: e.target.value }))}
//                     className="bg-transparent text-white"
//                     style={{ border: '1px solid rgba(255,255,255,0.3)' }}
//                   />
//                 )}
//               </Form.Group>

//               {/* Answer Options */}
//               <Form.Label>Answer Options</Form.Label>
//               {questionForm.answers.map((answer, index) => (
//                 <div key={index} className="border rounded p-3 mb-3" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
//                   <div className="d-flex align-items-center gap-2 mb-2">
//                     <Form.Check
//                       type="checkbox"
//                       checked={answer.is_correct}
//                       onChange={(e) => handleAnswerChange(index, 'is_correct', e.target.checked)}
//                       label={`Answer ${String.fromCharCode(65 + index)}`}
//                       className="text-white"
//                     />
//                     <Badge bg={answer.is_correct ? 'success' : 'secondary'}>
//                       {answer.is_correct ? 'Correct' : 'Incorrect'}
//                     </Badge>
//                     {questionForm.answers.length > 2 && (
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => removeAnswer(index)}
//                         className="ms-auto"
//                       >
//                         <FaTimes size={12} />
//                       </Button>
//                     )}
//                   </div>
//                   <Form.Control
//                     type="text"
//                     value={answer.text}
//                     onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
//                     placeholder={`Enter answer option ${String.fromCharCode(65 + index)}`}
//                     className="bg-transparent text-white"
//                     style={{ border: '1px solid rgba(255,255,255,0.3)' }}
//                   />
//                 </div>
//               ))}

//               <div className="d-flex justify-content-between">
//                 <Button
//                   variant="outline-light"
//                   onClick={addAnswer}
//                   disabled={questionForm.answers.length >= 6}
//                 >
//                   <FaPlus className="me-1" />
//                   Add Answer
//                 </Button>
//                 <div className="d-flex gap-2">
//                   <Button
//                     variant="outline-light"
//                     onClick={() => setShowQuestionModal(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className="btn-gradient"
//                     onClick={saveQuestion}
//                   >
//                     <FaCheck className="me-1" />
//                     Save Question
//                   </Button>
//                 </div>
//               </div>
//             </Form>
//           </Modal.Body>
//         </Modal>

//         {/* Preview Modal */}
//         <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg" centered>
//           <Modal.Header closeButton className="bg-dark text-white">
//             <Modal.Title>Quiz Preview</Modal.Title>
//           </Modal.Header>
//           <Modal.Body className="bg-dark text-white">
//             <div className="text-center mb-4">
//               <h3>{quizData.title}</h3>
//               <p className="text-muted">{quizData.description}</p>
//               <div className="d-flex justify-content-center gap-3">
//                 <Badge bg="info">
//                   <FaQuestion className="me-1" />
//                   {questions.length} Questions
//                 </Badge>
//                 {quizData.time_limit && (
//                   <Badge bg="warning">
//                     <FaClock className="me-1" />
//                     {quizData.time_limit} minutes
//                   </Badge>
//                 )}
//                 <Badge bg="success">
//                   <FaUsers className="me-1" />
//                   Up to {questions.length * 10} points
//                 </Badge>
//               </div>
//             </div>

//             {questions.length > 0 ? (
//               <Accordion>
//                 {questions.map((question, index) => (
//                   <Accordion.Item key={index} eventKey={index.toString()}>
//                     <Accordion.Header>
//                       <div className="d-flex align-items-center gap-2">
//                         <Badge bg="primary">Q{index + 1}</Badge>
//                         <Badge style={{ backgroundColor: getDifficultyColor(question.difficulty) }}>
//                           Level {question.difficulty}
//                         </Badge>
//                         {question.media_type !== 'text' && (
//                           <Badge bg="info">
//                             {question.media_type === 'image' && <FaImage className="me-1" />}
//                             {question.media_type === 'audio' && <FaVolumeUp className="me-1" />}
//                             {question.media_type === 'video' && <FaVideo className="me-1" />}
//                             {question.media_type}
//                           </Badge>
//                         )}
//                         <span className="text-truncate">{question.text}</span>
//                       </div>
//                     </Accordion.Header>
//                     <Accordion.Body className="bg-dark text-white">
//                       <div className="mb-3">
//                         <strong>Question:</strong> {question.text}
//                         {question.media_description && (
//                           <div className="small text-muted mt-1">
//                             Media: {question.media_description}
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <strong>Answers:</strong>
//                         <ul className="mt-2">
//                           {question.answers.filter((a) => a.text.trim()).map((answer, aIndex) => (
//                             <li key={aIndex} className={answer.is_correct ? 'text-success fw-bold' : 'text-muted'}>
//                               <span className="me-2">{String.fromCharCode(65 + aIndex)}.</span>
//                               {answer.text}
//                               {answer.is_correct && (
//                                 <Badge bg="success" className="ms-2">
//                                   <FaCheck className="me-1" />
//                                   Correct
//                                 </Badge>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </Accordion.Body>
//                   </Accordion.Item>
//                 ))}
//               </Accordion>
//             ) : (
//               <div className="text-center py-4">
//                 <FaQuestion size={40} className="text-muted mb-3" />
//                 <p className="text-muted">No questions to preview</p>
//               </div>
//             )}
//           </Modal.Body>
//           <Modal.Footer className="bg-dark">
//             <Button variant="outline-light" onClick={() => setShowPreviewModal(false)}>
//               Close Preview
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Container>
//     </div>
//   );
// }
