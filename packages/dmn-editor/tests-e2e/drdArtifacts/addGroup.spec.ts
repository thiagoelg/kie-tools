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

import { TestAnnotations } from "@kie-tools/playwright-base/annotations";
import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Group", () => {
  test.describe("add from the palette", () => {
    test("should add Group node from palette", async ({ palette, nodes, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });

      await expect(nodes.get({ name: DefaultNodeName.GROUP })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-group-node-from-palette.png");
    });

    test("should add multiple Group nodes from palette in a row", async ({ palette, nodes, diagram }) => {
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
        description: "https://github.com/apache/incubator-kie-issues/issues/980",
      });

      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.GROUP,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Group",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: DefaultNodeName.GROUP })).toBeAttached();
      await expect(nodes.get({ name: "Second Group" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-2-group-nodes-from-palette.png");
    });
  });
});
