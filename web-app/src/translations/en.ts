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

  'rsaOptions.title': 'RSA options',
  'rsaOptions.keySize-label': 'Key size',
  'rsaOptions.keySize-placeholder': 'RSA key bits',
  'rsaOptions.keySize-required': 'Key size is required',

  'certificate.type-ROOT_CA': 'Root CA',
  'certificate.type-INTERMEDIATE_CA': 'Intermediate CA',
  'certificate.type-CERTIFICATE': 'Certificate',
  'certificate.algorithm-RSA': 'RSA',

  'certificateList.title': 'Certificates',
  'certificateList.newCertificate-button': 'New certificate',
  'certificateList.name-column': 'Name',
  'certificateList.type-column': 'Certificate type',
  'certificateList.createdAt-column': 'Created at',

  'certificateDisplay.download-certificate': 'Download Certificate',
  'certificateDisplay.download-certificateChain': 'Download Certificate Chain',
  'certificateDisplay.download-privateKey': 'Download Private Key',

  'basicCertificateDetails.title': 'Basic details',
  'basicCertificateDetails.type': 'Type',
  'basicCertificateDetails.createdAt': 'Created At',

  'certificateSubjectDetails.title': 'Subject',
  'certificateSubjectDetails.commonName': 'Common name',
  'certificateSubjectDetails.country': 'Country',
  'certificateSubjectDetails.locality': 'Locality',
  'certificateSubjectDetails.organization': 'Organization',
  'certificateSubjectDetails.organizationalUnit': 'Organizational unit',
  'certificateSubjectDetails.email': 'Email',

  'certificateBody.collapseButton': 'Body',

  'privateKeyModal.label': 'Please provide private key password',
  'privateKeyModal.password-plassword': 'Password',
  'privateKeyModal.password-required': 'Password is required',
  'privateKeyModal.cancel': 'Cancel',
  'privateKeyModal.download': 'Download',
  'privateKeyModal.wrongPassword': 'Wrong private key password',

  'sideMenu.title': 'webca.io',
  'sideMenu.certificates-item': 'Certificates',
  'sideMenu.settings-item': 'Settings',

  'userDetails.title': 'User details',

  'settings.logout-button': 'Log out',
  'userDetails.email-label': 'Email',
  'userDetails.role-label': 'Role',
  'userDetails.accountName-label': 'Account name',

  'home.title': 'webca.io',
  'home.subtitle': 'Web based certificate authority',
};
