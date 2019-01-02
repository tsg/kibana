/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  EuiFieldNumber,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';
import React from 'react';

export function SIEMRuleForm() {
  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>SIEM Rules</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiPageContentBody>
            <RuleForm />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}

export function RuleForm() {
  return (
    <EuiForm>
      <EuiFormRow label="Rule name" helpText="Give a name to this rule.">
        <EuiFieldText name="name" />
      </EuiFormRow>

      <EuiFormRow label="Query" helpText="Elasticsearch query to run periodically.">
        <EuiTextArea
          name="query"
          placeholder="event.action:socket_opened AND destination.ip:169.254.169.254"
        />
      </EuiFormRow>

      <EuiFormRow label="Index pattern" helpText="Index pattern where to run the query">
        <EuiFieldText name="name" value="auditbeat-*" />
      </EuiFormRow>

      <EuiFormRow label="Run every" helpText="How often to execute this query.">
        <EuiFieldNumber
          name="interval"
          value="5"
          style={{ textAlign: 'right' }}
          append={
            <EuiText size="xs">
              <strong>minutes</strong>
            </EuiText>
          }
        />
      </EuiFormRow>

      <EuiFormRow label="Lookback" helpText="How many minutes to search back in time.">
        <EuiFieldNumber
          name="lookbackMinutes"
          value="15"
          style={{ textAlign: 'right' }}
          append={
            <EuiText size="xs">
              <strong>minutes</strong>
            </EuiText>
          }
        />
      </EuiFormRow>

      <EuiButton fill onClick={() => window.alert('Button clicked')}>
        Schedule
      </EuiButton>
    </EuiForm>
  );
}
