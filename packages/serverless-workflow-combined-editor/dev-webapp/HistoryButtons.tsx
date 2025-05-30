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

import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { Modal, ModalVariant } from "@patternfly/react-core/dist/js/components/Modal";
import { Switch } from "@patternfly/react-core/dist/js/components/Switch";
import { Split, SplitItem } from "@patternfly/react-core/dist/js/layouts/Split";
import { Text, TextContent } from "@patternfly/react-core/dist/js/components/Text";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import "./HistoryButtons.scss";
import { EditorTheme } from "@kie-tools-core/editor/dist/api";

interface HistoryButtonsProps {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  get: () => Promise<string>;
  setTheme: (theme: EditorTheme) => Promise<void>;
  validate: () => Promise<void>;
  isDirty: boolean;
}

export const HistoryButtons = (props: HistoryButtonsProps) => {
  const [theme, setTheme] = useState<EditorTheme>(EditorTheme.LIGHT);

  return (
    <div className="history-buttons ignore-onclickoutside">
      <Split hasGutter={true}>
        <SplitItem>
          <Button variant="primary" onClick={props.undo} ouiaId="undo-button">
            Undo
          </Button>
        </SplitItem>
        <SplitItem>
          <Button variant="secondary" onClick={props.redo} ouiaId="redo-button">
            Redo
          </Button>
        </SplitItem>
        <SplitItem>
          <ServerlessWorkflowModal get={props.get} />
        </SplitItem>
        <SplitItem>
          <Button variant="secondary" onClick={props.validate} ouiaId="validate-button">
            Validate
          </Button>
        </SplitItem>
        <SplitItem className="history-buttons__theme-switch">
          <Switch
            id="theme"
            label="Dark"
            labelOff="Light"
            checked={theme === EditorTheme.DARK}
            onChange={(_event, checked) => {
              setTheme(checked ? EditorTheme.DARK : EditorTheme.LIGHT);
              props.setTheme(checked ? EditorTheme.DARK : EditorTheme.LIGHT);
            }}
          />
        </SplitItem>
        {props.isDirty && (
          <SplitItem className="history-buttons__edited-indicator">
            <TextContent>
              <Text component={"small"}>{"(Edited)"}</Text>
            </TextContent>
          </SplitItem>
        )}
      </Split>
      <hr className="history-buttons__divider" />
    </div>
  );
};

const ServerlessWorkflowModal = (props: { get: () => Promise<string> }) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const textRef = useRef<HTMLDivElement | null>(null);

  const handleModalToggle = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (isModalOpen) {
      props.get().then((content: string) => {
        if (textRef.current) {
          textRef.current.innerText = content;
        }
      });
    }
  }, [isModalOpen, props]);

  return (
    <React.Fragment>
      <Button variant="secondary" onClick={handleModalToggle} ouiaId="serverless-workflow-button">
        Serverless Workflow
      </Button>
      <Modal
        variant={ModalVariant.large}
        title="ServerlessWorkflow"
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button key="ok" variant="primary" onClick={handleModalToggle} ouiaId="serverless-workflow-modal-confirm">
            OK
          </Button>,
        ]}
        style={{ overflowX: "scroll" }}
        appendTo={() => document.querySelector(".history-buttons") as HTMLElement}
      >
        <pre data-ouia-component-type="source-code">
          <div ref={textRef} />
        </pre>
      </Modal>
    </React.Fragment>
  );
};
