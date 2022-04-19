import { Alert, AlertActionCloseButton } from "@patternfly/react-core/dist/js/components/Alert";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { Spinner } from "@patternfly/react-core/dist/js/components/Spinner";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core/dist/js/components/Toolbar";
import { Flex, FlexItem } from "@patternfly/react-core/dist/js/layouts/Flex";
import * as React from "react";
import { useCallback, useState } from "react";
import { AlertsController, useAlert } from "../alerts/Alerts";
import { useOpenShift } from "../openshift/OpenShiftContext";
import { OpenShiftInstanceStatus } from "../openshift/OpenShiftInstanceStatus";
import { useSettings } from "../settings/SettingsContext";
import { WorkspaceFile } from "../workspace/WorkspacesContext";

export interface DeployToolbarProps {
  alerts: AlertsController | undefined;
  currentFile: WorkspaceFile;
}

export function DeployToolbar(props: DeployToolbarProps) {
  const openshift = useOpenShift();
  const settings = useSettings();
  const [isLoading, setLoading] = useState(false);

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
        `${props.currentFile.nameWithoutExtension} ${deploymentResourceName}`,
        openApiContents
      );

      return true;
    },
    [openshift, props.currentFile.nameWithoutExtension]
  );

  const onDeploy = useCallback(async () => {
    const content = await props.currentFile.getFileContentsAsString();

    if (!content) {
      setDeployError.show();
      return;
    }

    setLoading(true);
    const resourceName = await openshift.deploy({
      name: props.currentFile.relativePath,
      content: content,
    });
    setLoading(false);

    if (resourceName) {
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
  }, [props.currentFile, openshift, setDeployError, setDeploySuccess, fetchOpenApiSpec, openApiUploadSuccess]);

  return (
    <Flex>
      <FlexItem>
        <Toolbar>
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <ToolbarItem>
              <Button
                isDisabled={settings.openshift.status !== OpenShiftInstanceStatus.CONNECTED}
                key="deploy"
                variant="primary"
                onClick={onDeploy}
                isLoading={isLoading}
                spinnerAriaValueText={isLoading ? "Loading" : undefined}
              >
                {isLoading ? "Deploying" : "Deploy"}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </FlexItem>
    </Flex>
  );
}
