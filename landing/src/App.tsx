import { useEffect, useState } from 'react';
import './App.css';
import photos from './data/photos.json';
import { useReveal } from './hooks/useReveal';
import ExperienceTab from './components/ExperienceTab';
import ProjectsTab from './components/ProjectsTab';
import PhotosTab from './components/PhotosTab';
import ContactTab from './components/ContactTab';

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
  const contentRef = useReveal<HTMLDivElement>();

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

      <div className="content" ref={contentRef}>
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

      {activeTab === 'experience' && <ExperienceTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'photos' && (
        <PhotosTab photos={photos} onOpenPhoto={setOpenPhotoId} />
      )}
      {activeTab === 'contact' && <ContactTab />}
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
