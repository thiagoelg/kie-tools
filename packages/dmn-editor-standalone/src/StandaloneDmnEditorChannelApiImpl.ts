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

import {
  ContentType,
  WorkspaceEdit,
  ResourceContent,
  ResourceContentRequest,
  ResourceListRequest,
  ResourcesList,
} from "@kie-tools-core/workspace/dist/api";
import {
  EditorContent,
  EditorTheme,
  KogitoEditorChannelApi,
  StateControlCommand,
} from "@kie-tools-core/editor/dist/api";
import { EmbeddedEditorFile, StateControl } from "@kie-tools-core/editor/dist/channel";
import { Minimatch } from "minimatch";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { dirname, normalize } from "path";

export type StandaloneDmnEditorResource = { contentType: ContentType; content: Promise<string> };

export class StandaloneDmnEditorChannelApiImpl implements KogitoEditorChannelApi {
  constructor(
    private readonly stateControl: StateControl,
    private readonly file: EmbeddedEditorFile,
    private readonly locale: string,
    private readonly overrides: Partial<KogitoEditorChannelApi>,
    private readonly resources: Map<
      string /** normalized posix path relative to the "workspace" root */,
      StandaloneDmnEditorResource
    >
  ) {}

  public kogitoWorkspace_newEdit(edit: WorkspaceEdit) {
    this.stateControl.updateCommandStack({ id: edit.id });
    this.overrides.kogitoWorkspace_newEdit?.(edit);
  }

  public kogitoEditor_stateControlCommandUpdate(command: StateControlCommand) {
    switch (command) {
      case StateControlCommand.REDO:
        this.stateControl.redo();
        break;
      case StateControlCommand.UNDO:
        this.stateControl.undo();
        break;
      default:
        console.info(`Unknown message type received: ${command}`);
        break;
    }
    this.overrides.kogitoEditor_stateControlCommandUpdate?.(command);
  }

  public async kogitoEditor_contentRequest() {
    const content = await this.file.getFileContents();
    return {
      content: content ?? "",
      normalizedPosixPathRelativeToTheWorkspaceRoot: this.file.normalizedPosixPathRelativeToTheWorkspaceRoot,
    };
  }

  public async kogitoWorkspace_resourceContentRequest(request: ResourceContentRequest) {
    const resource = this.resources?.get(request.normalizedPosixPathRelativeToTheWorkspaceRoot);

    if (!resource) {
      console.warn(
        "The editor requested an unspecified resource: " + request.normalizedPosixPathRelativeToTheWorkspaceRoot
      );
      return new ResourceContent(request.normalizedPosixPathRelativeToTheWorkspaceRoot, undefined);
    }

    const requestedContentType = request.opts?.type ?? resource.contentType;
    if (requestedContentType !== resource.contentType) {
      console.warn(
        "The editor requested a resource with a different content type from the one specified: " +
          request.normalizedPosixPathRelativeToTheWorkspaceRoot +
          ". Content type requested: " +
          requestedContentType
      );
      return new ResourceContent(request.normalizedPosixPathRelativeToTheWorkspaceRoot, undefined);
    }

    return new ResourceContent(
      request.normalizedPosixPathRelativeToTheWorkspaceRoot,
      await resource.content,
      resource.contentType
    );
  }

  public async kogitoWorkspace_resourceListRequest(request: ResourceListRequest) {
    if (!this.resources) {
      return new ResourcesList(request.pattern, []);
    }

    const matcher = new Minimatch(request.pattern);

    // Match the generic glob pattern for DMN files, then filter out files that are not on the same parent path as the current file.
    const matches = Array.from(this.resources.keys())
      .filter((path) => matcher.match(path))
      .filter((path) => dirname(normalize(path)) == dirname(this.file.normalizedPosixPathRelativeToTheWorkspaceRoot));

    return new ResourcesList(request.pattern, matches);
  }

  public kogitoWorkspace_openFile(normalizedPosixPathRelativeToTheWorkspaceRoot: string): void {
    this.overrides.kogitoWorkspace_openFile?.(normalizedPosixPathRelativeToTheWorkspaceRoot);
  }

  public kogitoEditor_ready(): void {
    this.overrides.kogitoEditor_ready?.();
  }

  public kogitoEditor_theme() {
    return this.overrides.kogitoEditor_theme?.() ?? { defaultValue: EditorTheme.LIGHT };
  }

  public kogitoEditor_setContentError(editorContent: EditorContent): void {
    this.overrides.kogitoEditor_setContentError?.(editorContent);
  }

  public kogitoI18n_getLocale(): Promise<string> {
    return Promise.resolve(this.locale);
  }

  public kogitoNotifications_createNotification(notification: Notification): void {
    this.overrides.kogitoNotifications_createNotification?.(notification);
  }

  public kogitoNotifications_setNotifications(
    normalizedPosixPathRelativeToTheWorkspaceRoot: string,
    notifications: Notification[]
  ): void {
    this.overrides.kogitoNotifications_setNotifications?.(normalizedPosixPathRelativeToTheWorkspaceRoot, notifications);
  }

  public kogitoNotifications_removeNotifications(normalizedPosixPathRelativeToTheWorkspaceRoot: string): void {
    this.overrides.kogitoNotifications_removeNotifications?.(normalizedPosixPathRelativeToTheWorkspaceRoot);
  }
}
