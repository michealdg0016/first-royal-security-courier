import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SERVICES = [
  {
    icon: '✈️',
    title: 'International Express',
    tagline: 'Fast. Reliable. Door-to-door worldwide.',
    desc: 'Swift, reliable delivery to over 150 countries in 3–7 business days. Our global network calculates the most efficient route for every shipment, minimising transit time without ever cutting corners on care.',
    features: [
      'Door-to-door service to 150+ countries',
      'Real-time GPS tracking at every checkpoint',
      'Signature-on-delivery with photo confirmation',
      'Customs clearance handled by our agents',
      'Shipment insured up to $10,000 standard',
      '3–7 business day delivery guarantee',
    ],
    tags: ['Door-to-Door', '3–7 Days', 'Full Tracking', 'Signature Proof'],
    badge: null,
  },
  {
    icon: '🛡️',
    title: 'Secure Freight',
    tagline: 'For what cannot be replaced.',
    desc: 'Bank-grade security for high-value shipments — diamonds, artwork, luxury goods, legal documents, and sensitive cargo. Tamper-evident seals, continuous GPS monitoring, and optional armed escort provide the highest security tier available in civilian logistics.',
    features: [
      'Tamper-evident sealing and dual-lock containers',
      'Continuous GPS monitoring throughout transit',
      'Chain-of-custody documentation at every handoff',
      'Armed escort available for ultra-high-value cargo',
      'Insurance up to $10M available',
      'Dedicated security coordinator assigned',
    ],
    tags: ['GPS Monitored', 'Insured', 'Armed Escort', 'Chain of Custody'],
    badge: 'Most Secure',
  },
  {
    icon: '👑',
    title: 'Priority Royal',
    tagline: 'When only perfection will do.',
    desc: 'Our flagship white-glove service for time-critical and high-importance shipments. A dedicated Royal Courier handles your package exclusively — first-class handling, priority routing, and delivery in 24–48 hours to major global hubs.',
    features: [
      '24–48 hour delivery to major global hubs',
      'Dedicated personal courier — no shared transport',
      'Priority queue at every processing hub',
      'Live updates every 2 hours throughout transit',
      'White-glove packing service available',
      'Direct line to your assigned courier',
    ],
    tags: ['24–48 Hours', 'Dedicated Agent', 'White Glove', 'VIP Handling'],
    badge: 'Most Popular',
  },
  {
    icon: '🏢',
    title: 'Corporate Solutions',
    tagline: 'Bespoke logistics at scale.',
    desc: 'Infrastructure-grade logistics for businesses of all sizes. From API integration and bulk shipping dashboards to dedicated account management and SLA-backed delivery guarantees — we become your logistics backbone, not just your courier.',
    features: [
      'REST API integration with your systems',
      'Volume pricing from 50+ shipments/month',
      'Dedicated account manager and ops team',
      'SLA-backed delivery with financial guarantees',
      'Consolidated billing and reporting dashboard',
      'Custom branding on delivery communications',
    ],
    tags: ['API Access', 'Bulk Rates', 'SLA Guaranteed', 'Dedicated Manager'],
    badge: null,
  },
]

const COMPARE = [
  { feature: 'Delivery Time', express: '3–7 Days', freight: '5–10 Days', royal: '24–48 Hours', corporate: 'Flexible SLA' },
  { feature: 'Tracking', express: 'Real-Time GPS', freight: 'Real-Time GPS', royal: 'Every 2 Hours Live', corporate: 'Real-Time + Dashboard' },
  { feature: 'Insurance', express: 'Up to $10K', freight: 'Up to $10M', royal: 'Up to $500K', corporate: 'Custom' },
  { feature: 'Pickup', express: 'Standard Courier', freight: 'Specialist Handler', royal: 'Dedicated Courier', corporate: 'Scheduled Bulk' },
  { feature: 'Support', express: '24/7 Chat & Phone', freight: 'Dedicated Manager', royal: 'Direct Courier Line', corporate: 'Account Manager' },
  { feature: 'Best For', express: 'Documents, Parcels', freight: 'Valuables, Art, Jewels', royal: 'Urgent, Important', corporate: 'Business, Bulk' },
]

export default function Services() {
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
            <div className="hero-eyebrow"><span>✦</span> Four Tiers. One Standard. Royal.</div>
            <h1 className="page-hero-title">World-Class<br />Courier Services</h1>
            <p className="page-hero-subtitle">
              From a single envelope to high-security freight, every shipment receives the same obsessive
              attention to security, speed, and care. Choose the tier that matches your needs.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-gold">Start Shipping</Link>
              <Link to="/contact" className="btn btn-outline">Get a Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES DETAIL ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">What We Offer</span>
            <h2 className="section-title">Pick Your Service</h2>
            <p className="section-subtitle">
              Every tier includes full tracking, insurance, and 24/7 Royal Support. The difference is in the
              speed, security level, and exclusivity of handling.
            </p>
          </div>
          <div className="services-detail-list">
            {SERVICES.map((svc, i) => (
              <div key={svc.title} className={`service-detail-card ${i % 2 === 1 ? 'reverse' : ''}`}>
                <div className="service-detail-main">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                    <span style={{ fontSize: 48 }}>{svc.icon}</span>
                    <div>
                      {svc.badge && <span className="service-badge">{svc.badge}</span>}
                      <h3 className="service-detail-title">{svc.title}</h3>
                      <p className="service-detail-tagline">{svc.tagline}</p>
                    </div>
                  </div>
                  <p className="service-detail-desc">{svc.desc}</p>
                  <div style={{ marginTop: 20 }}>
                    {svc.tags.map(t => <span key={t} className="service-tag">{t}</span>)}
                  </div>
                  <Link to="/signup" className="btn btn-gold" style={{ marginTop: 28 }}>
                    Get Started ›
                  </Link>
                </div>
                <div className="service-detail-features">
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
                    What's Included
                  </p>
                  <ul className="service-features-list">
                    {svc.features.map(f => (
                      <li key={f}>
                        <span className="service-feature-check">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARE TABLE ── */}
      <section className="section" style={{ background: 'linear-gradient(180deg,var(--navy-800),var(--navy-700))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Side by Side</span>
            <h2 className="section-title">Compare Services</h2>
            <p className="section-subtitle">Not sure which tier is right for you? Here's a quick breakdown.</p>
          </div>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  <th><span>✈️</span><br />International<br />Express</th>
                  <th><span>🛡️</span><br />Secure<br />Freight</th>
                  <th className="featured-col"><span>👑</span><br />Priority<br />Royal</th>
                  <th><span>🏢</span><br />Corporate<br />Solutions</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(row => (
                  <tr key={row.feature}>
                    <td className="compare-feature">{row.feature}</td>
                    <td>{row.express}</td>
                    <td>{row.freight}</td>
                    <td className="featured-col">{row.royal}</td>
                    <td>{row.corporate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="section">
        <div className="container">
          <div className="guarantee-banner">
            <div className="guarantee-icon">💎</div>
            <div>
              <h3 className="guarantee-title">The Royal Guarantee</h3>
              <p className="guarantee-desc">
                Every shipment we handle comes with our unconditional Royal Guarantee. If your package arrives late or
                damaged under our care, we compensate — no questions asked, no lengthy claims process, no small print.
                That's the standard we hold ourselves to.
              </p>
            </div>
            <Link to="/signup" className="btn btn-gold" style={{ flexShrink: 0 }}>Claim Your Guarantee</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Ship Like Royalty?</h2>
          <p className="cta-subtitle">
            Create your free account and get your first shipment moving in under three minutes.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-gold btn-lg">Create Free Account</Link>
            <Link to="/contact" className="btn btn-outline btn-lg">Talk to Sales</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
