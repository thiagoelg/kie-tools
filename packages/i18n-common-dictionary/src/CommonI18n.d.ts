import { ReferenceDictionary } from "@kie-tools-core/i18n/dist/core";
import { names } from "./names";
export declare type CommonDictionary = {
  available: string;
  back: string;
  cancel: string;
  change: string;
  close: string;
  configure: string;
  confirm: string;
  connected: string;
  continue: string;
  copy: string;
  cut: string;
  deploy: string;
  disconnected: string;
  dismiss: string;
  done: string;
  download: string;
  edit: string;
  edited: string;
  execution: string;
  exit: string;
  file: string;
  files: string;
  forum: string;
  fullScreen: string;
  host: string;
  inputs: string;
  install: string;
  launch: string;
  loading: string;
  macosApplicationFolder: string;
  namespace: string;
  new: string;
  next: string;
  note: string;
  open: string;
  oops: string;
  os: {
    initials: string;
    full: string;
  };
  outputs: string;
  paste: string;
  poweredBy: string;
  quit: string;
  readonly: string;
  redo: string;
  reset: string;
  run: string;
  save: string;
  setup: string;
  start: string;
  token: string;
  undo: string;
  uninstall: string;
  username: string;
  validation: string;
};
export interface CommonI18n extends ReferenceDictionary {
  names: typeof names;
  terms: CommonDictionary;
}
//# sourceMappingURL=CommonI18n.d.ts.map
