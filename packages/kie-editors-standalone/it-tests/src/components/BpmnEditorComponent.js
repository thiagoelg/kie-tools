"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BpmnEditorComponent = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var BpmnEditor = require("@kie-tools/kie-editors-standalone/dist/bpmn");
var EditorComponent_1 = require("./EditorComponent");
var BpmnEditorComponent = function (props) {
  return (0, jsx_runtime_1.jsx)(
    EditorComponent_1.EditorComponent,
    __assign({ openEditor: BpmnEditor.open, defaultModelName: "new.bpmn" }, props),
    void 0
  );
};
exports.BpmnEditorComponent = BpmnEditorComponent;
//# sourceMappingURL=BpmnEditorComponent.js.map
