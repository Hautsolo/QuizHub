import React from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

export default function Loading({ message }) {
  return (
    <Container className="text-center py-5">
      <div className="glass-card p-5 d-inline-block">
        <div className="loading-spinner mb-3" />
        <h4 className="text-white mb-0">{message}</h4>
        <p className="text-white-50 mb-0">Please wait while we prepare everything for you</p>
      </div>
    </Container>
  );
}

Loading.propTypes = {
  message: PropTypes.string,
};

Loading.defaultProps = {
  message: 'Loading awesome content...',
};
