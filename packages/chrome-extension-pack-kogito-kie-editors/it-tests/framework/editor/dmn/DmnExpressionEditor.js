"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
var selenium_webdriver_1 = require("selenium-webdriver");
var PageFragment_1 = require("../../PageFragment");
var chai_1 = require("chai");
var DmnExpressionEditor = (function (_super) {
  __extends(DmnExpressionEditor, _super);
  function DmnExpressionEditor() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  DmnExpressionEditor.prototype.waitUntilLoaded = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, this.tools.by(DmnExpressionEditor.RETURN_TO_GRAPH_LOCATOR).wait(1000).untilPresent()];
          case 1:
            return [2, _a.sent()];
        }
      });
    });
  };
  DmnExpressionEditor.prototype.activateBetaVersion = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activateBetaButton;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, this.tools.by(DmnExpressionEditor.BETA_VERSION_ACTIVATOR_LOCATOR).getElement()];
          case 1:
            activateBetaButton = _a.sent();
            return [4, activateBetaButton.click()];
          case 2:
            _a.sent();
            return [4, this.tools.by(DmnExpressionEditor.BETA_VERSION_INDICATOR_LOCATOR).wait(1000).untilPresent()];
          case 3:
            return [2, _a.sent()];
        }
      });
    });
  };
  DmnExpressionEditor.prototype.assertExpressionIsPresent = function (expectedTitle, expectedType) {
    return __awaiter(this, void 0, void 0, function () {
      var type, _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            return [
              4,
              this.tools
                .by(
                  selenium_webdriver_1.By.xpath(
                    "//div[@data-ouia-component-type='expression-column-header-cell-info']/p[text()='".concat(
                      expectedTitle,
                      "']"
                    )
                  )
                )
                .wait(1000)
                .untilPresent(),
            ];
          case 1:
            _d.sent();
            return [
              4,
              this.tools
                .by(
                  selenium_webdriver_1.By.xpath(
                    "//div[@data-ouia-component-type='expression-column-header-cell-info']/p[contains(@class, 'data-type')]"
                  )
                )
                .getElement(),
            ];
          case 2:
            type = _d.sent();
            _b = (_a = chai_1.assert).equal;
            _c = ["(" + expectedType + ")"];
            return [4, type.getText()];
          case 3:
            _b.apply(_a, _c.concat([_d.sent()]));
            return [2];
        }
      });
    });
  };
  DmnExpressionEditor.RETURN_TO_GRAPH_LOCATOR = selenium_webdriver_1.By.className("kie-dmn-return-to-link");
  DmnExpressionEditor.BETA_VERSION_ACTIVATOR_LOCATOR = selenium_webdriver_1.By.xpath("//a[@data-field='try-it']");
  DmnExpressionEditor.BETA_VERSION_INDICATOR_LOCATOR = selenium_webdriver_1.By.className("beta-badge");
  return DmnExpressionEditor;
})(PageFragment_1.default);
exports.default = DmnExpressionEditor;
//# sourceMappingURL=DmnExpressionEditor.js.map
