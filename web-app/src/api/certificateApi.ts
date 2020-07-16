import { httpclient } from './httpclient';
import { CertificateOptions, CertificateRequest, Certificate, CertificatePage, Attachment } from '../types';
import { HTTPResponse } from '@czarsimon/httpclient';

const CERTIFICATES_URL = '/api/v1/certificates';
const OPTIONS_URL = '/api/v1/certificate-options';

export const createCertificate = (req: CertificateRequest): Promise<HTTPResponse<Certificate>> =>
  httpclient.post<Certificate>({ url: CERTIFICATES_URL, body: req });

export const getCertificate = (id: string): Promise<HTTPResponse<Certificate>> =>
  httpclient.get<Certificate>({ url: `${CERTIFICATES_URL}/${id}` });

export const getCertificatesByAccountIdAndTypes = (
  accountId: string,
  types?: string[],
): Promise<HTTPResponse<CertificatePage>> => {
  return httpclient.get<CertificatePage>({ url: createCertificatesUrl(accountId, types) });
};

export const getCertificateOptions = (): Promise<HTTPResponse<CertificateOptions>> =>
  httpclient.get<CertificateOptions>({ url: OPTIONS_URL });

export const downloadCertificateBody = (id: string): Promise<HTTPResponse<Attachment>> =>
  httpclient.get<Attachment>({ url: `${CERTIFICATES_URL}/${id}/body` });

export const downloadCertificatePrivateKey = (id: string, password: string): Promise<HTTPResponse<Attachment>> =>
  httpclient.get<Attachment>({
    url: `${CERTIFICATES_URL}/${id}/private-key`,
    headers: {
      'X-Private-Key-Password': password,
    },
  });

function createCertificatesUrl(accountId: string, types?: string[]): string {
  const url = `${CERTIFICATES_URL}?accountId=${accountId}`;
  if (!types) {
    return url;
  }

  const typeFilter = types.map((t) => `type=${t}`).join('&');
  return `${url}&${typeFilter}`;
}
