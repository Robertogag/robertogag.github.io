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
  Mail,
  ScanSearch,
  X,
  ZoomIn,
} from 'lucide-react';
import { contactLinks, contentByLanguage, githubLinks, portfolioAssets } from './content.js';

const LANGUAGE_KEY = 'robert-web-language';
const DISPLAY_NAME = 'Juan Roberto Garc\u00eda G\u00f3mez';
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
      viewport={{ once: true, amount: 0.18 }}
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
      <p>{description}</p>
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

function MediaButton({ src, alt, className, onZoom, zoomLabel }) {
  return (
    <button
      type="button"
      className={[className, 'media-button'].filter(Boolean).join(' ')}
      onClick={() => onZoom({ src, alt })}
      aria-label={`${zoomLabel}: ${alt}`}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <span className="media-zoom-indicator" aria-hidden="true">
        <ZoomIn size={18} />
      </span>
    </button>
  );
}

function ShowcaseCard({ item, delay = 0, onZoom, zoomLabel, publicationLabel }) {
  return (
    <Reveal className="showcase-card" delay={delay}>
      <MediaButton
        src={item.image}
        alt={item.alt}
        className="showcase-media"
        onZoom={onZoom}
        zoomLabel={zoomLabel}
      />
      <div className="showcase-copy">
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
            {publicationLabel}
          </a>
        ) : null}
      </div>
    </Reveal>
  );
}

function CarouselCard({ item, delay = 0, onZoom, zoomLabel }) {
  return (
    <Reveal className="carousel-card" delay={delay}>
      <MediaButton
        src={item.image}
        alt={item.alt}
        className="carousel-media"
        onZoom={onZoom}
        zoomLabel={zoomLabel}
      />

      <div className="carousel-copy">
        <span>{item.title}</span>
        <h4>{item.subtitle}</h4>
        <p>{item.description}</p>
      </div>
    </Reveal>
  );
}

function CarouselSection({
  title,
  description,
  items,
  previousLabel,
  nextLabel,
  compact = false,
  onZoom,
  zoomLabel,
}) {
  const trackRef = useRef(null);
  const isBalanced = compact && items.length <= 2;

  function scrollCarousel(direction) {
    const track = trackRef.current;
    if (!track) return;

    const amount = track.clientWidth * 0.84;
    track.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="gallery-block">
      <Reveal className="subsection-intro" delay={0.03}>
        <div className="subsection-head">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>

          {!isBalanced ? (
            <div className="carousel-controls" aria-label={title}>
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
        </div>
      </Reveal>

      <div
        ref={trackRef}
        className={`carousel-track${compact ? ' is-compact' : ''}${isBalanced ? ' is-balanced' : ''}`}
      >
        {items.map((item, index) => (
          <CarouselCard
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
  const [activeSection, setActiveSection] = useState('#featured');
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
      if (frameId !== null) {
        return;
      }

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
        <section className="hero-section" id="home">
          <Reveal className="hero-panel">
            <h1>
              {content.hero.titleLead}
              <span>{content.hero.titleAccent}</span>
            </h1>

            <p className="hero-description">{content.hero.description}</p>

            <div className="hero-actions">
              <a className="button button-primary" href="#featured">
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

        <section className="stats-section" aria-label="Highlighted results">
          {content.stats.map((item, index) => (
            <Reveal key={item.label} className="stat-card" delay={index * 0.04}>
              <span className="stat-value">{item.value}</span>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </Reveal>
          ))}
        </section>

        <section className="section showcase-section">
          <Reveal>
            <SectionHeading
              eyebrow={content.showcase.eyebrow}
              title={content.showcase.title}
              description={content.showcase.description}
            />
          </Reveal>

          <div className="showcase-grid">
            {content.showcase.items.map((item, index) => (
              <ShowcaseCard
                key={item.title}
                item={item}
                delay={index * 0.05}
                onZoom={setZoomedImage}
                zoomLabel={content.imageZoomLabel}
                publicationLabel={content.showcase.publicationLabel}
              />
            ))}
          </div>
        </section>

        <section className="section" id="featured">
          <Reveal>
            <SectionHeading
              eyebrow={content.featured.eyebrow}
              title={content.featured.title}
              description={content.featured.description}
            />
          </Reveal>

          <Reveal className="featured-card" delay={0.06}>
            <MediaButton
              className="featured-media"
              src={portfolioAssets.realtimeDashboard}
              alt={content.featured.imageAlt}
              onZoom={setZoomedImage}
              zoomLabel={content.imageZoomLabel}
            />

            <div className="featured-copy">
              <div className="feature-points">
                {content.featured.points.map((point) => (
                  <div key={point} className="feature-point">
                    <BadgeCheck size={16} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="feature-metrics">
                {content.featured.metrics.map((metric) => (
                  <div key={metric.label} className="feature-metric">
                    <span>{metric.value}</span>
                    <small>{metric.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="section" id="systems">
          <Reveal>
            <SectionHeading
              eyebrow={content.systems.eyebrow}
              title={content.systems.title}
              description={content.systems.description}
            />
          </Reveal>

          <CarouselSection
            title={content.systems.modulesTitle}
            description={content.systems.modulesDescription}
            items={content.systems.modules}
            previousLabel={content.systems.previousLabel}
            nextLabel={content.systems.nextLabel}
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
          />

          <CarouselSection
            title={content.systems.analyticsTitle}
            description={content.systems.analyticsDescription}
            items={content.systems.analytics}
            previousLabel={content.systems.previousLabel}
            nextLabel={content.systems.nextLabel}
            compact
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
          />

          <CarouselSection
            title={content.systems.enterpriseTitle}
            description={content.systems.enterpriseDescription}
            items={content.systems.enterprise}
            previousLabel={content.systems.previousLabel}
            nextLabel={content.systems.nextLabel}
            compact
            onZoom={setZoomedImage}
            zoomLabel={content.imageZoomLabel}
          />
        </section>

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
                  <span key={item} className="tag">
                    {item}
                  </span>
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
