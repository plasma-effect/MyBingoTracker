const PRIORITY_MAP = {
  0: "初期取得",
  1: "高",
  2: "中",
  3: "低",
  4: "無理"
};

const STATUS_FLOW = ["", "候補", "達成済み"];

// データの読み込み
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('data.jsonが見つかりません。');
    return response.json();
  })
  .then(data => renderData(data))
  .catch(error => {
    document.getElementById('container').innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
  });

function renderData(data) {
  const container = document.getElementById('container');
  container.innerHTML = '';

  // カテゴリー分け
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

    const statsSpan = document.createElement('span');
    statsSpan.className = 'stats';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'category-name';
    titleSpan.textContent = cat;

    const spacer = document.createElement('div');
    spacer.className = 'header-spacer';

    const filterLabel = document.createElement('label');
    filterLabel.className = 'filter-container';
    filterLabel.onclick = (e) => e.stopPropagation(); // 開閉防止

    const filterCheck = document.createElement('input');
    filterCheck.type = 'checkbox';
    filterCheck.onchange = function () {
      updateVisibility(itemList, this.checked);
    };

    filterLabel.append(filterCheck, document.createTextNode('候補・達成のみ'));
    summary.append(statsSpan, titleSpan, spacer, filterLabel);
    details.appendChild(summary);

    const itemList = document.createElement('div');
    itemList.className = 'item-list';

    categories[cat].forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';

      const prioDiv = document.createElement('div');
      prioDiv.className = `priority prio-${item.priority}`;
      prioDiv.textContent = PRIORITY_MAP[item.priority] || "不明";

      const statusBox = document.createElement('div');
      statusBox.className = 'status-box';

      // 優先度0は初期達成
      const initialState = (item.priority === 0) ? 2 : 0;
      applyState(itemDiv, statusBox, initialState);

      // 左クリック：正順
      statusBox.onclick = function () {
        const nextState = (parseInt(this.dataset.state) + 1) % STATUS_FLOW.length;
        applyState(itemDiv, statusBox, nextState);
        updateStats(statsSpan, details);
      };

      // 右クリック：逆順
      statusBox.oncontextmenu = function (e) {
        e.preventDefault();
        const currentState = parseInt(this.dataset.state);
        const nextState = (currentState + STATUS_FLOW.length - 1) % STATUS_FLOW.length;
        applyState(itemDiv, statusBox, nextState);
        updateStats(statsSpan, details);
      };

      const nameDiv = createSimpleDiv('name', item.name);
      const placeDiv = createSimpleDiv('place', item.place);
      const memoDiv = createSimpleDiv('memo', item.memo);

      itemDiv.append(prioDiv, statusBox, nameDiv, placeDiv, memoDiv);
      itemList.appendChild(itemDiv);
    });

    details.appendChild(itemList);
    container.appendChild(details);
    updateStats(statsSpan, details); // 初期カウント
  }
}

function applyState(rowElement, boxElement, stateIndex) {
  boxElement.dataset.state = stateIndex;
  boxElement.textContent = STATUS_FLOW[stateIndex];

  rowElement.classList.remove('state-candidate', 'state-completed');
  if (stateIndex === 1) rowElement.classList.add('state-candidate');
  if (stateIndex === 2) rowElement.classList.add('state-completed');

  // --- 修正箇所：親の details が存在するかチェックする ---
  const details = rowElement.closest('details');
  if (!details) return; // まだ DOM に追加されていない場合はここで終了

  const filterInput = details.querySelector('.filter-container input');
  if (filterInput && filterInput.checked && stateIndex === 0) {
    rowElement.classList.add('hidden');
  } else {
    rowElement.classList.remove('hidden');
  }
}

function updateStats(statsElement, parentElement) {
  const boxes = parentElement.querySelectorAll('.status-box');
  let candidateAndDone = 0;
  let doneOnly = 0;

  boxes.forEach(box => {
    const state = parseInt(box.dataset.state);
    if (state === 1 || state === 2) candidateAndDone++;
    if (state === 2) doneOnly++;
  });
  statsElement.textContent = `済: ${doneOnly} / 候補: ${candidateAndDone}`;
}

function updateVisibility(itemListElement, isChecked) {
  const items = itemListElement.querySelectorAll('.item');
  items.forEach(item => {
    const state = parseInt(item.querySelector('.status-box').dataset.state);
    if (isChecked && state === 0) {
      item.classList.add('hidden');
    } else {
      item.classList.remove('hidden');
    }
  });
}

function createSimpleDiv(className, text) {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = text;
  return div;
}
