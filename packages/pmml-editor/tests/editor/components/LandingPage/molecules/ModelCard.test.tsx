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
import { render } from "@testing-library/react";
import * as React from "react";
import { Scorecard } from "@kie-tools/pmml-editor-marshaller";
import { ModelCard } from "@kie-tools/pmml-editor/dist/editor/components/LandingPage/molecules";

describe("ModelCard", () => {
  test("render::Basics", () => {
    const onClick = jest.fn((index: number) => null);
    const onDelete = jest.fn((index: number) => null);

    const { getByTestId } = render(
      <ModelCard index={0} modelName={"Name"} modelType={"Scorecard"} onClick={onClick} onDelete={onDelete} />
    );
    expect(getByTestId("model-card")).toMatchSnapshot();

    const element: HTMLElement = getByTestId("model-card__model-type");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("Scorecard");
  });

  test("Delete::click", () => {
    const onClick = jest.fn((index: number) => null);
    const onDelete = jest.fn((index: number) => null);

    const { getByTestId } = render(
      <ModelCard index={0} modelName={"Name"} modelType={"Scorecard"} onClick={onClick} onDelete={onDelete} />
    );
    const element: HTMLElement = getByTestId("model-card__delete");
    expect(element).toBeInTheDocument();
    expect(element).toBeInstanceOf(HTMLButtonElement);

    (element as HTMLButtonElement).click();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(0);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("Click::click", () => {
    const onClick = jest.fn((index: number) => null);
    const onDelete = jest.fn((index: number) => null);

    const { getByTestId } = render(
      <ModelCard index={0} modelName={"Name"} modelType={"Scorecard"} onClick={onClick} onDelete={onDelete} />
    );
    const element: HTMLElement = getByTestId("model-card");
    expect(element).toBeInTheDocument();
    expect(element).toBeInstanceOf(HTMLElement);

    (element as HTMLElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(0);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
