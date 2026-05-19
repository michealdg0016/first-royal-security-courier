import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  const [trackCode, setTrackCode] = useState('')
  const navigate = useNavigate()

  const handleTrack = (e) => {
    e.preventDefault()
    if (trackCode.trim()) navigate(`/track/${trackCode.trim().toUpperCase()}`)
  }

  return (
    <div>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>✦</span> Trusted by 2M+ Clients Worldwide
            </div>
            <h1 className="hero-title">
              Your Cargo, Delivered<br />
              With <span className="gold">Royal Precision</span>
            </h1>
            <p className="hero-subtitle">
              First Royal Security Company sets the gold standard in international courier services. 
              We guard your shipments like crown jewels — with bank-grade security, unwavering reliability, 
              and white-glove service across every border.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-gold btn-lg">Start Shipping Today</Link>
              <Link to="/track" className="btn btn-outline btn-lg">Track a Package</Link>
            </div>

            <div className="hero-track-box">
              <p className="hero-track-label">📦 Quick Track</p>
              <form className="hero-track-row" onSubmit={handleTrack}>
                <input
                  value={trackCode}
                  onChange={e => setTrackCode(e.target.value)}
                  placeholder="Enter code (e.g. FRSC-A1B2-C3D4-E5F6)"
                />
                <button type="submit" className="btn btn-gold">Track</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          {[
            '🔒 Military-Grade Security','✈ 150+ Countries Served','⚡ 24-Hour Express Available',
            '📞 24/7 Live Support','✦ 99.8% On-Time Delivery','🌍 Door-to-Door Worldwide'
          ].map((item, i) => (
            <span key={i} className="trust-item">
              <span className="dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '150+', label: 'Countries Served' },
              { value: '10M+', label: 'Packages Delivered' },
              { value: '99.8%', label: 'On-Time Rate' },
              { value: '24/7', label: 'Royal Support' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">What We Offer</span>
            <h2 className="section-title">World-Class Courier Services</h2>
            <p className="section-subtitle">
              From a single envelope to multi-tonne freight, every shipment receives the same 
              royal treatment — because your cargo deserves nothing less.
            </p>
          </div>
          <div className="services-grid">
            {[
              {
                icon: '✈️',
                title: 'International Express',
                desc: 'Swift, reliable delivery to over 150 countries in 3–7 business days. Our global network ensures your shipment takes the most efficient route to its destination.',
                tags: ['Door-to-Door', '3–7 Days', 'Full Tracking', 'Signature Proof'],
              },
              {
                icon: '🛡️',
                title: 'Secure Freight',
                desc: 'Bank-grade security for high-value shipments — diamonds, art, luxury goods, and sensitive documents. Tamper-evident seals, GPS monitoring, and armed escort options available.',
                tags: ['GPS Monitored', 'Insured', 'Armed Escort', 'Chain of Custody'],
              },
              {
                icon: '👑',
                title: 'Priority Royal',
                desc: 'Our flagship service for when only perfection will do. Dedicated courier, first-class handling, and delivery in 24–48 hours to major global hubs.',
                tags: ['24–48 Hours', 'Dedicated Agent', 'White Glove', 'VIP Handling'],
              },
              {
                icon: '🏢',
                title: 'Corporate Solutions',
                desc: 'Bespoke logistics infrastructure for businesses of all sizes. API integration, bulk pricing, dedicated account management, and SLA-backed delivery guarantees.',
                tags: ['API Access', 'Bulk Rates', 'SLA Guaranteed', 'Dedicated Manager'],
              },
            ].map(svc => (
              <div key={svc.title} className="service-card">
                <span className="service-icon">{svc.icon}</span>
                <h3 className="service-title">{svc.title}</h3>
                <p className="service-desc">{svc.desc}</p>
                <div>{svc.tags.map(t => <span key={t} className="service-tag">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="section" style={{background:'linear-gradient(180deg,var(--navy-800),var(--navy-700))'}}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">The Royal Difference</span>
            <h2 className="section-title">Why 2 Million Clients Trust Us</h2>
            <p className="section-subtitle">
              We don't just move packages — we protect your reputation, your relationships, and your most valuable assets.
            </p>
          </div>
          <div className="why-grid">
            {[
              { icon: '🔐', title: 'Impenetrable Security', desc: 'Every shipment is sealed, tracked, and insured. Our security protocols exceed international customs requirements, keeping your cargo safe from origin to destination.' },
              { icon: '⚡', title: 'Speed That Defies Distance', desc: 'Our optimised route engine calculates the fastest path through our 850-node global network. Less time in transit means less risk — and happier recipients.' },
              { icon: '📡', title: 'Live Tracking Technology', desc: 'Watch your parcel move in real time with our proprietary tracking platform. Every scan, every checkpoint, every border crossing — complete transparency, always.' },
              { icon: '🤝', title: 'White-Glove Support', desc: 'Real humans, available 24/7 in 18 languages. Our Royal Support team resolves 96% of queries on the first contact — because your peace of mind is non-negotiable.' },
              { icon: '🌍', title: 'Unrivalled Global Reach', desc: 'With operations in 150+ countries, border agents, and customs brokers on the ground, we navigate regulations so you never have to worry about international complexity.' },
              { icon: '💎', title: 'Guaranteed or Compensated', desc: 'We stand behind every shipment with our Royal Guarantee. If your package arrives late or damaged under our care, we compensate — no questions asked, no lengthy claims process.' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <span className="why-icon">{w.icon}</span>
                <h3 className="why-title">{w.title}</h3>
                <p className="why-desc">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">The Process</span>
            <h2 className="section-title">Shipping Made Effortlessly Royal</h2>
            <p className="section-subtitle">Four steps stand between you and a delivered shipment. That's all we ask.</p>
          </div>
          <div className="steps-grid">
            <div className="steps-connector" />
            {[
              { n: '1', title: 'Book Online', desc: 'Create your shipment in under 3 minutes. Enter origin, destination, and package details. Instant quote provided.' },
              { n: '2', title: 'We Pick Up', desc: 'A Royal Courier arrives at your door. Your package is inspected, sealed with a tamper-evident tag, and logged into our system.' },
              { n: '3', title: 'We Handle It', desc: 'Your shipment travels through our premium network — processed at secure hubs, cleared through customs by our agents, and expedited at every stage.' },
              { n: '4', title: 'Delivered', desc: 'Signature-confirmed delivery at the recipient\'s door. You receive a photo, timestamp, and delivery confirmation instantly.' },
            ].map(step => (
              <div key={step.n} className="step-item">
                <div className="step-number">{step.n}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Client Stories</span>
            <h2 className="section-title">Voices of the Royally Satisfied</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                stars: '★★★★★',
                text: '"We\'ve used every major courier service for our jewellery exports. Nothing comes close to First Royal Security Company. The Secure Freight service is in a league of its own — and we\'ve never had a single incident in three years."',
                name: 'Alexandra Beaumont',
                role: 'Director, Beaumont Fine Jewellers — London, UK',
                initials: 'AB',
              },
              {
                stars: '★★★★★',
                text: '"When we needed 200 contract documents delivered across five continents in 48 hours, FRSC didn\'t flinch. Every single package arrived on time. Their Corporate Solutions team felt less like a vendor and more like an extension of our own staff."',
                name: 'Marcus Okonkwo',
                role: 'COO, Atlas Ventures Group — Dubai, UAE',
                initials: 'MO',
              },
              {
                stars: '★★★★★',
                text: '"I ship handmade ceramics internationally. Fragile, irreplaceable pieces. FRSC\'s handling is extraordinary — proper packaging, live tracking, and the packages always arrive as if untouched. I recommend them to every artist I know."',
                name: 'Hiroko Matsumoto',
                role: 'Independent Artist — Tokyo, Japan',
                initials: 'HM',
              },
            ].map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">{t.stars}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Ship Like Royalty?</h2>
          <p className="cta-subtitle">
            Join over two million clients who trust First Royal Security Company with their most important shipments.
            Start today — your first shipment is on us.
          </p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/signup" className="btn btn-gold btn-lg">Create Free Account</Link>
            <Link to="/track" className="btn btn-outline btn-lg">Track Existing Package</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
