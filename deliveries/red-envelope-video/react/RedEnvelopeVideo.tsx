"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [count, setCount] = useState("10");
  const [amount, setAmount] = useState("0");
  const [token, setToken] = useState(TOKENS[0]);
  const [coinSheet, setCoinSheet] = useState(false);
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

  return (
    <main className={`rv-stage ${ready ? "is-ready" : ""}`} style={{ height: CANVAS_HEIGHT * scale }}>
      <section className={`rv-canvas rv-screen-${screen}`} style={{ transform: `scale(${scale})` }}>
        <StatusBar pink={screen === "home" || screen === "cover" || screen === "count"} />

        {screen !== "home" && <button className="rv-back" type="button" onClick={goBack} aria-label="返回">‹</button>}

        {screen === "home" && (
          <section className="rv-home" aria-label="红包心意">
            <button className="rv-back rv-home-back" type="button" aria-label="返回">‹</button>
            <div className="rv-home-tools" aria-hidden="true"><span>?</span><span>≡</span></div>
            <h1>红包心意</h1>
            <p className="rv-subtitle">惊喜秒达，好友 0 门槛领</p>
            <img className="rv-home-hero" src="/assets/red-envelope-video/images/image-home-hero-01.png" alt="招财猫骑着小马的红包封面" />
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
            <button className="rv-carousel" type="button" aria-label="切换红包封面">
              <img src="/assets/red-envelope-video/images/image-cover-carousel-01.png" alt="绿色机器人红包封面" />
            </button>
            <button className="rv-primary" type="button" onClick={() => setScreen("count")}>下一步</button>
          </section>
        )}

        {screen === "count" && (
          <section className="rv-count" aria-label="红包个数">
            <img className="rv-count-hero" src="/assets/red-envelope-video/images/image-count-hero-01.png" alt="十个红包封面堆叠" />
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
