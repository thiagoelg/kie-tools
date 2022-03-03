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
exports.PingPongEnvelopeView = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var PingPongViewEnvelope = require("@kie-tools-examples/ping-pong-view/dist/envelope");
var _1 = require(".");
require("./styles.css");
var PingPongEnvelopeView = function (props) {
  var _a = __read((0, react_1.useState)(), 2),
    view = _a[0],
    setView = _a[1];
  (0, react_1.useEffect)(
    function () {
      PingPongViewEnvelope.init({
        config: props.envelopeConfig,
        bus: {
          postMessage: function (message, _targetOrigin, transfer) {
            return window.parent.postMessage(message, "*", transfer);
          },
        },
        pingPongViewFactory: new _1.PingPongReactImplFactory(setView),
      });
    },
    [props.envelopeConfig]
  );
  return (0, jsx_runtime_1.jsxs)(
    "div",
    __assign(
      { className: "ping-pong-view--main" },
      {
        children: [
          (0, jsx_runtime_1.jsx)("h2", { children: "This is an implementation of Ping-Pong View in React" }, void 0),
          (0, jsx_runtime_1.jsxs)(
            "p",
            __assign(
              { className: "ping-pong-view--p-iframe" },
              { children: [" ", "The envelope boundary border is green. It can be an iframe or a div."] }
            ),
            void 0
          ),
          (0, jsx_runtime_1.jsx)(
            "p",
            __assign(
              { className: "ping-pong-view--p-ping-pong" },
              { children: " The Ping-Pong View implementation border is red " }
            ),
            void 0
          ),
          (0, jsx_runtime_1.jsx)(
            "div",
            __assign({ id: "ping-pong-view-container", className: "ping-pong-view--container" }, { children: view }),
            void 0
          ),
        ],
      }
    ),
    void 0
  );
};
exports.PingPongEnvelopeView = PingPongEnvelopeView;
//# sourceMappingURL=PingPongEnvelopeView.js.map
