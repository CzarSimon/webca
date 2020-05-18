import reducer from './reducer';
import { addOptions } from './actions';
import { CertificateState, CertificateOptions } from '../../types';

test('certificate reducer: add options', () => {
  const initalState: CertificateState = {
    certificates: [],
    options: undefined,
  };

  const opts: CertificateOptions = {
    types: [
      {
        name: "ROOT_CA",
        active: true,
        createdAt: "some-date",
        updatedAt: "some-date",
      },
      {
        name: "INTERMEDIATE_CA",
        active: true,
        createdAt: "some-date",
        updatedAt: "some-date",
      },
      {
        name: "CERTIFICATE",
        active: true,
        createdAt: "some-date",
        updatedAt: "some-date",
      }
    ],
    algorithms: ["RSA"],
    formats: ["PEM"],
  }

  const state = reducer(initalState, addOptions(opts));
  expect(state.certificates).toHaveLength(0);
  expect(state.options).toBe(opts);
});
