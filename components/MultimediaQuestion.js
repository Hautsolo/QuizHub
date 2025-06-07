// components/MultimediaQuestion.js
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { FaPlay, FaPause, FaVolumeUp, FaImage, FaVideo, FaClock } from 'react-icons/fa';

export default function MultimediaQuestion({ 
  question, 
  onAnswer, 
  timeRemaining, 
  questionNumber, 
  totalQuestions,
  selectedAnswer,
  disabled = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Reset media when question changes
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [question.id]);

  const togglePlayPause = () => {
    const media = audioRef.current || videoRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      setDuration(media.duration || 0);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!disabled) {
      onAnswer(answer);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const renderMediaContent = () => {
    switch (question.media_type) {
      case 'image':
        return (
          <div className="text-center mb-4">
            <img
              src={question.media_url || question.image}
              alt={question.media_description || 'Question image'}
              className="img-fluid rounded"
              style={{ maxHeight: '300px', maxWidth: '100%' }}
            />
            {question.media_description && (
              <p className="text-muted small mt-2">{question.media_description}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="text-center mb-4">
            <div className="audio-player-custom p-4 rounded" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
              <FaVolumeUp size={40} className="text-white mb-3" />
              <div className="d-flex align-items-center justify-content-center gap-3">
                <Button
                  variant="light"
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '50px', height: '50px' }}
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </Button>
                <div className="text-white">
                  <small>{formatTime(currentTime)} / {formatTime(duration)}</small>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={question.media_url || question.audio}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={handleTimeUpdate}
                preload="metadata"
              />
            </div>
            {question.media_description && (
              <p className="text-muted small mt-2">{question.media_description}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="text-center mb-4">
            <div className="video-container position-relative">
              <video
                ref={videoRef}
                src={question.media_url || question.video}
                className="rounded"
                style={{ maxHeight: '300px', maxWidth: '100%' }}
                controls
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                poster={question.image} // Use image as poster if available
              />
            </div>
            {question.media_description && (
              <p className="text-muted small mt-2">{question.media_description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderAnswer = (answer, index) => {
    const isSelected = selectedAnswer?.id === answer.id;
    
    return (
      <Card
        key={answer.id}
        className={`answer-card mb-3 cursor-pointer transition-all ${
          isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
        } ${disabled ? 'opacity-75' : 'hover-shadow'}`}
        style={{ 
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleAnswerSelect(answer)}
      >
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col xs="auto">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                  isSelected ? 'bg-primary text-white' : 'bg-light text-dark'
                }`}
                style={{ width: '35px', height: '35px' }}
              >
                {String.fromCharCode(65 + index)}
              </div>
            </Col>
            <Col>
              {answer.media_type === 'image' && answer.image ? (
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={answer.media_url || answer.image}
                    alt={answer.media_description || `Answer ${index + 1}`}
                    className="rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  {answer.text && <span>{answer.text}</span>}
                </div>
              ) : answer.media_type === 'audio' && answer.audio ? (
                <div className="d-flex align-items-center gap-3">
                  <FaVolumeUp className="text-primary" />
                  <span>{answer.text || `Audio Answer ${index + 1}`}</span>
                  <audio controls className="small-audio">
                    <source src={answer.media_url || answer.audio} />
                  </audio>
                </div>
              ) : (
                <span>{answer.text}</span>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Card className="question-card border-0 shadow-lg">
      <Card.Header className="bg-gradient text-white p-4">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-3">
              <Badge bg="light" text="dark" className="px-3 py-2">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge 
                className="px-3 py-2"
                style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
              >
                Difficulty {question.difficulty}
              </Badge>
            </div>
          </Col>
          <Col xs="auto">
            {timeRemaining !== null && (
              <div className="d-flex align-items-center gap-2 text-white">
                <FaClock />
                <span className="fw-bold">{Math.ceil(timeRemaining / 1000)}s</span>
              </div>
            )}
          </Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-4">
        {/* Question Text */}
        {question.text && (
          <h4 className="mb-4 text-center">{question.text}</h4>
        )}

        {/* Media Content */}
        {renderMediaContent()}

        {/* Answers */}
        <div className="answers-section">
          {question.answers.map((answer, index) => renderAnswer(answer, index))}
        </div>
      </Card.Body>
    </Card>
  );
}