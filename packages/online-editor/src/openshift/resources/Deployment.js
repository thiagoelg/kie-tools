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
exports.GetDeployment = exports.DeleteDeployment = exports.ListDeployments = exports.CreateDeployment = void 0;
var Resource_1 = require("./Resource");
var API_ENDPOINT = "apis/apps/v1";
var CreateDeployment = (function (_super) {
  __extends(CreateDeployment, _super);
  function CreateDeployment(args) {
    var _this = _super.call(this, args) || this;
    _this.args = args;
    return _this;
  }
  CreateDeployment.prototype.method = function () {
    return "POST";
  };
  CreateDeployment.prototype.requestBody = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2,
          "\n      kind: Deployment\n      apiVersion: apps/v1\n      metadata:\n        annotations:\n          "
            .concat(Resource_1.KOGITO_URI, ": ")
            .concat(this.args.uri, "\n          ")
            .concat(Resource_1.KOGITO_WORKSPACE_NAME, ": ")
            .concat(this.args.workspaceName, "\n        name: ")
            .concat(this.args.resourceName, "\n        namespace: ")
            .concat(this.args.namespace, "\n        labels:\n          app: ")
            .concat(this.args.resourceName, "\n          app.kubernetes.io/component: ")
            .concat(this.args.resourceName, "\n          app.kubernetes.io/instance: ")
            .concat(this.args.resourceName, "\n          app.kubernetes.io/part-of: ")
            .concat(
              this.args.resourceName,
              "\n          app.kubernetes.io/name: java\n          app.openshift.io/runtime: quarkus\n          app.openshift.io/runtime-version: "
            )
            .concat(Resource_1.JAVA_RUNTIME_VERSION, "\n          ")
            .concat(Resource_1.KOGITO_CREATED_BY, ": ")
            .concat(
              this.args.createdBy,
              "\n      spec:\n        replicas: 1\n        selector:\n          matchLabels:\n            app: "
            )
            .concat(
              this.args.resourceName,
              "\n        template:\n          metadata:\n            labels:\n              app: "
            )
            .concat(this.args.resourceName, "\n              deploymentconfig: ")
            .concat(this.args.resourceName, "\n          spec:\n            containers:\n              - name: ")
            .concat(this.args.resourceName, "\n                image: ")
            .concat(
              process.env.WEBPACK_REPLACE__dmnDevSandbox_baseImageFullUrl,
              "\n                ports:\n                  - containerPort: 8080\n                    protocol: TCP\n                env:\n                - name: BASE_URL\n                  value: "
            )
            .concat(this.args.baseUrl, "\n                - name: QUARKUS_PLATFORM_VERSION\n                  value: ")
            .concat(
              process.env.WEBPACK_REPLACE__quarkusPlatformVersion,
              "\n                - name: KOGITO_RUNTIME_VERSION\n                  value: "
            )
            .concat(process.env.WEBPACK_REPLACE__kogitoRuntimeVersion, "\n    "),
        ];
      });
    });
  };
  CreateDeployment.prototype.name = function () {
    return CreateDeployment.name;
  };
  CreateDeployment.prototype.url = function () {
    return ""
      .concat(this.args.host, "/")
      .concat(API_ENDPOINT, "/namespaces/")
      .concat(this.args.namespace, "/deployments");
  };
  return CreateDeployment;
})(Resource_1.ResourceFetch);
exports.CreateDeployment = CreateDeployment;
var ListDeployments = (function (_super) {
  __extends(ListDeployments, _super);
  function ListDeployments() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  ListDeployments.prototype.method = function () {
    return "GET";
  };
  ListDeployments.prototype.requestBody = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2];
      });
    });
  };
  ListDeployments.prototype.name = function () {
    return ListDeployments.name;
  };
  ListDeployments.prototype.url = function () {
    return ""
      .concat(this.args.host, "/")
      .concat(API_ENDPOINT, "/namespaces/")
      .concat(this.args.namespace, "/deployments?labelSelector=")
      .concat(Resource_1.KOGITO_CREATED_BY);
  };
  return ListDeployments;
})(Resource_1.ResourceFetch);
exports.ListDeployments = ListDeployments;
var DeleteDeployment = (function (_super) {
  __extends(DeleteDeployment, _super);
  function DeleteDeployment() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  DeleteDeployment.prototype.method = function () {
    return "DELETE";
  };
  DeleteDeployment.prototype.requestBody = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2];
      });
    });
  };
  DeleteDeployment.prototype.name = function () {
    return DeleteDeployment.name;
  };
  DeleteDeployment.prototype.url = function () {
    return ""
      .concat(this.args.host, "/")
      .concat(API_ENDPOINT, "/namespaces/")
      .concat(this.args.namespace, "/deployments/")
      .concat(this.args.resourceName);
  };
  return DeleteDeployment;
})(Resource_1.ResourceFetch);
exports.DeleteDeployment = DeleteDeployment;
var GetDeployment = (function (_super) {
  __extends(GetDeployment, _super);
  function GetDeployment() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  GetDeployment.prototype.method = function () {
    return "GET";
  };
  GetDeployment.prototype.requestBody = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2];
      });
    });
  };
  GetDeployment.prototype.name = function () {
    return GetDeployment.name;
  };
  GetDeployment.prototype.url = function () {
    return ""
      .concat(this.args.host, "/")
      .concat(API_ENDPOINT, "/namespaces/")
      .concat(this.args.namespace, "/deployments/")
      .concat(this.args.resourceName);
  };
  return GetDeployment;
})(Resource_1.ResourceFetch);
exports.GetDeployment = GetDeployment;
//# sourceMappingURL=Deployment.js.map
