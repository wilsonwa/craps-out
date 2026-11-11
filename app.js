/**
 * Bubble Craps — UI controller.
 * Drives the CrapsGame engine (craps-engine.js) and owns every pixel on screen.
 *
 * Sections: config · debug hooks · helpers · sound · DOM build · render ·
 *           dice · roll flow · placing bets · odds popup · popover · gestures ·
 *           buttons · menu · dialogs · boot
 */
(function () {
  'use strict';

  // ===================================================================
  // Config
  // ===================================================================
  var POINTS = [4, 5, 6, 8, 9, 10];
  var HORN = ['horn-2', 'horn-3', 'horn-11', 'horn-12'];
  var CHIPS = [1, 5, 25, 100, 500];
  var START_BANKROLL = 10000; // also the New Game reset value (engine reset() reuses it)
  var HOLD_MS = 420;
  var DRAG_TOL = 14; // px (Euclidean) a press on a draggable bet must travel to become a drag
  var TUMBLE_MS = 900;
  var STORE = { sound: 'craps.sound', chip: 'craps.chip' };

  var TRUE_ODDS = { 4: '2:1', 5: '3:2', 6: '6:5', 8: '6:5', 9: '3:2', 10: '2:1' };
  var PLACE_PAY = { 4: '9:5', 5: '7:5', 6: '7:6', 8: '7:6', 9: '7:5', 10: '9:5' };
  var LAY_PAY = { 4: '1:2', 5: '2:3', 6: '5:6', 8: '5:6', 9: '2:3', 10: '1:2' };

  var PROPS = [
    { spot: 'hard-4', area: 'h4', name: 'Hard 4', dice: [2, 2], pay: '7 to 1' },
    { spot: 'hard-6', area: 'h6', name: 'Hard 6', dice: [3, 3], pay: '9 to 1' },
    { spot: 'hard-8', area: 'h8', name: 'Hard 8', dice: [4, 4], pay: '9 to 1' },
    { spot: 'hard-10', area: 'h10', name: 'Hard 10', dice: [5, 5], pay: '7 to 1' },
    { spot: 'any-seven', area: 'a7', name: 'Any 7', pay: '4 to 1' },
    { spot: 'any-craps', area: 'ac', name: 'Any Craps', pay: '7 to 1' },
    { spot: 'horn-2', area: 'y2', name: '2', dice: [1, 1], pay: '30 to 1' },
    { spot: 'horn-3', area: 'y3', name: '3', dice: [1, 2], pay: '15 to 1' },
    { spot: 'horn-11', area: 'y11', name: '11', dice: [5, 6], pay: '15 to 1' },
    { spot: 'horn-12', area: 'y12', name: '12', dice: [6, 6], pay: '30 to 1' },
    { spot: 'horn', area: 'hn', name: 'Horn', pay: '2 · 3 · 11 · 12' },
  ];

  var NAMES = {
    'pass': 'Pass Line', 'dont-pass': "Don't Pass", 'come': 'Come', 'dont-come': "Don't Come",
    'pass-odds': 'Pass Odds', 'dont-pass-odds': "Don't Pass Odds", 'come-odds': 'Come Odds',
    'dont-come-odds': "Don't Come Odds", 'field': 'Field', 'big-6': 'Big 6', 'big-8': 'Big 8',
    'any-seven': 'Any 7', 'any-craps': 'Any Craps', 'horn-2': '2 (Aces)', 'horn-3': '3 (Ace-Deuce)',
    'horn-11': '11 (Yo)', 'horn-12': '12 (Boxcars)', 'put': 'Put', 'small': 'Small', 'tall': 'Tall',
    'all': 'All', 'horn': 'Horn',
  };
  POINTS.forEach(function (n) {
    NAMES['place-' + n] = 'Place ' + n;
    NAMES['buy-' + n] = 'Buy ' + n;
    NAMES['lay-' + n] = 'Lay ' + n;
  });
  [4, 6, 8, 10].forEach(function (n) { NAMES['hard-' + n] = 'Hard ' + n; });

  var TOGGLEABLE = /^(place|buy|lay)-\d+$|^big-[68]$|^hard-\d+$/;
  var POINTED = { 'come': 1, 'dont-come': 1, 'come-odds': 1, 'dont-come-odds': 1 };

  // ===================================================================
  // Engine + debug hooks
  // ===================================================================
  var params = new URLSearchParams(location.search);
  var DEBUG = params.get('debug') === '1';
  var SAFE_TEST = DEBUG && params.get('safe') === '1';
  var rollQueue = [];

  var game = DEBUG
    ? new CrapsGame(START_BANKROLL, { randomFn: function () { return rollQueue.length ? rollQueue.shift() : Math.random(); } })
    : new CrapsGame(START_BANKROLL);

  // ===================================================================
  // State
  // ===================================================================
  var ui = {
    chip: 25,
    rolling: false,
    sound: true,
    log: [],          // per-roll records for the menu
    offers: [],       // queued odds offers
    odds: null,       // open odds popup context
    pop: null,        // open popover context
    gesture: null,    // active pointer gesture
    spin: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
    lastPointerType: 'mouse',
  };
  var landscapeMQ = window.matchMedia ? window.matchMedia('(orientation: landscape)') : null;
  var reduceMotion = window.matchMedia ?window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  try {
    var s = localStorage.getItem(STORE.sound);
    if (s === '0') ui.sound = false;
    var c = parseInt(localStorage.getItem(STORE.chip), 10);
    if (CHIPS.indexOf(c) !== -1) ui.chip = c;
  } catch (e) { /* storage unavailable */ }

  // ===================================================================
  // Helpers
  // ===================================================================
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function cents(x) { return Math.round(x * 100); }
  function money(x, forceCents) {
    var neg = x < 0; x = Math.abs(x);
    var whole = cents(x) % 100 === 0;
    var s = (whole && !forceCents)
      ? Math.round(x).toLocaleString('en-US')
      : x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (neg ? '−' : '') + '$' + s;
  }
  function chipClass(a) {
    if (a >= 1000) return 'c1000';
    if (a >= 500) return 'c500';
    if (a >= 100) return 'c100';
    if (a >= 25) return 'c25';
    if (a >= 5) return 'c5';
    return 'c1';
  }
  function chipLabel(a) {
    if (a >= 10000) return Math.floor(a / 1000) + 'K';
    if (a >= 1000) return (Math.floor(a / 100) / 10).toString().replace(/\.0$/, '') + 'K';
    return String(Math.round(a));
  }
  function name(t, p) {
    var n = NAMES[t] || t;
    if (p != null && POINTED[t]) n += ' ' + p;
    return n;
  }
  function bets() { return game.getBets(); }
  function sumOf(t, p) {
    var arr = bets()[t] || [];
    var c = 0;
    arr.forEach(function (b) { if (p === undefined || b.point === p) c += cents(b.amount); });
    return c / 100;
  }
  function parseSpot(spot) {
    var at = spot.indexOf('@');
    if (at !== -1) return { type: spot.slice(0, at), point: parseInt(spot.slice(at + 1), 10) };
    if (spot === 'come' || spot === 'dont-come') return { type: spot, point: null };
    return { type: spot, point: undefined };
  }
  function spotAmount(spot) {
    if (spot === 'horn') { var t = 0; HORN.forEach(function (h) { t += sumOf(h); }); return t; }
    var s = parseSpot(spot);
    return sumOf(s.type, s.point);
  }
  function isOn(type) {
    var arr = bets()[type];
    if (!arr || !arr.length) return true;
    return arr.some(function (b) { return b.working; });
  }
  function pipsHtml(n, cls) {
    var map = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
    var on = map[n], h = '';
    for (var i = 0; i < 9; i++) h += on.indexOf(i) !== -1 ? '<i></i>' : '<span></span>';
    return '<span class="' + cls + '">' + h + '</span>';
  }
  function miniDice(d) { return pipsHtml(d[0], 'mdie') + pipsHtml(d[1], 'mdie'); }

  // ===================================================================
  // Sound (synthesized, unlocked on first trusted touch)
  // ===================================================================
  var Sound = {
    ctx: null,
    noise: null,
    unlock: function (e) {
      if (e && e.isTrusted === false) return;
      if (navigator.userActivation && !navigator.userActivation.isActive) return;
      try {
        if (!this.ctx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          this.ctx = new AC();
          var len = this.ctx.sampleRate * 0.5;
          this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
          var d = this.noise.getChannelData(0);
          for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
      } catch (err) { this.ctx = null; }
    },
    ready: function () { return ui.sound && this.ctx && this.ctx.state === 'running'; },
    tone: function (freq, t0, dur, type, vol, freqEnd) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },
    burst: function (t0, dur, freq, vol) {
      var c = this.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = this.noise;
      f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(t0, Math.random() * 0.3); src.stop(t0 + dur + 0.02);
    },
    play: function (kind) {
      if (!this.ready()) return;
      var t = this.ctx.currentTime + 0.005, i;
      if (kind === 'chip') {
        this.burst(t, 0.05, 3200, 0.35);
        this.tone(2400, t, 0.05, 'triangle', 0.08, 1500);
      } else if (kind === 'dice') {
        for (i = 0; i < 9; i++) this.burst(t + i * 0.075 + Math.random() * 0.03, 0.05, 1800 + Math.random() * 1600, 0.3);
        this.burst(t + 0.78, 0.08, 1200, 0.4);
      } else if (kind === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, k) { Sound.tone(f, t + k * 0.08, 0.22, 'triangle', 0.16); });
      } else if (kind === 'lose') {
        this.tone(330, t, 0.22, 'sawtooth', 0.07, 220);
        this.tone(220, t + 0.16, 0.32, 'sawtooth', 0.07, 140);
      } else if (kind === 'tick') {
        this.tone(1200, t, 0.04, 'sine', 0.06);
      }
    },
  };

  // ===================================================================
  // DOM build
  // ===================================================================
  var dom = {};

  function buildNumbers() {
    var wrap = $('numbers');
    POINTS.forEach(function (n) {
      var box = el('div', 'box');
      box.dataset.n = n;
      box.innerHTML =
        '<button type="button" class="spot lay" data-spot="lay-' + n + '" aria-label="Lay ' + n + ', pays ' + LAY_PAY[n] + '">' +
          '<span class="lbl">Lay</span><span class="pay">' + LAY_PAY[n] + '</span><span class="cs"></span></button>' +
        '<button type="button" class="spot buy" data-spot="buy-' + n + '" aria-label="Buy ' + n + ', true odds ' + TRUE_ODDS[n] + '">' +
          '<span class="lane"><span class="travel dc-t"></span><span class="travel come-t"></span></span>' +
          '<span class="drow"><span class="num">' + n + '</span><span class="puck-slot"></span></span>' +
          '<span class="lrow"><span class="pay"><span>Buy</span> <span>' + TRUE_ODDS[n] + '</span></span><span class="cs"></span></span>' +
          '</button>' +
        '<button type="button" class="spot place" data-spot="place-' + n + '" aria-label="Place ' + n + ', pays ' + PLACE_PAY[n] + '">' +
          '<span class="lbl">Place</span><span class="pay">' + PLACE_PAY[n] + '</span><span class="cs"></span></button>';
      wrap.appendChild(box);
    });
  }

  function buildProps() {
    var wrap = $('props');
    PROPS.forEach(function (p) {
      var b = el('button', 'spot prop p-' + p.area);
      b.type = 'button';
      b.dataset.spot = p.spot;
      b.style.gridArea = p.area;
      b.setAttribute('aria-label', (p.spot === 'horn' ? 'Horn, splits four ways' : p.name) + ', pays ' + p.pay);
      var h = '';
      if (p.dice) h += '<span class="dice-pair">' + miniDice(p.dice) + '</span>';
      if (!p.dice || p.spot.indexOf('hard') === 0) h += '<span class="lbl">' + p.name + '</span>';
      else h += '<span class="lbl">' + p.name + '</span>';
      h += '<span class="pay">' + p.pay + '</span><span class="cs"></span>';
      b.innerHTML = h;
      wrap.appendChild(b);
    });
  }

  function buildBonusPips() {
    document.querySelectorAll('[data-pips]').forEach(function (p) {
      var nums = p.dataset.pips === 'small' ? [2, 3, 4, 5, 6] : [8, 9, 10, 11, 12];
      p.innerHTML = nums.map(function (n) { return '<b data-n="' + n + '">' + n + '</b>'; }).join('');
    });
    document.querySelectorAll('[data-dice]').forEach(function (s) {
      s.innerHTML = miniDice(s.dataset.dice.split(',').map(Number));
    });
  }

  function buildDice() {
    ['die1', 'die2'].forEach(function (id, k) {
      var d = $(id);
      var cube = el('div', 'cube');
      for (var f = 1; f <= 6; f++) {
        var face = el('div', 'face f' + f);
        face.innerHTML = pipsHtml(f, 'x').replace(/^<span class="x">|<\/span>$/g, '');
        cube.appendChild(face);
      }
      d.appendChild(cube);
      setDie(k, k === 0 ? 5 : 2, false);
    });
  }

  function buildPuck() {
    dom.puck = el('span', 'puck off', 'OFF');
  }

  // ===================================================================
  // Render
  // ===================================================================
  var lastPoint = null;

  function render() {
    var b = bets();
    var phase = game.getPhase();
    var point = game.getPoint();

    // meters
    dom.credit.textContent = money(game.getBalance(), true);
    dom.bet.textContent = money(game.getTotalAtRisk());
    dom.point.textContent = point ? String(point) : 'OFF';
    dom.point.classList.toggle('on', !!point);

    // puck
    var puckParent = point ? document.querySelector('.box[data-n="' + point + '"] .puck-slot') : $('puck-home');
    if (dom.puck.parentNode !== puckParent) {
      puckParent.appendChild(dom.puck);
      dom.puck.className = 'puck ' + (point ? 'on' : 'off');
      dom.puck.textContent = point ? 'ON' : 'OFF';
      if (point !== lastPoint && !reduceMotion.matches) {
        dom.puck.classList.remove('pop'); void dom.puck.offsetWidth; dom.puck.classList.add('pop');
      }
    }
    lastPoint = point;
    document.querySelectorAll('.box .buy').forEach(function (bt) {
      bt.classList.toggle('is-point', bt.parentNode.dataset.n === String(point));
    });

    // static spots
    document.querySelectorAll('#felt .spot[data-spot]').forEach(function (s) {
      var spot = s.dataset.spot;
      var cs = s.querySelector(':scope > .cs, :scope > .lrow > .cs');
      var amount, check;
      if (spot === 'horn') {
        amount = 0;
        check = game.canPlace('horn-2');
      } else {
        amount = spotAmount(spot);
        check = game.canPlace(spot);
      }
      s.classList.toggle('dim', !check.valid);
      s.classList.toggle('has-bet', amount > 0);
      if (cs) setChip(cs, amount, spot, amount > 0 && spot !== 'horn' && !game.isWorking(spot));
    });

    // don't pass odds rides in the don't pass bar
    var dpo = document.querySelector('[data-sub="dont-pass-odds"]');
    var dpoAmt = sumOf('dont-pass-odds');
    dpo.innerHTML = '';
    if (dpoAmt > 0) dpo.appendChild(makeChip(dpoAmt, 'dont-pass-odds', false, true));

    // traveled come / don't come with their odds
    POINTS.forEach(function (n) {
      var box = document.querySelector('.box[data-n="' + n + '"]');
      var ct = box.querySelector('.come-t'), dt = box.querySelector('.dc-t');
      ct.innerHTML = ''; dt.innerHTML = '';
      var ca = sumOf('come', n), co = sumOf('come-odds', n), da = sumOf('dont-come', n), dco = sumOf('dont-come-odds', n);
      if (ca > 0) ct.appendChild(makeChip(ca, 'come@' + n, false));
      if (co > 0) ct.appendChild(makeChip(co, 'come-odds@' + n, !game.isWorking('come-odds'), true));
      if (da > 0) dt.appendChild(makeChip(da, 'dont-come@' + n, false));
      if (dco > 0) dt.appendChild(makeChip(dco, 'dont-come-odds@' + n, false, true));
      var lanes = (ca + co > 0 ? 1 : 0) + (da + dco > 0 ? 1 : 0);
      box.classList.toggle('lane1', lanes === 1);
      box.classList.toggle('lane2', lanes === 2);
    });

    renderBonus(b);
    renderButtons();
    if (!$('menu').hidden) renderMenu();
  }

  function makeChip(amount, spot, off, odds) {
    var c = el('span', 'chip ' + chipClass(amount) + (off ? ' is-off' : '') + (odds ? ' odds-chip' : ''));
    var lbl = chipLabel(amount);
    if (lbl.length >= 4) c.classList.add('small-text');
    c.innerHTML = '<b>' + lbl + '</b>' + (off ? '<i class="off">OFF</i>' : '');
    if (spot) c.dataset.spot = spot;
    c.dataset.amt = amount;
    return c;
  }

  function setChip(cs, amount, spot, off) {
    var cur = cs.firstChild;
    if (!amount) { if (cur) cs.innerHTML = ''; return; }
    if (cur && cur.dataset.amt === String(amount) && cur.classList.contains('is-off') === !!off) return;
    cs.innerHTML = '';
    var odds = spot === 'pass-odds';
    cs.appendChild(makeChip(amount, null, off, odds));
  }

  function renderBonus(b) {
    var small = b.small && b.small[0], tall = b.tall && b.tall[0], all = b.all && b.all[0];
    document.querySelectorAll('[data-pips] b').forEach(function (p) {
      var n = parseInt(p.dataset.n, 10);
      var src = n < 7 ? small : tall;
      var hit = (src && src.need.indexOf(n) === -1) || (all && all.need.indexOf(n) === -1);
      p.classList.toggle('hit', !!hit);
    });
    var cnt = $('all-count');
    if (all) {
      cnt.textContent = (10 - all.need.length) + ' of 10';
      cnt.classList.add('active');
    } else {
      cnt.textContent = '2–12';
      cnt.classList.remove('active');
    }
  }

  function toggleState() {
    // 'none' | 'on' (all working) | 'off' (all off) | 'mixed'
    var b = bets(), on = 0, off = 0;
    Object.keys(b).forEach(function (t) {
      if (!TOGGLEABLE.test(t)) return;
      b[t].forEach(function (w) { if (w.working) on++; else off++; });
    });
    if (!on && !off) return 'none';
    return off === 0 ? 'on' : (on === 0 ? 'off' : 'mixed');
  }

  function renderButtons() {
    var st = toggleState();
    var btn = $('btn-bets');
    btn.classList.toggle('is-off', st === 'off');
    btn.classList.toggle('is-mixed', st === 'mixed');
    btn.setAttribute('aria-pressed', st === 'off' ? 'false' : st === 'mixed' ? 'mixed' : 'true');
    $('bets-state').textContent = st === 'off' ? 'Bets Off' : st === 'mixed' ? 'Some Off' : 'Bets On';
    var bal = game.getBalance();
    document.querySelectorAll('.tchip').forEach(function (t) {
      var v = parseInt(t.dataset.v, 10);
      t.classList.toggle('sel', v === ui.chip);
      t.classList.toggle('poor', v > bal);
      t.setAttribute('aria-pressed', v === ui.chip ? 'true' : 'false');
    });
  }

  // ===================================================================
  // Toasts & effects
  // ===================================================================
  function toast(msg, kind) {
    var box = $('toasts');
    var t = el('div', 'toast' + (kind ? ' ' + kind : ''));
    t.textContent = msg;
    box.appendChild(t);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, kind === 'warn' ? 2600 : 2200);
  }

  function floatText(target, text, neg) {
    if (!target) return;
    var r = target.getBoundingClientRect();
    var f = el('div', 'float' + (neg ? ' neg' : ''));
    f.textContent = text;
    f.style.left = (r.left + r.width / 2) + 'px';
    f.style.top = (r.top + r.height / 2) + 'px';
    dom.fx.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 1300);
  }

  function restart(node, cls) {
    if (!node) return;
    node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, 950);
  }

  // ===================================================================
  // Dice
  // ===================================================================
  var FACE = { 1: [0, 0], 2: [90, 0], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 6: [0, 180] };

  function setDie(k, n, tumble) {
    var cube = (k === 0 ? $('die1') : $('die2')).firstChild;
    var s = ui.spin[k], f = FACE[n];
    if (tumble && !reduceMotion.matches) {
      var dir = Math.random() < 0.5 ? 1 : -1;
      s.x = f[0] + 360 * Math.ceil((s.x + 540 - f[0]) / 360);
      s.y = f[1] + 360 * (Math.round(s.y / 360) + dir * (1 + Math.round(Math.random())));
    } else {
      s.x = f[0] + 360 * Math.round((s.x - f[0]) / 360);
      s.y = f[1] + 360 * Math.round((s.y - f[1]) / 360);
    }
    var z = tumble ? (Math.random() * 16 - 8).toFixed(1) : 0;
    cube.style.transform = 'rotateZ(' + z + 'deg) rotateX(' + s.x + 'deg) rotateY(' + s.y + 'deg)';
  }

  function tumble(d1, d2, done) {
    if (reduceMotion.matches) {
      setDie(0, d1, false); setDie(1, d2, false);
      setTimeout(done, 180);
      return;
    }
    restart($('dome'), 'shake');
    restart($('die1'), 'hop');
    restart($('die2'), 'hop');
    var cubes = document.querySelectorAll('.cube');
    cubes.forEach(function (c) { c.classList.remove('settled'); });
    setDie(0, d1, true); setDie(1, d2, true);
    setTimeout(function () {
      // land exactly on the result even if the browser throttled the transition
      cubes.forEach(function (c) { c.classList.add('settled'); });
      done();
    }, TUMBLE_MS);
  }

  function rollKind(d) {
    if (d.sum === 7) return 'seven';
    if (d.sum === 2 || d.sum === 3 || d.sum === 11 || d.sum === 12) return 'craps';
    if (d.die1 === d.die2) return 'hard';
    return 'other';
  }

  function pushStrip(d) {
    var strip = $('roll-strip');
    var li = el('li', 'rchip ' + rollKind(d) + ' new');
    li.textContent = d.sum;
    li.title = d.die1 + ' + ' + d.die2;
    li.setAttribute('aria-label', d.sum + ' (' + d.die1 + ' and ' + d.die2 + ')');
    strip.insertBefore(li, strip.firstChild);
    while (strip.children.length > 18) strip.removeChild(strip.lastChild);
  }

  function caption(res) {
    var d = res.dice, o = res.outcome;
    if (o === 'natural') return [d.sum === 7 ? 'Winner 7' : 'Yo 11', 'good'];
    if (o === 'craps') return ['Craps ' + d.sum, 'bad'];
    if (o === 'point-set') return ['Point is ' + d.sum, 'point'];
    if (o === 'point-hit') return ['Point made!', 'good'];
    if (o === 'seven-out') return ['Seven out', 'bad'];
    if (d.die1 === d.die2 && [4, 6, 8, 10].indexOf(d.sum) !== -1) return ['Hard ' + d.sum, ''];
    if ([4, 6, 8, 10].indexOf(d.sum) !== -1) return ['Easy ' + d.sum, ''];
    var nick = { 2: 'Aces', 3: 'Ace-Deuce', 11: 'Yo 11', 12: 'Boxcars' }[d.sum];
    if (nick) return [nick, ''];
    return ['No decision', ''];
  }

  // ===================================================================
  // Roll flow
  // ===================================================================
  function spotEl(betType, point) {
    var sel = (POINTED[betType] && point != null) ? betType + '@' + point : betType;
    if (betType === 'dont-pass-odds') return document.querySelector('[data-sub="dont-pass-odds"] .chip') || document.querySelector('[data-spot="dont-pass"]');
    var node = document.querySelector('[data-spot="' + sel + '"]');
    return node;
  }
  function chipIn(node) {
    if (!node) return null;
    if (node.classList.contains('chip')) return node;
    return node.querySelector(':scope > .cs > .chip, :scope > .lrow > .cs > .chip');
  }

  function doRoll() {
    if (ui.rolling) return;
    closePopover();
    ui.rolling = true;
    document.body.classList.add('rolling');
    var flatComeBefore = sumOf('come', null);
    var res = game.roll();
    Sound.play('dice');
    $('dice-caption').textContent = 'Rolling…';
    $('dice-caption').className = 'caption';
    $('dice-total').textContent = '–';
    tumble(res.dice.die1, res.dice.die2, function () { settle(res, flatComeBefore); });
  }

  function settle(res, flatComeBefore) {
    var d = res.dice;
    $('dice-total').textContent = d.sum;
    var cap = caption(res);
    $('dice-caption').textContent = cap[0];
    $('dice-caption').className = 'caption ' + cap[1];
    pushStrip(d);

    // WIN meter
    var w = dom.win;
    w.classList.remove('pos', 'neg', 'zero');
    var resolvedAny = res.resolved.wins.length + res.resolved.losses.length > 0;
    if (res.net > 0) { w.textContent = '+' + money(res.net); w.classList.add('pos'); }
    else if (res.net < 0) { w.textContent = money(res.net); w.classList.add('neg'); }
    else { w.textContent = resolvedAny ? '$0' : '—'; w.classList.add('zero'); }
    restart(w, 'bump');
    dom.credit.textContent = money(game.getBalance(), true);
    dom.bet.textContent = money(game.getTotalAtRisk());

    // flashes, floating amounts, departing chips
    var winSpots = {};
    res.resolved.wins.forEach(function (x) {
      var node = spotEl(x.betType, x.point);
      var spot = node && node.classList.contains('chip') ? node.closest('.spot') : node;
      restart(spot, 'flash-win');
      var key = x.betType + '@' + (x.point || '');
      winSpots[key] = (winSpots[key] || 0) + x.profit;
      if (!x.stays) { var ch = chipIn(node); if (ch) ch.classList.add('collect'); }
    });
    Object.keys(winSpots).forEach(function (k) {
      var parts = k.split('@');
      floatText(spotEl(parts[0], parts[1] ? parseInt(parts[1], 10) : null), '+' + money(winSpots[k]));
    });
    var lossSpots = {};
    res.resolved.losses.forEach(function (x) {
      var node = spotEl(x.betType, x.point);
      var spot = node && node.classList.contains('chip') ? node.closest('.spot') : node;
      restart(spot, 'flash-lose');
      var ch = chipIn(node); if (ch) ch.classList.add('leave');
      lossSpots[x.betType + '@' + (x.point || '')] = node;
    });
    Object.keys(lossSpots).forEach(function (k) {
      var parts = k.split('@');
      floatText(lossSpots[k], money(-sumLoss(res, parts[0], parts[1])), true);
    });

    if (res.net > 0) Sound.play('win');
    else if (res.resolved.losses.length) Sound.play('lose');

    // returned money & pushes
    res.returned.forEach(function (r) {
      toast(name(r.betType) + ' returned (' + money(r.amount) + ') — ' + res.point + ' is the point.');
    });
    res.resolved.pushes.forEach(function (p) {
      if (p.returned) toast(name(p.betType, p.point) + ' returned (' + money(p.amount) + ') — odds are off on the come-out.');
      else if (p.betType === 'dont-pass' || p.betType === 'dont-come') toast(name(p.betType) + ' pushes on 12 (bar).');
    });
    var trav = res.outcome !== 'natural' && res.outcome !== 'craps' && flatComeBefore > 0 && [4, 5, 6, 8, 9, 10].indexOf(d.sum) !== -1;
    if (trav && !(d.sum === 7)) {
      // a flat come bet traveled to the number just rolled
      if (game.getOddsInfo('come-odds', d.sum)) ui.offers.push({ kind: 'come', point: d.sum });
    }
    if (res.outcome === 'point-set' && sumOf('pass') > 0) ui.offers.unshift({ kind: 'pass' });

    logRoll(res);

    setTimeout(function () {
      ui.rolling = false;
      document.body.classList.remove('rolling');
      render();
      nextOffer();
      if (!ui.odds) checkBroke();
    }, reduceMotion.matches ? 150 : 560);
  }

  function sumLoss(res, type, point) {
    var c = 0;
    res.resolved.losses.forEach(function (l) {
      if (l.betType === type && String(l.point || '') === String(point || '')) c += cents(l.amount);
    });
    return c / 100;
  }

  function logRoll(res) {
    var items = [];
    res.resolved.wins.forEach(function (w) {
      var t = name(w.betType, w.point) + ' +' + money(w.profit);
      if (w.commission) t += ' (vig ' + money(w.commission) + ')';
      if (w.stays) t += ', stays up';
      items.push({ c: 'w', t: t });
    });
    res.resolved.losses.forEach(function (l) { items.push({ c: 'l', t: name(l.betType, l.point) + ' ' + money(-l.amount) }); });
    res.resolved.pushes.forEach(function (p) { items.push({ c: '', t: name(p.betType, p.point) + (p.returned ? ' returned' : ' push') }); });
    res.returned.forEach(function (r) { items.push({ c: '', t: name(r.betType) + ' returned ' + money(r.amount) }); });
    ui.log.unshift({ n: game.getGameState().totalRolls, dice: res.dice, cap: caption(res)[0], net: res.net, items: items });
    if (ui.log.length > 200) ui.log.length = 200;
  }

  function checkBroke() {
    if (game.getBalance() < 1 && game.getTotalAtRisk() === 0) {
      confirmDialog('Out of credit', 'You have no credit left and nothing on the table. Start a new game with ' + money(START_BANKROLL) + '?', 'New Game', newGame);
    }
  }

  // ===================================================================
  // Placing bets
  // ===================================================================
  function reason(type) {
    var phase = game.getPhase();
    var bal = game.getBalance();
    if (bal < 1) return 'Not enough credit.';
    switch (type) {
      case 'pass': return 'The Pass Line is locked while the point is on. Try Come or Put.';
      case 'dont-pass': return "Don't Pass can only be bet on the come-out roll.";
      case 'come': return 'Come bets open once a point is set. Bet the Pass Line now.';
      case 'dont-come': return "Don't Come bets open once a point is set.";
      case 'put': return 'Put bets need a point. Bet the Pass Line on the come-out.';
      case 'small': case 'tall': case 'all':
        return phase !== 'come-out'
          ? 'Bonus bets open on the come-out roll.'
          : 'Bonus bets open only before any number has rolled since the last 7.';
      case 'pass-odds':
        if (!sumOf('pass')) return 'Bet the Pass Line first, then take odds.';
        if (phase !== 'point') return 'Odds open once a point is set.';
        return 'Odds are already at the 2× maximum.';
    }
    var c = game.canPlace(type);
    return c.message;
  }

  function placeAmount(type, amount) {
    var bal = game.getBalance();
    if (amount > bal) {
      if (bal < 1) { toast('Not enough credit.', 'warn'); return false; }
      toast('Not enough credit for a ' + money(amount) + ' chip (' + money(bal, true) + ' left).', 'warn');
      return false;
    }
    var res = game.placeBet(type, amount);
    if (!res.success) { toast(res.message, 'warn'); return false; }
    return true;
  }

  function tapSpot(spot, node) {
    if (ui.rolling) return;
    var s = parseSpot(spot);
    if (spot === 'pass-odds') return openOdds('pass');
    if (spot === 'dont-pass-odds') return openOdds('dont-pass');
    if (s.point != null && (s.type === 'come' || s.type === 'come-odds')) return openOdds('come', s.point);
    if (s.point != null && (s.type === 'dont-come' || s.type === 'dont-come-odds')) return openOdds('dont-come', s.point);
    if (spot === 'horn') return placeHorn();

    var check = game.canPlace(spot);
    if (!check.valid) { toast(reason(spot), 'warn'); Sound.play('tick'); return; }
    if (placeAmount(spot, ui.chip)) {
      Sound.play('chip');
      render();
      var ch = chipIn(node);
      if (ch && !reduceMotion.matches) restart(ch, 'drop');
    }
  }

  function placeHorn() {
    var check = game.canPlace('horn-2');
    if (!check.valid) { toast(reason('horn-2'), 'warn'); return; }
    var per = Math.floor(ui.chip / 4);
    if (per < 1) { toast('The Horn splits four ways — it needs at least $4. Pick a bigger chip.', 'warn'); return; }
    if (per * 4 > game.getBalance()) { toast('Not enough credit for a ' + money(per * 4) + ' Horn.', 'warn'); return; }
    HORN.forEach(function (h) { game.placeBet(h, per); });
    Sound.play('chip');
    var extra = ui.chip - per * 4;
    toast('Horn: ' + money(per) + ' each on 2, 3, 11, 12' + (extra ? ' (' + money(per * 4) + ' total)' : '') + '.', 'good');
    render();
  }

  function takeDown(spot) {
    var refund = 0, ok = false, msg = '';
    if (spot === 'horn') {
      HORN.forEach(function (h) { if (game.canRemove(h)) { var r = game.removeBet(h); if (r.success) { ok = true; refund += r.refund; } } });
    } else {
      var s = parseSpot(spot);
      var r = game.removeBet(s.type, s.point != null ? { point: s.point } : undefined);
      ok = r.success; refund = r.refund; msg = r.message;
    }
    if (ok) {
      Sound.play('chip');
      toast(name(spot === 'horn' ? 'horn' : parseSpot(spot).type, parseSpot(spot).point) + ' taken down — ' + money(refund) + ' back.');
    } else {
      toast(msg || 'That bet is locked in play.', 'warn');
    }
    render();
  }

  function toggleBet(type) {
    var r = game.toggleWorking(type);
    if (r.success) toast(name(type) + (r.working ? ' is ON.' : ' is OFF — it will not work until you turn it on.'));
    else toast(r.message, 'warn');
    render();
  }

  // ===================================================================
  // Odds popup
  // ===================================================================
  function oddsCtx(kind, point) {
    var type = kind + '-odds';
    var info = game.getOddsInfo(type, point);
    if (!info) return null;
    var isDont = kind === 'dont-pass' || kind === 'dont-come';
    var pointed = kind === 'come' || kind === 'dont-come';
    // 1x / 2x are target LEVELS: a multiple of the flat (for lay odds, the lay
    // that wins that multiple). Never above the engine's max.
    var t1 = Math.min(info.max, isDont ? Math.floor(info.flat * info.ratio[1] / info.ratio[0] + 1e-9) : info.flat);
    var t2 = info.max;
    return {
      kind: kind, type: type, isDont: isDont, info: info,
      point: pointed ? point : game.getPoint(),
      opts: pointed ? { point: point } : undefined,
      targets: { 1: t1, 2: t2 },
    };
  }

  function winFor(ctx, amount) {
    var r = ctx.info.ratio;
    return Math.floor(cents(amount) * r[0] / r[1]) / 100;
  }

  function openOdds(kind, point) {
    if (ui.rolling) return;
    closePopover();
    var ctx = oddsCtx(kind, point);
    if (!ctx) {
      if (kind === 'pass') toast(reason('pass-odds'), 'warn');
      else if (kind === 'dont-pass') toast("Lay odds need a Don't Pass bet and a point.", 'warn');
      else toast('No odds available on that bet right now.', 'warn');
      return;
    }
    ui.odds = ctx;
    var p = ctx.point, cur = ctx.info.current, fresh = cur === 0;
    var title = fresh ? {
      'pass': 'Point is ' + p + ' — take odds?',
      'come': 'Come bet on ' + p + ' — take odds?',
      'dont-pass': 'Lay odds against ' + p + '?',
      'dont-come': "Lay odds on Don't Come " + p + '?',
    }[kind] : {
      'pass': 'Pass line on ' + p + ' — odds',
      'come': 'Come bet on ' + p + ' — odds',
      'dont-pass': "Don't Pass vs " + p + ' — lay odds',
      'dont-come': "Don't Come " + p + ' — lay odds',
    }[kind];
    $('odds-title').textContent = title;
    var r = ctx.info.ratio;
    var sub = (ctx.isDont ? 'Lay pays ' : 'True odds pay ') + r[0] + ' to ' + r[1] + ' on ' + money(ctx.info.flat) + ' flat.';
    sub += fresh ? '' : ' Your odds now: ' + money(cur) + '.';
    if (ctx.kind === 'come' && game.getPhase() === 'come-out') sub += ' Come odds are off on the come-out roll.';
    $('odds-sub').textContent = sub;

    var btns = document.querySelectorAll('#odds .odds-opt');
    var b1 = btns[0], b2 = btns[1], b0 = btns[2];
    setOddsBtn(b1, ctx, 1);
    setOddsBtn(b2, ctx, 2);
    b0.querySelector('.o-amt').textContent = fresh ? 'flat only' : 'take down ' + money(cur);
    b0.disabled = false;
    $('odds-keep').hidden = fresh;
    $('odds').hidden = false;
    var first = !b2.disabled && !b2.classList.contains('current') ? b2 : b0;
    try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  function setOddsBtn(btn, ctx, m) {
    var amt = btn.querySelector('.o-amt');
    var target = ctx.targets[m], cur = ctx.info.current, delta = target - cur;
    btn.classList.remove('current');
    btn.disabled = false;
    var line = money(target) + ' · wins ' + money(winFor(ctx, target));
    if (delta === 0) {
      btn.classList.add('current');
      amt.textContent = line + ' · current';
    } else if (delta > 0) {
      amt.textContent = line + (cur > 0 ? ' · +' + money(delta) : '');
      if (delta > game.getBalance()) { btn.disabled = true; amt.textContent = line + ' · need ' + money(delta); }
    } else {
      amt.textContent = line + ' · ' + money(-delta) + ' back';
    }
  }

  function chooseOdds(m) {
    var ctx = ui.odds;
    if (!ctx) return;
    var cur = ctx.info.current;
    if (m === 0) {
      if (cur > 0) {
        var r = game.removeBet(ctx.type, ctx.opts);
        if (r.success) { Sound.play('chip'); toast(name(ctx.type, ctx.point) + ' taken down — ' + money(r.refund) + ' back.'); }
        else toast(r.message, 'warn');
      }
    } else {
      var target = ctx.targets[m], delta = target - cur, res;
      if (delta > 0) {
        res = game.placeBet(ctx.type, delta, ctx.opts);
      } else if (delta < 0) {
        // lower the odds: take them down and put the new level back up
        var rm = game.removeBet(ctx.type, ctx.opts);
        res = rm.success ? game.placeBet(ctx.type, target, ctx.opts) : rm;
      }
      if (res) {
        if (res.success) { Sound.play('chip'); toast(name(ctx.type, ctx.point) + ' set to ' + money(target) + ' (' + m + '×).', 'good'); }
        else toast(res.message, 'warn');
      }
    }
    closeOdds();
  }

  function closeOdds() {
    if (!ui.odds) { $('odds').hidden = true; healViewport(); return; }
    ui.odds = null;
    $('odds').hidden = true;
    healViewport();
    render();
    setTimeout(function () { nextOffer(); if (!ui.odds) checkBroke(); }, 0);
  }

  function nextOffer() {
    while (ui.offers.length && !ui.odds) {
      var o = ui.offers.shift();
      var ctx = oddsCtx(o.kind, o.point);
      if (ctx && ctx.info.current === 0 && ctx.info.remaining >= 1 && game.getBalance() >= 1) {
        openOdds(o.kind, o.point);
        return;
      }
    }
  }

  // ===================================================================
  // Hold popover
  // ===================================================================
  function popoverItems(spot) {
    var items = [];
    var s = parseSpot(spot);
    var amount = spotAmount(spot);
    if (amount <= 0) return null;
    var head = '', note = '';
    var phase = game.getPhase();

    if (spot === 'horn') {
      head = 'Horn · ' + money(amount);
      if (HORN.some(function (h) { return game.canRemove(h); })) items.push({ t: 'Take down ' + money(amount), f: function () { takeDown('horn'); }, cls: 'danger' });
    } else {
      var t = s.type, p = s.point;
      head = name(t, p) + ' · ' + money(amount);
      if (game.canRemove(t, p != null ? p : undefined)) {
        items.push({ t: 'Take down', f: function () { takeDown(spot); }, cls: 'danger' });
      } else {
        note = t === 'pass' ? 'Locked while the point is on.'
          : t === 'come' ? 'Locked once it travels to a number.'
          : (t === 'small' || t === 'tall' || t === 'all') ? 'Locked in play after a roll.'
          : 'Locked in play.';
      }
      if (TOGGLEABLE.test(t)) {
        var on = isOn(t);
        items.push({ t: on ? 'Turn off' : 'Turn on', f: function () { toggleBet(t); } });
        if (!game.isWorking(t) && on) note = 'Off on the come-out roll.';
      }
      if ((t === 'pass' || t === 'pass-odds') && phase === 'point') items.push({ t: 'Odds…', f: function () { openOdds('pass'); } });
      if ((t === 'come' || t === 'come-odds') && p != null) items.push({ t: 'Odds…', f: function () { openOdds('come', p); } });
      if ((t === 'dont-pass' || t === 'dont-pass-odds') && phase === 'point') items.push({ t: 'Lay odds…', f: function () { openOdds('dont-pass'); } });
      if ((t === 'dont-come' || t === 'dont-come-odds') && p != null) items.push({ t: 'Lay odds…', f: function () { openOdds('dont-come', p); } });
      if (t === 'come-odds' && phase === 'come-out') note = 'Come odds are off on the come-out.';
    }
    items.push({ t: 'Cancel', f: function () {}, cls: 'cancel' });
    return { head: head, note: note, items: items };
  }

  function openPopover(spot, anchor) {
    var model = popoverItems(spot);
    if (!model) return false;
    closePopover();
    var pop = $('popover');
    $('pop-head').innerHTML = '';
    $('pop-head').appendChild(document.createTextNode(model.head));
    if (model.note) { var sm = el('small'); sm.textContent = model.note; $('pop-head').appendChild(sm); }
    var list = $('pop-items');
    list.innerHTML = '';
    model.items.forEach(function (it) {
      var b = el('button', it.cls || '');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.textContent = it.t;
      b.addEventListener('click', function () { closePopover(); it.f(); });
      list.appendChild(b);
    });
    $('pop-backdrop').hidden = false;
    pop.hidden = false;
    // position near the anchor, inside the safe area. The popover is absolute
    // inside the fixed <body>, so convert viewport coords to body coords
    // (body sits at 0,0, so this is normally a no-op) and clamp to the body's
    // size, which is the pinned shell height in an installed iPhone app.
    var br = document.body.getBoundingClientRect();
    var a = anchor.getBoundingClientRect();
    var r = { left: a.left - br.left, top: a.top - br.top, bottom: a.bottom - br.top, width: a.width };
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var vw = br.width, vh = br.height;
    var cs = getComputedStyle(document.documentElement);
    var st = parseFloat(cs.getPropertyValue('--safe-top')) || 0;
    var sb = parseFloat(cs.getPropertyValue('--safe-bottom')) || 0;
    var sl = parseFloat(cs.getPropertyValue('--safe-left')) || 0;
    var sr = parseFloat(cs.getPropertyValue('--safe-right')) || 0;
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(sl + 8, Math.min(left, vw - sr - pw - 8));
    var top = r.top - ph - 8;
    if (top < st + 8) top = r.bottom + 8;
    if (top + ph > vh - sb - 8) top = Math.max(st + 8, vh - sb - ph - 8);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    ui.pop = { spot: spot };
    var firstBtn = list.querySelector('button');
    try { firstBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    return true;
  }

  function closePopover() {
    if (!ui.pop) return;
    ui.pop = null;
    $('popover').hidden = true;
    $('pop-backdrop').hidden = true;
    healViewport();
  }

  // ===================================================================
  // Gestures: tap · hold · drag-to-tray
  // ===================================================================
  function canDrag(spot) {
    if (spotAmount(spot) <= 0) return false;
    if (spot === 'horn') return HORN.some(function (h) { return game.canRemove(h); });
    var s = parseSpot(spot);
    return game.canRemove(s.type, s.point != null ? s.point : undefined);
  }

  function onFeltDown(e) {
    ui.lastPointerType = e.pointerType || 'mouse';
    if (e.button > 0) return;
    if (ui.gesture) endGesture();
    var node = e.target.closest ? e.target.closest('[data-spot]') : null;
    if (!node || ui.rolling) return;
    var spot = node.dataset.spot;
    var g = { id: e.pointerId, node: node, spot: spot, x: e.clientX, y: e.clientY, held: false, moved: false, drag: null, timer: 0 };
    if (spotAmount(spot) > 0) {
      g.timer = setTimeout(function () {
        if (ui.gesture !== g || g.drag || g.moved) return;
        g.held = true;
        openPopover(spot, node);
      }, HOLD_MS);
    }
    ui.gesture = g;
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  }

  function onMove(e) {
    var g = ui.gesture;
    if (!g || e.pointerId !== g.id) return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.drag && !g.moved && !g.held && Math.sqrt(dx * dx + dy * dy) > DRAG_TOL) {
      // a real slide: stop the hold timer; only a draggable bet turns into a drag
      clearTimeout(g.timer);
      if (canDrag(g.spot)) {
        var amt = spotAmount(g.spot);
        var ghost = makeChip(amt, null, false);
        ghost.classList.add('ghost');
        dom.fx.appendChild(ghost);
        g.drag = ghost;
        document.body.classList.add('dragging');
        var src = chipIn(g.node);
        if (src) src.style.opacity = '0.35';
        g.src = src;
      } else {
        g.moved = true;
      }
    }
    if (g.drag) {
      e.preventDefault();
      g.drag.style.left = e.clientX + 'px';
      g.drag.style.top = e.clientY + 'px';
      dom.tray.classList.toggle('over', overTray(e.clientX, e.clientY));
    }
  }

  function overTray(x, y) {
    var r = dom.tray.getBoundingClientRect();
    return x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 10 && y <= r.bottom + 6;
  }

  function onUp(e) {
    var g = ui.gesture;
    if (!g || e.pointerId !== g.id) return;
    endGesture();
    if (g.drag) {
      if (overTray(e.clientX, e.clientY)) takeDown(g.spot);
      else render();
      return;
    }
    if (g.held) return;
    // A press with no drag is a tap if it ends over the same spot, however much
    // the finger wobbled on the way.
    var over = document.elementFromPoint(e.clientX, e.clientY);
    var overSpot = over && over.closest ? over.closest('[data-spot]') : null;
    if (!overSpot || overSpot.dataset.spot !== g.spot) return;
    tapSpot(g.spot, overSpot);
  }

  function onCancel(e) {
    var g = ui.gesture;
    if (!g || e.pointerId !== g.id) return;
    endGesture();
    render();
  }

  function endGesture() {
    var g = ui.gesture;
    ui.gesture = null;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    if (!g) return;
    clearTimeout(g.timer);
    if (g.drag && g.drag.parentNode) g.drag.parentNode.removeChild(g.drag);
    if (g.src) g.src.style.opacity = '';
    document.body.classList.remove('dragging');
    dom.tray.classList.remove('over');
  }

  // keyboard: Enter/Space on a spot = tap; context-menu key / right-click = hold
  function onFeltClick(e) {
    if (e.detail !== 0) return; // pointer taps are handled by pointer events
    var node = e.target.closest('[data-spot]');
    if (node) tapSpot(node.dataset.spot, node);
  }
  function onFeltContext(e) {
    e.preventDefault();
    if (ui.lastPointerType === 'touch' || ui.lastPointerType === 'pen') return; // long-press handled by hold timer
    var node = e.target.closest('[data-spot]');
    if (!node || ui.rolling) return;
    if (ui.gesture) endGesture();
    if (!openPopover(node.dataset.spot, node)) toast('No bet here yet — tap to bet.');
  }

  // ===================================================================
  // Buttons
  // ===================================================================
  function onRepeat() {
    if (ui.rolling) return;
    var r = game.repeatBets();
    if (r.success) { Sound.play('chip'); toast(r.message.replace(/^Repeated/, 'Repeated'), 'good'); }
    else toast(r.message, r.skipped ? 'warn' : '');
    render();
  }
  function onUndo() {
    if (ui.rolling) return;
    var r = game.undoLastBet();
    if (r.success) { Sound.play('chip'); toast('Undid ' + name(r.betType) + ' — ' + money(r.refund) + ' back.'); }
    else toast('Nothing to undo since the last roll.', 'warn');
    render();
  }
  function onClear() {
    if (ui.rolling) return;
    var r = game.clearRemovableBets();
    if (r.refund > 0) { Sound.play('chip'); toast('Cleared ' + money(r.refund) + '. Bets in play stay up.'); }
    else toast(game.getTotalAtRisk() > 0 ? 'Those bets are in play and stay up.' : 'Nothing to clear.', 'warn');
    render();
  }
  function onBetsToggle() {
    if (ui.rolling) return;
    var st = toggleState();
    if (st === 'none') { toast('No Place, Buy, Lay, Big or Hardway bets to turn off.', 'warn'); return; }
    var on = st !== 'on'; // all on -> off; all off or mixed -> on
    game.setAllWorking(on);
    Sound.play('tick');
    toast(on ? 'Bets are ON.' : 'Bets are OFF — Place, Buy, Lay, Big and Hardways will not work.');
    render();
  }
  function onChip(e) {
    var v = parseInt(e.currentTarget.dataset.v, 10);
    ui.chip = v;
    try { localStorage.setItem(STORE.chip, String(v)); } catch (err) { /* ignore */ }
    Sound.play('chip');
    renderButtons();
  }

  // ===================================================================
  // Menu
  // ===================================================================
  function openMenu() {
    closePopover();
    renderMenu();
    renderDiag();
    $('menu').hidden = false;
    $('sheet-body').scrollTop = 0;
  }
  function closeMenu() { $('menu').hidden = true; healViewport(); }

  // One muted line at the bottom of the menu, for remote debugging from screenshots.
  function renderDiag() {
    var cs = getComputedStyle(document.documentElement);
    function px(n) { var v = parseFloat(cs.getPropertyValue(n)); return isNaN(v) ? '?' : String(Math.round(v)); }
    var vv = window.visualViewport;
    var dm = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var appH = cs.getPropertyValue('--app-h').trim();
    $('diag').textContent = 'v5 · win ' + window.innerWidth + '×' + window.innerHeight +
      ' · vv ' + (vv ? Math.round(vv.width) + '×' + Math.round(vv.height) + ' @' + Math.round(vv.offsetTop) : 'n/a') +
      ' · scr ' + screen.width + '×' + screen.height +
      ' · safe ' + px('--safe-top') + '/' + px('--safe-right') + '/' + px('--safe-bottom') + '/' + px('--safe-left') +
      ' · sy ' + Math.round(window.scrollY || 0) +
      ' · standalone ' + String(navigator.standalone) + '/' + (dm ? 'dm' : 'no-dm') +
      ' · h ' + (appH || '-');
  }

  function renderMenu() {
    var b = bets(), list = $('menu-bets');
    list.innerHTML = '';
    var any = false;
    Object.keys(b).forEach(function (t) {
      b[t].forEach(function (w) {
        any = true;
        var li = el('li');
        var nm = el('span');
        nm.textContent = name(t, w.point);
        if (!game.isWorking(t, w.point) || (t === 'come-odds' && game.getPhase() === 'come-out')) {
          var st = el('span', 'st', 'OFF'); nm.appendChild(st);
        }
        if (w.need) { var nd = el('span', 'muted'); nd.textContent = ' · needs ' + w.need.join(' '); nm.appendChild(nd); }
        var am = el('span');
        am.textContent = money(w.amount);
        li.appendChild(nm); li.appendChild(am);
        list.appendChild(li);
      });
    });
    if (!any) list.innerHTML = '<li class="empty">No bets on the table.</li>';
    $('menu-atrisk').textContent = any ? money(game.getTotalAtRisk()) : '';

    var rl = $('menu-rolls');
    rl.innerHTML = '';
    if (!ui.log.length) rl.innerHTML = '<li class="empty">No rolls yet.</li>';
    ui.log.slice(0, 100).forEach(function (r) {
      var li = el('li');
      var top = el('div', 'rl-top');
      top.innerHTML = '<span class="rl-n">#' + r.n + '</span>';
      var rc = el('span', 'rchip ' + rollKind(r.dice));
      rc.textContent = r.dice.sum;
      top.appendChild(rc);
      var out = el('span', 'rl-out');
      out.textContent = r.dice.die1 + ' + ' + r.dice.die2 + ' · ' + r.cap;
      top.appendChild(out);
      var net = el('span', 'rl-net' + (r.net > 0 ? ' pos' : r.net < 0 ? ' neg' : ''));
      net.textContent = r.net > 0 ? '+' + money(r.net) : r.net < 0 ? money(r.net) : '—';
      top.appendChild(net);
      li.appendChild(top);
      if (r.items.length) {
        var det = el('div', 'rl-det');
        r.items.forEach(function (it, i) {
          var sp = el('span', it.c);
          sp.textContent = it.t;
          det.appendChild(sp);
          if (i < r.items.length - 1) det.appendChild(document.createTextNode(' · '));
        });
        li.appendChild(det);
      }
      rl.appendChild(li);
    });

    var sb = $('btn-sound');
    sb.textContent = 'Sound: ' + (ui.sound ? 'On' : 'Off');
    sb.setAttribute('aria-pressed', ui.sound ? 'true' : 'false');
  }

  function toggleSound(e) {
    ui.sound = !ui.sound;
    try { localStorage.setItem(STORE.sound, ui.sound ? '1' : '0'); } catch (err) { /* ignore */ }
    Sound.unlock(e);
    Sound.play('tick');
    renderMenu();
  }

  // ===================================================================
  // Dialogs / new game
  // ===================================================================
  var dlgOk = null;
  function confirmDialog(title, text, okText, onOk) {
    $('dlg-title').textContent = title;
    $('dlg-text').textContent = text;
    $('dlg-ok').textContent = okText || 'OK';
    dlgOk = onOk;
    $('dialog').hidden = false;
    try { $('dlg-ok').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function closeDialog() { $('dialog').hidden = true; dlgOk = null; healViewport(); }

  function newGame() {
    closeMenu(); closePopover();
    ui.offers = [];
    if (ui.odds) { ui.odds = null; $('odds').hidden = true; }
    game.reset();
    ui.log = [];
    $('roll-strip').innerHTML = '';
    $('dice-total').textContent = '–';
    $('dice-caption').textContent = 'Place your bets';
    $('dice-caption').className = 'caption';
    dom.win.textContent = '—';
    dom.win.className = 'm-val';
    render();
    toast('New game — ' + money(game.getBalance()) + ' credit.', 'good');
  }

  // ===================================================================
  // Safe-area test override (?debug=1&safe=1)
  // ===================================================================
  function applySafeOverride() {
    // The iPhone insets per orientation live in styles.css under html.safe-test,
    // switched by an orientation media query, so they can never go stale.
    if (SAFE_TEST) document.documentElement.classList.add('safe-test');
  }

  // ===================================================================
  // Installed-iPhone shell height pin
  // ===================================================================
  // In an installed iPhone app (black-translucent status bar) WebKit can shrink
  // the layout viewport by the top inset while it still starts at the top of
  // the screen, so 100% / 100dvh / inset:0 end one inset short. Pin the shell
  // to the physical screen height instead. Everywhere else --app-h stays unset
  // and the CSS falls back to today's values.
  var PIN_SHELL = navigator.standalone === true && /iPhone/.test(navigator.userAgent || '');
  function pinShellHeight() {
    if (!PIN_SHELL) return;
    var landscape = landscapeMQ ? landscapeMQ.matches : window.innerWidth > window.innerHeight;
    // iOS reports screen.width/height in portrait terms and does not swap them on rotation
    var h = landscape ? Math.min(screen.width, screen.height) : Math.max(screen.width, screen.height);
    if (h > 0) document.documentElement.style.setProperty('--app-h', h + 'px');
  }
  // After an overlay closes: undo any scroll WebKit left behind and re-pin.
  function healViewport() {
    try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    pinShellHeight();
  }

  // ===================================================================
  // Boot
  // ===================================================================
  function init() {
    dom.credit = $('m-credit');
    dom.bet = $('m-bet');
    dom.win = $('m-win');
    dom.point = $('m-point');
    dom.fx = $('fx');
    dom.tray = $('tray');

    buildNumbers();
    buildProps();
    buildBonusPips();
    buildDice();
    buildPuck();
    applySafeOverride();
    pinShellHeight();

    var felt = $('felt');
    felt.addEventListener('pointerdown', onFeltDown);
    felt.addEventListener('click', onFeltClick);
    felt.addEventListener('contextmenu', onFeltContext);

    // sound unlock on any trusted gesture
    ['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { Sound.unlock(e); }, { capture: true, passive: true });
    });
    // no pinch / double-tap zoom, no stray scrolling outside the menu
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });
    document.addEventListener('touchmove', function (e) {
      if (e.cancelable && (!e.target.closest || !e.target.closest('.sheet-body'))) e.preventDefault();
    }, { passive: false });
    document.addEventListener('contextmenu', function (e) {
      if (!e.target.closest || !e.target.closest('.sheet-body')) e.preventDefault();
    });

    document.querySelectorAll('.tchip').forEach(function (t) { t.addEventListener('click', onChip); });
    $('btn-roll').addEventListener('click', doRoll);
    $('btn-repeat').addEventListener('click', onRepeat);
    $('btn-undo').addEventListener('click', onUndo);
    $('btn-clear').addEventListener('click', onClear);
    $('btn-bets').addEventListener('click', onBetsToggle);
    $('btn-menu').addEventListener('click', openMenu);
    $('menu-close').addEventListener('click', closeMenu);
    $('menu').addEventListener('click', function (e) { if (e.target === $('menu')) closeMenu(); });
    $('btn-sound').addEventListener('click', toggleSound);
    $('btn-newgame').addEventListener('click', function () {
      confirmDialog('New game?', 'This clears the table and resets your credit to ' + money(START_BANKROLL) + '.', 'New Game', newGame);
    });

    // popover backdrop: close only on a fresh press that starts on it
    $('pop-backdrop').addEventListener('pointerdown', function (e) { e.preventDefault(); closePopover(); });

    document.querySelectorAll('#odds .odds-opt').forEach(function (b) {
      b.addEventListener('click', function () { chooseOdds(parseInt(b.dataset.m, 10)); });
    });
    $('odds-keep').addEventListener('click', closeOdds);
    $('dlg-cancel').addEventListener('click', closeDialog);
    $('dlg-ok').addEventListener('click', function () { var f = dlgOk; closeDialog(); if (f) f(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (ui.pop) closePopover();
        else if (!$('dialog').hidden) closeDialog();
        else if (ui.odds) closeOdds();
        else if (!$('menu').hidden) closeMenu();
      }
    });

    function onViewportChange() {
      applySafeOverride();
      pinShellHeight();
      // the viewport may still be settling during the event; recompute next frame too
      requestAnimationFrame(function () {
        applySafeOverride(); pinShellHeight();
        requestAnimationFrame(function () { applySafeOverride(); pinShellHeight(); });
      });
      closePopover();
    }
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    if (landscapeMQ) {
      if (landscapeMQ.addEventListener) landscapeMQ.addEventListener('change', onViewportChange);
      else if (landscapeMQ.addListener) landscapeMQ.addListener(onViewportChange);
    }

    render();

    if (DEBUG) {
      window.__craps = {
        game: game,
        queueRolls: function (pairs) {
          (pairs || []).forEach(function (p) {
            var a = p[0] | 0, b = p[1] | 0;
            if (a < 1 || a > 6 || b < 1 || b > 6) throw new Error('Dice must be 1-6: ' + JSON.stringify(p));
            rollQueue.push((a - 0.5) / 6, (b - 0.5) / 6);
          });
          return rollQueue.length / 2;
        },
        render: render,
        roll: doRoll,
        isRolling: function () { return ui.rolling; },
        selectChip: function (v) { if (CHIPS.indexOf(v) !== -1) { ui.chip = v; renderButtons(); } },
      };
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
