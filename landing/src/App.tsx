import { useEffect, useState } from 'react';
import './App.css';
import photos from './data/photos.json';

type TabId = 'experience' | 'projects' | 'photos' | 'contact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'photos', label: 'Photos' },
  { id: 'contact', label: 'Contact' },
];

let hasLoggedGreeting = false;

function logConsoleGreeting() {
  if (hasLoggedGreeting) return;
  hasLoggedGreeting = true;

  const prompt = 'color: #ffb238; font-family: monospace; font-weight: 700;';
  const out = 'color: #ececed; font-family: monospace;';
  const dim = 'color: #888d92; font-family: monospace;';

  console.log('%c$ whoami', prompt);
  console.log('%cvisitor', out);
  console.log('%c$ status', prompt);
  console.log(
    '%c hi, i see you. %cthere\'s not much around here, but i hope you enjoyed the easter egg! ~erik',
    out,
    dim,
  );
  console.log(
    '%cgithub.com/erikwoon · linkedin.com/in/erikwoon',
    dim,
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('experience');
  const [openPhotoId, setOpenPhotoId] = useState<string | null>(null);
  const openPhoto = photos.find((p) => p.id === openPhotoId) ?? null;

  useEffect(() => {
    logConsoleGreeting();
  }, []);

  useEffect(() => {
    if (!openPhotoId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPhotoId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openPhotoId]);

  return (
    <main className="layout">
      <aside className="sidebar">
        <div className="intro__top">
          <img
            className="portrait"
            src="/profilephoto.jpeg"
            alt="Portrait of Erik Woon"
            width="150"
            height="150"
          />

          <div className="terminal" aria-hidden="true">
            <p className="terminal__line">
              <span className="terminal__prompt">$</span> whoami
            </p>
            <p className="terminal__line terminal__line--out">
              erik-woon, aspiring software and cybersecurity engineer
            </p>
            <p className="terminal__line">
              <span className="terminal__prompt">$</span> status
            </p>
            <p className="terminal__line terminal__line--out">
              open to full-time roles<span className="terminal__cursor" />
            </p>

            <div className="dirlist" aria-hidden="true">
              <p className="terminal__line">
                <span className="terminal__prompt">$</span> ls ~/interests
              </p>
              <div className="dirlist__grid">
                {[
                  'coffee',
                  'travel',
                  'photography/fujifilm x-t5',
                  'anime',
                  'pokemon',
                  'sports/gym, running',  
                  'cooking/and subsequently eating',
                ].map((item) => {
                  const [name, sub] = item.split('/');
                  return (
                    <span className="dirlist__item" key={item}>
                      {name}
                      <span className="dirlist__slash">/</span>
                      {sub && <span className="dirlist__sub">{sub}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <p className="bio">
          I'm Erik, an aspiring software engineer and cybersecurity analyst based in
          Melbourne, Australia.
        </p>
        <p className="bio">
          Previously, I was an infrastructure security intern at{' '}
          <strong>Beecity Australia</strong>, working on SafeCapitAI,
          a unified risk-intelligence platform for investors to view and analyze their portfolios.
          My work focused on hardening authentication flows, safeguarding sensitive data,
          and implementing robust access control measures.
        </p>
        <p className="bio">
          On the side I'm building{' '}
          <button
            type="button"
            className="inline-link"
            onClick={() => setActiveTab('projects')}
          >
            Options Tracker
          </button>
          , a trading journal for options traders, and picking apart CTFs to
          learn how systems fail.
        </p>
        <p className="bio">
          I'm currently looking for full-time software engineering and
          security roles.
        </p>


      </aside>

      <div className="content">
      <nav className="tabs" role="tablist" aria-label="Sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`tabs__item ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'experience' && (
        <section
          className="panel"
          id="panel-experience"
          role="tabpanel"
          aria-labelledby="tab-experience"
        >
          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--amber" aria-hidden="true">
                BC
              </span>
              <div className="entry__heading">
                <span className="entry__title">Beecity Australia</span>
                <span className="entry__meta">Mar 2026 – Jun 2026</span>
              </div>
            </div>
            <p className="entry__desc">
              Infrastructure Security Intern. Rebuilt login authentication around JWT role
              claims and 2FA, cutting endpoint latency from 340ms to 180ms;
              set least-privilege AWS IAM policies and hardened Docker
              deployments through network isolation and minimal base images.
              Enhanced application security and stability by standardising error handling, 
              implementing robust Pydantic data validation, 
              and applying secure authentication best practices. 
              Authored data classification and storage policy documentation, 
              defining handling standards across public, internal, sensitive and critical data tiers.

            </p>
          </article>

          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--teal" aria-hidden="true">
                RM
              </span>
              <div className="entry__heading">
                <span className="entry__title">RMIT University</span>
                <span className="entry__meta">2024 – 2026</span>
              </div>
            </div>
            <p className="entry__desc">
              MSc in Cyber Security. Coursework spanned offensive security (network security, penetration testing, reconnaissance-to-exploitation workflows),
              and defensive practice (incident response, from detection through containment to post-incident analysis). 
              It also covered GRC, mapping technical controls to regulatory and organisational risk frameworks to connect security work with business impact.
            </p>
          </article>

          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--teal" aria-hidden="true">
                RM
              </span>
              <div className="entry__heading">
                <span className="entry__title">Monash University</span>
                <span className="entry__meta">2021 – 2024</span>
              </div>
            </div>
            <p className="entry__desc">
              BSc in Computer Science, majoring in Advanced Computer Science. Minor in Banking and Finance. Coursework began with programming fundamentals, computer systems, networks and security, 
              and the theoretical underpinnings of computing and algorithms, then progressed into object-oriented design, database systems and the theory of computation.
              The algorithms and software specialisation built on this with advanced data structures and algorithms, programming paradigms and parallel computing, 
              focused on designing efficient solutions and reasoning about performance and correctness across different programming models.

            </p>
          </article>
          
        </section>
      )}

      {activeTab === 'projects' && (
        <section
          className="panel"
          id="panel-projects"
          role="tabpanel"
          aria-labelledby="tab-projects"
        >
          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--amber" aria-hidden="true">
                OT
              </span>
              <div className="entry__heading">
                <span className="entry__title">Options Tracker</span>
                <span className="entry__meta">React · TypeScript · Supabase</span>
              </div>
              <span className="status status--progress">In development</span>
            </div>
            <p className="entry__desc">
              An options trading journal — CSV import, position reconciliation
              and P&amp;L analytics.
            </p>
          </article>

          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--teal" aria-hidden="true">
                MF
              </span>
              <div className="entry__heading">
                <span className="entry__title">Music Finder</span>
                <span className="entry__meta">
                  Java · RoomDB · Spotify &amp; ChatGPT APIs
                </span>
              </div>
              <span className="status status--done">Complete</span>
            </div>
            <p className="entry__desc">
              An Android app for natural-language music discovery.
            </p>
          </article>

          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--amber" aria-hidden="true">
                PT
              </span>
              <div className="entry__heading">
                <span className="entry__title">Penetration Testing Reports</span>
                <span className="entry__meta">
                  Nmap · Burp Suite · Wireshark · Metasploit
                </span>
              </div>
              <span className="status status--done">Complete</span>
            </div>
            <p className="entry__desc">
              Vulnerability assessments across virtualised environments.
            </p>
          </article>

          <article className="entry">
            <div className="entry__header">
              <span className="badge badge--teal" aria-hidden="true">
                CTI
              </span>
              <div className="entry__heading">
                <span className="entry__title">
                  National Security Implications of Contemporary
                  Geo-politics and Threat Intelligence
                </span>
                <span className="entry__meta">
                  RMIT · Industry Awareness Project · co-authored, Team 17
                </span>
              </div>
            </div>
            <p className="entry__desc">
              A study of how cyber threat intelligence sharing strengthens a
              nation's response to geopolitical tensions, covering critical
              infrastructure, CTI frameworks and policy recommendations.
            </p>
            <a
              className="pill entry__pill"
              href="/research_paper.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Read PDF ↗
            </a>
          </article>

          <a
            className="see-more"
            href="https://github.com/erikwoon"
            target="_blank"
            rel="noreferrer"
          >
            See more on GitHub ↗
          </a>
        </section>
      )}

      {activeTab === 'photos' && (
        <section
          className="panel"
          id="panel-photos"
          role="tabpanel"
          aria-labelledby="tab-photos"
        >
          <div className="gallery">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="gallery__item"
                onClick={() => setOpenPhotoId(photo.id)}
                aria-label={`View photo${
                  photo.exif?.date ? ` from ${photo.exif.date}` : ''
                } full-size`}
              >
                <img src={photo.thumb} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'contact' && (
        <section
          className="panel"
          id="panel-contact"
          role="tabpanel"
          aria-labelledby="tab-contact"
        >
          <div className="contact-links">
            <a
              className="pill"
              href="https://github.com/erikwoon"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              className="pill"
              href="https://linkedin.com/in/erikwoon"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </section>
      )}
      </div>

      {openPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setOpenPhotoId(null)}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={() => setOpenPhotoId(null)}
            aria-label="Close"
          >
            ✕
          </button>
          <figure
            className="lightbox__figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="lightbox__img"
              src={openPhoto.full}
              alt=""
              style={{ aspectRatio: `${openPhoto.width} / ${openPhoto.height}` }}
            />
            {openPhoto.exif && (
              <figcaption className="lightbox__exif">
                {[
                  openPhoto.exif.camera,
                  openPhoto.exif.lens,
                  openPhoto.exif.focalLength,
                  openPhoto.exif.aperture,
                  openPhoto.exif.shutter,
                  openPhoto.exif.iso,
                ]
                  .filter(Boolean)
                  .join('  ·  ')}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </main>
  );
}

export default App;
