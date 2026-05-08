import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal, clampScore, createEmptyScores, getSeverity, madrsItems } from '../app.js';

test('MADRS 10項目の最大合計点は60点', () => {
  const maxScores = Object.fromEntries(madrsItems.map((item) => [item.id, item.max]));
  assert.equal(calculateTotal(maxScores), 60);
});

test('未入力項目は0点として合計する', () => {
  assert.equal(calculateTotal({ apparentSadness: 3, reportedSadness: 2 }), 5);
});

test('各項目の上限を超える値は項目上限に丸める', () => {
  assert.equal(clampScore(8, 6), 6);
  assert.equal(clampScore(-1, 6), 0);
  assert.equal(clampScore(Number.NaN, 6), 0);
});

test('参考区分を境界値で判定する', () => {
  assert.equal(getSeverity(6).label, '正常範囲 / 寛解（参考）');
  assert.equal(getSeverity(7).label, '軽度（参考）');
  assert.equal(getSeverity(20).label, '中等度（参考）');
  assert.equal(getSeverity(35).label, '重度（参考）');
});

test('空のスコアオブジェクトを作れる', () => {
  const scores = createEmptyScores();
  assert.equal(Object.keys(scores).length, 10);
  assert.equal(calculateTotal(scores), 0);
});
