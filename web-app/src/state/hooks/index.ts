import { useSelector, useDispatch } from 'react-redux';
import { CertificateOptions, Optional, CertificateState, UserState, Certificates } from '../../types';
import { AppState } from '..';
import Form, { FormInstance } from 'antd/lib/form';
import { useEffect } from 'react';
import { getCertificateOptions, getCertificatesByAccountId } from '../certificates';
import { AUTH_TOKEN_KEY, USER_ID_KEY } from '../../constants';
import { setToken } from '../../api/httpclient';
import { getUser } from '../user';

export const useCertificateOptions = (): Optional<CertificateOptions> => useSelector(certificatesSelector).options;

export const useCertificates = (): Certificates => useSelector(certificatesSelector).certificates;

const certificatesSelector = (state: AppState): CertificateState => state.certificates;

export const useUserState = (): UserState => useSelector(userSelector);

const userSelector = (state: AppState): UserState => state.user;

function useAccountId(): Optional<string> {
  const { user } = useUserState();
  return user ? user.account.id : undefined;
}

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

export function useFetchCertificates(): Certificates {
  const dispatch = useDispatch();
  const accountId = useAccountId();

  useEffect(() => {
    if (accountId) {
      dispatch(getCertificatesByAccountId(accountId));
    }
    // eslint-disable-next-line
  }, [accountId]);

  return useCertificates();
}

export function useIsAuthenticated(): boolean {
  const { loaded } = useUserState();
  const dispatch = useDispatch();

  const userId = sessionStorage.getItem(USER_ID_KEY);
  const authToken = sessionStorage.getItem(AUTH_TOKEN_KEY);

  useEffect(() => {
    if (!userId || !authToken) {
      return;
    }

    setToken(authToken);
    dispatch(getUser(userId));
    // eslint-disable-next-line
  }, [loaded, userId, authToken]);

  return loaded;
}
