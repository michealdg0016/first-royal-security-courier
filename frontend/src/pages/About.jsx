import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MILESTONES = [
  { year: '2004', title: 'Founded', desc: 'London to Dubai. Three vans. One uncompromising mission.' },
  { year: '2008', title: 'Going Global', desc: 'Reached 40 countries. First Secure Freight service launched.' },
  { year: '2012', title: 'Tech Platform', desc: 'Proprietary real-time tracking deployed across the full network.' },
  { year: '2017', title: '1 Million Clients', desc: 'A million trusted clients across six continents.' },
  { year: '2022', title: '150 Countries', desc: 'Full global coverage. 850-node logistics network live.' },
  { year: '2024', title: '20 Years', desc: 'Two million clients. The standard has never dropped.' },
]

const NETWORK_STATS = [
  { value: '150+', label: 'Countries & Territories', icon: '🌍' },
  { value: '850', label: 'Processing Hubs', icon: '🏭' },
  { value: '4,800+', label: 'Royal Employees', icon: '👥' },
  { value: '3,200', label: 'Vehicles & Aircraft', icon: '✈️' },
  { value: '18', label: 'Languages Supported', icon: '🗣' },
  { value: '24/7', label: 'Operations Uptime', icon: '⏱' },
]

const CERTS = [
  { badge: 'ISO 9001:2015', desc: 'Quality Management Systems — certified since 2007' },
  { badge: 'IATA Member', desc: 'International Air Transport Association — active member' },
  { badge: 'WCA Network', desc: 'World Cargo Alliance — premium freight network' },
  { badge: 'TAPA TSR', desc: 'Transported Asset Protection — Security Level 1' },
  { badge: 'GDPR Compliant', desc: 'EU General Data Protection Regulation — fully certified' },
  { badge: 'Licensed & Bonded', desc: 'Fully licensed in all 150+ operating territories' },
]

export default function About() {
  return (
    <div>
      <Navbar />

      {/* ── PAGE HERO ── */}
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="container">
          <div className="page-hero-content">
            <div className="hero-eyebrow"><span>✦</span> Est. 2004 · Twenty Years of Excellence</div>
            <h1 className="page-hero-title">The Gold Standard<br />in Global Courier</h1>
            <p className="page-hero-subtitle">
              Two decades. 150 countries. Two million clients. The story of First Royal Security Company
              is one of uncompromising standards and an obsession with getting it right — every single time.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
              <Link to="/services" className="btn btn-gold">Our Services</Link>
              <Link to="/contact" className="btn btn-outline">Talk to Our Team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HEADLINE STATS ── */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '2004', label: 'Founded' },
              { value: '150+', label: 'Countries Served' },
              { value: '2M+', label: 'Clients Worldwide' },
              { value: '99.8%', label: 'On-Time Delivery' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── OUR STORY ── */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-text">
              <span className="section-eyebrow">Our Story</span>
              <h2 className="about-story-heading">Born from a Belief That Cargo Deserves Care</h2>
              <p className="about-body">
                In 2004, our founder watched a priceless family heirloom arrive shattered — the result of careless
                handling by a major courier. That moment became a mission: build the company that treats every package
                as if it belongs to royalty.
              </p>
              <p className="about-body">
                We started with three vans and a single route between London and Dubai. Today, First Royal Security
                Company operates one of the world's most trusted logistics networks — spanning 150+ countries,
                employing 4,800 dedicated professionals, and processing over a million shipments every month.
              </p>
              <p className="about-body">
                The mission hasn't changed. The standard hasn't dropped. Every package — from a handwritten letter
                to a high-security freight consignment — receives the same Royal treatment.
              </p>
            </div>

            <div className="about-milestones">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="milestone-item">
                  <div className="milestone-line">
                    <div className="milestone-dot" />
                    {i < MILESTONES.length - 1 && <div className="milestone-connector" />}
                  </div>
                  <div className="milestone-body">
                    <div className="milestone-year">{m.year}</div>
                    <div className="milestone-title">{m.title}</div>
                    <div className="milestone-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION & VALUES ── */}
      <section className="section" style={{ background: 'linear-gradient(180deg,var(--navy-800),var(--navy-700))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">What Drives Us</span>
            <h2 className="section-title">Our Mission &amp; Values</h2>
            <p className="section-subtitle">
              Every decision at FRSC flows from three foundational commitments. These aren't marketing words —
              they're the standards our 4,800 employees are hired, trained, and evaluated against.
            </p>
          </div>
          <div className="values-grid">
            {[
              {
                icon: '🔐',
                title: 'Absolute Security',
                desc: 'Every shipment is treated as irreplaceable — because to someone, it is. Our tamper-evident systems, GPS monitoring, and chain-of-custody protocols set the industry benchmark.',
              },
              {
                icon: '⚡',
                title: 'Relentless Speed',
                desc: 'Time is value. We\'ve spent 20 years optimising routes, eliminating friction, and investing in infrastructure to move cargo faster — without ever sacrificing care.',
              },
              {
                icon: '🤝',
                title: 'Unbreakable Trust',
                desc: 'We back our promises with the Royal Guarantee. Every commitment we make is one we keep — or we compensate fully, without bureaucracy or delay.',
              },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL NETWORK ── */}
      <section className="section" id="network">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Global Reach</span>
            <h2 className="section-title">Our World Network</h2>
            <p className="section-subtitle">
              From Arctic logistics corridors to island-nation delivery routes — our 850-node network
              covers every corner of the globe with the same Royal precision.
            </p>
          </div>
          <div className="network-stats-grid">
            {NETWORK_STATS.map(n => (
              <div key={n.label} className="network-stat-card">
                <span style={{ fontSize: 36, marginBottom: 16, display: 'block' }}>{n.icon}</span>
                <span className="network-stat-value">{n.value}</span>
                <span className="network-stat-label">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ── */}
      <section className="section" style={{ background: 'linear-gradient(180deg,var(--navy-800),var(--navy-700))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Accreditations</span>
            <h2 className="section-title">Certified. Audited. Trusted.</h2>
            <p className="section-subtitle">
              Our operations are independently audited against the highest international standards
              in logistics, security, and data protection.
            </p>
          </div>
          <div className="certs-grid">
            {CERTS.map(c => (
              <div key={c.badge} className="cert-card">
                <div className="cert-badge">{c.badge}</div>
                <p className="cert-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Experience the Royal Standard?</h2>
          <p className="cta-subtitle">
            Join two million clients who've trusted us with what matters most.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-gold btn-lg">Start Shipping</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Talk to Our Team</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
