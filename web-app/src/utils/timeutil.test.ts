import { yearsToDays } from './timeutil';

interface TestCase {
  input: string | number;
  result: number;
}

test('yearsToDays', () => {
  const testCases: TestCase[] = [
    { input: 1, result: 365 },
    { input: 2, result: 730 },
    { input: '1', result: 365 },
    { input: '4', result: 1461 },
    { input: 'some wierd value', result: 365 },
  ];

  testCases.forEach((tc) => {
    const days = yearsToDays(tc.input);
    expect(days).toBe(tc.result);
  });
});
