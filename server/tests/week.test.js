const { getWeekStart, weekKey } = require('../src/utils/week');

// November 2026: Mon 2nd, Sun 8th, Mon 9th
test('a Sunday belongs to the week that started the previous Monday', () => {
  expect(weekKey(new Date(2026, 10, 8, 20, 0))).toBe('2026-11-02');
});

test('a Monday starts a new week', () => {
  expect(weekKey(new Date(2026, 10, 9, 0, 30))).toBe('2026-11-09');
});

test('getWeekStart always returns a Monday', () => {
  for (let day = 1; day <= 14; day++) {
    expect(getWeekStart(new Date(2026, 10, day)).getDay()).toBe(1);
  }
});
