import { useSelector } from "react-redux";
import { CertificateOptions, Optional, CertificateState } from "../../types";
import { AppState } from "..";

export const useCertificateOptions = (): Optional<CertificateOptions> =>
  useSelector(certificatesSelector).options;

const certificatesSelector = (state: AppState): CertificateState =>
  state.certificates;
