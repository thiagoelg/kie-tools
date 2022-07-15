/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isJson, isSpec } from "../../../extension";
import { WorkspaceFile } from "../../WorkspacesContext";
import { generateOpenApiSpec } from "./BaseOpenApiSpec";
import { ServiceRegistryFile } from "./ServiceRegistryFile";
import { DescriptorBase } from "../../commonServices/DescriptorService";
import * as yaml from "yaml";
import { decoder } from "../../commonServices/BaseFile";
import { OpenAPIV3 } from "openapi-types";

export const VIRTUAL_SERVICE_REGISTRY_PATH_PREFIX = "sandbox::";

export type GroupPath = `${
  | "/"
  | ""}${typeof VIRTUAL_SERVICE_REGISTRY_PATH_PREFIX}${VirtualServiceRegistryGroup["groupId"]}`;

export type FunctionPath = `${GroupPath}/${VirtualServiceRegistryFunction["name"]}`;

export class VirtualServiceRegistryFunction {
  public name: string;
  public isSpec: boolean;
  public isFromServiceRegistryFile = false;

  constructor(public file: WorkspaceFile | ServiceRegistryFile) {
    if (file instanceof WorkspaceFile) {
      this.name = file.relativePath;
      this.isSpec = isSpec(file.relativePath);
    } else {
      this.name = file.name;
      this.isSpec = isSpec(file.relativeDirPath);
      this.isFromServiceRegistryFile = true;
    }
  }

  public async getOpenApiSpec() {
    const content = await this.file.getFileContents();
    if (this.isSpec || this.isFromServiceRegistryFile) {
      return decoder.decode(content);
    }
    const decodedContent = decoder.decode(content);
    try {
      const parsedContent = isJson(this.file.relativePath) ? JSON.parse(decodedContent) : yaml.parse(decodedContent);
      if (!parsedContent["id"]) {
        throw new Error("No workflow ID!");
      }
      return await generateOpenApiSpec(parsedContent["id"]);
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  public async hasVirtualServiceRegistryDependency() {
    if (!(this.isSpec || this.isFromServiceRegistryFile) && this.file instanceof WorkspaceFile) {
      const content = await this.file.getFileContentsAsString();
      const parsedContent = isJson(this.file.relativePath) ? JSON.parse(content) : yaml.parse(content);
      const workflowFunctions = parsedContent["functions"] as Array<{ operation?: string }> | undefined;
      if (
        workflowFunctions?.some((workflowFunction) =>
          workflowFunction.operation?.includes(VIRTUAL_SERVICE_REGISTRY_PATH_PREFIX)
        )
      ) {
        return true;
      }
    }
    return false;
  }

  get extension() {
    return this.isSpec ? this.file.extension : "yaml";
  }
}

export interface VirtualServiceRegistryGroup extends DescriptorBase {
  groupId: string;
  groupName: string;
  createdDateISO: string;
  lastUpdatedDateISO: string;
}

export function groupPath(
  virtualServiceRegistryGroup: {
    groupId?: VirtualServiceRegistryGroup["groupId"];
  },
  excludePrefixSlash = false
): GroupPath {
  return `${excludePrefixSlash ? "" : "/"}${VIRTUAL_SERVICE_REGISTRY_PATH_PREFIX}${
    virtualServiceRegistryGroup.groupId
  }`;
}

export function functionPath(
  virtualServiceRegistryGroup: { groupId: VirtualServiceRegistryGroup["groupId"] },
  serviceFunction: VirtualServiceRegistryFunction,
  excludePrefixSlash = false
): FunctionPath {
  return `${groupPath(virtualServiceRegistryGroup, excludePrefixSlash)}/${serviceFunction.name}`;
}

export function functionPathFromWorkspaceFilePath(
  virtualServiceRegistryGroup: { groupId?: VirtualServiceRegistryGroup["groupId"] },
  relativePath?: WorkspaceFile["relativePath"],
  excludePrefixSlash = false
) {
  return `${groupPath(virtualServiceRegistryGroup, excludePrefixSlash)}/${relativePath}`;
}