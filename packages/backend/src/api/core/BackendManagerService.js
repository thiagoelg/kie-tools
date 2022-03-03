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
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendManagerService = void 0;
var __1 = require("..");
var BackendManagerService = (function () {
  function BackendManagerService(args) {
    this.args = args;
    this.serviceRegistry = new Map();
  }
  BackendManagerService.prototype.identify = function () {
    return "BACKEND_MANAGER";
  };
  BackendManagerService.prototype.start = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b, service, e_1_1;
      var e_1, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            if (!this.args.localHttpServer) return [3, 2];
            return [4, this.registerService(this.args.localHttpServer)];
          case 1:
            _d.sent();
            _d.label = 2;
          case 2:
            if (!this.args.bootstrapServices || this.args.bootstrapServices.length === 0) {
              return [2];
            }
            _d.label = 3;
          case 3:
            _d.trys.push([3, 8, 9, 10]);
            (_a = __values(this.args.bootstrapServices)), (_b = _a.next());
            _d.label = 4;
          case 4:
            if (!!_b.done) return [3, 7];
            service = _b.value;
            return [4, this.registerService(service)];
          case 5:
            _d.sent();
            _d.label = 6;
          case 6:
            _b = _a.next();
            return [3, 4];
          case 7:
            return [3, 10];
          case 8:
            e_1_1 = _d.sent();
            e_1 = { error: e_1_1 };
            return [3, 10];
          case 9:
            try {
              if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            } finally {
              if (e_1) throw e_1.error;
            }
            return [7];
          case 10:
            return [2];
        }
      });
    });
  };
  BackendManagerService.prototype.stop = function () {
    this.serviceRegistry.forEach(function (service) {
      return service.stop();
    });
    this.serviceRegistry.clear();
  };
  BackendManagerService.prototype.satisfyRequirements = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2, true];
      });
    });
  };
  BackendManagerService.prototype.registerService = function (service) {
    return __awaiter(this, void 0, void 0, function () {
      var e_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.serviceRegistry.has(service.identify())) {
              return [2, true];
            }
            return [4, service.satisfyRequirements()];
          case 1:
            if (!_a.sent()) {
              console.warn(
                "Could not satisfy requirements for service ".concat(service.identify(), ". Skipping registration.")
              );
              return [2, false];
            }
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4, service.start()];
          case 3:
            _a.sent();
            if (service instanceof __1.HttpService) {
              if (!this.args.bridge) {
                console.warn(
                  "Could not register an HTTP service (".concat(service.identify(), ") without having an HTTP bridge.")
                );
                return [2, false];
              }
              service.registerHttpBridge(this.args.bridge);
            }
            if (service instanceof __1.LocalHttpService) {
              if (!this.args.localHttpServer || !this.serviceRegistry.get(this.args.localHttpServer.identify())) {
                console.warn(
                  "Could not register a local HTTP service (".concat(
                    service.identify(),
                    ") without having a local server registered."
                  )
                );
                return [2, false];
              }
              service.registerPort(this.args.localHttpServer.getPort());
            }
            this.serviceRegistry.set(service.identify(), service);
            return [2, true];
          case 4:
            e_2 = _a.sent();
            console.error("An error has occurred while starting ".concat(service.identify(), " up: ").concat(e_2));
            return [2, false];
          case 5:
            return [2];
        }
      });
    });
  };
  BackendManagerService.prototype.getService = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var registeredService, lazyService, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            registeredService = this.serviceRegistry.get(id);
            if (registeredService) {
              return [2, registeredService];
            }
            if (!this.args.lazyServices || this.args.lazyServices.length === 0) {
              return [2];
            }
            lazyService = this.args.lazyServices.find(function (s) {
              return s.identify() === id;
            });
            _a = !lazyService;
            if (_a) return [3, 2];
            return [4, this.registerService(lazyService)];
          case 1:
            _a = !_b.sent();
            _b.label = 2;
          case 2:
            if (_a) {
              return [2];
            }
            return [2, lazyService];
        }
      });
    });
  };
  return BackendManagerService;
})();
exports.BackendManagerService = BackendManagerService;
//# sourceMappingURL=BackendManagerService.js.map
