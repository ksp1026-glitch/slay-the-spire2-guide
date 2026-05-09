/**
 * 杀戮尖塔2攻略站 - 表格列顺序修复脚本
 * 将所有 .card-table 表格统一为：卡牌 | 费用 | 类型 | 锐评
 * 兼容静态HTML和动态渲染，直接嵌入页面即可
 */
(function fixCardTables() {
  // 目标列顺序：第1列=卡牌, 第2列=费用, 第3列=类型, 第4列=锐评
  var TARGET_HEADERS = ['卡牌', '费用', '类型', '锐评'];

  var tables = document.querySelectorAll('.card-table');
  if (!tables.length) return;

  tables.forEach(function (table) {
    var thead = table.querySelector('thead');
    var tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    // 读取当前表头
    var ths = thead.querySelectorAll('th');
    var headerTexts = [];
    ths.forEach(function (th) { headerTexts.push(th.textContent.trim()); });

    // 建立「当前表头文字 → 列索引」的映射
    var colMap = {};
    headerTexts.forEach(function (text, i) { colMap[text] = i; });

    // 如果表头已经是目标顺序，跳过
    var alreadyCorrect = true;
    for (var j = 0; j < TARGET_HEADERS.length; j++) {
      if (headerTexts[j] !== TARGET_HEADERS[j]) { alreadyCorrect = false; break; }
    }
    if (alreadyCorrect) return;

    // 确定每列数据对应哪个目标列
    // 尝试匹配：卡牌名(card-name类) → 卡牌，数字/→ → 费用，攻击/技能/能力 → 类型，其余 → 锐评
    var rows = tbody.querySelectorAll('tr');

    // 生成新的目标顺序列索引
    var targetIndices = [];
    TARGET_HEADERS.forEach(function (targetName) {
      // 在当前表头中查找匹配
      var found = -1;
      headerTexts.forEach(function (ht, i) {
        if (ht.indexOf(targetName) !== -1 || targetName.indexOf(ht) !== -1) {
          found = i;
        }
      });
      // 回退：尝试推断列
      if (found === -1) {
        if (targetName === '卡牌') found = 0;
        else if (targetName === '费用') found = 1;
        else if (targetName === '类型') found = 2;
        else if (targetName === '锐评') found = 3;
      }
      targetIndices.push(Math.min(found, headerTexts.length - 1));
    });

    // 重排表头
    var newTheadRow = document.createElement('tr');
    TARGET_HEADERS.forEach(function (name) {
      var th = document.createElement('th');
      th.textContent = name;
      newTheadRow.appendChild(th);
    });
    thead.innerHTML = '';
    thead.appendChild(newTheadRow);

    // 重排每一行数据
    rows.forEach(function (row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 4) return;

      var newCells = [];
      // 根据目标列映射收集单元格
      TARGET_HEADERS.forEach(function (_, colIdx) {
        var srcIdx = targetIndices[colIdx];
        if (srcIdx < cells.length) {
          newCells.push(cells[srcIdx].cloneNode(true));
        }
      });

      // 清空并重新填充
      row.innerHTML = '';
      newCells.forEach(function (cell) { row.appendChild(cell); });

      // 卡牌名列加上 card-name 类
      var firstNameCell = row.querySelector('td:first-child');
      if (firstNameCell && !firstNameCell.classList.contains('card-name')) {
        // 检查是否是卡牌名（非数字、非emoji）
        var text = firstNameCell.textContent.trim();
        if (text.length >= 2 && !/^[0-9→X👍👌🤔💩🤩📈📉🔄🗑️🔀🆕]/ .test(text)) {
          firstNameCell.classList.add('card-name');
        }
      }
    });
  });
})();
