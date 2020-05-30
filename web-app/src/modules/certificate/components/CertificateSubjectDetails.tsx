import React from 'react';
import { Descriptions } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CertificateSubject } from '../../../types';
import { useFormatedMessage } from '../../../translations';

interface Props {
  subject?: CertificateSubject;
}

export function CertificateSubjectDetails({ subject }: Props) {
  const formattedMessage = useFormatedMessage();

  if (!subject || Object.entries(subject).length === 0) {
    return null;
  }

  return (
    <Descriptions
      title={
        <h3>
          <FormattedMessage id="certificateSubjectDetails.title" />
        </h3>
      }
    >
      {Object.entries(subject).map(([key, val]) => {
        const descriptionLabel = formattedMessage(`certificateSubjectDetails.${key}`);
        return (
          <Descriptions.Item key={key} label={descriptionLabel}>
            <p>{val}</p>
          </Descriptions.Item>
        );
      })}
    </Descriptions>
  );
}
