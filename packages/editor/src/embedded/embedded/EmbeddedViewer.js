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
exports.EmbeddedViewer = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var EmbeddedEditor_1 = require("./EmbeddedEditor");
var EmbeddedViewer = function (props) {
  return (0, jsx_runtime_1.jsx)(EmbeddedEditor_1.EmbeddedEditor, __assign({}, props), void 0);
};
exports.EmbeddedViewer = EmbeddedViewer;
//# sourceMappingURL=EmbeddedViewer.js.map
