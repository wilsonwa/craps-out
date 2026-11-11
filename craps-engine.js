/**
 * @file Browser bundle — concatenates all game modules in dependency order.
 * Exposes: CrapsConstants, CrapsValidators, CrapsDice, CrapsGameState, CrapsBets, CrapsGame
 * Loads as a plain <script> in the browser, or in Node via
 *   global.self = global; require('./craps-engine.js');
 */

// ============================================================
// utils/constants.js
// ============================================================
(function (root) {
  'use strict';

  var Phase = Object.freeze({
    COME_OUT: 'come-out',
    POINT: 'point',
  });

  var BetType = Object.freeze({
    PASS: 'pass',
    DONT_PASS: 'dont-pass',
    COME: 'come',
    DONT_COME: 'dont-come',
    FIELD: 'field',
    PLACE_4: 'place-4',
    PLACE_5: 'place-5',
    PLACE_6: 'place-6',
    PLACE_8: 'place-8',
    PLACE_9: 'place-9',
    PLACE_10: 'place-10',
    PASS_ODDS: 'pass-odds',
    DONT_PASS_ODDS: 'dont-pass-odds',
    COME_ODDS: 'come-odds',
    DONT_COME_ODDS: 'dont-come-odds',
    BIG_6: 'big-6',
    BIG_8: 'big-8',
    ANY_SEVEN: 'any-seven',
    ANY_CRAPS: 'any-craps',
    HARD_4: 'hard-4',
    HARD_6: 'hard-6',
    HARD_8: 'hard-8',
    HARD_10: 'hard-10',
    HORN_2: 'horn-2',
    HORN_3: 'horn-3',
    HORN_11: 'horn-11',
    HORN_12: 'horn-12',
    BUY_4: 'buy-4',
    BUY_5: 'buy-5',
    BUY_6: 'buy-6',
    BUY_8: 'buy-8',
    BUY_9: 'buy-9',
    BUY_10: 'buy-10',
    LAY_4: 'lay-4',
    LAY_5: 'lay-5',
    LAY_6: 'lay-6',
    LAY_8: 'lay-8',
    LAY_9: 'lay-9',
    LAY_10: 'lay-10',
    PUT: 'put',
    SMALL: 'small',
    TALL: 'tall',
    ALL: 'all',
  });

  var Outcome = Object.freeze({
    NATURAL: 'natural',
    CRAPS: 'craps',
    POINT_SET: 'point-set',
    POINT_HIT: 'point-hit',
    SEVEN_OUT: 'seven-out',
    NEUTRAL: 'neutral',
  });

  var GameEvent = Object.freeze({
    BET_PLACED: 'bet-placed',
    DICE_ROLLED: 'dice-rolled',
    BET_WON: 'bet-won',
    BET_LOST: 'bet-lost',
    PHASE_CHANGED: 'phase-changed',
    GAME_RESET: 'game-reset',
  });

  var PayoutTable = Object.freeze({
    'pass': [1, 1],
    'dont-pass': [1, 1],
    'come': [1, 1],
    'dont-come': [1, 1],
    'place-4': [9, 5],
    'place-5': [7, 5],
    'place-6': [7, 6],
    'place-8': [7, 6],
    'place-9': [7, 5],
    'place-10': [9, 5],
    'field': [1, 1],
    'field_2': [2, 1],
    'field_12': [3, 1],
    'odds_4': [2, 1],
    'odds_5': [3, 2],
    'odds_6': [6, 5],
    'odds_8': [6, 5],
    'odds_9': [3, 2],
    'odds_10': [2, 1],
    'dont_odds_4': [1, 2],
    'dont_odds_5': [2, 3],
    'dont_odds_6': [5, 6],
    'dont_odds_8': [5, 6],
    'dont_odds_9': [2, 3],
    'dont_odds_10': [1, 2],
    'big-6': [1, 1],
    'big-8': [1, 1],
    'any-seven': [4, 1],
    'any-craps': [7, 1],
    'hard-4': [7, 1],
    'hard-6': [9, 1],
    'hard-8': [9, 1],
    'hard-10': [7, 1],
    'horn-2': [30, 1],
    'horn-3': [15, 1],
    'horn-11': [15, 1],
    'horn-12': [30, 1],
    'buy-4': [2, 1],
    'buy-5': [3, 2],
    'buy-6': [6, 5],
    'buy-8': [6, 5],
    'buy-9': [3, 2],
    'buy-10': [2, 1],
    'lay-4': [1, 2],
    'lay-5': [2, 3],
    'lay-6': [5, 6],
    'lay-8': [5, 6],
    'lay-9': [2, 3],
    'lay-10': [1, 2],
    'put': [1, 1],
    'small': [30, 1],
    'tall': [30, 1],
    'all': [150, 1],
  });

  var NATURALS = Object.freeze([7, 11]);
  var CRAPS_NUMBERS = Object.freeze([2, 3, 12]);
  var POINT_NUMBERS = Object.freeze([4, 5, 6, 8, 9, 10]);
  var FIELD_NUMBERS = Object.freeze([2, 3, 4, 9, 10, 11, 12]);
  var SMALL_NUMBERS = Object.freeze([2, 3, 4, 5, 6]);
  var TALL_NUMBERS = Object.freeze([8, 9, 10, 11, 12]);
  var ALL_NUMBERS = Object.freeze([2, 3, 4, 5, 6, 8, 9, 10, 11, 12]);
  var MIN_BET = 1;
  var BUY_NUMBERS = Object.freeze({
    'buy-4': 4,
    'buy-5': 5,
    'buy-6': 6,
    'buy-8': 8,
    'buy-9': 9,
    'buy-10': 10,
  });
  // Vig on buy/lay bets: charged only when the bet wins, deducted from the
  // winnings. Buy: 5% of the bet amount. Lay: 5% of the winnings.
  var VIG_RATE = 0.05;
  var LAY_NUMBERS = Object.freeze({
    'lay-4': 4,
    'lay-5': 5,
    'lay-6': 6,
    'lay-8': 8,
    'lay-9': 9,
    'lay-10': 10,
  });

  root.CrapsConstants = {
    Phase: Phase,
    BetType: BetType,
    Outcome: Outcome,
    GameEvent: GameEvent,
    PayoutTable: PayoutTable,
    NATURALS: NATURALS,
    CRAPS_NUMBERS: CRAPS_NUMBERS,
    POINT_NUMBERS: POINT_NUMBERS,
    FIELD_NUMBERS: FIELD_NUMBERS,
    SMALL_NUMBERS: SMALL_NUMBERS,
    TALL_NUMBERS: TALL_NUMBERS,
    ALL_NUMBERS: ALL_NUMBERS,
    MIN_BET: MIN_BET,
    BUY_NUMBERS: BUY_NUMBERS,
    LAY_NUMBERS: LAY_NUMBERS,
    VIG_RATE: VIG_RATE,
    createSeededRandom: function(initialSeed) { return root.createSeededRandom(initialSeed); },
    hashSeed: function(seed) { return root.hashSeed(seed); },
  };
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// utils/validators.js
// ============================================================
(function (root) {
  'use strict';

  var BetType = root.CrapsConstants.BetType;
  var MIN_BET = root.CrapsConstants.MIN_BET;
  var Phase = root.CrapsConstants.Phase;

  var VALID_BET_TYPES = new Set(Object.values(BetType));

  function validateBetType(betType) {
    if (typeof betType !== 'string') {
      return { valid: false, message: 'Bet type must be a string.' };
    }
    if (!VALID_BET_TYPES.has(betType)) {
      return {
        valid: false,
        message: 'Invalid bet type "' + betType + '". Valid types: ' + Array.from(VALID_BET_TYPES).join(', ') + '.',
      };
    }
    return { valid: true };
  }

  /** Bets are whole dollars, at least MIN_BET, and no more than the balance. */
  function validateBetAmount(amount, balance) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      return { valid: false, message: 'Bet amount must be a finite number.' };
    }
    if (!Number.isInteger(amount)) {
      return { valid: false, message: 'Bets must be whole dollar amounts.' };
    }
    if (amount < MIN_BET) {
      return { valid: false, message: 'Minimum bet is $' + MIN_BET + '.' };
    }
    if (amount > balance) {
      return { valid: false, message: 'Insufficient balance. Current balance: $' + balance.toFixed(2) + '.' };
    }
    return { valid: true };
  }

  function hasPointed(arr) {
    return !!arr && arr.some(function (b) { return b.point !== null && b.point !== undefined; });
  }

  /**
   * Timing / eligibility rules (no amount or odds-limit checks).
   * @param {string} betType
   * @param {string} phase
   * @param {?number} point
   * @param {Object} activeBets  result of BetManager.getAll()
   * @param {number} [rollsSinceSeven=0]
   */
  function validateBetTiming(betType, phase, point, activeBets, rollsSinceSeven) {
    activeBets = activeBets || {};
    switch (betType) {
      case BetType.PASS:
      case BetType.DONT_PASS:
        if (phase !== Phase.COME_OUT) {
          return { valid: false, message: betType + ' bets can only be placed on the come-out roll.' };
        }
        break;
      case BetType.COME:
      case BetType.DONT_COME:
        if (phase !== Phase.POINT) {
          return { valid: false, message: betType + ' bets can only be placed once a point is established.' };
        }
        break;
      case BetType.PASS_ODDS:
        if (phase !== Phase.POINT) {
          return { valid: false, message: 'Pass odds require a point to be established.' };
        }
        if (!activeBets[BetType.PASS]) {
          return { valid: false, message: 'You must have a pass bet to take pass odds.' };
        }
        break;
      case BetType.DONT_PASS_ODDS:
        if (phase !== Phase.POINT) {
          return { valid: false, message: "Don't pass odds require a point to be established." };
        }
        if (!activeBets[BetType.DONT_PASS]) {
          return { valid: false, message: "You must have a don't pass bet to lay don't pass odds." };
        }
        break;
      case BetType.COME_ODDS:
        if (!hasPointed(activeBets[BetType.COME])) {
          return { valid: false, message: 'You must have a come bet on a number to take come odds.' };
        }
        break;
      case BetType.DONT_COME_ODDS:
        if (!hasPointed(activeBets[BetType.DONT_COME])) {
          return { valid: false, message: "You must have a don't come bet on a number to lay don't come odds." };
        }
        break;
      case BetType.PUT:
        if (phase !== Phase.POINT) {
          return { valid: false, message: 'Put bets can only be made once a point is established.' };
        }
        break;
      case BetType.SMALL:
      case BetType.TALL:
      case BetType.ALL:
        if (phase !== Phase.COME_OUT || (rollsSinceSeven || 0) !== 0) {
          return { valid: false, message: 'Small/Tall/All can only be placed on a come-out roll before any number has been rolled since the last 7.' };
        }
        break;
      default:
        // place / buy / lay / big / hardways / field / one-roll props: any time
        break;
    }
    return { valid: true };
  }

  root.CrapsValidators = {
    validateBetType: validateBetType,
    validateBetAmount: validateBetAmount,
    validateBetTiming: validateBetTiming,
  };
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// utils/seeded-random.js
// ============================================================
(function (root) {
  'use strict';

  /**
   * Simple hash function for seeded randomness
   * Based on MurmurHash3's 32-bit finalizer
   * @param {number} seed - Integer seed
   * @returns {number} - Random value [0, 1)
   */
  function hashSeed(seed) {
    seed = seed | 0; // Ensure 32-bit integer
    seed = Math.imul(seed ^ (seed >>> 16), 0x85ebca6b);
    seed = Math.imul(seed ^ (seed >>> 13), 0xc2b2ae35);
    seed = seed ^ (seed >>> 16);
    return (seed >>> 0) / 4294967296; // [0, 1)
  }

  /**
   * Creates a seeded random function with incremental seeds
   * @param {number} initialSeed - Starting seed value
   * @returns {function(): number} - Random function returning [0, 1)
   */
  function createSeededRandom(initialSeed) {
    var rollCount = 0;
    return function() {
      var currentSeed = initialSeed + (rollCount * 10);
      rollCount++;
      return hashSeed(currentSeed);
    };
  }

  root.hashSeed = hashSeed;
  root.createSeededRandom = createSeededRandom;
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// game/Dice.js
// ============================================================
(function (root) {
  'use strict';

  function Dice(options) {
    options = options || {};
    this._randomFn = options.randomFn || Math.random;
    this._lastRoll = null;
  }

  Dice.prototype.roll = function () {
    var die1 = Math.floor(this._randomFn() * 6) + 1;
    var die2 = Math.floor(this._randomFn() * 6) + 1;
    this._lastRoll = { die1: die1, die2: die2, sum: die1 + die2 };
    return { die1: die1, die2: die2, sum: die1 + die2 };
  };

  Dice.prototype.getLastRoll = function () {
    if (!this._lastRoll) return null;
    return { die1: this._lastRoll.die1, die2: this._lastRoll.die2, sum: this._lastRoll.sum };
  };

  root.CrapsDice = Dice;
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// game/GameState.js
// ============================================================
(function (root) {
  'use strict';

  var Phase = root.CrapsConstants.Phase;

  function round2(x) { return Math.round(x * 100) / 100; }

  var HISTORY_LIMIT = 200;

  function GameState(init) {
    init = init || {};
    this.phase = init.phase || Phase.COME_OUT;
    this.point = init.point !== undefined ? init.point : null;
    this.balance = round2(init.balance !== undefined ? init.balance : 1000);
    this.totalRolls = init.totalRolls || 0;
    this.rollsSinceSeven = init.rollsSinceSeven || 0;
    this.winsCount = init.winsCount || 0;
    this.lossesCount = init.lossesCount || 0;
    this.totalWagered = round2(init.totalWagered || 0);
    this.totalWon = round2(init.totalWon || 0);
    this.totalLost = round2(init.totalLost || 0);
    this.history = init.history || [];
    Object.freeze(this);
  }

  GameState.prototype.update = function (updates) {
    var merged = {};
    var self = this;
    Object.keys(self).forEach(function (k) { merged[k] = self[k]; });
    Object.keys(updates).forEach(function (k) { merged[k] = updates[k]; });
    return new GameState(merged);
  };

  GameState.prototype.addHistory = function (record) {
    record.timestamp = Date.now();
    // Keep only the most recent HISTORY_LIMIT rolls (bounded memory and copy cost).
    var kept = this.history.length >= HISTORY_LIMIT
      ? this.history.slice(this.history.length - HISTORY_LIMIT + 1)
      : this.history;
    return this.update({ history: kept.concat([Object.freeze(record)]) });
  };

  GameState.HISTORY_LIMIT = HISTORY_LIMIT;

  GameState.prototype.toJSON = function () {
    return {
      phase: this.phase, point: this.point, balance: this.balance,
      totalRolls: this.totalRolls, rollsSinceSeven: this.rollsSinceSeven,
      winsCount: this.winsCount, lossesCount: this.lossesCount,
      totalWagered: this.totalWagered, totalWon: this.totalWon, totalLost: this.totalLost,
      history: this.history,
    };
  };

  root.CrapsGameState = GameState;
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// game/Bets.js
// ============================================================
(function (root) {
  'use strict';

  var C = root.CrapsConstants;
  var BetType = C.BetType;
  var Phase = C.Phase;
  var PayoutTable = C.PayoutTable;
  var NATURALS = C.NATURALS;
  var CRAPS_NUMBERS = C.CRAPS_NUMBERS;
  var FIELD_NUMBERS = C.FIELD_NUMBERS;
  var SMALL_NUMBERS = C.SMALL_NUMBERS;
  var TALL_NUMBERS = C.TALL_NUMBERS;
  var ALL_NUMBERS = C.ALL_NUMBERS;
  var VIG_RATE = C.VIG_RATE;

  function round2(x) { return Math.round(x * 100) / 100; }

  /** Winnings (not including stake), floored to the cent. Amounts are whole dollars. */
  function profitCents(amount, ratio) {
    return Math.floor((Math.round(amount * 100) * ratio[0]) / ratio[1]);
  }
  function calcProfit(amount, ratio) { return profitCents(amount, ratio) / 100; }

  /** 5% of a cent amount, floored to the cent. */
  function vigCents(cents) { return Math.floor(cents * VIG_RATE + 1e-9); }

  function oddsKey(point) { return 'odds_' + point; }
  function dontOddsKey(point) { return 'dont_odds_' + point; }

  var PLACE_NUMS = { 'place-4': 4, 'place-5': 5, 'place-6': 6, 'place-8': 8, 'place-9': 9, 'place-10': 10 };
  var BUY_NUMS = C.BUY_NUMBERS;
  var LAY_NUMS = C.LAY_NUMBERS;
  var HARD_NUMS = { 'hard-4': 4, 'hard-6': 6, 'hard-8': 8, 'hard-10': 10 };
  var HORN_NUMS = { 'horn-2': 2, 'horn-3': 3, 'horn-11': 11, 'horn-12': 12 };

  /** Bet types whose working state the player can toggle. */
  var TOGGLEABLE = {};
  [PLACE_NUMS, BUY_NUMS, LAY_NUMS, HARD_NUMS].forEach(function (m) {
    Object.keys(m).forEach(function (k) { TOGGLEABLE[k] = true; });
  });
  TOGGLEABLE[BetType.BIG_6] = true;
  TOGGLEABLE[BetType.BIG_8] = true;

  function pushWin(wins, betType, b, profit, commission, stays) {
    var rec = {
      betType: betType,
      amount: b.amount,
      profit: profit,
      commission: commission || 0,
      payout: stays ? profit : round2(b.amount + profit),
      stays: !!stays,
    };
    if (b.point !== null && b.point !== undefined) rec.point = b.point;
    wins.push(rec);
  }

  function pushLoss(losses, betType, b) {
    var rec = { betType: betType, amount: b.amount };
    if (b.point !== null && b.point !== undefined) rec.point = b.point;
    losses.push(rec);
  }

  function pushPush(pushes, betType, b, returned) {
    var rec = { betType: betType, amount: b.amount, returned: !!returned };
    if (b.point !== null && b.point !== undefined) rec.point = b.point;
    pushes.push(rec);
  }

  /**
   * Wager record: { amount, point, working, fresh, need? }
   *   working — player toggle (toggleable types only)
   *   fresh   — placed since the last roll (used by undo and bonus-bet locks)
   */
  function BetManager() {
    this._bets = new Map();
  }

  BetManager.TOGGLEABLE = TOGGLEABLE;

  BetManager.prototype.place = function (betType, amount, point) {
    if (point === undefined) point = null;
    if (!this._bets.has(betType)) this._bets.set(betType, []);
    var arr = this._bets.get(betType);
    // A new wager joins the type's current on/off state so the type stays uniform.
    var working = arr.length ? arr[0].working !== false : true;
    var wager = { amount: amount, point: point, working: working, fresh: true };
    if (betType === BetType.SMALL) wager.need = SMALL_NUMBERS.slice();
    if (betType === BetType.TALL) wager.need = TALL_NUMBERS.slice();
    if (betType === BetType.ALL) wager.need = ALL_NUMBERS.slice();
    arr.push(wager);
  };

  BetManager.prototype.getAll = function () {
    var out = {};
    this._bets.forEach(function (bets, type) {
      if (bets.length > 0) out[type] = bets.map(function (b) {
        var copy = { amount: b.amount, point: b.point, working: b.working !== false };
        if (b.need) copy.need = b.need.slice();
        return copy;
      });
    });
    return out;
  };

  /** Raw wager list (internal use by CrapsGame). */
  BetManager.prototype.list = function (betType) {
    return this._bets.get(betType) || [];
  };

  BetManager.prototype.types = function () {
    return Array.from(this._bets.keys());
  };

  BetManager.prototype.totalActive = function () {
    var cents = 0;
    this._bets.forEach(function (bets) {
      bets.forEach(function (b) { cents += Math.round(b.amount * 100); });
    });
    return cents / 100;
  };

  BetManager.prototype.clearType = function (betType) { this._bets.delete(betType); };
  BetManager.prototype.clearAll = function () { this._bets.clear(); };

  BetManager.prototype.has = function (betType) {
    var b = this._bets.get(betType);
    return !!b && b.length > 0;
  };

  /** Remove the most recent FRESH wager matching type/amount/point. Returns it or null. */
  BetManager.prototype.removeLastFresh = function (betType, amount, point) {
    var arr = this._bets.get(betType);
    if (!arr || !arr.length) return null;
    for (var i = arr.length - 1; i >= 0; i--) {
      var b = arr[i];
      var samePoint = (b.point == null) ? point == null : b.point === point;
      if (b.fresh && b.amount === amount && samePoint) {
        var removed = arr.splice(i, 1)[0];
        if (!arr.length) this._bets.delete(betType);
        return removed;
      }
    }
    return null;
  };

  /** Remove every wager for which fn(type, bet) is true. Returns refunded dollars. */
  BetManager.prototype.removeWhere = function (fn) {
    var cents = 0;
    var self = this;
    this.types().forEach(function (type) {
      var arr = self._bets.get(type);
      var keep = [];
      arr.forEach(function (b) {
        if (fn(type, b)) cents += Math.round(b.amount * 100);
        else keep.push(b);
      });
      if (keep.length) self._bets.set(type, keep);
      else self._bets.delete(type);
    });
    return cents / 100;
  };

  /** Set working state on every wager of a type. Returns true if anything changed, null if no bet. */
  BetManager.prototype.setWorking = function (betType, on) {
    var arr = this._bets.get(betType);
    if (!arr || !arr.length) return null;
    var changed = false;
    arr.forEach(function (b) {
      if ((b.working !== false) !== on) changed = true;
      b.working = on;
    });
    return changed;
  };

  BetManager.prototype.isOn = function (betType) {
    var arr = this._bets.get(betType);
    if (!arr || !arr.length) return true;
    return arr.some(function (b) { return b.working !== false; });
  };

  BetManager.prototype.markRolled = function () {
    this._bets.forEach(function (bets) { bets.forEach(function (b) { b.fresh = false; }); });
  };

  /**
   * Iterate wagers of a type; fn(bet) returns true to keep the wager on the table.
   */
  BetManager.prototype._each = function (betType, fn) {
    var arr = this._bets.get(betType);
    if (!arr || !arr.length) return;
    var keep = [];
    arr.forEach(function (b) { if (fn(b)) keep.push(b); });
    if (keep.length) this._bets.set(betType, keep);
    else this._bets.delete(betType);
  };

  /**
   * Resolve every bet against a roll.
   * @param {{die1:number,die2:number,sum:number}} dice
   * @param {string} phase   phase BEFORE the roll
   * @param {?number} point  point BEFORE the roll
   */
  BetManager.prototype.resolve = function (dice, phase, point) {
    var sum = dice.sum;
    var isHard = dice.die1 === dice.die2;
    var comeOut = phase === Phase.COME_OUT;
    var isNatural = NATURALS.indexOf(sum) !== -1;
    var isCraps = CRAPS_NUMBERS.indexOf(sum) !== -1;
    var wins = [], losses = [], pushes = [];
    var self = this;

    // ---- Pass line (rides after a win) ----
    this._each(BetType.PASS, function (b) {
      if (comeOut) {
        if (isNatural) { pushWin(wins, BetType.PASS, b, calcProfit(b.amount, PayoutTable.pass), 0, true); return true; }
        if (isCraps) { pushLoss(losses, BetType.PASS, b); return false; }
        return true;
      }
      if (sum === point) { pushWin(wins, BetType.PASS, b, calcProfit(b.amount, PayoutTable.pass), 0, true); return true; }
      if (sum === 7) { pushLoss(losses, BetType.PASS, b); return false; }
      return true;
    });

    // ---- Don't pass (rides after a win, bar 12) ----
    this._each(BetType.DONT_PASS, function (b) {
      if (comeOut) {
        if (sum === 2 || sum === 3) { pushWin(wins, BetType.DONT_PASS, b, calcProfit(b.amount, PayoutTable['dont-pass']), 0, true); return true; }
        if (sum === 12) { pushPush(pushes, BetType.DONT_PASS, b, false); return true; }
        if (isNatural) { pushLoss(losses, BetType.DONT_PASS, b); return false; }
        return true;
      }
      if (sum === 7) { pushWin(wins, BetType.DONT_PASS, b, calcProfit(b.amount, PayoutTable['dont-pass']), 0, true); return true; }
      if (sum === point) { pushLoss(losses, BetType.DONT_PASS, b); return false; }
      return true;
    });

    // ---- Pass odds / don't pass odds (come down when resolved) ----
    if (!comeOut && point !== null) {
      this._each(BetType.PASS_ODDS, function (b) {
        if (sum === point) { pushWin(wins, BetType.PASS_ODDS, b, calcProfit(b.amount, PayoutTable[oddsKey(point)]), 0, false); return false; }
        if (sum === 7) { pushLoss(losses, BetType.PASS_ODDS, b); return false; }
        return true;
      });
      this._each(BetType.DONT_PASS_ODDS, function (b) {
        if (sum === 7) { pushWin(wins, BetType.DONT_PASS_ODDS, b, calcProfit(b.amount, PayoutTable[dontOddsKey(point)]), 0, false); return false; }
        if (sum === point) { pushLoss(losses, BetType.DONT_PASS_ODDS, b); return false; }
        return true;
      });
    }

    // ---- Come (always working) ----
    this._each(BetType.COME, function (b) {
      if (b.point === null) {
        if (isNatural) { pushWin(wins, BetType.COME, b, calcProfit(b.amount, PayoutTable.come), 0, false); return false; }
        if (isCraps) { pushLoss(losses, BetType.COME, b); return false; }
        b.point = sum; // travels
        return true;
      }
      if (sum === b.point) { pushWin(wins, BetType.COME, b, calcProfit(b.amount, PayoutTable.come), 0, false); return false; }
      if (sum === 7) { pushLoss(losses, BetType.COME, b); return false; }
      return true;
    });

    // ---- Don't come ----
    this._each(BetType.DONT_COME, function (b) {
      if (b.point === null) {
        if (isNatural) { pushLoss(losses, BetType.DONT_COME, b); return false; }
        if (sum === 12) { pushPush(pushes, BetType.DONT_COME, b, false); return true; }
        if (isCraps) { pushWin(wins, BetType.DONT_COME, b, calcProfit(b.amount, PayoutTable['dont-come']), 0, false); return false; }
        b.point = sum;
        return true;
      }
      if (sum === 7) { pushWin(wins, BetType.DONT_COME, b, calcProfit(b.amount, PayoutTable['dont-come']), 0, false); return false; }
      if (sum === b.point) { pushLoss(losses, BetType.DONT_COME, b); return false; }
      return true;
    });

    // ---- Come odds (off on come-out: returned if the come bet resolves) ----
    this._each(BetType.COME_ODDS, function (b) {
      if (b.point === null) return true;
      if (comeOut) {
        if (sum === 7 || sum === b.point) { pushPush(pushes, BetType.COME_ODDS, b, true); return false; }
        return true;
      }
      if (sum === b.point) { pushWin(wins, BetType.COME_ODDS, b, calcProfit(b.amount, PayoutTable[oddsKey(b.point)]), 0, false); return false; }
      if (sum === 7) { pushLoss(losses, BetType.COME_ODDS, b); return false; }
      return true;
    });

    // ---- Don't come odds (always working) ----
    this._each(BetType.DONT_COME_ODDS, function (b) {
      if (b.point === null) return true;
      if (sum === 7) { pushWin(wins, BetType.DONT_COME_ODDS, b, calcProfit(b.amount, PayoutTable[dontOddsKey(b.point)]), 0, false); return false; }
      if (sum === b.point) { pushLoss(losses, BetType.DONT_COME_ODDS, b); return false; }
      return true;
    });

    // ---- Place (off on come-out; a win pays the winnings and the bet stays up) ----
    Object.keys(PLACE_NUMS).forEach(function (bt) {
      var n = PLACE_NUMS[bt];
      self._each(bt, function (b) {
        if (comeOut || b.working === false) return true;
        if (sum === n) { pushWin(wins, bt, b, calcProfit(b.amount, PayoutTable[bt]), 0, true); return true; }
        if (sum === 7) { pushLoss(losses, bt, b); return false; }
        return true;
      });
    });

    // ---- Buy (off on come-out; 5% of the bet charged on a win; stays) ----
    Object.keys(BUY_NUMS).forEach(function (bt) {
      var n = BUY_NUMS[bt];
      self._each(bt, function (b) {
        if (comeOut || b.working === false) return true;
        if (sum === n) {
          var gross = profitCents(b.amount, PayoutTable[bt]);
          var vig = vigCents(Math.round(b.amount * 100));
          pushWin(wins, bt, b, (gross - vig) / 100, vig / 100, true);
          return true;
        }
        if (sum === 7) { pushLoss(losses, bt, b); return false; }
        return true;
      });
    });

    // ---- Lay (always working; 5% of the win charged on a win; stays) ----
    Object.keys(LAY_NUMS).forEach(function (bt) {
      var n = LAY_NUMS[bt];
      self._each(bt, function (b) {
        if (b.working === false) return true;
        if (sum === 7) {
          var gross = profitCents(b.amount, PayoutTable[bt]);
          var vig = vigCents(gross);
          pushWin(wins, bt, b, (gross - vig) / 100, vig / 100, true);
          return true;
        }
        if (sum === n) { pushLoss(losses, bt, b); return false; }
        return true;
      });
    });

    // ---- Big 6 / Big 8 (always working; stay) ----
    [[BetType.BIG_6, 6], [BetType.BIG_8, 8]].forEach(function (pair) {
      var bt = pair[0], n = pair[1];
      self._each(bt, function (b) {
        if (b.working === false) return true;
        if (sum === n) { pushWin(wins, bt, b, calcProfit(b.amount, PayoutTable[bt]), 0, true); return true; }
        if (sum === 7) { pushLoss(losses, bt, b); return false; }
        return true;
      });
    });

    // ---- Hardways (always working; stay) ----
    Object.keys(HARD_NUMS).forEach(function (bt) {
      var n = HARD_NUMS[bt];
      self._each(bt, function (b) {
        if (b.working === false) return true;
        if (sum === n && isHard) { pushWin(wins, bt, b, calcProfit(b.amount, PayoutTable[bt]), 0, true); return true; }
        if (sum === n || sum === 7) { pushLoss(losses, bt, b); return false; }
        return true;
      });
    });

    // ---- One-roll bets ----
    this._each(BetType.FIELD, function (b) {
      if (FIELD_NUMBERS.indexOf(sum) !== -1) {
        var key = sum === 2 ? 'field_2' : (sum === 12 ? 'field_12' : 'field');
        pushWin(wins, BetType.FIELD, b, calcProfit(b.amount, PayoutTable[key]), 0, false);
      } else {
        pushLoss(losses, BetType.FIELD, b);
      }
      return false;
    });
    this._each(BetType.ANY_SEVEN, function (b) {
      if (sum === 7) pushWin(wins, BetType.ANY_SEVEN, b, calcProfit(b.amount, PayoutTable['any-seven']), 0, false);
      else pushLoss(losses, BetType.ANY_SEVEN, b);
      return false;
    });
    this._each(BetType.ANY_CRAPS, function (b) {
      if (isCraps) pushWin(wins, BetType.ANY_CRAPS, b, calcProfit(b.amount, PayoutTable['any-craps']), 0, false);
      else pushLoss(losses, BetType.ANY_CRAPS, b);
      return false;
    });
    Object.keys(HORN_NUMS).forEach(function (bt) {
      var n = HORN_NUMS[bt];
      self._each(bt, function (b) {
        if (sum === n) pushWin(wins, bt, b, calcProfit(b.amount, PayoutTable[bt]), 0, false);
        else pushLoss(losses, bt, b);
        return false;
      });
    });

    // ---- Put (unchanged behaviour: resolves like a pass bet on the point, comes down) ----
    if (!comeOut && point !== null) {
      this._each(BetType.PUT, function (b) {
        if (sum === point) { pushWin(wins, BetType.PUT, b, calcProfit(b.amount, PayoutTable.put), 0, false); return false; }
        if (sum === 7) { pushLoss(losses, BetType.PUT, b); return false; }
        return true;
      });
    }

    // ---- Small / Tall / All ----
    [[BetType.SMALL, SMALL_NUMBERS], [BetType.TALL, TALL_NUMBERS], [BetType.ALL, ALL_NUMBERS]].forEach(function (pair) {
      var bt = pair[0], targets = pair[1];
      self._each(bt, function (b) {
        if (!b.need) b.need = targets.slice();
        if (sum === 7) { pushLoss(losses, bt, b); return false; }
        var idx = b.need.indexOf(sum);
        if (idx !== -1) b.need.splice(idx, 1);
        if (b.need.length === 0) { pushWin(wins, bt, b, calcProfit(b.amount, PayoutTable[bt]), 0, false); return false; }
        return true;
      });
    });

    return { wins: wins, losses: losses, pushes: pushes };
  };

  BetManager.calcProfit = calcProfit;
  root.CrapsBets = BetManager;
})(typeof self !== 'undefined' ? self : this);

// ============================================================
// game/CrapsGame.js
// ============================================================
(function (root) {
  'use strict';

  var Dice = root.CrapsDice;
  var GameState = root.CrapsGameState;
  var BetManager = root.CrapsBets;
  var C = root.CrapsConstants;
  var V = root.CrapsValidators;

  var Phase = C.Phase;
  var Outcome = C.Outcome;
  var GameEvent = C.GameEvent;
  var NATURALS = C.NATURALS;
  var CRAPS_NUMBERS = C.CRAPS_NUMBERS;
  var BetType = C.BetType;
  var PayoutTable = C.PayoutTable;
  var MIN_BET = C.MIN_BET;
  var TOGGLEABLE = BetManager.TOGGLEABLE;

  var ODDS_TYPES = {
    'pass-odds': true, 'dont-pass-odds': true, 'come-odds': true, 'dont-come-odds': true,
  };
  var POINTED_TYPES = {
    'come': true, 'dont-come': true, 'come-odds': true, 'dont-come-odds': true,
  };

  function round2(x) { return Math.round(x * 100) / 100; }
  function sumAmounts(arr) {
    var cents = 0;
    arr.forEach(function (b) { cents += Math.round(b.amount * 100); });
    return cents / 100;
  }
  function samePoint(a, b) { return (a == null) ? b == null : a === b; }
  function fmt(x) { return '$' + (Math.round(x * 100) % 100 === 0 ? String(Math.round(x)) : x.toFixed(2)); }

  /**
   * Core craps game engine.
   * @param {number} [initialBalance=1000]
   * @param {Object} [options]
   * @param {function(): number} [options.randomFn]
   * @param {number} [options.maxOddsMultiple=2]
   */
  function CrapsGame(initialBalance, options) {
    if (initialBalance === undefined) initialBalance = 1000;
    options = options || {};
    if (typeof initialBalance !== 'number' || !Number.isFinite(initialBalance) || initialBalance < 0) {
      throw new Error('Initial balance must be a non-negative number.');
    }
    this._initialBalance = round2(initialBalance);
    this._options = {
      maxOddsMultiple: (typeof options.maxOddsMultiple === 'number' && options.maxOddsMultiple >= 0) ? options.maxOddsMultiple : 2,
    };
    this._dice = new Dice({ randomFn: options.randomFn });
    this._bets = new BetManager();
    this._state = new GameState({ balance: this._initialBalance });
    this._listeners = new Map();
    this._betLog = [];        // placements since the last roll, for undo
    this._lastRoundBets = []; // everything riding into the last roll that had bets, for repeat
  }

  CrapsGame.prototype._addBalance = function (delta) {
    var b = round2(this._state.balance + delta);
    if (b < 0) b = 0; // cannot happen with validated play; guard anyway
    this._state = this._state.update({ balance: b });
  };

  // ------------------------------------------------------------------
  // Odds limits
  // ------------------------------------------------------------------

  /** Points that currently carry a come / don't come flat bet. */
  CrapsGame.prototype._comePoints = function (sourceType) {
    var pts = [];
    this._bets.list(sourceType).forEach(function (b) {
      if (b.point !== null && pts.indexOf(b.point) === -1) pts.push(b.point);
    });
    return pts;
  };

  /**
   * Odds info for any odds type. Returns null when odds cannot be taken.
   * Dont versions: `max` is the largest total lay whose win ≤ multiple × flat.
   */
  CrapsGame.prototype._oddsInfo = function (betType, point) {
    var M = this._options.maxOddsMultiple;
    var flat, current, ratio, oddsPoint;
    var bets = this._bets;
    if (betType === BetType.PASS_ODDS || betType === BetType.DONT_PASS_ODDS) {
      var src = betType === BetType.PASS_ODDS ? BetType.PASS : BetType.DONT_PASS;
      if (this._state.phase !== Phase.POINT || !bets.has(src)) return null;
      oddsPoint = this._state.point;
      flat = sumAmounts(bets.list(src));
      current = sumAmounts(bets.list(betType));
    } else if (betType === BetType.COME_ODDS || betType === BetType.DONT_COME_ODDS) {
      var srcC = betType === BetType.COME_ODDS ? BetType.COME : BetType.DONT_COME;
      var pts = this._comePoints(srcC);
      if (point == null) {
        if (pts.length !== 1) return null;
        point = pts[0];
      }
      if (pts.indexOf(point) === -1) return null;
      oddsPoint = point;
      flat = sumAmounts(bets.list(srcC).filter(function (b) { return b.point === point; }));
      current = sumAmounts(bets.list(betType).filter(function (b) { return b.point === point; }));
    } else {
      return null;
    }
    var isDont = betType === BetType.DONT_PASS_ODDS || betType === BetType.DONT_COME_ODDS;
    ratio = PayoutTable[(isDont ? 'dont_odds_' : 'odds_') + oddsPoint];
    var max = isDont
      ? Math.floor((M * flat * ratio[1]) / ratio[0] + 1e-9)
      : Math.floor(M * flat + 1e-9);
    return {
      point: oddsPoint,
      flat: flat,
      current: current,
      max: max,
      remaining: Math.max(0, round2(max - current)),
      ratio: [ratio[0], ratio[1]],
    };
  };

  /** Public: odds info for pass-odds / come-odds (and the dont versions). */
  CrapsGame.prototype.getOddsInfo = function (betType, point) {
    var info = this._oddsInfo(betType, point);
    if (!info) return null;
    return { flat: info.flat, current: info.current, max: info.max, remaining: info.remaining, ratio: info.ratio };
  };

  // ------------------------------------------------------------------
  // Placement
  // ------------------------------------------------------------------

  /**
   * Eligibility without an amount. Returns { valid, message, point }.
   * `requirePoint` makes come-odds demand a resolvable point (placement path).
   */
  CrapsGame.prototype._eligibility = function (betType, options, requirePoint) {
    options = options || {};
    var typeCheck = V.validateBetType(betType);
    if (!typeCheck.valid) return { valid: false, message: typeCheck.message };

    var timing = V.validateBetTiming(betType, this._state.phase, this._state.point,
      this._bets.getAll(), this._state.rollsSinceSeven);
    if (!timing.valid) return { valid: false, message: timing.message };

    var betPoint = null;
    if (betType === BetType.COME_ODDS || betType === BetType.DONT_COME_ODDS) {
      var src = betType === BetType.COME_ODDS ? BetType.COME : BetType.DONT_COME;
      var pts = this._comePoints(src);
      if (options.point != null) {
        if (pts.indexOf(options.point) === -1) {
          return { valid: false, message: 'No ' + src + ' bet on ' + options.point + '.' };
        }
        betPoint = options.point;
      } else if (pts.length === 1) {
        betPoint = pts[0];
      } else if (requirePoint) {
        return { valid: false, message: 'Specify which ' + src + ' point to put odds on via options.point.' };
      } else {
        // canPlace with several come points: valid if any of them has room
        var self = this;
        var anyRoom = pts.some(function (p) { var i = self._oddsInfo(betType, p); return i && i.remaining >= MIN_BET; });
        return anyRoom ? { valid: true, message: 'OK', point: null }
          : { valid: false, message: 'Odds are already at the maximum on every ' + src + ' point.' };
      }
    }

    if (ODDS_TYPES[betType]) {
      var info = this._oddsInfo(betType, betPoint);
      if (!info) return { valid: false, message: 'Odds are not available right now.' };
      if (info.remaining < MIN_BET) {
        return { valid: false, message: 'Odds are already at the maximum (' + fmt(info.max) + ').' };
      }
    }
    return { valid: true, message: 'OK', point: betPoint };
  };

  /**
   * Timing / eligibility check without placing (for dimming table spots).
   * @returns {{valid: boolean, message: string}}
   */
  CrapsGame.prototype.canPlace = function (betType, options) {
    var e = this._eligibility(betType, options, false);
    if (!e.valid) return { valid: false, message: e.message };
    if (this._state.balance < MIN_BET) return { valid: false, message: 'Insufficient balance.' };
    return { valid: true, message: 'OK' };
  };

  /**
   * Place a bet.
   * @param {string} betType
   * @param {number} amount  whole dollars ≥ 1
   * @param {Object} [options] { point } for come-odds / dont-come-odds
   * @returns {{success: boolean, message: string}}
   */
  CrapsGame.prototype.placeBet = function (betType, amount, options) {
    options = options || {};

    var typeCheck = V.validateBetType(betType);
    if (!typeCheck.valid) return { success: false, message: typeCheck.message };

    var amountCheck = V.validateBetAmount(amount, this._state.balance);
    if (!amountCheck.valid) return { success: false, message: amountCheck.message };

    var e = this._eligibility(betType, options, true);
    if (!e.valid) return { success: false, message: e.message };
    var betPoint = e.point;

    if (ODDS_TYPES[betType]) {
      var info = this._oddsInfo(betType, betPoint);
      if (amount > info.remaining) {
        var isDont = betType === BetType.DONT_PASS_ODDS || betType === BetType.DONT_COME_ODDS;
        return {
          success: false,
          message: 'Odds limit is ' + this._options.maxOddsMultiple + 'x' + (isDont ? ' (by amount won)' : '') +
            ': max ' + fmt(info.max) + ' on ' + info.point + ', ' + fmt(info.remaining) + ' remaining.',
        };
      }
    }

    this._bets.place(betType, amount, betPoint);
    this._state = this._state.update({
      balance: round2(this._state.balance - amount),
      totalWagered: this._state.totalWagered + amount,
    });
    this._betLog.push({ betType: betType, amount: amount, point: betPoint });

    this._emit(GameEvent.BET_PLACED, { betType: betType, amount: amount, point: betPoint });
    return { success: true, message: 'Placed ' + betType + ' bet of ' + fmt(amount) + (betPoint != null ? ' on ' + betPoint : '') + '.' };
  };

  // ------------------------------------------------------------------
  // Rolling
  // ------------------------------------------------------------------

  /**
   * Roll the dice, resolve bets, advance state.
   * `phase` / `point` in the result are the state AFTER the roll.
   */
  CrapsGame.prototype.roll = function () {
    var dice = this._dice.roll();
    var sum = dice.sum;
    var prevPhase = this._state.phase;
    var point = this._state.point;

    var roundSnapshot = [];
    var activeBefore = this._bets.getAll();
    Object.keys(activeBefore).forEach(function (type) {
      activeBefore[type].forEach(function (b) {
        roundSnapshot.push({ betType: type, amount: b.amount, point: b.point });
      });
    });

    var resolved = this._bets.resolve(dice, prevPhase, point);

    var creditCents = 0, wonCents = 0, lostCents = 0;
    resolved.wins.forEach(function (w) {
      creditCents += Math.round(w.payout * 100);
      wonCents += Math.round(w.profit * 100);
    });
    resolved.pushes.forEach(function (p) { if (p.returned) creditCents += Math.round(p.amount * 100); });
    resolved.losses.forEach(function (l) { lostCents += Math.round(l.amount * 100); });

    var outcome, newPhase = prevPhase, newPoint = point;
    if (prevPhase === Phase.COME_OUT) {
      if (NATURALS.indexOf(sum) !== -1) {
        outcome = Outcome.NATURAL;
      } else if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
        outcome = Outcome.CRAPS;
      } else {
        outcome = Outcome.POINT_SET;
        newPhase = Phase.POINT;
        newPoint = sum;
      }
    } else if (sum === point) {
      outcome = Outcome.POINT_HIT;
      newPhase = Phase.COME_OUT;
      newPoint = null;
    } else if (sum === 7) {
      outcome = Outcome.SEVEN_OUT;
      newPhase = Phase.COME_OUT;
      newPoint = null;
    } else {
      outcome = Outcome.NEUTRAL;
    }

    // A Place/Buy bet on the number that just became the point is returned.
    var returned = [];
    if (outcome === Outcome.POINT_SET) {
      var manager = this._bets;
      ['place-' + newPoint, 'buy-' + newPoint].forEach(function (t) {
        var arr = manager.list(t);
        if (arr.length) {
          var amt = sumAmounts(arr);
          returned.push({ betType: t, amount: amt });
          creditCents += Math.round(amt * 100);
          manager.clearType(t);
        }
      });
    }

    this._bets.markRolled();

    var totalWon = wonCents / 100, totalLost = lostCents / 100;
    this._state = this._state.update({
      phase: newPhase, point: newPoint,
      balance: round2(this._state.balance + creditCents / 100),
      totalRolls: this._state.totalRolls + 1,
      rollsSinceSeven: sum === 7 ? 0 : this._state.rollsSinceSeven + 1,
      winsCount: this._state.winsCount + resolved.wins.length,
      lossesCount: this._state.lossesCount + resolved.losses.length,
      totalWon: this._state.totalWon + totalWon,
      totalLost: this._state.totalLost + totalLost,
    });

    this._state = this._state.addHistory({ dice: dice, sum: sum, outcome: outcome, phase: prevPhase, resolved: resolved });

    this._emit(GameEvent.DICE_ROLLED, { dice: dice, sum: sum, outcome: outcome });
    var self = this;
    resolved.wins.forEach(function (w) { self._emit(GameEvent.BET_WON, w); });
    resolved.losses.forEach(function (l) { self._emit(GameEvent.BET_LOST, l); });
    if (newPhase !== prevPhase) {
      this._emit(GameEvent.PHASE_CHANGED, { from: prevPhase, to: newPhase, point: newPoint });
    }

    if (roundSnapshot.length) this._lastRoundBets = roundSnapshot;
    this._betLog = [];

    return {
      dice: dice,
      outcome: outcome,
      phase: newPhase,
      point: newPoint,
      resolved: resolved,
      returned: returned,
      net: (wonCents - lostCents) / 100,
      totalWon: totalWon,
      totalLost: totalLost,
    };
  };

  // ------------------------------------------------------------------
  // Queries
  // ------------------------------------------------------------------

  CrapsGame.prototype.getGameState = function () { return this._state.toJSON(); };
  CrapsGame.prototype.getBets = function () { return this._bets.getAll(); };
  CrapsGame.prototype.getBalance = function () { return this._state.balance; };
  CrapsGame.prototype.getPhase = function () { return this._state.phase; };
  CrapsGame.prototype.getPoint = function () { return this._state.point; };
  CrapsGame.prototype.getTotalAtRisk = function () { return this._bets.totalActive(); };

  /**
   * Effective working state for the NEXT roll.
   * false if the player turned it off, or for place/buy and come-odds on a come-out roll.
   */
  CrapsGame.prototype.isWorking = function (betType, point) {
    if (TOGGLEABLE[betType] && !this._bets.isOn(betType)) return false;
    var comeOut = this._state.phase === Phase.COME_OUT;
    if (comeOut && (/^place-/.test(betType) || /^buy-/.test(betType))) return false;
    if (comeOut && betType === BetType.COME_ODDS) return false;
    return true;
  };

  // ------------------------------------------------------------------
  // Working toggles
  // ------------------------------------------------------------------

  CrapsGame.prototype.setWorking = function (betType, on) {
    on = !!on;
    if (!TOGGLEABLE[betType]) {
      return { success: false, working: this.isWorking(betType), message: betType + ' cannot be turned on/off.' };
    }
    var changed = this._bets.setWorking(betType, on);
    if (changed === null) {
      return { success: false, working: false, message: 'No active ' + betType + ' bet to toggle.' };
    }
    if (changed) this._emit('bet-toggled', { betType: betType, working: on });
    return { success: true, working: on, message: betType + ' is now ' + (on ? 'working' : 'off') + '.' };
  };

  CrapsGame.prototype.toggleWorking = function (betType) {
    if (!TOGGLEABLE[betType]) {
      return { success: false, working: this.isWorking(betType), message: betType + ' cannot be turned on/off.' };
    }
    if (!this._bets.has(betType)) {
      return { success: false, working: false, message: 'No active ' + betType + ' bet to toggle.' };
    }
    return this.setWorking(betType, !this._bets.isOn(betType));
  };

  /** Turn every toggleable bet on/off. Returns the number of bet types that changed. */
  CrapsGame.prototype.setAllWorking = function (on) {
    on = !!on;
    var count = 0;
    var self = this;
    this._bets.types().forEach(function (t) {
      if (!TOGGLEABLE[t]) return;
      if (self._bets.setWorking(t, on)) {
        count++;
        self._emit('bet-toggled', { betType: t, working: on });
      }
    });
    return count;
  };

  // ------------------------------------------------------------------
  // Removal
  // ------------------------------------------------------------------

  /** Whether one wager may be taken down right now. */
  CrapsGame.prototype._wagerRemovable = function (type, b) {
    var phase = this._state.phase;
    if (type === BetType.PASS) return phase !== Phase.POINT;
    if (type === BetType.COME) return b.point === null;
    // Bonus bets and put (a contract bet) can only come down before their first roll.
    if (type === BetType.SMALL || type === BetType.TALL || type === BetType.ALL || type === BetType.PUT) return !!b.fresh;
    return true; // dont-pass, dont-come, all odds, place/buy/lay/big/hard, one-roll
  };

  CrapsGame.prototype._matches = function (type, b, point) {
    if (point == null || !POINTED_TYPES[type]) return true;
    return b.point === point;
  };

  CrapsGame.prototype.canRemove = function (betType, point) {
    var self = this;
    return this._bets.list(betType).some(function (b) {
      return self._matches(betType, b, point) && self._wagerRemovable(betType, b);
    });
  };

  /** Drop don't-odds whose flat bet is gone; returns refunded dollars. */
  CrapsGame.prototype._sweepOrphanOdds = function () {
    var self = this;
    var hasDP = this._bets.has(BetType.DONT_PASS);
    var dcPts = this._comePoints(BetType.DONT_COME);
    var cPts = this._comePoints(BetType.COME);
    return this._bets.removeWhere(function (type, b) {
      if (type === BetType.DONT_PASS_ODDS) return !hasDP;
      if (type === BetType.DONT_COME_ODDS) return dcPts.indexOf(b.point) === -1;
      if (type === BetType.PASS_ODDS) return !self._bets.has(BetType.PASS);
      if (type === BetType.COME_ODDS) return cPts.indexOf(b.point) === -1;
      return false;
    });
  };

  /**
   * Take down a bet and refund it. Without a point, removes every removable wager
   * of that type; with a point, only that point's. Removing a don't pass / don't
   * come flat also takes down the odds attached to it.
   * @returns {{success: boolean, refund: number, message: string}}
   */
  CrapsGame.prototype.removeBet = function (betType, options) {
    var point = (options && options.point != null) ? options.point : null;
    var self = this;
    var any = this._bets.list(betType).filter(function (b) { return self._matches(betType, b, point); });
    if (!any.length) {
      return { success: false, refund: 0, message: 'No active ' + betType + ' bet' + (point != null ? ' on ' + point : '') + ' to remove.' };
    }
    var refund = this._bets.removeWhere(function (type, b) {
      return type === betType && self._matches(type, b, point) && self._wagerRemovable(type, b);
    });
    if (refund === 0) {
      return { success: false, refund: 0, message: betType + ' is locked in play and cannot be taken down.' };
    }
    refund = round2(refund + this._sweepOrphanOdds());
    this._addBalance(refund);
    this._emit('bet-removed', { betType: betType, point: point, refund: refund });
    return { success: true, refund: refund, message: 'Removed ' + betType + ', refunded ' + fmt(refund) + '.' };
  };

  /** Take down everything canRemove allows and refund it. */
  CrapsGame.prototype.clearRemovableBets = function () {
    var self = this;
    var refund = this._bets.removeWhere(function (type, b) { return self._wagerRemovable(type, b); });
    refund = round2(refund + this._sweepOrphanOdds());
    if (refund > 0) this._addBalance(refund);
    this._betLog = [];
    this._emit('bets-cleared', { refund: refund });
    return { success: true, refund: refund, message: 'Cleared removable bets, refunded ' + fmt(refund) + '.' };
  };

  /**
   * Undo the most recent placement made since the last roll.
   * @returns {{success: boolean, refund: number, betType: ?string, message: string}}
   */
  CrapsGame.prototype.undoLastBet = function () {
    while (this._betLog.length) {
      var last = this._betLog.pop();
      var removed = this._bets.removeLastFresh(last.betType, last.amount, last.point);
      if (!removed) continue; // already taken down some other way
      this._addBalance(last.amount);
      this._state = this._state.update({ totalWagered: this._state.totalWagered - last.amount });
      this._emit('bet-removed', { betType: last.betType, point: last.point, refund: last.amount });
      return { success: true, refund: last.amount, betType: last.betType, message: 'Undid ' + last.betType + ', refunded ' + fmt(last.amount) + '.' };
    }
    return { success: false, refund: 0, betType: null, message: 'Nothing to undo.' };
  };

  /**
   * Top up the table to what was riding into the last roll. Aggregated by bet
   * type; only the shortfall versus what is on the table now is placed. Odds
   * and come / don't come bets that had a point are never re-created (flat
   * come / don't come are compared with the flat ones on the table now).
   * @returns {{success: boolean, placed: number, skipped: number, total: number, amount: number, message: string}}
   */
  CrapsGame.prototype.repeatBets = function () {
    var order = [], want = {};
    this._lastRoundBets.forEach(function (b) {
      if (ODDS_TYPES[b.betType]) return;
      if ((b.betType === BetType.COME || b.betType === BetType.DONT_COME) && b.point != null) return;
      if (!want.hasOwnProperty(b.betType)) { want[b.betType] = 0; order.push(b.betType); }
      want[b.betType] += b.amount;
    });
    if (!order.length) {
      return { success: false, placed: 0, skipped: 0, total: 0, amount: 0, message: 'No previous bets to repeat.' };
    }
    var placed = 0, skipped = 0, amount = 0;
    var self = this;
    order.forEach(function (type) {
      var onTable = self._bets.list(type).filter(function (b) {
        return !((type === BetType.COME || type === BetType.DONT_COME) && b.point !== null);
      });
      var shortfall = round2(want[type] - sumAmounts(onTable));
      if (shortfall < MIN_BET) return; // already covered
      var res = self.placeBet(type, shortfall);
      if (res.success) { placed++; amount += shortfall; } else skipped++;
    });
    return {
      success: placed > 0,
      placed: placed,
      skipped: skipped,
      total: order.length,
      amount: amount,
      message: placed > 0
        ? 'Repeated ' + placed + ' bet' + (placed === 1 ? '' : 's') + ' (' + fmt(amount) + ')' + (skipped ? ', ' + skipped + ' skipped' : '') + '.'
        : (skipped ? 'Could not repeat those bets right now.' : 'Your bets are already on the table.'),
    };
  };

  // ------------------------------------------------------------------
  // Misc
  // ------------------------------------------------------------------

  CrapsGame.prototype.getStats = function () {
    return {
      totalRolls: this._state.totalRolls, winsCount: this._state.winsCount,
      lossesCount: this._state.lossesCount, totalWagered: this._state.totalWagered,
      totalWon: this._state.totalWon, totalLost: this._state.totalLost,
      netProfit: round2(this._state.balance - this._initialBalance),
      initialBalance: this._initialBalance, currentBalance: this._state.balance,
    };
  };

  CrapsGame.prototype.getHistory = function () { return this._state.history.slice(); };

  CrapsGame.prototype.reset = function () {
    this._bets.clearAll();
    this._betLog = [];
    this._lastRoundBets = [];
    this._state = new GameState({ balance: this._initialBalance });
    this._emit(GameEvent.GAME_RESET, {});
  };

  CrapsGame.prototype.on = function (eventName, callback) {
    if (!this._listeners.has(eventName)) this._listeners.set(eventName, new Set());
    this._listeners.get(eventName).add(callback);
    return this;
  };

  CrapsGame.prototype.off = function (eventName, callback) {
    var set = this._listeners.get(eventName);
    if (set) set.delete(callback);
    return this;
  };

  CrapsGame.prototype._emit = function (eventName, data) {
    var set = this._listeners.get(eventName);
    if (!set) return;
    set.forEach(function (fn) {
      try { fn(data); } catch (err) { console.error('Error in ' + eventName + ' listener:', err); }
    });
  };

  root.CrapsGame = CrapsGame;
})(typeof self !== 'undefined' ? self : this);
