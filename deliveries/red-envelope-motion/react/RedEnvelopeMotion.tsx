"use client";

import { useEffect, useState } from "react";

import "./red-envelope-motion.css";

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1626;

export default function RedEnvelopeMotionPage() {
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState(true);

  useEffect(() => {
    const resize = () => {
      setScale(Math.min(1, window.innerWidth / CANVAS_WIDTH));
      setReady(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <main className={`red-envelope-stage ${ready ? "is-ready" : ""}`} style={{ height: CANVAS_HEIGHT * scale }}>
      <section
        className="red-envelope-canvas"
        style={{ transform: `scale(${scale})` }}
        aria-label="选择红包封面"
      >
        <header className="system-bar" aria-hidden="true">
          <b>13:29</b>
          <div className="wallet-brand"><span className="wallet-mark">›</span><strong>Bitget Wallet</strong></div>
          <div className="system-icons"><span className="signal">▮▮▮</span><span className="wifi">⌁</span><span className="battery">82</span></div>
        </header>

        <button className="back-button" type="button" aria-label="返回">‹</button>
        <h1>选择红包封面</h1>

        <section className="cover-carousel" aria-label="红包封面列表">
          <div className="side-cover side-cover-left" aria-hidden="true" />
          <div className="side-cover side-cover-right" aria-hidden="true" />

          <button
            type="button"
            className={`envelope-cover ${selected ? "is-selected" : ""}`}
            onClick={() => setSelected((value) => !value)}
            aria-pressed={selected}
          >
            <div className="envelope-backdrop" />

            <div className="character-motion">
              <img
                src="/assets/red-envelope-motion/illustrations/illustration-red-envelope-cat-horse-01.png"
                alt="招财猫骑着粉色小马，手捧金元宝"
              />
            </div>

            <i className="sparkle sparkle-one" aria-hidden="true">✦</i>
            <i className="sparkle sparkle-two" aria-hidden="true">✧</i>
            <i className="sparkle sparkle-three" aria-hidden="true">✦</i>

            <div className="envelope-front">
              <svg className="gold-rim" viewBox="0 0 552 95" aria-hidden="true">
                <path d="M10 5C105 84 199 88 276 81C354 88 448 84 542 5V43C451 116 101 116 10 43Z" fill="#ffd16d" />
                <path d="M18 12C111 75 202 80 276 74C350 80 441 75 534 12" fill="none" stroke="#fff0ae" strokeWidth="8" strokeLinecap="round" />
              </svg>
              <div className="cover-arrow" aria-hidden="true">›</div>
              <p className="wallet-line"><span>🤝</span><b>0x431b...711f</b> 发送</p>
              <p className="blessing">马到成功，事事顺心</p>
            </div>
            <span className="selection-ring" aria-hidden="true" />
          </button>
        </section>

        <button
          className="next-button"
          type="button"
          onClick={() => setConfirmed(true)}
          disabled={!selected}
        >
          下一步
        </button>

        {confirmed && (
          <div className="confirmation" role="status">
            <div className="confirmation-check">✓</div>
            <b>红包封面已选择</b>
            <span>小马与招财猫动效正在播放</span>
            <button type="button" onClick={() => setConfirmed(false)}>完成</button>
          </div>
        )}
      </section>
    </main>
  );
}
