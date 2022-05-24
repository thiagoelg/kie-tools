/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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

import { Alert, AlertActionCloseButton } from "@patternfly/react-core/dist/js/components/Alert";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { Modal, ModalVariant } from "@patternfly/react-core/dist/js/components/Modal";
import { Spinner } from "@patternfly/react-core/dist/js/components/Spinner";
import * as React from "react";
import { useCallback, useState } from "react";
import { AlertsController, useAlert } from "../../alerts/Alerts";
import { useAppI18n } from "../../i18n";
import { useOpenShift } from "../../openshift/OpenShiftContext";
import { WorkspaceFile } from "../../workspace/WorkspacesContext";

export function ConfirmDeployModal(props: { workspaceFile: WorkspaceFile; alerts: AlertsController | undefined }) {
  const openshift = useOpenShift();
  const { i18n } = useAppI18n();
  const [isConfirmLoading, setConfirmLoading] = useState(false);

  const setDeployError = useAlert(
    props.alerts,
    useCallback(({ close }) => {
      return (
        <Alert
          className="pf-u-mb-md"
          variant="danger"
          title={"Something went wrong while deploying. Check your OpenShift connection and try again."}
          aria-live="polite"
          data-testid="alert-deploy-error"
          actionClose={<AlertActionCloseButton onClose={close} />}
        />
      );
    }, [])
  );

  const setDeploySuccess = useAlert(
    props.alerts,
    useCallback(({ close }) => {
      return (
        <Alert
          className="pf-u-mb-md"
          variant="info"
          title={
            <>
              <Spinner size={"sm"} />
              &nbsp;&nbsp; A new deployment has been started. Its associated OpenAPI spec will be uploaded to Service
              Registry as soon as the deployment is up and running. Please do not close this browser tab until the
              operation is completed.
            </>
          }
          aria-live="polite"
          data-testid="alert-deploy-success"
          actionClose={<AlertActionCloseButton onClose={close} />}
        />
      );
    }, [])
  );

  const openApiUploadSuccess = useAlert(
    props.alerts,
    useCallback(({ close }) => {
      return (
        <Alert
          className="pf-u-mb-md"
          variant="success"
          title={"The OpenAPI spec has been uploaded to Service Registry successfully."}
          aria-live="polite"
          data-testid="alert-upload-success"
          actionClose={<AlertActionCloseButton onClose={close} />}
        />
      );
    }, [])
  );

  const fetchOpenApiSpec = useCallback(
    async (deploymentResourceName: string) => {
      const openApiContents = await openshift.fetchOpenApiFile(deploymentResourceName);

      if (!openApiContents) {
        return false;
      }

      await openshift.uploadArtifactToServiceRegistry(
        `${props.workspaceFile.nameWithoutExtension} ${deploymentResourceName}`,
        openApiContents
      );

      return true;
    },
    [openshift, props.workspaceFile.nameWithoutExtension]
  );

  const onConfirm = useCallback(async () => {
    if (isConfirmLoading) {
      return;
    }

    setConfirmLoading(true);
    const resourceName = await openshift.deploy({
      workspaceFile: props.workspaceFile,
    });
    setConfirmLoading(false);

    openshift.setConfirmDeployModalOpen(false);

    if (resourceName) {
      openshift.setDeploymentsDropdownOpen(true);
      setDeploySuccess.show();

      const fetchOpenApiTask = window.setInterval(async () => {
        const success = await fetchOpenApiSpec(resourceName);
        if (!success) {
          return;
        }

        window.clearInterval(fetchOpenApiTask);
        setDeploySuccess.close();
        openApiUploadSuccess.show();
      }, 5000);
    } else {
      setDeployError.show();
    }
  }, [
    isConfirmLoading,
    openshift,
    props.workspaceFile,
    setDeploySuccess,
    fetchOpenApiSpec,
    openApiUploadSuccess,
    setDeployError,
  ]);

  const onCancel = useCallback(() => {
    openshift.setConfirmDeployModalOpen(false);
    setConfirmLoading(false);
  }, [openshift]);

  return (
    <Modal
      data-testid={"confirm-deploy-modal"}
      variant={ModalVariant.small}
      title={"Deploy"}
      isOpen={openshift.isConfirmDeployModalOpen}
      aria-label={"Confirm deploy modal"}
      onClose={onCancel}
      actions={[
        <Button
          id="confirm-deploy-button"
          key="confirm"
          variant="primary"
          onClick={onConfirm}
          isLoading={isConfirmLoading}
          spinnerAriaValueText={isConfirmLoading ? "Loading" : undefined}
        >
          {isConfirmLoading ? "Deploying ..." : i18n.terms.confirm}
        </Button>,
        <Button key="cancel" variant="link" onClick={onCancel}>
          {i18n.terms.cancel}
        </Button>,
      ]}
    >
      {
        "Are you sure you want to deploy your model to your instance? This action will take a few minutes to be completed and you will need to create a new deployment if you update your model."
      }
    </Modal>
  );
}
