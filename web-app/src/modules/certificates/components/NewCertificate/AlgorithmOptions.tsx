import React from 'react';
import { RSAOptions } from './RSAOptions';
import { ALGORITHMS } from '../../../../constants';

interface Props {
  algorithm?: string;
  certificateType?: string;
  selectKeySize: (value: string) => void;
}

export function AlgorithmOptions({ algorithm, certificateType, selectKeySize }: Props) {
  switch (algorithm) {
    case ALGORITHMS.RSA:
      return <RSAOptions certificateType={certificateType} selectKeySize={selectKeySize} />;
    default:
      return null;
  }
}
