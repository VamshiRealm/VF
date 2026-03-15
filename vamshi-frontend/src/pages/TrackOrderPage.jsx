import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

const STATUS_COLORS = {
  RECEIVED:   { dot: "#94a3b8", text: "rgba(180,200,255,0.6)" },
  CUTTING:    { dot: "#f59e0b", text: "#fbbf24" },
  STITCHING:  { dot: "#7aaeff", text: "#7aaeff" },
  FINISHING:  { dot: "#a78bfa", text: "#c4b5fd" },
  READY:      { dot: "#34d399", text: "#6ee7b7" },
};

const STATUS_LABELS = {
  RECEIVED:  "Order Received",
  CUTTING:   "Garment Cutting",
  STITCHING: "Stitching",
  FINISHING: "Finishing Process",
  READY:     "Ready for Delivery",
};

const STATUS_ORDER = ["RECEIVED", "CUTTING", "STITCHING", "FINISHING", "READY"];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');

  .vf-body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Montserrat', sans-serif;
    background: radial-gradient(ellipse at 30% 20%, rgba(59,100,180,0.18) 0%, transparent 60%),
                radial-gradient(ellipse at 75% 80%, rgba(30,60,140,0.2) 0%, transparent 55%),
                #0b1628;
    position: relative;
    overflow: hidden;
  }

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

  .vf-card {
    position: relative;
    width: 520px;
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

  /* Brand */
  .vf-brand {
    text-align: center;
    margin-bottom: 36px;
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
  .vf-monogram-line { flex: 1; height: 1px; }
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

  /* Order meta */
  .vf-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 0 28px;
    animation: vfFadeUp 0.8s 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }
  .vf-divider-line { flex: 1; height: 1px; background: rgba(120,170,255,0.12); }
  .vf-divider-text {
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(120,170,255,0.35);
    text-transform: uppercase;
    white-space: nowrap;
  }

  .vf-order-meta {
    text-align: center;
    margin-bottom: 32px;
    animation: vfFadeUp 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }
  .vf-order-id {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    color: #c8deff;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }
  .vf-customer-info {
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 2px;
    color: rgba(120,170,255,0.5);
    text-transform: uppercase;
  }

  /* Garments */
  .vf-garments {
    display: flex;
    flex-direction: column;
    gap: 0;
    animation: vfFadeUp 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }

  .vf-garment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid rgba(120,170,255,0.08);
    transition: background 0.3s;
    gap: 16px;
  }
  .vf-garment-row:last-child { border-bottom: none; }

  .vf-garment-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .vf-garment-index {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 300;
    color: rgba(120,170,255,0.25);
    min-width: 20px;
    line-height: 1;
  }
  .vf-garment-type {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #c8deff;
    text-transform: uppercase;
  }

  .vf-garment-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .vf-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .vf-status-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
  }

  /* Progress bar */
  .vf-progress-wrap {
    margin: 32px 0 0;
    animation: vfFadeUp 0.8s 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0;
    transform: translateY(12px);
  }
  .vf-progress-label {
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(120,170,255,0.4);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .vf-progress-track {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .vf-progress-line-bg {
    position: absolute;
    top: 50%;
    left: 0; right: 0;
    height: 1px;
    background: rgba(120,170,255,0.12);
    transform: translateY(-50%);
  }
  .vf-progress-line-fill {
    position: absolute;
    top: 50%;
    left: 0;
    height: 1px;
    background: linear-gradient(to right, #2a5fc4, #7aaeff);
    transform: translateY(-50%);
    transition: width 1s cubic-bezier(0.16,1,0.3,1);
  }
  .vf-progress-step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 1;
  }
  .vf-progress-node {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(120,170,255,0.2);
    background: #0b1628;
    transition: all 0.5s ease;
  }
  .vf-progress-node.active {
    background: #7aaeff;
    border-color: #7aaeff;
    box-shadow: 0 0 8px rgba(120,170,255,0.4);
  }
  .vf-progress-node.done {
    background: #4a90e2;
    border-color: #4a90e2;
  }
  .vf-progress-step-label {
    font-size: 7px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(120,170,255,0.3);
    text-align: center;
    max-width: 52px;
    line-height: 1.3;
  }
  .vf-progress-step-label.active { color: #7aaeff; }

  /* Loading */
  .vf-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0b1628;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(120,170,255,0.4);
  }
`;

function OverallProgress({ garments }) {
  const statuses = garments.map((g) => STATUS_ORDER.indexOf(g.status));
  const minIdx = Math.min(...statuses);
  const fillPct = (minIdx / (STATUS_ORDER.length - 1)) * 100;

  return (
    <div className="vf-progress-wrap">
      <div className="vf-progress-label">Overall Progress</div>
      <div className="vf-progress-track">
        <div className="vf-progress-line-bg" />
        <div className="vf-progress-line-fill" style={{ width: `${fillPct}%` }} />
        {STATUS_ORDER.map((s, i) => {
          const isActive = i === minIdx;
          const isDone = i < minIdx;
          return (
            <div className="vf-progress-step" key={s}>
              <div
                className={`vf-progress-node ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
              />
              <div className={`vf-progress-step-label ${isActive || isDone ? "active" : ""}`}>
                {STATUS_LABELS[s]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API}/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order", err);
    }
  };

  if (!order) {
    return (
      <>
        <style>{styles}</style>
        <div className="vf-loading">Loading order status…</div>
      </>
    );
  }

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
            <div className="vf-brand-tagline">Master Tailors · Est. Since</div>
          </div>

          {/* Divider */}
          <div className="vf-divider">
            <div className="vf-divider-line" />
            <span className="vf-divider-text">Order Details</span>
            <div className="vf-divider-line" />
          </div>

          {/* Order meta */}
          <div className="vf-order-meta">
            <div className="vf-order-id">Order #{order.id}</div>
            <div className="vf-customer-info">
              {order.customer.name} &nbsp;·&nbsp; {order.customer.phone}
            </div>
          </div>

          {/* Garment rows */}
          <div className="vf-garments">
            {order.garments.map((g, i) => {
              const s = STATUS_COLORS[g.status] || STATUS_COLORS.RECEIVED;
              return (
                <div className="vf-garment-row" key={g.id}>
                  <div className="vf-garment-left">
                    <span className="vf-garment-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="vf-garment-type">{g.type}</span>
                  </div>
                  <div className="vf-garment-right">
                    <div className="vf-status-dot" style={{ background: s.dot }} />
                    <span className="vf-status-label" style={{ color: s.text }}>
                      {STATUS_LABELS[g.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <OverallProgress garments={order.garments} />
        </div>
      </div>
    </>
  );
}