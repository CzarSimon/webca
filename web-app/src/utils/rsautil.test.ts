import { CERTIFICATE_TYPES } from '../constants';
import { suggestKeySize } from './rsautil';

interface TestCase {
  input: string;
  result: number;
}

test('suggestKeysize', () => {
  const { ROOT_CA, INTERMEDIATE_CA, CERTIFICATE } = CERTIFICATE_TYPES;

  const testCases: TestCase[] = [
    { input: CERTIFICATE, result: 2048 },
    { input: INTERMEDIATE_CA, result: 4096 },
    { input: ROOT_CA, result: 8192 },
  ];

  testCases.forEach((tc) => {
    const keySize = suggestKeySize(tc.input);
    expect(keySize).toBe(tc.result);
  });
});
