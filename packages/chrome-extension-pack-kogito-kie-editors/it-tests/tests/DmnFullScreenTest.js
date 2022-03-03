"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var GitHubEditorPage_1 = require("../framework/github-editor/GitHubEditorPage");
var Tools_1 = require("../utils/Tools");
var TEST_NAME = "DmnFullScreenTest";
var tools;
beforeEach(function () {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4, Tools_1.default.init(TEST_NAME)];
        case 1:
          tools = _a.sent();
          return [2];
      }
    });
  });
});
test(TEST_NAME, function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var dmnUrl, dmnPage, fullScreenPage, fullScreenEditor, fullScreenSideBar, fullScreenExplorer, _a, _b, _c, _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          dmnUrl =
            "https://github.com/kiegroup/kie-tools/" +
            "blob/main/packages/chrome-extension-pack-kogito-kie-editors/it-tests/samples/test.dmn";
          return [4, tools.openPage(GitHubEditorPage_1.default, dmnUrl)];
        case 1:
          dmnPage = _e.sent();
          return [4, dmnPage.fullScreen()];
        case 2:
          fullScreenPage = _e.sent();
          return [4, fullScreenPage.getDmnEditor()];
        case 3:
          fullScreenEditor = _e.sent();
          return [4, fullScreenEditor.enter()];
        case 4:
          _e.sent();
          return [4, fullScreenEditor.getSideBar()];
        case 5:
          fullScreenSideBar = _e.sent();
          return [4, fullScreenSideBar.openDecisionNavigator()];
        case 6:
          fullScreenExplorer = _e.sent();
          _a = expect;
          return [4, fullScreenExplorer.getNodeNames()];
        case 7:
          _a.apply(void 0, [_e.sent().sort()]).toEqual(["MyDecision", "MyInputData", "MyModel", "Function"].sort());
          return [4, fullScreenEditor.leave()];
        case 8:
          _e.sent();
          _b = expect;
          return [4, fullScreenPage.getExitFullScreenUrl()];
        case 9:
          _b.apply(void 0, [_e.sent()]).toBe(dmnUrl + "#");
          return [4, fullScreenPage.scrollToTop()];
        case 10:
          _e.sent();
          return [4, fullScreenPage.exitFullScreen()];
        case 11:
          dmnPage = _e.sent();
          _c = expect;
          return [4, dmnPage.isEditorVisible()];
        case 12:
          _c.apply(void 0, [_e.sent()]).toBe(true);
          _d = expect;
          return [4, dmnPage.isSourceVisible()];
        case 13:
          _d.apply(void 0, [_e.sent()]).toBe(false);
          return [2];
      }
    });
  });
});
afterEach(function () {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4, tools.finishTest()];
        case 1:
          _a.sent();
          return [2];
      }
    });
  });
});
//# sourceMappingURL=DmnFullScreenTest.js.map
