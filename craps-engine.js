/**
 * @file Browser bundle — concatenates all game modules in dependency order.
 * Exposes: CrapsConstants, CrapsValidators, CrapsDice, CrapsGameState, CrapsBets, CrapsGame, Craps
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
  });

  var NATURALS = Object.freeze([7, 11]);
  var CRAPS_NUMBERS = Object.freeze([2, 3, 12]);
  var POINT_NUMBERS = Object.freeze([4, 5, 6, 8, 9, 10]);
  var FIELD_NUMBERS = Object.freeze([2, 3, 4, 9, 10, 11, 12]);
  var MIN_BET = 1;
  var BUY_NUMBERS = Object.freeze({
    'buy-4': 4,
    'buy-5': 5,
    'buy-6': 6,
    'buy-8': 8,
    'buy-9': 9,
    'buy-10': 10,
  });
  var BUY_COMMISSION = 0.05;
  var LAY_NUMBERS = Object.freeze({
    'lay-4': 4,
    'lay-5': 5,
    'lay-6': 6,
    'lay-8': 8,
    'lay-9': 9,
    'lay-10': 10,
  });
  var LAY_COMMISSION = 0.05;

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
    MIN_BET: MIN_BET,
    BUY_NUMBERS: BUY_NUMBERS,
    BUY_COMMISSION: BUY_COMMISSION,
    LAY_NUMBERS: LAY_NUMBERS,
    LAY_COMMISSION: LAY_COMMISSION,
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

  function validateBetAmount(amount, balance) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      return { valid: false, message: 'Bet amount must be a finite number.' };
    }
    if (amount < MIN_BET) {
      return { valid: false, message: 'Minimum bet is ' + MIN_BET + '.' };
    }
    if (amount > balance) {
      return { valid: false, message: 'Insufficient balance. Current balance: ' + balance + '.' };
    }
    return { valid: true };
  }

  function validateBetTiming(betType, phase, point, activeBets) {
    switch (betType) {
      case BetType.PASS:
      case BetType.DONT_PASS:
        if (phase !== Phase.COME_OUT) {
          return { valid: false, message: betType + ' bets can only be placed during the come-out roll.' };
        }
        break;
      case BetType.COME:
      case BetType.DONT_COME:
        if (phase !== Phase.POINT) {
          return { valid: false, message: betType + ' bets can only be placed during the point phase.' };
        }
        break;
      case BetType.PASS_ODDS:
        if (phase !== Phase.POINT) {
          return { valid: false, message: 'Pass odds require an active pass bet with a point established.' };
        }
        if (!activeBets[BetType.PASS]) {
          return { valid: false, message: 'You must have an active pass bet to place pass odds.' };
        }
        break;
      case BetType.DONT_PASS_ODDS:
        if (phase !== Phase.POINT) {
          return { valid: false, message: "Don't pass odds require an active don't pass bet with a point established." };
        }
        if (!activeBets[BetType.DONT_PASS]) {
          return { valid: false, message: "You must have an active don't pass bet to place don't pass odds." };
        }
        break;
      case BetType.COME_ODDS: {
        var comeBets = activeBets[BetType.COME];
        if (!comeBets || !comeBets.some(function (b) { return b.point !== null; })) {
          return { valid: false, message: 'You must have a come bet with an established point to place come odds.' };
        }
        break;
      }
      case BetType.DONT_COME_ODDS: {
        var dcBets = activeBets[BetType.DONT_COME];
        if (!dcBets || !dcBets.some(function (b) { return b.point !== null; })) {
          return { valid: false, message: "You must have a don't come bet with an established point to place don't come odds." };
        }
        break;
      }
      case BetType.PLACE_4:
      case BetType.PLACE_5:
      case BetType.PLACE_6:
      case BetType.PLACE_8:
      case BetType.PLACE_9:
      case BetType.PLACE_10:
        if (phase !== Phase.POINT) {
          return { valid: false, message: 'Place bets can only be made during the point phase.' };
        }
        break;
      case BetType.BIG_6:
      case BetType.BIG_8:
      case BetType.BUY_4:
      case BetType.BUY_5:
      case BetType.BUY_6:
      case BetType.BUY_8:
      case BetType.BUY_9:
      case BetType.BUY_10:
      case BetType.LAY_4:
      case BetType.LAY_5:
      case BetType.LAY_6:
      case BetType.LAY_8:
      case BetType.LAY_9:
      case BetType.LAY_10:
      case BetType.PUT:
        if (phase !== Phase.POINT) {
          return { valid: false, message: betType + ' bets can only be made during the point phase.' };
        }
        break;
      case BetType.ANY_SEVEN:
      case BetType.ANY_CRAPS:
      case BetType.HORN_2:
      case BetType.HORN_3:
      case BetType.HORN_11:
      case BetType.HORN_12:
        break;
      case BetType.HARD_4:
      case BetType.HARD_6:
      case BetType.HARD_8:
      case BetType.HARD_10:
        break;
      case BetType.FIELD:
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

  function GameState(init) {
    init = init || {};
    this.phase = init.phase || Phase.COME_OUT;
    this.point = init.point !== undefined ? init.point : null;
    this.balance = init.balance !== undefined ? init.balance : 1000;
    this.totalRolls = init.totalRolls || 0;
    this.winsCount = init.winsCount || 0;
    this.lossesCount = init.lossesCount || 0;
    this.totalWagered = init.totalWagered || 0;
    this.totalWon = init.totalWon || 0;
    this.totalLost = init.totalLost || 0;
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
    return this.update({ history: this.history.concat([Object.freeze(record)]) });
  };

  GameState.prototype.toJSON = function () {
    return {
      phase: this.phase, point: this.point, balance: this.balance,
      totalRolls: this.totalRolls, winsCount: this.winsCount, lossesCount: this.lossesCount,
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

  function calcPayout(wager, ratio) {
    return wager + (wager * ratio[0]) / ratio[1];
  }

  function calcProfit(wager, ratio) {
    return Math.floor((wager * ratio[0]) / ratio[1]);
  }

  function oddsKey(point) { return 'odds_' + point; }
  function dontOddsKey(point) { return 'dont_odds_' + point; }

  // Place bet number extracted from bet type string
  var PLACE_BET_NUMBERS = {
    'place-4': 4, 'place-5': 5, 'place-6': 6,
    'place-8': 8, 'place-9': 9, 'place-10': 10,
  };

  function BetManager() {
    this._bets = new Map();
  }

  BetManager.prototype.place = function (betType, amount, point) {
    if (point === undefined) point = null;
    if (!this._bets.has(betType)) this._bets.set(betType, []);
    this._bets.get(betType).push({ amount: amount, point: point });
  };

  BetManager.prototype.getAll = function () {
    var out = {};
    this._bets.forEach(function (bets, type) {
      if (bets.length > 0) out[type] = bets.map(function (b) { return { amount: b.amount, point: b.point }; });
    });
    return out;
  };

  BetManager.prototype.totalActive = function () {
    var sum = 0;
    this._bets.forEach(function (bets) {
      bets.forEach(function (b) { sum += b.amount; });
    });
    return sum;
  };

  BetManager.prototype.clearType = function (betType) { this._bets.delete(betType); };
  BetManager.prototype.clearAll = function () { this._bets.clear(); };
  BetManager.prototype.has = function (betType) {
    var b = this._bets.get(betType);
    return !!b && b.length > 0;
  };

  BetManager.prototype.resolve = function (dice, phase, point) {
    var die1 = dice.die1, die2 = dice.die2, sum = dice.sum;
    var wins = [], losses = [], pushes = [];

    this._resolvePass(sum, phase, point, wins, losses);
    this._resolveDontPass(sum, phase, point, wins, losses, pushes);
    this._resolveOdds(BetType.PASS_ODDS, sum, phase, point, false, wins, losses);
    this._resolveOdds(BetType.DONT_PASS_ODDS, sum, phase, point, true, wins, losses);
    this._resolveCome(sum, phase, wins, losses);
    this._resolveDontCome(sum, phase, wins, losses, pushes);
    this._resolveComeOdds(BetType.COME_ODDS, sum, false, wins, losses);
    this._resolveComeOdds(BetType.DONT_COME_ODDS, sum, true, wins, losses);
    this._resolveField(sum, wins, losses);

    // All place bets
    var self = this;
    Object.keys(PLACE_BET_NUMBERS).forEach(function (bt) {
      self._resolvePlace(bt, PLACE_BET_NUMBERS[bt], sum, phase, wins, losses);
    });

    // Big 6/8
    this._resolveBig(BetType.BIG_6, 6, sum, phase, wins, losses);
    this._resolveBig(BetType.BIG_8, 8, sum, phase, wins, losses);

    // Any Seven (one-roll)
    this._resolveAnySeven(sum, wins, losses);

    // Any Craps (one-roll)
    this._resolveAnyCraps(sum, wins, losses);

    // Hardways (multi-roll)
    this._resolveHardway(BetType.HARD_4, 4, die1, die2, sum, wins, losses);
    this._resolveHardway(BetType.HARD_6, 6, die1, die2, sum, wins, losses);
    this._resolveHardway(BetType.HARD_8, 8, die1, die2, sum, wins, losses);
    this._resolveHardway(BetType.HARD_10, 10, die1, die2, sum, wins, losses);

    // Horn bets (one-roll)
    this._resolveHorn(BetType.HORN_2, 2, sum, wins, losses);
    this._resolveHorn(BetType.HORN_3, 3, sum, wins, losses);
    this._resolveHorn(BetType.HORN_11, 11, sum, wins, losses);
    this._resolveHorn(BetType.HORN_12, 12, sum, wins, losses);

    // Buy bets (point phase, true odds)
    this._resolveBuy(BetType.BUY_4, 4, sum, phase, wins, losses);
    this._resolveBuy(BetType.BUY_5, 5, sum, phase, wins, losses);
    this._resolveBuy(BetType.BUY_6, 6, sum, phase, wins, losses);
    this._resolveBuy(BetType.BUY_8, 8, sum, phase, wins, losses);
    this._resolveBuy(BetType.BUY_9, 9, sum, phase, wins, losses);
    this._resolveBuy(BetType.BUY_10, 10, sum, phase, wins, losses);

    // Lay bets (point phase, wins on 7 before number)
    this._resolveLay(BetType.LAY_4, 4, sum, phase, wins, losses);
    this._resolveLay(BetType.LAY_5, 5, sum, phase, wins, losses);
    this._resolveLay(BetType.LAY_6, 6, sum, phase, wins, losses);
    this._resolveLay(BetType.LAY_8, 8, sum, phase, wins, losses);
    this._resolveLay(BetType.LAY_9, 9, sum, phase, wins, losses);
    this._resolveLay(BetType.LAY_10, 10, sum, phase, wins, losses);

    // Put bet (point phase, like pass after point)
    this._resolvePut(sum, phase, point, wins, losses);

    return { wins: wins, losses: losses, pushes: pushes };
  };

  BetManager.prototype._resolvePass = function (sum, phase, point, wins, losses) {
    if (!this.has(BetType.PASS)) return;
    var bets = this._bets.get(BetType.PASS);
    if (phase === Phase.COME_OUT) {
      if (NATURALS.indexOf(sum) !== -1) {
        bets.forEach(function (b) { wins.push({ betType: BetType.PASS, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.PASS]) }); });
        this.clearType(BetType.PASS);
      } else if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
        bets.forEach(function (b) { losses.push({ betType: BetType.PASS, amount: b.amount }); });
        this.clearType(BetType.PASS);
      }
    } else {
      if (sum === point) {
        bets.forEach(function (b) { wins.push({ betType: BetType.PASS, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.PASS]) }); });
        this.clearType(BetType.PASS);
      } else if (sum === 7) {
        bets.forEach(function (b) { losses.push({ betType: BetType.PASS, amount: b.amount }); });
        this.clearType(BetType.PASS);
      }
    }
  };

  BetManager.prototype._resolveDontPass = function (sum, phase, point, wins, losses, pushes) {
    if (!this.has(BetType.DONT_PASS)) return;
    var bets = this._bets.get(BetType.DONT_PASS);
    if (phase === Phase.COME_OUT) {
      if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
        if (sum === 12) {
          bets.forEach(function (b) { pushes.push({ betType: BetType.DONT_PASS, amount: b.amount }); });
        } else {
          bets.forEach(function (b) { wins.push({ betType: BetType.DONT_PASS, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.DONT_PASS]) }); });
        }
        this.clearType(BetType.DONT_PASS);
      } else if (NATURALS.indexOf(sum) !== -1) {
        bets.forEach(function (b) { losses.push({ betType: BetType.DONT_PASS, amount: b.amount }); });
        this.clearType(BetType.DONT_PASS);
      }
    } else {
      if (sum === 7) {
        bets.forEach(function (b) { wins.push({ betType: BetType.DONT_PASS, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.DONT_PASS]) }); });
        this.clearType(BetType.DONT_PASS);
      } else if (sum === point) {
        bets.forEach(function (b) { losses.push({ betType: BetType.DONT_PASS, amount: b.amount }); });
        this.clearType(BetType.DONT_PASS);
      }
    }
  };

  BetManager.prototype._resolveOdds = function (betType, sum, phase, point, isDont, wins, losses) {
    if (!this.has(betType)) return;
    if (phase !== Phase.POINT || point === null) return;
    var bets = this._bets.get(betType);
    if (isDont) {
      if (sum === 7) {
        var key = dontOddsKey(point);
        bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[key]) }); });
        this.clearType(betType);
      } else if (sum === point) {
        bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
        this.clearType(betType);
      }
    } else {
      if (sum === point) {
        var key2 = oddsKey(point);
        bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[key2]) }); });
        this.clearType(betType);
      } else if (sum === 7) {
        bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
        this.clearType(betType);
      }
    }
  };

  BetManager.prototype._resolveCome = function (sum, phase, wins, losses) {
    if (!this.has(BetType.COME)) return;
    var remaining = [];
    this._bets.get(BetType.COME).forEach(function (b) {
      if (b.point === null) {
        if (NATURALS.indexOf(sum) !== -1) {
          wins.push({ betType: BetType.COME, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.COME]) });
        } else if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
          losses.push({ betType: BetType.COME, amount: b.amount });
        } else {
          remaining.push({ amount: b.amount, point: sum });
        }
      } else {
        if (sum === b.point) {
          wins.push({ betType: BetType.COME, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.COME]), point: b.point });
        } else if (sum === 7) {
          losses.push({ betType: BetType.COME, amount: b.amount, point: b.point });
        } else {
          remaining.push({ amount: b.amount, point: b.point });
        }
      }
    });
    if (remaining.length > 0) this._bets.set(BetType.COME, remaining);
    else this.clearType(BetType.COME);
  };

  BetManager.prototype._resolveDontCome = function (sum, phase, wins, losses, pushes) {
    if (!this.has(BetType.DONT_COME)) return;
    var remaining = [];
    this._bets.get(BetType.DONT_COME).forEach(function (b) {
      if (b.point === null) {
        if (NATURALS.indexOf(sum) !== -1) {
          losses.push({ betType: BetType.DONT_COME, amount: b.amount });
        } else if (sum === 12) {
          pushes.push({ betType: BetType.DONT_COME, amount: b.amount });
        } else if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
          wins.push({ betType: BetType.DONT_COME, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.DONT_COME]) });
        } else {
          remaining.push({ amount: b.amount, point: sum });
        }
      } else {
        if (sum === 7) {
          wins.push({ betType: BetType.DONT_COME, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.DONT_COME]), point: b.point });
        } else if (sum === b.point) {
          losses.push({ betType: BetType.DONT_COME, amount: b.amount, point: b.point });
        } else {
          remaining.push({ amount: b.amount, point: b.point });
        }
      }
    });
    if (remaining.length > 0) this._bets.set(BetType.DONT_COME, remaining);
    else this.clearType(BetType.DONT_COME);
  };

  BetManager.prototype._resolveComeOdds = function (betType, sum, isDont, wins, losses) {
    if (!this.has(betType)) return;
    var remaining = [];
    this._bets.get(betType).forEach(function (b) {
      if (b.point === null) { remaining.push({ amount: b.amount, point: b.point }); return; }
      if (isDont) {
        if (sum === 7) {
          wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[dontOddsKey(b.point)]), point: b.point });
        } else if (sum === b.point) {
          losses.push({ betType: betType, amount: b.amount, point: b.point });
        } else {
          remaining.push({ amount: b.amount, point: b.point });
        }
      } else {
        if (sum === b.point) {
          wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[oddsKey(b.point)]), point: b.point });
        } else if (sum === 7) {
          losses.push({ betType: betType, amount: b.amount, point: b.point });
        } else {
          remaining.push({ amount: b.amount, point: b.point });
        }
      }
    });
    if (remaining.length > 0) this._bets.set(betType, remaining);
    else this.clearType(betType);
  };

  BetManager.prototype._resolveField = function (sum, wins, losses) {
    if (!this.has(BetType.FIELD)) return;
    var bets = this._bets.get(BetType.FIELD);
    if (FIELD_NUMBERS.indexOf(sum) !== -1) {
      var ratioKey = BetType.FIELD;
      if (sum === 2) ratioKey = 'field_2';
      if (sum === 12) ratioKey = 'field_12';
      bets.forEach(function (b) { wins.push({ betType: BetType.FIELD, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[ratioKey]) }); });
    } else {
      bets.forEach(function (b) { losses.push({ betType: BetType.FIELD, amount: b.amount }); });
    }
    this.clearType(BetType.FIELD);
  };

  BetManager.prototype._resolvePlace = function (betType, placeNum, sum, phase, wins, losses) {
    if (!this.has(betType)) return;
    if (phase !== Phase.POINT) return;
    var bets = this._bets.get(betType);
    if (sum === placeNum) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[betType]) }); });
      this.clearType(betType);
    } else if (sum === 7) {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
      this.clearType(betType);
    }
  };

  BetManager.prototype._resolveBig = function (betType, bigNum, sum, phase, wins, losses) {
    if (!this.has(betType)) return;
    if (phase !== Phase.POINT) return;
    var bets = this._bets.get(betType);
    if (sum === bigNum) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcProfit(b.amount, PayoutTable[betType]) }); });
    } else if (sum === 7) {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
      this.clearType(betType);
    }
  };

  BetManager.prototype._resolveAnySeven = function (sum, wins, losses) {
    if (!this.has(BetType.ANY_SEVEN)) return;
    var bets = this._bets.get(BetType.ANY_SEVEN);
    if (sum === 7) {
      bets.forEach(function (b) { wins.push({ betType: BetType.ANY_SEVEN, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.ANY_SEVEN]) }); });
    } else {
      bets.forEach(function (b) { losses.push({ betType: BetType.ANY_SEVEN, amount: b.amount }); });
    }
    this.clearType(BetType.ANY_SEVEN);
  };

  BetManager.prototype._resolveAnyCraps = function (sum, wins, losses) {
    if (!this.has(BetType.ANY_CRAPS)) return;
    var bets = this._bets.get(BetType.ANY_CRAPS);
    if (CRAPS_NUMBERS.indexOf(sum) !== -1) {
      bets.forEach(function (b) { wins.push({ betType: BetType.ANY_CRAPS, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.ANY_CRAPS]) }); });
    } else {
      bets.forEach(function (b) { losses.push({ betType: BetType.ANY_CRAPS, amount: b.amount }); });
    }
    this.clearType(BetType.ANY_CRAPS);
  };

  BetManager.prototype._resolveHardway = function (betType, hardNum, die1, die2, sum, wins, losses) {
    if (!this.has(betType)) return;
    var bets = this._bets.get(betType);
    var isHard = sum === hardNum && die1 === die2;
    var isEasy = sum === hardNum && die1 !== die2;
    var isSeven = sum === 7;

    if (isHard) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcProfit(b.amount, PayoutTable[betType]) }); });
    } else if (isEasy || isSeven) {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
      this.clearType(betType);
    }
  };

  BetManager.prototype._resolveHorn = function (betType, hornNum, sum, wins, losses) {
    if (!this.has(betType)) return;
    var bets = this._bets.get(betType);
    if (sum === hornNum) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[betType]) }); });
    } else {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
    }
    this.clearType(betType);
  };

  BetManager.prototype._resolveBuy = function (betType, buyNum, sum, phase, wins, losses) {
    if (!this.has(betType)) return;
    if (phase !== Phase.POINT) return;
    var bets = this._bets.get(betType);
    if (sum === buyNum) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcProfit(b.amount, PayoutTable[betType]) }); });
    } else if (sum === 7) {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
      this.clearType(betType);
    }
  };

  BetManager.prototype._resolveLay = function (betType, layNum, sum, phase, wins, losses) {
    if (!this.has(betType)) return;
    if (phase !== Phase.POINT) return;
    var bets = this._bets.get(betType);
    if (sum === 7) {
      bets.forEach(function (b) { wins.push({ betType: betType, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[betType]) }); });
      this.clearType(betType);
    } else if (sum === layNum) {
      bets.forEach(function (b) { losses.push({ betType: betType, amount: b.amount }); });
      this.clearType(betType);
    }
  };

  BetManager.prototype._resolvePut = function (sum, phase, point, wins, losses) {
    if (!this.has(BetType.PUT)) return;
    if (phase !== Phase.POINT || point === null) return;
    var bets = this._bets.get(BetType.PUT);
    if (sum === point) {
      bets.forEach(function (b) { wins.push({ betType: BetType.PUT, amount: b.amount, payout: calcPayout(b.amount, PayoutTable[BetType.PUT]) }); });
      this.clearType(BetType.PUT);
    } else if (sum === 7) {
      bets.forEach(function (b) { losses.push({ betType: BetType.PUT, amount: b.amount }); });
      this.clearType(BetType.PUT);
    }
  };

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
  var POINT_NUMBERS = C.POINT_NUMBERS;
  var BetType = C.BetType;
  var BUY_NUMBERS = C.BUY_NUMBERS;
  var BUY_COMMISSION = C.BUY_COMMISSION;
  var LAY_NUMBERS = C.LAY_NUMBERS;
  var LAY_COMMISSION = C.LAY_COMMISSION;
  var PayoutTable = C.PayoutTable;

  /**
   * Core craps game engine.
   * @param {number} [initialBalance=1000]
   * @param {Object} [options]
   * @param {function(): number} [options.randomFn]
   */
  function CrapsGame(initialBalance, options) {
    if (initialBalance === undefined) initialBalance = 1000;
    options = options || {};
    if (typeof initialBalance !== 'number' || initialBalance < 0) {
      throw new Error('Initial balance must be a non-negative number.');
    }
    this._initialBalance = initialBalance;
    this._dice = new Dice({ randomFn: options.randomFn });
    this._bets = new BetManager();
    this._state = new GameState({ balance: initialBalance });
    this._listeners = new Map();
  }

  /**
   * Place a bet.
   * @param {string} betType
   * @param {number} amount
   * @param {Object} [options]
   * @returns {{success: boolean, message: string}}
   */
  CrapsGame.prototype.placeBet = function (betType, amount, options) {
    options = options || {};

    var typeCheck = V.validateBetType(betType);
    if (!typeCheck.valid) return { success: false, message: typeCheck.message };

    var amountCheck = V.validateBetAmount(amount, this._state.balance);
    if (!amountCheck.valid) return { success: false, message: amountCheck.message };

    var timingCheck = V.validateBetTiming(betType, this._state.phase, this._state.point, this._bets.getAll());
    if (!timingCheck.valid) return { success: false, message: timingCheck.message };

    var betPoint = null;
    if (betType === BetType.COME_ODDS || betType === BetType.DONT_COME_ODDS) {
      var sourceType = betType === BetType.COME_ODDS ? BetType.COME : BetType.DONT_COME;
      var sourceBets = this._bets.getAll()[sourceType] || [];
      var withPoints = sourceBets.filter(function (b) { return b.point !== null; });
      if (options.point) {
        var match = withPoints.find(function (b) { return b.point === options.point; });
        if (!match) return { success: false, message: 'No ' + sourceType + ' bet on point ' + options.point + '.' };
        betPoint = options.point;
      } else if (withPoints.length === 1) {
        betPoint = withPoints[0].point;
      } else {
        return { success: false, message: 'Specify which come point to place odds on via options.point.' };
      }
    }

    // Deduct Buy bet commission if applicable
    var commission = 0;
    if (BUY_NUMBERS.hasOwnProperty(betType)) {
      commission = Math.ceil(amount * BUY_COMMISSION);
      if (this._state.balance < amount + commission) {
        return {
          success: false,
          message: 'Insufficient balance for bet ($' + amount + ') and commission ($' + commission + '). Current balance: ' + this._state.balance + '.',
        };
      }
    }

    // Deduct Lay bet commission (5% of potential winnings)
    if (LAY_NUMBERS.hasOwnProperty(betType)) {
      var ratio = PayoutTable[betType];
      var potentialWin = (amount * ratio[0]) / ratio[1];
      commission = Math.ceil(potentialWin * LAY_COMMISSION);
      if (this._state.balance < amount + commission) {
        return {
          success: false,
          message: 'Insufficient balance for bet ($' + amount + ') and commission ($' + commission + '). Current balance: ' + this._state.balance + '.',
        };
      }
    }

    this._bets.place(betType, amount, betPoint);
    this._state = this._state.update({
      balance: this._state.balance - amount - commission,
      totalWagered: this._state.totalWagered + amount,
    });

    this._emit(GameEvent.BET_PLACED, { betType: betType, amount: amount, point: betPoint });

    if (commission > 0) {
      return { success: true, message: 'Placed ' + betType + ' bet of $' + amount + ', commission $' + commission + ' charged.' };
    }
    return { success: true, message: 'Placed ' + betType + ' bet of $' + amount + '.' };
  };

  /**
   * Roll the dice, resolve bets, advance state.
   * @returns {{dice: Object, outcome: string, resolved: Object}}
   */
  CrapsGame.prototype.roll = function () {
    var dice = this._dice.roll();
    var sum = dice.sum;
    var prevPhase = this._state.phase;
    var point = this._state.point;

    var resolved = this._bets.resolve(dice, prevPhase, point);

    var balanceDelta = 0;
    var wonAmount = 0;
    var lostAmount = 0;

    resolved.wins.forEach(function (w) { balanceDelta += w.payout; wonAmount += w.payout - w.amount; });
    resolved.pushes.forEach(function (p) { balanceDelta += p.amount; });
    resolved.losses.forEach(function (l) { lostAmount += l.amount; });

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
    } else {
      if (sum === point) {
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
    }

    this._state = this._state.update({
      phase: newPhase, point: newPoint,
      balance: this._state.balance + balanceDelta,
      totalRolls: this._state.totalRolls + 1,
      winsCount: this._state.winsCount + resolved.wins.length,
      lossesCount: this._state.lossesCount + resolved.losses.length,
      totalWon: this._state.totalWon + wonAmount,
      totalLost: this._state.totalLost + lostAmount,
    });

    this._state = this._state.addHistory({ dice: dice, sum: sum, outcome: outcome, phase: prevPhase, resolved: resolved });

    this._emit(GameEvent.DICE_ROLLED, { dice: dice, sum: sum, outcome: outcome });
    var self = this;
    resolved.wins.forEach(function (w) { self._emit(GameEvent.BET_WON, w); });
    resolved.losses.forEach(function (l) { self._emit(GameEvent.BET_LOST, l); });
    if (newPhase !== prevPhase) {
      this._emit(GameEvent.PHASE_CHANGED, { from: prevPhase, to: newPhase, point: newPoint });
    }

    return { dice: dice, outcome: outcome, resolved: resolved };
  };

  CrapsGame.prototype.getGameState = function () { return this._state.toJSON(); };
  CrapsGame.prototype.getBets = function () { return this._bets.getAll(); };
  CrapsGame.prototype.getBalance = function () { return this._state.balance; };
  CrapsGame.prototype.getPhase = function () { return this._state.phase; };
  CrapsGame.prototype.getPoint = function () { return this._state.point; };

  /**
   * Remove an active bet and refund its amount to the player's balance.
   * @param {string} betType
   * @returns {{success: boolean, refund: number, message: string}}
   */
  CrapsGame.prototype.removeBet = function (betType) {
    var allBets = this._bets.getAll();
    var activeBets = allBets[betType];
    if (!activeBets || activeBets.length === 0) {
      return { success: false, refund: 0, message: 'No active ' + betType + ' bet to remove.' };
    }
    var refund = 0;
    for (var i = 0; i < activeBets.length; i++) refund += activeBets[i].amount;
    this._bets.clearType(betType);
    this._state = this._state.update({ balance: this._state.balance + refund });
    this._emit('bet-removed', { betType: betType, refund: refund });
    return { success: true, refund: refund, message: 'Removed ' + betType + ' bet, refunded $' + refund + '.' };
  };

  CrapsGame.prototype.getStats = function () {
    return {
      totalRolls: this._state.totalRolls, winsCount: this._state.winsCount,
      lossesCount: this._state.lossesCount, totalWagered: this._state.totalWagered,
      totalWon: this._state.totalWon, totalLost: this._state.totalLost,
      netProfit: this._state.balance - this._initialBalance,
      initialBalance: this._initialBalance, currentBalance: this._state.balance,
    };
  };

  CrapsGame.prototype.getHistory = function () { return this._state.history.slice(); };

  CrapsGame.prototype.reset = function () {
    this._bets.clearAll();
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

// ============================================================
// game/BettingStrategy.js
// ============================================================
(function (root) {
  'use strict';

  /**
   * Base class for betting strategies
   */
  function BettingStrategy(name, description) {
    this.name = name;
    this.description = description;
  }

  /**
   * Called before each roll to place bets
   * @param {Object} gameState - Current game state
   * @param {Object} bets - Current active bets
   * @returns {Array<{betType: string, amount: number}>} - Bets to place
   */
  BettingStrategy.prototype.getBets = function(gameState, bets) {
    throw new Error('Strategy must implement getBets()');
  };

  /**
   * Called when session starts
   * @param {number} initialBalance
   */
  BettingStrategy.prototype.onSessionStart = function(initialBalance) {
    // Override if needed
  };

  /**
   * Called after each roll
   * @param {Object} result - Roll result with dice, outcome, resolved
   */
  BettingStrategy.prototype.onRollComplete = function(result) {
    // Override if needed
  };

  // ---- Strategy 1: Pass Line Only ----
  function PassLineOnlyStrategy(betAmount) {
    BettingStrategy.call(this, 'Pass Line Only', 'Bet $' + betAmount + ' on Pass Line each come-out');
    this.betAmount = betAmount || 25;
  }
  PassLineOnlyStrategy.prototype = Object.create(BettingStrategy.prototype);
  PassLineOnlyStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.betAmount });
    }
    return toBet;
  };

  // ---- Strategy 2: Pass + Max Odds ----
  function PassWithOddsStrategy(baseBet, oddsMultiple) {
    BettingStrategy.call(this, 'Pass + ' + oddsMultiple + 'x Odds', 'Pass Line with max odds');
    this.baseBet = baseBet || 25;
    this.oddsMultiple = oddsMultiple || 3;
  }
  PassWithOddsStrategy.prototype = Object.create(BettingStrategy.prototype);
  PassWithOddsStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.baseBet });
    }
    if (gameState.phase === 'point' && bets['pass'] && !bets['pass-odds']) {
      var oddsAmount = this.baseBet * this.oddsMultiple;
      toBet.push({ betType: 'pass-odds', amount: oddsAmount });
    }
    return toBet;
  };

  // ---- Strategy 3: Don't Pass + Lay Odds ----
  function DontPassStrategy(baseBet, oddsMultiple) {
    BettingStrategy.call(this, "Don't Pass + Odds", "Bet against shooter");
    this.baseBet = baseBet || 25;
    this.oddsMultiple = oddsMultiple || 3;
  }
  DontPassStrategy.prototype = Object.create(BettingStrategy.prototype);
  DontPassStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['dont-pass']) {
      toBet.push({ betType: 'dont-pass', amount: this.baseBet });
    }
    if (gameState.phase === 'point' && bets['dont-pass'] && !bets['dont-pass-odds']) {
      toBet.push({ betType: 'dont-pass-odds', amount: this.baseBet * this.oddsMultiple });
    }
    return toBet;
  };

  // ---- Strategy 4: Place 6 & 8 Only ----
  function Place68Strategy(betAmount, setupBet) {
    BettingStrategy.call(this, 'Place 6 & 8', 'Come-out pass, then place 6 & 8');
    this.betAmount = betAmount || 30;
    this.setupBet = setupBet || 25;
  }
  Place68Strategy.prototype = Object.create(BettingStrategy.prototype);
  Place68Strategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // On come-out, place pass bet to establish point
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.setupBet });
    }

    // During point phase, place on 6 & 8
    if (gameState.phase === 'point') {
      if (!bets['place-6'] && gameState.point !== 6) {
        toBet.push({ betType: 'place-6', amount: this.betAmount });
      }
      if (!bets['place-8'] && gameState.point !== 8) {
        toBet.push({ betType: 'place-8', amount: this.betAmount });
      }
    }
    return toBet;
  };

  // ---- Strategy 5: Iron Cross ----
  function IronCrossStrategy(fieldBet, placeBet, setupBet) {
    BettingStrategy.call(this, 'Iron Cross', 'Come-out pass, then field + place 5,6,8');
    this.fieldBet = fieldBet || 25;
    this.placeBet = placeBet || 30;
    this.setupBet = setupBet || 25;
  }
  IronCrossStrategy.prototype = Object.create(BettingStrategy.prototype);
  IronCrossStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // On come-out, place pass bet to establish point
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.setupBet });
    }

    // During point phase, place field and place bets
    if (gameState.phase === 'point') {
      if (!bets['field']) toBet.push({ betType: 'field', amount: this.fieldBet });
      if (!bets['place-5'] && gameState.point !== 5) toBet.push({ betType: 'place-5', amount: this.placeBet });
      if (!bets['place-6'] && gameState.point !== 6) toBet.push({ betType: 'place-6', amount: this.placeBet });
      if (!bets['place-8'] && gameState.point !== 8) toBet.push({ betType: 'place-8', amount: this.placeBet });
    }
    return toBet;
  };

  // ---- Strategy 6: Martingale Pass Line ----
  function MartingalePassStrategy(baseBet, maxBet) {
    BettingStrategy.call(this, 'Martingale Pass', 'Double after loss, reset after win');
    this.baseBet = baseBet || 25;
    this.maxBet = maxBet || 400;
    this.currentBet = baseBet;
  }
  MartingalePassStrategy.prototype = Object.create(BettingStrategy.prototype);
  MartingalePassStrategy.prototype.onSessionStart = function() {
    this.currentBet = this.baseBet;
  };
  MartingalePassStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.currentBet });
    }
    return toBet;
  };
  MartingalePassStrategy.prototype.onRollComplete = function(result) {
    var passLost = result.resolved.losses.some(function(l) { return l.betType === 'pass'; });
    var passWon = result.resolved.wins.some(function(w) { return w.betType === 'pass'; });
    if (passLost) {
      this.currentBet = Math.min(this.currentBet * 2, this.maxBet);
    } else if (passWon) {
      this.currentBet = this.baseBet;
    }
  };

  // ---- Strategy 7: 3-Point Molly ----
  function ThreePointMollyStrategy(baseBet, oddsMultiple) {
    BettingStrategy.call(this, '3-Point Molly', 'Pass + 2 Come bets with odds');
    this.baseBet = baseBet || 25;
    this.oddsMultiple = oddsMultiple || 2;
  }
  ThreePointMollyStrategy.prototype = Object.create(BettingStrategy.prototype);
  ThreePointMollyStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.baseBet });
    }
    if (gameState.phase === 'point' && bets['pass'] && !bets['pass-odds']) {
      toBet.push({ betType: 'pass-odds', amount: this.baseBet * this.oddsMultiple });
    }
    if (gameState.phase === 'point') {
      var comeBets = bets['come'] ? (Array.isArray(bets['come']) ? bets['come'].length : 1) : 0;
      if (comeBets < 2) {
        toBet.push({ betType: 'come', amount: this.baseBet });
      }
    }
    return toBet;
  };

  // ---- Strategy 8: Conservative Don't ----
  function ConservativeDontStrategy(baseBet, layBet) {
    BettingStrategy.call(this, 'Conservative Don\'t', 'Don\'t Pass + Lay 4/10');
    this.baseBet = baseBet || 25;
    this.layBet = layBet || 50;
  }
  ConservativeDontStrategy.prototype = Object.create(BettingStrategy.prototype);
  ConservativeDontStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];
    if (gameState.phase === 'come-out' && !bets['dont-pass']) {
      toBet.push({ betType: 'dont-pass', amount: this.baseBet });
    }
    if (gameState.phase === 'point') {
      if (!bets['lay-4'] && gameState.point !== 4) {
        toBet.push({ betType: 'lay-4', amount: this.layBet });
      }
      if (!bets['lay-10'] && gameState.point !== 10) {
        toBet.push({ betType: 'lay-10', amount: this.layBet });
      }
    }
    return toBet;
  };

  // ---- Strategy 9: $135 Across (Two-Hit Regression) ----
  function Across135Strategy(initialPlacement, regressionAmount, setupBet) {
    BettingStrategy.call(this, '$135 Across', 'Come-out pass, then place 5,6,8,9 - regress after 2 hits');
    this.initialPlacement = initialPlacement || { 'place-5': 25, 'place-6': 30, 'place-8': 30, 'place-9': 25 };
    this.regressionAmount = regressionAmount || 10;
    this.setupBet = setupBet || 25;
    this.hitCount = 0;
    this.hitsThisPoint = 0;
    this.isRegressed = false;
  }
  Across135Strategy.prototype = Object.create(BettingStrategy.prototype);
  Across135Strategy.prototype.onSessionStart = function() {
    this.hitCount = 0;
    this.hitsThisPoint = 0;
    this.isRegressed = false;
  };
  Across135Strategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // On come-out, place pass bet to establish point
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.setupBet });
    }

    // During point phase, place bets on 5, 6, 8, 9
    if (gameState.phase === 'point') {
      // On new point or after regress, place initial bets
      if (!this.isRegressed && Object.keys(bets).filter(function(k) { return k.indexOf('place-') === 0; }).length === 0) {
        for (var betType in this.initialPlacement) {
          if (gameState.point !== parseInt(betType.split('-')[1], 10)) {
            toBet.push({ betType: betType, amount: this.initialPlacement[betType] });
          }
        }
      }
    }
    return toBet;
  };
  Across135Strategy.prototype.onRollComplete = function(result) {
    // Track hits on place bets
    var self = this;
    result.resolved.wins.forEach(function(w) {
      if (w.betType.indexOf('place-') === 0) {
        self.hitCount++;
        self.hitsThisPoint++;

        // After 2 hits, regress bets (remove them to be replaced with smaller ones)
        if (self.hitsThisPoint === 2) {
          self.isRegressed = true;
        }
      }
    });

    // Reset on new come-out
    if (result.outcome === 'seven-out' || result.outcome === 'point-hit') {
      self.hitsThisPoint = 0;
      self.isRegressed = false;
    }
  };

  // ---- Strategy 10: Heat Seeker ----
  function HeatSeekerStrategy(baseBet) {
    BettingStrategy.call(this, 'Heat Seeker', 'Come-out pass, build 4+ come points');
    this.baseBet = baseBet || 25;
    this.comePointsCount = 0;
  }
  HeatSeekerStrategy.prototype = Object.create(BettingStrategy.prototype);
  HeatSeekerStrategy.prototype.onSessionStart = function() {
    this.comePointsCount = 0;
  };
  HeatSeekerStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // Come-out: place pass bet
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.baseBet });
    }

    // Point phase: count come points and add more if less than 4
    if (gameState.phase === 'point') {
      var comeBets = bets['come'] ? (Array.isArray(bets['come']) ? bets['come'].length : 1) : 0;
      var comePointCount = bets['come'] ? bets['come'].filter(function(b) { return b.point !== null; }).length : 0;

      // Keep adding come bets until we have 4+ points working
      if (comePointCount < 4) {
        toBet.push({ betType: 'come', amount: this.baseBet });
      }
    }
    return toBet;
  };

  // ---- Strategy 11: Come Continuously ----
  function ComeContinuouslyStrategy(baseBet, oddsMultiple) {
    BettingStrategy.call(this, 'Come Continuously', 'Pass + continuous come bets with odds');
    this.baseBet = baseBet || 25;
    this.oddsMultiple = oddsMultiple || 2;
  }
  ComeContinuouslyStrategy.prototype = Object.create(BettingStrategy.prototype);
  ComeContinuouslyStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // Come-out: place pass bet
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: this.baseBet });
    }

    // Point phase
    if (gameState.phase === 'point') {
      // Add pass odds after point
      if (bets['pass'] && !bets['pass-odds']) {
        toBet.push({ betType: 'pass-odds', amount: this.baseBet * this.oddsMultiple });
      }

      // Continuously place come bets
      if (!bets['come'] || bets['come'].length === 0) {
        toBet.push({ betType: 'come', amount: this.baseBet });
      }

      // Add come odds on established come points
      var comeBets = bets['come'] || [];
      var comePointCount = comeBets.filter(function(b) { return b.point !== null; }).length;
      if (comePointCount > 0 && !bets['come-odds']) {
        toBet.push({ betType: 'come-odds', amount: this.baseBet * this.oddsMultiple, point: comeBets.find(function(b) { return b.point !== null; }).point });
      }
    }
    return toBet;
  };

  // ---- Strategy 12: Press & Regress ----
  function PressRegressStrategy(placeBets) {
    BettingStrategy.call(this, 'Press & Regress', 'Place across, press 1st hit, regress 2nd');
    this.placeBets = placeBets || { 'place-5': 25, 'place-6': 30, 'place-8': 30, 'place-9': 25 };
    this.hitCount = 0;
    this.isPressed = false;
  }
  PressRegressStrategy.prototype = Object.create(BettingStrategy.prototype);
  PressRegressStrategy.prototype.onSessionStart = function() {
    this.hitCount = 0;
    this.isPressed = false;
  };
  PressRegressStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // Come-out: place pass bet
    if (gameState.phase === 'come-out' && !bets['pass']) {
      toBet.push({ betType: 'pass', amount: 25 });
    }

    // Point phase: place across
    if (gameState.phase === 'point') {
      // Initial placement (no pressed bets yet)
      if (!this.isPressed && Object.keys(bets).filter(function(k) { return k.indexOf('place-') === 0; }).length === 0) {
        for (var betType in this.placeBets) {
          if (gameState.point !== parseInt(betType.split('-')[1], 10)) {
            toBet.push({ betType: betType, amount: this.placeBets[betType] });
          }
        }
      }
    }
    return toBet;
  };
  PressRegressStrategy.prototype.onRollComplete = function(result) {
    var self = this;
    // Count hits on place bets
    result.resolved.wins.forEach(function(w) {
      if (w.betType.indexOf('place-') === 0) {
        self.hitCount++;
      }
    });

    // After 2 hits, mark as regressed (in real game, would reduce bets)
    if (self.hitCount === 2) {
      self.isPressed = true;
    }

    // Reset on new come-out
    if (result.outcome === 'seven-out' || result.outcome === 'point-hit') {
      self.hitCount = 0;
      self.isPressed = false;
    }
  };

  // ---- Strategy 13: Lay Strategy (Dark Side) ----
  function LayStrategy(baseBet, layBet) {
    BettingStrategy.call(this, 'Lay Strategy', 'Don\'t pass, lay 6 & 8 (dark side)');
    this.baseBet = baseBet || 25;
    this.layBet = layBet || 30;
  }
  LayStrategy.prototype = Object.create(BettingStrategy.prototype);
  LayStrategy.prototype.getBets = function(gameState, bets) {
    var toBet = [];

    // Come-out: place don't pass bet
    if (gameState.phase === 'come-out' && !bets['dont-pass']) {
      toBet.push({ betType: 'dont-pass', amount: this.baseBet });
    }

    // Point phase: lay bets on 6 and 8
    if (gameState.phase === 'point') {
      if (!bets['lay-6'] && gameState.point !== 6) {
        toBet.push({ betType: 'lay-6', amount: this.layBet });
      }
      if (!bets['lay-8'] && gameState.point !== 8) {
        toBet.push({ betType: 'lay-8', amount: this.layBet });
      }
    }
    return toBet;
  };


  // Export strategy classes
  root.BettingStrategy = BettingStrategy;
  root.PassLineOnlyStrategy = PassLineOnlyStrategy;
  root.PassWithOddsStrategy = PassWithOddsStrategy;
  root.DontPassStrategy = DontPassStrategy;
  root.Place68Strategy = Place68Strategy;
  root.IronCrossStrategy = IronCrossStrategy;
  root.MartingalePassStrategy = MartingalePassStrategy;
  root.ThreePointMollyStrategy = ThreePointMollyStrategy;
  root.ConservativeDontStrategy = ConservativeDontStrategy;
  root.Across135Strategy = Across135Strategy;
  root.HeatSeekerStrategy = HeatSeekerStrategy;
  root.ComeContinuouslyStrategy = ComeContinuouslyStrategy;
  root.PressRegressStrategy = PressRegressStrategy;
  root.LayStrategy = LayStrategy;
})(typeof self !== 'undefined' ? self : this);
