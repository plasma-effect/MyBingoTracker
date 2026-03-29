const PRIORITY_MAP = {
  0: "初期取得",
  1: "高",
  2: "中",
  3: "低",
  4: "無理"
};

const STATUS_FLOW = ["", "候補", "達成済み"];

let globalData = [];

// データの読み込み
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('data.jsonが見つかりません。');
    return response.json();
  })
  .then(data => {
    // 元の順番(originalIndex)と初期ステータス(state)をデータに付与
    globalData = data.map((item, index) => {
      return {
        ...item,
        originalIndex: index,
        state: (item.priority === 0) ? 2 : 0 // 優先度0は初期状態で達成済み(2)
      };
    });
    renderData();
  })
  .catch(error => {
    document.getElementById('container').innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
  });

function renderData() {
  const container = document.getElementById('container');
  container.innerHTML = '';

  const categories = {};
  globalData.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  for (let cat in categories) {
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

    // ソート切替トグル
    const sortLabel = document.createElement('label');
    sortLabel.className = 'filter-container'; // スタイル流用
    sortLabel.style.marginRight = "10px";
    sortLabel.onclick = (e) => e.stopPropagation();
    const sortCheck = document.createElement('input');
    sortCheck.type = 'checkbox';
    sortLabel.append(sortCheck, document.createTextNode('元の順序'));

    // フィルタトグル
    const filterLabel = document.createElement('label');
    filterLabel.className = 'filter-container';
    filterLabel.onclick = (e) => e.stopPropagation();
    const filterCheck = document.createElement('input');
    filterCheck.type = 'checkbox';
    filterLabel.append(filterCheck, document.createTextNode('候補・達成のみ'));

    summary.append(statsSpan, titleSpan, spacer, sortLabel, filterLabel);
    details.appendChild(summary);

    const itemList = document.createElement('div');
    itemList.className = 'item-list';

    // 再描画関数
    const refreshItems = () => {
      itemList.innerHTML = '';
      const sortedItems = [...categories[cat]];

      if (sortCheck.checked) {
        sortedItems.sort((a, b) => a.originalIndex - b.originalIndex);
      } else {
        sortedItems.sort((a, b) => a.priority - b.priority);
      }

      sortedItems.forEach(item => {
        const itemDiv = createItemRow(item, statsSpan, details, filterCheck);
        itemList.appendChild(itemDiv);
      });
      updateVisibility(itemList, filterCheck.checked);
    };

    sortCheck.onchange = refreshItems;
    filterCheck.onchange = () => updateVisibility(itemList, filterCheck.checked);

    details.appendChild(itemList);
    container.appendChild(details);

    refreshItems();
    updateStats(statsSpan, details);
  }
}

function createItemRow(item, statsSpan, details, filterCheck) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';

  const prioDiv = document.createElement('div');
  prioDiv.className = `priority prio-${item.priority}`;
  prioDiv.textContent = PRIORITY_MAP[item.priority];

  const statusBox = document.createElement('div');
  statusBox.className = 'status-box';

  // 現在のitem.stateを反映
  applyState(itemDiv, statusBox, item.state, false);

  const handleStateChange = (direction) => {
    item.state = (item.state + STATUS_FLOW.length + direction) % STATUS_FLOW.length;
    applyState(itemDiv, statusBox, item.state, filterCheck.checked);
    updateStats(statsSpan, details);
  };

  statusBox.onclick = () => handleStateChange(1);
  statusBox.oncontextmenu = (e) => {
    e.preventDefault();
    handleStateChange(-1);
  };

  itemDiv.append(
    prioDiv,
    statusBox,
    createSimpleDiv('name', item.name),
    createSimpleDiv('place', item.place),
    createSimpleDiv('memo', item.memo)
  );
  return itemDiv;
}

function applyState(rowElement, boxElement, stateIndex, isFiltered) {
  boxElement.dataset.state = stateIndex;
  boxElement.textContent = STATUS_FLOW[stateIndex];

  rowElement.classList.remove('state-candidate', 'state-completed', 'hidden');
  if (stateIndex === 1) rowElement.classList.add('state-candidate');
  if (stateIndex === 2) rowElement.classList.add('state-completed');

  if (isFiltered && stateIndex === 0) {
    rowElement.classList.add('hidden');
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
