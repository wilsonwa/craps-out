/* Engine rules tests. Run from the repo root:  node tests/engine.test.js */
'use strict';

var assert = require('node:assert');
var path = require('node:path');

global.self = global;
require(path.join(__dirname, '..', 'craps-engine.js'));

var CrapsGame = global.CrapsGame;
var K = global.CrapsConstants;

// ------------------------------------------------------------------
// Harness
// ------------------------------------------------------------------
var passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS  ' + name);
  } catch (err) {
    failed++;
    console.log('FAIL  ' + name);
    console.log('      ' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join('\n      ') : err));
  }
}

// Default (non-hard where possible) dice for each sum.
var EASY = { 2: [1, 1], 3: [1, 2], 4: [1, 3], 5: [1, 4], 6: [2, 4], 7: [3, 4], 8: [3, 5], 9: [4, 5], 10: [4, 6], 11: [5, 6], 12: [6, 6] };

/** Game with scripted dice: g.r(sum) rolls that sum (easy way), g.rd(a, b) rolls exact faces. */
function mk(balance, opts) {
  var queue = [];
  opts = opts || {};
  var o = {};
  Object.keys(opts).forEach(function (k) { o[k] = opts[k]; });
  o.randomFn = function () {
    if (!queue.length) throw new Error('scripted dice queue is empty');
    return (queue.shift() - 0.5) / 6;
  };
  var g = new CrapsGame(balance === undefined ? 1000 : balance, o);
  g.rd = function (a, b) { queue.push(a, b); return g.roll(); };
  g.r = function (sum) { var d = EASY[sum]; return g.rd(d[0], d[1]); };
  g.ok = function (type, amt, o2) {
    var res = g.placeBet(type, amt, o2);
    assert.ok(res.success, 'placeBet(' + type + ', ' + amt + ') failed: ' + res.message);
    return res;
  };
  g.no = function (type, amt, o2) {
    var res = g.placeBet(type, amt, o2);
    assert.ok(!res.success, 'placeBet(' + type + ', ' + amt + ') should have been rejected');
    return res;
  };
  return g;
}
function bal(g, expected) { assert.strictEqual(g.getBalance(), expected); }
function on(g, type) { return (g.getBets()[type] || []); }
function total(g, type) { return on(g, type).reduce(function (s, b) { return s + b.amount; }, 0); }
/** Establish a point with no bets riding on it (come-out roll of n). */
function point(g, n) { g.r(n); assert.strictEqual(g.getPoint(), n); }
function winOf(res, type) { return res.resolved.wins.filter(function (w) { return w.betType === type; })[0]; }
function lossOf(res, type) { return res.resolved.losses.filter(function (w) { return w.betType === type; })[0]; }
function pushOf(res, type) { return res.resolved.pushes.filter(function (w) { return w.betType === type; })[0]; }

// ------------------------------------------------------------------
// Basics
// ------------------------------------------------------------------
test('amounts must be whole dollars >= 1 and <= balance', function () {
  var g = mk(100);
  g.no('pass', 0); g.no('pass', 2.5); g.no('pass', -5); g.no('pass', NaN); g.no('pass', 101); g.no('pass', '10');
  g.no('bogus', 5);
  g.ok('pass', 100); bal(g, 0);
});

test('roll result shape: phase/point are after the roll, net/totalWon/totalLost', function () {
  var g = mk(100);
  g.ok('pass', 10); g.ok('field', 5);
  var res = g.r(6);
  assert.strictEqual(res.phase, 'point'); assert.strictEqual(res.point, 6);
  assert.strictEqual(res.outcome, K.Outcome.POINT_SET);
  assert.deepStrictEqual(res.dice, { die1: 2, die2: 4, sum: 6 });
  assert.strictEqual(res.net, -5); assert.strictEqual(res.totalLost, 5); assert.strictEqual(res.totalWon, 0);
  assert.ok(Array.isArray(res.returned));
});

// ------------------------------------------------------------------
// Pass / Don't pass
// ------------------------------------------------------------------
test('pass: come-out 7 and 11 win 1:1 and the bet rides', function () {
  var g = mk(100);
  g.ok('pass', 10);
  var res = g.r(7);
  var w = winOf(res, 'pass');
  assert.deepStrictEqual(w, { betType: 'pass', amount: 10, profit: 10, commission: 0, payout: 10, stays: true });
  bal(g, 100); assert.strictEqual(total(g, 'pass'), 10);
  g.r(11); bal(g, 110); assert.strictEqual(total(g, 'pass'), 10);
});

test('pass: come-out 2/3/12 lose', function () {
  [2, 3, 12].forEach(function (n) {
    var g = mk(100); g.ok('pass', 10); var res = g.r(n);
    assert.ok(lossOf(res, 'pass')); bal(g, 90); assert.strictEqual(total(g, 'pass'), 0);
  });
});

test('pass: point made wins 1:1 and rides; seven-out loses', function () {
  var g = mk(100);
  g.ok('pass', 10); g.r(8); g.r(5);
  bal(g, 90); assert.strictEqual(total(g, 'pass'), 10);
  var res = g.r(8);
  assert.strictEqual(res.outcome, K.Outcome.POINT_HIT);
  assert.strictEqual(winOf(res, 'pass').payout, 10); bal(g, 100); assert.strictEqual(total(g, 'pass'), 10);
  g.r(4); g.r(7); bal(g, 100); assert.strictEqual(total(g, 'pass'), 0);
});

test('pass: only on come-out; removable on come-out, locked on point', function () {
  var g = mk(100);
  g.ok('pass', 10);
  assert.strictEqual(g.canRemove('pass'), true);
  g.r(6);
  g.no('pass', 5);
  assert.strictEqual(g.canPlace('pass').valid, false);
  assert.strictEqual(g.canRemove('pass'), false);
  var rm = g.removeBet('pass');
  assert.strictEqual(rm.success, false); bal(g, 90);
  g.r(6); // point made, pass rides into come-out
  assert.strictEqual(g.canRemove('pass'), true);
  rm = g.removeBet('pass'); assert.strictEqual(rm.success, true); assert.strictEqual(rm.refund, 10); bal(g, 110);
});

test("dont-pass: come-out 2/3 win and ride, 12 pushes (stays, no money), 7/11 lose", function () {
  var g = mk(100);
  g.ok('dont-pass', 10);
  g.r(2); bal(g, 100); assert.strictEqual(total(g, 'dont-pass'), 10);
  g.r(3); bal(g, 110);
  var res = g.r(12);
  var p = pushOf(res, 'dont-pass');
  assert.deepStrictEqual(p, { betType: 'dont-pass', amount: 10, returned: false });
  bal(g, 110); assert.strictEqual(total(g, 'dont-pass'), 10); assert.strictEqual(res.net, 0);
  g.r(11); bal(g, 110); assert.strictEqual(total(g, 'dont-pass'), 0);
  g.ok('dont-pass', 10); g.r(7); bal(g, 100);
});

test("dont-pass: point phase 7 wins and rides; point loses; removable any time", function () {
  var g = mk(100);
  g.ok('dont-pass', 10); g.r(4);
  assert.strictEqual(g.canRemove('dont-pass'), true);
  var res = g.r(7);
  assert.strictEqual(winOf(res, 'dont-pass').stays, true);
  bal(g, 100); assert.strictEqual(total(g, 'dont-pass'), 10);
  g.r(9); g.r(9); bal(g, 100); assert.strictEqual(total(g, 'dont-pass'), 0);
  g.ok('dont-pass', 10); g.r(5);
  g.no('dont-pass', 10);
  var rm = g.removeBet('dont-pass'); assert.strictEqual(rm.success, true); bal(g, 100);
});

// ------------------------------------------------------------------
// Come / Don't come
// ------------------------------------------------------------------
test('come: only in point phase; flat 7/11 wins and comes down; 2/3/12 lose', function () {
  var g = mk(100);
  g.no('come', 5);
  assert.strictEqual(g.canPlace('come').valid, false);
  point(g, 6);
  g.ok('come', 10); var res = g.r(11);
  assert.deepStrictEqual(winOf(res, 'come'), { betType: 'come', amount: 10, profit: 10, commission: 0, payout: 20, stays: false });
  bal(g, 110); assert.strictEqual(total(g, 'come'), 0);
  g.ok('come', 10); g.r(3); bal(g, 100);
  g.ok('come', 10); g.r(12); bal(g, 90);
  g.ok('come', 10); g.r(7); bal(g, 100); // seven-out: flat come wins
});

test('come: travels to the number, wins 1:1 on it and comes down, 7 loses; locked on a number', function () {
  var g = mk(100);
  point(g, 6);
  g.ok('come', 10);
  assert.strictEqual(g.canRemove('come'), true);
  g.r(5);
  assert.deepStrictEqual(on(g, 'come'), [{ amount: 10, point: 5, working: true }]);
  assert.strictEqual(g.canRemove('come'), false);
  assert.strictEqual(g.removeBet('come').success, false);
  var res = g.r(5);
  var w = winOf(res, 'come'); assert.strictEqual(w.point, 5); assert.strictEqual(w.payout, 20);
  bal(g, 110); assert.strictEqual(total(g, 'come'), 0);
  g.ok('come', 10); g.r(9); res = g.r(7);
  assert.strictEqual(lossOf(res, 'come').point, 9); bal(g, 100);
});

test('come: a come bet on a number keeps working on the come-out roll', function () {
  var g = mk(100);
  point(g, 6); g.ok('come', 10); g.r(5); g.r(6); // point made -> come-out, come still on 5
  assert.strictEqual(g.getPhase(), 'come-out');
  g.r(5); bal(g, 110);
  g = mk(100); point(g, 6); g.ok('come', 10); g.r(5); g.r(6);
  g.r(7); bal(g, 90);
});

test("dont-come: flat 7/11 lose, 2/3 win and come down, 12 push stays", function () {
  var g = mk(100);
  point(g, 8);
  g.ok('dont-come', 10); g.r(11); bal(g, 90);
  g.ok('dont-come', 10); var res = g.r(3);
  assert.strictEqual(winOf(res, 'dont-come').payout, 20); bal(g, 100); assert.strictEqual(total(g, 'dont-come'), 0);
  g.ok('dont-come', 10); res = g.r(12);
  assert.deepStrictEqual(pushOf(res, 'dont-come'), { betType: 'dont-come', amount: 10, returned: false });
  bal(g, 90); assert.deepStrictEqual(on(g, 'dont-come'), [{ amount: 10, point: null, working: true }]);
});

test("dont-come: travels, 7 wins and comes down, the number loses; removable any time", function () {
  var g = mk(100);
  point(g, 8);
  g.ok('dont-come', 10); g.r(4);
  assert.strictEqual(on(g, 'dont-come')[0].point, 4);
  assert.strictEqual(g.canRemove('dont-come', 4), true);
  var res = g.r(7);
  assert.strictEqual(winOf(res, 'dont-come').point, 4); bal(g, 110); assert.strictEqual(total(g, 'dont-come'), 0);
  point(g, 8); g.ok('dont-come', 10); g.r(4); g.r(4); bal(g, 100);
  g.ok('dont-come', 10); g.r(9);
  var rm = g.removeBet('dont-come', { point: 9 }); assert.strictEqual(rm.refund, 10); bal(g, 100);
});

// ------------------------------------------------------------------
// Odds
// ------------------------------------------------------------------
test('pass-odds: needs pass + point; true odds; paid and comes down; flat rides', function () {
  var g = mk(1000);
  g.no('pass-odds', 10);
  g.ok('pass', 10); g.no('pass-odds', 10);
  point(g, 4);
  g.ok('pass-odds', 20);
  var res = g.r(4);
  var w = winOf(res, 'pass-odds');
  assert.strictEqual(w.profit, 40); assert.strictEqual(w.payout, 60); assert.strictEqual(w.stays, false);
  bal(g, 1000 - 10 - 20 + 10 + 60);
  assert.strictEqual(total(g, 'pass-odds'), 0); assert.strictEqual(total(g, 'pass'), 10);
});

test('pass-odds: 3:2 on 5/9, 6:5 on 6/8, lose on 7, removable', function () {
  var g = mk(1000); g.ok('pass', 10); point(g, 9); g.ok('pass-odds', 20); g.r(9); bal(g, 1000 - 30 + 10 + 50);
  g = mk(1000); g.ok('pass', 10); point(g, 8); g.ok('pass-odds', 20); g.r(8); bal(g, 1000 - 30 + 10 + 44);
  g = mk(1000); g.ok('pass', 10); point(g, 6); g.ok('pass-odds', 20); g.r(7); bal(g, 970);
  g = mk(1000); g.ok('pass', 10); point(g, 6); g.ok('pass-odds', 20);
  assert.strictEqual(g.canRemove('pass-odds'), true);
  assert.strictEqual(g.removeBet('pass-odds').refund, 20); bal(g, 990);
});

test('cents: $25 pass-odds on 5 pays $37.50', function () {
  var g = mk(1000); g.ok('pass', 25); point(g, 5); g.ok('pass-odds', 25);
  var res = g.r(5);
  assert.strictEqual(winOf(res, 'pass-odds').profit, 37.5);
  bal(g, 1000 - 50 + 25 + 62.5);
});

test('odds limit: default 2x, custom multiple, getOddsInfo', function () {
  var g = mk(1000);
  g.ok('pass', 10); point(g, 6);
  assert.deepStrictEqual(g.getOddsInfo('pass-odds'), { flat: 10, current: 0, max: 20, remaining: 20, ratio: [6, 5] });
  var r = g.no('pass-odds', 21);
  assert.ok(/limit/i.test(r.message));
  g.ok('pass-odds', 15); g.no('pass-odds', 6); g.ok('pass-odds', 5);
  assert.deepStrictEqual(g.getOddsInfo('pass-odds'), { flat: 10, current: 20, max: 20, remaining: 0, ratio: [6, 5] });
  assert.strictEqual(g.canPlace('pass-odds').valid, false);
  var g2 = mk(1000, { maxOddsMultiple: 5 }); g2.ok('pass', 10); point(g2, 6); g2.ok('pass-odds', 50); g2.no('pass-odds', 1);
  assert.strictEqual(mk(1000).getOddsInfo('pass-odds'), null);
});

test('odds limit: come-odds per come point; dont odds limited by amount won', function () {
  var g = mk(1000);
  point(g, 8);
  g.ok('come', 10); g.r(4); g.ok('come', 5); g.r(9);
  g.no('come-odds', 10); // two come points, no point given
  assert.strictEqual(g.canPlace('come-odds').valid, true);
  assert.deepStrictEqual(g.getOddsInfo('come-odds', 4), { flat: 10, current: 0, max: 20, remaining: 20, ratio: [2, 1] });
  g.no('come-odds', 21, { point: 4 }); g.ok('come-odds', 20, { point: 4 });
  g.no('come-odds', 11, { point: 9 }); g.ok('come-odds', 10, { point: 9 });
  g.no('come-odds', 5, { point: 6 });
  // dont-pass odds: flat 10 on point 4 -> may win 20 -> lay up to 40
  var d = mk(1000); d.ok('dont-pass', 10); point(d, 4);
  d.no('dont-pass-odds', 41); d.ok('dont-pass-odds', 40);
  var d2 = mk(1000); d2.ok('dont-pass', 10); point(d2, 6); // 5:6 -> lay up to 24 to win 20
  d2.no('dont-pass-odds', 25); d2.ok('dont-pass-odds', 24);
  var d3 = mk(1000); point(d3, 6); d3.ok('dont-come', 10); d3.r(9); // 2:3 -> lay up to 30
  d3.no('dont-come-odds', 31, { point: 9 }); d3.ok('dont-come-odds', 30, { point: 9 });
});

test('come-odds: point phase win comes down, 7 loses', function () {
  var g = mk(1000); point(g, 8); g.ok('come', 10); g.r(5); g.ok('come-odds', 20);
  var res = g.r(5);
  var w = winOf(res, 'come-odds'); assert.strictEqual(w.point, 5); assert.strictEqual(w.profit, 30); assert.strictEqual(w.payout, 50);
  bal(g, 1000 - 30 + 20 + 50); assert.strictEqual(total(g, 'come-odds'), 0);
  g = mk(1000); point(g, 8); g.ok('come', 10); g.r(5); g.ok('come-odds', 20); g.r(7); bal(g, 970);
});

test('come-odds: off on come-out, returned on a come-out 7', function () {
  var g = mk(1000); point(g, 8); g.ok('come', 10); g.r(5); g.ok('come-odds', 20); g.r(8);
  assert.strictEqual(g.getPhase(), 'come-out');
  assert.strictEqual(g.isWorking('come-odds', 5), false);
  var res = g.r(7);
  assert.ok(lossOf(res, 'come'));
  assert.deepStrictEqual(pushOf(res, 'come-odds'), { betType: 'come-odds', amount: 20, point: 5, returned: true });
  bal(g, 1000 - 10); assert.strictEqual(res.net, -10);
});

test('come-odds: off on come-out, returned when the come number hits on come-out', function () {
  var g = mk(1000); point(g, 8); g.ok('come', 10); g.r(5); g.ok('come-odds', 20); g.r(8);
  var res = g.r(5); // come-out roll of 5: sets point 5, come bet on 5 wins
  assert.strictEqual(winOf(res, 'come').payout, 20);
  assert.strictEqual(pushOf(res, 'come-odds').returned, true);
  assert.ok(!winOf(res, 'come-odds'));
  bal(g, 1010); assert.strictEqual(total(g, 'come-odds'), 0);
  // Other come-out numbers: odds stay
  g = mk(1000); point(g, 8); g.ok('come', 10); g.r(5); g.ok('come-odds', 20); g.r(8); g.r(9);
  assert.strictEqual(total(g, 'come-odds'), 20);
});

test("dont odds: lay pays 1:2 / 2:3 / 5:6 on 7 and comes down, number loses, always working", function () {
  var g = mk(1000); g.ok('dont-pass', 10); point(g, 4); g.ok('dont-pass-odds', 40);
  var res = g.r(7);
  assert.strictEqual(winOf(res, 'dont-pass-odds').profit, 20); assert.strictEqual(winOf(res, 'dont-pass-odds').payout, 60);
  bal(g, 1000 - 50 + 10 + 60); assert.strictEqual(total(g, 'dont-pass-odds'), 0);
  g = mk(1000); g.ok('dont-pass', 10); point(g, 6); g.ok('dont-pass-odds', 24); g.r(6); bal(g, 966);
  // dont-come odds work on the come-out roll
  g = mk(1000); point(g, 8); g.ok('dont-come', 10); g.r(9); g.ok('dont-come-odds', 30); g.r(8);
  assert.strictEqual(g.getPhase(), 'come-out');
  res = g.r(7);
  assert.strictEqual(winOf(res, 'dont-come-odds').profit, 20);
  bal(g, 1000 + 10 + 20);
});

test("removing a dont flat takes its odds down too", function () {
  var g = mk(1000); g.ok('dont-pass', 10); point(g, 4); g.ok('dont-pass-odds', 40);
  var rm = g.removeBet('dont-pass'); assert.strictEqual(rm.refund, 50); bal(g, 1000);
  assert.strictEqual(total(g, 'dont-pass-odds'), 0);
});

// ------------------------------------------------------------------
// Place
// ------------------------------------------------------------------
test('place: placeable either phase; off on come-out; pays 9:5 / 7:5 / 7:6', function () {
  var g = mk(1000);
  g.ok('place-6', 12);
  assert.strictEqual(g.isWorking('place-6'), false);
  var res = g.r(6); // come-out 6 -> point 6: place-6 has no action (then returned)
  assert.strictEqual(res.resolved.wins.length + res.resolved.losses.length, 0);
  g = mk(1000); g.ok('place-6', 12);
  res = g.r(8); // come-out 8 -> point 8, place-6 no action, stays
  assert.strictEqual(res.resolved.wins.length + res.resolved.losses.length, 0);
  g = mk(1000); g.ok('place-6', 12); g.r(7); bal(g, 988); assert.strictEqual(total(g, 'place-6'), 12); // come-out 7: no action
  g = mk(1000); point(g, 8); g.ok('place-4', 5); res = g.r(4); assert.strictEqual(winOf(res, 'place-4').profit, 9);
  g = mk(1000); point(g, 8); g.ok('place-5', 5); res = g.r(5); assert.strictEqual(winOf(res, 'place-5').profit, 7);
  g = mk(1000); point(g, 8); g.ok('place-6', 6); res = g.r(6); assert.strictEqual(winOf(res, 'place-6').profit, 7);
  g = mk(1000); point(g, 8); g.ok('place-10', 5); g.r(7); bal(g, 995);
});

test('place: a win pays the winnings only and the bet stays up until a 7', function () {
  var g = mk(1000); point(g, 8); g.ok('place-6', 24); bal(g, 976);
  var res = g.r(6);
  assert.deepStrictEqual(winOf(res, 'place-6'), { betType: 'place-6', amount: 24, profit: 28, commission: 0, payout: 28, stays: true });
  bal(g, 1004); assert.strictEqual(total(g, 'place-6'), 24);
  res = g.r(6);
  assert.strictEqual(winOf(res, 'place-6').payout, 28);
  bal(g, 1032); assert.strictEqual(total(g, 'place-6'), 24);
  res = g.r(7);
  assert.strictEqual(lossOf(res, 'place-6').amount, 24);
  bal(g, 1032); assert.strictEqual(total(g, 'place-6'), 0);
});

test('cents: $25 place 6 pays $29.16', function () {
  var g = mk(1000); point(g, 8); g.ok('place-6', 25);
  var res = g.r(6);
  assert.strictEqual(winOf(res, 'place-6').profit, 29.16);
  bal(g, 1000 - 25 + 29.16); assert.strictEqual(total(g, 'place-6'), 25);
});

test('place/buy returned when the number becomes the point', function () {
  var g = mk(1000); g.ok('place-6', 12); g.ok('buy-6', 20); g.ok('place-8', 12);
  var res = g.r(6);
  assert.deepStrictEqual(res.returned, [{ betType: 'place-6', amount: 12 }, { betType: 'buy-6', amount: 20 }]);
  bal(g, 988); assert.strictEqual(total(g, 'place-6'), 0); assert.strictEqual(total(g, 'place-8'), 12);
  assert.strictEqual(res.net, 0);
});

// ------------------------------------------------------------------
// Buy / Lay
// ------------------------------------------------------------------
test('buy: no commission at placement; true odds less 5% of bet on a win; stays', function () {
  var g = mk(1000); point(g, 8); g.ok('buy-4', 20); bal(g, 980);
  var res = g.r(4);
  assert.deepStrictEqual(winOf(res, 'buy-4'), { betType: 'buy-4', amount: 20, profit: 39, commission: 1, payout: 39, stays: true });
  bal(g, 1019); assert.strictEqual(total(g, 'buy-4'), 20);
  g = mk(1000); point(g, 8); g.ok('buy-5', 25); res = g.r(5);
  assert.strictEqual(winOf(res, 'buy-5').profit, 36.25); assert.strictEqual(winOf(res, 'buy-5').commission, 1.25);
  bal(g, 1011.25);
});

test('buy: off on come-out; 7 loses; undo refunds exactly the bet', function () {
  var g = mk(1000); g.ok('buy-10', 20); g.r(4); // come-out: point 4, buy-10 no action
  assert.strictEqual(total(g, 'buy-10'), 20);
  g.r(7); bal(g, 980);
  g = mk(1000); g.ok('buy-6', 30); bal(g, 970);
  var u = g.undoLastBet(); assert.strictEqual(u.refund, 30); bal(g, 1000);
  g = mk(1000); g.ok('buy-6', 30); g.r(7); bal(g, 970); assert.strictEqual(total(g, 'buy-6'), 30);
});

test('lay: no commission at placement; 1:2 / 2:3 / 5:6 less 5% of the win; stays; number loses', function () {
  var g = mk(1000); point(g, 8); g.ok('lay-4', 40); bal(g, 960);
  var res = g.r(7);
  assert.deepStrictEqual(winOf(res, 'lay-4'), { betType: 'lay-4', amount: 40, profit: 19, commission: 1, payout: 19, stays: true });
  bal(g, 979); assert.strictEqual(total(g, 'lay-4'), 40);
  g = mk(1000); point(g, 8); g.ok('lay-9', 30); res = g.r(7);
  assert.strictEqual(winOf(res, 'lay-9').profit, 19); bal(g, 989);
  g = mk(1000); point(g, 8); g.ok('lay-6', 25); res = g.r(7); // win 20.83, vig 1.04
  assert.strictEqual(winOf(res, 'lay-6').profit, 19.79); assert.strictEqual(winOf(res, 'lay-6').commission, 1.04);
  bal(g, 994.79);
  g = mk(1000); point(g, 8); g.ok('lay-5', 30); g.r(5); bal(g, 970); assert.strictEqual(total(g, 'lay-5'), 0);
});

test('lay works on the come-out roll', function () {
  var g = mk(1000); g.ok('lay-10', 40);
  assert.strictEqual(g.isWorking('lay-10'), true);
  g.r(7); bal(g, 979);
  g.r(10); bal(g, 979); assert.strictEqual(total(g, 'lay-10'), 0);
});

// ------------------------------------------------------------------
// Big 6/8, Hardways
// ------------------------------------------------------------------
test('big 6/8: 1:1, stay, lose on 7, work on come-out', function () {
  var g = mk(1000); g.ok('big-6', 10); g.ok('big-8', 10);
  var res = g.r(6); // come-out
  assert.strictEqual(winOf(res, 'big-6').payout, 10); assert.strictEqual(winOf(res, 'big-6').stays, true);
  bal(g, 990); assert.strictEqual(total(g, 'big-6'), 10);
  g.r(7); bal(g, 990); assert.strictEqual(total(g, 'big-6'), 0); assert.strictEqual(total(g, 'big-8'), 0);
});

test('hardways: 7:1 / 9:1 on the hard way, stay; lose on easy way or 7; work on come-out', function () {
  var g = mk(1000); g.ok('hard-4', 5); g.ok('hard-8', 5);
  var res = g.rd(2, 2); // come-out hard 4
  assert.strictEqual(winOf(res, 'hard-4').profit, 35); assert.strictEqual(winOf(res, 'hard-4').stays, true);
  res = g.rd(4, 4);
  assert.strictEqual(winOf(res, 'hard-8').profit, 45);
  bal(g, 990 + 35 + 45);
  g.rd(1, 3); assert.strictEqual(total(g, 'hard-4'), 0);
  g.r(7); assert.strictEqual(total(g, 'hard-8'), 0);
  bal(g, 1070);
  g = mk(1000); g.ok('hard-6', 10); g.r(6); bal(g, 990); // easy 6 on come-out loses
});

// ------------------------------------------------------------------
// Working toggle
// ------------------------------------------------------------------
test('working toggle: off bets have no action; setWorking / setAllWorking', function () {
  var g = mk(1000); point(g, 8);
  g.ok('place-6', 12); g.ok('hard-10', 5); g.ok('lay-4', 40);
  var t = g.toggleWorking('place-6');
  assert.strictEqual(t.success, true); assert.strictEqual(t.working, false);
  assert.strictEqual(g.isWorking('place-6'), false);
  assert.strictEqual(on(g, 'place-6')[0].working, false);
  g.r(6); bal(g, 943); assert.strictEqual(total(g, 'place-6'), 12);
  g.ok('place-6', 6); assert.strictEqual(on(g, 'place-6')[1].working, false); // joins the off state
  assert.strictEqual(g.setWorking('place-6', true).working, true);
  assert.strictEqual(g.setAllWorking(false), 3);
  assert.strictEqual(g.setAllWorking(false), 0);
  var res = g.r(7); // seven-out: nothing toggled off is touched
  assert.strictEqual(res.resolved.wins.length + res.resolved.losses.length, 0);
  bal(g, 937); assert.strictEqual(g.getTotalAtRisk(), 18 + 5 + 40);
  assert.strictEqual(g.toggleWorking('pass').success, false);
  assert.strictEqual(g.toggleWorking('place-9').success, false);
  assert.strictEqual(g.setAllWorking(true), 3);
  assert.strictEqual(g.isWorking('place-6'), false); // on, but come-out
  assert.strictEqual(g.isWorking('lay-4'), true);
  res = g.r(7); assert.ok(winOf(res, 'lay-4')); assert.strictEqual(total(g, 'place-6'), 18);
});

// ------------------------------------------------------------------
// One-roll bets
// ------------------------------------------------------------------
test('field: 3/4/9/10/11 1:1, 2 pays 2:1, 12 pays 3:1, 5/6/7/8 lose; comes down', function () {
  [[3, 20], [4, 20], [9, 20], [10, 20], [11, 20], [2, 30], [12, 40], [5, 0], [6, 0], [7, 0], [8, 0]].forEach(function (c) {
    var g = mk(100); g.ok('field', 10); g.r(c[0]);
    bal(g, 90 + c[1]); assert.strictEqual(total(g, 'field'), 0);
  });
});

test('any-seven 4:1, any-craps 7:1, horn 30:1 / 15:1; all one-roll', function () {
  var g = mk(100); g.ok('any-seven', 5); g.r(7); bal(g, 120);
  g = mk(100); g.ok('any-seven', 5); g.r(6); bal(g, 95); assert.strictEqual(total(g, 'any-seven'), 0);
  [2, 3, 12].forEach(function (n) { var h = mk(100); h.ok('any-craps', 5); h.r(n); bal(h, 135); });
  g = mk(100); g.ok('any-craps', 5); g.r(11); bal(g, 95);
  [['horn-2', 2, 250], ['horn-12', 12, 250], ['horn-3', 3, 175], ['horn-11', 11, 175]].forEach(function (c) {
    var h = mk(100); h.ok(c[0], 5); h.r(c[1]); bal(h, c[2]);
    h = mk(100); h.ok(c[0], 5); h.r(7); bal(h, 95); assert.strictEqual(total(h, c[0]), 0);
  });
});

// ------------------------------------------------------------------
// Bonus bets
// ------------------------------------------------------------------
test('bonus: placement window is come-out with no roll since the last 7', function () {
  var g = mk(1000);
  assert.strictEqual(g.getGameState().rollsSinceSeven, 0);
  assert.strictEqual(g.canPlace('small').valid, true);
  g.r(11); // come-out 11: still come-out, but a roll has happened since the start
  assert.strictEqual(g.getGameState().rollsSinceSeven, 1);
  g.no('small', 5); assert.strictEqual(g.canPlace('all').valid, false);
  g.r(7);
  assert.strictEqual(g.getGameState().rollsSinceSeven, 0);
  g.ok('tall', 5);
  g.r(6); g.no('all', 5);
  g.r(6); assert.strictEqual(g.getPhase(), 'come-out'); g.no('all', 5); // point made: window stays shut
  g.r(4); g.r(7); g.ok('all', 5); // seven-out reopens it
});

test('bonus: need shrinks, win pays 30:1 / 150:1 and comes down', function () {
  var g = mk(1000); g.ok('small', 10);
  assert.deepStrictEqual(on(g, 'small')[0].need, [2, 3, 4, 5, 6]);
  g.r(2); g.r(3); g.r(4); g.r(9);
  assert.deepStrictEqual(on(g, 'small')[0].need, [5, 6]);
  g.r(5); var res = g.r(6);
  var w = winOf(res, 'small'); assert.strictEqual(w.profit, 300); assert.strictEqual(w.payout, 310);
  assert.strictEqual(total(g, 'small'), 0);
  bal(g, 1300);
  g = mk(1000); g.ok('all', 1);
  [2, 3, 4, 5, 6, 8, 9, 10, 11].forEach(function (n) { g.r(n); });
  res = g.r(12); assert.strictEqual(winOf(res, 'all').payout, 151); bal(g, 1150);
});

test('bonus: any 7 loses; not removable once rolled', function () {
  var g = mk(1000); g.ok('tall', 10); g.ok('small', 10);
  assert.strictEqual(g.canRemove('tall'), true);
  g.r(8);
  assert.strictEqual(g.canRemove('tall'), false); assert.strictEqual(g.removeBet('tall').success, false);
  g.r(7); bal(g, 980); assert.strictEqual(total(g, 'tall') + total(g, 'small'), 0);
});

// ------------------------------------------------------------------
// Undo / clear / repeat
// ------------------------------------------------------------------
test('undo: LIFO since the last roll only', function () {
  var g = mk(1000); g.ok('pass', 10); g.ok('field', 5); g.ok('place-6', 6);
  assert.strictEqual(g.undoLastBet().betType, 'place-6'); bal(g, 985);
  g.r(4);
  assert.strictEqual(g.undoLastBet().success, false);
  g.ok('pass-odds', 20); g.removeBet('pass-odds');
  assert.strictEqual(g.undoLastBet().success, false); // already taken down
  bal(g, 1000 - 10 + 5); // field won 1:1 on the 4
});

test('clearRemovableBets: keeps locked bets, refunds the rest', function () {
  var g = mk(1000);
  g.ok('pass', 10); g.ok('small', 5); point(g, 8);
  g.ok('come', 10); g.r(5); // come on 5 (locked)
  g.ok('come', 10); g.ok('place-6', 12); g.ok('pass-odds', 20); g.ok('come-odds', 10, { point: 5 }); g.ok('field', 5);
  var before = g.getBalance();
  var res = g.clearRemovableBets();
  assert.strictEqual(res.refund, 10 + 12 + 20 + 10 + 5);
  bal(g, before + 57);
  var bets = g.getBets();
  assert.deepStrictEqual(Object.keys(bets).sort(), ['come', 'pass', 'small']);
  assert.deepStrictEqual(bets.come, [{ amount: 10, point: 5, working: true }]);
});

test('removeBet with a point removes only that point', function () {
  var g = mk(1000); point(g, 8);
  g.ok('come', 10); g.r(5); g.ok('come', 10); g.r(9);
  g.ok('come-odds', 10, { point: 5 }); g.ok('come-odds', 10, { point: 9 });
  var r = g.removeBet('come-odds', { point: 9 }); assert.strictEqual(r.refund, 10);
  assert.deepStrictEqual(on(g, 'come-odds').map(function (b) { return b.point; }), [5]);
  r = g.removeBet('come-odds', { point: 6 }); assert.strictEqual(r.success, false);
});

test('repeatBets: top-up semantics, skips illegal, no pointed come bets or odds', function () {
  var g = mk(1000);
  g.ok('pass', 10); point(g, 8);
  g.ok('pass-odds', 20); g.ok('place-6', 12); g.ok('come', 10); g.ok('field', 5);
  g.r(6); // place-6 wins & stays up, come travels to 6, field loses
  var res = g.repeatBets();
  // pass and place-6 (still up) -> nothing; come flat 10 (pointed one ignored); field 5; odds never
  assert.strictEqual(res.placed, 2); assert.strictEqual(res.skipped, 0); assert.strictEqual(res.amount, 15);
  assert.strictEqual(total(g, 'place-6'), 12); assert.strictEqual(total(g, 'field'), 5);
  assert.strictEqual(total(g, 'pass-odds'), 20);
  assert.deepStrictEqual(on(g, 'come').map(function (b) { return b.point; }).sort(), [6, null].sort());
  // nothing short now
  var again = g.repeatBets(); assert.strictEqual(again.placed, 0); assert.strictEqual(again.success, false);
  // Seven-out then repeat on come-out: come is illegal -> skipped; pass and place-6 re-placed
  g.r(7);
  res = g.repeatBets();
  assert.strictEqual(total(g, 'pass'), 10); assert.strictEqual(total(g, 'place-6'), 12); assert.ok(res.skipped >= 1);
  assert.strictEqual(total(g, 'come'), 0);
});

test('repeatBets: skips what is unaffordable', function () {
  var g = mk(30); g.ok('field', 25); g.r(5); // lose -> balance 5
  var res = g.repeatBets(); assert.strictEqual(res.placed, 0); assert.strictEqual(res.skipped, 1); bal(g, 5);
});

test('put: removable/undoable before its first roll, locked after', function () {
  var g = mk(1000); point(g, 8);
  g.ok('put', 10);
  assert.strictEqual(g.canRemove('put'), true);
  assert.strictEqual(g.undoLastBet().refund, 10); bal(g, 1000);
  g.ok('put', 10);
  var rm = g.removeBet('put'); assert.strictEqual(rm.success, true); bal(g, 1000);
  g.ok('put', 10); g.r(5);
  assert.strictEqual(g.canRemove('put'), false);
  assert.strictEqual(g.removeBet('put').success, false);
  g.clearRemovableBets(); assert.strictEqual(total(g, 'put'), 10); bal(g, 990);
  var res = g.r(8); assert.strictEqual(winOf(res, 'put').payout, 20); bal(g, 1010);
});

test('history is capped at the most recent 200 rolls', function () {
  var g = mk(1000);
  for (var i = 0; i < 250; i++) g.r(i % 2 ? 3 : 2); // craps on come-out forever: phase never changes
  var h = g.getHistory();
  assert.strictEqual(h.length, 200);
  assert.strictEqual(g.getGameState().history.length, 200);
  assert.strictEqual(g.getGameState().totalRolls, 250);
  assert.strictEqual(h[199].sum, 3); assert.strictEqual(h[0].sum, 2); // oldest kept is roll #51 (index 50 -> sum 2)
  g.reset(); assert.strictEqual(g.getHistory().length, 0);
});

test('reset restores balance, phase and rollsSinceSeven', function () {
  var g = mk(500); g.ok('pass', 10); g.r(6);
  g.reset();
  bal(g, 500); assert.strictEqual(g.getPhase(), 'come-out'); assert.strictEqual(g.getGameState().rollsSinceSeven, 0);
  assert.deepStrictEqual(g.getBets(), {}); assert.strictEqual(g._initialBalance, 500);
});

// ------------------------------------------------------------------
// Fuzz invariant
// ------------------------------------------------------------------
test('fuzz: 20,000 random rolls keep balance + at-risk consistent with net', function () {
  var types = Object.keys(K.BetType).map(function (k) { return K.BetType[k]; });
  var rng = K.createSeededRandom(12345);
  var opts = [{}, { maxOddsMultiple: 3 }];
  var g = new CrapsGame(2000, opts[0]);
  for (var i = 0; i < 20000; i++) {
    if (i % 2500 === 0) g = new CrapsGame(2000, opts[(i / 2500) % 2]); // keeps history arrays small
    var tries = Math.floor(rng() * 4);
    for (var t = 0; t < tries; t++) {
      var type = types[Math.floor(rng() * types.length)];
      var amt = 1 + Math.floor(rng() * 25);
      var o;
      if (type === 'come-odds' || type === 'dont-come-odds') {
        var src = g.getBets()[type === 'come-odds' ? 'come' : 'dont-come'] || [];
        var pts = src.filter(function (b) { return b.point !== null; });
        if (pts.length) o = { point: pts[Math.floor(rng() * pts.length)].point };
      }
      g.placeBet(type, amt, o);
    }
    var r = rng();
    if (r < 0.03) g.undoLastBet();
    else if (r < 0.05) g.clearRemovableBets();
    else if (r < 0.08) g.repeatBets();
    else if (r < 0.10) g.setAllWorking(rng() < 0.5);
    var before = g.getBalance() + g.getTotalAtRisk();
    var res = g.roll(); // Math.random dice
    var after = g.getBalance() + g.getTotalAtRisk();
    var delta = Math.round((after - before) * 100) / 100 + 0; // normalise -0
    assert.ok(Number.isFinite(g.getBalance()), 'balance NaN at roll ' + i);
    assert.ok(g.getBalance() >= 0, 'negative balance at roll ' + i);
    assert.strictEqual(Math.round(g.getBalance() * 100) / 100, g.getBalance(), 'balance not in cents at roll ' + i);
    assert.strictEqual(delta, res.net, 'net mismatch at roll ' + i + ': delta ' + delta + ' vs net ' + res.net);
  }
});

console.log('\n' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
process.exit(failed ? 1 : 0);
