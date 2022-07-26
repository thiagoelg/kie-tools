import "./KaotoEditor.css";
import { AlertProvider, MASLoading } from "./components/components";
import { AppLayout } from "./components/layouts/AppLayout";
import { AppRoutes } from "./components/routes";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import * as React from "react";
import { KogitoEdit } from "@kie-tools-core/workspace/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";

interface Props {
  /**
   * Callback to the container so that it may bind to the KaotoEditor.
   *
   * @returns Instance of the KaotoEditor.
   */
  exposing: (s: KaotoEditor) => void;

  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_ready() to signal to the Channel
   * that the editor is ready. Increases the decoupling of the KaotoEditor from the Channel.
   */
  ready: () => void;

  /**
   * Delegation for KIEToolsWorkspaceApi.kogitoWorkspace_newEdit(edit) to signal to the Channel
   * that a change has taken place. Increases the decoupling of the KaotoEditor from the Channel.
   * @param edit An object representing the unique change.
   */
  newEdit: (edit: KogitoEdit) => void;

  /**
   * Delegation for NotificationsApi.setNotifications(path, notifications) to report all validation
   * notifications to the Channel that  will replace existing notification for the path. Increases the
   * decoupling of the KaotoEditor from the Channel.
   * @param path The path that references the Notification
   * @param notifications List of Notifications
   */
  setNotifications: (path: string, notifications: Notification[]) => void;
}

export interface State {
  path: string;
  content: string;
  originalContent: string;
}

export class KaotoEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    props.exposing(this);
    this.state = {
      path: "",
      content: "",
      originalContent: "",
    };
  }

  public componentDidMount(): void {
    this.props.ready();
  }

  public setContent(path: string, content: string): Promise<void> {
    try {
      this.doSetContent(path, content);
      return Promise.resolve();
    } catch (e) {
      console.error(e);
      return Promise.reject();
    }
  }

  private doSetContent(path: string, content: string): void {
    this.setState({ path: path, content: content, originalContent: content });
  }

  public getContent(): Promise<string> {
    return Promise.resolve(this.doGetContent());
  }

  private doGetContent(): string {
    return this.state.content;
  }

  public async undo(): Promise<void> {
    return Promise.resolve(this.doUndo());
  }

  private doUndo(): void {}

  public async redo(): Promise<void> {
    return Promise.resolve(this.doRedo());
  }

  private doRedo(): void {}

  public validate(): Notification[] {
    return [];
  }

  public render() {
    return (
      <AlertProvider>
        <Router>
          <Suspense fallback={<MASLoading />}>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Suspense>
        </Router>
      </AlertProvider>
    );
  }
}
