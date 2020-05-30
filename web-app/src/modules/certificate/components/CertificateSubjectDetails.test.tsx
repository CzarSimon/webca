import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../../testutils';
import { CertificateSubject } from '../../../types';
import { CertificateSubjectDetails } from './CertificateSubjectDetails';

test('CertificateSubjectDetails: renders with basic subject', () => {
  const subject: CertificateSubject = {
    commonName: 'test root ca',
  };

  render(<CertificateSubjectDetails subject={subject} />);

  expect(screen.getByText('Subject')).toBeInTheDocument();
  expect(screen.getByText('Common name')).toBeInTheDocument();
  expect(screen.getByText('test root ca')).toBeInTheDocument();
});

test('CertificateSubjectDetails: renders null without subject', () => {
  render(<CertificateSubjectDetails subject={undefined} />);

  expect(screen.queryByText('Subject')).toBeFalsy();
  expect(screen.queryByText('Common name')).toBeFalsy();
});

test('CertificateSubjectDetails: renders with full subject', () => {
  const subject: CertificateSubject = {
    commonName: 'WebCA Test Root CA',
    country: 'SE',
    locality: 'Stockholm',
    organization: 'WebCA AB',
    organizationalUnit: 'Engineering',
    email: 'engineering@webca.io',
  };

  render(<CertificateSubjectDetails subject={subject} />);

  expect(screen.getByText('Subject')).toBeInTheDocument();
  expect(screen.getByText('Common name')).toBeInTheDocument();
  expect(screen.getByText('WebCA Test Root CA')).toBeInTheDocument();
  expect(screen.getByText('Country')).toBeInTheDocument();
  expect(screen.getByText('SE')).toBeInTheDocument();
  expect(screen.getByText('Locality')).toBeInTheDocument();
  expect(screen.getByText('Stockholm')).toBeInTheDocument();
  expect(screen.getByText('Organization')).toBeInTheDocument();
  expect(screen.getByText('WebCA AB')).toBeInTheDocument();
  expect(screen.getByText('Organizational unit')).toBeInTheDocument();
  expect(screen.getByText('Engineering')).toBeInTheDocument();
  expect(screen.getByText('Email')).toBeInTheDocument();
  expect(screen.getByText('engineering@webca.io')).toBeInTheDocument();
});
