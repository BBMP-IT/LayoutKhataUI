import React from 'react';
import './Loader.css'; 
import bbmpLogo from '../assets/bbmp.png';

// const Loader = () => {
//   return (
//     <div className="loader-container">
//       <div className="loader">

//       </div>
//     </div>
//   );
// };


const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        <div className="loader-ring"></div>
        <img src={bbmpLogo} alt="BBMP Logo" className="loader-logo" />
      </div>
    </div>
  );
};
export default Loader;
