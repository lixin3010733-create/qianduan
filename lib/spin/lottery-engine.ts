export type PrizeId = 'gift' | 'coupon20' | 'points100' | 'coupon5' | 'extra' | 'thanks';

export type Prize = {
  id: PrizeId;
  name: string;
  shortName: string;
  kind: 'physical' | 'coupon' | 'points' | 'extra' | 'none';
  probability: number;
  initialInventory: number | null;
};

export type DrawRecord = {
  id: string;
  requestId: string;
  prizeId: PrizeId;
  prizeName: string;
  won: boolean;
  claimed: boolean;
  createdAt: string;
};

export type LotteryState = {
  chances: number;
  inventory: Record<PrizeId, number | null>;
  records: DrawRecord[];
  tasks: Record<string, boolean>;
  requestResults: Record<string, DrawRecord>;
};

export const PRIZES: Prize[] = [
  { id: 'gift', name: '品牌限定礼盒', shortName: '限定礼盒', kind: 'physical', probability: 0.5, initialInventory: 20 },
  { id: 'coupon20', name: '20 元优惠券', shortName: '¥20 券', kind: 'coupon', probability: 4.5, initialInventory: 500 },
  { id: 'points100', name: '100 品牌积分', shortName: '100 积分', kind: 'points', probability: 10, initialInventory: 2000 },
  { id: 'coupon5', name: '5 元优惠券', shortName: '¥5 券', kind: 'coupon', probability: 20, initialInventory: 5000 },
  { id: 'extra', name: '再来一次', shortName: '再来一次', kind: 'extra', probability: 15, initialInventory: 5000 },
  { id: 'thanks', name: '谢谢参与', shortName: '谢谢参与', kind: 'none', probability: 50, initialInventory: null },
];

export function createInitialState(): LotteryState {
  return {
    chances: 3,
    inventory: Object.fromEntries(PRIZES.map((prize) => [prize.id, prize.initialInventory])) as Record<PrizeId, number | null>,
    records: [],
    tasks: {},
    requestResults: {},
  };
}

export function selectPrize(random: number, inventory: LotteryState['inventory']): Prize {
  const roll = Math.max(0, Math.min(0.999999999, random)) * 100;
  let cursor = 0;
  let selected = PRIZES[PRIZES.length - 1];
  for (const prize of PRIZES) {
    cursor += prize.probability;
    if (roll < cursor) {
      selected = prize;
      break;
    }
  }
  const stock = inventory[selected.id];
  return stock !== null && stock <= 0 ? PRIZES[PRIZES.length - 1] : selected;
}

export function applyDraw(state: LotteryState, requestId: string, random = Math.random(), now = new Date()): { state: LotteryState; record: DrawRecord; replayed: boolean } {
  const existing = state.requestResults[requestId];
  if (existing) return { state, record: existing, replayed: true };
  if (state.chances <= 0) throw new Error('NO_CHANCE');

  const prize = selectPrize(random, state.inventory);
  const record: DrawRecord = {
    id: `draw-${requestId}`,
    requestId,
    prizeId: prize.id,
    prizeName: prize.name,
    won: prize.kind !== 'none',
    claimed: false,
    createdAt: now.toISOString(),
  };
  const inventory = { ...state.inventory };
  if (inventory[prize.id] !== null) inventory[prize.id] = Math.max(0, (inventory[prize.id] as number) - 1);

  return {
    replayed: false,
    record,
    state: {
      ...state,
      chances: state.chances - 1 + (prize.kind === 'extra' ? 1 : 0),
      inventory,
      records: [record, ...state.records],
      requestResults: { ...state.requestResults, [requestId]: record },
    },
  };
}

export function completeTask(state: LotteryState, taskId: string): LotteryState {
  if (state.tasks[taskId]) return state;
  return { ...state, chances: state.chances + 1, tasks: { ...state.tasks, [taskId]: true } };
}

export function claimRecord(state: LotteryState, recordId: string): LotteryState {
  const records = state.records.map((record) => record.id === recordId ? { ...record, claimed: true } : record);
  const target = records.find((record) => record.id === recordId);
  const requestResults = target ? { ...state.requestResults, [target.requestId]: target } : state.requestResults;
  return { ...state, records, requestResults };
}
