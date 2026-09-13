import assert from 'node:assert/strict';
import { applyDraw, createInitialState, selectPrize } from './lottery-engine.ts';

const initial = createInitialState();
assert.equal(selectPrize(0, initial.inventory).id, 'gift');
assert.equal(selectPrize(0.01, initial.inventory).id, 'coupon20');
assert.equal(selectPrize(0.99, initial.inventory).id, 'thanks');

const first = applyDraw(initial, 'same-request', 0.06, new Date('2026-08-29T00:00:00Z'));
const replay = applyDraw(first.state, 'same-request', 0.8);
assert.equal(replay.replayed, true);
assert.equal(replay.state.chances, 2);
assert.equal(replay.state.records.length, 1);
assert.equal(replay.record.prizeId, first.record.prizeId);

const emptyGift = createInitialState();
emptyGift.inventory.gift = 0;
assert.equal(selectPrize(0, emptyGift.inventory).id, 'thanks');

const extra = applyDraw(createInitialState(), 'extra-request', 0.4);
assert.equal(extra.record.prizeId, 'extra');
assert.equal(extra.state.chances, 3);

console.log('lottery-engine: 10 assertions passed');
