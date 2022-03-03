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
exports.KogitoMenu = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var GitHubContext_1 = require("./GitHubContext");
var rest_1 = require("@octokit/rest");
var GlobalContext_1 = require("./GlobalContext");
var i18n_1 = require("../../i18n");
var react_components_1 = require("@kie-tools-core/i18n/dist/react-components");
var GITHUB_OAUTH_TOKEN_SIZE = 40;
function KogitoMenu() {
  var _this = this;
  var gitHubApi = (0, GitHubContext_1.useGitHubApi)();
  var isAuthenticated = !!gitHubApi.token;
  var i18n = (0, i18n_1.useChromeExtensionI18n)().i18n;
  var inputRef = (0, react_1.useRef)(null);
  var _a = __read((0, react_1.useState)(false), 2),
    isWholeMenuOpen = _a[0],
    setWholeMenuOpen = _a[1];
  var _b = __read((0, react_1.useState)(false), 2),
    isInfoPopOverOpen = _b[0],
    setInfoPopOverOpen = _b[1];
  var _c = __read((0, react_1.useState)(""), 2),
    potentialToken = _c[0],
    setPotentialToken = _c[1];
  function updateToken(token) {
    return __awaiter(this, void 0, void 0, function () {
      var validToken;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, tokenIsValid(token)];
          case 1:
            validToken = _a.sent();
            if (validToken) {
              gitHubApi.setToken(token);
              setPotentialToken("");
            } else {
              gitHubApi.setToken("");
            }
            return [2, validToken];
        }
      });
    });
  }
  (0, react_1.useEffect)(function () {
    updateToken(gitHubApi.token).then(function () {
      console.debug("Checked GitHub token.");
    });
  }, []);
  var onPaste = (0, react_1.useCallback)(function (e) {
    var token = e.clipboardData.getData("text/plain").slice(0, GITHUB_OAUTH_TOKEN_SIZE);
    setPotentialToken(token);
    setTimeout(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var wasValid;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4, updateToken(token)];
            case 1:
              wasValid = _a.sent();
              if (wasValid) {
                setTimeout(function () {
                  return setWholeMenuOpen(false);
                }, 2000);
              }
              inputRef.current.setSelectionRange(0, 0);
              return [2];
          }
        });
      });
    }, 0);
  }, []);
  var onReset = (0, react_1.useCallback)(function () {
    gitHubApi.setToken("");
    setPotentialToken("");
    setTimeout(function () {
      inputRef.current.focus();
    }, 0);
  }, []);
  var toggleInfoPopOver = (0, react_1.useCallback)(
    function () {
      setInfoPopOverOpen(!isInfoPopOverOpen);
    },
    [isInfoPopOverOpen]
  );
  var toggleMenu = (0, react_1.useCallback)(
    function () {
      setWholeMenuOpen(!isWholeMenuOpen);
    },
    [isWholeMenuOpen]
  );
  var tokenToDisplay = obfuscate(gitHubApi.token || potentialToken);
  var globals = (0, GlobalContext_1.useGlobals)();
  return (0, jsx_runtime_1.jsxs)(
    jsx_runtime_1.Fragment,
    {
      children: [
        isWholeMenuOpen &&
          (0, jsx_runtime_1.jsxs)(
            jsx_runtime_1.Fragment,
            {
              children: [
                !isAuthenticated &&
                  (0, jsx_runtime_1.jsxs)(
                    jsx_runtime_1.Fragment,
                    {
                      children: [
                        (0, jsx_runtime_1.jsx)(
                          "a",
                          __assign(
                            {
                              target: "blank",
                              className: "Header-link mr-0 mr-lg-3 py-2 py-lg-0",
                              href: "https://github.com/settings/tokens",
                            },
                            { children: i18n.common.menu.createToken }
                          ),
                          void 0
                        ),
                        (0, jsx_runtime_1.jsxs)(
                          "div",
                          __assign(
                            { style: { position: "relative" } },
                            {
                              children: [
                                (0, jsx_runtime_1.jsx)(
                                  "a",
                                  __assign(
                                    {
                                      className: "info-icon-container Header-link mr-0 mr-lg-3 py-2 py-lg-0",
                                      href: "#",
                                      onClick: toggleInfoPopOver,
                                    },
                                    { children: "i" }
                                  ),
                                  void 0
                                ),
                                isInfoPopOverOpen &&
                                  (0, jsx_runtime_1.jsxs)(
                                    "div",
                                    __assign(
                                      { className: "info-popover" },
                                      {
                                        children: [
                                          (0, jsx_runtime_1.jsx)(
                                            "h3",
                                            { children: i18n.common.menu.tokenInfo.title },
                                            void 0
                                          ),
                                          (0, jsx_runtime_1.jsx)(
                                            "p",
                                            { children: i18n.common.menu.tokenInfo.disclaimer },
                                            void 0
                                          ),
                                          (0, jsx_runtime_1.jsx)("hr", {}, void 0),
                                          (0, jsx_runtime_1.jsx)(
                                            "p",
                                            { children: i18n.common.menu.tokenInfo.explanation },
                                            void 0
                                          ),
                                          (0, jsx_runtime_1.jsx)(
                                            "p",
                                            { children: i18n.common.menu.tokenInfo.whichPermissionUserGive },
                                            void 0
                                          ),
                                          (0, jsx_runtime_1.jsxs)(
                                            "p",
                                            {
                                              children: [
                                                (0, jsx_runtime_1.jsxs)(
                                                  "b",
                                                  {
                                                    children: [
                                                      (0, jsx_runtime_1.jsxs)(
                                                        "u",
                                                        { children: [i18n.note.toUpperCase(), ":"] },
                                                        void 0
                                                      ),
                                                      "\u00A0",
                                                    ],
                                                  },
                                                  void 0
                                                ),
                                                (0, jsx_runtime_1.jsx)(
                                                  react_components_1.I18nHtml,
                                                  { children: i18n.common.menu.tokenInfo.permission },
                                                  void 0
                                                ),
                                              ],
                                            },
                                            void 0
                                          ),
                                        ],
                                      }
                                    ),
                                    void 0
                                  ),
                              ],
                            }
                          ),
                          void 0
                        ),
                      ],
                    },
                    void 0
                  ),
                (0, jsx_runtime_1.jsxs)(
                  "label",
                  __assign(
                    { style: { position: "relative" } },
                    {
                      children: [
                        (0, jsx_runtime_1.jsx)(
                          "input",
                          {
                            className:
                              "kogito-github-token-input form-control input-sm " +
                              (isAuthenticated ? "authenticated" : ""),
                            placeholder: i18n.common.menu.placeYourToken,
                            maxLength: GITHUB_OAUTH_TOKEN_SIZE,
                            autoFocus: true,
                            ref: inputRef,
                            disabled: isAuthenticated,
                            value: tokenToDisplay,
                            onPaste: onPaste,
                            onChange: function () {},
                          },
                          void 0
                        ),
                        isAuthenticated && (0, jsx_runtime_1.jsx)("b", { className: "icon tick" }, void 0),
                        !!potentialToken && (0, jsx_runtime_1.jsx)("b", { className: "icon cross" }, void 0),
                      ],
                    }
                  ),
                  void 0
                ),
                (0, jsx_runtime_1.jsx)(
                  "button",
                  __assign({ className: "btn btn-sm", onClick: onReset }, { children: i18n.reset }),
                  void 0
                ),
              ],
            },
            void 0
          ),
        (0, jsx_runtime_1.jsx)(
          "img",
          {
            className: "kogito-menu-icon ".concat(isAuthenticated ? "authenticated" : ""),
            src: globals.extensionIconUrl,
            onClick: toggleMenu,
          },
          void 0
        ),
      ],
    },
    void 0
  );
}
exports.KogitoMenu = KogitoMenu;
function obfuscate(token) {
  if (token.length <= 8) {
    return token;
  }
  var stars = new Array(token.length - 8).join("*");
  var pieceToObfuscate = token.substring(4, token.length - 4);
  return token.replace(pieceToObfuscate, stars);
}
function tokenIsValid(token) {
  return __awaiter(this, void 0, void 0, function () {
    var testOctokit;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!token) {
            return [2, false];
          }
          testOctokit = new rest_1.Octokit({ auth: token });
          return [
            4,
            testOctokit.emojis
              .get({})
              .then(function () {
                return true;
              })
              .catch(function () {
                return false;
              }),
          ];
        case 1:
          return [2, _a.sent()];
      }
    });
  });
}
//# sourceMappingURL=KogitoMenu.js.map
