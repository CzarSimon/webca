import { httpclient } from "./httpclient";
import { CertificateOptions } from "../types";
import { HTTPResponse } from "@czarsimon/httpclient";

const OPTIONS_URL: string = "/api/v1/certificate-options"

export const getCertificatesOptions = async (): Promise<HTTPResponse<CertificateOptions>> => (
  httpclient.get<CertificateOptions>({ url: OPTIONS_URL })
);
