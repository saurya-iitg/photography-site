import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Camera, X, ExternalLink, Loader2, Image as ImageIcon, ChevronUp, AlertCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * PRODUCTION CONFIGURATION
 * ------------------------------------------------------------------
 */
const SITE_CONFIG = {
  title: "IITG AI CONFLUENCE PHOTO GALLERY",
  subtitle: "GALLERY",
  description: "A curated collection of high-fidelity imagery. Updated dynamically from external sources.",
  metaTitle: "IITG Gallery | Fine Art Photography",
  metaDescription: "Professional photography showcase featuring high-resolution landscapes and portraits.",
  footerText: "© 2025 SAURAV B. Photography. All rights reserved.",
  socials: [
    { name: "Works", href: "#works" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "mailto:contact@anviarc.com" }
  ]
};

/**
 * ------------------------------------------------------------------
 * FALLBACK DATA (Demo Mode)
 * ------------------------------------------------------------------
 */
const FALLBACK_IMAGES = [
  { url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop", description: "Mountain Peak at Dawn by Alex S." },
  { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop", description: "Misty Forest • Captured in Oregon" },
  { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000&auto=format&fit=crop", description: "Silence of Nature" },
  { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop", description: "The Long Road Home" },
  { url: "https://images.unsplash.com/photo-1501854140884-074bf86ee91c?q=80&w=1000&auto=format&fit=crop", description: "Morning Light" },
  { url: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1000&auto=format&fit=crop", description: "Deep Woods • 2024" },
  { url: "https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?q=80&w=1000&auto=format&fit=crop", description: "Winter Solstice" },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop", description: "Coastal Dreams" },
  { url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&auto=format&fit=crop", description: "Golden Hour" },
  { url: "https://images.unsplash.com/photo-1533201357341-8d79b10dd0f0?q=80&w=1000&auto=format&fit=crop", description: "Urban Reflections" },
  { url: "https://images.unsplash.com/photo-1552083831-71f085340317?q=80&w=1000&auto=format&fit=crop", description: "The Boatman" },
  { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop", description: "Starry Night" }
];

// --- UTILITIES ---

// Parse text file content into an array of objects { url, description }
const parseImageTextFile = (text) => {
  return text
    .split(/\r?\n/) // Handle both Windows and Unix newlines
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .map(line => {
      // Split by the first pipe symbol found
      const parts = line.split('|');
      const url = parts[0].trim().replace(/^\[|\]$/g, '');
      // Join the rest back together in case the description contains a pipe
      const description = parts.slice(1).join('|').trim();

      return {
        url,
        description: description || null // Return null if empty string
      };
    })
    .filter(item => item.url.startsWith('http')); // Basic validation
};

// SEO Manager Component
const MetaManager = memo(({ title, description }) => {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }

    // Set dynamic favicon
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><rect x=%222%22 y=%226%22 width=%2220%22 height=%2215%22 rx=%222%22 ry=%222%22></rect><circle cx=%2212%22 cy=%2213%22 r=%224%22></circle></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);

  }, [title, description]);

  return null;
});

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400">
          <AlertCircle size={48} className="mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong.</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-200 transition"
          >
            Refresh Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- COMPONENTS ---

const Header = memo(() => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <div
        className="flex items-center gap-3 group cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="button"
        tabIndex={0}
      >
        <div className="p-2 bg-white text-black rounded-lg group-hover:rotate-12 transition-transform duration-300">
          <Camera size={20} strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white select-none">
          {SITE_CONFIG.title.split(' ')[0]} <span className="text-neutral-500 font-light">{SITE_CONFIG.subtitle}</span>
        </h1>
      </div>
      <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-400">
        {SITE_CONFIG.socials.map((link) => (
          <a key={link.name} href={link.href} className="hover:text-white transition-colors focus:outline-none focus:text-white">
            {link.name}
          </a>
        ))}
      </nav>
      <button className="md:hidden text-white p-2">
        <div className="space-y-1.5">
          <span className="block w-6 h-0.5 bg-white"></span>
          <span className="block w-4 h-0.5 bg-white ml-auto"></span>
        </div>
      </button>
    </div>
  </header>
));

const Footer = memo(({ count, usingFallback }) => (
  <footer className="py-20 bg-neutral-900 border-t border-white/10 mt-20">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 mb-6 group hover:bg-white/10 transition-colors">
        <Camera className="text-neutral-400 group-hover:text-white transition-colors" size={24} />
      </div>
      <p className="text-neutral-500 text-sm mb-4">
        {usingFallback ? 'Viewing demo gallery.' : `Loaded ${count} photographs from external source.`}
      </p>
      <p className="text-neutral-600 text-xs uppercase tracking-widest">
        {SITE_CONFIG.footerText}
      </p>
    </div>
  </footer>
));

const ImageWithLoader = memo(({ data, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="relative mb-6 break-inside-avoid group cursor-zoom-in rounded-lg overflow-hidden bg-neutral-900"
      onClick={() => onClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(index); }}
    >
      {/* Skeleton / Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 animate-pulse z-10 min-h-[250px]">
          <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="flex flex-col items-center justify-center h-64 bg-neutral-900 border border-neutral-800 text-neutral-500">
          <ImageIcon size={32} className="mb-2 opacity-50" />
          <span className="text-xs">Failed to load</span>
        </div>
      )}

      {/* Actual Image */}
      {!hasError && (
        <img
          src={data.url}
          alt={data.description || `Gallery item ${index + 1}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full block object-cover transform transition-all duration-700 ease-in-out will-change-transform
            ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'}
            group-hover:scale-105 group-hover:brightness-110
          `}
        />
      )}

      {/* Overlay Details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white text-xs font-medium tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
          {data.description ? (
            <>
              <Info size={14} />
              <span className="truncate">{data.description}</span>
            </>
          ) : (
            'VIEW PHOTOGRAPH'
          )}
        </p>
      </div>
    </div>
  );
});

const Lightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentImage = images[currentIndex];

  const nextImage = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, nextImage, prevImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Controls */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className="absolute left-4 md:left-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 hidden md:block"
        aria-label="Previous image"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className="absolute right-4 md:right-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 hidden md:block"
        aria-label="Next image"
      >
        <ChevronRight size={32} />
      </button>

      {/* Loading Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Main Image Container */}
      <div
        className="relative w-full h-full p-4 pb-20 md:p-20 flex flex-col items-center justify-center select-none"
        onClick={onClose}
      >
        <img
          key={currentImage.url}
          src={currentImage.url}
          alt={currentImage.description || "Full screen view"}
          onLoad={() => setIsLoaded(true)}
          className={`max-w-full max-h-full object-contain shadow-2xl transition-all duration-500 
            ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Description / Caption */}
        {isLoaded && currentImage.description && (
          <div
            className="absolute bottom-16 md:bottom-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-[90vw] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm font-medium tracking-wide">
              {currentImage.description}
            </p>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
          {currentIndex + 1} / {images.length} • ESC TO CLOSE
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/images1.txt');
        if (!response.ok) throw new Error("Status " + response.status);
        const text = await response.text();
        const parsedImages = parseImageTextFile(text);
        if (parsedImages.length === 0) throw new Error("File empty");
        setImages(parsedImages);
        setUsingFallback(false);
      } catch (error) {
        console.warn("Falling back to demo data.", error);
        setImages(FALLBACK_IMAGES);
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      <MetaManager
        title={SITE_CONFIG.metaTitle}
        description={SITE_CONFIG.metaDescription}
      />

      <Header />

      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="mb-16 md:mb-24 space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            OPEN FOR SUBMISSIONS
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Capturing moments <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">
              suspended in time.
            </span>
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-lg">
            {SITE_CONFIG.description}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-neutral-700 animate-spin" />
          </div>
        ) : (
          <ErrorBoundary>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {images.map((imgData, index) => (
                <ImageWithLoader
                  key={`${imgData.url}-${index}`}
                  data={imgData}
                  index={index}
                  onClick={setLightboxIndex}
                />
              ))}
            </div>
          </ErrorBoundary>
        )}
      </main>

      <Footer count={images.length} usingFallback={usingFallback} />

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 p-3 bg-white text-black rounded-full shadow-lg transition-all duration-500 transform hover:scale-110 z-30 ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
};

export default App;