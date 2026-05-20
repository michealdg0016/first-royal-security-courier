import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const OFFICES = [
  { city: 'London', role: 'Global HQ', address: '1 Royal Exchange, EC3V 3LA', phone: '+44 20 7946 0100', flag: '🇬🇧' },
  { city: 'Dubai', role: 'MENA Operations', address: 'DIFC Gate Village, Building 4', phone: '+971 4 321 0100', flag: '🇦🇪' },
  { city: 'New York', role: 'Americas Hub', address: '30 Rockefeller Plaza, NY 10112', phone: '+1 212 946 0100', flag: '🇺🇸' },
  { city: 'Singapore', role: 'Asia-Pacific Hub', address: 'Marina Bay Financial Centre, Tower 2', phone: '+65 6123 0100', flag: '🇸🇬' },
  { city: 'Johannesburg', role: 'Africa Operations', address: 'Sandton City, 196 Fifth Street', phone: '+27 11 946 0100', flag: '🇿🇦' },
  { city: 'Sydney', role: 'Oceania Hub', address: '1 Martin Place, NSW 2000', phone: '+61 2 9946 0100', flag: '🇦🇺' },
]

const FAQS = [
  {
    q: 'How do I track my shipment?',
    a: 'Visit our Track page and enter your tracking code (format: FRSC-XXXX-XXXX-XXXX). You\'ll see real-time status updates, location, and estimated delivery time. You can also track by logging into your account under "My Shipments".',
  },
  {
    q: 'What is the Royal Guarantee?',
    a: 'Every shipment we handle is backed by our unconditional Royal Guarantee. If your package arrives late or damaged under our care, we compensate you fully — no lengthy claims process, no small print, no questions asked.',
  },
  {
    q: 'How long does international delivery take?',
    a: 'Delivery times depend on the service tier. International Express takes 3–7 business days. Priority Royal delivers in 24–48 hours to major hubs. Secure Freight varies by destination, typically 5–10 days. Corporate Solutions use custom SLAs.',
  },
  {
    q: 'How do I make a claim for a lost or damaged shipment?',
    a: 'Contact our support team within 7 days of the expected delivery date. Our claims process is simple: one form, one call, and we handle the rest. Most claims are resolved within 48 hours of submission.',
  },
  {
    q: 'Can I ship dangerous or restricted goods?',
    a: 'We can handle many regulated goods including certain chemicals, lithium batteries, and restricted items, provided proper documentation is submitted. Contact our specialist freight team before booking — we\'ll advise on compliance requirements.',
  },
  {
    q: 'Do you offer pickup from my address?',
    a: 'Yes. All service tiers include door-to-door pickup. When you book, select your preferred pickup time window. A Royal Courier will arrive at your address, inspect and seal your shipment, and provide a receipt on the spot.',
  },
  {
    q: 'Is my shipment insured?',
    a: 'Yes — all shipments carry standard insurance up to $10,000 included in the price. Higher coverage is available: Secure Freight supports up to $10M, and Priority Royal up to $500K. Corporate accounts can arrange custom coverage.',
  },
  {
    q: 'How do I get corporate pricing?',
    a: 'Corporate pricing begins at 50+ shipments per month. Contact our sales team with your estimated volume and destinations and we\'ll provide a tailored quote within 24 hours — including SLAs, API access, and a dedicated account manager.',
  },
]

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div>
      <Navbar />

      {/* ── PAGE HERO ── */}
      <section className="page-hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-2" />
        <div className="container">
          <div className="page-hero-content">
            <div className="hero-eyebrow"><span>📞</span> 24/7 Royal Support</div>
            <h1 className="page-hero-title">We're Here.<br />Always.</h1>
            <p className="page-hero-subtitle">
              Questions, quotes, claims, or just need to talk through a complex shipment — our Royal Support
              team is available around the clock, in 18 languages, across every channel.
            </p>
          </div>
        </div>
      </section>

      {/* ── QUICK CONTACT STRIP ── */}
      <div style={{ background: 'linear-gradient(135deg,var(--navy-700),var(--navy-600))', borderBottom: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container">
          <div className="contact-quick-strip">
            {[
              { icon: '📞', label: '24/7 Hotline', value: '+1-800-ROYAL-01', sub: 'All enquiries, all hours' },
              { icon: '📧', label: 'Email Support', value: 'support@firstroyalsecurity.com', sub: 'Response within 2 hours' },
              { icon: '💬', label: 'Live Chat', value: 'Available on this page', sub: 'Instant connection to an agent' },
              { icon: '🏢', label: 'Global HQ', value: 'London, United Kingdom', sub: '1 Royal Exchange, EC3V 3LA' },
            ].map(c => (
              <div key={c.label} className="contact-quick-item">
                <span style={{ fontSize: 24, marginBottom: 8, display: 'block' }}>{c.icon}</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 2 }}>{c.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTACT FORM + INFO ── */}
      <section className="section" id="contact-form">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div>
              <span className="section-eyebrow">Send a Message</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,36px)', color: 'var(--cream)', margin: '12px 0 8px', lineHeight: 1.2 }}>
                How Can We Help?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Fill in the form and a member of our Royal Support team will respond within two hours.
                For urgent matters, call our 24/7 hotline directly.
              </p>

              {submitted ? (
                <div className="contact-success">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: 'var(--cream)', marginBottom: 8 }}>
                    Message Received
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                    Thank you, {form.name}. A Royal Support agent will contact you at <strong style={{ color: 'var(--gold-400)' }}>{form.email}</strong> within two hours.
                  </p>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: 'general', message: '' }) }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={submit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input name="name" className="form-input" placeholder="Your name" value={form.name} onChange={handle} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handle} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select name="subject" className="form-input" value={form.subject} onChange={handle}>
                      <option value="general">General Enquiry</option>
                      <option value="quote">Request a Quote</option>
                      <option value="tracking">Tracking Issue</option>
                      <option value="claim">File a Claim</option>
                      <option value="corporate">Corporate Solutions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      name="message"
                      className="form-input"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={form.message}
                      onChange={handle}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-gold btn-full" style={{ marginTop: 8 }}>
                    Send Message ›
                  </button>
                </form>
              )}
            </div>

            {/* Right column info */}
            <div>
              <span className="section-eyebrow">Response Times</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,36px)', color: 'var(--cream)', margin: '12px 0 32px', lineHeight: 1.2 }}>
                We Move Fast. Even on Support.
              </h2>
              <div className="response-cards">
                {[
                  { icon: '💬', label: 'Live Chat', time: 'Under 60 seconds', desc: 'Connect instantly via the chat widget on any page.' },
                  { icon: '📞', label: 'Phone', time: 'Immediate', desc: 'Call +1-800-ROYAL-01 any time, day or night.' },
                  { icon: '📧', label: 'Email', time: 'Within 2 hours', desc: 'Detailed responses from our specialist team.' },
                  { icon: '📝', label: 'Claims', time: 'Within 48 hours', desc: 'Claims resolved and compensated — no hassle.' },
                ].map(r => (
                  <div key={r.label} className="response-card">
                    <span style={{ fontSize: 22 }}>{r.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)' }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--gold-400)', fontWeight: 600 }}>{r.time}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-track-cta">
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cream)', marginBottom: 6 }}>Looking for your shipment?</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Use our live tracking tool for instant status updates — no need to contact support.
                </p>
                <Link to="/track" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  📦 Track My Shipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OFFICES ── */}
      <section className="section" style={{ background: 'linear-gradient(180deg,var(--navy-800),var(--navy-700))' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Global Offices</span>
            <h2 className="section-title">We're Local, Everywhere</h2>
            <p className="section-subtitle">
              Six regional hubs. Consistent Royal standards across every location.
            </p>
          </div>
          <div className="offices-grid">
            {OFFICES.map(o => (
              <div key={o.city} className="office-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{o.flag}</span>
                  <div>
                    <div className="office-city">{o.city}</div>
                    <div className="office-role">{o.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{o.address}</p>
                <p style={{ fontSize: 13, color: 'var(--gold-400)', fontWeight: 600 }}>{o.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Common Questions</span>
            <h2 className="section-title">Frequently Asked</h2>
            <p className="section-subtitle">
              Can't find what you need? Our live chat team is one click away.
            </p>
          </div>
          <div className="faq-list" style={{ maxWidth: 780, margin: '0 auto' }}>
            {FAQS.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  className={`faq-question ${openFaq === i ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className={`faq-chevron ${openFaq === i ? 'open' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer open">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
