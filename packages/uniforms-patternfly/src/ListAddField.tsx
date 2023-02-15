/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
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

import * as React from "react";
import cloneDeep from "lodash/cloneDeep";
import { Button, ButtonProps } from "@patternfly/react-core/dist/js/components/Button";
import { PlusCircleIcon } from "@patternfly/react-icons/dist/js/icons/plus-circle-icon";
import { connectField, FieldProps, filterDOMProps, joinName, useField } from "uniforms";

export type ListAddFieldProps = FieldProps<
  unknown,
  ButtonProps,
  {
    initialCount?: number;
    name: string;
    disabled?: boolean;
    value?: unknown;
  }
>;

function ListAddField({ disabled = false, name, value, ...props }: ListAddFieldProps) {
  const nameParts = joinName(null, name);
  const parentName = joinName(nameParts.slice(0, -1));
  const parent = useField<{ maxCount?: number }, unknown[]>(parentName, {}, { absoluteName: true })[0];

  const limitNotReached = !disabled && !(parent.maxCount! <= parent.value!.length);

  return (
    <Button
      data-testid={"list-add-field"}
      variant="plain"
      style={{ paddingLeft: "0", paddingRight: "0" }}
      disabled={!limitNotReached}
      onClick={() => {
        !disabled && limitNotReached && parent.onChange(parent.value!.concat([cloneDeep(value)]));
      }}
      {...filterDOMProps(props)}
    >
      <PlusCircleIcon color="#0088ce" />
    </Button>
  );
}

export default connectField<ListAddFieldProps>(ListAddField, {
  initialValue: false,
  kind: "leaf",
});
