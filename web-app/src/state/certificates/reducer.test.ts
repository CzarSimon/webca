import reducer from './reducer';
import {
  addOptions,
  addCertificates,
  removeOptions,
  selectCertificate,
  removeCertificates,
  deselectCertificate,
  addSigningCertificates,
  removeSigningCertificates,
} from './actions';
import { CertificateState, CertificateOptions, Certificate, Page } from '../../types';

test('certificate reducer: add options', () => {
  const initalState: CertificateState = {
    certificates: {
      items: undefined,
      loaded: false,
    },
    selected: {},
    options: undefined,
    signatories: {
      certificates: [],
      loaded: false,
    },
  };

  const opts: CertificateOptions = {
    types: [
      {
        name: 'ROOT_CA',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
      {
        name: 'INTERMEDIATE_CA',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
      {
        name: 'CERTIFICATE',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
    ],
    algorithms: ['RSA'],
    formats: ['PEM'],
  };

  const state = reducer(initalState, addOptions(opts));
  expect(state.certificates.items).toBeUndefined();
  expect(state.certificates.loaded).toBeFalsy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBe(opts);
  expect(state.signatories).toBe(initalState.signatories);
});

test('certificate reducer: remove options', () => {
  const opts: CertificateOptions = {
    types: [
      {
        name: 'ROOT_CA',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
      {
        name: 'INTERMEDIATE_CA',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
      {
        name: 'CERTIFICATE',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
    ],
    algorithms: ['RSA'],
    formats: ['PEM'],
  };

  const initalState: CertificateState = {
    certificates: {
      items: undefined,
      loaded: false,
    },
    selected: {},
    options: opts,
    signatories: {
      certificates: [],
      loaded: false,
    },
  };

  const state = reducer(initalState, removeOptions());
  expect(state.certificates.items).toBeUndefined();
  expect(state.certificates.loaded).toBeFalsy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBeUndefined();
  expect(state.signatories).toBe(initalState.signatories);
});

test('certificate reducer: select and deselect certificate', () => {
  const opts: CertificateOptions = {
    types: [
      {
        name: 'ROOT_CA',
        active: true,
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
    ],
    algorithms: ['RSA'],
    formats: ['PEM'],
  };

  const initalState: CertificateState = {
    certificates: {
      items: undefined,
      loaded: false,
    },
    selected: {},
    options: opts,
    signatories: {
      certificates: [],
      loaded: false,
    },
  };

  const cert: Certificate = {
    id: '14597ed1-281f-495a-8366-4f8a411a20bc',
    name: 'test root ca',
    serialNumber: 1041018258857953,
    body: 'pem formated certificate body',
    subject: {
      commonName: 'test root ca',
    },
    format: opts.formats[0],
    type: opts.types[0].name,
    accountId: '51f5435d-0841-4538-a484-7489257f6245',
    createdAt: 'some-date',
    expiresAt: 'some-date',
  };

  const state = reducer(initalState, selectCertificate(cert));
  expect(state.certificates.items).toBeUndefined();
  expect(state.certificates.loaded).toBeFalsy();
  expect(state.selected.certificate).toBe(cert);
  expect(state.options).toBe(opts);
  expect(state.signatories).toBe(initalState.signatories);

  const nextState = reducer(state, deselectCertificate());
  expect(nextState.certificates.items).toBeUndefined();
  expect(nextState.certificates.loaded).toBeFalsy();
  expect(nextState.selected).toMatchObject({});
  expect(nextState.options).toBe(opts);
  expect(state.signatories).toBe(initalState.signatories);
});

test('certificate reducer: add and remove certificates', () => {
  const initalState: CertificateState = {
    certificates: {
      items: undefined,
      loaded: false,
    },
    selected: {},
    options: undefined,
    signatories: {
      certificates: [],
      loaded: false,
    },
  };

  const certs: Page<Certificate> = {
    currentPage: 1,
    totalPages: 2,
    totalResults: 3,
    resultsPerPage: 2,
    results: [
      {
        id: 'd1b9c1e9-ce8f-4296-8671-3411105ceb45',
        name: 'cert-1',
        serialNumber: 2681780644171099,
        body: 'pem formated certificate body',
        subject: {
          commonName: 'test root ca',
        },
        format: 'PEM',
        type: 'ROOT_CA',
        accountId: '51f5435d-0841-4538-a484-7489257f6245',
        createdAt: 'some-date',
        expiresAt: 'some-date',
      },
      {
        id: '26b679f0-ad89-4290-84a3-02f16ee23c09',
        name: 'cert-2',
        serialNumber: 2546633804774058,
        body: 'pem formated certificate body',
        subject: {
          commonName: 'test root ca',
        },
        format: 'PEM',
        type: 'CERTIFICATE',
        accountId: '51f5435d-0841-4538-a484-7489257f6245',
        createdAt: 'some-other-date',
        expiresAt: 'some-date',
      },
    ],
  };

  let state = reducer(initalState, addCertificates(certs));
  expect(state.certificates.items).toBe(certs);
  expect(state.certificates.loaded).toBeTruthy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBeUndefined();
  expect(state.signatories).toBe(initalState.signatories);

  state = reducer(state, removeCertificates());
  expect(state.certificates.items).toBeUndefined();
  expect(state.certificates.loaded).toBeFalsy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBeUndefined();
  expect(state.signatories).toBe(initalState.signatories);
});

test('certificate reducer: add and remove signing certificates', () => {
  const initalState: CertificateState = {
    certificates: {
      items: undefined,
      loaded: false,
    },
    selected: {},
    options: undefined,
    signatories: {
      certificates: [],
      loaded: false,
    },
  };

  const certs: Page<Certificate> = {
    currentPage: 1,
    totalPages: 2,
    totalResults: 3,
    resultsPerPage: 2,
    results: [
      {
        id: 'd1b9c1e9-ce8f-4296-8671-3411105ceb45',
        name: 'cert-1',
        serialNumber: 2681780644171099,
        body: 'pem formated certificate body',
        subject: {
          commonName: 'test root ca',
        },
        format: 'PEM',
        type: 'ROOT_CA',
        accountId: '51f5435d-0841-4538-a484-7489257f6245',
        createdAt: 'some-date',
        expiresAt: 'some-date',
      },
      {
        id: '26b679f0-ad89-4290-84a3-02f16ee23c09',
        name: 'cert-2',
        serialNumber: 2546633804774058,
        body: 'pem formated certificate body',
        subject: {
          commonName: 'test root ca',
        },
        format: 'PEM',
        type: 'CERTIFICATE',
        accountId: '51f5435d-0841-4538-a484-7489257f6245',
        createdAt: 'some-other-date',
        expiresAt: 'some-date',
      },
    ],
  };

  let state = reducer(initalState, addSigningCertificates(certs.results));
  expect(state.signatories.certificates).toBe(certs.results);
  expect(state.signatories.loaded).toBeTruthy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBeUndefined();
  expect(state.certificates).toBe(initalState.certificates);
  expect(state.certificates.loaded).toBeFalsy();

  state = reducer(state, removeSigningCertificates());
  expect(state.signatories.certificates).toHaveLength(0);
  expect(state.signatories.loaded).toBeFalsy();
  expect(state.selected).toMatchObject({});
  expect(state.options).toBeUndefined();
  expect(state.certificates).toBe(initalState.certificates);
  expect(state.certificates.loaded).toBeFalsy();
});
