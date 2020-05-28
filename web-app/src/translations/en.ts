import { TextMap } from '../types';
import { PASSWORD_MIN_LENGTH } from '../constants';

export const enUS: TextMap = {
  'app.description': 'Webbased CA and certificicate manager',

  'signup.title': 'webca.io',
  'signup.accountName-placeholder': 'Account name',
  'signup.accountName-required': 'Please provide an account name',
  'signup.email-placeholder': 'Email',
  'signup.email-required': 'A valid email is required',
  'signup.password-placeholder': 'Password',
  'signup.password-required': `At least ${PASSWORD_MIN_LENGTH} charactes are required in password`,
  'signup.button': 'Sign Up',
  'signup.login-link': 'Log in',

  'login.title': 'webca.io',
  'login.accountName-placeholder': 'Account name',
  'login.accountName-required': 'Account name is required',
  'login.email-placeholder': 'Email',
  'login.email-required': 'Email is required',
  'login.password-placeholder': 'Password',
  'login.password-required': 'Password is required',
  'login.button': 'Log in',
  'login.signup-link': 'Sign up',

  'newCertificate.title': 'Create new certificate',
  'newCertificate.name-placeholder': 'Name',
  'newCertificate.name-required': 'Certificate name is required',
  'newCertificate.type-placeholder': 'Certificate type',
  'newCertificate.type-required': 'Certificate type is required',
  'newCertificate.algorithm-placeholder': 'Signature algorithm',
  'newCertificate.algorithm-required': 'Signature algorithm is required',
  'newCertificate.subject-title': 'Subject',
  'newCertificate.subject.commonName-placeholder': 'Common name',
  'newCertificate.subject.commonName-required': 'Subject common name is required',
  'newCertificate.button': 'Create certificate',
  'newCertificate.password-placeholder': 'Private key password',
  'newCertificate.password-required': `At least ${PASSWORD_MIN_LENGTH} charactes are required in password`,

  'certificate.type-ROOT_CA': 'Root CA',
  'certificate.type-INTERMEDIATE_CA': 'Intermediate CA',
  'certificate.type-CERTIFICATE': 'Certificate',
  'certificate.algorithm-RSA': 'RSA',
};
