import './App.css';

function App() {
  return (
    <main className="frame">
      <span className="corner corner--tl" aria-hidden="true" />
      <span className="corner corner--tr" aria-hidden="true" />
      <span className="corner corner--bl" aria-hidden="true" />
      <span className="corner corner--br" aria-hidden="true" />


      <header className="hero">
        <h1 className="name">Erik Woon</h1>
        <p className="tagline">Software Engineer · Cybersecurity Analyst</p>
      </header>

      <section className="panel" aria-label="Profile">
        <h2 className="section__label">
          <span className="section__num">01</span>Profile
        </h2>
        <dl className="meta">
          <div className="meta__row">
            <dt>Status</dt>
            <dd>Looking for full-time opportunities | Previously Infrastructure Security Intern @ Beecity Australia</dd>
          </div>
          <div className="meta__row">
            <dt>Based</dt>
            <dd>Melbourne, Australia</dd>
          </div>
          <div className="meta__row">
            <dt>Education</dt>
            <dd>MSc Cyber Security, RMIT (2024–2026)</dd>
          </div>
          <div className="meta__row">
            <dt>Stack</dt>
            <dd>Python · JavaScript · C++ · Java</dd>
          </div>
        </dl>

        <p className="note">
          Master's student in Cyber Security at RMIT, following a Bachelor's
          in Computer Science from Monash. Splits time between building
          software and testing where it fails — currently working as an
          infrastructure security intern, with projects ranging from a
          trading journal to penetration testing reports.
        </p>
      </section>

      <section className="section">
        <h2 className="section__label">
          <span className="section__num">02</span>Experience
        </h2>
        <article className="role-entry">
          <div className="role__header">
            <span className="role__title">Infrastructure Security Intern</span>
            <span className="role__meta">
              Beecity Australia · Safeguard AI · Mar 2026 – June 2026
            </span>
          </div>
          <ul className="role__bullets">
            <li>
              Implemented stateless RBAC via JWT role claims, cutting endpoint
              latency from 340ms to 180ms while strengthening authentication
              and 2FA flows.
            </li>
            <li>
              Configured AWS IAM roles and RBAC policies under
              least-privilege principles, producing implementation guides
              for production deployment.
            </li>
            <li>
              Hardened Docker deployments through network isolation, minimal
              base images and restricted port exposure.
            </li>
          </ul>
        </article>
      </section>

      <section className="section">
        <h2 className="section__label">
          <span className="section__num">03</span>Skills
        </h2>
        <div className="ledger">
          <div className="ledger__row">
            <span className="ledger__key">Languages</span>
            <span className="ledger__value">Python · JavaScript · C++ · Java</span>
          </div>
          <div className="ledger__row">
            <span className="ledger__key">Security tooling</span>
            <span className="ledger__value">
              AWS IAM · Docker · Nmap · Burp Suite · Wireshark · Metasploit
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section__label">
          <span className="section__num">04</span>Projects
        </h2>

        <article className="case">
          <div className="case__row">
            <span className="case__key">Name</span>
            <span className="case__value">Options Tracker</span>
          </div>
          <div className="case__row">
            <span className="case__key">Type</span>
            <span className="case__value">Options trading journal &amp; analytics</span>
          </div>
          <div className="case__row">
            <span className="case__key">Tools</span>
            <span className="case__value">React · TypeScript · Supabase</span>
          </div>
          <div className="case__row">
            <span className="case__key">Status</span>
            <span className="case__value case__value--status">In development</span>
          </div>
        </article>

        <article className="case">
          <div className="case__row">
            <span className="case__key">Name</span>
            <span className="case__value">Music Finder</span>
          </div>
          <div className="case__row">
            <span className="case__key">Type</span>
            <span className="case__value">
              Android app for natural-language music discovery
            </span>
          </div>
          <div className="case__row">
            <span className="case__key">Tools</span>
            <span className="case__value">Java · RoomDB · OkHttp · Spotify &amp; ChatGPT APIs</span>
          </div>
          <div className="case__row">
            <span className="case__key">Status</span>
            <span className="case__value case__value--status">Complete</span>
          </div>
        </article>

        <article className="case">
          <div className="case__row">
            <span className="case__key">Name</span>
            <span className="case__value">Penetration Testing Reports</span>
          </div>
          <div className="case__row">
            <span className="case__key">Type</span>
            <span className="case__value">
              Vulnerability assessment across virtualised environments
            </span>
          </div>
          <div className="case__row">
            <span className="case__key">Tools</span>
            <span className="case__value">Nmap · Burp Suite · Wireshark · Metasploit</span>
          </div>
          <div className="case__row">
            <span className="case__key">Status</span>
            <span className="case__value case__value--status">Complete</span>
          </div>
        </article>
      </section>

      <section className="section">
        <h2 className="section__label">
          <span className="section__num">05</span>Contact
        </h2>
        <ul className="links">
          <li>
            <a href="https://github.com/erikwoon" target="_blank" rel="noreferrer">
              github.com/erikwoon
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/erikwoon" target="_blank" rel="noreferrer">
              linkedin.com/in/erikwoon
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}

export default App;
