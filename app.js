/**
 * Craps Game UI Controller — v2 (player only, no AI)
 * Connects the CrapsGame engine (from craps-engine.js) to the DOM.
 */
(function () {
  'use strict';

  // ---- Engine Constants ----
  var Phase = CrapsConstants.Phase;
  var Outcome = CrapsConstants.Outcome;
  var GameEvent = CrapsConstants.GameEvent;
  var POINT_NUMBERS = CrapsConstants.POINT_NUMBERS;
  var SMALL_NUMBERS = CrapsConstants.SMALL_NUMBERS;
  var TALL_NUMBERS = CrapsConstants.TALL_NUMBERS;
  var ALL_NUMBERS = CrapsConstants.ALL_NUMBERS;
  var PayoutTable = CrapsConstants.PayoutTable;

  // ---- DOM References ----
  var dom = {
    balance: document.getElementById('player-balance'),
    message: document.getElementById('game-message'),
    die1: document.getElementById('die-1'),
    die2: document.getElementById('die-2'),
    diceTotal: document.getElementById('dice-total-value'),
    diceRollHistory: document.getElementById('dice-roll-history'),
    btnRoll: document.getElementById('btn-roll'),
    btnUndo: document.getElementById('btn-undo'),
    btnClear: document.getElementById('btn-clear-bets'),
    btnNewGame: document.getElementById('btn-new-game'),
    betAmount: document.getElementById('bet-amount'),
    betsList: document.getElementById('bets-list'),
    totalWagered: document.getElementById('total-wagered'),
    historyList: document.getElementById('history-list'),
    bettingHistoryList: document.getElementById('betting-history-list'),
    chipButtons: document.querySelectorAll('.chip-btn'),
    betAreas: document.querySelectorAll('.bet-area'),
    oddsModal: document.getElementById('odds-modal'),
    oddsModalTitle: document.getElementById('odds-modal-title'),
    oddsModalSub: document.getElementById('odds-modal-sub'),
    oddsOpt1x: document.getElementById('odds-opt-1x'),
    oddsOpt2x: document.getElementById('odds-opt-2x'),
    oddsOptNo: document.getElementById('odds-opt-no'),
  };

  // ---- State ----
  var selectedChipValue = 25;
  var isRolling = false;

  // ---- Game Engine ----
  var game = new CrapsGame(1000);

  // ---- Formatting helpers ----
  var BET_NAMES = {
    'pass': 'Pass Line',
    'dont-pass': "Don't Pass",
    'come': 'Come',
    'dont-come': "Don't Come",
    'field': 'Field',
    'big-6': 'Big 6',
    'big-8': 'Big 8',
    'place-4': 'Place 4',
    'place-5': 'Place 5',
    'place-6': 'Place 6',
    'place-8': 'Place 8',
    'place-9': 'Place 9',
    'place-10': 'Place 10',
    'buy-4': 'Buy 4',
    'buy-5': 'Buy 5',
    'buy-6': 'Buy 6',
    'buy-8': 'Buy 8',
    'buy-9': 'Buy 9',
    'buy-10': 'Buy 10',
    'lay-4': 'Lay 4',
    'lay-5': 'Lay 5',
    'lay-6': 'Lay 6',
    'lay-8': 'Lay 8',
    'lay-9': 'Lay 9',
    'lay-10': 'Lay 10',
    'put': 'Put',
    'small': 'All Small',
    'tall': 'All Tall',
    'all': 'Make Em All',
    'pass-odds': 'Pass Odds',
    'dont-pass-odds': "Don't Pass Odds",
    'come-odds': 'Come Odds',
    'dont-come-odds': "Don't Come Odds",
    'any-seven': 'Any 7',
    'any-craps': 'Any Craps',
    'hard-4': 'Hard 4',
    'hard-6': 'Hard 6',
    'hard-8': 'Hard 8',
    'hard-10': 'Hard 10',
    'horn-2': 'Horn 2',
    'horn-3': 'Horn 3',
    'horn-11': 'Horn 11',
    'horn-12': 'Horn 12',
    'split-seven-craps': 'Split 7/Craps',
    'split-craps-hard4': 'Split Craps/H4',
    'split-hard4-hard6': 'Split H4/H6',
    'split-hard6-hard8': 'Split H6/H8',
    'split-hard8-hard10': 'Split H8/H10',
    'split-hard10-horn2': 'Split H10/2',
    'split-horn2-horn3': 'Split 2/3',
    'split-horn3-horn11': 'Split 3/11',
    'split-horn11-horn12': 'Split 11/12',
  };

  // Split bet mapping: each split bet maps to two underlying prop bet types
  var SPLIT_BET_MAP = {
    'split-seven-craps':   ['any-seven', 'any-craps'],
    'split-craps-hard4':   ['any-craps', 'hard-4'],
    'split-hard4-hard6':   ['hard-4', 'hard-6'],
    'split-hard6-hard8':   ['hard-6', 'hard-8'],
    'split-hard8-hard10':  ['hard-8', 'hard-10'],
    'split-hard10-horn2':  ['hard-10', 'horn-2'],
    'split-horn2-horn3':   ['horn-2', 'horn-3'],
    'split-horn3-horn11':  ['horn-3', 'horn-11'],
    'split-horn11-horn12': ['horn-11', 'horn-12'],
  };

  var OUTCOME_MESSAGES = {};
  OUTCOME_MESSAGES[Outcome.NATURAL] = 'Natural! {sum} is a winner!';
  OUTCOME_MESSAGES[Outcome.CRAPS] = 'Craps! {sum} - shooter craps out!';
  OUTCOME_MESSAGES[Outcome.POINT_SET] = 'Point is {sum}. Hit {sum} before rolling a 7.';
  OUTCOME_MESSAGES[Outcome.POINT_HIT] = 'Point hit! {sum} - the shooter made the point!';
  OUTCOME_MESSAGES[Outcome.SEVEN_OUT] = 'Seven out! Pass line loses.';
  OUTCOME_MESSAGES[Outcome.NEUTRAL] = 'Rolled {sum}. No decision on the pass line.';

  function formatBetName(key) {
    return BET_NAMES[key] || key;
  }

  function formatCurrency(n) {
    return '$' + (Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2));
  }

  function getChipClass(amount) {
    if (amount >= 500) return 'chip-500';
    if (amount >= 100) return 'chip-100';
    if (amount >= 25)  return 'chip-25';
    if (amount >= 5)   return 'chip-5';
    return 'chip-1';
  }

  function formatChipLabel(amount) {
    if (amount >= 1000) return (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k';
    return '$' + amount;
  }

  // ---- Chip Cursor ----
  var CHIP_CURSOR_COLORS = {
    1:   { bg: '#cccccc', text: '#333333' },
    5:   { bg: '#cc2233', text: '#ffffff' },
    25:  { bg: '#22aa44', text: '#ffffff' },
    100: { bg: '#222222', text: '#ffffff' },
    500: { bg: '#8833bb', text: '#ffffff' },
  };

  function buildChipCursorSVG(denomination) {
    var colors = CHIP_CURSOR_COLORS[denomination] || CHIP_CURSOR_COLORS[25];
    var label = denomination >= 1000 ? (denomination / 1000) + 'k' : '$' + denomination;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">'
      + '<circle cx="16" cy="16" r="14" fill="' + colors.bg + '" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>'
      + '<circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="3,2"/>'
      + '<text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="' + colors.text + '">' + label + '</text>'
      + '</svg>';
    return svg;
  }

  function updateChipCursor(denomination) {
    if (!denomination) {
      document.documentElement.style.cursor = '';
      return;
    }
    var svg = buildChipCursorSVG(denomination);
    var encoded = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    document.documentElement.style.cursor = "url('data:image/svg+xml;utf8," + decodeURIComponent(encoded) + "') 16 16, auto";
  }

  // ---- Flying Chip Animation ----
  function createFlyingChip(betZone, amount, isWin) {
    var area = document.querySelector('[data-bet="' + betZone + '"]');
    if (!area) return;

    var rect = area.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'flying-chip ' + (isWin ? 'win' : 'loss');

    var chipIcon = document.createElement('div');
    chipIcon.className = 'chip-icon';
    chipIcon.textContent = formatChipLabel(amount);
    el.appendChild(chipIcon);

    var label = document.createElement('div');
    label.className = 'amount-label';
    label.textContent = (isWin ? '+' : '-') + formatCurrency(amount);
    el.appendChild(label);

    el.style.left = (rect.left + rect.width / 2 - 16) + 'px';
    el.style.top = (rect.top + rect.height / 2 - 16) + 'px';

    document.body.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1050);
  }

  // ---- Rendering ----
  function render() {
    renderBalance();
    renderPhase();
    renderPointMarkers();
    renderBets();
    renderChipStacks();
    dom.btnRoll.disabled = isRolling;
  }

  function renderBalance() {
    var bal = game.getBalance();
    dom.balance.textContent = formatCurrency(bal);
    dom.balance.style.color = bal < game._initialBalance ? 'var(--danger)' : 'var(--success)';
  }

  function renderPhase() {
    // Phase / point are shown on the board via the ON/OFF puck.
    // Here we only show/hide the PUT bet, which is point-phase only.
    var putBtn = document.querySelector('.put-bet');
    if (!putBtn) return;
    if (game.getGameState().phase === Phase.COME_OUT) {
      putBtn.classList.add('hidden');
    } else {
      putBtn.classList.remove('hidden');
    }
  }

  var _previousPoint = null;

  function renderPointMarkers() {
    var point = game.getPoint();
    POINT_NUMBERS.forEach(function (num) {
      var marker = document.getElementById('point-marker-' + num);
      if (!marker) return;
      var isOn = (point === num);
      marker.classList.toggle('on', isOn);
      if (isOn && _previousPoint !== num) {
        marker.classList.remove('glow-burst');
        void marker.offsetWidth;
        marker.classList.add('glow-burst');
        marker.addEventListener('animationend', function handler() {
          marker.classList.remove('glow-burst');
          marker.removeEventListener('animationend', handler);
        });
      }
    });
    // Single OFF puck lives in the Don't Come bar during the come-out roll
    var offPuck = document.getElementById('off-puck');
    if (offPuck) offPuck.classList.toggle('hidden', point !== null);
    _previousPoint = point;
  }

  function renderBets() {
    var bets = game.getBets();
    var keys = Object.keys(bets);
    var totalWager = 0;

    if (keys.length === 0) {
      dom.betsList.innerHTML = '<p class="no-bets">No active bets</p>';
      dom.totalWagered.textContent = '$0';
      return;
    }

    var html = '';
    keys.forEach(function (type) {
      bets[type].forEach(function (b) {
        var label = formatBetName(type);
        var pointInfo = b.point !== null ? ' (pt: ' + b.point + ')' : '';
        html += '<div class="bet-tag">'
          + '<span class="bet-tag-name">' + label + pointInfo + '</span>'
          + '<span class="bet-tag-amount">' + formatCurrency(b.amount) + '</span>'
          + '</div>';
        totalWager += b.amount;
      });
    });
    dom.betsList.innerHTML = html;
    dom.totalWagered.textContent = formatCurrency(totalWager);
  }

  function appendChip(stackEl, total, extraClass) {
    if (!stackEl || total <= 0) return;
    var chip = document.createElement('div');
    chip.className = 'chip ' + getChipClass(total) + (extraClass ? ' ' + extraClass : '');
    chip.textContent = formatChipLabel(total);
    stackEl.appendChild(chip);
  }

  // Come / Don't Come bets that have traveled to a point render in the
  // corresponding number box; un-pointed ones stay in the COME / DC bar.
  function renderTravelingChips(arr, baseId, ptPrefix, extraClass) {
    if (!arr) return;
    var flat = 0;
    var byPoint = {};
    arr.forEach(function (b) {
      if (b.point == null) flat += b.amount;
      else byPoint[b.point] = (byPoint[b.point] || 0) + b.amount;
    });
    appendChip(document.getElementById(baseId), flat, extraClass);
    Object.keys(byPoint).forEach(function (pt) {
      appendChip(document.getElementById(ptPrefix + pt), byPoint[pt], extraClass);
    });
  }

  function renderAtsProgress(bets) {
    var map = { small: SMALL_NUMBERS, tall: TALL_NUMBERS, all: ALL_NUMBERS };
    Object.keys(map).forEach(function (t) {
      var el = document.getElementById('ats-progress-' + t);
      if (!el) return;
      var arr = bets[t];
      if (!arr || !arr.length) { el.textContent = ''; return; }
      var total = map[t].length;
      var need = arr[0].need ? arr[0].need.length : total;
      el.textContent = (total - need) + '/' + total;
    });
  }

  function renderChipStacks() {
    document.querySelectorAll('.chip-stack, .come-chip-spot, .dc-chip-spot').forEach(function (stack) {
      stack.innerHTML = '';
    });

    var bets = game.getBets();
    Object.keys(bets).forEach(function (type) {
      // come / dont-come (travel to boxes) and come-odds (per point) handled below
      if (type === 'come' || type === 'dont-come' || type === 'come-odds') return;
      var total = 0;
      var off = false;
      bets[type].forEach(function (b) { total += b.amount; if (b.working === false) off = true; });
      var cls = type === 'pass-odds' ? 'odds-chip' : (off ? 'off' : null);
      appendChip(document.getElementById('chips-' + type), total, cls);
    });

    renderTravelingChips(bets['come'], 'chips-come', 'chips-come-pt-', 'come-chip');
    renderTravelingChips(bets['dont-come'], 'chips-dont-come', 'chips-dc-pt-', 'dc-chip');
    // Come odds sit in the same box as their come point, with a cyan ring
    renderTravelingChips(bets['come-odds'], null, 'chips-come-pt-', 'odds-chip');
    renderAtsProgress(bets);

    Object.keys(SPLIT_BET_MAP).forEach(function (splitKey) {
      var parts = SPLIT_BET_MAP[splitKey];
      var zone = document.querySelector('.split-zone[data-bet="' + splitKey + '"]');
      if (!zone) return;
      var hasBet = (bets[parts[0]] && bets[parts[0]].length > 0) ||
                   (bets[parts[1]] && bets[parts[1]].length > 0);
      zone.classList.toggle('has-bet', hasBet);
    });
  }

  function renderDice(d1, d2) {
    dom.die1.querySelector('.die-face').dataset.value = d1;
    dom.die2.querySelector('.die-face').dataset.value = d2;
    dom.diceTotal.textContent = d1 + d2;
  }

  // Chip color palettes keyed by roll type
  var CHIP_STYLES = {
    seven: { bg: '#992020', border: '#ff5555', glow: 'rgba(255,85,85,0.55)' },
    hard:  { bg: '#1a6b1a', border: '#44dd44', glow: 'rgba(68,221,68,0.55)' },
    craps: { bg: '#5c1a8e', border: '#bb55ff', glow: 'rgba(187,85,255,0.55)' },
    place: { bg: '#4a4a6a', border: '#8888bb', glow: null }
  };

  function getDiceChipType(die1, die2, sum) {
    if (sum === 7)                                         return 'seven';
    if (sum === 2 || sum === 3 || sum === 11 || sum === 12) return 'craps';
    if (die1 === die2)                                     return 'hard';
    return 'place';
  }

  function addDiceHistoryChip(die1, die2, sum) {
    if (!dom.diceRollHistory) return;

    var type = getDiceChipType(die1, die2, sum);
    var pal  = CHIP_STYLES[type];

    var chip = document.createElement('div');
    chip.title = die1 + ' + ' + die2 + ' = ' + sum;
    chip.textContent = sum;

    chip.style.cssText = [
      'flex-shrink:0',
      'width:26px',
      'height:26px',
      'border-radius:5px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font-size:0.82rem',
      'font-weight:bold',
      'color:#fff',
      'text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000',
      'background:' + pal.bg,
      'border:2px solid ' + pal.border,
      'box-shadow:0 1px 4px rgba(0,0,0,0.6)' + (pal.glow ? ',0 0 7px ' + pal.glow : ''),
      'cursor:default'
    ].join(';');

    dom.diceRollHistory.insertBefore(chip, dom.diceRollHistory.firstChild);

    while (dom.diceRollHistory.children.length > 20) {
      dom.diceRollHistory.removeChild(dom.diceRollHistory.lastChild);
    }
  }

  function addHistoryItem(diceData, outcome) {
    var placeholder = dom.historyList.querySelector('.no-history');
    if (placeholder) placeholder.remove();

    var cssClass = 'neutral';
    if (outcome === Outcome.NATURAL || outcome === Outcome.POINT_HIT) cssClass = 'win';
    else if (outcome === Outcome.CRAPS || outcome === Outcome.SEVEN_OUT) cssClass = 'loss';
    else if (outcome === Outcome.POINT_SET) cssClass = 'point-set';

    var item = document.createElement('span');
    item.className = 'history-item ' + cssClass;
    item.textContent = diceData.sum + ' (' + diceData.die1 + '+' + diceData.die2 + ')';
    item.title = outcome;
    dom.historyList.insertBefore(item, dom.historyList.firstChild);

    while (dom.historyList.children.length > 200) {
      dom.historyList.removeChild(dom.historyList.lastChild);
    }
  }

  function setMessage(msg, type) {
    dom.message.textContent = msg;
    dom.message.style.color = type === 'error' ? 'var(--danger)'
      : type === 'success' ? 'var(--success)'
      : 'var(--text-light)';
  }

  function addBettingHistoryEntry(rollNum, dice, resolved) {
    if (resolved.wins.length === 0 && resolved.losses.length === 0 && resolved.pushes.length === 0) {
      return;
    }

    var placeholder = dom.bettingHistoryList.querySelector('.no-history');
    if (placeholder) placeholder.remove();

    var parts = [];
    resolved.wins.forEach(function (w) {
      var profit = w.payout - w.amount;
      parts.push(formatBetName(w.betType) + ' +' + formatCurrency(profit));
    });
    resolved.losses.forEach(function (l) {
      parts.push(formatBetName(l.betType) + ' -' + formatCurrency(l.amount));
    });
    resolved.pushes.forEach(function (p) {
      parts.push(formatBetName(p.betType) + ' push');
    });

    var netWins = 0;
    resolved.wins.forEach(function (w) { netWins += w.payout - w.amount; });
    resolved.losses.forEach(function (l) { netWins -= l.amount; });

    var item = document.createElement('div');
    item.className = 'betting-history-item ' + (netWins > 0 ? 'win' : netWins < 0 ? 'loss' : 'push');
    item.innerHTML = '<span class="history-bet-detail">' + parts.join(', ') + '</span>'
      + '<span class="history-bet-result">' + formatCurrency(netWins) + '</span>';
    dom.bettingHistoryList.insertBefore(item, dom.bettingHistoryList.firstChild);

    while (dom.bettingHistoryList.children.length > 50) {
      dom.bettingHistoryList.removeChild(dom.bettingHistoryList.lastChild);
    }
  }

  // ---- Container mapping for field-level flashes ----
  function getFlashContainer(betType) {
    if (betType === 'pass' || betType === 'pass-odds') {
      return document.querySelector('.pass-area');
    }
    if (betType === 'dont-pass' || betType === 'dont-pass-odds') {
      return document.querySelector('.dont-pass-area');
    }
    if (betType === 'come' || betType === 'come-odds') {
      return document.querySelector('.come-area');
    }
    if (betType === 'dont-come' || betType === 'dont-come-odds') {
      return document.querySelector('.dont-come-bar');
    }
    if (betType === 'field') {
      return document.querySelector('.field-area');
    }
    var placeMatch = betType.match(/^(?:place|buy|lay)-(\d+)$/);
    if (placeMatch) {
      return document.querySelector('.number-box[data-number="' + placeMatch[1] + '"]');
    }
    if (betType === 'put') {
      return document.querySelector('.pass-area');
    }
    if (betType === 'big-6' || betType === 'big-8') {
      return document.querySelector('.big-bets');
    }
    if (/^(any-seven|any-craps|hard-|horn-)/.test(betType)) {
      return document.querySelector('.prop-bet[data-bet="' + betType + '"]') ||
             document.querySelector('[data-bet="' + betType + '"]');
    }
    if (betType.indexOf('split-') === 0) {
      return document.querySelector('.split-zone[data-bet="' + betType + '"]');
    }
    return document.querySelector('[data-bet="' + betType + '"]');
  }

  function applyFlash(element, className) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    element.addEventListener('animationend', function handler() {
      element.classList.remove(className);
      element.removeEventListener('animationend', handler);
    });
  }

  function flashBetAreas(resolved) {
    resolved.wins.forEach(function (w) {
      var container = getFlashContainer(w.betType);
      applyFlash(container, 'flash-field-win');
      var profit = w.payout - w.amount;
      createFlyingChip(w.betType, profit, true);
    });
    resolved.losses.forEach(function (l) {
      var container = getFlashContainer(l.betType);
      applyFlash(container, 'flash-field-loss');
      createFlyingChip(l.betType, l.amount, false);
    });
  }

  function buildResultSummary(resolved) {
    var winTotals = {}, lossTotals = {}, pushTypes = {};

    resolved.wins.forEach(function(w) {
      winTotals[w.betType] = (winTotals[w.betType] || 0) + (w.payout - w.amount);
    });
    resolved.losses.forEach(function(l) {
      lossTotals[l.betType] = (lossTotals[l.betType] || 0) + l.amount;
    });
    resolved.pushes.forEach(function(p) {
      pushTypes[p.betType] = true;
    });

    var parts = [];
    Object.keys(winTotals).forEach(function(t) {
      parts.push(formatBetName(t) + ' wins +' + formatCurrency(winTotals[t]));
    });
    Object.keys(lossTotals).forEach(function(t) {
      parts.push(formatBetName(t) + ' loses -' + formatCurrency(lossTotals[t]));
    });
    Object.keys(pushTypes).forEach(function(t) {
      parts.push(formatBetName(t) + ' push (returned)');
    });

    return parts.length > 0 ? ' | ' + parts.join(', ') : '';
  }

  // ---- Dice Roll Animation ----

  function animateRoll(callback) {
    isRolling = true;
    dom.btnRoll.disabled = true;
    dom.die1.classList.add('rolling');
    dom.die2.classList.add('rolling');

    var face1 = dom.die1.querySelector('.die-face');
    var face2 = dom.die2.querySelector('.die-face');
    var frames = 0;
    var interval = setInterval(function () {
      face1.dataset.value = Math.floor(Math.random() * 6) + 1;
      face2.dataset.value = Math.floor(Math.random() * 6) + 1;
      frames++;
      if (frames > 8) clearInterval(interval);
    }, 70);

    setTimeout(function () {
      dom.die1.classList.remove('rolling');
      dom.die2.classList.remove('rolling');
      isRolling = false;
      callback();
    }, 650);
  }

  // ---- Event Handlers ----

  // ---- Long-press to toggle a standing bet working / off ----
  var TOGGLEABLE = /^(place|buy|lay)-\d+$|^big-(6|8)$|^hard-\d+$/;
  var LONG_PRESS_MS = 500;
  var pressTimer = null;
  var longPressFired = false;

  function onBetToggle(area) {
    var betType = area.dataset.bet;
    if (!betType || isRolling) return;
    if (!TOGGLEABLE.test(betType)) {
      setMessage(formatBetName(betType) + " can't be turned off.", 'info');
      return;
    }
    var bets = game.getBets();
    if (!bets[betType] || !bets[betType].length) {
      setMessage('No ' + formatBetName(betType) + ' bet to toggle.', 'info');
      return;
    }
    var res = game.toggleWorking(betType);
    if (res.success) {
      setMessage(formatBetName(betType) + (res.working ? ' is ON (working).' : ' is OFF (not working).'),
        res.working ? 'success' : 'info');
    }
    render();
  }

  function onPressStart(e) {
    var area = e.currentTarget;
    longPressFired = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(function () {
      longPressFired = true;
      onBetToggle(area);
    }, LONG_PRESS_MS);
  }

  function cancelPress() {
    clearTimeout(pressTimer);
  }

  function onBetAreaClick(e) {
    var area = e.currentTarget;
    var betType = area.dataset.bet;
    if (!betType || isRolling) return;
    if (longPressFired) { longPressFired = false; return; } // long-press handled it

    var amount = parseInt(dom.betAmount.value, 10);
    if (!amount || amount <= 0) {
      setMessage('Enter a valid bet amount.', 'error');
      return;
    }

    if (SPLIT_BET_MAP[betType]) {
      var parts = SPLIT_BET_MAP[betType];
      var half = Math.floor(amount / 2);
      var remainder = amount - half;
      if (half <= 0) {
        setMessage('Split bet requires at least $2.', 'error');
        return;
      }

      var result1 = game.placeBet(parts[0], half);
      var result2 = game.placeBet(parts[1], remainder);

      if (result1.success && result2.success) {
        setMessage('Split bet placed: ' + formatBetName(parts[0]) + ' $' + half
          + ' + ' + formatBetName(parts[1]) + ' $' + remainder, 'success');
        area.classList.add('has-bet');
      } else {
        var errMsg = !result1.success ? result1.message : result2.message;
        setMessage('Split bet error: ' + errMsg, 'error');
      }

      render();
      return;
    }

    var result = game.placeBet(betType, amount);
    if (result.success) {
      setMessage(result.message, 'success');
    } else {
      setMessage(result.message, 'error');
    }
    render();
  }

  // Player net worth = cash balance + everything currently at risk on the felt.
  // The roll's true result is the change in net worth, which is correct
  // regardless of whether a winning bet was paid-and-removed or left standing.
  function netWorth() {
    var bets = game.getBets();
    var atRisk = 0;
    Object.keys(bets).forEach(function (k) {
      bets[k].forEach(function (b) { atRisk += b.amount; });
    });
    return game.getBalance() + atRisk;
  }

  function processRollResult(result, nwBefore) {
    renderDice(result.dice.die1, result.dice.die2);
    addDiceHistoryChip(result.dice.die1, result.dice.die2, result.dice.sum);

    // Net dollar result of this roll, shown as a number next to the balance.
    var net = (typeof nwBefore === 'number') ? (netWorth() - nwBefore) : 0;
    if (net > 0) setMessage('+' + formatCurrency(net), 'success');
    else if (net < 0) setMessage('-' + formatCurrency(-net), 'error');
    else setMessage('–', 'info'); // no change

    addHistoryItem(result.dice, result.outcome);
    addBettingHistoryEntry(game.getGameState().totalRolls, result.dice, result.resolved);
    flashBetAreas(result.resolved);
    render();
  }

  // ---- Take-odds popup (Bubble Craps style) ----
  var pendingOdds = null; // { kind: 'pass'|'come', point, flat }

  function oddsRatioText(point) {
    var r = PayoutTable['odds_' + point];
    return r ? r[0] + ':' + r[1] : '';
  }

  function showOddsPopup(kind, point, flat) {
    if (!dom.oddsModal || !flat || flat <= 0) return;
    pendingOdds = { kind: kind, point: point, flat: flat };
    var ratio = PayoutTable['odds_' + point];
    dom.oddsModalTitle.textContent =
      (kind === 'pass' ? 'Point is ' + point : 'Come bet on ' + point) + ' — Take Odds?';
    var win1 = ratio ? Math.floor(flat * ratio[0] / ratio[1]) : 0;
    var win2 = ratio ? Math.floor(flat * 2 * ratio[0] / ratio[1]) : 0;
    dom.oddsModalSub.innerHTML = 'True odds pay ' + oddsRatioText(point) + '.<br>'
      + '1× risks ' + formatCurrency(flat) + ' to win ' + formatCurrency(win1) + ' • '
      + '2× risks ' + formatCurrency(flat * 2) + ' to win ' + formatCurrency(win2);
    dom.oddsOpt1x.innerHTML = '1×<span class="opt-amt">' + formatCurrency(flat) + '</span>';
    dom.oddsOpt2x.innerHTML = '2×<span class="opt-amt">' + formatCurrency(flat * 2) + '</span>';
    dom.oddsModal.classList.remove('hidden');
  }

  function closeOddsPopup() {
    pendingOdds = null;
    if (dom.oddsModal) dom.oddsModal.classList.add('hidden');
  }

  function applyOdds(multiple) {
    if (!pendingOdds) return;
    var amount = pendingOdds.flat * multiple;
    var betType = pendingOdds.kind === 'pass' ? 'pass-odds' : 'come-odds';
    var opts = pendingOdds.kind === 'come' ? { point: pendingOdds.point } : undefined;
    var res = game.placeBet(betType, amount, opts);
    setMessage(res.success ? formatBetName(betType) + ' ' + multiple + '× placed.' : res.message,
      res.success ? 'success' : 'error');
    closeOddsPopup();
    render();
  }

  function maybePromptOdds(result, comePointsBefore) {
    var bets = game.getBets();
    // Pass point just established → offer pass odds
    if (result.outcome === Outcome.POINT_SET && bets.pass && bets.pass.length) {
      var flat = bets.pass.reduce(function (s, b) { return s + b.amount; }, 0);
      showOddsPopup('pass', game.getPoint(), flat);
      return;
    }
    // A come bet just traveled to a new number → offer come odds for it
    var afterPts = (bets.come || []).filter(function (b) { return b.point != null; });
    var beforeCount = {};
    comePointsBefore.forEach(function (p) { beforeCount[p] = (beforeCount[p] || 0) + 1; });
    var afterCount = {};
    afterPts.forEach(function (b) { afterCount[b.point] = (afterCount[b.point] || 0) + 1; });
    var newPoint = null;
    Object.keys(afterCount).forEach(function (p) {
      if (newPoint == null && afterCount[p] > (beforeCount[p] || 0)) newPoint = Number(p);
    });
    if (newPoint != null) {
      var nb = afterPts.find(function (x) { return x.point === newPoint; });
      showOddsPopup('come', newPoint, nb ? nb.amount : 0);
    }
  }

  function onRoll() {
    if (isRolling) return;

    var bets = game.getBets();
    if (Object.keys(bets).length === 0) {
      setMessage('Place at least one bet before rolling.', 'error');
      return;
    }

    var comePointsBefore = (bets.come || [])
      .filter(function (b) { return b.point != null; })
      .map(function (b) { return b.point; });
    var nwBefore = netWorth();

    animateRoll(function () {
      var result = game.roll();
      processRollResult(result, nwBefore);
      maybePromptOdds(result, comePointsBefore);
    });
  }

  function onUndo() {
    if (isRolling) return;
    var res = game.undoLastBet();
    setMessage(
      res.success ? 'Undid last bet, ' + formatCurrency(res.refund) + ' returned.' : res.message,
      res.success ? 'info' : 'error'
    );
    render();
  }

  function onClearBets() {
    if (isRolling) return;
    var res = game.clearRemovableBets();
    if (res.refund > 0) {
      setMessage('Cleared bets, ' + formatCurrency(res.refund) + ' returned.', 'info');
    } else {
      setMessage('No removable bets — in-play bets stay.', 'info');
    }
    closeOddsPopup();
    render();
  }

  function onChipSelect(e) {
    var btn = e.currentTarget;
    var value = parseInt(btn.dataset.value, 10);
    selectedChipValue = value;
    dom.betAmount.value = value;
    dom.chipButtons.forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    updateChipCursor(value);
  }

  function onBetAmountChange() {
    var val = parseInt(dom.betAmount.value, 10);
    dom.chipButtons.forEach(function (b) {
      b.classList.toggle('selected', parseInt(b.dataset.value, 10) === val);
    });
    selectedChipValue = val;
    var denominations = [1, 5, 25, 100, 500];
    var nearest = 25;
    for (var i = denominations.length - 1; i >= 0; i--) {
      if (val >= denominations[i]) { nearest = denominations[i]; break; }
    }
    updateChipCursor(nearest);
  }

  function onNewGame() {
    if (isRolling) return;
    closeOddsPopup();
    game.reset();
    dom.historyList.innerHTML = '<p class="no-history">No rolls yet</p>';
    dom.bettingHistoryList.innerHTML = '<p class="no-history">No results yet</p>';
    dom.diceRollHistory.innerHTML = '';
    dom.diceTotal.textContent = '-';
    dom.die1.querySelector('.die-face').dataset.value = 1;
    dom.die2.querySelector('.die-face').dataset.value = 1;
    setMessage('New game started. Place your bets!', 'info');
    render();
  }

  function onBetAreaKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onBetAreaClick(e);
    }
  }

  // ---- Init ----
  function init() {
    dom.betAreas.forEach(function (area) {
      area.addEventListener('click', onBetAreaClick);
      area.addEventListener('keydown', onBetAreaKeydown);
      // Long-press (hold) to toggle a standing bet working / off
      area.addEventListener('mousedown', onPressStart);
      area.addEventListener('mouseup', cancelPress);
      area.addEventListener('mouseleave', cancelPress);
      area.addEventListener('touchstart', onPressStart, { passive: true });
      area.addEventListener('touchend', cancelPress);
      area.addEventListener('touchmove', cancelPress, { passive: true });
      area.addEventListener('touchcancel', cancelPress);
      area.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });

    dom.btnRoll.addEventListener('click', onRoll);
    if (dom.btnUndo) dom.btnUndo.addEventListener('click', onUndo);
    dom.btnClear.addEventListener('click', onClearBets);
    dom.btnNewGame.addEventListener('click', onNewGame);

    dom.chipButtons.forEach(function (btn) {
      btn.addEventListener('click', onChipSelect);
    });

    dom.betAmount.addEventListener('input', onBetAmountChange);

    // Take-odds popup
    if (dom.oddsOpt1x) dom.oddsOpt1x.addEventListener('click', function () { applyOdds(1); });
    if (dom.oddsOpt2x) dom.oddsOpt2x.addEventListener('click', function () { applyOdds(2); });
    if (dom.oddsOptNo) dom.oddsOptNo.addEventListener('click', closeOddsPopup);
    if (dom.oddsModal) dom.oddsModal.addEventListener('click', function (e) {
      if (e.target === dom.oddsModal) closeOddsPopup();
    });

    updateChipCursor(selectedChipValue);
    render();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
