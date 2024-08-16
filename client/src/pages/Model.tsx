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

      // Attach event listeners
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      // Optional: Cleanup listeners if the component is unmounted
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <canvas className="grid-item" id="modelCanvas"></canvas>;
}

export default Model;
