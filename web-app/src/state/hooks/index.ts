import { useSelector, useDispatch } from 'react-redux';
import { CertificateOptions, Optional, CertificateState } from '../../types';
import { AppState } from '..';
import Form, { FormInstance } from 'antd/lib/form';
import { useEffect } from 'react';
import { getCertificateOptions } from '../certificates';

export const useCertificateOptions = (): Optional<CertificateOptions> => useSelector(certificatesSelector).options;

const certificatesSelector = (state: AppState): CertificateState => state.certificates;

interface UseFormSelectHook {
  form: FormInstance;
  onSelect: (key: string) => (value: string) => void;
}

export function useFormSelect(): UseFormSelectHook {
  const [form] = Form.useForm();
  const onSelect = (key: string) => (value: string) => {
    form.setFieldsValue({ [key]: value });
  };

  return {
    form,
    onSelect,
  };
}

export function useFetchCertificateOptions(): Optional<CertificateOptions> {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCertificateOptions());
  }, []);

  return useCertificateOptions();
}
