// pages/solo-quiz/[id].js - Fixed ESLint errors
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Row, Col, Button, Card, Modal, ProgressBar, Badge, Alert,
} from 'react-bootstrap';
import {
  FaPlay, FaFlag, FaTrophy, FaClock, FaQuestion,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { quizAPI } from '../../utils/api';
import MultimediaQuestion from '../../components/MultimediaQuestion';
import Loading from '../../components/Loading';

export default function SoloQuizPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [gameState, setGameState] = useState('loading'); // loading, ready, playing, finished
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQuizData = useCallback(async () => {
    try {
      setLoading(true);
      const [quizResponse, questionsResponse] = await Promise.all([
        quizAPI.getQuiz(id),
        quizAPI.getQuestions(id),
      ]);

      setQuiz(quizResponse.data);
      setQuestions(questionsResponse.data);
      setGameState('ready');
    } catch (error) {
      toast.error('Failed to load quiz');
      router.push('/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const handleTimeUp = useCallback(() => {
    toast.error('Time\'s up!');
    setGameState('finished');

    // Auto-submit quiz when time is up
    const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : null;

    const answersData = questions.map((question) => {
      const selectedAnswer = selectedAnswers[question.id];
      return {
        question_id: question.id,
        selected_answer_id: selectedAnswer?.id || null,
        is_correct: selectedAnswer?.is_correct || false,
        time_taken: null,
      };
    });

    // Submit quiz attempt
    fetch('http://localhost:8000/api/quiz-attempts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        quiz: parseInt(id, 10),
        answers: answersData,
        time_taken: timeTaken,
      }),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to submit quiz');
    }).then((attemptData) => {
      setResults(attemptData);
      setShowResults(true);

      if (user && !user.isGuest) {
        user.points += attemptData.score;
      }

      toast.success(`Quiz completed! Score: ${attemptData.score} points`);
    }).catch((error) => {
      toast.error('Failed to submit quiz results');
      console.error('Quiz submission error:', error);
    });
  }, [quizStartTime, selectedAnswers, questions, id, user]);

  const finishQuiz = useCallback(async () => {
    setGameState('finished');

    try {
      const timeTaken = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : null;

      // Prepare answers for submission
      const answersData = questions.map((question) => {
        const selectedAnswer = selectedAnswers[question.id];
        return {
          question_id: question.id,
          selected_answer_id: selectedAnswer?.id || null,
          is_correct: selectedAnswer?.is_correct || false,
          time_taken: null,
        };
      });

      // Submit quiz attempt
      const response = await fetch('http://localhost:8000/api/quiz-attempts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          quiz: parseInt(id, 10),
          answers: answersData,
          time_taken: timeTaken,
        }),
      });

      if (response.ok) {
        const attemptData = await response.json();
        setResults(attemptData);
        setShowResults(true);

        // Update user points if authenticated
        if (user && !user.isGuest) {
          user.points += attemptData.score;
        }

        toast.success(`Quiz completed! Score: ${attemptData.score} points`);
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      toast.error('Failed to submit quiz results');
      console.error('Quiz submission error:', error);
    }
  }, [quizStartTime, selectedAnswers, questions, id, user]);

  // Load quiz data
  useEffect(() => {
    if (id) {
      loadQuizData();
    }
  }, [id, loadQuizData]);

  // Timer management
  useEffect(() => {
    let interval = null;

    if (gameState === 'playing' && quiz?.time_limit && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            handleTimeUp();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState, timeRemaining, quiz?.time_limit, handleTimeUp]);

  const startQuiz = () => {
    setGameState('playing');
    setQuizStartTime(Date.now());
    if (quiz.time_limit) {
      setTimeRemaining(quiz.time_limit * 1000); // Convert to milliseconds
    }
  };

  const handleAnswerSelect = (answer) => {
    if (gameState !== 'playing') return;

    const questionId = questions[currentQuestionIndex].id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const getProgress = () => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => Object.keys(selectedAnswers).length;

  if (loading) {
    return <Loading message="Loading quiz..." />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h4>Quiz not found or has no questions</h4>
          <Button variant="primary" onClick={() => router.push('/quizzes')}>
            Back to Quizzes
          </Button>
        </Alert>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="py-4">
        {gameState === 'ready' && (
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="glass-card border-0 shadow-lg text-white text-center">
                <Card.Body className="p-5">
                  <FaTrophy size={60} className="mb-4 text-warning" />
                  <h2 className="mb-3">{quiz.title}</h2>
                  <p className="lead mb-4">{quiz.description}</p>

                  <Row className="mb-4">
                    <Col md={4}>
                      <div className="stat-item">
                        <FaQuestion size={30} className="mb-2 text-info" />
                        <div className="fw-bold">{questions.length}</div>
                        <small>Questions</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <FaClock size={30} className="mb-2 text-warning" />
                        <div className="fw-bold">
                          {quiz.time_limit ? `${Math.floor(quiz.time_limit / 60)}m` : 'No Limit'}
                        </div>
                        <small>Time Limit</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stat-item">
                        <FaTrophy size={30} className="mb-2 text-success" />
                        <div className="fw-bold">Up to {questions.length * 10}+</div>
                        <small>Points</small>
                      </div>
                    </Col>
                  </Row>

                  <Button
                    size="lg"
                    className="btn-gradient px-5 py-3"
                    onClick={startQuiz}
                  >
                    <FaPlay className="me-2" />
                    Start Quiz
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {gameState === 'playing' && currentQuestion && (
          <>
            {/* Progress Header */}
            <Card className="glass-card border-0 mb-4">
              <Card.Body className="p-3">
                <Row className="align-items-center">
                  <Col>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-white fw-bold">{quiz.title}</span>
                      <Badge bg="info">{getAnsweredCount()}/{questions.length} answered</Badge>
                    </div>
                    <ProgressBar
                      now={getProgress()}
                      className="mt-2"
                      style={{ height: '8px' }}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={finishQuiz}
                      className="d-flex align-items-center gap-2"
                    >
                      <FaFlag />
                      Finish
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Question */}
            <Row className="justify-content-center">
              <Col lg={8}>
                <MultimediaQuestion
                  question={currentQuestion}
                  onAnswer={handleAnswerSelect}
                  timeRemaining={timeRemaining}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  selectedAnswer={selectedAnswers[currentQuestion.id]}
                />

                {/* Navigation */}
                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="outline-light"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <Button
                    className="btn-gradient px-4"
                    onClick={nextQuestion}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* Results Modal */}
        <Modal
          show={showResults}
          onHide={() => setShowResults(false)}
          centered
          size="lg"
        >
          <Modal.Body className="p-5 text-center" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white' }}>
            <FaTrophy size={60} className="mb-4 text-warning" />
            <h2 className="mb-4">Quiz Complete!</h2>

            {results && (
              <Row className="mb-4">
                <Col md={3}>
                  <div className="stat-box">
                    <div className="display-6 fw-bold">{results.score}</div>
                    <small>Points Earned</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stat-box">
                    <div className="display-6 fw-bold">{results.correct_answers}</div>
                    <small>Correct</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stat-box">
                    <div className="display-6 fw-bold">{Math.round(results.percentage)}%</div>
                    <small>Accuracy</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stat-box">
                    <div className="display-6 fw-bold">{Math.floor(results.time_taken / 60)}m</div>
                    <small>Time</small>
                  </div>
                </Col>
              </Row>
            )}

            <div className="d-flex gap-3 justify-content-center">
              <Button
                variant="light"
                onClick={() => router.push('/quizzes')}
              >
                More Quizzes
              </Button>
              <Button
                variant="outline-light"
                onClick={() => router.push('/leaderboard')}
              >
                View Leaderboard
              </Button>
              <Button
                className="btn-gradient"
                onClick={() => window.location.reload()}
              >
                Play Again
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}
