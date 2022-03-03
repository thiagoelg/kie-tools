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
exports.DmnRunnerService = void 0;
var DmnRunnerService = (function () {
  function DmnRunnerService(baseUrl) {
    this.baseUrl = baseUrl;
    this.DMN_RUNNER_VALIDATE_URL = "".concat(this.baseUrl, "/jitdmn/validate");
    this.DMN_RUNNER_DMN_RESULT_URL = "".concat(this.baseUrl, "/jitdmn/dmnresult");
    this.DMN_RUNNER_FORM_SCHEMA_URL = "".concat(this.baseUrl, "/jitdmn/schema/form");
  }
  DmnRunnerService.prototype.result = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isPayloadValid(payload)) {
              return [2, { messages: [] }];
            }
            return [
              4,
              fetch(this.DMN_RUNNER_DMN_RESULT_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json, text/plain, */*",
                },
                body: JSON.stringify(payload),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4, response.json()];
          case 2:
            return [2, _a.sent()];
        }
      });
    });
  };
  DmnRunnerService.prototype.validate = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isPayloadValid(payload)) {
              return [2, []];
            }
            return [
              4,
              fetch(this.DMN_RUNNER_VALIDATE_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4, response.json()];
          case 2:
            return [2, _a.sent()];
        }
      });
    });
  };
  DmnRunnerService.prototype.formSchema = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var response, json, refIndex;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isPayloadValid(payload)) {
              return [2, {}];
            }
            return [
              4,
              fetch(this.DMN_RUNNER_FORM_SCHEMA_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("".concat(response.status, " ").concat(response.statusText));
            }
            return [4, response.json()];
          case 2:
            json = _a.sent();
            refIndex = json["$ref"].replace("#/definitions/InputSet", "");
            return [
              2,
              JSON.parse(
                JSON.stringify(json)
                  .replace(new RegExp("InputSet".concat(refIndex), "g"), "InputSet")
                  .replace(new RegExp("OutputSet".concat(refIndex), "g"), "OutputSet")
              ),
            ];
        }
      });
    });
  };
  DmnRunnerService.prototype.isPayloadValid = function (payload) {
    return payload.resources.every(function (resource) {
      return resource.content !== "";
    });
  };
  return DmnRunnerService;
})();
exports.DmnRunnerService = DmnRunnerService;
//# sourceMappingURL=DmnRunnerService.js.map
