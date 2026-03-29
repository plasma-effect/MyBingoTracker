const PRIORITY_MAP = {
  0: "初期取得",
  1: "高",
  2: "中",
  3: "低",
  4: "無理"
};

const STATUS_FLOW = ["", "候補", "達成済み"];

// 同一階層の data.json を取得
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('data.json が見つかりません');
    return response.json();
  })
  .then(data => renderData(data))
  .catch(error => {
    document.getElementById('container').innerHTML = `<p class="loading" style="color:red;">エラー: ${error.message}</p>`;
  });

function renderData(data) {
  const container = document.getElementById('container');
  container.innerHTML = '';

  const categories = {};
  data.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  for (let cat in categories) {
    // 優先度昇順で安定ソート
    categories[cat].sort((a, b) => a.priority - b.priority);

    const details = document.createElement('details');
    details.className = 'category-container';
    details.open = true;

    const summary = document.createElement('summary');
    const titleSpan = document.createElement('span');
    titleSpan.textContent = cat;

    const statsSpan = document.createElement('span');
    statsSpan.className = 'stats';

    summary.append(titleSpan, statsSpan);
    details.appendChild(summary);

    const itemList = document.createElement('div');
    itemList.className = 'item-list';

    categories[cat].forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';

      const statusBox = document.createElement('div');
      statusBox.className = 'status-box';

      // 優先度0なら初期状態で「達成済み」にする
      let initialState = (item.priority === 0) ? 2 : 0;
      applyState(itemDiv, statusBox, initialState);

      statusBox.onclick = function () {
        let nextState = (parseInt(this.dataset.state) + 1) % STATUS_FLOW.length;
        applyState(itemDiv, statusBox, nextState);
        updateStats(statsSpan, details);
      };

      // 各要素の作成
      const prioDiv = createDiv('priority', PRIORITY_MAP[item.priority] || "不明");
      const nameDiv = createDiv('name', item.name);
      const placeDiv = createDiv('place', item.place);
      const memoDiv = createDiv('memo', item.memo);

      itemDiv.append(prioDiv, statusBox, nameDiv, placeDiv, memoDiv);
      itemList.appendChild(itemDiv);
    });

    details.appendChild(itemList);
    container.appendChild(details);
    updateStats(statsSpan, details); // 初期表示のカウント更新
  }
}

function applyState(rowElement, boxElement, stateIndex) {
  boxElement.dataset.state = stateIndex;
  boxElement.textContent = STATUS_FLOW[stateIndex];

  // 行全体のクラスをリセット
  rowElement.classList.remove('state-candidate', 'state-completed');

  if (stateIndex === 1) rowElement.classList.add('state-candidate');
  if (stateIndex === 2) rowElement.classList.add('state-completed');
}

function updateStats(statsElement, parentElement) {
  const boxes = parentElement.querySelectorAll('.status-box');
  const total = boxes.length;
  let candidateAndDone = 0;
  let doneOnly = 0;

  boxes.forEach(box => {
    const state = parseInt(box.dataset.state);
    if (state === 1 || state === 2) candidateAndDone++;
    if (state === 2) doneOnly++;
  });

  statsElement.textContent = `候補：${candidateAndDone}/${total} | 達成済み：${doneOnly}/${total}`;
}

function createDiv(className, text) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  return div;
}
