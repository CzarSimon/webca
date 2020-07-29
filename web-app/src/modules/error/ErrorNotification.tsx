import React, { useEffect } from 'react';
import { Alert } from 'antd';
import { useErrorState, useRemoveError } from '../../state/hooks';
import { ErrorInfo, Optional } from '../../types';
import { ERROR_DISPLAY_TIME_MS } from '../../constants';

import styles from './ErrorNotification.module.css';

function setupErrorClearing(removeError: () => void, error?: ErrorInfo): Optional<() => void> {
  if (!error) {
    return;
  }

  const timer = setTimeout(removeError, ERROR_DISPLAY_TIME_MS);
  return () => clearTimeout(timer);
}

export function ErrorNotification() {
  const removeError = useRemoveError();
  const { error } = useErrorState();
  useEffect(() => {
    return setupErrorClearing(removeError, error);
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!error) {
    return null;
  }

  return (
    <div className={styles.ErrorNotification}>
      <Alert message={error.info} type="error" onClose={removeError} showIcon />
    </div>
  );
}
