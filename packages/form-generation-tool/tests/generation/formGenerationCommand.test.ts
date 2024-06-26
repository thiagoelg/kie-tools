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

import { generateForms } from "../../src/generation";
import * as fs from "../../src/generation/fs";
import { FormAsset, FormGenerationTool, FormSchema } from "../../src/generation/types";
import { ApplyForVisaSchema, ConfirmTravelSchema } from "./tools/uniforms/patternfly/mock";
import { registerFormGenerationTool } from "../../src/generation/tools";
import { inputSanitizationUtil } from "../../src/generation/tools/uniforms/utils/InputSanitizationUtil";

jest.mock("../../src/generation/fs");

describe("formGenerationCommand tests", () => {
  const loadProjectSchemasMock = jest.spyOn(fs, "loadProjectSchemas");
  const storeFormAssetsMock = jest.spyOn(fs, "storeFormAsset");

  const sourcePath = "/a/test/path";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Generate forms with wrong tool type", () => {
    generateForms({
      path: sourcePath,
      type: "wrong type",
      overwrite: true,
    });

    expect(loadProjectSchemasMock).not.toHaveBeenCalled();
    expect(storeFormAssetsMock).not.toHaveBeenCalled();
  });

  it("Generate forms for empty project", () => {
    loadProjectSchemasMock.mockReturnValueOnce([]);

    generateForms({
      path: sourcePath,
      type: "patternfly",
      overwrite: true,
    });

    expect(loadProjectSchemasMock).toHaveBeenCalledTimes(1);
    expect(storeFormAssetsMock).not.toHaveBeenCalled();
  });

  it("Generate forms project with schemas", () => {
    const schemas: FormSchema[] = [
      {
        name: "Apply#For#Visa",
        schema: ApplyForVisaSchema,
      },
      {
        name: "ConfirmTravel",
        schema: ConfirmTravelSchema,
      },
    ];

    loadProjectSchemasMock.mockReturnValueOnce(schemas);

    generateForms({
      path: sourcePath,
      type: "patternfly",
      overwrite: true,
    });

    expect(loadProjectSchemasMock).toHaveBeenCalledTimes(1);
    expect(storeFormAssetsMock).toHaveBeenCalledTimes(2);

    const applyForVisaAsset: FormAsset = storeFormAssetsMock.mock.calls[0][0];
    expect(applyForVisaAsset.id).toEqual("Apply#For#Visa");
    expect(applyForVisaAsset.sanitizedId).toEqual("Apply_For_Visa");
    expect(applyForVisaAsset.assetName).toEqual("Apply#For#Visa.tsx");
    expect(applyForVisaAsset.sanitizedAssetName).toEqual("Apply_For_Visa.tsx");
    expect(applyForVisaAsset.content).toContain("const Form__Apply_For_Visa");
    expect(storeFormAssetsMock.mock.calls[0][1]).toEqual(sourcePath);
    expect(storeFormAssetsMock.mock.calls[0][2]).toBeTruthy();

    const confirmTravelAsset: FormAsset = storeFormAssetsMock.mock.calls[1][0];
    expect(confirmTravelAsset.id).toEqual("ConfirmTravel");
    expect(confirmTravelAsset.sanitizedId).toEqual("ConfirmTravel");
    expect(confirmTravelAsset.assetName).toEqual("ConfirmTravel.tsx");
    expect(confirmTravelAsset.sanitizedAssetName).toEqual("ConfirmTravel.tsx");
    expect(confirmTravelAsset.content).toContain("const Form__ConfirmTravel");
    expect(storeFormAssetsMock.mock.calls[1][1]).toEqual(sourcePath);
    expect(storeFormAssetsMock.mock.calls[1][2]).toBeTruthy();
  });

  it("Generate forms project with schemas and one failure", () => {
    const ERROR_MESSAGE = "Unexpected Error!";

    const tool: FormGenerationTool = {
      type: "cool tool",

      generate(schema: FormSchema): FormAsset {
        if (schema.name === "ApplyForVisa") {
          throw new Error(ERROR_MESSAGE);
        }

        return {
          id: schema.name,
          sanitizedId: inputSanitizationUtil(schema.name),
          content: schema.name,
          type: "txt",
          assetName: `${schema.name}.txt`,
          sanitizedAssetName: `${inputSanitizationUtil(schema.name)}.txt`,
          config: {
            schema: "",
            resources: { styles: {}, scripts: {} },
          },
        };
      },
    };

    registerFormGenerationTool(tool);

    const schemas: FormSchema[] = [
      {
        name: "ApplyForVisa",
        schema: ApplyForVisaSchema,
      },
      {
        name: "ConfirmTravel",
        schema: ConfirmTravelSchema,
      },
    ];

    loadProjectSchemasMock.mockReturnValueOnce(schemas);

    generateForms({
      path: sourcePath,
      type: tool.type,
      overwrite: true,
    });

    expect(loadProjectSchemasMock).toHaveBeenCalledTimes(1);
    expect(storeFormAssetsMock).toHaveBeenCalledTimes(1);
  });
});
