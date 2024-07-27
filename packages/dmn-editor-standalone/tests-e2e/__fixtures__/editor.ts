import { DmnEditorStandaloneApi } from "./../../src/DmnEditorStandaloneApi";
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

import { Page, expect } from "@playwright/test";
import type { open } from "../../src/index";
import { ContentType } from "@kie-tools-core/workspace/dist/api";

declare global {
  interface Window {
    DmnEditor: { open: typeof open };
    currentEditor: DmnEditorStandaloneApi;
    editCounter: number;
    contentChangesCallback: (isDirty: boolean) => void;
  }
}

export class Editor {
  constructor(
    public page: Page,
    public baseURL?: string
  ) {}

  public async open(args?: {
    resources?: Array<[string, { contentType: ContentType; content: string }]>;
    initialFileNormalizedPosixPathRelativeToTheWorkspaceRoot?: string;
  }) {
    await this.page.goto("");
    await this.page.evaluate((args) => {
      window.currentEditor = window.DmnEditor.open({
        container: document.getElementById("dmn-editor-container")!,
        initialContent: Promise.resolve(""),
        initialFileNormalizedPosixPathRelativeToTheWorkspaceRoot:
          args?.initialFileNormalizedPosixPathRelativeToTheWorkspaceRoot ?? "model.dmn",
        resources: args?.resources
          ? new Map(
              args.resources.map(([key, value]) => [
                key,
                { contentType: value.contentType, content: Promise.resolve(value.content) },
              ])
            )
          : undefined,
      });

      window.editCounter = 0;

      document.getElementById("edit-counter")!.innerHTML = "0";
      document.getElementById("is-dirty")!.innerHTML = "false";
    }, args);
    this.subscribeToContentChanges();
    const dmnEditorIFrame = this.page.frameLocator("#dmn-editor-standalone");
    await expect(dmnEditorIFrame.getByText("This DMN's Diagram is empty")).toBeAttached();
  }

  public async close() {
    await this.page.evaluate(() => {
      window.currentEditor.close();
    });
  }

  public getEditorIframe() {
    return this.page.frameLocator("#dmn-editor-standalone");
  }

  public getEditorDiagram() {
    return this.getEditorIframe().getByTestId("kie-dmn-editor--diagram-container");
  }

  public async resetFocus() {
    return this.getEditorDiagram().click({ position: { x: 0, y: 0 } });
  }

  public async setContent(contentName: string, content: string) {
    return this.page.evaluate(
      async ({ contentName, content }) => {
        return window.currentEditor.setContent(contentName, content);
      },
      { contentName, content }
    );
  }

  public async getContent() {
    return this.page.evaluate(async () => await window.currentEditor.getContent());
  }

  public async getPreview() {
    return this.page.evaluate(async () => await window.currentEditor.getPreview());
  }

  public async subscribeToContentChanges() {
    return this.page.evaluate(() => {
      window.contentChangesCallback = (isDirty: boolean) => {
        window.editCounter += 1;
        document.getElementById("edit-counter")!.innerHTML = window.editCounter.toString();
        document.getElementById("is-dirty")!.innerHTML = isDirty.toString();
      };

      window.currentEditor.subscribeToContentChanges(window.contentChangesCallback);
    });
  }

  public async unsubscribeToContentChanges() {
    return this.page.evaluate(() => {
      window.currentEditor.unsubscribeToContentChanges(window.contentChangesCallback);
    });
  }

  public async undo() {
    return this.page.evaluate(async () => await window.currentEditor.undo());
  }

  public async redo() {
    return this.page.evaluate(async () => await window.currentEditor.redo());
  }

  public async markAsSaved() {
    return this.page.evaluate(async () => await window.currentEditor.markAsSaved());
  }
}
