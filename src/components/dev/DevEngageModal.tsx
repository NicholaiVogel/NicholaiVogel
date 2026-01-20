import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Project {
  title: string;
  description: string;
  link: string;
  category: string;
  tags?: string[];
  order: number;
}

type ModalState = 'closed' | 'booting' | 'observe' | 'armed' | 'blocked';

interface ViewportPreset {
  name: string;
  width: number;
  height: number;
  label: string;
}

const VIEWPORT_PRESETS: ViewportPreset[] = [
  { name: 'desktop', width: 1440, height: 900, label: 'Desktop' },
  { name: 'tablet', width: 834, height: 1112, label: 'Tablet' },
  { name: 'mobile', width: 390, height: 844, label: 'Mobile' },
];

const MIN_BOOT_MS = 600;
const IFRAME_TIMEOUT_MS = 4500;

const DevEngageModal: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewport, setViewport] = useState<ViewportPreset>(VIEWPORT_PRESETS[0]);
  const [scale, setScale] = useState(1);
  const [bootProgress, setBootProgress] = useState(0);
  const [disarmToast, setDisarmToast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const bootStartRef = useRef<number>(0);
  const iframeLoadedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const lockBodyScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
  }, []);

  const unlockBodyScroll = useCallback(() => {
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
  }, []);

  const calculateScale = useCallback(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current.getBoundingClientRect();
    const padding = 96;
    const availableW = stage.width - padding;
    const availableH = stage.height - padding;
    const scaleX = availableW / viewport.width;
    const scaleY = availableH / viewport.height;
    const fitScale = Math.min(scaleX, scaleY);
    setScale(Math.max(0.25, Math.min(fitScale, 1)));
  }, [viewport]);

  const openModal = useCallback((project: Project, triggerElement?: HTMLElement) => {
    if (triggerElement) triggerRef.current = triggerElement;
    setActiveProject(project);
    setModalState('booting');
    setBootProgress(0);
    iframeLoadedRef.current = false;
    bootStartRef.current = performance.now();
    lockBodyScroll();
  }, [lockBodyScroll]);

  const closeModal = useCallback(() => {
    setModalState('closed');
    setActiveProject(null);
    setDisarmToast(false);
    unlockBodyScroll();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (iframeRef.current) iframeRef.current.src = 'about:blank';
    if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [unlockBodyScroll]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (modalState === 'armed') {
        setDisarmToast(true);
        setTimeout(() => setDisarmToast(false), 1500);
      } else if (modalState === 'observe' || modalState === 'blocked') {
        closeModal();
      }
    }
  }, [modalState, closeModal]);

  const toggleArm = useCallback(() => {
    if (modalState === 'observe') setModalState('armed');
    else if (modalState === 'armed') setModalState('observe');
  }, [modalState]);

  const handleIframeLoad = useCallback(() => {
    iframeLoadedRef.current = true;
  }, []);

  const handleRetry = useCallback(() => {
    if (!activeProject) return;
    setModalState('booting');
    setBootProgress(0);
    iframeLoadedRef.current = false;
    bootStartRef.current = performance.now();
    if (iframeRef.current) iframeRef.current.src = activeProject.link;
  }, [activeProject]);

  useEffect(() => {
    const handleEngageEvent = (e: CustomEvent<{ project: Project; trigger?: HTMLElement }>) => {
      openModal(e.detail.project, e.detail.trigger);
    };
    window.addEventListener('dev:engage' as any, handleEngageEvent);
    return () => window.removeEventListener('dev:engage' as any, handleEngageEvent);
  }, [openModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalState === 'closed') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
      if (modalState === 'observe' || modalState === 'armed') {
        if (e.key === '1') setViewport(VIEWPORT_PRESETS[0]);
        if (e.key === '2') setViewport(VIEWPORT_PRESETS[1]);
        if (e.key === '3') setViewport(VIEWPORT_PRESETS[2]);
        if (e.key === 'a' || e.key === 'A') toggleArm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState, closeModal, toggleArm]);

  useEffect(() => {
    if (modalState !== 'booting') return;
    const progressInterval = setInterval(() => {
      setBootProgress(p => Math.min(p + 3, 100));
    }, 15);
    const checkBootCompletion = () => {
      const elapsed = performance.now() - bootStartRef.current;
      const minBootMet = elapsed >= MIN_BOOT_MS;
      const loaded = iframeLoadedRef.current;
      if (minBootMet && loaded) setModalState('observe');
      else if (minBootMet && elapsed >= IFRAME_TIMEOUT_MS) setModalState('blocked');
      else timeoutRef.current = window.setTimeout(checkBootCompletion, 100);
    };
    timeoutRef.current = window.setTimeout(checkBootCompletion, 100);
    return () => {
      clearInterval(progressInterval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [modalState]);

  useEffect(() => {
    if (modalState === 'closed') return;
    calculateScale();
    const timer = setTimeout(calculateScale, 50);
    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [modalState, viewport, calculateScale]);

  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme !== 'light');
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    return () => observer.disconnect();
  }, []);

  if (modalState === 'closed' || !activeProject) return null;

  const isInteractive = modalState === 'armed';
  const showIframe = modalState !== 'booting';

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex"
      style={{ backgroundColor: isDarkMode ? '#0a0a0a' : '#fafafa' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Live preview of ${activeProject.title}`}
      onClick={handleBackdropClick}
    >
      {/* Close button - positioned in preview area, not over sidebar */}
      <button
        onClick={closeModal}
        className={`absolute top-4 right-4 lg:right-[424px] z-50 flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 ${
          isDarkMode
            ? 'bg-neutral-900 border-white/10 text-neutral-400 hover:bg-neutral-800 hover:text-white hover:border-white/20'
            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300'
        }`}
        aria-label="Close preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Main layout */}
      <div className="flex w-full h-full overflow-hidden">

        {/* Preview area - takes most of the space, with left margin for site nav */}
        <div ref={stageRef} className="flex-1 relative flex items-center justify-center p-6 lg:p-8 ml-16 lg:ml-20">

          {/* Iframe container */}
          <div
            className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${isDarkMode ? 'shadow-black/60' : 'shadow-black/20'}`}
            style={{
              width: viewport.width,
              height: viewport.height,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <iframe
              ref={iframeRef}
              src={activeProject.link}
              title={`Live preview of ${activeProject.title}`}
              className={`w-full h-full border-none bg-white transition-opacity duration-300 ${showIframe ? 'opacity-100' : 'opacity-0'}`}
              style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
              onLoad={handleIframeLoad}
            />

            {/* Loading state */}
            {modalState === 'booting' && (
              <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                <div className="w-10 h-10 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mb-4" />
                <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Loading...</p>
                <div className={`w-24 h-1 rounded-full mt-3 overflow-hidden ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-300'}`}>
                  <div className="h-full bg-brand-accent rounded-full transition-all" style={{ width: `${bootProgress}%` }} />
                </div>
              </div>
            )}

            {/* Blocked state */}
            {modalState === 'blocked' && (
              <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-8 ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Preview blocked</h3>
                <p className={`text-sm text-center mb-6 max-w-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  This site doesn't allow embedding.
                </p>
                <div className="flex gap-3">
                  <a
                    href={activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-brand-accent text-white text-sm font-medium rounded-full hover:bg-brand-accent/90 transition-colors"
                  >
                    Open externally
                  </a>
                  <button
                    onClick={handleRetry}
                    className={`px-5 py-2.5 text-sm rounded-full border transition-all ${isDarkMode ? 'border-white/20 text-neutral-300 hover:bg-white/5' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'}`}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Observe mode hint - outside scaled container */}
          {modalState === 'observe' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div style={{ backgroundColor: 'var(--color-brand-accent)', color: '#ffffff', padding: '20px 36px', borderRadius: '9999px', fontSize: '16px', fontWeight: 600 }}>
                {typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'Press A to interact' : 'Tap below to interact'}
              </div>
            </div>
          )}

          {/* Viewport info - bottom center */}
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full text-xs ${isDarkMode ? 'bg-neutral-900/80 text-neutral-400' : 'bg-white/80 text-neutral-600'} backdrop-blur-sm`}>
            <span className="font-medium">{viewport.label}</span>
            <span className={isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}>·</span>
            <span>{viewport.width}×{viewport.height}</span>
            <span className={isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}>·</span>
            <span>{(scale * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Sidebar - clean, minimal, fixed width */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 border-l p-6 gap-6 overflow-y-auto ${isDarkMode ? 'bg-neutral-900/50 border-white/5' : 'bg-white/50 border-neutral-200'}`}
          style={{ width: '400px', minWidth: '400px', maxWidth: '400px' }}
        >

          {/* Project info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-brand-accent/10 text-xs text-brand-accent">
                {activeProject.category}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${modalState === 'armed' ? 'bg-emerald-400' : 'bg-brand-accent'} ${modalState !== 'blocked' ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
              {activeProject.title}
            </h2>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {activeProject.description}
            </p>
          </div>

          {/* Divider */}
          <div className={`h-px ${isDarkMode ? 'bg-white/5' : 'bg-neutral-200'}`} />

          {/* Viewport selector */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Viewport</h3>
            <div className="flex gap-2">
              {VIEWPORT_PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => setViewport(preset)}
                  className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                    viewport.name === preset.name
                      ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/50'
                      : isDarkMode
                        ? 'bg-white/10 text-neutral-300 border-white/15 hover:bg-white/20 hover:text-white hover:border-white/30'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interaction toggle */}
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Controls</h3>
            <button
              onClick={toggleArm}
              disabled={modalState === 'booting' || modalState === 'blocked'}
              className={`w-full py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                isInteractive
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/70'
                  : 'bg-brand-accent/20 border-brand-accent/50 text-brand-accent hover:bg-brand-accent/30 hover:border-brand-accent/70'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isInteractive ? 'Disable interaction' : 'Enable interaction'}
            </button>
          </div>

          {/* Stack tags */}
          {activeProject.tags && activeProject.tags.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Stack</h3>
              <div className="flex flex-wrap gap-2">
                {activeProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-1 text-xs rounded-full ${isDarkMode ? 'bg-white/10 text-neutral-300 border border-white/10' : 'bg-neutral-100 text-neutral-600'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions at bottom */}
          <div className="flex flex-col gap-2">
            <a
              href={activeProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-full border transition-all duration-200 ${
                isDarkMode
                  ? 'bg-white/10 border-white/20 text-neutral-200 hover:bg-white/20 hover:border-white/35 hover:text-white'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
              }`}
            >
              <span>Open in new tab</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </div>
        </aside>
      </div>

      {/* Mobile controls - bottom sheet style */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 border-t ${isDarkMode ? 'bg-neutral-900 border-white/10' : 'bg-white border-neutral-200'}`}>
        <div className="flex items-center gap-3">
          {/* Viewport buttons */}
          <div className="flex gap-1.5">
            {VIEWPORT_PRESETS.map((preset, i) => (
              <button
                key={preset.name}
                onClick={() => setViewport(preset)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  viewport.name === preset.name
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : isDarkMode
                      ? 'bg-white/5 text-neutral-400'
                      : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {preset.label.charAt(0)}
              </button>
            ))}
          </div>

          {/* Arm button */}
          <button
            onClick={toggleArm}
            disabled={modalState === 'booting' || modalState === 'blocked'}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              isInteractive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-brand-accent/10 text-brand-accent'
            } disabled:opacity-40`}
          >
            {isInteractive ? 'Disarm' : 'Arm'}
          </button>

          {/* External link */}
          <a
            href={activeProject.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${isDarkMode ? 'bg-white/5 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Disarm toast */}
      {disarmToast && (
        <div className={`fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2 rounded-full shadow-lg ${isDarkMode ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-900 text-white'}`}>
          <p className="text-sm">Disarm to close</p>
        </div>
      )}
    </div>
  );
};

export default DevEngageModal;
