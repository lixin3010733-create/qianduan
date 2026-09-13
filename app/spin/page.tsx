'use client';

import {
  BadgeCheck, Check, ChevronRight, CircleHelp, Clock3, Coins, Gift,
  History, House, LockKeyhole, Phone, RefreshCw, RotateCw, ShieldCheck,
  Sparkles, Ticket, Trophy, UserRound, X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  applyDraw, claimRecord, completeTask, createInitialState, PRIZES,
  type DrawRecord, type LotteryState,
} from '@/lib/spin/lottery-engine';

type View = 'home' | 'tasks' | 'prizes' | 'rules';
const STORAGE_KEY = 'brand-spin-lottery-v1';

const tasks = [
  { id: 'checkin', title: '每日签到', detail: '今天来过就算完成', icon: BadgeCheck },
  { id: 'rules', title: '浏览活动规则', detail: '了解概率与领奖方式', icon: CircleHelp },
  { id: 'phone', title: '绑定手机号', detail: '用于接收券码通知', icon: Phone },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function SpinLotteryH5() {
  const router = useRouter();
  const [view, setView] = useState<View>('home');
  const [data, setData] = useState<LotteryState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<DrawRecord | null>(null);
  const [claiming, setClaiming] = useState<DrawRecord | null>(null);
  const [phone, setPhone] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved) as LotteryState);
    } catch { /* use defaults */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const wonCount = useMemo(() => data.records.filter((item) => item.won).length, [data.records]);

  function draw() {
    if (spinning) return;
    if (data.chances <= 0) {
      setView('tasks');
      setNotice('先完成任务，领取抽奖机会');
      return;
    }
    const requestId = uid();
    const outcome = applyDraw(data, requestId);
    const index = PRIZES.findIndex((prize) => prize.id === outcome.record.prizeId);
    setData(outcome.state);
    setSpinning(true);
    setResult(null);
    setRotation((current) => Math.ceil(current / 360) * 360 + 360 * 6 + (360 - (index * 60 + 30)));
    window.setTimeout(() => {
      setSpinning(false);
      setResult(outcome.record);
    }, 2500);
  }

  function doTask(taskId: string) {
    if (data.tasks[taskId]) return;
    if (taskId === 'rules') setView('rules');
    if (taskId === 'phone') {
      setPhone('');
      setClaiming({ id: 'task-phone', requestId: '', prizeId: 'thanks', prizeName: '绑定手机号', won: false, claimed: false, createdAt: new Date().toISOString() });
      return;
    }
    setData((current) => completeTask(current, taskId));
    setNotice('已领取 1 次抽奖机会');
  }

  function finishClaim() {
    if (!/^1\d{10}$/.test(phone)) {
      setNotice('请输入 11 位手机号');
      return;
    }
    if (claiming?.id === 'task-phone') {
      setData((current) => completeTask(current, 'phone'));
      setClaiming(null);
      setNotice('绑定成功，已到账 1 次机会');
      return;
    }
    if (claiming) {
      setData((current) => claimRecord(current, claiming.id));
      setClaiming(null);
      setResult(null);
      setNotice('领取成功，权益已存入账户');
    }
  }

  function openRules() {
    setView('rules');
    if (!data.tasks.rules) {
      window.setTimeout(() => {
        setData((current) => completeTask(current, 'rules'));
        setNotice('规则已读，获得 1 次抽奖机会');
      }, 700);
    }
  }

  function resetDemo() {
    const fresh = createInitialState();
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setResult(null);
    setRotation(0);
    setNotice('演示数据已重置');
  }

  return <main className="spin-app ui-unified-app min-h-dvh bg-[#031d35] text-white">
    <style>{`
      .spin-app { font-size: 14px; line-height: 1.5; }
      .spin-app [class*="text-[7px]"],
      .spin-app [class*="text-[8px]"],
      .spin-app [class*="text-[9px]"] { font-size: 12px !important; line-height: 1.5 !important; }
      .spin-app [class*="text-[10px]"],
      .spin-app [class*="text-[11px]"] { font-size: 13px !important; line-height: 1.5 !important; }
      .spin-app [class*="text-[12px]"],
      .spin-app [class*="text-[13px]"] { font-size: 14px !important; line-height: 1.5 !important; }
      .spin-app [class*="text-[15px]"] { font-size: 16px !important; line-height: 1.35 !important; }
      .spin-app .wheel-label { font-size: 12px !important; line-height: 14px !important; }
    `}</style>
    <div className="relative mx-auto min-h-dvh max-w-[520px] overflow-hidden bg-[#063a59] bg-cover bg-top shadow-[0_0_90px_rgba(0,0,0,.55)]" style={{ backgroundImage: "linear-gradient(to bottom,rgba(2,28,49,.08),rgba(1,20,38,.42)),url('/assets/spin/underwater-temple-bg-v1.png')" }}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#7eeaff]/20 bg-[#042943]/88 px-4 backdrop-blur-xl">
        <button onClick={() => setView('home')} className="flex items-center gap-2" aria-label="返回活动首页">
          <span className="grid size-9 place-items-center rounded-xl border border-[#ffeaa2]/50 bg-gradient-to-b from-[#ffc944] to-[#b96b0b] text-[#4b2600] shadow-[0_0_18px_rgba(255,210,78,.35)]"><Sparkles className="size-4" /></span>
          <span className="text-left"><b className="block text-[14px] tracking-[.08em] text-[#fff0ad]">深海秘宝</b><span className="text-[10px] text-[#83dcea]">沉船遗迹寻宝季</span></span>
        </button>
        <button onClick={() => setView('prizes')} className="flex items-center gap-2 rounded-full border border-[#70dcec]/30 bg-[#092f4b]/85 px-3 py-2 text-[11px] font-semibold text-[#e7fbff]"><Trophy className="size-4 text-[#ffd45f]" />秘宝库 <span className="rounded-full bg-[#e29b1d] px-1.5 py-0.5 text-[#301900]">{wonCount}</span></button>
      </header>

      {view === 'home' && <Home data={data} spinning={spinning} rotation={rotation} draw={draw} openRules={openRules} toTasks={() => setView('tasks')} />}
      {view === 'tasks' && <Tasks data={data} doTask={doTask} />}
      {view === 'prizes' && <Prizes data={data} claim={setClaiming} />}
      {view === 'rules' && <Rules data={data} />}

      <nav className="sticky bottom-0 z-30 grid h-[72px] grid-cols-4 border-t border-[#6fe1f5]/20 bg-[#031f35]/94 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,13,27,.28)] backdrop-blur-xl">
        <NavButton active={view === 'home'} label="抽奖" icon={House} onClick={() => setView('home')} />
        <NavButton active={view === 'tasks'} label="赚次数" icon={Sparkles} onClick={() => setView('tasks')} />
        <NavButton active={view === 'prizes'} label="奖品" icon={Ticket} onClick={() => setView('prizes')} />
        <NavButton active={view === 'rules'} label="规则" icon={CircleHelp} onClick={openRules} />
      </nav>

      {result && <ResultModal record={result} close={() => setResult(null)} claim={() => setClaiming(result)} sendReward={() => router.push('/red-envelope-video?source=spin&token=SOL&amount=0.001&count=1')} drawAgain={draw} chances={data.chances} />}
      {claiming && <ClaimModal title={claiming.id === 'task-phone' ? '绑定手机号' : `领取「${claiming.prizeName}」`} phone={phone} setPhone={setPhone} close={() => setClaiming(null)} confirm={finishClaim} />}
      {notice && <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full border border-[#ffe184]/50 bg-[#15283a] px-4 py-2.5 text-[11px] font-semibold text-[#fff1ad] shadow-[0_0_28px_rgba(255,207,69,.28)]">{notice}</div>}
      <button onClick={resetDemo} className="absolute bottom-[84px] right-3 z-20 grid size-8 place-items-center rounded-full border border-[#85ebff]/30 bg-[#062b46]/80 text-[#9deeff]" aria-label="重置演示数据"><RefreshCw className="size-3.5" /></button>
    </div>
  </main>;
}

function Home({ data, spinning, rotation, draw, openRules, toTasks }: { data: LotteryState; spinning: boolean; rotation: number; draw: () => void; openRules: () => void; toTasks: () => void }) {
  const draws = data.records.length;
  return <div className="relative overflow-hidden pb-7">
    <span className="pointer-events-none absolute left-7 top-32 size-4 animate-pulse rounded-full border border-white/40 bg-[#9cefff]/20" /><span className="pointer-events-none absolute right-9 top-52 size-7 animate-pulse rounded-full border border-white/35 bg-[#9cefff]/15" />
    <section className="relative px-5 pb-2 pt-5 text-center">
      <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#8feafa]/35 bg-[#052d49]/75 px-3 py-1.5 text-[10px] text-[#c8f7ff] shadow-lg"><Clock3 className="size-3.5 text-[#ffd45c]" />遗迹关闭倒计时 <b className="font-mono text-[#fff0a4]">04:12:36</b></div>
      <p className="mt-4 text-[11px] font-bold tracking-[.32em] text-[#85edf8]">沉船遗迹 · 限时开启</p>
      <h1 className="mt-1 text-[43px] font-black leading-none tracking-[-.07em] text-[#ffe47c] drop-shadow-[0_4px_0_#743b09]" style={{ WebkitTextStroke: '1px #6a3609' }}>深海秘宝</h1>
      <p className="mt-3 text-[12px] text-[#c6f4fb]">转动黄金船舵 · 唤醒沉睡的传奇宝藏</p>
      <button onClick={openRules} className="mx-auto mt-2 flex items-center gap-1 text-[10px] text-[#7adcea]">概率公示与探宝规则 <ChevronRight className="size-3.5" /></button>
    </section>

    <section className="relative px-4 pt-2">
      <div className="mx-auto mb-2 flex max-w-[400px] items-center justify-between rounded-2xl border border-[#7ce8fa]/25 bg-[#062f4b]/82 px-4 py-3 shadow-[inset_0_1px_rgba(255,255,255,.12),0_12px_30px_rgba(0,18,40,.35)] backdrop-blur">
        <div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-full border-2 border-[#fff0a7] bg-gradient-to-b from-[#ffd94e] to-[#ba6d09] text-[#5a2b00]"><Coins className="size-4" /></span><span><small className="block text-[9px] text-[#7fd6e5]">探宝券</small><b className="font-mono text-[19px] text-[#fff1a6]">{data.chances}</b></span></div>
        <button onClick={toTasks} className="ui-action-primary rounded-xl border border-[#ffe48a]/45 bg-gradient-to-b from-[#f4bb3f] to-[#ae6208] px-4 py-2.5 text-[11px] font-black text-[#321800] shadow-[0_3px_0_#6b3905]">获取探宝券</button>
      </div>

      <div className="relative mx-auto aspect-square max-w-[400px] drop-shadow-[0_22px_28px_rgba(0,8,22,.55)]">
        <div className="absolute inset-0 rounded-full border-[5px] border-[#523211] bg-[radial-gradient(circle,#8b5a20_52%,#dcae4a_53%,#4c2b0d_66%,#f4d56d_68%,#624016_74%,#102f43_75%)] shadow-[inset_0_0_20px_rgba(255,231,139,.5),0_0_25px_rgba(77,221,242,.28)]" />
        {Array.from({ length: 12 }).map((_, index) => { const angle = index * 30 * Math.PI / 180; return <span key={index} className="absolute z-20 size-2.5 rounded-full border border-[#fff4b0] bg-[#ffd13f] shadow-[0_0_8px_#ffe876]" style={{ left: `calc(50% + ${Math.sin(angle) * 46}% - 5px)`, top: `calc(50% - ${Math.cos(angle) * 46}% - 5px)` }} />; })}
        <div className="absolute left-1/2 top-[-4px] z-30 -translate-x-1/2 drop-shadow-[0_3px_3px_rgba(0,0,0,.5)]"><div className="h-0 w-0 border-x-[19px] border-t-[35px] border-x-transparent border-t-[#ffcf38]" /></div>
        <div className="absolute inset-[34px] overflow-hidden rounded-full border-[6px] border-[#f8d76e] shadow-[inset_0_0_22px_rgba(0,0,0,.45)]" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 2.5s cubic-bezier(.12,.66,.14,1)' : undefined }}>
          <div className="absolute inset-0" style={{ background: 'conic-gradient(#0d7890 0 60deg,#06465f 60deg 120deg,#1498a7 120deg 180deg,#073d5a 180deg 240deg,#10869a 240deg 300deg,#06445d 300deg 360deg)' }} />
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle,transparent 30%,#8ff3ff 31%,transparent 33%)' }} />
          {PRIZES.map((prize, index) => <div key={prize.id} className="absolute left-1/2 top-1/2 z-10 flex h-[48%] w-[92px] -translate-x-1/2 origin-[50%_0] flex-col items-center pt-[54px] text-center" style={{ transform: `rotate(${index * 60 + 30}deg)` }}>
            <PrizeIcon prizeId={prize.id} />
            <b className="wheel-label mt-1 w-[82px] text-[#fff1b2] drop-shadow-[0_1px_1px_#00253a]">{prize.shortName}</b>
          </div>)}
        </div>
        <button onClick={draw} disabled={spinning} className="ui-action-primary absolute left-1/2 top-1/2 z-30 grid size-[102px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[6px] border-[#ffe68c] bg-gradient-to-b from-[#ffcb43] via-[#ee9322] to-[#a94c08] text-[#4b2100] shadow-[inset_0_4px_6px_rgba(255,255,255,.65),0_7px_0_#63300a,0_0_26px_rgba(255,213,77,.68)] active:translate-y-[calc(-50%+4px)] disabled:cursor-wait" aria-label={spinning ? '正在探宝' : '立即探宝'}>
          <span className="text-center"><RotateCw className={`mx-auto size-5 ${spinning ? 'animate-spin' : ''}`} /><b className="mt-1 block text-[15px]">{spinning ? '寻宝中' : '探宝 1 次'}</b><small className="mt-0.5 block text-[9px] opacity-75">消耗 1 张券</small></span>
        </button>
      </div>

      <div className="mx-auto -mt-1 max-w-[410px] rounded-[22px] border border-[#72dce9]/25 bg-[#052c48]/88 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center justify-between"><div><span className="text-[10px] text-[#72d9e8]">累计探宝</span><b className="ml-2 text-[16px] text-[#fff0a3]">{draws} 次</b></div><span className="text-[9px] text-[#7ed9e7]">达到里程碑开启宝箱</span></div>
        <div className="relative mt-4 flex justify-between"><span className="absolute left-5 right-5 top-3 h-1 rounded-full bg-[#173f56]"><span className="block h-full rounded-full bg-gradient-to-r from-[#55e0ed] to-[#ffd150]" style={{ width: `${Math.min(100, draws / 20 * 100)}%` }} /></span>{[5,10,20].map(value => <div key={value} className="relative z-10 text-center"><span className={`grid size-7 place-items-center rounded-lg border ${draws >= value ? 'border-[#ffe88e] bg-[#cf8014] text-[#fff1a8]' : 'border-[#4e8191] bg-[#0b3a54] text-[#6494a1]'}`}><Gift className="size-3.5" /></span><small className="mt-1 block text-[9px] text-[#83d8e5]">{value}次</small></div>)}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2"><Stat icon={ShieldCheck} value="结果锁定" label="先开奖再转动" /><Stat icon={LockKeyhole} value="请求幂等" label="防止重复扣次" /><Stat icon={Clock3} value="自动保存" label="刷新状态不丢失" /></div>
      <p className="mt-3 text-center text-[9px] leading-4 text-[#7fc4cf]">本地模拟活动 · 概率、库存与领奖状态在浏览器中真实执行</p>
    </section>
  </div>;
}

function Tasks({ data, doTask }: { data: LotteryState; doTask: (id: string) => void }) {
  return <Page title="赚取抽奖机会" eyebrow="MISSIONS" detail="完成一次性任务，每项可增加 1 次。">
    <div className="space-y-3">{tasks.map((task) => {
      const done = Boolean(data.tasks[task.id]);
      const Icon = task.icon;
      return <button key={task.id} onClick={() => doTask(task.id)} disabled={done} className="flex w-full items-center gap-4 rounded-[22px] border border-[#79dfed]/25 bg-[#052d48]/90 p-4 text-left shadow-lg backdrop-blur disabled:opacity-60">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#ffe795]/35 bg-gradient-to-b from-[#d99827] to-[#6d3c0b] text-[#ffe893]"><Icon className="size-5" /></span>
        <span className="min-w-0 flex-1"><b className="block text-[14px] text-white">{task.title}</b><span className="mt-1 block text-[11px] text-[#81cfda]">{task.detail}</span></span>
        <span className={`rounded-full px-3 py-2 text-[11px] font-semibold ${done ? 'bg-[#195b59] text-[#9cf0d4]' : 'bg-gradient-to-b from-[#f6c14a] to-[#a75b08] text-[#321700]'}`}>{done ? '已领取' : '+1 去完成'}</span>
      </button>;
    })}</div>
    <div className="mt-6 rounded-[22px] border border-[#ffe899]/25 bg-gradient-to-br from-[#123a53] to-[#071c30] p-5 text-white"><p className="text-[11px] text-[#79d9e7]">当前探宝券</p><div className="mt-2 flex items-end justify-between"><b className="text-4xl tracking-[-.06em] text-[#fff0a3]">{data.chances} <span className="text-sm">张</span></b><Coins className="size-7 text-[#ffd65a]" /></div></div>
  </Page>;
}

function Prizes({ data, claim }: { data: LotteryState; claim: (record: DrawRecord) => void }) {
  return <Page title="我的奖品" eyebrow="MY REWARDS" detail="每次参与都有记录，中奖权益可在这里领取。">
    {data.records.length === 0 ? <Empty icon={History} title="还没有发现秘宝" detail="完成第一次探宝后，战利品会存放在这里。" /> : <div className="space-y-3">{data.records.map((record) => <article key={record.id} className="rounded-[22px] border border-[#71ddea]/25 bg-[#052d48]/90 p-4 shadow-lg backdrop-blur">
      <div className="flex items-center gap-3"><PrizeIcon prizeId={record.prizeId} /><div className="min-w-0 flex-1"><b className="block text-[13px] text-white">{record.prizeName}</b><span className="mt-1 block font-mono text-[9px] text-[#74c5d1]">{formatTime(record.createdAt)} · {record.requestId.slice(0, 8)}</span></div>{record.won && record.prizeId !== 'extra' ? <button onClick={() => claim(record)} disabled={record.claimed} className={`rounded-full px-3 py-2 text-[11px] font-semibold ${record.claimed ? 'bg-[#195b59] text-[#9cf0d4]' : 'bg-gradient-to-b from-[#f8cb55] to-[#ad6209] text-[#321700]'}`}>{record.claimed ? '已领取' : '立即领取'}</button> : <span className="text-[10px] text-[#70bfca]">已完成</span>}</div>
    </article>)}</div>}
  </Page>;
}

function Rules({ data }: { data: LotteryState }) {
  return <Page title="活动规则" eyebrow="RULES & FAIRNESS" detail="演示版保留真实抽奖系统应有的关键约束。">
    <div className="rounded-[24px] border border-[#ffe68c]/25 bg-gradient-to-br from-[#113c58] to-[#061c30] p-5 text-white shadow-xl"><ShieldCheck className="size-6 text-[#ffd65a]" /><h2 className="mt-4 text-xl font-black text-[#fff0a5]">每张探宝券，只产生一个结果。</h2><p className="mt-3 text-[11px] leading-6 text-[#8ed8e3]">系统先用唯一 requestId 锁定结果并扣减库存，再启动船舵动画；同一请求重放不会再次扣次数或改变奖品。</p></div>
    <section className="mt-5"><h3 className="text-[13px] font-bold text-[#fff0a5]">秘宝与发现概率</h3><div className="mt-3 overflow-hidden rounded-[20px] border border-[#6bd8e8]/25 bg-[#052d48]/90">{PRIZES.map((prize) => <div key={prize.id} className="flex items-center justify-between border-b border-[#6bd8e8]/12 px-4 py-3 last:border-0"><span className="text-[11px] text-white">{prize.name}</span><span className="font-mono text-[11px] font-semibold text-[#ffd65a]">{prize.probability}%</span></div>)}</div></section>
    <section className="mt-5 space-y-3 text-[11px] leading-6 text-[#9ad8e1]"><p><b className="text-[#fff0a5]">参与条件：</b>活动期内每位探险者默认 3 张探宝券，完成指定任务可增加次数。</p><p><b className="text-[#fff0a5]">库存规则：</b>有限库存秘宝发完后，该次请求自动回退为“空贝壳”，不会出现负库存。</p><p><b className="text-[#fff0a5]">领奖规则：</b>发现秘宝后需使用 11 位手机号完成模拟领取；实物礼盒正式版还需填写收货信息。</p><p><b className="text-[#fff0a5]">演示声明：</b>当前无真实后端、短信或商业权益，所有数据仅保存在本机浏览器。</p></section>
    {data.tasks.rules && <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#6ce6c2]/25 bg-[#165955]/80 p-4 text-[11px] font-semibold text-[#a6f5d9]"><Check className="size-4" />规则任务已完成，探宝券已到账</div>}
  </Page>;
}

function ResultModal({ record, close, claim, sendReward, drawAgain, chances }: { record: DrawRecord; close: () => void; claim: () => void; sendReward: () => void; drawAgain: () => void; chances: number }) {
  const canClaim = record.won && record.prizeId !== 'extra';
  return <div className="fixed inset-0 z-50 grid place-items-end bg-[#00111f]/72 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-label="抽奖结果">
    <div className="relative w-full max-w-[440px] overflow-hidden rounded-[30px] border border-[#ffe48e]/40 bg-[radial-gradient(circle_at_50%_20%,#116d7b,#062a45_58%,#041a2d)] p-6 text-center text-white shadow-[0_0_55px_rgba(255,208,65,.28)]">
      <button onClick={close} className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full border border-white/20 bg-[#082c46]" aria-label="关闭"><X className="size-4" /></button>
      <img src="/assets/spin/legendary-chest-v1.png" alt="打开的传奇海底宝箱" className={`mx-auto -mb-3 -mt-6 w-[235px] drop-shadow-[0_0_24px_rgba(255,211,63,.48)] ${record.won ? 'animate-[pulse_1.4s_ease-in-out_infinite]' : 'grayscale-[.65]'}`} />
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#75e7f2]">{record.won ? 'Treasure discovered' : 'Exploration complete'}</p>
      <h2 className="mt-2 text-[29px] font-black tracking-[-.05em] text-[#ffe47d] drop-shadow-[0_2px_0_#754008]">{record.prizeName}</h2>
      <p className="mt-3 text-[11px] leading-6 text-[#9ddde5]">{record.prizeId === 'extra' ? '探宝券已自动返还，可以立即继续探索。' : record.won ? '秘宝已存入「秘宝库」，完成手机号验证即可领取。' : '这次发现了一枚空贝壳，完成任务还能获得更多探宝券。'}</p>
      <p className="mt-3 font-mono text-[9px] text-[#65aab8]">RESULT · {record.requestId}</p>
      <button onClick={canClaim ? claim : drawAgain} disabled={!canClaim && chances <= 0} className="mt-6 h-12 w-full rounded-2xl border border-[#ffe88e] bg-gradient-to-b from-[#ffd34f] to-[#a95c08] text-[10px] font-black text-[#321700] shadow-[0_4px_0_#663605] disabled:opacity-40">{canClaim ? '收入秘宝库' : chances > 0 ? `继续探宝 · 剩余 ${chances} 张` : '探宝券已用完'}</button>
      {canClaim && <button onClick={sendReward} className="mt-2 h-11 w-full rounded-2xl border border-[#79e8f4]/45 bg-[#0b4964]/80 text-[11px] font-bold text-[#c8faff]">用这份奖励发红包</button>}
      <button onClick={close} className="mt-2 h-10 w-full text-[11px] text-[#79c6d2]">稍后处理</button>
    </div>
  </div>;
}

function ClaimModal({ title, phone, setPhone, close, confirm }: { title: string; phone: string; setPhone: (value: string) => void; close: () => void; confirm: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-end bg-[#00111f]/72 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-label={title}>
    <div className="w-full max-w-[440px] rounded-[30px] border border-[#73dce9]/30 bg-[#062a44] p-6 text-white"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#65dce9]">IDENTITY</p><h2 className="mt-2 text-2xl font-black tracking-[-.05em] text-[#fff0a5]">{title}</h2></div><button onClick={close} className="grid size-8 place-items-center rounded-full border border-white/20 bg-[#0a3956]" aria-label="关闭"><X className="size-4" /></button></div><p className="mt-3 text-[11px] leading-6 text-[#84cfda]">演示环境不会发送短信，也不会上传手机号。</p><label className="mt-6 block"><span className="text-[11px] font-semibold">手机号码</span><div className="mt-2 flex h-13 items-center gap-3 rounded-2xl border border-[#75dcea]/25 bg-[#031d31] px-4"><span className="text-[11px] text-[#7bc8d4]">+86</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="tel" placeholder="请输入 11 位手机号" className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#568695]" /></div></label><button onClick={confirm} className="mt-5 h-12 w-full rounded-2xl border border-[#ffe58b] bg-gradient-to-b from-[#ffd353] to-[#a75a08] text-[12px] font-black text-[#321700]">确认并继续</button></div>
  </div>;
}

function Page({ title, eyebrow, detail, children }: { title: string; eyebrow: string; detail: string; children: React.ReactNode }) {
  return <div className="min-h-[calc(100dvh-136px)] bg-[#03223a]/48 p-5 pb-10 backdrop-blur-[2px]"><div className="mb-7"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#73dce9]">{eyebrow}</p><h1 className="mt-3 text-[32px] font-black tracking-[-.055em] text-[#fff0a5] drop-shadow-[0_2px_0_#603a0c]">{title}</h1><p className="mt-3 text-[11px] leading-6 text-[#91d3dc]">{detail}</p></div>{children}</div>;
}

function NavButton({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: typeof House; onClick: () => void }) {
  return <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active ? 'text-[#ffd85b]' : 'text-[#6eafba]'}`}><span className={`grid size-7 place-items-center rounded-lg ${active ? 'bg-[#a55b0a]/45 shadow-[0_0_12px_rgba(255,210,63,.24)]' : ''}`}><Icon className="size-4" /></span>{label}</button>;
}

function PrizeIcon({ prizeId }: { prizeId: (typeof PRIZES)[number]['id'] }) {
  const positions: Record<(typeof PRIZES)[number]['id'], string> = { gift: '0% 0%', coupon20: '50% 0%', points100: '100% 0%', coupon5: '0% 100%', extra: '50% 100%', thanks: '100% 100%' };
  return <span className="block size-11 shrink-0 rounded-xl border border-[#fff0a6]/30 bg-[#0b5670] shadow-[0_4px_10px_rgba(0,24,42,.35)]" style={{ backgroundImage: "url('/assets/spin/reward-sprite-v1.png')", backgroundSize: '300% 200%', backgroundPosition: positions[prizeId] }} />;
}

function Stat({ icon: Icon, value, label }: { icon: typeof ShieldCheck; value: string; label: string }) {
  return <div className="rounded-2xl border border-[#6cd6e5]/22 bg-[#052c47]/86 p-3 shadow-lg backdrop-blur"><Icon className="size-4 text-[#ffd65a]" /><b className="mt-2 block text-[11px] text-white">{value}</b><span className="mt-1 block text-[9px] text-[#77bfca]">{label}</span></div>;
}

function Empty({ icon: Icon, title, detail }: { icon: typeof History; title: string; detail: string }) {
  return <div className="grid min-h-[300px] place-items-center rounded-[24px] border border-dashed border-[#6fd8e7]/25 bg-[#052d48]/80 p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[#ffe58a]/25 bg-[#9b5b12]/40 text-[#ffd65a]"><Icon className="size-6" /></span><b className="mt-4 block text-[14px] text-white">{title}</b><p className="mt-2 text-[11px] leading-5 text-[#7cc4cf]">{detail}</p></div></div>;
}
