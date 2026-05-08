export const madrsItems = [
  { id: 'apparentSadness', title: '外見上の悲しみ', hint: '表情・姿勢・声の調子に表れる落ち込みや絶望感' },
  { id: 'reportedSadness', title: '訴えられる悲しみ', hint: '本人が語る悲しみ、気分の沈み、希望のなさ' },
  { id: 'innerTension', title: '内的緊張', hint: '落ち着かなさ、不安、いらだち、内的な苦痛' },
  { id: 'reducedSleep', title: '睡眠の減少', hint: '通常時と比べた睡眠時間や睡眠の深さの低下' },
  { id: 'reducedAppetite', title: '食欲の減退', hint: '通常時と比べた食欲や食事量の低下' },
  { id: 'concentrationDifficulties', title: '集中困難', hint: '注意の維持、考えをまとめること、判断のしづらさ' },
  { id: 'lassitude', title: '倦怠感', hint: '疲労感、活力低下、日常活動への取りかかりにくさ' },
  { id: 'inabilityToFeel', title: '感情を感じにくい', hint: '興味や喜び、周囲への反応が乏しくなる状態' },
  { id: 'pessimisticThoughts', title: '悲観的思考', hint: '将来への悲観、自責感、価値のなさの感覚' },
  { id: 'suicidalThoughts', title: '自殺念慮', hint: '死についての考え、生きる価値の低下、自傷・希死念慮' }
].map((item) => ({ ...item, max: 6 }));

export const severityBands = [
  { min: 0, max: 6, label: '正常範囲 / 寛解（参考）', className: 'severity--normal' },
  { min: 7, max: 19, label: '軽度（参考）', className: 'severity--mild' },
  { min: 20, max: 34, label: '中等度（参考）', className: 'severity--moderate' },
  { min: 35, max: 60, label: '重度（参考）', className: 'severity--severe' }
];

const optionLabels = {
  0: '症状なし / 正常範囲',
  1: 'ごく軽い',
  2: '軽い',
  3: '中間',
  4: '明らか / 強い',
  5: 'かなり強い',
  6: '最も強い / 持続的'
};

export function calculateTotal(scores) {
  return madrsItems.reduce((total, item) => {
    const value = Number(scores[item.id] ?? 0);
    return total + clampScore(value, item.max);
  }, 0);
}

export function clampScore(value, max) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), max);
}

export function getSeverity(total) {
  const score = clampScore(total, 60);
  return severityBands.find((band) => score >= band.min && score <= band.max) ?? severityBands.at(-1);
}

export function createEmptyScores(defaultValue = 0) {
  return Object.fromEntries(madrsItems.map((item) => [item.id, clampScore(defaultValue, item.max)]));
}

function renderForm() {
  const form = document.querySelector('#madrsForm');
  form.innerHTML = madrsItems.map(renderItem).join('');
  form.addEventListener('change', updateScore);
}

function renderItem(item, index) {
  const options = Array.from({ length: item.max + 1 }, (_, score) => `
    <label class="option">
      <input type="radio" name="${item.id}" value="${score}" ${score === 0 ? 'checked' : ''} />
      <span>${score}点<small>${optionLabels[score]}</small></span>
    </label>
  `).join('');

  return `
    <fieldset class="item-card" data-item="${item.id}">
      <legend class="item-card__header">
        <span class="item-number">${index + 1}</span>
        <span>
          <h3>${item.title}</h3>
          <p>${item.hint}</p>
        </span>
        <span class="item-score" id="score-${item.id}">0点</span>
      </legend>
      <div class="options">${options}</div>
    </fieldset>
  `;
}

function renderBands() {
  const target = document.querySelector('#severityBands');
  target.innerHTML = severityBands.map((band) => `
    <div class="band ${band.className}">
      <strong>${band.min}–${band.max}点</strong>
      <span>${band.label}</span>
    </div>
  `).join('');
}

function getScoresFromForm() {
  const data = new FormData(document.querySelector('#madrsForm'));
  return Object.fromEntries(madrsItems.map((item) => [item.id, Number(data.get(item.id) ?? 0)]));
}

function updateScore() {
  const scores = getScoresFromForm();
  madrsItems.forEach((item) => {
    document.querySelector(`#score-${item.id}`).textContent = `${clampScore(scores[item.id], item.max)}点`;
  });

  const total = calculateTotal(scores);
  const severity = getSeverity(total);
  const label = document.querySelector('#severityLabel');
  document.querySelector('#totalScore').textContent = String(total);
  label.textContent = severity.label;
  label.className = `severity ${severity.className}`;
}

function setAllScores(value) {
  madrsItems.forEach((item) => {
    const safeValue = clampScore(value, item.max);
    const option = document.querySelector(`input[name="${item.id}"][value="${safeValue}"]`);
    if (option) option.checked = true;
  });
  updateScore();
}

function bindControls() {
  document.querySelector('#fillZero').addEventListener('click', () => setAllScores(0));
  document.querySelector('#resetForm').addEventListener('click', () => {
    document.querySelector('#madrsForm').reset();
    updateScore();
  });
  document.querySelector('#printPage').addEventListener('click', () => window.print());
}

if (typeof document !== 'undefined') {
  renderForm();
  renderBands();
  bindControls();
  updateScore();
}
