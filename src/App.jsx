import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Factory,
  Gauge,
  Github,
  GraduationCap,
  Languages,
  Linkedin,
  Lock,
  Mail,
  ScanSearch,
  X,
  ZoomIn,
} from 'lucide-react';
import { contactLinks, contentByLanguage, githubLinks, portfolioAssets } from './content.js';

const LANGUAGE_KEY = 'robert-web-language';
const DISPLAY_NAME = 'Juan Roberto García Gómez';
const supportIcons = [Factory, Gauge, Database, BarChart3];

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
  return storedLanguage === 'es' ? 'es' : 'en';
}

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
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

function LanguageSwitch({ label, language, onChange }) {
  return (
    <div className="language-switch" aria-label={label} role="group">
      <button
        type="button"
        className={language === 'en' ? 'is-active' : ''}
        aria-pressed={language === 'en'}
        onClick={() => onChange('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={language === 'es' ? 'is-active' : ''}
        aria-pressed={language === 'es'}
        onClick={() => onChange('es')}
      >
        ES
      </button>
    </div>
  );
}

/**
 * Uniform browser-window chrome around every screenshot. This is what gives the
 * whole gallery a single, coherent look regardless of each screenshot's native
 * aspect ratio — the image sits in a fixed 16:10 stage with a consistent frame.
 */
function BrowserFrame({ src, alt, label, onZoom, zoomLabel, className }) {
  return (
    <div className={['browser-frame', className].filter(Boolean).join(' ')}>
      <div className="browser-bar">
        <span className="browser-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        {label ? (
          <span className="browser-url">
            <Lock size={11} aria-hidden="true" />
            {label}
          </span>
        ) : null}
      </div>
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

function SystemCard({ item, delay = 0, onZoom, zoomLabel }) {
  return (
    <Reveal className="system-card" delay={delay}>
      <BrowserFrame
        src={item.image}
        alt={item.alt}
        label={item.browserLabel}
        onZoom={onZoom}
        zoomLabel={zoomLabel}
      />
      <div className="system-copy">
        <span className="system-kicker">{item.subtitle}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </Reveal>
  );
}

function Carousel({ items, previousLabel, nextLabel, onZoom, zoomLabel, columns = 'auto' }) {
  const trackRef = useRef(null);
  const showControls = columns === 'auto';

  function scrollCarousel(direction) {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.82;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <div className="carousel-block">
      {showControls ? (
        <div className="carousel-controls" aria-label="carousel">
          <button
            type="button"
            className="carousel-button"
            aria-label={previousLabel}
            onClick={() => scrollCarousel(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="carousel-button"
            aria-label={nextLabel}
            onClick={() => scrollCarousel(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      <div ref={trackRef} className={`carousel-track track-${columns}`}>
        {items.map((item, index) => (
          <SystemCard
            key={`${item.title}-${index}`}
            item={item}
            delay={index * 0.04}
            onZoom={onZoom}
            zoomLabel={zoomLabel}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [activeSection, setActiveSection] = useState('#impact');
  const content = contentByLanguage[language];

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
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
      const marker = window.scrollY + 160;
      let nextActive = navigationTargets[0].href;
      navigationTargets.forEach((target) => {
        if (target.element.offsetTop <= marker) {
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

  return (
    <div className="page-shell">
      <div className="page-glow page-glow-left" />
      <div className="page-glow page-glow-right" />
      <div className="page-grid" />

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
            <a
              className="button button-secondary topbar-link"
              href={portfolioAssets.cv}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} />
              {content.cvLabel}
            </a>
          </div>
        </div>
      </header>

      <main className="page-main">
        {/* HERO */}
        <section className="hero-section" id="home">
          <Reveal className="hero-panel">
            <span className="eyebrow">{content.hero.eyebrow}</span>
            <h1>
              {content.hero.titleLead} <span>{content.hero.titleAccent}</span>
            </h1>
            <p className="hero-description">{content.hero.description}</p>

            <div className="hero-actions">
              <a className="button button-primary" href="#mes">
                {content.hero.primaryAction}
                <ArrowRight size={18} />
              </a>
              <a
                className="button button-secondary"
                href={portfolioAssets.cv}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={18} />
                {content.hero.secondaryAction}
              </a>
            </div>
          </Reveal>

          <Reveal className="portrait-panel" delay={0.08}>
            <div className="portrait-stage">
              <img
                className="portrait-image"
                src={portfolioAssets.profile}
                alt={content.hero.portraitAlt}
              />
            </div>

            <div className="portrait-details">
              <div className="contact-strip">
                <a href={contactLinks.email}>
                  <Mail size={16} />
                  {contactLinks.emailLabel}
                </a>
                <a href={contactLinks.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={16} />
                  {content.hero.linkedin}
                </a>
              </div>

              <div className="focus-panel">
                <span className="focus-label">{content.hero.focusTitle}</span>
                <div className="focus-list">
                  {content.hero.focusItems.map((item) => (
                    <div key={item} className="focus-item">
                      <BadgeCheck size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
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
              <Reveal key={item.label} className="stat-card" delay={index * 0.04}>
                <span className="stat-value">{item.value}</span>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* MES */}
        <section className="section" id="mes">
          <Reveal>
            <SectionHeading
              eyebrow={content.mes.eyebrow}
              title={content.mes.title}
              description={content.mes.description}
            />
          </Reveal>

          <Reveal className="featured-card" delay={0.05}>
            <BrowserFrame
              className="featured-frame"
              src={content.mes.featured.image}
              alt={content.mes.featured.alt}
              label={content.mes.featured.browserLabel}
              onZoom={setZoomedImage}
              zoomLabel={content.imageZoomLabel}
            />
            <div className="featured-copy">
              <span className="system-kicker">{content.mes.featured.subtitle}</span>
              <h3>{content.mes.featured.title}</h3>
              <p>{content.mes.featured.text}</p>
              <div className="feature-metrics">
                {content.mes.featured.metrics.map((metric) => (
                  <div key={metric.label} className="feature-metric">
                    <span>{metric.value}</span>
                    <small>{metric.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="gallery-intro" delay={0.04}>
            <h3>{content.mes.galleryTitle}</h3>
            <p>{content.mes.galleryDescription}</p>
          </Reveal>

          <Carousel
            items={content.mes.gallery}
            previousLabel="Previous"
            nextLabel="Next"
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
            columns="auto"
          />
        </section>

        {/* ERP */}
        <section className="section" id="erp">
          <Reveal>
            <SectionHeading
              eyebrow={content.erp.eyebrow}
              title={content.erp.title}
              description={content.erp.description}
            />
          </Reveal>
          <Carousel
            items={content.erp.gallery}
            previousLabel="Previous"
            nextLabel="Next"
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
            columns="auto"
          />
        </section>

        {/* SCANNER APP */}
        <section className="section" id="scanner">
          <Reveal>
            <SectionHeading
              eyebrow={content.scanner.eyebrow}
              title={content.scanner.title}
              description={content.scanner.description}
            />
          </Reveal>
          <Carousel
            items={content.scanner.gallery}
            previousLabel="Previous"
            nextLabel="Next"
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
            columns="auto"
          />
          {content.scanner.footnote ? (
            <Reveal className="scanner-footnote" delay={0.05}>
              <span>{content.scanner.footnote}</span>
            </Reveal>
          ) : null}
        </section>

        {/* ANALYTICS */}
        <section className="section" id="analytics">
          <Reveal>
            <SectionHeading
              eyebrow={content.analytics.eyebrow}
              title={content.analytics.title}
              description={content.analytics.description}
            />
          </Reveal>
          <Carousel
            items={content.analytics.gallery}
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
            columns="two"
          />
        </section>

        {/* HOW I WORK */}
        <section className="section">
          <Reveal>
            <SectionHeading
              eyebrow={content.support.eyebrow}
              title={content.support.title}
              description={content.support.description}
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
          <div className="experience-grid">
            {content.experience.items.map((item, index) => (
              <Reveal key={item.company} className="experience-card" delay={index * 0.06}>
                <div className="experience-icon">
                  <BriefcaseBusiness size={20} />
                </div>
                <div className="experience-heading">
                  <div>
                    <span className="experience-period">{item.period}</span>
                    <h3>{item.company}</h3>
                  </div>
                  <span className="experience-role">{item.role}</span>
                </div>
                <p>{item.summary}</p>
                <div className="experience-points">
                  {item.bullets.map((bullet) => (
                    <div key={bullet} className="experience-point">
                      <BadgeCheck size={16} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* RECOGNITION */}
        <section className="section">
          <Reveal>
            <SectionHeading
              eyebrow={content.recognition.eyebrow}
              title={content.recognition.title}
            />
          </Reveal>
          <div className="recognition-grid">
            {content.recognition.items.map((item, index) => (
              <Reveal key={item.title} className="recognition-card" delay={index * 0.05}>
                <button
                  type="button"
                  className="recognition-media media-button"
                  onClick={() => setZoomedImage({ src: item.image, alt: item.alt })}
                  aria-label={`${content.imageZoomLabel}: ${item.alt}`}
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
                  {item.publicationUrl ? (
                    <a
                      className="showcase-link"
                      href={item.publicationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin size={16} />
                      {content.recognition.publicationLabel}
                    </a>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
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
          <div className="education-layout">
            <Reveal className="education-card">
              <div className="card-title">
                <GraduationCap size={18} />
                <h3>{content.education.educationTitle}</h3>
              </div>
              <div className="education-list">
                {content.education.items.map((item) => (
                  <div key={item} className="education-item">
                    <span className="education-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="stack-card" delay={0.08}>
              <div className="card-title">
                <ScanSearch size={18} />
                <h3>{content.education.stackTitle}</h3>
              </div>
              <div className="tag-row">
                {content.education.stack.map((item) => (
                  <span key={item} className="tag">{item}</span>
                ))}
              </div>
              <div className="language-panel">
                <div className="card-title">
                  <Languages size={18} />
                  <h3>{content.education.languagesTitle}</h3>
                </div>
                <div className="language-items">
                  {content.education.languages.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </Reveal>
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
              <a
                className="button button-ghost"
                href={contactLinks.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={18} />
                {content.closing.quaternary}
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
              <span className="footer-link-label">{contactLinks.emailLabel}</span>
            </a>
            <a
              href={githubLinks.organisation}
              target="_blank"
              rel="noreferrer"
              className="footer-link-icon"
              aria-label="GitHub"
            >
              <Github size={18} />
              <span className="footer-link-label">GitHub</span>
            </a>
            <a
              href={contactLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="footer-link-icon"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
              <span className="footer-link-label">LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>

      {zoomedImage ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={zoomedImage.alt}>
          <button
            type="button"
            className="lightbox-backdrop"
            aria-label={content.imageCloseLabel}
            onClick={() => setZoomedImage(null)}
          />
          <div className="lightbox-shell">
            <button
              type="button"
              className="lightbox-close"
              aria-label={content.imageCloseLabel}
              onClick={() => setZoomedImage(null)}
            >
              <X size={18} />
            </button>
            <img
              className="lightbox-image"
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
