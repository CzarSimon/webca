import { httpclient } from "./httpclient";
import { CertificateOptions, CertificateRequest, Certificate } from "../types";
import { HTTPResponse } from "@czarsimon/httpclient";

const CERTIFICATES_URL: string = "/api/v1/certificates"
const OPTIONS_URL: string = "/api/v1/certificate-options"

export const createCertificate = async (req: CertificateRequest): Promise<HTTPResponse<Certificate>> => (
  httpclient.post<Certificate>({ url: CERTIFICATES_URL, body: req })
);

export const getCertificatesOptions = async (): Promise<HTTPResponse<CertificateOptions>> => (
  httpclient.get<CertificateOptions>({ url: OPTIONS_URL })
);
