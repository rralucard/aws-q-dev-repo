import React, { useEffect, useState } from 'react';

const MouseFollower: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const checkHovering = () => {
      const hoveredElements = document.querySelectorAll(':hover');
      const isHoveringElement = Array.from(hoveredElements).some(el => 
        el.classList.contains('hoverable')
      );
      setIsHovering(isHoveringElement);
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
      checkHovering();
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div 
        className="cursor-dot" 
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})` 
        }}
      />
      <div 
        className="cursor-outline" 
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          width: isHovering ? '70px' : '40px',
          height: isHovering ? '70px' : '40px',
          borderColor: isHovering ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)'
        }}
      />
    </>
  );
};

export default MouseFollower;