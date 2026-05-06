import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal, clampScore, createEmptyScores, getSeverity, hamdItems } from '../app.js';

test('HAM-D 17項目の最大合計点は52点', () => {
  const maxScores = Object.fromEntries(hamdItems.map((item) => [item.id, item.max]));
  assert.equal(calculateTotal(maxScores), 52);
});

test('未入力項目は0点として合計する', () => {
  assert.equal(calculateTotal({ depressedMood: 3, guilt: 2 }), 5);
});

test('各項目の上限を超える値は項目上限に丸める', () => {
  assert.equal(clampScore(8, 2), 2);
  assert.equal(clampScore(-1, 4), 0);
  assert.equal(clampScore(Number.NaN, 4), 0);
});

test('参考区分を境界値で判定する', () => {
  assert.equal(getSeverity(7).label, '正常範囲（参考）');
  assert.equal(getSeverity(8).label, '軽度（参考）');
  assert.equal(getSeverity(14).label, '中等度（参考）');
  assert.equal(getSeverity(19).label, '重度（参考）');
  assert.equal(getSeverity(23).label, '最重度（参考）');
});

test('空のスコアオブジェクトを作れる', () => {
  const scores = createEmptyScores();
  assert.equal(Object.keys(scores).length, 17);
  assert.equal(calculateTotal(scores), 0);
});
