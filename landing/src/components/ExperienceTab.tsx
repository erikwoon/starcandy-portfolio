function ExperienceTab() {
  return (
    <section
      className="panel"
      id="panel-experience"
      role="tabpanel"
      aria-labelledby="tab-experience"
    >
      <article className="entry reveal">
        <div className="entry__header">
          <span className="badge badge--teal" aria-hidden="true">
            TH
          </span>
          <div className="entry__heading">
            <span className="entry__title">
              Security Analyst Level 1 (SAL1)
            </span>
            <span className="entry__meta">TryHackMe · Issued Feb 2026</span>
          </div>
        </div>
        <p className="entry__desc">
          Certified for the knowledge and practical skills required to
          excel as a security analyst, assessed through a hands-on,
          scenario-based exam.
        </p>
        <a
          className="pill entry__pill"
          href="https://assets.tryhackme.com/certification-certificate/69860dd151dde06deca2061f.pdf"
          target="_blank"
          rel="noreferrer"
        >
          View Certificate ↗
        </a>
      </article>

      <article className="entry reveal">
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

      <article className="entry reveal">
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

      <article className="entry reveal">
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
  );
}

export default ExperienceTab;
