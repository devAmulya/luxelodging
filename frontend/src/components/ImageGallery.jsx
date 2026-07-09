import { useState, useEffect, useRef } from 'react';

const ImageGallery = ({ images, title }) => {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isWheeling, setIsWheeling] = useState(false);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const wheelTimeout = useRef(null);

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const openLightbox = () => {
    resetZoom();
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    resetZoom();
  };

  const goTo = (index) => {
    resetZoom();
    setActive(index);
  };

  // Lock background scroll while lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [lightboxOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && active < images.length - 1) goTo(active + 1);
      if (e.key === 'ArrowLeft' && active > 0) goTo(active - 1);
      if (e.key === '+') setZoom((z) => Math.min(z + 0.5, 4));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, active, images]);

  if (!images || images.length === 0) {
    return (
      <div className="h-96 rounded-xl bg-border flex items-center justify-center text-muted font-sans">
        No photos uploaded yet
      </div>
    );
  }

  // Only toggle zoom if this was a genuine click, not the tail end of a drag
  const handleImageClick = (e) => {
    e.stopPropagation();
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    setZoom((z) => (z === 1 ? 2.5 : 1));
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setIsWheeling(true);
    clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => setIsWheeling(false), 150);

    setZoom((z) => {
      const next = z - e.deltaY * 0.002;
      return Math.min(Math.max(next, 1), 4);
    });
  };

  const handleMouseDown = (e) => {
    if (zoom === 1) return;
    dragging.current = true;
    dragMoved.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    // Treat as a real drag once movement crosses a small threshold —
    // avoids misclassifying a tiny jitter as a drag
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMoved.current = true;
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  const transformStyle = {
    transform: `scale(${zoom}) translate3d(${pan.x / zoom}px, ${pan.y / zoom}px, 0)`,
    willChange: 'transform',
    cursor: zoom === 1 ? 'zoom-in' : 'grab',
    transition: (isWheeling || dragging.current) ? 'none' : 'transform 0.2s ease-out',
  };

  return (
    <div>
      <button
        type="button"
        onClick={openLightbox}
        className="w-full h-96 rounded-xl overflow-hidden mb-2 block cursor-zoom-in"
        aria-label="View full image"
      >
        <img
          src={images[active].image_url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => goTo(i)}
              className={`w-20 h-16 rounded-md overflow-hidden shrink-0 border-2 ${
                i === active ? 'border-primary' : 'border-transparent'
              }`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center overflow-hidden"
          onClick={closeLightbox}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-6 text-paper text-3xl font-sans hover:text-accent z-10"
            aria-label="Close"
          >
            ×
          </button>

          {active > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goTo(active - 1); }}
              className="absolute left-4 text-paper text-4xl font-sans hover:text-accent px-2 z-10"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <img
            key={active}
            src={images[active].image_url}
            alt={title}
            onClick={handleImageClick}
            onMouseDown={handleMouseDown}
            draggable={false}
            style={transformStyle}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-md select-none"
          />

          {active < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goTo(active + 1); }}
              className="absolute right-4 text-paper text-4xl font-sans hover:text-accent px-2 z-10"
              aria-label="Next image"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-ink/60 rounded-full px-4 py-2">
            <button
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.5, 1)); }}
              className="text-paper text-lg font-sans hover:text-accent"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="text-paper font-mono text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.5, 4)); }}
              className="text-paper text-lg font-sans hover:text-accent"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <span className="absolute bottom-5 right-6 text-paper font-mono text-sm">
            {active + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;