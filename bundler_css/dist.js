var depRelation = [
  {
    key: "index.js",
    deps: ["a.js","b.js","style.css"],
    code: function(require, module, exports) {
      "use strict";

var _a = _interopRequireDefault(require("./a.js"));

var _b = _interopRequireDefault(require("./b.js"));

require("./style.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_a["default"].getB());
console.log(_b["default"].getA());
    },
  },{
    key: "a.js",
    deps: ["b.js"],
    code: function(require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _b = _interopRequireDefault(require("./b.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a = {
  value: 'a',
  getB: function getB() {
    return _b["default"].value + ' from a.js';
  }
};
var _default = a;
exports["default"] = _default;
    },
  },{
    key: "b.js",
    deps: ["a.js"],
    code: function(require, module, exports) {
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _a = _interopRequireDefault(require("./a.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var b = {
  value: 'b',
  getA: function getA() {
    return _a["default"].value + ' from b.js';
  }
};
var _default = b;
exports["default"] = _default;
    },
  },{
    key: "style.css",
    deps: [],
    code: function(require, module, exports) {
      "use strict";

if (document) {
  var styleElement = document.createElement('style');
  styleElement.innerHTML = "h1 {\r\n    color: red;\r\n}";
  document.head.appendChild(styleElement);
}
    },
  }
]

var modules = {}

function pathToKey(dirname, path) {
  return (dirname + path).replace(/\.\//g, '').replace(/\/\//, '/')
}

function execute(key) {
  if (modules[key]) { return modules[key] }
  var dr
  for (var i = 0; i<depRelation.length; i++) {
    if(depRelation[i].key === key) {
      dr = depRelation[i]
      break
    }
  }
  var require = function (path) {
    var dirname = key.substring(0, key.lastIndexOf('/') + 1)
    return execute(pathToKey(dirname, path))
  }
  var exports = {__esModule: true}
  var module = {exports: exports}
  modules[key] = exports
  dr.code(require, module, modules[key])
  return modules[key]
}

execute(depRelation[0].key)
