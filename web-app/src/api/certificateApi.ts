import { httpclient } from './httpclient';
import { CertificateOptions, CertificateRequest, Certificate, CertificatePage } from '../types';
import { HTTPResponse } from '@czarsimon/httpclient';

const CERTIFICATES_URL = '/api/v1/certificates';
const OPTIONS_URL = '/api/v1/certificate-options';

export const createCertificate = (req: CertificateRequest): Promise<HTTPResponse<Certificate>> =>
  httpclient.post<Certificate>({ url: CERTIFICATES_URL, body: req });

export const getCertificate = (id: string): Promise<HTTPResponse<Certificate>> =>
  httpclient.get<Certificate>({ url: `${CERTIFICATES_URL}/${id}` });

export const getCertificatesByAccountId = (accountId: string): Promise<HTTPResponse<CertificatePage>> =>
  httpclient.get<CertificatePage>({ url: `${CERTIFICATES_URL}?accountId=${accountId}` });

export const getCertificateOptions = (): Promise<HTTPResponse<CertificateOptions>> =>
  httpclient.get<CertificateOptions>({ url: OPTIONS_URL });

export const downloadCertificateBody = (id: string): Promise<HTTPResponse<string>> =>
  httpclient.get<string>({ url: `${CERTIFICATES_URL}/${id}/body` });

export const downloadCertificatePrivateKey = (id: string, password: string): Promise<HTTPResponse<string>> =>
  httpclient.get<string>({
    url: `${CERTIFICATES_URL}/${id}/private-key`,
    headers: {
      'X-Private-Key-Password': password,
    },
  });
