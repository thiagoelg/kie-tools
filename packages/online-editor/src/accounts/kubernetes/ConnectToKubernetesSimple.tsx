/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useCallback, useState } from "react";
import { Alert } from "@patternfly/react-core/dist/js/components/Alert";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { ActionGroup, Form, FormAlert, FormGroup } from "@patternfly/react-core/dist/js/components/Form";
import { InputGroup, InputGroupText } from "@patternfly/react-core/dist/js/components/InputGroup";
import { Popover } from "@patternfly/react-core/dist/js/components/Popover";
import { TextInput } from "@patternfly/react-core/dist/js/components/TextInput";
import HelpIcon from "@patternfly/react-icons/dist/js/icons/help-icon";
import { TimesIcon } from "@patternfly/react-icons/dist/js/icons/times-icon";
import { useOnlineI18n } from "../../i18n";
import { useAuthSessionsDispatch } from "../../authSessions/AuthSessionsContext";
import { v4 as uuid } from "uuid";
import { KubernetesAuthSession } from "../../authSessions/AuthSessionApi";
import { KieSandboxKubernetesService } from "../../devDeployments/services/KieSandboxKubernetesService";
import { KubernetesInstanceStatus } from "./KubernetesInstanceStatus";
import {
  KubernetesConnection,
  KubernetesConnectionStatus,
  isKubernetesConnectionValid,
} from "@kie-tools-core/kubernetes-bridge/dist/service/KubernetesConnection";
import { KubernetesSettingsTabMode } from "./ConnectToKubernetesSection";
import ArrowRightIcon from "@patternfly/react-icons/dist/js/icons/arrow-right-icon";

enum FormValiationOptions {
  INITIAL = "INITIAL",
  INVALID = "INVALID",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  MISSING_PERMISSIONS = "MISSING_PERMISSIONS",
}

export function ConnectToKubernetesSimple(props: {
  kubernetesService: KieSandboxKubernetesService;
  connection: KubernetesConnection;
  setConnection: React.Dispatch<React.SetStateAction<KubernetesConnection>>;
  status: KubernetesInstanceStatus;
  setStatus: React.Dispatch<React.SetStateAction<KubernetesInstanceStatus>>;
  setMode: React.Dispatch<React.SetStateAction<KubernetesSettingsTabMode>>;
  setNewAuthSession: React.Dispatch<React.SetStateAction<KubernetesAuthSession>>;
}) {
  const { i18n } = useOnlineI18n();
  const [isConnectionValidated, setConnectionValidated] = useState(FormValiationOptions.INITIAL);
  const [isConnecting, setConnecting] = useState(false);
  const authSessionsDispatch = useAuthSessionsDispatch();

  const onConnect = useCallback(async () => {
    if (isConnecting) {
      return;
    }

    if (!isKubernetesConnectionValid(props.connection)) {
      setConnectionValidated(FormValiationOptions.INVALID);
      return;
    }

    setConnecting(true);
    const isConnectionEstablished = await props.kubernetesService.isConnectionEstablished();
    setConnecting(false);

    if (isConnectionEstablished === KubernetesConnectionStatus.CONNECTED) {
      const newAuthSession: KubernetesAuthSession = {
        type: "kubernetes",
        id: uuid(),
        ...props.connection,
        authProviderId: "kubernetes",
        createdAtDateISO: new Date().toISOString(),
      };
      props.setStatus(KubernetesInstanceStatus.CONNECTED);
      authSessionsDispatch.add(newAuthSession);
      props.setNewAuthSession(newAuthSession);
    } else if (isConnectionEstablished === KubernetesConnectionStatus.MISSING_PERMISSIONS) {
      setConnectionValidated(FormValiationOptions.MISSING_PERMISSIONS);
    } else {
      setConnectionValidated(FormValiationOptions.CONNECTION_ERROR);
      return;
    }
  }, [authSessionsDispatch, isConnecting, props]);

  const onClearHost = useCallback(() => props.setConnection({ ...props.connection, host: "" }), [props]);
  const onClearNamespace = useCallback(() => props.setConnection({ ...props.connection, namespace: "" }), [props]);
  const onClearToken = useCallback(() => props.setConnection({ ...props.connection, token: "" }), [props]);

  const onHostChanged = useCallback(
    (newValue: string) => {
      props.setConnection({ ...props.connection, host: newValue });
    },
    [props]
  );

  const onNamespaceChanged = useCallback(
    (newValue: string) => {
      props.setConnection({ ...props.connection, namespace: newValue });
    },
    [props]
  );

  const onTokenChanged = useCallback(
    (newValue: string) => {
      props.setConnection({ ...props.connection, token: newValue });
    },
    [props]
  );

  return (
    <>
      {isConnectionValidated === FormValiationOptions.INVALID && (
        <>
          <FormAlert>
            <Alert
              variant="danger"
              title={i18n.devDeployments.configModal.validationError}
              aria-live="polite"
              isInline
              data-testid="alert-validation-error"
            />
          </FormAlert>
          <br />
        </>
      )}
      {isConnectionValidated === FormValiationOptions.CONNECTION_ERROR && (
        <>
          {" "}
          <FormAlert>
            <Alert
              variant="danger"
              title={i18n.devDeployments.configModal.connectionError}
              aria-live="polite"
              isInline
              data-testid="alert-connection-error"
            />
          </FormAlert>
          <br />
        </>
      )}
      {isConnectionValidated === FormValiationOptions.MISSING_PERMISSIONS && (
        <>
          {" "}
          <FormAlert>
            <Alert
              variant="danger"
              title={i18n.devDeployments.configModal.missingPermissions}
              aria-live="polite"
              isInline
              data-testid="alert-connection-error"
            />
          </FormAlert>
          <br />
        </>
      )}

      <Button
        style={{ paddingLeft: 0 }}
        id="dev-deployments-config-use-wizard-button"
        key="use-wizard"
        className="pf-u-p-0"
        variant="link"
        onClick={() => props.setMode(KubernetesSettingsTabMode.WIZARD)}
        data-testid="use-wizard-button"
        isLoading={isConnecting}
      >
        {i18n.devDeployments.configModal.useKubernetesWizard}
        &nbsp;
        <ArrowRightIcon className="pf-u-ml-sm" />
      </Button>

      <br />
      <br />

      <Form>
        <FormGroup
          label={i18n.terms.namespace}
          labelIcon={
            <Popover bodyContent={i18n.devDeployments.configModal.namespaceInfo}>
              <button
                type="button"
                aria-label="More info for namespace field"
                onClick={(e) => e.preventDefault()}
                aria-describedby="namespace-field"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
          isRequired
          fieldId="namespace-field"
        >
          <InputGroup className="pf-u-mt-sm">
            <TextInput
              autoFocus={true}
              autoComplete={"off"}
              isRequired
              type="text"
              id="namespace-field"
              name="namespace-field"
              aria-label="Namespace field"
              aria-describedby="namespace-field-helper"
              value={props.connection.namespace}
              onChange={onNamespaceChanged}
              isDisabled={isConnecting}
              tabIndex={1}
              data-testid="namespace-text-field"
            />
            <InputGroupText>
              <Button isSmall variant="plain" aria-label="Clear namespace button" onClick={onClearNamespace}>
                <TimesIcon />
              </Button>
            </InputGroupText>
          </InputGroup>
        </FormGroup>
        <FormGroup
          label={i18n.terms.host}
          labelIcon={
            <Popover bodyContent={i18n.devDeployments.configModal.hostInfo}>
              <button
                type="button"
                aria-label="More info for host field"
                onClick={(e) => e.preventDefault()}
                aria-describedby="host-field"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
          isRequired
          fieldId="host-field"
        >
          <InputGroup className="pf-u-mt-sm">
            <TextInput
              autoComplete={"off"}
              isRequired
              type="text"
              id="host-field"
              name="host-field"
              aria-label="Host field"
              aria-describedby="host-field-helper"
              value={props.connection.host}
              onChange={onHostChanged}
              isDisabled={isConnecting}
              tabIndex={2}
              data-testid="host-text-field"
            />
            <InputGroupText>
              <Button isSmall variant="plain" aria-label="Clear host button" onClick={onClearHost}>
                <TimesIcon />
              </Button>
            </InputGroupText>
          </InputGroup>
        </FormGroup>
        <FormGroup
          label={i18n.terms.token}
          labelIcon={
            <Popover bodyContent={i18n.devDeployments.configModal.tokenInfo}>
              <button
                type="button"
                aria-label="More info for token field"
                onClick={(e) => e.preventDefault()}
                aria-describedby="token-field"
                className="pf-c-form__group-label-help"
              >
                <HelpIcon noVerticalAlign />
              </button>
            </Popover>
          }
          isRequired
          fieldId="token-field"
        >
          <InputGroup className="pf-u-mt-sm">
            <TextInput
              autoComplete={"off"}
              isRequired
              type="text"
              id="token-field"
              name="token-field"
              aria-label="Token field"
              aria-describedby="token-field-helper"
              value={props.connection.token}
              onChange={onTokenChanged}
              isDisabled={isConnecting}
              tabIndex={3}
              data-testid="token-text-field"
            />
            <InputGroupText>
              <Button isSmall variant="plain" aria-label="Clear token button" onClick={onClearToken}>
                <TimesIcon />
              </Button>
            </InputGroupText>
          </InputGroup>
        </FormGroup>
        <ActionGroup>
          <Button
            id="dev-deployments-config-save-button"
            key="save"
            variant="primary"
            onClick={onConnect}
            data-testid="save-config-button"
            isLoading={isConnecting}
            isDisabled={isConnecting}
            spinnerAriaValueText={isConnecting ? "Loading" : undefined}
          >
            {isConnecting ? "Connecting" : "Connect"}
          </Button>
        </ActionGroup>
      </Form>
    </>
  );
}
