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
var axios_1 = require("axios");
var http_bridge_1 = require("@kie-tools-core/backend/dist/http-bridge");
jest.mock("axios");
var mockAxios = axios_1.default;
var bridge = new http_bridge_1.DefaultHttpBridge();
var testEndpoint = "some.endpoint/test";
describe("requests throught DefaultHttpBridge", function () {
  test("should execute GET when the request does not have a body", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockAxios.get.mockResolvedValueOnce({});
            return [4, bridge.request({ endpoint: testEndpoint })];
          case 1:
            _a.sent();
            expect(mockAxios.get).toBeCalledWith(testEndpoint);
            return [2];
        }
      });
    });
  });
  test("should execute POST when the request has a body", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var requestBody;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            requestBody = { foo: "bar" };
            mockAxios.post.mockResolvedValueOnce({});
            return [4, bridge.request({ endpoint: testEndpoint, body: requestBody })];
          case 1:
            _a.sent();
            expect(mockAxios.post).toBeCalledWith(testEndpoint, requestBody);
            return [2];
        }
      });
    });
  });
  test("should return the response data on success of a GET", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var responseData, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            responseData = { some: "data" };
            mockAxios.get.mockResolvedValueOnce({ data: responseData });
            return [4, bridge.request({ endpoint: testEndpoint })];
          case 1:
            response = _a.sent();
            expect(response.body).toBe(responseData);
            return [2];
        }
      });
    });
  });
  test("should return the response data on success of a POST", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var responseData, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            responseData = { some: "data" };
            mockAxios.post.mockResolvedValueOnce({ data: responseData });
            return [4, bridge.request({ endpoint: testEndpoint, body: { foo: "bar" } })];
          case 1:
            response = _a.sent();
            expect(response.body).toBe(responseData);
            return [2];
        }
      });
    });
  });
  test("should reject the promise when a generic error ocurrs", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var errorMsg, e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            errorMsg = "Some error";
            mockAxios.get.mockRejectedValueOnce(new Error(errorMsg));
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4, bridge.request({ endpoint: testEndpoint })];
          case 2:
            _a.sent();
            fail("should not have reached here");
            return [3, 4];
          case 3:
            e_1 = _a.sent();
            expect(e_1).toBe(errorMsg);
            return [3, 4];
          case 4:
            return [2];
        }
      });
    });
  });
  test("should reject the promise when an error ocurrs on the endpoint", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var errorMsg, e_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            errorMsg = "Some error";
            mockAxios.get.mockRejectedValueOnce({ message: errorMsg, config: { url: testEndpoint } });
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4, bridge.request({ endpoint: testEndpoint })];
          case 2:
            _a.sent();
            fail("should not have reached here");
            return [3, 4];
          case 3:
            e_2 = _a.sent();
            expect(e_2).toBe("".concat(errorMsg, " ").concat(testEndpoint));
            return [3, 4];
          case 4:
            return [2];
        }
      });
    });
  });
});
//# sourceMappingURL=DefaultHttpBridge.test.js.map
