import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');

  .vf-body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Montserrat', sans-serif;
    background: radial-gradient(ellipse at 30% 20%, rgba(59,100,180,0.18) 0%, transparent 60%),
                radial-gradient(ellipse at 75% 80%, rgba(30,60,140,0.2) 0%, transparent 55%),
                #0b1628;
    position: relative;
    overflow: hidden;
  }

  /* Scan lines */
  .vf-scan-line {
    position: fixed;
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(120,170,255,0.07), transparent);
    animation: vfScanDown 9s ease-in-out infinite;
    pointer-events: none;
  }
  .vf-scan-line:nth-child(1) { left: 12%; animation-delay: 0s; }
  .vf-scan-line:nth-child(2) { left: 30%; animation-delay: 2s; }
  .vf-scan-line:nth-child(3) { left: 52%; animation-delay: 4s; }
  .vf-scan-line:nth-child(4) { left: 72%; animation-delay: 6s; }
  .vf-scan-line:nth-child(5) { left: 88%; animation-delay: 1s; }

  @keyframes vfScanDown {
    0%   { opacity: 0; transform: translateY(-100%); }
    40%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(200%); }
  }

  /* Corner ornaments */
  .vf-corner {
    position: fixed;
    width: 72px;
    height: 72px;
    opacity: 0.25;
    pointer-events: none;
  }
  .vf-corner-tl { top: 22px; left: 22px; border-top: 1px solid #7aaeff; border-left: 1px solid #7aaeff; }
  .vf-corner-tr { top: 22px; right: 22px; border-top: 1px solid #7aaeff; border-right: 1px solid #7aaeff; }
  .vf-corner-bl { bottom: 22px; left: 22px; border-bottom: 1px solid #7aaeff; border-left: 1px solid #7aaeff; }
  .vf-corner-br { bottom: 22px; right: 22px; border-bottom: 1px solid #7aaeff; border-right: 1px solid #7aaeff; }

  /* Card */
  .vf-card {
    position: relative;
    width: 420px;
    max-width: calc(100vw - 40px);
    padding: 52px 48px 48px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(120,170,255,0.18);
    backdrop-filter: blur(28px);
    animation: vfCardReveal 0.9s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(22px);
    z-index: 1;
  }
  .vf-card::before {
    content: '';
    position: absolute;
    top: 0; left: 12%; right: 12%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(120,170,255,0.5), transparent);
  }

  @keyframes vfCardReveal {
    to { opacity: 1; transform: translateY(0); }
  }

  /* Brand header */
  .vf-brand {
    text-align: center;
    margin-bottom: 44px;
    animation: vfFadeUp 0.8s 0.15s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }

  @keyframes vfFadeUp {
    to { opacity: 1; transform: translateY(0); }
  }

  .vf-monogram-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .vf-monogram-line {
    flex: 1;
    height: 1px;
  }
  .vf-monogram-line-left  { background: linear-gradient(to right, transparent, rgba(120,170,255,0.35)); }
  .vf-monogram-line-right { background: linear-gradient(to left,  transparent, rgba(120,170,255,0.35)); }

  .vf-monogram-letter {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 300;
    color: #7aaeff;
    line-height: 1;
    letter-spacing: -1px;
  }
  .vf-brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 6px;
    color: #c8deff;
    text-transform: uppercase;
  }
  .vf-brand-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-size: 11px;
    font-style: italic;
    letter-spacing: 2px;
    color: rgba(120,170,255,0.4);
    margin-top: 6px;
  }

  /* Fields */
  .vf-field {
    margin-bottom: 28px;
    animation: vfFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }
  .vf-field:nth-of-type(1) { animation-delay: 0.3s; }
  .vf-field:nth-of-type(2) { animation-delay: 0.4s; }

  .vf-label {
    display: block;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 3px;
    color: rgba(120,170,255,0.55);
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .vf-field-wrap { position: relative; }

  .vf-input {
    width: 100%;
    background: rgba(120,170,255,0.05);
    border: none;
    border-bottom: 1px solid rgba(120,170,255,0.2);
    padding: 10px 0;
    color: #e8f0ff;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 1px;
    outline: none;
    transition: border-color 0.4s;
    box-shadow: none;
  }
  .vf-input::placeholder { color: rgba(120,170,255,0.2); }

  .vf-underline {
    position: absolute;
    bottom: 0; left: 0;
    height: 1px;
    width: 0;
    background: linear-gradient(to right, #4a90e2, #7aaeff);
    transition: width 0.5s cubic-bezier(0.16,1,0.3,1);
    pointer-events: none;
  }
  .vf-input:focus ~ .vf-underline { width: 100%; }

  /* Button */
  .vf-btn {
    width: 100%;
    padding: 16px;
    background: transparent;
    border: 1px solid rgba(120,170,255,0.3);
    color: #7aaeff;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 5px;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: color 0.4s, border-color 0.4s;
    margin-top: 10px;
    animation: vfFadeUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }
  .vf-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #2a5fc4, #4a90e2);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  .vf-btn:hover::before { transform: scaleX(1); }
  .vf-btn:hover { color: #fff; border-color: #4a90e2; }
  .vf-btn span { position: relative; z-index: 1; }

  /* Error */
  .vf-error {
    font-size: 10px;
    letter-spacing: 1px;
    color: #7ab0ff;
    margin-bottom: 20px;
    padding: 10px 14px;
    border-left: 2px solid #4a90e2;
    background: rgba(74,144,226,0.08);
    animation: vfFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
  }
`;

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (!success) setError("Invalid username or password");
  };

  return (
    <>
      <style>{styles}</style>

      <div className="vf-body">
        {/* Scan lines */}
        <div className="vf-scan-line" />
        <div className="vf-scan-line" />
        <div className="vf-scan-line" />
        <div className="vf-scan-line" />
        <div className="vf-scan-line" />

        {/* Corner ornaments */}
        <div className="vf-corner vf-corner-tl" />
        <div className="vf-corner vf-corner-tr" />
        <div className="vf-corner vf-corner-bl" />
        <div className="vf-corner vf-corner-br" />

        <div className="vf-card">
          {/* Brand header */}
          <div className="vf-brand">
            <div className="vf-monogram-row">
              <div className="vf-monogram-line vf-monogram-line-left" />
              <span className="vf-monogram-letter">VF</span>
              <div className="vf-monogram-line vf-monogram-line-right" />
            </div>
            <div className="vf-brand-name">Vamshi Fashion</div>
            <div className="vf-brand-tagline">Bespoke Tailors · Est. Since 2010</div>
          </div>

          {/* Error */}
          {error && <div className="vf-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="vf-field">
              <label className="vf-label" htmlFor="username">Username</label>
              <div className="vf-field-wrap">
                <input
                  id="username"
                  type="text"
                  className="vf-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <div className="vf-underline" />
              </div>
            </div>

            <div className="vf-field">
              <label className="vf-label" htmlFor="password">Password</label>
              <div className="vf-field-wrap">
                <input
                  id="password"
                  type="password"
                  className="vf-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <div className="vf-underline" />
              </div>
            </div>

            <button type="submit" className="vf-btn">
              <span>Login</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}