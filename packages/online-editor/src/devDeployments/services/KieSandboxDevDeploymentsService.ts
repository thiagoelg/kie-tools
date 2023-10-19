/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { K8sResourceYaml } from "@kie-tools-core/k8s-yaml-to-apiserver-requests/dist";
import { CloudAuthSessionType } from "../../authSessions/AuthSessionApi";
import { KubernetesConnectionStatus, KubernetesService, KubernetesServiceArgs } from "./KubernetesService";
import { DeploymentResource, KieSandboxDeployment, ServiceResource, Tokens, defaultLabelTokens } from "./types";
import { DeploymentState } from "./common";
import { getUploadStatus, postUpload } from "../DevDeploymentUploadAppApi";

export interface DeployArgs {
  workspaceZipBlob: Blob;
  tokenMap: { devDeployment: Tokens };
  deploymentOption: string;
}

export type ResourceArgs = {
  namespace: string;
  resourceName: string;
  createdBy: string;
};

export type KieSandboxDevDeploymentsServiceProps = {
  id: string;
  type: CloudAuthSessionType;
  args: KubernetesServiceArgs;
};

export type KieSandboxDevDeploymentsServiceType = KieSandboxDevDeploymentsServiceProps & {
  isConnectionEstablished(): Promise<KubernetesConnectionStatus>;
  loadDevDeployments(): Promise<KieSandboxDeployment[]>;
  deploy(args: DeployArgs): Promise<void>;
  deleteDevDeployment(resources: K8sResourceYaml[]): Promise<void>;
  uploadAssets(args: { deployment: K8sResourceYaml; workspaceZipBlob: Blob; baseUrl: string }): Promise<void>;
  extractDevDeploymentState(args: { deployment?: any }): DeploymentState;
  newResourceName(): string;
};

export const RESOURCE_PREFIX = "dev-deployment";
export const RESOURCE_OWNER = "kie-tools";
export const CHECK_UPLOAD_STATUS_POLLING_TIME = 3000;

export abstract class KieSandboxDevDeploymentsService implements KieSandboxDevDeploymentsServiceType {
  id: string;
  type: CloudAuthSessionType.None;

  constructor(readonly args: KubernetesServiceArgs) {}

  get kubernetesService() {
    return new KubernetesService(this.args);
  }

  abstract isConnectionEstablished(): Promise<KubernetesConnectionStatus>;

  abstract loadDevDeployments(): Promise<KieSandboxDeployment[]>;

  abstract deploy(args: DeployArgs): Promise<void>;

  abstract deleteDevDeployment(resources: K8sResourceYaml[]): Promise<void>;

  public extractDevDeploymentState(args: { deployment?: any }): DeploymentState {
    if (!args.deployment || !args.deployment.status) {
      // Deployment still being created
      return DeploymentState.IN_PROGRESS;
    }

    if (!args.deployment.status.replicas) {
      // Deployment with no replicas is down
      return DeploymentState.DOWN;
    }

    const progressingCondition = args.deployment.status.conditions?.find(
      (condition: any) => condition.type === "Progressing"
    );

    if (!progressingCondition || progressingCondition.status !== "True") {
      // Without `Progressing` condition, the deployment will never be up
      return DeploymentState.DOWN;
    }

    if (!args.deployment.status.readyReplicas) {
      // Deployment is progressing but no replicas are ready yet
      return DeploymentState.IN_PROGRESS;
    }

    return DeploymentState.UP;
  }

  public extractDeploymentStateWithHealthStatus(deployment: DeploymentResource, healtStatus: string): DeploymentState {
    const state = this.extractDevDeploymentState({ deployment });

    if (state !== DeploymentState.UP) {
      return state;
    }

    if (healtStatus !== "UP") {
      return DeploymentState.ERROR;
    }

    return DeploymentState.UP;
  }

  public async uploadAssets(args: {
    deployment: DeploymentResource;
    workspaceZipBlob: Blob;
    baseUrl: string;
    apiKey: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      let deploymentState = this.kubernetesService.extractDeploymentState({ deployment: args.deployment });
      const interval = setInterval(async () => {
        if (deploymentState !== DeploymentState.UP) {
          const deployment = await this.getDeployment(args.deployment.metadata.name);
          deploymentState = this.kubernetesService.extractDeploymentState({ deployment });
        } else {
          try {
            const uploadStatus = await getUploadStatus({ baseUrl: args.baseUrl });
            if (uploadStatus === "NOT_READY") {
              return;
            }
            clearInterval(interval);
            if (uploadStatus === "READY") {
              await postUpload({ baseUrl: args.baseUrl, workspaceZipBlob: args.workspaceZipBlob, apiKey: args.apiKey });
              resolve();
            }
          } catch (e) {
            console.error(e);
            reject(e);
            clearInterval(interval);
          }
        }
      }, CHECK_UPLOAD_STATUS_POLLING_TIME);
    });
  }

  public newResourceName(): string {
    return this.kubernetesService.newResourceName(RESOURCE_PREFIX);
  }

  public async listServices(): Promise<ServiceResource[]> {
    const rawServicesApiUrl = this.args.k8sApiServerEndpointsByResourceKind.get("Service")?.get("v1");
    const servicesApiPath = rawServicesApiUrl?.path.namespaced ?? rawServicesApiUrl?.path.global;
    const selector = defaultLabelTokens.createdBy ? `?labelSelector=${defaultLabelTokens.createdBy}` : "";

    if (servicesApiPath) {
      const services = await this.kubernetesService
        .kubernetesFetch(`${servicesApiPath.replace(":namespace", this.args.connection.namespace)}${selector}`)
        .then((data) => data.json());
      return services.items.map((item: ServiceResource) => ({ ...item, kind: "Service" })) as ServiceResource[];
    }

    return [];
  }

  public async listDeployments(): Promise<DeploymentResource[]> {
    const rawDeploymentsApiUrl = this.args.k8sApiServerEndpointsByResourceKind.get("Deployment")?.get("apps/v1");
    const deploymentsApiPath = rawDeploymentsApiUrl?.path.namespaced ?? rawDeploymentsApiUrl?.path.global;
    const selector = defaultLabelTokens.createdBy ? `?labelSelector=${defaultLabelTokens.createdBy}` : "";

    if (deploymentsApiPath) {
      const deployments = await this.kubernetesService
        .kubernetesFetch(`${deploymentsApiPath.replace(":namespace", this.args.connection.namespace)}${selector}`)
        .then((data) => data.json());
      return deployments.items.map((item: DeploymentResource) => ({
        ...item,
        kind: "Deployment",
      })) as DeploymentResource[];
    }

    return [];
  }

  public async getDeployment(resourceId: string): Promise<DeploymentResource> {
    const rawDeploymentsApiUrl = this.args.k8sApiServerEndpointsByResourceKind.get("Deployment")?.get("apps/v1");
    const deploymentsApiPath = rawDeploymentsApiUrl?.path.namespaced ?? rawDeploymentsApiUrl?.path.global;

    if (!deploymentsApiPath) {
      throw new Error("No Deployment API path");
    }

    return await this.kubernetesService
      .kubernetesFetch(`${deploymentsApiPath.replace(":namespace", this.args.connection.namespace)}/${resourceId}`)
      .then((data) => data.json());
  }

  public async deleteDeployment(resource: string) {
    const rawDeploymentsApiUrl = this.args.k8sApiServerEndpointsByResourceKind.get("Deployment")?.get("apps/v1");
    const deploymentsApiPath = rawDeploymentsApiUrl?.path.namespaced ?? rawDeploymentsApiUrl?.path.global;

    if (!deploymentsApiPath) {
      throw new Error("No Deployment API path");
    }

    return await this.kubernetesService
      .kubernetesFetch(`${deploymentsApiPath.replace(":namespace", this.args.connection.namespace)}/${resource}`, {
        method: "DELETE",
      })
      .then((data) => data.json());
  }

  public async deleteService(resource: string) {
    const rawServicesApiUrl = this.args.k8sApiServerEndpointsByResourceKind.get("Service")?.get("v1");
    const servicesApiPath = rawServicesApiUrl?.path.namespaced ?? rawServicesApiUrl?.path.global;

    if (!servicesApiPath) {
      throw new Error("No Service API path");
    }

    return await this.kubernetesService
      .kubernetesFetch(`${servicesApiPath.replace(":namespace", this.args.connection.namespace)}/${resource}`, {
        method: "DELETE",
      })
      .then((data) => data.json());
  }
}
