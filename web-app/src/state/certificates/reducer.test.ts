import reducer from './reducer';
import { addOptions, removeOptions, selectCertificate, addCertificate } from './actions';
import { CertificateState, CertificateOptions, Certificate } from '../../types';
import { CERTIFICATE_TYPES } from '../../constants';

test('certificate reducer: add options', () => {
  const initalState: CertificateState = {
    certificates: [],
    selected: undefined,
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
  expect(state.selected).toBeUndefined();
  expect(state.options).toBe(opts);
});

test('certificate reducer: remove options', () => {
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

  const initalState: CertificateState = {
    certificates: [],
    selected: undefined,
    options: opts,
  };

  const state = reducer(initalState, removeOptions());
  expect(state.certificates).toHaveLength(0);
  expect(state.selected).toBeUndefined();
  expect(state.options).toBeUndefined();
});

test('certificate reducer: select certificate', () => {
  const opts: CertificateOptions = {
    types: [
      {
        name: "ROOT_CA",
        active: true,
        createdAt: "some-date",
        updatedAt: "some-date",
      }
    ],
    algorithms: ["RSA"],
    formats: ["PEM"],
  }

  const initalState: CertificateState = {
    certificates: [],
    selected: undefined,
    options: opts,
  };

  const cert: Certificate = {
    id: "14597ed1-281f-495a-8366-4f8a411a20bc",
    name: "test root ca",
    body: "pem formated certificate body",
    subject: {
      commonName: "test root ca",
    },
    format: opts.formats[0],
    type: opts.types[0].name,
    accountId: "51f5435d-0841-4538-a484-7489257f6245",
    createdAt: "some-date",
  };

  const state = reducer(initalState, selectCertificate(cert));
  expect(state.certificates).toHaveLength(0);
  expect(state.selected).toBe(cert);
  expect(state.options).toBe(opts);
});

test('certificate reducer: add certificate', () => {
  const opts: CertificateOptions = {
    types: [
      {
        name: "ROOT_CA",
        active: true,
        createdAt: "some-date",
        updatedAt: "some-date",
      }
    ],
    algorithms: ["RSA"],
    formats: ["PEM"],
  }

  const initalState: CertificateState = {
    certificates: [],
    selected: undefined,
    options: opts,
  };

  const cert: Certificate = {
    id: "14597ed1-281f-495a-8366-4f8a411a20bc",
    name: "test root ca",
    body: "pem formated certificate body",
    subject: {
      commonName: "test root ca",
    },
    format: opts.formats[0],
    type: opts.types[0].name,
    accountId: "51f5435d-0841-4538-a484-7489257f6245",
    createdAt: "some-date",
  };

  const state = reducer(initalState, addCertificate(cert));
  expect(state.certificates).toHaveLength(1);
  expect(state.certificates[0]).toBe(cert);
  expect(state.selected).toBeUndefined;
  expect(state.options).toBe(opts);
});
