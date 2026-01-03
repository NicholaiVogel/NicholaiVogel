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
  { name: 'desktop', width: 1440, height: 900, label: 'DESKTOP' },
  { name: 'tablet', width: 834, height: 1112, label: 'TABLET' },
  { name: 'mobile', width: 390, height: 844, label: 'MOBILE' },
];

const MIN_BOOT_MS = 850;
const IFRAME_TIMEOUT_MS = 4500;

const BOOT_LOG_LINES = [
  'INIT: FRAMEBUFFER',
  'UPLINK: ESTABLISHING',
  'AUTH: INPUT_LOCKED',
  'SIGNAL: STABLE',
];

const DevEngageModal: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewport, setViewport] = useState<ViewportPreset>(VIEWPORT_PRESETS[0]);
  const [scale, setScale] = useState(1);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogIndex, setBootLogIndex] = useState(0);
  const [disarmToast, setDisarmToast] = useState(false);

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
    const stagePadding = 80;
    const availableW = stage.width - stagePadding;
    const availableH = stage.height - stagePadding;
    const scaleX = availableW / viewport.width;
    const scaleY = availableH / viewport.height;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [viewport]);

  const openModal = useCallback((project: Project, triggerElement?: HTMLElement) => {
    if (triggerElement) {
      triggerRef.current = triggerElement;
    }
    setActiveProject(project);
    setModalState('booting');
    setBootProgress(0);
    setBootLogIndex(0);
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

    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }

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
    if (modalState === 'observe') {
      setModalState('armed');
    } else if (modalState === 'armed') {
      setModalState('observe');
    }
  }, [modalState]);

  const handleIframeLoad = useCallback(() => {
    iframeLoadedRef.current = true;
  }, []);

  const handleRetry = useCallback(() => {
    if (!activeProject) return;
    setModalState('booting');
    setBootProgress(0);
    setBootLogIndex(0);
    iframeLoadedRef.current = false;
    bootStartRef.current = performance.now();
    if (iframeRef.current) {
      iframeRef.current.src = activeProject.link;
    }
  }, [activeProject]);

  const handleCopyLink = useCallback(async () => {
    if (!activeProject) return;
    try {
      await navigator.clipboard.writeText(activeProject.link);
    } catch {
      const input = document.createElement('input');
      input.value = activeProject.link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  }, [activeProject]);

  useEffect(() => {
    const handleEngageEvent = (e: CustomEvent<{ project: Project; trigger?: HTMLElement }>) => {
      openModal(e.detail.project, e.detail.trigger);
    };

    window.addEventListener('dev:engage' as any, handleEngageEvent);
    return () => {
      window.removeEventListener('dev:engage' as any, handleEngageEvent);
    };
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
      setBootProgress(p => Math.min(p + 2, 100));
    }, 15);

    const logInterval = setInterval(() => {
      setBootLogIndex(i => Math.min(i + 1, BOOT_LOG_LINES.length));
    }, 180);

    const checkBootCompletion = () => {
      const elapsed = performance.now() - bootStartRef.current;
      const minBootMet = elapsed >= MIN_BOOT_MS;
      const loaded = iframeLoadedRef.current;

      if (minBootMet && loaded) {
        setModalState('observe');
      } else if (minBootMet && elapsed >= IFRAME_TIMEOUT_MS) {
        setModalState('blocked');
      } else {
        timeoutRef.current = window.setTimeout(checkBootCompletion, 100);
      }
    };

    timeoutRef.current = window.setTimeout(checkBootCompletion, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [modalState]);

  useEffect(() => {
    if (modalState === 'closed') return;
    calculateScale();

    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [modalState, viewport, calculateScale]);

  if (modalState === 'closed' || !activeProject) return null;

  const isInteractive = modalState === 'armed';
  const showIframe = modalState !== 'booting';

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex"
      role="dialog"
      aria-modal="true"
      aria-label={`Live preview of ${activeProject.title}`}
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-sm" />

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,112,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(var(--theme-grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--theme-grid-line)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />

      <div className="relative z-10 flex flex-col w-full h-full p-4 lg:p-8">
        
        <header className="flex items-center justify-between pb-4 border-b border-brand-accent/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${modalState === 'armed' ? 'bg-green-500' : 'bg-brand-accent'} ${modalState === 'blocked' ? 'bg-red-500' : ''} animate-pulse`} />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-accent">
                SYS.DEV /// LIVE_FEED
              </span>
            </div>
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              PRJ.0{activeProject.order} / {activeProject.category}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.2em]">
              <span className="text-[var(--theme-text-muted)]">
                MODE: <span className={modalState === 'armed' ? 'text-green-500' : 'text-brand-accent'}>
                  {modalState === 'booting' ? 'BOOT' : modalState === 'blocked' ? 'ERROR' : modalState.toUpperCase()}
                </span>
              </span>
              <span className="text-[var(--theme-text-muted)]">
                INPUT: <span className={isInteractive ? 'text-green-500' : 'text-brand-accent'}>
                  {isInteractive ? 'ARMED' : 'LOCKED'}
                </span>
              </span>
            </div>

            <button
              onClick={closeModal}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--theme-border-primary)] hover:border-brand-accent hover:bg-brand-accent/5 transition-all font-mono text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] hover:text-brand-accent"
            >
              <span className="hidden sm:inline">DISCONNECT</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 flex gap-6 pt-4 overflow-hidden">
          
          <div ref={stageRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
            
            <div
              className="relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] overflow-hidden transition-all duration-300"
              style={{
                width: viewport.width,
                height: viewport.height,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-brand-accent" />
              <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-brand-accent" />
              <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-brand-accent" />
              <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-brand-accent" />

              <iframe
                ref={iframeRef}
                src={activeProject.link}
                title={`Live preview of ${activeProject.title}`}
                className={`w-full h-full border-none bg-white transition-opacity duration-500 ${showIframe ? 'opacity-100' : 'opacity-0'}`}
                style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
                onLoad={handleIframeLoad}
              />

              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,112,0.06))] bg-[length:100%_2px,3px_100%] opacity-10" />

              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

              {modalState === 'booting' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-dark/95">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent animate-scan-sweep" />
                  </div>

                  <div className="text-center">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-accent mb-6">
                      ESTABLISHING_UPLINK
                    </div>

                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] space-y-1 mb-8">
                      {BOOT_LOG_LINES.slice(0, bootLogIndex).map((line, i) => (
                        <div key={i} className="flex items-center gap-2 justify-center">
                          <span className="text-brand-accent">{'>'}</span>
                          <span>{line}</span>
                          <span className="text-green-500">OK</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-48 h-1 bg-[var(--theme-border-primary)] mx-auto overflow-hidden">
                      <div
                        className="h-full bg-brand-accent transition-all duration-100"
                        style={{ width: `${bootProgress}%` }}
                      />
                    </div>
                    <div className="font-mono text-[9px] text-brand-accent mt-2">
                      {bootProgress}%
                    </div>
                  </div>
                </div>
              )}

              {modalState === 'blocked' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-dark/90 backdrop-blur-sm">
                  <div className="text-center p-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-500 mb-4 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-red-500 animate-pulse" />
                      SYS.FEED_ERROR: FRAME_DENIED
                    </div>
                    <p className="font-mono text-xs text-[var(--theme-text-muted)] mb-8 max-w-xs">
                      This site does not allow embedding. Use the controls below to access externally.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={activeProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-brand-accent text-brand-dark font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent/90 transition-colors"
                      >
                        OPEN_EXTERNALLY
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="px-6 py-3 border border-[var(--theme-border-primary)] font-mono text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent transition-all"
                      >
                        COPY_LINK
                      </button>
                      <button
                        onClick={handleRetry}
                        className="px-6 py-3 border border-[var(--theme-border-primary)] font-mono text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent transition-all"
                      >
                        RETRY
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalState === 'observe' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="px-4 py-2 bg-brand-dark/80 border border-brand-accent/30 backdrop-blur-sm font-mono text-[9px] uppercase tracking-widest text-brand-accent">
                    ARM_CONTROLS_TO_INTERACT
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] flex items-center gap-4">
              <span>VIEWPORT: <span className="text-brand-accent">{viewport.label}</span></span>
              <span>RES: <span className="text-brand-accent">{viewport.width}x{viewport.height}</span></span>
              <span>SCALE: <span className="text-brand-accent">{(scale * 100).toFixed(0)}%</span></span>
            </div>
          </div>

          <aside className="hidden lg:flex flex-col w-72 gap-6">
            
            <div className="p-6 border border-[var(--theme-border-primary)] bg-[var(--theme-bg-secondary)]">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                /// INTERACTION_CONTROL
              </div>
              <button
                onClick={toggleArm}
                disabled={modalState === 'booting' || modalState === 'blocked'}
                className={`w-full py-4 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 border ${
                  isInteractive
                    ? 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30'
                    : 'bg-brand-accent/10 border-brand-accent/50 text-brand-accent hover:bg-brand-accent/20 hover:border-brand-accent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isInteractive ? 'DISARM_CONTROLS' : 'ARM_CONTROLS'}
              </button>
              <p className="font-mono text-[8px] text-[var(--theme-text-subtle)] mt-3 leading-relaxed">
                {isInteractive
                  ? 'Controls are armed. You can now interact with the live feed. Press [A] or click to disarm.'
                  : 'Arm controls to enable mouse/keyboard interaction within the live feed. Press [A] to toggle.'}
              </p>
            </div>

            <div className="p-6 border border-[var(--theme-border-primary)] bg-[var(--theme-bg-secondary)]">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                /// VIEWPORT_PRESETS
              </div>
              <div className="flex flex-col gap-2">
                {VIEWPORT_PRESETS.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => setViewport(preset)}
                    className={`flex items-center justify-between px-4 py-3 border transition-all font-mono text-[10px] uppercase tracking-widest ${
                      viewport.name === preset.name
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                        : 'border-[var(--theme-border-primary)] text-[var(--theme-text-muted)] hover:border-brand-accent/50 hover:text-[var(--theme-text-secondary)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-brand-accent/50">[{i + 1}]</span>
                      {preset.label}
                    </span>
                    <span className="text-[8px]">{preset.width}x{preset.height}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border border-[var(--theme-border-primary)] bg-[var(--theme-bg-secondary)]">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                /// ACTIONS
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={activeProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 border border-[var(--theme-border-primary)] font-mono text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/5 transition-all"
                >
                  OPEN_EXTERNALLY
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
                <button
                  onClick={() => {
                    if (iframeRef.current && activeProject) {
                      iframeRef.current.src = activeProject.link;
                    }
                  }}
                  className="flex items-center justify-between px-4 py-3 border border-[var(--theme-border-primary)] font-mono text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/5 transition-all"
                >
                  RELOAD_FEED
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                    <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16" />
                  </svg>
                </button>
              </div>
            </div>

            {activeProject.tags && activeProject.tags.length > 0 && (
              <div className="p-6 border border-[var(--theme-border-primary)] bg-[var(--theme-bg-secondary)]">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-4">
                  /// STACK_MANIFEST
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-[9px] font-mono uppercase bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-primary)] text-[var(--theme-text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </main>

        <footer className="pt-4 mt-4 border-t border-brand-accent/20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tighter text-[var(--theme-text-primary)] leading-[0.9]">
                {activeProject.title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-brand-accent">
                  {activeProject.title.split(' ').slice(-1)}
                </span>
              </h2>
              <p className="text-[var(--theme-text-secondary)] text-sm mt-2 max-w-xl border-l border-brand-accent/30 pl-4">
                {activeProject.description}
              </p>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] text-right">
              <div>UPLINK: <span className="text-brand-accent">CONNECTED</span></div>
              <div>LATENCY: <span className="text-brand-accent">REAL-TIME</span></div>
            </div>
          </div>
        </footer>
      </div>

      {disarmToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 bg-brand-dark border border-brand-accent font-mono text-[10px] uppercase tracking-widest text-brand-accent animate-pulse">
          DISARM_TO_EXIT
        </div>
      )}
    </div>
  );
};

export default DevEngageModal;
