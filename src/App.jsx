import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code,
  Database,
  Download,
  ExternalLink,
  Factory,
  Github,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Play,
  Quote,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
} from 'lucide-react';
import { contactLinks, contentByLanguage, githubLinks, portfolioAssets } from './content.js';

const LANGUAGE_KEY = 'robert-web-language';
const DISPLAY_NAME = 'Juan Roberto García Gómez';
const SLIDE_MS = 6000;
const EASE = [0.22, 1, 0.36, 1];
const supportIcons = [Factory, Code, Database, ClipboardCheck];

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

function Reveal({ children, className, delay = 0, id }) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function LanguageSwitch({ label, language, onChange }) {
  return (
    <div className="language-switch" aria-label={label} role="group">
      {['en', 'es'].map((code) => (
        <button
          key={code}
          type="button"
          className={language === code ? 'is-active' : ''}
          aria-pressed={language === code}
          onClick={() => onChange(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Rotates through phrases in place; every phrase shares one grid cell so the line never jumps. */
function RotatingWords({ words, interval = 2800 }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return undefined;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduce, words, interval]);

  const active = index % words.length;

  return (
    <span className="rotator">
      <span className="sr-only">{words.join(', ')}</span>
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="rotator-word"
          aria-hidden="true"
          initial={false}
          animate={
            i === active
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: i < active ? -22 : 22, filter: 'blur(6px)' }
          }
          transition={{ duration: 0.55, ease: EASE }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/** Counts numeric values up once they scroll into view; anything else renders as-is. */
function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const animatable = Boolean(match) && !value.includes('/') && Number(match[1]) > 1;
  const [display, setDisplay] = useState(animatable && !reduce ? `0${match[2]}` : value);

  useEffect(() => {
    if (!animatable || reduce) {
      setDisplay(value);
      return undefined;
    }
    if (!inView) {
      setDisplay(`0${match[2]}`);
      return undefined;
    }
    const target = Number(match[1]);
    const decimals = (match[1].split('.')[1] || '').length;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (latest) => setDisplay(`${latest.toFixed(decimals)}${match[2]}`),
    });
    return () => controls.stop();
    // match is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, animatable, reduce]);

  return <span ref={ref}>{display}</span>;
}

/**
 * Screens of one project: crossfading slides (images or a video) with tabs that
 * auto-advance while the viewer is on screen. Hover or a manual pick stops the timer.
 */
function MediaViewer({ slides, tone, label, onZoom, zoomLabel, soundOnLabel, soundOffLabel }) {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPicked, setUserPicked] = useState(false);
  const [muted, setMuted] = useState(true);

  const slide = slides[index] ?? slides[0];
  const isVideo = slide.type === 'video';
  const running = !reduce && inView && !hovered && !userPicked && !isVideo;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [running, index, slides.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (isVideo && inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVideo, inView, muted]);

  function pick(i) {
    setUserPicked(true);
    setIndex(i);
    const video = videoRef.current;
    if (video && slides[i].type === 'video') {
      video.currentTime = 0;
    }
  }

  function handleVideoEnd() {
    const video = videoRef.current;
    if (userPicked && video) {
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div
      ref={rootRef}
      className="viewer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`viewer-stage tone-${tone}`}>
        {slides.map((item, i) => {
          const active = i === index;
          const slideClass = ['viewer-slide', `fit-${item.fit ?? 'cover'}`, active ? 'is-active' : '']
            .filter(Boolean)
            .join(' ');

          if (item.type === 'video') {
            return (
              <div key={item.src} className={slideClass} aria-hidden={!active}>
                <video
                  ref={videoRef}
                  src={item.src}
                  poster={item.poster}
                  muted
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnd}
                  aria-label={item.alt}
                />
                <button
                  type="button"
                  className="viewer-sound"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setMuted((value) => !value)}
                  aria-label={muted ? soundOnLabel : soundOffLabel}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.src}
              type="button"
              className={`${slideClass} media-button`}
              tabIndex={active ? 0 : -1}
              aria-hidden={!active}
              onClick={() => onZoom({ src: item.src, alt: item.alt })}
              aria-label={`${zoomLabel}: ${item.alt}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              <span className="media-zoom-indicator" aria-hidden="true">
                <ZoomIn size={18} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="viewer-tabs" role="tablist" aria-label={label}>
        {slides.map((item, i) => {
          const active = i === index;
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? 'is-active' : ''}
              onClick={() => pick(i)}
            >
              <span className="viewer-tab-label">
                {item.type === 'video' ? <Play size={12} aria-hidden="true" /> : null}
                {item.label}
              </span>
              <span className="viewer-tab-progress" aria-hidden="true">
                <span
                  key={`${index}-${running}`}
                  className={active && running ? 'is-running' : ''}
                  style={{ animationDuration: `${SLIDE_MS}ms` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectShowcase({ item, labels, reverse, onZoom, zoomLabel, soundOnLabel, soundOffLabel }) {
  return (
    <Reveal className={['project', reverse ? 'is-reverse' : ''].filter(Boolean).join(' ')} id={item.id}>
      <div className="project-media">
        <MediaViewer
          slides={item.slides}
          tone={item.tone}
          label={`${labels.viewerLabel}: ${item.title}`}
          onZoom={onZoom}
          zoomLabel={zoomLabel}
          soundOnLabel={soundOnLabel}
          soundOffLabel={soundOffLabel}
        />
      </div>

      <div className="project-body">
        <p className="project-kicker">
          <span className="live-dot" aria-hidden="true" />
          {item.kicker}
        </p>
        <h3 className="project-title">{item.title}</h3>
        <p className="project-tagline">{item.tagline}</p>
        <p className="project-description">{item.description}</p>

        {item.quote ? (
          <figure className="project-quote">
            <Quote size={20} aria-hidden="true" />
            <blockquote>{item.quote}</blockquote>
            <figcaption>{item.quoteSource}</figcaption>
          </figure>
        ) : null}

        <dl className="project-metrics">
          {item.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                <CountUp value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="project-points">
          <h4>{labels.builtLabel}</h4>
          <ul>
            {item.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <p className="project-tech">
          <span>{labels.stackLabel}</span>
          {item.tech}
        </p>

        <div className="project-actions">
          <a className="button button-primary" href={item.primary.href} target="_blank" rel="noreferrer">
            {item.primary.label}
            <ArrowUpRight size={18} />
          </a>
          {item.secondary.map((link) => (
            <a key={link.href} className="button button-ghost" href={link.href} target="_blank" rel="noreferrer">
              {link.icon === 'github' ? <Github size={17} /> : <ExternalLink size={16} />}
              {link.label}
            </a>
          ))}
        </div>
        {item.note ? <p className="project-note">{item.note}</p> : null}
      </div>
    </Reveal>
  );
}

/** Uniform 16:10 stage around every system screenshot (phone shots letterboxed in 4:5). */
function ScreenFrame({ src, alt, onZoom, zoomLabel, className }) {
  return (
    <div className={['browser-frame', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="browser-stage media-button"
        onClick={() => onZoom({ src, alt })}
        aria-label={`${zoomLabel}: ${alt}`}
      >
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        <span className="media-zoom-indicator" aria-hidden="true">
          <ZoomIn size={18} />
        </span>
      </button>
    </div>
  );
}

function SystemCard({ item, onZoom, zoomLabel, frameVariant }) {
  return (
    <article className="system-card">
      <ScreenFrame
        className={frameVariant === 'phone' ? 'phone-frame' : undefined}
        src={item.image}
        alt={item.alt}
        onZoom={onZoom}
        zoomLabel={zoomLabel}
      />
      <div className="system-copy">
        <span className="system-kicker">{item.subtitle}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  );
}

function Carousel({ items, labels, onZoom, zoomLabel, frameVariant }) {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      setEdges({ start: track.scrollLeft <= 4, end: track.scrollLeft >= max - 4 });
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items]);

  function scrollCarousel(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.82, behavior: 'smooth' });
  }

  return (
    <div className="carousel-block">
      <div className="carousel-toolbar">
        <span className="carousel-meta">
          {items.length} {labels.screensLabel} · {labels.hint}
        </span>
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-button"
            aria-label={labels.previousLabel}
            disabled={edges.start}
            onClick={() => scrollCarousel(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="carousel-button"
            aria-label={labels.nextLabel}
            disabled={edges.end}
            onClick={() => scrollCarousel(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={trackRef} className={`carousel-track${frameVariant === 'phone' ? ' is-phone' : ''}`}>
        {items.map((item, index) => (
          <SystemCard
            key={`${item.title}-${index}`}
            item={item}
            onZoom={onZoom}
            zoomLabel={zoomLabel}
            frameVariant={frameVariant}
          />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ featured, onZoom, zoomLabel }) {
  return (
    <div className="featured-card">
      <ScreenFrame
        className="featured-frame"
        src={featured.image}
        alt={featured.alt}
        onZoom={onZoom}
        zoomLabel={zoomLabel}
      />
      <div className="featured-copy">
        <span className="system-kicker">{featured.subtitle}</span>
        <h3>{featured.title}</h3>
        <p>{featured.text}</p>
        <dl className="feature-metrics">
          {featured.metrics.map((metric) => (
            <div key={metric.label} className="feature-metric">
              <dt>{metric.label}</dt>
              <dd>
                <CountUp value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function SystemsTabs({ content, onZoom }) {
  const tabs = [
    { key: 'mes', data: content.mes, featured: content.mes.featured },
    { key: 'kiosk', data: content.kiosk },
    { key: 'erp', data: content.erp },
    { key: 'scanner', data: content.scanner, frameVariant: 'phone' },
    { key: 'analytics', data: content.analytics },
  ];
  const [active, setActive] = useState('mes');
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];
  const labels = {
    screensLabel: content.systems.screensLabel,
    hint: content.systems.hint,
    previousLabel: content.previousLabel,
    nextLabel: content.nextLabel,
  };

  return (
    <div className="systems">
      <div className="systems-tabs" role="tablist" aria-label={content.systems.title}>
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`systems-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls="systems-panel"
              className={selected ? 'is-active' : ''}
              onClick={() => setActive(tab.key)}
            >
              {content.systems.tabs[tab.key]}
              <span className="systems-tab-count">{tab.data.gallery.length}</span>
              {selected ? <motion.span layoutId="systems-underline" className="systems-underline" /> : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.key}
          id="systems-panel"
          role="tabpanel"
          aria-labelledby={`systems-tab-${current.key}`}
          className="systems-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32, ease: EASE }}
        >
          <div className="systems-panel-head">
            <span className="system-kicker">{current.data.eyebrow}</span>
            <h3>{current.data.title}</h3>
            <p>{current.data.description}</p>
          </div>

          {current.featured ? (
            <FeaturedCard featured={current.featured} onZoom={onZoom} zoomLabel={content.imageZoomLabel} />
          ) : null}

          <Carousel
            items={current.data.gallery}
            labels={labels}
            onZoom={onZoom}
            zoomLabel={content.imageZoomLabel}
            frameVariant={current.frameVariant}
          />

          {current.data.footnote ? <p className="systems-footnote">{current.data.footnote}</p> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Timeline({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  return (
    <div ref={ref} className="timeline">
      <div className="timeline-track" aria-hidden="true">
        <motion.div className="timeline-progress" style={{ scaleY }} />
      </div>
      {items.map((item, index) => (
        <Reveal key={item.company} className="timeline-item" delay={index * 0.06}>
          <div className="timeline-marker" aria-hidden="true">
            <BriefcaseBusiness size={18} />
          </div>
          <div className="timeline-card">
            <p className="timeline-meta">
              <span className="timeline-period">{item.period}</span>
              {item.location ? (
                <span className="timeline-place">
                  <MapPin size={14} aria-hidden="true" />
                  {item.location}
                </span>
              ) : null}
            </p>
            <h3>{item.company}</h3>
            <p className="timeline-role">{item.role}</p>
            <p className="timeline-summary">{item.summary}</p>
            <ul className="timeline-points">
              {item.bullets.map((bullet) => (
                <li key={bullet}>
                  <BadgeCheck size={16} aria-hidden="true" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function ImageCard({ item, onZoom, zoomLabel, linkLabel, linkUrl, linkIcon }) {
  return (
    <>
      <button
        type="button"
        className="recognition-media media-button"
        onClick={() => onZoom({ src: item.image, alt: item.alt })}
        aria-label={`${zoomLabel}: ${item.alt}`}
      >
        <img src={item.image} alt={item.alt} loading="lazy" decoding="async" />
        <span className="media-zoom-indicator" aria-hidden="true">
          <ZoomIn size={18} />
        </span>
      </button>
      <div className="recognition-copy">
        <span>{item.kicker}</span>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
        {linkUrl ? (
          <a className="showcase-link" href={linkUrl} target="_blank" rel="noreferrer">
            {linkIcon}
            {linkLabel}
          </a>
        ) : null}
      </div>
    </>
  );
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [activeSection, setActiveSection] = useState('#projects');
  const reduce = useReducedMotion();
  const content = contentByLanguage[language];
  const cvHref = portfolioAssets.cv[language];
  const cvFileName = `Juan-Roberto-Garcia-Gomez-CV-${language.toUpperCase()}.pdf`;

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // Storage can be blocked; the language still applies for this visit.
    }
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!zoomedImage) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setZoomedImage(null);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage]);

  useEffect(() => {
    const navigationTargets = content.navigation
      .map((item) => {
        const element = document.querySelector(item.href);
        return element ? { href: item.href, element } : null;
      })
      .filter(Boolean);

    if (!navigationTargets.length) {
      return undefined;
    }

    let frameId = null;

    const updateActiveSection = () => {
      const marker = window.scrollY + window.innerHeight * 0.35;
      let nextActive = null;
      navigationTargets.forEach((target) => {
        const top = target.element.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) {
          nextActive = target.href;
        }
      });
      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (reachedBottom) {
        nextActive = navigationTargets[navigationTargets.length - 1].href;
      }
      setActiveSection((current) => (current === nextActive ? current : nextActive));
    };

    const requestUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateActiveSection();
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [language, content.navigation]);

  const heroItem = (delay) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell">
        <ScrollProgress />
        <div className="page-glow page-glow-left" />
        <div className="page-glow page-glow-right" />

        <header className="topbar">
          <div className="topbar-inner">
            <a className="brand" href="#home">
              <span className="brand-mark" aria-hidden="true">JR</span>
              <span className="brand-copy">
                <strong>{DISPLAY_NAME}</strong>
                <small>{content.brandRole}</small>
              </span>
            </a>

            <nav className="topnav">
              {content.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={activeSection === item.href ? 'is-active' : ''}
                  aria-current={activeSection === item.href ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="topbar-actions">
              <LanguageSwitch
                label={content.languageSwitchLabel}
                language={language}
                onChange={setLanguage}
              />
              <a
                className="button button-ghost topbar-link"
                href={githubLinks.organisation}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={18} />
                {content.githubLabel}
              </a>
              <a className="button button-primary topbar-link" href={cvHref} download={cvFileName} target="_blank" rel="noreferrer">
                <Download size={18} />
                {content.cvLabel}
              </a>
            </div>
          </div>
        </header>

        <main className="page-main">
          {/* HERO */}
          <section className="hero-section" id="home">
            <div className="hero-panel">
              <motion.p className="hero-status" {...heroItem(0)}>
                <span className="status-dot" aria-hidden="true" />
                {content.hero.status}
                <span className="hero-status-sep" aria-hidden="true">·</span>
                <MapPin size={15} aria-hidden="true" />
                {content.hero.location}
              </motion.p>

              <motion.h1 {...heroItem(0.06)}>
                <span className="hero-line">{content.hero.titleLead}</span>
                <RotatingWords key={language} words={content.hero.rotating} />
                <span className="hero-line">{content.hero.titleTail}</span>
              </motion.h1>

              <motion.p className="hero-description" {...heroItem(0.14)}>
                {content.hero.description}
              </motion.p>

              <motion.div className="hero-actions" {...heroItem(0.2)}>
                <a className="button button-primary button-lg" href="#projects">
                  {content.hero.primaryAction}
                  <ArrowRight size={18} />
                </a>
                <a className="button button-secondary button-lg" href={cvHref} download={cvFileName} target="_blank" rel="noreferrer">
                  <Download size={18} />
                  {content.hero.secondaryAction}
                </a>
              </motion.div>

              <motion.dl className="hero-proof" {...heroItem(0.28)}>
                {content.hero.proof.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>
                      <CountUp value={item.value} />
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            <motion.div
              className="portrait-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
            >
              <div className="portrait-stage">
                <div className="portrait-backdrop" aria-hidden="true" />
                <img className="portrait-image" src={portfolioAssets.profile} alt={content.hero.portraitAlt} />
                {content.hero.floating.map((card, i) => (
                  <motion.a
                    key={card.href}
                    href={card.href}
                    className={`floating-card floating-card-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -10, 0] }}
                    transition={
                      reduce
                        ? { duration: 0.4 }
                        : {
                            opacity: { duration: 0.5, delay: 0.6 + i * 0.2 },
                            y: { duration: 5 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 + i * 0.2 },
                          }
                    }
                  >
                    <span className="live-dot" aria-hidden="true" />
                    <span>
                      <strong>{card.title}</strong>
                      <small>{card.text}</small>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </motion.a>
                ))}
              </div>

              <div className="contact-strip">
                <a href={contactLinks.email}>
                  <Mail size={16} />
                  {contactLinks.emailLabel}
                </a>
                <a href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={16} />
                  {content.hero.linkedin}
                </a>
                <a href={githubLinks.organisation} target="_blank" rel="noreferrer">
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </motion.div>
          </section>

          {/* LIVE PROJECTS */}
          <section className="section" id="projects">
            <Reveal>
              <SectionHeading
                eyebrow={content.projects.eyebrow}
                title={content.projects.title}
                description={content.projects.description}
              />
            </Reveal>
            <div className="projects-list">
              {content.projects.items.map((item, index) => (
                <ProjectShowcase
                  key={item.id}
                  item={item}
                  labels={content.projects}
                  reverse={index % 2 === 1}
                  onZoom={setZoomedImage}
                  zoomLabel={content.imageZoomLabel}
                  soundOnLabel={content.soundOnLabel}
                  soundOffLabel={content.soundOffLabel}
                />
              ))}
            </div>
          </section>

          {/* IMPACT */}
          <section className="section" id="impact">
            <Reveal>
              <SectionHeading
                eyebrow={content.impact.eyebrow}
                title={content.impact.title}
                description={content.impact.description}
              />
            </Reveal>
            <div className="stats-section">
              {content.impact.stats.map((item, index) => (
                <Reveal key={item.label} className="stat-card" delay={index * 0.05}>
                  <span className="stat-value">
                    <CountUp value={item.value} />
                  </span>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* SYSTEMS IN PRODUCTION */}
          <section className="section" id="systems">
            <Reveal>
              <SectionHeading
                eyebrow={content.systems.eyebrow}
                title={content.systems.title}
                description={content.systems.description}
              />
            </Reveal>
            <Reveal delay={0.05}>
              <SystemsTabs content={content} onZoom={setZoomedImage} />
            </Reveal>
          </section>

          {/* EXPERIENCE */}
          <section className="section" id="experience">
            <Reveal>
              <SectionHeading
                eyebrow={content.experience.eyebrow}
                title={content.experience.title}
                description={content.experience.description}
              />
            </Reveal>
            <Timeline items={content.experience.items} />
          </section>

          {/* RECOGNITION */}
          <section className="section">
            <Reveal>
              <SectionHeading eyebrow={content.recognition.eyebrow} title={content.recognition.title} />
            </Reveal>
            <div className="recognition-grid">
              {content.recognition.items.map((item, index) => (
                <Reveal key={item.title} className="recognition-card" delay={index * 0.05}>
                  <ImageCard
                    item={item}
                    onZoom={setZoomedImage}
                    zoomLabel={content.imageZoomLabel}
                    linkUrl={item.publicationUrl}
                    linkLabel={content.recognition.publicationLabel}
                    linkIcon={<Linkedin size={16} />}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section className="section" id="skills">
            <Reveal>
              <SectionHeading
                eyebrow={content.skills.eyebrow}
                title={content.skills.title}
                description={content.skills.description}
              />
            </Reveal>
            <div className="support-grid">
              {content.support.items.map((item, index) => {
                const Icon = supportIcons[index];
                return (
                  <Reveal key={item.title} className="support-card" delay={index * 0.05}>
                    <div className="support-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="stack-panel" delay={0.05}>
              <h3 className="stack-title">{content.skills.stackTitle}</h3>
              <div className="stack-groups">
                {content.skills.groups.map((group) => (
                  <div key={group.title} className="stack-group">
                    <h4>{group.title}</h4>
                    <ul>
                      {group.items.map((tool) => (
                        <li key={tool}>{tool}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="languages-row">
                <Languages size={18} aria-hidden="true" />
                <strong>{content.skills.languagesTitle}</strong>
                {content.skills.languages.join(' · ')}
              </p>
            </Reveal>
          </section>

          {/* EDUCATION */}
          <section className="section" id="education">
            <Reveal>
              <SectionHeading
                eyebrow={content.education.eyebrow}
                title={content.education.title}
                description={content.education.description}
              />
            </Reveal>
            <div className="education-grid">
              {content.education.items.map((item, index) => (
                <Reveal key={item.title} className="education-entry" delay={index * 0.04}>
                  <div className="education-icon" aria-hidden="true">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.school} · {item.period}
                    </p>
                    {item.note ? <p className="education-note">{item.note}</p> : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* MORE BOOTCAMP PROJECTS */}
          <section className="section">
            <Reveal>
              <SectionHeading
                eyebrow={content.extraProjects.eyebrow}
                title={content.extraProjects.title}
                description={content.extraProjects.description}
              />
            </Reveal>
            <div className="extras-grid">
              {content.extraProjects.items.map((item, index) => (
                <Reveal key={item.title} className="recognition-card" delay={index * 0.04}>
                  <ImageCard
                    item={item}
                    onZoom={setZoomedImage}
                    zoomLabel={content.imageZoomLabel}
                    linkUrl={item.projectUrl}
                    linkLabel={content.extraProjects.linkLabel}
                    linkIcon={<Github size={16} />}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section className="section closing-section" id="contact">
            <Reveal className="closing-card">
              <div className="closing-copy">
                <span className="eyebrow">{content.closing.eyebrow}</span>
                <h2>{content.closing.title}</h2>
                <p>{content.closing.description}</p>
              </div>
              <div className="closing-actions">
                <a className="button button-primary" href={contactLinks.email}>
                  <Mail size={18} />
                  {content.closing.primary}
                </a>
                <a className="button button-ghost" href={cvHref} download={cvFileName} target="_blank" rel="noreferrer">
                  <Download size={18} />
                  {content.closing.cv}
                </a>
                <a className="button button-ghost" href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={18} />
                  {content.closing.linkedin}
                </a>
                <a className="button button-ghost" href={githubLinks.organisation} target="_blank" rel="noreferrer">
                  <Github size={18} />
                  {content.closing.github}
                </a>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <strong>{DISPLAY_NAME}</strong>
              <span>{content.footer.role}</span>
            </div>
            <div className="footer-links">
              <a href={contactLinks.email} className="footer-link-icon" aria-label={contactLinks.emailLabel}>
                <Mail size={18} />
              </a>
              <a
                href={githubLinks.organisation}
                target="_blank"
                rel="noreferrer"
                className="footer-link-icon"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={contactLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="footer-link-icon"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {zoomedImage ? (
            <motion.div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={zoomedImage.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                className="lightbox-backdrop"
                aria-label={content.imageCloseLabel}
                onClick={() => setZoomedImage(null)}
              />
              <motion.div
                className="lightbox-shell"
                initial={{ scale: 0.96, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 6 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <button
                  type="button"
                  className="lightbox-close"
                  aria-label={content.imageCloseLabel}
                  onClick={() => setZoomedImage(null)}
                  autoFocus
                >
                  <X size={18} />
                </button>
                <img className="lightbox-image" src={zoomedImage.src} alt={zoomedImage.alt} decoding="async" />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
