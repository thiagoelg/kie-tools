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

import * as React from "react";
import { TextField } from "../src/uniforms";
import { renderField } from "./_render";

const schema = {
  name: { type: String },
};

describe("<TextField> tests", () => {
  it("<TextField> - TextInput rendering", () => {
    const props = {
      id: "id",
      label: "label",
      name: "name",
    };

    const { container, formElement } = renderField(TextField, props, schema);

    expect(container).toMatchSnapshot();

    expect(formElement.html).toContain('<label for="name">label</label>');
    expect(formElement.html).toContain('id="name"');
    expect(formElement.html).toContain('type="text"');
    expect(formElement.html).toContain('name="name"');
    expect(formElement.html).not.toContain("autoComplete");
    expect(formElement.html).not.toContain("disabled");
    expect(formElement.html).not.toContain("placeholder");

    expect(formElement.setValueFromModelCode).not.toBeUndefined();
    expect(formElement.writeValueToModelCode).not.toBeUndefined();
  });

  it("<TextField> - TextInput rendering - full", () => {
    const props = {
      id: "id",
      label: "label",
      name: "name",
      disabled: true,
      autoComplete: "off",
      placeholder: "placeholder",
    };

    const { container, formElement } = renderField(TextField, props, schema);

    expect(container).toMatchSnapshot();

    expect(formElement.html).toContain('<label for="name">label</label>');
    expect(formElement.html).toContain('id="name"');
    expect(formElement.html).toContain('type="text"');
    expect(formElement.html).toContain('name="name"');
    expect(formElement.html).toContain('autoComplete="off"');
    expect(formElement.html).toContain("disabled");
    expect(formElement.html).toContain('placeholder="placeholder"');

    expect(formElement.setValueFromModelCode).not.toBeUndefined();
    expect(formElement.writeValueToModelCode).toBeUndefined();
  });
});
