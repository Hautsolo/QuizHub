// // components/MatchWaitingScreen.js
// import React, { useEffect, useState } from 'react';
// import {
//   Container, Row, Col, Card, Badge, Button,
// } from 'react-bootstrap';
// import {
//   FaGlobe, FaMapMarkerAlt, FaSpinner, FaUsers, FaTrophy,
// } from 'react-icons/fa';
// import PropTypes from 'prop-types';
// import { countries } from './CountrySelector';

// export default function MatchWaitingScreen({ match, currentUser, onCancel }) {
//   const [dots, setDots] = useState('');
//   const [searchingCountries, setSearchingCountries] = useState([]);
//   const [currentCountryIndex, setCurrentCountryIndex] = useState(0);

//   useEffect(() => {
//     // Animate dots
//     const dotsInterval = setInterval(() => {
//       setDots((prev) => (prev.length >= 3 ? '' : `${prev}.`));
//     }, 500);

//     // Randomly highlight countries being searched
//     const countryInterval = setInterval(() => {
//       const randomCountries = [];
//       for (let i = 0; i < 5; i += 1) {
//         const randomIndex = Math.floor(Math.random() * countries.length);
//         randomCountries.push(countries[randomIndex]);
//       }
//       setSearchingCountries(randomCountries);
//       setCurrentCountryIndex((prev) => (prev + 1) % randomCountries.length);
//     }, 2000);

//     return () => {
//       clearInterval(dotsInterval);
//       clearInterval(countryInterval);
//     };
//   }, []);

//   const getUserCountryFlag = (countryCode) => {
//     if (!countryCode) return '🌍';
//     return `https://flagcdn.com/32x24/${countryCode.toLowerCase()}.png`;
//   };

//   return (
//     <div
//       className="min-vh-100 d-flex align-items-center"
//       style={{
//         background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
//         position: 'relative',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Animated Background Map */}
//       <div
//         className="position-absolute w-100 h-100"
//         style={{
//           backgroundImage: 'url("/world-map-dots.svg")',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           opacity: 0.1,
//         }}
//       />

//       {/* Animated Circles on Map */}
//       {searchingCountries.map((country, index) => (
//         <div
//           key={`${country.code}-${index}`}
//           className="position-absolute"
//           style={{
//             left: `${Math.random() * 80 + 10}%`,
//             top: `${Math.random() * 80 + 10}%`,
//             animation: 'pulse 2s infinite',
//             animationDelay: `${index * 0.3}s`,
//           }}
//         >
//           <div
//             className="rounded-circle"
//             style={{
//               width: '60px',
//               height: '60px',
//               background: 'rgba(99, 102, 241, 0.3)',
//               border: '2px solid rgba(99, 102, 241, 0.8)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <FaMapMarkerAlt
//               className={index === currentCountryIndex ? 'text-warning' : 'text-white'}
//               size={20}
//             />
//           </div>
//           <div
//             className="text-white text-center mt-1"
//             style={{ fontSize: '12px', fontWeight: 'bold' }}
//           >
//             {country.name}
//           </div>
//         </div>
//       ))}

//       <Container className="position-relative z-index-1">
//         <Row className="justify-content-center">
//           <Col lg={8}>
//             <Card className="glass-card border-0 shadow-lg">
//               <Card.Body className="p-5">
//                 {/* Globe Animation */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="mx-auto mb-4 position-relative"
//                     style={{
//                       width: '150px',
//                       height: '150px',
//                       background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       animation: 'rotate 20s linear infinite',
//                     }}
//                   >
//                     <FaGlobe size={80} className="text-white" />

//                     {/* Orbiting dots */}
//                     <div
//                       className="position-absolute"
//                       style={{
//                         width: '100%',
//                         height: '100%',
//                         animation: 'rotate 3s linear infinite reverse',
//                       }}
//                     >
//                       <div
//                         className="position-absolute bg-warning rounded-circle"
//                         style={{
//                           width: '15px',
//                           height: '15px',
//                           top: '-7.5px',
//                           left: 'calc(50% - 7.5px)',
//                         }}
//                       />
//                     </div>
//                   </div>

//                   <h3 className="text-white mb-2">
//                     Searching for opponents{dots}
//                   </h3>
//                   <p className="text-white-50 mb-4">
//                     Finding players from around the world to match your skill level
//                   </p>
//                 </div>

//                 {/* Current User Info */}
//                 <div className="mb-4">
//                   <div className="d-flex align-items-center justify-content-center gap-3">
//                     <Card className="bg-dark bg-opacity-50 border-0 text-white">
//                       <Card.Body className="p-3">
//                         <div className="d-flex align-items-center gap-3">
//                           {currentUser.country && (
//                             <img
//                               src={getUserCountryFlag(currentUser.country)}
//                               alt={currentUser.country_name}
//                               style={{ width: '32px', height: '24px' }}
//                             />
//                           )}
//                           <div>
//                             <h5 className="mb-0">{currentUser.username}</h5>
//                             <small className="text-white-50">
//                               {currentUser.country_name || 'Earth'}
//                             </small>
//                             {currentUser.country_rank && currentUser.country_rank <= 10 && (
//                               <Badge
//                                 bg="warning"
//                                 className="ms-2"
//                                 style={{ fontSize: '10px' }}
//                               >
//                                 <FaTrophy className="me-1" />
//                                 #{currentUser.country_rank} in {currentUser.country_name}
//                               </Badge>
//                             )}
//                             {currentUser.global_rank && currentUser.global_rank <= 10 && (
//                               <Badge
//                                 bg="danger"
//                                 className="ms-2"
//                                 style={{ fontSize: '10px' }}
//                               >
//                                 <FaTrophy className="me-1" />
//                                 #{currentUser.global_rank} Global
//                               </Badge>
//                             )}
//                           </div>
//                         </div>
//                       </Card.Body>
//                     </Card>

//                     <div className="text-white">
//                       <FaSpinner className="fa-spin" size={30} />
//                     </div>

//                     <Card className="bg-dark bg-opacity-50 border-0 text-white">
//                       <Card.Body className="p-3">
//                         <div className="text-center">
//                           <div
//                             className="rounded-circle bg-secondary mx-auto mb-2"
//                             style={{ width: '40px', height: '40px' }}
//                           />
//                           <h5 className="mb-0">???</h5>
//                           <small className="text-white-50">Searching...</small>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </div>
//                 </div>

//                 {/* Match Info */}
//                 <div className="text-center mb-4">
//                   <Badge bg="info" className="px-3 py-2 mb-2">
//                     <FaUsers className="me-2" />
//                     {match.players_count}/{match.max_players} Players
//                   </Badge>
//                   <div className="text-white-50 small">
//                     Room Code: <strong className="text-white">{match.room_code}</strong>
//                   </div>
//                 </div>

//                 {/* Countries being searched */}
//                 <div className="text-center mb-4">
//                   <small className="text-white-50">Currently searching in:</small>
//                   <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
//                     {searchingCountries.slice(0, 3).map((country, index) => (
//                       <Badge
//                         key={`badge-${country.code}`}
//                         bg={index === currentCountryIndex ? 'warning' : 'secondary'}
//                         className="px-3 py-2"
//                       >
//                         {country.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Cancel Button */}
//                 <div className="text-center">
//                   <Button
//                     variant="outline-light"
//                     onClick={onCancel}
//                     className="px-4"
//                   >
//                     Cancel Search
//                   </Button>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>
//       </Container>

//       <style jsx>{`
//         @keyframes rotate {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         @keyframes pulse {
//           0% {
//             transform: scale(1);
//             opacity: 0.8;
//           }
//           50% {
//             transform: scale(1.2);
//             opacity: 1;
//           }
//           100% {
//             transform: scale(1);
//             opacity: 0.8;
//           }
//         }
//       `}
//       </style>
//     </div>
//   );
// }

// MatchWaitingScreen.propTypes = {
//   match: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     room_code: PropTypes.string.isRequired,
//     players_count: PropTypes.number.isRequired,
//     max_players: PropTypes.number.isRequired,
//   }).isRequired,
//   currentUser: PropTypes.shape({
//     username: PropTypes.string.isRequired,
//     country: PropTypes.string,
//     country_name: PropTypes.string,
//     country_rank: PropTypes.number,
//     global_rank: PropTypes.number,
//   }).isRequired,
//   onCancel: PropTypes.func.isRequired,
// };
