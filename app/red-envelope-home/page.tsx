"use client";

import { useEffect, useRef, useState } from "react";

import "./red-envelope-home.css";

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1625;
const COIN_ROWS = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 9 }, (_, column) => `${row}-${column}`),
);

type LottieAnimation = { destroy: () => void };
type LottieRuntime = {
  loadAnimation: (options: {
    container: HTMLElement;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    path: string;
  }) => LottieAnimation;
};

declare global {
  interface Window {
    lottie?: LottieRuntime;
  }
}

function LottieGift() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let animation: LottieAnimation | undefined;
    let disposed = false;

    const start = () => {
      if (disposed || !mountRef.current || !window.lottie) return;
      animation = window.lottie.loadAnimation({
        container: mountRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/assets/red-envelope-home/lottie/gift-box-placeholder.json",
      });
    };

    if (window.lottie) {
      start();
    } else {
      const existing = document.querySelector<HTMLScriptElement>('script[data-red-envelope-lottie]');
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = "/assets/red-envelope-home/lottie/lottie.min.js";
        script.async = true;
        script.dataset.redEnvelopeLottie = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", start, { once: true });
      script.addEventListener("error", () => setFailed(true), { once: true });
    }

    return () => {
      disposed = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div className="reh-lottie-wrap" aria-label="礼盒动画占位">
      <div className="reh-lottie-orbit" aria-hidden="true" />
      <div className="reh-lottie" ref={mountRef} />
      {failed && <span className="reh-lottie-fallback" aria-hidden="true">礼</span>}
    </div>
  );
}

export default function RedEnvelopeHomePage() {
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const resize = () => {
      setScale(Math.min(1, window.innerWidth / CANVAS_WIDTH));
      setReady(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const act = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  return (
    <main className={`reh-stage ${ready ? "is-ready" : ""}`} style={{ height: CANVAS_HEIGHT * scale }}>
      <section className="reh-canvas" style={{ transform: `scale(${scale})` }} aria-label="红包心意">
        <header className="reh-status" aria-hidden="true">
          <b className="reh-time">22:59</b>
          <div className="reh-wallet-brand"><i>›</i><strong>Bitget Wallet</strong></div>
          <div className="reh-system-icons">
            <span className="reh-signal"><i /><i /><i /><i /></span>
            <span className="reh-wifi"><i /><i /><i /></span>
            <span className="reh-battery">36</span>
          </div>
        </header>

        <nav className="reh-nav" aria-label="页面工具">
          <button className="reh-back" type="button" onClick={() => act("返回") } aria-label="返回">‹</button>
          <div>
            <button className="reh-help" type="button" onClick={() => act("帮助中心") } aria-label="帮助">?</button>
            <button className="reh-menu" type="button" onClick={() => act("菜单") } aria-label="菜单"><i /><i /></button>
          </div>
        </nav>

        <h1>红包心意</h1>
        <p className="reh-subtitle">惊喜秒达，好友 0 门槛领</p>

        <section className="reh-hero" aria-label="礼盒 Lottie 动画">
          <div className="reh-pattern" aria-hidden="true">
            {COIN_ROWS.map((row, rowIndex) => (
              <div className="reh-coin-row" key={rowIndex}>
                {row.map((coin) => <i className="reh-coin" key={coin} />)}
              </div>
            ))}
          </div>
          <LottieGift />
        </section>

        <section className="reh-actions" aria-label="红包操作">
          <button type="button" onClick={() => act("发送红包") }>
            <img src="/assets/red-envelope-home/icons/icon-send-01.png" alt="" />
            <b>发送红包</b><span aria-hidden="true">›</span>
          </button>
          <button type="button" onClick={() => act("领取红包") }>
            <img src="/assets/red-envelope-home/icons/icon-receive-01.png" alt="" />
            <b>领取红包</b><span aria-hidden="true">›</span>
          </button>
        </section>

        {notice && <div className="reh-toast" role="status">{notice}</div>}
      </section>
    </main>
  );
}
