import test from 'node:test';
import assert from 'node:assert/strict';
import {
  additionalCriteria,
  countSelectedSymptoms,
  createEmptyCriteria,
  evaluateDsm5TrMdd,
  hasCoreSymptom,
  symptomCriteria
} from '../app.js';

test('DSM-5-TR症状基準は9項目で構成される', () => {
  assert.equal(symptomCriteria.length, 9);
  assert.equal(symptomCriteria.filter((criterion) => criterion.core).length, 2);
});

test('選択された症状数を数えられる', () => {
  const selected = {
    depressedMood: true,
    anhedonia: true,
    fatigue: true
  };
  assert.equal(countSelectedSymptoms(selected), 3);
  assert.equal(hasCoreSymptom(selected), true);
});

test('5症状以上でも中核症状がなければ症状基準を満たさない', () => {
  const selected = {
    weightOrAppetite: true,
    sleepChange: true,
    psychomotorChange: true,
    fatigue: true,
    concentration: true
  };
  const result = evaluateDsm5TrMdd(selected);
  assert.equal(result.symptomCount, 5);
  assert.equal(result.coreSymptomPresent, false);
  assert.equal(result.symptomThresholdMet, false);
});

test('5症状以上かつ中核症状があれば症状基準を満たす', () => {
  const result = evaluateDsm5TrMdd({
    depressedMood: true,
    anhedonia: true,
    sleepChange: true,
    fatigue: true,
    concentration: true
  });
  assert.equal(result.symptomThresholdMet, true);
});

test('すべての追加条件がそろうとMDD基準を満たす可能性として判定する', () => {
  const selected = {
    depressedMood: true,
    anhedonia: true,
    sleepChange: true,
    fatigue: true,
    concentration: true,
    ...Object.fromEntries(additionalCriteria.map((criterion) => [criterion.id, true]))
  };
  const result = evaluateDsm5TrMdd(selected);
  assert.equal(result.probableMajorDepressiveEpisode, true);
  assert.equal(result.allMddCriteriaMet, true);
});

test('自殺念慮の選択は安全確認フラグを立てる', () => {
  const result = evaluateDsm5TrMdd({ suicidality: true });
  assert.equal(result.suicideRiskFlag, true);
});

test('空の基準オブジェクトを作れる', () => {
  const criteria = createEmptyCriteria();
  assert.equal(Object.keys(criteria).length, symptomCriteria.length + additionalCriteria.length);
  assert.equal(Object.values(criteria).every((value) => value === false), true);
});
