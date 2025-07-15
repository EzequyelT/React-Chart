import { useRef, useEffect } from 'react';

export default function usePanZoom({ scale, setScale, translate, setTranslate }) {
  const dragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);
  const translateRef = useRef(translate);

  function handleMouseDown(e) {
    dragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!dragging.current) return;

    const dx = e.clientX - lastPosition.current.x;
    const dy = e.clientY - lastPosition.current.y;
    lastPosition.current = { x: e.clientX, y: e.clientY };

    setTranslate(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;

      const maxOffset = 1000;
      const minOffset = -3000;

      return {
        x: Math.max(minOffset, Math.min(newX, maxOffset)),
        y: Math.max(minOffset, Math.min(newY, maxOffset)),
      };
    });
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  function handleMouseLeave() {
    dragging.current = false;
  }

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3));
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.3));
  }

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    translateRef.current = translate;
  }, [translate]);

  useEffect(() => {
    const el = document.getElementById('org-tree');
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const currentScale = scaleRef.current;
      const currentTranslate = translateRef.current;

      const scaleAmount = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(0.5, currentScale + scaleAmount), 2);

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleRatio = newScale / currentScale;

      const newTranslate = {
        x: mouseX - scaleRatio * (mouseX - currentTranslate.x),
        y: mouseY - scaleRatio * (mouseY - currentTranslate.y),
      };

      setScale(newScale);
      setTranslate(newTranslate);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [setScale, setTranslate]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    zoomIn,
    zoomOut,
  };
}
