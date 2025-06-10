
import React from 'react';

const LabelWithAsterisk = ({ text }) => (
  <span>
    {text} <span style={{ color: 'red' }}>*</span>
  </span>
);

export default LabelWithAsterisk;
