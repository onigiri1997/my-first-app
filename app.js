export const hamdItems = [
  { id: 'depressedMood', title: '抑うつ気分', hint: '悲しみ、絶望感、無力感などの訴えや観察所見', max: 4 },
  { id: 'guilt', title: '罪責感', hint: '自責、過去への後悔、罰を受ける感覚', max: 4 },
  { id: 'suicide', title: '自殺念慮', hint: '生きる意欲の低下、自傷・希死念慮、企図の有無', max: 4 },
  { id: 'insomniaEarly', title: '入眠障害', hint: '寝つきの悪さ', max: 2 },
  { id: 'insomniaMiddle', title: '中途覚醒', hint: '夜間に目が覚める、睡眠が浅い', max: 2 },
  { id: 'insomniaLate', title: '早朝覚醒', hint: '予定より早く目覚め、再入眠しにくい', max: 2 },
  { id: 'workActivities', title: '仕事と活動', hint: '興味・意欲・活動量・作業能力の低下', max: 4 },
  { id: 'retardation', title: '精神運動制止', hint: '思考や発語、動作の遅さ', max: 4 },
  { id: 'agitation', title: '焦燥', hint: '落ち着きのなさ、そわそわした行動', max: 4 },
  { id: 'anxietyPsychic', title: '精神的不安', hint: '心配、緊張、恐怖感など', max: 4 },
  { id: 'anxietySomatic', title: '身体的不安', hint: '動悸、発汗、胃腸症状、過呼吸感など', max: 4 },
  { id: 'somaticGastro', title: '消化器症状', hint: '食欲低下、胃部不快、便通変化など', max: 2 },
  { id: 'somaticGeneral', title: '一般身体症状', hint: '疲労感、痛み、重だるさなど', max: 2 },
  { id: 'genital', title: '性症状', hint: '性欲、月経などの変化', max: 2 },
  { id: 'hypochondriasis', title: '心気症', hint: '健康への過度な心配や身体へのとらわれ', max: 4 },
  { id: 'weightLoss', title: '体重減少', hint: '食事摂取や体重の変化', max: 2 },
  { id: 'insight', title: '病識', hint: '状態を病気・症状として理解している程度', max: 2 }
];

export const severityBands = [
  { min: 0, max: 7, label: '正常範囲（参考）', className: 'severity--normal' },
  { min: 8, max: 13, label: '軽度（参考）', className: 'severity--mild' },
  { min: 14, max: 18, label: '中等度（参考）', className: 'severity--moderate' },
  { min: 19, max: 22, label: '重度（参考）', className: 'severity--severe' },
  { min: 23, max: 52, label: '最重度（参考）', className: 'severity--very-severe' }
];

const optionLabels = {
  0: 'なし / 該当しない',
  1: '軽い',
  2: '明らか',
  3: '強い',
  4: '非常に強い'
};

export function calculateTotal(scores) {
  return hamdItems.reduce((total, item) => {
    const value = Number(scores[item.id] ?? 0);
    return total + clampScore(value, item.max);
  }, 0);
}

export function clampScore(value, max) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), max);
}

export function getSeverity(total) {
  const score = clampScore(total, 52);
  return severityBands.find((band) => score >= band.min && score <= band.max) ?? severityBands.at(-1);
}

export function createEmptyScores(defaultValue = 0) {
  return Object.fromEntries(hamdItems.map((item) => [item.id, clampScore(defaultValue, item.max)]));
}

function renderForm() {
  const form = document.querySelector('#hamdForm');
  form.innerHTML = hamdItems.map(renderItem).join('');
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
    <div class="band">
      <strong>${band.min}–${band.max}点</strong>
      <span>${band.label}</span>
    </div>
  `).join('');
}

function getScoresFromForm() {
  const data = new FormData(document.querySelector('#hamdForm'));
  return Object.fromEntries(hamdItems.map((item) => [item.id, Number(data.get(item.id) ?? 0)]));
}

function updateScore() {
  const scores = getScoresFromForm();
  hamdItems.forEach((item) => {
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
  hamdItems.forEach((item) => {
    const safeValue = clampScore(value, item.max);
    const option = document.querySelector(`input[name="${item.id}"][value="${safeValue}"]`);
    if (option) option.checked = true;
  });
  updateScore();
}

function bindControls() {
  document.querySelector('#fillZero').addEventListener('click', () => setAllScores(0));
  document.querySelector('#resetForm').addEventListener('click', () => {
    document.querySelector('#hamdForm').reset();
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
