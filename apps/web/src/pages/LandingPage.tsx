import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import QEmoji from '../components/QEmoji'

const css = `
  :root {
    --plum: #4A3B6B;
    --lavender: #9B8EC4;
    --lav-mid: #7B6DAF;
    --lav-light: #C8BDE8;
    --lav-pale: #EDE8F7;
    --blush: #F2C4CE;
    --peach: #F7DECE;
    --butter: #F7EAC8;
    --cream: #FAF7F2;
    --parchment: #F3EDE3;
    --ink: #2E2440;
    --ink-mid: #5C5070;
    --ink-light: #9B92AD;
    --rule: #D8CEEA;
    --rule-red: #F0B8C0;
  }

  .landing * { margin: 0; padding: 0; box-sizing: border-box; }
  .landing { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); overflow-x: hidden; }

  .ruled {
    background-image: repeating-linear-gradient(transparent, transparent 31px, var(--rule) 31px, var(--rule) 32px);
  }

  .landing-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5vw;
    height: 64px;
    border-bottom: 1px solid var(--lav-pale);
  }
  .nav-logo {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 26px;
    color: white;
    text-decoration: none;
    letter-spacing: 0.5px;
    cursor: pointer;
    background: none;
    border: none;
  }
  .nav-links { display: flex; gap: 28px; align-items: center; }
  .nav-links a {
    color: var(--ink-mid);
    text-decoration: none;
    font-size: 14px;
    font-weight: 400;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--plum); }
  .nav-cta {
    background: var(--blush) !important;
    color: var(--plum) !important;
    font-weight: 500 !important;
    padding: 8px 20px !important;
    border-radius: 20px !important;
    transition: background 0.2s !important;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
  }
  .nav-cta:hover { background: white !important; }

  @media (max-width: 640px) {
    .nav-links { gap: 16px; }
    .nav-links a:not(.nav-login) { display: none; }
  }

  .hero {
    background: var(--cream);
    background-image: repeating-linear-gradient(transparent, transparent 31px, rgba(216,206,234,0.4) 31px, rgba(216,206,234,0.4) 32px);
    min-height: 90vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 80px 5vw;
    gap: 60px;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    left: 52px; top: 0; bottom: 0;
    width: 1px;
    background: var(--rule-red);
    opacity: 0.4;
  }
  .hero-text { position: relative; z-index: 2; }
  .hero-eyebrow {
    display: inline-block;
    background: var(--lav-mid);
    color: white;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 20px;
    margin-bottom: 24px;
  }
  .hero h1 {
    font-family: 'Recoleta', Georgia, serif;
    font-size: clamp(52px, 6vw, 78px);
    color: var(--plum);
    line-height: 1.1;
    margin-bottom: 12px;
  }
  .hero-underline {
    width: 260px;
    height: 6px;
    background: var(--blush);
    border-radius: 3px;
    margin-bottom: 28px;
    opacity: 0.8;
  }
  .hero-sub {
    font-family: 'Caveat', cursive;
    font-size: 27px;
    color: var(--lav-mid);
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  .hero-body {
    font-size: 15px;
    color: var(--ink-mid);
    line-height: 1.7;
    margin-bottom: 40px;
    max-width: 460px;
  }
  .hero-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hero-input {
    flex: 1;
    min-width: 220px;
    padding: 14px 20px;
    border-radius: 12px;
    border: 1.5px solid var(--lav-light);
    background: #FFFFFF;
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  .hero-input::placeholder { color: var(--ink-light); }
  .hero-input:focus { border-color: var(--blush); }
  .btn-primary {
    background: var(--blush);
    color: var(--plum);
    border: none;
    padding: 14px 28px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: white; transform: translateY(-1px); }
  .hero-note {
    margin-top: 14px;
    font-size: 12px;
    color: var(--ink-mid);
    display: inline-block;
  }

  .hero-visual {
    position: relative;
    height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .postcard {
    position: absolute;
    border-radius: 8px;
    background: var(--parchment);
    background-image: repeating-linear-gradient(transparent, transparent 22px, var(--rule) 22px, var(--rule) 23px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  }
  .pc1 {
    width: 280px; height: 185px;
    transform: rotate(-6deg) translate(-20px, -20px);
    background-color: white;
    background-image: repeating-linear-gradient(transparent, transparent 22px, var(--rule) 22px, var(--rule) 23px);
  }
  .pc2 {
    width: 280px; height: 185px;
    transform: rotate(3deg) translate(10px, 10px);
    background-color: var(--lav-pale);
  }
  .pc3 {
    width: 280px; height: 185px;
    transform: rotate(-1deg) translate(-5px, 30px);
    background-color: var(--peach);
    opacity: 0.9;
  }
  .pc-stamp {
    position: absolute;
    top: 14px; right: 14px;
    width: 38px; height: 46px;
    background: var(--lav-pale);
    border: 1.5px solid var(--lavender);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .pc-lines {
    position: absolute;
    bottom: 20px; left: 18px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .pc-line {
    height: 1px;
    background: var(--lav-light);
    opacity: 0.7;
  }
  .pc-handwriting {
    position: absolute;
    top: 18px; left: 18px;
    font-family: 'Caveat', cursive;
    font-size: 17px;
    color: var(--ink-mid);
    line-height: 1.7;
    max-width: 150px;
  }

  .landing section { padding: 100px 5vw; }

  .section-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--lavender);
    margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Recoleta', Georgia, serif;
    font-size: clamp(36px, 4vw, 52px);
    color: var(--ink);
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .section-title.light { color: var(--plum); }
  .section-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 17px;
    color: var(--ink-mid);
    max-width: 560px;
    line-height: 1.6;
    margin-bottom: 60px;
  }
  .section-sub.light { color: var(--lav-light); }
  .accent-bar {
    width: 180px; height: 5px;
    background: var(--blush);
    border-radius: 3px;
    margin-bottom: 20px;
    opacity: 0.8;
  }

  #how { background: var(--parchment); position: relative; }
  #how::before {
    content: '';
    position: absolute;
    left: 52px; top: 0; bottom: 0;
    width: 1px;
    background: var(--rule-red);
    opacity: 0.5;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-top: 20px;
  }
  .step-card {
    background: white;
    border-radius: 16px;
    padding: 28px 22px;
    position: relative;
    border: 1.5px solid var(--lav-pale);
    background-image: repeating-linear-gradient(transparent, transparent 27px, var(--rule) 27px, var(--rule) 28px);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(74,59,107,0.12); }
  .step-num {
    width: 40px; height: 40px;
    background: var(--lavender);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Recoleta', Georgia, serif;
    font-size: 17px;
    color: white;
    margin-bottom: 18px;
  }
  .step-card h3 {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 20px;
    color: var(--ink);
    margin-bottom: 10px;
    font-weight: 400;
  }
  .step-card p {
    font-size: 14px;
    color: var(--ink-mid);
    line-height: 1.65;
  }
  .step-emoji {
    font-size: 28px;
    margin-bottom: 14px;
    display: block;
  }

  #features { background: var(--parchment); position: relative; overflow: hidden; }
  #features::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(transparent, transparent 31px, rgba(74,59,107,0.05) 31px, rgba(74,59,107,0.05) 32px);
    pointer-events: none;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .feature-card {
    background: #FFFFFF;
    border-radius: 16px;
    padding: 30px 28px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    background-image: repeating-linear-gradient(transparent, transparent 27px, var(--rule) 27px, var(--rule) 28px);
    transition: transform 0.2s;
  }
  .feature-card:hover { transform: translateY(-3px); }
  .feature-icon {
    width: 52px; height: 52px;
    min-width: 52px;
    background: var(--lav-pale);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    border: 1.5px solid var(--lav-light);
  }
  .feature-card h3 {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 19px;
    color: var(--ink);
    margin-bottom: 8px;
    font-weight: 400;
  }
  .feature-card p {
    font-size: 14px;
    color: var(--ink-mid);
    line-height: 1.65;
  }

  #pricing { background: var(--cream); position: relative; }
  .pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    max-width: 820px;
  }
  .price-card {
    background: var(--parchment);
    border-radius: 20px;
    padding: 36px 32px;
    border: 1.5px solid var(--lav-light);
    background-image: repeating-linear-gradient(transparent, transparent 29px, var(--rule) 29px, var(--rule) 30px);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .price-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(74,59,107,0.12); }
  .price-card.featured {
    background: var(--lav-pale);
    border-color: var(--lavender);
    border-width: 2px;
  }
  .price-badge {
    position: absolute;
    top: 18px; right: 18px;
    background: var(--lavender);
    color: white;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 12px;
  }
  .price-tier {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 22px;
    color: var(--ink);
    margin-bottom: 6px;
    font-weight: 400;
  }
  .price-amount {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 46px;
    color: var(--lav-mid);
    line-height: 1;
    margin-bottom: 4px;
  }
  .price-period { font-size: 13px; color: var(--ink-light); margin-bottom: 24px; }
  .price-divider { height: 1px; background: var(--lav-light); margin-bottom: 24px; }
  .price-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
  .price-list li {
    font-size: 14px;
    color: var(--ink-mid);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.5;
  }
  .price-list li::before {
    content: '\\2726';
    color: var(--lavender);
    font-size: 10px;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .btn-outline {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: 1.5px solid var(--lavender);
    background: transparent;
    color: var(--lav-mid);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover { background: var(--lavender); color: white; }
  .btn-filled {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: var(--lavender);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-filled:hover { background: var(--lav-mid); transform: translateY(-1px); }

  #testimonials { background: var(--parchment); position: relative; overflow: hidden; }
  #testimonials::before {
    content: '';
    position: absolute;
    left: 52px; top: 0; bottom: 0;
    width: 1px;
    background: var(--rule-red);
    opacity: 0.5;
  }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }
  .testimonial-card {
    background: white;
    border-radius: 16px;
    padding: 28px 24px;
    border: 1.5px solid var(--lav-pale);
    position: relative;
    background-image: repeating-linear-gradient(transparent, transparent 25px, var(--rule) 25px, var(--rule) 26px);
  }
  .t-quote {
    font-family: 'Caveat', cursive;
    font-size: 20px;
    color: var(--ink-mid);
    line-height: 1.7;
    margin-bottom: 20px;
  }
  .t-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .t-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: var(--lav-pale);
    border: 2px solid var(--lavender);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
  }
  .t-name { font-size: 13px; font-weight: 500; color: var(--ink); }
  .t-handle { font-size: 12px; color: var(--ink-light); }

  #faq { background: var(--cream); }
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    max-width: 900px;
  }
  .faq-item {
    background: var(--parchment);
    border-radius: 14px;
    padding: 24px 22px;
    border: 1.5px solid var(--lav-pale);
    background-image: repeating-linear-gradient(transparent, transparent 26px, var(--rule) 26px, var(--rule) 27px);
  }
  .faq-q {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 17px;
    color: var(--ink);
    margin-bottom: 10px;
    font-weight: 400;
  }
  .faq-a { font-size: 14px; color: var(--ink-mid); line-height: 1.65; }

  #cta {
    background: var(--parchment);
    text-align: center;
    padding: 120px 5vw;
    position: relative;
    overflow: hidden;
    background-image: repeating-linear-gradient(transparent, transparent 31px, rgba(74,59,107,0.05) 31px, rgba(74,59,107,0.05) 32px);
  }
  .cta-postcard {
    display: inline-block;
    background: #FFFFFF;
    background-image: repeating-linear-gradient(transparent, transparent 26px, var(--rule) 26px, var(--rule) 27px);
    border-radius: 16px;
    padding: 60px 80px;
    max-width: 640px;
    width: 100%;
    position: relative;
    border: 1.5px solid var(--lav-light);
    box-shadow: 0 20px 60px rgba(74,59,107,0.15);
  }
  .cta-postcard::before {
    content: '\\1F49C';
    position: absolute;
    top: 20px; right: 20px;
    width: 44px; height: 54px;
    background: var(--lav-pale);
    border: 1.5px solid var(--lavender);
    border-radius: 4px;
    display: grid; place-items: center;
    font-size: 20px;
  }
  .cta-postcard h2 {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 42px;
    color: var(--ink);
    margin-bottom: 14px;
    font-weight: 400;
  }
  .cta-postcard p {
    font-family: 'Caveat', cursive;
    font-size: 24px;
    color: var(--ink-mid);
    line-height: 1.6;
    margin-bottom: 36px;
  }
  .cta-form {
    display: flex;
    gap: 10px;
    max-width: 420px;
    margin: 0 auto;
  }
  .cta-input {
    flex: 1;
    padding: 13px 18px;
    border-radius: 12px;
    border: 1.5px solid var(--lav-light);
    background: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    outline: none;
  }
  .cta-input:focus { border-color: var(--lavender); }

  .landing-footer {
    background: var(--plum);
    padding: 40px 5vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .footer-logo {
    font-family: 'Recoleta', Georgia, serif;
    font-size: 22px;
    color: white;
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { color: var(--lav-light); text-decoration: none; font-size: 13px; transition: color 0.2s; }
  .footer-links a:hover { color: white; }
  .footer-copy { font-size: 12px; color: var(--lav-light); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hero-text > * { animation: fadeUp 0.6s ease both; }
  .hero-text > *:nth-child(1) { animation-delay: 0.1s; }
  .hero-text > *:nth-child(2) { animation-delay: 0.2s; }
  .hero-text > *:nth-child(3) { animation-delay: 0.3s; }
  .hero-text > *:nth-child(4) { animation-delay: 0.35s; }
  .hero-text > *:nth-child(5) { animation-delay: 0.4s; }
  .hero-visual { animation: fadeUp 0.8s 0.3s ease both; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; }
    .hero-visual { display: none; }
    .steps-grid, .features-grid, .testimonials-grid, .faq-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
  }
`

export default function LandingPage() {
  const navigate = useNavigate()
  const [heroEmail, setHeroEmail] = useState('')
  const [ctaEmail, setCtaEmail] = useState('')

  function handleJoin(email: string) {
    navigate('/signup', { state: { email } })
  }

  return (
    <div className="landing">
      <style>{css}</style>

      <nav className="landing-nav">
        <button className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: 0 }}><img src="/brand/logo.png" alt="QuteNote" style={{ height: '36px', display: 'block' }} /></button>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Why Be Qute?</a>
          <a href="#pricing">Pricing</a>
          <a href="/login" className="nav-login" onClick={e => { e.preventDefault(); navigate('/login') }} style={{cursor:'pointer'}}>Log in</a>
          <button className="nav-cta" onClick={() => navigate('/signup')}>Join QuteNote</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <span className="hero-eyebrow">&#10022; Early access</span>
          <h1>Send something real.</h1>
          <div className="hero-underline"></div>
          <p className="hero-sub">Sometimes a text just doesn't cut it. Sometimes you have a lot to say and no idea how to start.</p>
          <p className="hero-body">QuteNote helps you turn what you're feeling into a real postcard, delivered to someone's actual mailbox. We'll handle the logistics, you just bring the feeling.</p>
          <form className="hero-form" onSubmit={e => { e.preventDefault(); handleJoin(heroEmail) }}>
            <input type="email" className="hero-input" placeholder="Your email address" value={heroEmail} onChange={e => setHeroEmail(e.target.value)} />
            <button type="submit" className="btn-primary">I'm in <QEmoji name="envelope" size={18} style={{ marginLeft: '4px' }} /></button>
          </form>
          <p className="hero-note">Free to join. Your first postcard is on us.</p>
        </div>
        <div className="hero-visual">
          <div className="postcard pc1">
            <span className="pc-stamp">&#128156;</span>
            <div className="pc-handwriting">Happy birthday Maya! You make everything more fun.</div>
            <div className="pc-lines">
              <div className="pc-line" style={{width:'80px'}}></div>
              <div className="pc-line" style={{width:'120px'}}></div>
              <div className="pc-line" style={{width:'60px'}}></div>
            </div>
          </div>
          <div className="postcard pc2">
            <span className="pc-stamp">&#127800;</span>
            <div className="pc-lines" style={{bottom:'30px', right:'14px', left:'auto'}}>
              <div className="pc-line" style={{width:'70px'}}></div>
              <div className="pc-line" style={{width:'90px'}}></div>
              <div className="pc-line" style={{width:'50px'}}></div>
            </div>
          </div>
          <div className="postcard pc3">
            <span className="pc-stamp">&#10024;</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div style={{position:'relative', zIndex:2}}>
          <div className="section-label">How it works</div>
          <div className="accent-bar"></div>
          <h2 className="section-title">Thoughtful doesn't have to be complicated.</h2>
          <p className="section-sub">Instead of doomscrolling on your phone, send a QuteNote. You write it on your phone, we send it in the mail.</p>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-emoji"><QEmoji name="heart" size={32} /></span>
              <div className="step-num">01</div>
              <h3>Add QTs</h3>
              <p>Connect with your favorite people.</p>
            </div>
            <div className="step-card">
              <span className="step-emoji">&#128276;</span>
              <div className="step-num">02</div>
              <h3>Get the nudge</h3>
              <p>Birthdays, hard days, weird days, and all the little moments worth creating connection.</p>
            </div>
            <div className="step-card">
              <span className="step-emoji">&#9997;&#65039;</span>
              <div className="step-num">03</div>
              <h3>Find your words</h3>
              <p>Write from the heart, with a little help when you need it (NO AI BS).</p>
            </div>
            <div className="step-card">
              <span className="step-emoji"><QEmoji name="envelope" size={32} /></span>
              <div className="step-num">04</div>
              <h3>Make their mailbox day</h3>
              <p>We print your note and mail it as a real postcard. They get a surprise at the mailbox and you get to feel cool for sending actual mail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div style={{position:'relative', zIndex:2}}>
          <div className="section-label">Why Be Qute?</div>
          <div className="accent-bar" style={{background:'var(--peach)'}}></div>
          <h2 className="section-title light">Card apps send cards.<br/>We're here for actual connection.</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">&#128274;</div>
              <div>
                <h3>No address awkwardness</h3>
                <p>Connect with your people on QuteNote and you never have to ask for an address yourself.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#128197;</div>
              <div>
                <h3>Remember the little things</h3>
                <p>Because being remembered feels pretty wonderful.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#9997;&#65039;</div>
              <div>
                <h3>Help when the words won't come</h3>
                <p>Get thoughtful prompts when you know what you feel but aren't quite sure how to say it.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#127912;</div>
              <div>
                <h3>Featured Artists</h3>
                <p>The card aisle at Walgreens is so bleh! We carefully curate artists so you can send beautiful art to your friends while also supporting talented creators.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="section-label">Pricing</div>
        <div className="accent-bar"></div>
        <h2 className="section-title">Make Mail Qute Again.</h2>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-tier">&#128140; Free Profile</div>
            <div className="price-amount">$0</div>
            <div className="price-period">forever free</div>
            <div className="price-divider"></div>
            <p className="faq-a" style={{marginBottom:'22px'}}>Your home base on QuteNote. Connect with your people, receive notes, and get ready to spread a little love.</p>
            <button className="btn-outline" onClick={() => navigate('/signup')}>Get started free</button>
          </div>
          <div className="price-card featured">
            <div className="price-badge">Most popular</div>
            <div className="price-tier">&#128156; QuteNote Subscriber</div>
            <div className="price-amount">$7.95</div>
            <div className="price-period">per month · cancel anytime</div>
            <div className="price-divider"></div>
            <p className="faq-a" style={{marginBottom:'22px'}}>Two physical postcards a month, printed and mailed for you.</p>
            <button className="btn-filled" onClick={() => navigate('/signup')}>Join QuteNote</button>
          </div>
        </div>
        <p style={{marginTop:'20px', fontSize:'13px', color:'var(--ink-light)', fontStyle:'italic'}}>Printing and postage included. No surprise charges.</p>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div style={{position:'relative', zIndex:2}}>
          <div className="section-label">What people are saying</div>
          <div className="accent-bar"></div>
          <h2 className="section-title">Yell it from the bleachers.</h2>
          <p className="section-sub">Don't save the good stuff for later. Tell people what they mean to you while you can. The little things have a way of becoming the big things.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="t-quote">"I cried when I got a postcard from my college roommate for my birthday. She lives in London. I didn't even know she had my address — turns out she didn't need it."</p>
              <div className="t-author">
                <div className="t-avatar">&#127800;</div>
                <div>
                  <div className="t-name">Priya M.</div>
                  <div className="t-handle">@priya_reads</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="t-quote">"I'm the world's worst texter but I actually sent 4 postcards in one week using QuteNote. The prompts help so much. I finally feel like a good friend again."</p>
              <div className="t-author">
                <div className="t-avatar">&#127874;</div>
                <div>
                  <div className="t-name">Jake T.</div>
                  <div className="t-handle">@jakethehuman</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p className="t-quote">"My mom keeps every postcard I've sent her on her fridge. She's never once kept a text. This app gets it."</p>
              <div className="t-author">
                <div className="t-avatar">&#128156;</div>
                <div>
                  <div className="t-name">Dani R.</div>
                  <div className="t-handle">@danitellsall</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="section-label">FAQ</div>
        <div className="accent-bar"></div>
        <h2 className="section-title">A few things you might be wondering.</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <div className="faq-q">How do you send a postcard without knowing someone's address?</div>
            <p className="faq-a">Recipients add their address once — it's encrypted and never shared with senders. You just tap send. We handle the rest. It's like Venmo but for showing up.</p>
          </div>
          <div className="faq-item">
            <div className="faq-q">How long does delivery take?</div>
            <p className="faq-a">Typically 3–5 business days within the US. We print and ship every postcard with care — not a factory vibe, a real, beautiful postcard.</p>
          </div>
          <div className="faq-item">
            <div className="faq-q">Can I design my own cards?</div>
            <p className="faq-a">Yes! You can choose from our curated artist designs or upload your own photo. We work with independent artists so every design is intentional.</p>
          </div>
          <div className="faq-item">
            <div className="faq-q">What if the recipient isn't on QuteNote yet?</div>
            <p className="faq-a">We send them a friendly link to claim their postcard and join. Their card still arrives in 3–5 business days.</p>
          </div>
          <div className="faq-item">
            <div className="faq-q">Is my address actually private?</div>
            <p className="faq-a">100%. Your address is encrypted and only used for fulfillment. Senders never see it. We will never sell your data — we're not that kind of evil platform.</p>
          </div>
          <div className="faq-item">
            <div className="faq-q">When does the app launch?</div>
            <p className="faq-a">iOS is coming soon — join now for early access and a free first postcard on us. Android follows shortly after.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="cta-postcard">
          <h2>Someone came to mind, didn't they?</h2>
          <p>Go make their day.</p>
          <form className="cta-form" onSubmit={e => { e.preventDefault(); handleJoin(ctaEmail) }}>
            <input type="email" className="cta-input" placeholder="Your email address" value={ctaEmail} onChange={e => setCtaEmail(e.target.value)} />
            <button type="submit" className="btn-primary">Send something real <QEmoji name="envelope" size={18} style={{ marginLeft: '4px' }} /></button>
          </form>
          <p style={{marginTop:'14px', fontSize:'12px', color:'var(--ink-light)'}}>Your first postcard is on us. No spam, ever.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">QuteNote</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Instagram</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copy">&copy; 2026 QuteNote. Send something real.</div>
      </footer>
    </div>
  )
}
