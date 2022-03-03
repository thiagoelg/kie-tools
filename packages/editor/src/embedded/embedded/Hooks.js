"use strict";
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEditorRef = void 0;
var react_1 = require("react");
function useEditorRef() {
  var _a = __read((0, react_1.useState)(undefined), 2),
    editor = _a[0],
    setEditor = _a[1];
  var editorRef = (0, react_1.useCallback)(function (node) {
    if (node) {
      setEditor(node);
    }
  }, []);
  return { editor: editor, editorRef: editorRef };
}
exports.useEditorRef = useEditorRef;
//# sourceMappingURL=Hooks.js.map
