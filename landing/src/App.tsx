import { useState } from 'react';
import './App.css';

type TabId = 'experience' | 'projects' | 'contact';

const TABS: { id: TabId; label: string }[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('experience');

  return (
    <main className="frame">
      <header className="intro">
        <img
          className="portrait"
          src="/profilephoto.jpeg"
          alt="Portrait of Erik Woon"
          width="112"
          height="112"
        />

        <div className="terminal" aria-hidden="true">
          <p className="terminal__line">
            <span className="terminal__prompt">$</span> whoami
          </p>
          <p className="terminal__line terminal__line--out">
            erik-woon — security-minded engineer
          </p>
          <p className="terminal__line">
            <span className="terminal__prompt">$</span> status
          </p>
          <p className="terminal__line terminal__line--out">
            open to full-time roles<span className="terminal__cursor" />
          </p>
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
      </header>

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
              Infrastructure Security Intern. Rebuilt auth around JWT role
              claims and 2FA, cutting endpoint latency from 340ms to 180ms;
              set least-privilege AWS IAM policies and hardened Docker
              deployments through network isolation and minimal base images.
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
              MSc Cyber Security, following a BSc in Computer Science from
              Monash University.
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
              href="/research-paper.pdf"
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
    </main>
  );
}

export default App;
