import React, { useState, useEffect, useRef } from 'react';
import Ipc from './Ipc/Ipc';
import { checkWfc } from '../utils/checkWfc.js';

import './index.scss';

const Devtools = () => {
  const [isWfc, setIsWfc] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    checkWfc().then(setIsWfc);
  }, []);

  if (isWfc === null) {
    return <div ref={containerRef} />;
  }

  return (
    <div ref={containerRef}>
      <Ipc />
    </div>
  );
};

export default Devtools;
