import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;

    if (!dot || !outline) return;

    const onMouseMove = (e: MouseEvent) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Dot follows instantly
      dot.style.left = `${posX}px`;
      dot.style.top = `${posY}px`;

      // Outline follows with animation
      outline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block"></div>
      <div ref={outlineRef} className="cursor-outline hidden md:block"></div>
    </>
  );
};

export default CustomCursor;
