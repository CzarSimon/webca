import { useSelector, useDispatch } from 'react-redux';
import { CertificateOptions, Optional, CertificateState, UserState } from '../../types';
import { AppState } from '..';
import Form, { FormInstance } from 'antd/lib/form';
import { useEffect, useCallback } from 'react';
import { getCertificateOptions } from '../certificates';
import { AUTH_TOKEN_KEY, USER_ID_KEY } from '../../constants';
import { setToken } from '../../api/httpclient';
import { getUser } from '../user';

export const useCertificateOptions = (): Optional<CertificateOptions> => useSelector(certificatesSelector).options;

const certificatesSelector = (state: AppState): CertificateState => state.certificates;

export const useUserState = (): UserState => useSelector(userSelector);

const userSelector = (state: AppState): UserState => state.user;

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
    // eslint-disable-next-line
  }, []);

  return useCertificateOptions();
}

export function useIsAuthenticated(): boolean {
  const { loaded } = useUserState();
  const dispatch = useDispatch();

  const userId = sessionStorage.getItem(USER_ID_KEY);
  const authToken = sessionStorage.getItem(AUTH_TOKEN_KEY);

  useCallback(() => {
    if (loaded || !userId || !authToken) {
      return;
    }

    setToken(authToken);
    dispatch(getUser(userId));
  }, [loaded, userId, authToken]);

  return loaded;
}
