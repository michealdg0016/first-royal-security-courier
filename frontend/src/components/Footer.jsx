import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,background:'linear-gradient(135deg,#c9a227,#d4b447)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#050d1f'}}>👑</div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:'var(--gold-400)'}}>First Royal Security Co.</div>
                <div style={{fontSize:9,color:'var(--text-muted)',letterSpacing:'1.5px',textTransform:'uppercase'}}>International Courier</div>
              </div>
            </div>
            <p className="footer-desc">
              Trusted by over two million clients worldwide. We deliver your most precious cargo with the care, security, and precision of royalty. Every parcel, every time — no exceptions.
            </p>
            <div style={{marginTop:20,display:'flex',gap:12}}>
              {['ISO 9001', 'IATA Member', 'WCA Network'].map(cert => (
                <span key={cert} style={{padding:'4px 10px',border:'1px solid rgba(255,255,255,0.1)',borderRadius:999,fontSize:11,color:'var(--text-muted)',fontWeight:600}}>{cert}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Services</h4>
            <ul className="footer-links">
              <li><Link to="/services">International Express</Link></li>
              <li><Link to="/services">Secure Freight</Link></li>
              <li><Link to="/services">Priority Royal</Link></li>
              <li><Link to="/services">Corporate Solutions</Link></li>
              <li><Link to="/contact">Get a Quote</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/about#network">Our Network</Link></li>
              <li><Link to="/contact">Careers</Link></li>
              <li><Link to="/contact">Press</Link></li>
              <li><Link to="/contact">Partners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/track">Track Shipment</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/contact#contact-form">File a Claim</Link></li>
              <li><Link to="/contact#faq">FAQ</Link></li>
              <li><Link to="/contact">Service Alerts</Link></li>
            </ul>
            <div style={{marginTop:24}}>
              <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>24/7 Royal Hotline</p>
              <p style={{fontSize:15,color:'var(--gold-400)',fontWeight:600}}>+1-800-ROYAL-01</p>
              <p style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>support@firstroyalsecurity.com</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} First Royal Security Company. All rights reserved.</p>
          <div className="footer-certifications">
            <span className="footer-cert">🔒 SSL Secured</span>
            <span className="footer-cert">✦ GDPR Compliant</span>
            <span className="footer-cert">⚖ Licensed & Bonded</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
