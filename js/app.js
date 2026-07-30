/* ============================================================
   邮件回复决策助手 · GOFO 电邮服务组
   交互逻辑  app.js
   ============================================================
   负责决策树的渲染、导航、状态管理与用户操作。依赖 data.js 中的 NODES 对象。
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------
     0. 语言管理 & 国际化 (i18n)
     -------------------------------------------------- */
  const LANG_KEY = 'gofo_mail_lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'zh';

  const LANG_DATA = {
    zh: { label: '中文', htmlLang: 'zh-CN', title: '邮件回复决策助手 · GOFO 电邮服务组' },
    it: { label: 'Italiano', htmlLang: 'it', title: 'Assistente Email · GOFO Servizio Posta' }
  };

  // Set active NODES based on initial lang
  window.NODES = (currentLang === 'it') ? window.NODES_IT : window.NODES_ZH;

  // ========== i18n 词典 ==========
  // 格式：key -> { zh: '中文', it: 'Italiano' }
  var I18N = {
    // HTML 静态内容
    headerTitle:             { zh: '📧 邮件回复决策助手',               it: '📧 Assistente Decisionale Email' },
    headerSub:               { zh: 'GOFO 电邮服务组 · 依据《邮件回复操作流程 SOP》+《进线分类表》生成判断建议',
                               it: 'GOFO Servizio Posta Elettronica · Basato su SOP e Tabella di Classificazione' },
    prioLabel:               { zh: '场景优先级：<span class="priority-safe">安全类</span> &gt; 服务类 &gt; 时效类 &gt; 需求类 &gt; 其他类',
                               it: 'Priorità scenario:&ensp;<span class="priority-safe">Sicurezza</span>&ensp;&gt;&ensp;Servizio&ensp;&gt;&ensp;Tempistiche&ensp;&gt;&ensp;Richieste&ensp;&gt;&ensp;Altro'},
    hintText:                { zh: '💡 <b>用法</b>：先在 Udesk 打开邮件、在 CPS 查好运单轨迹，再按顺序回答问题。每一步选完自动推进，右下角会实时给出「回复话术 / 登记类别 / 是否上报 / 是否升级」。本工具只做辅助判断，<b style="color:#E73F1E;">具体情形仍须具体分析</b>。',
                               it: '💡 <b>Uso</b>: aprire l\'email in Udesk, verificare il tracking in CPS, quindi rispondere alle domande in ordine. Ogni risposta fa avanzare automaticamente. In basso a destra apparirà il «Template Risposta / Categoria / Segnalazione / Escalation». Questo strumento è solo di supporto, <b style="color:#E73F1E;">ogni caso va valutato singolarmente</b>.' },

    // 面包屑
    breadcrumbPath:          { zh: '<b>决策路径：</b> 开始 → ',        it: '<b>Percorso:</b> Inizio → ' },
    breadcrumbEnd:           { zh: '结论✌🏻',                         it: 'Conclusione✌🏻' },

    // 错误消息
    nodeNotFound:            { zh: '⚠️ 节点 "{0}" 未定义，请联系管理员。', it: '⚠️ Nodo "{0}" non definito. Contattare l\'amministratore.' },
    dataLoadError:           { zh: '⚠️ 语言数据加载失败：{0}',          it: '⚠️ Caricamento dati lingua fallito: {0}' },

    // 问题卡片按钮
    btnBack:                 { zh: '← 上一步',                         it: '← Indietro' },
    btnRestart:              { zh: '↻ 重新开始',                       it: '↻ Ricomincia' },

    // 结果卡片
    resultHead:              { zh: '✅ 判定结果',                       it: '✅ Risultato' },
    rowScript:               { zh: '回复话术',                          it: 'Template risposta' },
    rowAttach:               { zh: '需附附件',                          it: 'Allegato richiesto' },
    rowEvidence:             { zh: '截图/视频证据',                      it: 'Prova foto/video' },
    rowCategory:             { zh: '登记类别',                          it: 'Categoria' },
    rowReport:               { zh: '问题件上报',                        it: 'Segnalazione problema' },
    rowEscalation:           { zh: '客诉升级',                          it: 'Escalation' },
    rowNote:                 { zh: '操作备注',                          it: 'Note operative' },
    refPrefix:               { zh: '📚 依据：',                         it: '📚 Riferimento: ' },
    btnCopy:                 { zh: '复制结论',                          it: 'Copia risultato' },
    nocEscalation:           { zh: '无需升级',                          it: 'Nessuna escalation' },

    // 复制
    copyLabelScript:         { zh: '【回复话术】',                      it: '[Template risposta] ' },
    copyLabelCategory:       { zh: '【登记类别】',                      it: '[Categoria] ' },
    copyLabelReport:         { zh: '【上报】',                          it: '[Segnalazione] ' },
    copyLabelEsc:            { zh: '【升级】',                          it: '[Escalation] ' },
    copyLabelNote:           { zh: '【备注】',                          it: '[Note] ' },
    copyLabelRef:            { zh: '【依据】',                          it: '[Riferimento] ' },
    copyDone:                { zh: '✓ 已复制',                          it: '✓ Copiato' },
    copyFailAlert:           { zh: '复制失败，请手动复制：\n\n',        it: 'Copia fallita, copiare manualmente:\n\n' },

    // 语言切换按钮 title
    langSwitchToIt:          { zh: 'Switch to Italian',               it: 'Passa al Cinese' },
    langSwitchToZh:          { zh: '切换为意大利语',                    it: 'Passa al Cinese' }
  };

  /** 获取翻译文本，支持 {0}, {1} 占位符 */
  function t(key) {
    var entry = I18N[key];
    if (!entry) return '[MISSING:' + key + ']';
    var text = entry[currentLang] || entry.zh;
    // 替换占位符
    for (var i = 1; i < arguments.length; i++) {
      text = text.replace('{' + (i - 1) + '}', arguments[i]);
    }
    return text;
  }

  /** 更新页面上的静态 HTML 文本 */
  function updateStaticText() {
    var h1 = document.querySelector('header h1');
    if (h1) h1.innerHTML = I18N.headerTitle[currentLang];
    var sub = document.querySelector('header p');
    if (sub) sub.textContent = I18N.headerSub[currentLang];
    var prio = document.querySelector('.prio span');
    if (prio) prio.innerHTML = I18N.prioLabel[currentLang];
    var hint = document.querySelector('.hint');
    if (hint) hint.innerHTML = I18N.hintText[currentLang];
  }

  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = LANG_DATA[lang].htmlLang;
    document.title = LANG_DATA[lang].title;
    updateLangUI();
    updateStaticText();
    // Simply reassign the NODES reference and re-render
    window.NODES = (lang === 'it') ? window.NODES_IT : window.NODES_ZH;
    render();
  }

  function updateLangUI() {
    var labelEl = document.getElementById('langLabel');
    if (labelEl) labelEl.textContent = LANG_DATA[currentLang].label;
    var btn = document.getElementById('langSwitch');
    if (btn) btn.title = currentLang === 'zh' ? t('langSwitchToIt') : t('langSwitchToZh');
  }

  function initLang() {
    updateLangUI();
    updateStaticText();
    document.documentElement.lang = LANG_DATA[currentLang].htmlLang;
    document.title = LANG_DATA[currentLang].title;
    var btn = document.getElementById('langSwitch');
    if (btn) {
      btn.addEventListener('click', function () {
        switchLang(currentLang === 'zh' ? 'it' : 'zh');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLang);
  } else {
    initLang();
  }

  /* --------------------------------------------------
     1. DOM 引用缓存
     -------------------------------------------------- */
  const stage      = document.getElementById('stage');
  const breadcrumb = document.getElementById('breadcrumb');

  /* --------------------------------------------------
     2. 应用状态
     -------------------------------------------------- */
  let currentNode = 'start';    // 当前所在节点 ID
  const history   = [];         // 面包屑栈（记录已访问的问题节点 ID）

  /* --------------------------------------------------
     3. 路由入口：根据节点类型分发渲染
     -------------------------------------------------- */
  function render() {
    var node = window.NODES[currentNode];
    if (!node) {
      stage.innerHTML = '<div class="card"><p style="color:var(--warn)">' + t('nodeNotFound', currentNode) + '</p></div>';
      return;
    }

    // 清空区域
    stage.innerHTML = '';

    if (node.t === 'q') {
      renderQuestion(node);
    } else {
      renderResult(node);
    }

    updateBreadcrumb();
    scrollToTop();
  }

  /* --------------------------------------------------
     4. 渲染问题卡片
     -------------------------------------------------- */
  function renderQuestion(node) {
    const card = createEl('div', 'card');
    const gridSpec = node.grid || '';
    const useGrid = gridSpec.length > 0;
    const isSituation = (currentNode === 'q_situation');

    // 标题行
    const titleDiv = createEl('div', 'q-title');
    titleDiv.appendChild(createEl('span', 'tag', node.tag));
    titleDiv.appendChild(document.createTextNode(node.title));
    card.appendChild(titleDiv);

    // 选项列表
    let optsDiv, optBaseClass, cols;
    if (useGrid) {
      optsDiv = createEl('div', 'opts-grid');
      const parts = gridSpec.split('x');
      cols = parseInt(parts[0], 10);
      // Use CSS custom property so media queries can override
      optsDiv.style.setProperty('--grid-cols', cols);
      optBaseClass = 'opt-grid';
    } else if (isSituation) {
      optsDiv = createEl('div', 'opts-grid');
      optsDiv.style.setProperty('--grid-cols', 4);
      optBaseClass = 'opt-grid';
    } else {
      optsDiv = createEl('div', 'opts');
      optBaseClass = 'opt';
    }

    node.opts.forEach(function (opt, i) {
      var extraClass = '';
      if (useGrid && opt.urgency) {
        extraClass = ' opt-u-' + opt.urgency;
      }
      const btn = createEl('button', optBaseClass + extraClass, opt.label);
      if (opt.note && !useGrid && !isSituation) {
        btn.appendChild(createEl('small', '', opt.note));
      }
      btn.addEventListener('click', function () {
        choose(i);
      });
      optsDiv.appendChild(btn);
    });
    card.appendChild(optsDiv);

    // 底部按钮组
    const btnsDiv = createEl('div', 'btns');
    if (history.length > 0) {
      const backBtn = createEl('button', 'btn', t('btnBack'));
      backBtn.addEventListener('click', goBack);
      btnsDiv.appendChild(backBtn);
    }
    const restartBtn = createEl('button', 'btn', t('btnRestart'));
    restartBtn.addEventListener('click', restart);
    btnsDiv.appendChild(restartBtn);
    card.appendChild(btnsDiv);

    stage.appendChild(card);
  }

  /* --------------------------------------------------
     5. 处理选项点击
     -------------------------------------------------- */
  function choose(optionIndex) {
    var node = window.NODES[currentNode];
    var opt  = node.opts[optionIndex];

    // 记录当前节点到历史栈
    history.push(currentNode);

    // 如果选项带有 alert，插入一个临时的警告条
    if (opt.alert) {
      showAlert(opt.alert);
    }

    // 跳转到下一节点
    currentNode = opt.next;
    render();
  }

  /* --------------------------------------------------
     6. 显示预警横幅
     -------------------------------------------------- */
  function showAlert(message) {
    const div = createEl('div', 'alert', '⚠️ ' + message);
    stage.insertBefore(div, stage.firstChild);
  }

  /* --------------------------------------------------
     7. 渲染结果卡片
     -------------------------------------------------- */
  function renderResult(node) {
    const card = createEl('div', 'card');

    // 结果标题
    card.appendChild(createEl('div', 'res-head', t('resultHead')));

    // --- 回复话术 ---
    card.appendChild(makeRow(t('rowScript'), badgeSpan('b-script', node.script)));

    // --- 需附附件 ---
    if (node.attach) {
      card.appendChild(makeRow(t('rowAttach'), badgeSpan('b-attach', '📎 ' + node.attach)));
    }

    // --- 截图/视频证据 ---
    if (node.evidence) {
      card.appendChild(makeRow(t('rowEvidence'), badgeSpan('b-evidence', '🖼 ' + node.evidence)));
    }

    // --- 登记类别 ---
    const catEls = node.cat
      .filter(Boolean)
      .map(function (c) { return badgeSpan('b-cat', c); });
    card.appendChild(makeRow(t('rowCategory'), catEls));

    // --- 问题件上报 ---
    var reportText = node.report || '';
    var reportClass = (reportText.indexOf('上报') !== -1 || reportText.indexOf('Segnala') !== -1) ? 'b-report' : 'b-ok';
    card.appendChild(makeRow(t('rowReport'), badgeSpan(reportClass, node.report)));

    // --- 客诉升级 ---
    var escText = node.esc || '';
    var escClass = escText ? 'b-esc' : 'b-ok';
    card.appendChild(makeRow(t('rowEscalation'), badgeSpan(escClass, node.esc || t('nocEscalation'))));

    // --- 操作备注 ---
    card.appendChild(makeRow(t('rowNote'), node.note));

    // --- 依据引用 ---
    card.appendChild(createEl('div', 'ref', t('refPrefix') + node.ref));

    // --- 底部按钮 ---
    const btnsDiv = createEl('div', 'btns');

    if (history.length > 0) {
      const backBtn = createEl('button', 'btn', t('btnBack'));
      backBtn.addEventListener('click', goBack);
      btnsDiv.appendChild(backBtn);
    }

    const restartBtn = createEl('button', 'btn', t('btnRestart'));
    restartBtn.addEventListener('click', restart);
    btnsDiv.appendChild(restartBtn);

    const copyBtn = createEl('button', 'btn primary', t('btnCopy'));
    copyBtn.addEventListener('click', function () { copyResult(node); });
    btnsDiv.appendChild(copyBtn);

    card.appendChild(btnsDiv);
    stage.appendChild(card);
  }

  /* --------------------------------------------------
     8. 复制判断结论到剪贴板
     -------------------------------------------------- */
  function copyResult(node) {
    var text = t('copyLabelScript') + node.script + '\n' +
               t('copyLabelCategory') + node.cat.filter(Boolean).join(' > ') + '\n' +
               t('copyLabelReport') + node.report + '\n' +
               t('copyLabelEsc') + (node.esc || t('nocEscalation')) + '\n' +
               t('copyLabelNote') + node.note + '\n' +
               t('copyLabelRef') + node.ref;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flashCopyButton();
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function flashCopyButton() {
    var btn = stage.querySelector('.btn.primary');
    if (!btn) return;
    var original = btn.textContent;
    btn.textContent = t('copyDone');
    setTimeout(function () {
      btn.textContent = original;
    }, 1500);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      flashCopyButton();
    } catch (e) {
      window.alert(t('copyFailAlert') + text);
    }
    document.body.removeChild(textarea);
  }

  /* --------------------------------------------------
     9. 导航：回退上一步
     -------------------------------------------------- */
  function goBack() {
    if (history.length === 0) return;
    currentNode = history.pop();
    render();
  }

  /* --------------------------------------------------
     10. 导航：重新开始
     -------------------------------------------------- */
  function restart() {
    currentNode = 'start';
    history.length = 0;
    render();
  }

  /* --------------------------------------------------
     11. 面包屑导航
     -------------------------------------------------- */
  function updateBreadcrumb() {
    var node = window.NODES[currentNode];
    var label = node.tag || t('breadcrumbEnd');
    breadcrumb.innerHTML = t('breadcrumbPath') + label;
  }

  /* --------------------------------------------------
     12. 工具函数
     -------------------------------------------------- */

  /** 创建 HTML 元素 */
  function createEl(tag, className, textContent) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent !== undefined) el.textContent = textContent;
    return el;
  }

  /** 创建一行 (k / v) */
  function makeRow(key, valueHtml) {
    var row = createEl('div', 'row');
    row.appendChild(createEl('div', 'k', key));
    var v = createEl('div', 'v');
    if (typeof valueHtml === 'string') {
      v.innerHTML = valueHtml;
    } else if (Array.isArray(valueHtml)) {
      valueHtml.forEach(function (el) { v.appendChild(el); });
    } else {
      v.appendChild(valueHtml);
    }
    row.appendChild(v);
    return row;
  }

  /** 创建 badge span（内容为字符串时自动包装） */
  function badgeSpan(className, text) {
    return createEl('span', 'badge ' + className, text);
  }

  /** 平滑滚动到顶部 */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* --------------------------------------------------
     13. 启动
     -------------------------------------------------- */
  render();

})();
