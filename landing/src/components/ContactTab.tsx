function ContactTab() {
  return (
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
  );
}

export default ContactTab;
