import { CERTIFICATE_TYPES } from '../constants';
import { suggestKeySize } from './rsautil';

interface TestCase {
  input: string;
  result: number;
}

test('suggestKeysize', () => {
  const { ROOT, INTERMEDIATE, USER_CERTIFICATE } = CERTIFICATE_TYPES;

  const testCases: TestCase[] = [
    { input: USER_CERTIFICATE, result: 2048 },
    { input: INTERMEDIATE, result: 4096 },
    { input: ROOT, result: 8192 },
  ];

  testCases.forEach((tc) => {
    const keySize = suggestKeySize(tc.input);
    expect(keySize).toBe(tc.result);
  });
});
