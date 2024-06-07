// Model.tsx

import { useEffect, useRef } from 'react';
import '../stylesheet/style.css';
import '../stylesheet/Model.css';
import { handleMouseDown, handleMouseUp, onMouseMove, setupModel } from '../components/ThreeScene';

function Model() {
  const isSetupModelCalled = useRef(false);
  useEffect(() => {
    if (!isSetupModelCalled.current) {
      setupModel();
      isSetupModelCalled.current = true;
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", onMouseMove);
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return ( 
    <canvas id="modelCanvas"></canvas>
  );
}


export default Model;
