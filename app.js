export const symptomCriteria = [
  {
    id: 'depressedMood',
    title: '抑うつ気分',
    hint: 'ほとんど一日中、本人の訴えまたは周囲の観察で気分の落ち込みがみられる（小児・青年ではいらだちとして表れることがあります）。',
    core: true
  },
  {
    id: 'anhedonia',
    title: '興味・喜びの著しい低下',
    hint: 'ほとんど一日中、ほぼすべての活動への興味や楽しさが明らかに低下している。',
    core: true
  },
  {
    id: 'weightOrAppetite',
    title: '体重または食欲の変化',
    hint: '意図しない体重の増減、または食欲の明らかな増減がある。'
  },
  {
    id: 'sleepChange',
    title: '睡眠の変化',
    hint: '不眠または過眠が続いている。'
  },
  {
    id: 'psychomotorChange',
    title: '精神運動の変化',
    hint: '周囲から見ても分かる焦燥または制止（動き・話し方の遅さ）がある。'
  },
  {
    id: 'fatigue',
    title: '疲労感・気力低下',
    hint: '疲れやすさ、またはエネルギーの低下が目立つ。'
  },
  {
    id: 'worthlessnessGuilt',
    title: '無価値感または過剰な罪責感',
    hint: '現実に見合わない自責感、価値がないという感覚、過度な罪悪感がある。'
  },
  {
    id: 'concentration',
    title: '思考力・集中力・決断力の低下',
    hint: '考えがまとまりにくい、集中できない、決められない状態が続く。'
  },
  {
    id: 'suicidality',
    title: '死についての反復思考・自殺念慮',
    hint: '死にたい気持ち、自殺についての考え、計画、自殺企図などがある。',
    warning: true
  }
];

export const additionalCriteria = [
  {
    id: 'durationAndChange',
    title: '2週間以上かつ以前からの変化',
    hint: '上で選んだ症状が同じ2週間の期間内にあり、以前の状態からの変化として説明できる。'
  },
  {
    id: 'distressOrImpairment',
    title: '臨床的に重要な苦痛または機能障害',
    hint: '症状により、本人の強い苦痛、または仕事・学業・家庭・対人関係などの支障がある。'
  },
  {
    id: 'notSubstanceOrMedical',
    title: '物質・医薬品・身体疾患だけでは説明されない',
    hint: '薬物、医薬品、アルコール、身体疾患などの直接的な影響だけでは説明しにくい。'
  },
  {
    id: 'notPsychoticDisorder',
    title: '統合失調症スペクトラム等ではよりよく説明されない',
    hint: '統合失調感情症、統合失調症、妄想性障害などの経過中の症状としてのみ説明されない。'
  },
  {
    id: 'noManiaHypomania',
    title: '躁病・軽躁病エピソードの既往がない',
    hint: '過去に躁病または軽躁病エピソードがない（物質・身体疾患によるものは臨床的に別途判断）。'
  }
];

export function countSelectedSymptoms(selected = {}) {
  return symptomCriteria.filter((criterion) => Boolean(selected[criterion.id])).length;
}

export function hasCoreSymptom(selected = {}) {
  return symptomCriteria.some((criterion) => criterion.core && Boolean(selected[criterion.id]));
}

export function evaluateDsm5TrMdd(selected = {}) {
  const symptomCount = countSelectedSymptoms(selected);
  const coreSymptomPresent = hasCoreSymptom(selected);
  const symptomThresholdMet = symptomCount >= 5 && coreSymptomPresent;
  const additionalMet = additionalCriteria.every((criterion) => Boolean(selected[criterion.id]));
  const probableMajorDepressiveEpisode = symptomThresholdMet
    && Boolean(selected.durationAndChange)
    && Boolean(selected.distressOrImpairment)
    && Boolean(selected.notSubstanceOrMedical);
  const allMddCriteriaMet = probableMajorDepressiveEpisode
    && Boolean(selected.notPsychoticDisorder)
    && Boolean(selected.noManiaHypomania);

  return {
    symptomCount,
    coreSymptomPresent,
    symptomThresholdMet,
    probableMajorDepressiveEpisode,
    additionalMet,
    allMddCriteriaMet,
    suicideRiskFlag: Boolean(selected.suicidality)
  };
}

export function createEmptyCriteria(defaultValue = false) {
  return Object.fromEntries(
    [...symptomCriteria, ...additionalCriteria].map((criterion) => [criterion.id, Boolean(defaultValue)])
  );
}

function renderCriterion(criterion, index, groupName) {
  const badge = criterion.core ? '<span class="badge badge--core">中核症状</span>' : '';
  const warning = criterion.warning ? '<span class="badge badge--danger">安全確認</span>' : '';

  return `
    <label class="criterion-card" data-criterion="${criterion.id}">
      <input type="checkbox" name="${criterion.id}" />
      <span class="criterion-card__body">
        <span class="criterion-card__meta">${groupName} ${index + 1}${badge}${warning}</span>
        <strong>${criterion.title}</strong>
        <small>${criterion.hint}</small>
      </span>
    </label>
  `;
}

function renderForms() {
  const symptoms = document.querySelector('#symptomCriteria');
  const additional = document.querySelector('#additionalCriteria');
  symptoms.innerHTML = symptomCriteria.map((criterion, index) => renderCriterion(criterion, index, '症状')).join('');
  additional.innerHTML = additionalCriteria.map((criterion, index) => renderCriterion(criterion, index, '条件')).join('');
  document.querySelector('#dsmForm').addEventListener('change', updateResult);
}

function getSelectionsFromForm() {
  return Object.fromEntries(
    [...symptomCriteria, ...additionalCriteria].map((criterion) => {
      const field = document.querySelector(`input[name="${criterion.id}"]`);
      return [criterion.id, Boolean(field?.checked)];
    })
  );
}

function renderStatus(target, ok, okText, ngText) {
  target.textContent = ok ? okText : ngText;
  target.className = `status-pill ${ok ? 'status-pill--ok' : 'status-pill--ng'}`;
}

function updateResult() {
  const selections = getSelectionsFromForm();
  const result = evaluateDsm5TrMdd(selections);
  const verdict = document.querySelector('#verdict');
  const verdictDetail = document.querySelector('#verdictDetail');

  document.querySelector('#symptomCount').textContent = `${result.symptomCount}/9`;
  renderStatus(
    document.querySelector('#coreStatus'),
    result.coreSymptomPresent,
    '中核症状あり',
    '中核症状が未選択'
  );
  renderStatus(
    document.querySelector('#thresholdStatus'),
    result.symptomThresholdMet,
    '症状基準を満たす',
    '5症状以上＋中核症状が必要'
  );
  renderStatus(
    document.querySelector('#episodeStatus'),
    result.probableMajorDepressiveEpisode,
    '大うつ病エピソード基準A〜Cを満たす可能性',
    '期間・苦痛/障害・除外条件を確認'
  );

  if (result.allMddCriteriaMet) {
    verdict.textContent = 'DSM-5-TRの大うつ病性障害基準を満たす可能性があります';
    verdict.className = 'verdict verdict--met';
    verdictDetail.textContent = '最終診断には臨床面接、鑑別診断、重症度・寛解・特定用語の評価が必要です。';
  } else if (result.probableMajorDepressiveEpisode) {
    verdict.textContent = '大うつ病エピソード基準は満たす可能性がありますが、MDDの除外条件確認が未完了です';
    verdict.className = 'verdict verdict--partial';
    verdictDetail.textContent = '精神病性障害による説明や躁病・軽躁病エピソードの既往を確認してください。';
  } else {
    verdict.textContent = '現時点の入力ではDSM-5-TRの主要基準を満たしません';
    verdict.className = 'verdict verdict--not-met';
    verdictDetail.textContent = '症状数、中核症状、2週間以上の持続、苦痛・機能障害、物質/身体疾患の影響を確認してください。';
  }

  document.querySelector('#safetyAlert').hidden = !result.suicideRiskFlag;
}

function setAllCriteria(value) {
  document.querySelectorAll('#dsmForm input[type="checkbox"]').forEach((field) => {
    field.checked = Boolean(value);
  });
  updateResult();
}

function bindControls() {
  document.querySelector('#clearAll').addEventListener('click', () => setAllCriteria(false));
  document.querySelector('#checkAll').addEventListener('click', () => setAllCriteria(true));
  document.querySelector('#printPage').addEventListener('click', () => window.print());
}

if (typeof document !== 'undefined') {
  renderForms();
  bindControls();
  updateResult();
}
