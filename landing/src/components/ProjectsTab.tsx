function ProjectsTab() {
  return (
    <section
      className="panel"
      id="panel-projects"
      role="tabpanel"
      aria-labelledby="tab-projects"
    >
      <article className="entry reveal">
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

      <article className="entry reveal">
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

      <article className="entry reveal">
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

      <article className="entry reveal">
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
  );
}

export default ProjectsTab;
