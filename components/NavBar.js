// components/NavBar.js - Updated with My Quizzes link
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Navbar, Container, Nav, Button, Badge,
} from 'react-bootstrap';
import {
  FaBell, FaUser, FaGamepad, FaTrophy, FaSignOutAlt, FaEdit,
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

export default function NavBar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications] = useState([]);

  useEffect(() => {
    // Fetch notifications if user is authenticated
    if (isAuthenticated) {
      // This will be implemented with your API
      // fetchNotifications();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Navbar expand="lg" className="glass-navbar" fixed="top">
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand className="d-flex align-items-center">
            <FaGamepad className="me-2 text-primary" size={30} />
            <span className="gradient-text fs-3 fw-bold">QuizHub</span>
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link className="fw-semibold">Home</Nav.Link>
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" passHref legacyBehavior>
                  <Nav.Link className="fw-semibold">Dashboard</Nav.Link>
                </Link>
                <Link href="/quizzes" passHref legacyBehavior>
                  <Nav.Link className="fw-semibold">Browse Quizzes</Nav.Link>
                </Link>
                <Link href="/my-quizzes" passHref legacyBehavior>
                  <Nav.Link className="fw-semibold">
                    <FaEdit className="me-1" />
                    My Quizzes
                  </Nav.Link>
                </Link>
                <Link href="/matches" passHref legacyBehavior>
                  <Nav.Link className="fw-semibold">Live Matches</Nav.Link>
                </Link>
                <Link href="/leaderboard" passHref legacyBehavior>
                  <Nav.Link className="fw-semibold">
                    <FaTrophy className="me-1" />
                    Leaderboard
                  </Nav.Link>
                </Link>
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                <Nav.Link className="position-relative me-3">
                  <FaBell size={20} />
                  {notifications.length > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </Nav.Link>

                <div className="d-flex align-items-center me-3">
                  <FaUser className="me-2" />
                  <span className="fw-semibold">{user?.username}</span>
                  <Badge bg="primary" className="ms-2">{user?.points || 0}</Badge>
                </div>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <FaSignOutAlt className="me-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" passHref legacyBehavior>
                  <Button variant="outline-primary" className="me-2">
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref legacyBehavior>
                  <Button className="btn-gradient">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
