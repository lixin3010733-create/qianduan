"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import "./red-envelope-video.css";

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1626;

type Screen = "home" | "cover" | "count" | "amount";

const TOKENS = [
  { symbol: "SOL", chain: "Solana", balance: "0.0121", price: "$1.2467", color: "#111827" },
  { symbol: "BNB", chain: "BNB Chain", balance: "0.0014", price: "$0.9931", color: "#f2ba19" },
  { symbol: "USDC", chain: "Base", balance: "0.0525", price: "$0.0525", color: "#2775ca" },
  { symbol: "USDT", chain: "BNB Chain", balance: "0.00", price: "$0.00", color: "#26a17b" },
  { symbol: "ETH", chain: "BNB Chain", balance: "0.00", price: "$0.00", color: "#6875e8" },
  { symbol: "PUSD", chain: "BNB Chain", balance: "0.00", price: "$0.00", color: "#51bd79" },
];

const COVERS = [
  { id: "red", asset: "/assets/red-envelope-video/images/image-cover-card-red-01.png", alt: "小马招财猫红色红包封面" },
  { id: "green", asset: "/assets/red-envelope-video/images/image-cover-card-green-01.png", alt: "机器人绿色红包封面" },
  { id: "orange", asset: "/assets/red-envelope-video/images/image-cover-card-orange-01.png", alt: "比特币招财猫橙色红包封面" },
];

function StatusBar({ pink = false }: { pink?: boolean }) {
  return (
    <div className={`rv-status ${pink ? "rv-status-pink" : ""}`} aria-hidden="true">
      <b>18:30</b>
      <div className="rv-island"><span>小杨生煎</span></div>
      <i className="rv-record" />
      <span className="rv-wifi">⌁</span>
      <span className="rv-battery">44</span>
    </div>
  );
}

function NumericKeypad({ onKey }: { onKey: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];
  return (
    <div className="rv-keypad" aria-label="数字键盘">
      {keys.map((key) => (
        <button key={key} type="button" onClick={() => onKey(key)} aria-label={key === "⌫" ? "删除" : key}>
          {key}
        </button>
      ))}
    </div>
  );
}

export default function RedEnvelopeVideoPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const initialToken = TOKENS.find((item) => item.symbol === searchParams.get("token")) ?? TOKENS[0];
  const initialAmount = source === "spin" ? (searchParams.get("amount") ?? "0.001") : "0";
  const initialCount = source === "spin" ? (searchParams.get("count") ?? "1") : "10";
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [coverIndex, setCoverIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [count, setCount] = useState(initialCount);
  const [amount, setAmount] = useState(initialAmount);
  const [token, setToken] = useState(initialToken);
  const [coinSheet, setCoinSheet] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (source !== "spin") return;
    setCount(initialCount);
    setAmount(initialAmount);
    setToken(initialToken);
    setNotice("已带入转盘奖励，可直接封装成红包");
  }, [source, initialAmount, initialCount, initialToken]);

  useEffect(() => {
    const resize = () => {
      setScale(Math.min(1, window.innerWidth / CANVAS_WIDTH));
      setReady(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const parsedAmount = Number(amount || 0);
  const insufficient = parsedAmount > 0 && token.symbol === "SOL" && parsedAmount + 0.00223928 > Number(token.balance);
  const fiat = useMemo(() => (parsedAmount * 102.87).toFixed(parsedAmount ? 4 : 2), [parsedAmount]);

  const enterNumber = (value: string, setter: (value: string) => void, current: string) => {
    if (value === "⌫") return setter(current.length <= 1 ? "0" : current.slice(0, -1));
    if (value === "." && current.includes(".")) return;
    if (current === "0" && value !== ".") return setter(value);
    if (current.length < 8) setter(current + value);
  };

  const goBack = () => {
    if (coinSheet) return setCoinSheet(false);
    if (screen === "amount") setScreen("count");
    else if (screen === "count") setScreen("cover");
    else if (screen === "cover") setScreen("home");
  };

  const finishCoverGesture = (clientX: number) => {
    if (dragStart === null) return;
    const distance = clientX - dragStart;
    if (distance < -45) setCoverIndex((value) => Math.min(COVERS.length - 1, value + 1));
    if (distance > 45) setCoverIndex((value) => Math.max(0, value - 1));
    setDragStart(null);
  };

  return (
    <main className={`rv-stage ${ready ? "is-ready" : ""}`} style={{ height: CANVAS_HEIGHT * scale }}>
      <section className={`rv-canvas rv-screen-${screen} rv-cover-theme-${COVERS[coverIndex].id}`} style={{ transform: `scale(${scale})` }}>
        <StatusBar pink={screen === "home" || screen === "cover" || screen === "count"} />

        {screen !== "home" && <button className="rv-back" type="button" onClick={goBack} aria-label="返回">‹</button>}

        {screen === "home" && (
          <section className="rv-home" aria-label="红包心意">
            <button className="rv-back rv-home-back" type="button" aria-label="返回">‹</button>
            <div className="rv-home-tools" aria-hidden="true"><span>?</span><span>≡</span></div>
            <h1>红包心意</h1>
            <p className="rv-subtitle">惊喜秒达，好友 0 门槛领</p>
            <span className="rv-home-hero" role="img" aria-label="三张红包与招财猫、小马的分层动画">
              <img className="rv-home-hero-base" src="/assets/red-envelope-video/images/image-home-hero-01.png" alt="" />
              <img className="rv-home-hero-motion" src="/assets/red-envelope-video/images/image-home-hero-01.png" alt="" aria-hidden="true" />
            </span>
            <div className="rv-home-actions">
              <button type="button" onClick={() => setScreen("cover")}>
                <img src="/assets/red-envelope-video/images/icon-home-send-01.png" alt="" />
                <b>发送红包</b><span>›</span>
              </button>
              <button type="button" onClick={() => setNotice("领取红包入口已触发")}>
                <img src="/assets/red-envelope-video/images/icon-home-receive-01.png" alt="" />
                <b>领取红包</b><span>›</span>
              </button>
            </div>
          </section>
        )}

        {screen === "cover" && (
          <section className="rv-cover" aria-label="选择红包封面">
            <h1>选择红包封面</h1>
            <div
              className="rv-carousel"
              aria-label="红包封面轮播"
              onPointerDown={(event) => setDragStart(event.clientX)}
              onPointerUp={(event) => finishCoverGesture(event.clientX)}
              onPointerCancel={() => setDragStart(null)}
            >
              <div className="rv-carousel-shadow" />
              <div className="rv-carousel-track" style={{ transform: `translate3d(${95 - coverIndex * 588}px,0,0)` }}>
                {COVERS.map((cover, index) => (
                  <button
                    key={cover.id}
                    type="button"
                    className={`rv-cover-slide rv-cover-${cover.id} ${index === coverIndex ? "is-active" : ""}`}
                    onClick={() => setCoverIndex(index)}
                    aria-label={`选择${cover.alt}`}
                    aria-pressed={index === coverIndex}
                  >
                    <span className="rv-cover-art">
                      <img className="rv-cover-base" src={cover.asset} alt={cover.alt} />
                      <img className="rv-cover-motion-layer" src={cover.asset} alt="" aria-hidden="true" />
                      <i className="rv-cover-glint" aria-hidden="true" />
                      <i className="rv-cover-spark rv-cover-spark-one" aria-hidden="true">✦</i>
                      <i className="rv-cover-spark rv-cover-spark-two" aria-hidden="true">✧</i>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button className="rv-primary" type="button" onClick={() => setScreen("count")}>下一步</button>
          </section>
        )}

        {screen === "count" && (
          <section className="rv-count" aria-label="红包个数">
            <img
              className={`rv-count-hero ${coverIndex === 0 ? "is-stack" : "is-single"}`}
              src={coverIndex === 0 ? "/assets/red-envelope-video/images/image-count-hero-01.png" : COVERS[coverIndex].asset}
              alt={`${COVERS[coverIndex].alt}，十个红包`}
            />
            <h1>红包个数</h1>
            <div className="rv-count-input">{count}<i /></div>
            <NumericKeypad onKey={(key) => enterNumber(key, setCount, count)} />
            <button className="rv-primary" type="button" onClick={() => setScreen("amount")}>下一步</button>
          </section>
        )}

        {screen === "amount" && (
          <section className="rv-amount" aria-label="红包金额">
            <h1>红包金额</h1>
            <button className="rv-help" type="button" aria-label="帮助">?</button>
            <button className="rv-token-chip" type="button" onClick={() => setCoinSheet(true)}>
              <span style={{ background: token.color }}>{token.symbol.slice(0, 1)}</span>
              <b>{token.symbol}</b><em>{token.balance}</em><i>⌄</i>
            </button>
            <p className="rv-amount-label">单个红包金额</p>
            <div className={`rv-amount-value ${parsedAmount ? "has-value" : ""}`}><b>{amount}</b><i /><strong>{token.symbol}</strong></div>
            <p className="rv-fiat">≈ ${fiat}</p>
            {insufficient && <p className="rv-warning">可用余额不足</p>}
            <div className="rv-summary">
              <span>{count}个红包共</span><b>{amount} {token.symbol}</b>
              <span>Gas 费</span><b>{token.symbol === "SOL" ? "0.00223928 SOL" : "0.11 USDC"}</b>
            </div>
            <NumericKeypad onKey={(key) => enterNumber(key, setAmount, amount)} />
            <button className="rv-primary" type="button" onClick={() => setNotice(insufficient ? `${token.symbol} 不足，请先充值` : "红包参数已确认")}>
              {insufficient ? `${token.symbol} 不足，去充值` : "确定"}
            </button>
          </section>
        )}

        {coinSheet && (
          <div className="rv-sheet-layer" role="presentation" onClick={() => setCoinSheet(false)}>
            <section className="rv-coin-sheet" role="dialog" aria-label="选择币种" onClick={(event) => event.stopPropagation()}>
              <i className="rv-grabber" />
              <header><h2>选择币种</h2><button type="button" onClick={() => setCoinSheet(false)}>×</button></header>
              <div className="rv-search">⌕　搜索代币名称或合约地址</div>
              <div className="rv-token-list">
                {TOKENS.map((item) => (
                  <button key={`${item.symbol}-${item.chain}`} type="button" onClick={() => { setToken(item); setCoinSheet(false); setAmount("0"); }}>
                    <span style={{ background: item.color }}>{item.symbol[0]}</span>
                    <div><b>{item.symbol}</b><small>{item.chain}</small></div>
                    <em>{item.balance}<small>{item.price}</small></em>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {notice && (
          <button className="rv-toast" type="button" onClick={() => setNotice("")} aria-label="关闭提示">{notice}</button>
        )}
      </section>
    </main>
  );
}
