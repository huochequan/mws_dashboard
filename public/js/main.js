/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 362);
/******/ })
/************************************************************************/
/******/ ({

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(359)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction) {
  isProduction = _isProduction

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[data-vue-ssr-id~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 143:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_bootstrap_vue__ = __webpack_require__(288);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__App__ = __webpack_require__(331);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__App___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__App__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__router__ = __webpack_require__(230);
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.





__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_bootstrap_vue__["a" /* default */]);

/* eslint-disable no-new */
new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
  el: '#app',
  router: __WEBPACK_IMPORTED_MODULE_3__router__["a" /* default */],
  template: '<App/>',
  components: {
    App: __WEBPACK_IMPORTED_MODULE_2__App___default.a
  }
});

/***/ }),

/***/ 165:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'app'
});

/***/ }),

/***/ 166:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    list: {
      type: Array,
      required: true,
      default: function _default() {
        return [];
      }
    }
  },
  methods: {
    isLast: function isLast(index) {
      return index === this.list.length - 1;
    },
    showName: function showName(item) {
      if (item.meta && item.meta.label) {
        item = item.meta && item.meta.label;
      }
      if (item.name) {
        item = item.name;
      }
      return item;
    }
  }
});

/***/ }),

/***/ 167:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'footer'
});

/***/ }),

/***/ 168:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'header',
  methods: {
    sidebarToggle: function sidebarToggle(e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-hidden');
    },
    sidebarMinimize: function sidebarMinimize(e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-minimized');
    },
    mobileSidebarToggle: function mobileSidebarToggle(e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-mobile-show');
    },
    asideToggle: function asideToggle(e) {
      e.preventDefault();
      document.body.classList.toggle('aside-menu-hidden');
    }
  }
});

/***/ }),

/***/ 169:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__SidebarNavDropdown__ = __webpack_require__(336);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__SidebarNavDropdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__SidebarNavDropdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__SidebarNavLink__ = __webpack_require__(337);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__SidebarNavLink___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__SidebarNavLink__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SidebarNavTitle__ = __webpack_require__(338);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SidebarNavTitle___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__SidebarNavTitle__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'sidebar',
  props: {
    navItems: {
      type: Array,
      required: true,
      default: function _default() {
        return [];
      }
    }
  },
  components: {
    SidebarNavDropdown: __WEBPACK_IMPORTED_MODULE_0__SidebarNavDropdown___default.a,
    SidebarNavLink: __WEBPACK_IMPORTED_MODULE_1__SidebarNavLink___default.a,
    SidebarNavTitle: __WEBPACK_IMPORTED_MODULE_2__SidebarNavTitle___default.a
  },
  methods: {
    handleClick: function handleClick(e) {
      e.preventDefault();
      e.target.parentElement.classList.toggle('open');
    }
  }
});

/***/ }),

/***/ 170:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    name: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick: function handleClick(e) {
      e.preventDefault();
      e.target.parentElement.classList.toggle('open');
    }
  }
});

/***/ }),

/***/ 171:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'sidebar-nav-link',
  props: {
    name: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    badge: {
      default: ''
    }
  }
});

/***/ }),

/***/ 172:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  props: {
    name: {
      type: String,
      default: ''
    },
    classes: {
      type: String,
      default: ''
    },
    wrapper: {
      type: Object,
      default: function _default() {}
    }
  }
});

/***/ }),

/***/ 173:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__nav__ = __webpack_require__(228);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components___ = __webpack_require__(229);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'RootContainer',
  components: {
    AppHeader: __WEBPACK_IMPORTED_MODULE_1__components___["a" /* Header */],
    Sidebar: __WEBPACK_IMPORTED_MODULE_1__components___["b" /* Sidebar */],
    AppFooter: __WEBPACK_IMPORTED_MODULE_1__components___["c" /* Footer */],
    Breadcrumb: __WEBPACK_IMPORTED_MODULE_1__components___["d" /* Breadcrumb */]
  },
  data: function data() {
    return {
      nav: __WEBPACK_IMPORTED_MODULE_0__nav__["a" /* default */].items
    };
  },

  computed: {
    name: function name() {
      return this.$route.name;
    },
    list: function list() {
      return this.$route.matched;
    }
  }
});

/***/ }),

/***/ 174:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'dashboard',
  components: {},
  data: function data() {
    return {
      tableItems: [{
        action: {},
        tasklist: { name: 'Create Slack Account', new: true, detail: 'Onboarding List for Jason' },
        due: { date: 'Today' },
        notification_settings: { value: 50, period: 'Jun 11, 2015 - Jul 10, 2015' },
        activity: '10 sec ago',
        state: 1
      }, {
        action: {},
        tasklist: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
        due: { date: 'Today' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        activity: '5 minutes ago',
        state: 2
      }, {
        action: {},
        tasklist: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
        due: { date: 'Today' },
        notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
        activity: '1 hour ago',
        state: 2
      }, {
        action: {},
        tasklist: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
        due: { date: 'Tomorrow' },
        notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
        activity: 'Last month',
        state: 4
      }, {
        action: {},
        tasklist: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
        due: { date: '3 days from now' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        activity: 'Last week',
        state: 1
      }],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        tasklist: {
          label: 'Task List'
        },
        due: {
          label: 'Due',
          class: ''
        },
        state: {
          label: 'Notification Settings'
        }
      },
      statusOptions: [{ text: "Off", value: 1 }, { text: "Once", value: 2 }, { text: "Daily", value: 3 }, { text: "Escalating", value: 4 }]
    };
  },
  methods: {
    variant: function variant(value) {
      var $variant = void 0;
      if (value <= 25) {
        $variant = 'info';
      } else if (value > 25 && value <= 50) {
        $variant = 'success';
      } else if (value > 50 && value <= 75) {
        $variant = 'warning';
      } else if (value > 75 && value <= 100) {
        $variant = 'danger';
      }
      return $variant;
    }
  }
});

/***/ }),

/***/ 175:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'tasklist',
  components: {},
  data: function data() {
    return {
      tableItems: [{
        action: { url: 'static/img/avatars/1.jpg', status: 'success' },
        task: { name: 'Create Slack Account', new: true, detail: 'Onboarding List for Jason' },
        due: { date: 'Today' },
        notification_settings: { value: 50, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Mastercard', icon: 'fa fa-cc-mastercard' },
        activity: '10 sec ago',
        assignees: [{
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }, {
          name: "Jane Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }, {
          name: "Beth Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }]
      }, {
        action: { url: 'static/img/avatars/2.jpg', status: 'danger' },
        task: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
        due: { date: 'Today' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Visa', icon: 'fa fa-cc-visa' },
        activity: '5 minutes ago',
        assignees: [{
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }, {
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }]
      }, {
        action: { url: 'static/img/avatars/3.jpg', status: 'warning' },
        task: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
        due: { date: 'Today' },
        notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Stripe', icon: 'fa fa-cc-stripe' },
        activity: '1 hour ago',
        assignees: [{
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }]
      }, {
        action: { url: 'static/img/avatars/4.jpg', status: '' },
        task: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
        due: { date: 'Tomorrow' },
        notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'PayPal', icon: 'fa fa-paypal' },
        activity: 'Last month',
        assignees: [{
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }]
      }, {
        action: { url: 'static/img/avatars/5.jpg', status: 'success' },
        task: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
        due: { date: '3 days from now' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Google Wallet', icon: 'fa fa-google-wallet' },
        activity: 'Last week',
        assignees: [{
          name: "John Doe",
          email: "john@example.com",
          image_url: "static/img/avatars/1.jpg"
        }]
      }],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        task: {
          label: ''
        },
        assignees: {
          label: 'Members'
        },
        due: {
          label: 'Due',
          class: ''
        }
      },
      statusOptions: [{ text: "Off", value: 1 }, { text: "Once", value: 2 }, { text: "Daily", value: 3 }, { text: "Escalating", value: 4 }]
    };
  },
  methods: {
    variant: function variant(value) {
      var $variant = void 0;
      if (value <= 25) {
        $variant = 'info';
      } else if (value > 25 && value <= 50) {
        $variant = 'success';
      } else if (value > 50 && value <= 75) {
        $variant = 'warning';
      } else if (value > 75 && value <= 100) {
        $variant = 'danger';
      }
      return $variant;
    },
    getRandomImageFromRange: function getRandomImageFromRange(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return 'static/img/avatars/' + (Math.floor(Math.random() * (max - min)) + min) + '.jpg'; //The maximum is exclusive and the minimum is inclusive
    }
  }
});

/***/ }),

/***/ 176:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'tasklists',
  components: {},
  data: function data() {
    return {
      tableItems: [{
        action: { url: 'static/img/avatars/1.jpg', status: 'success' },
        task: { name: 'Create Slack Account', new: true, detail: 'Onboarding List for Jason' },
        due: { date: 'Today' },
        notification_settings: { value: 50, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Mastercard', icon: 'fa fa-cc-mastercard' },
        activity: '10 sec ago',
        state: 1
      }, {
        action: { url: 'static/img/avatars/2.jpg', status: 'danger' },
        task: { name: 'Submit Timesheets', new: false, detail: 'Timesheets' },
        due: { date: 'Today' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Visa', icon: 'fa fa-cc-visa' },
        activity: '5 minutes ago',
        state: 2
      }, {
        action: { url: 'static/img/avatars/3.jpg', status: 'warning' },
        task: { name: 'Complete IT Audit', new: false, detail: 'IT Audit List' },
        due: { date: 'Today' },
        notification_settings: { value: 74, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Stripe', icon: 'fa fa-cc-stripe' },
        activity: '1 hour ago',
        state: 2
      }, {
        action: { url: 'static/img/avatars/4.jpg', status: '' },
        task: { name: 'Assign Recurrent Tasks', new: true, detail: 'Redelegate Tasks From Other Users' },
        due: { date: 'Tomorrow' },
        notification_settings: { value: 98, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'PayPal', icon: 'fa fa-paypal' },
        activity: 'Last month',
        state: 4
      }, {
        action: { url: 'static/img/avatars/5.jpg', status: 'success' },
        task: { name: 'Enable Bot Notifications', new: true, detail: 'Task Bot Sync' },
        due: { date: '3 days from now' },
        notification_settings: { value: 22, period: 'Jun 11, 2015 - Jul 10, 2015' },
        payment: { name: 'Google Wallet', icon: 'fa fa-google-wallet' },
        activity: 'Last week',
        state: 1
      }],
      tableFields: {
        action: {
          label: '<i class="fa fa-gear"></i>',
          class: 'text-center'
        },
        task: {
          label: 'Task'
        },
        due: {
          label: 'Due',
          class: ''
        },
        state: {
          label: 'Notification Settings'
        }
      },
      statusOptions: [{ text: "Off", value: 1 }, { text: "Once", value: 2 }, { text: "Daily", value: 3 }, { text: "Escalating", value: 4 }]
    };
  },
  methods: {
    variant: function variant(value) {
      var $variant = void 0;
      if (value <= 25) {
        $variant = 'info';
      } else if (value > 25 && value <= 50) {
        $variant = 'success';
      } else if (value > 50 && value <= 75) {
        $variant = 'warning';
      } else if (value > 75 && value <= 100) {
        $variant = 'danger';
      }
      return $variant;
    }
  }
});

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  scopeId,
  cssModules
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  // inject cssModules
  if (cssModules) {
    var computed = Object.create(options.computed || null)
    Object.keys(cssModules).forEach(function (key) {
      var module = cssModules[key]
      computed[key] = function () { return module }
    })
    options.computed = computed
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ 22:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/simple-line-icons/Simple-Line-Icons.eot?f33df365d6d0255b586f2920355e94d7";

/***/ }),

/***/ 228:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  items: [{
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer'
  }, {
    title: true,
    name: 'Tasklists',
    class: ''
  }, {
    divider: true
  }, {
    name: 'Your Tasklists',
    url: '/tasklists',
    icon: 'icon-list'
  }, {
    name: 'Templates',
    url: '/components',
    icon: 'icon-vector',
    children: []
  }]
});

/***/ }),

/***/ 229:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Breadcrumb_vue__ = __webpack_require__(332);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Breadcrumb_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Breadcrumb_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Footer_vue__ = __webpack_require__(333);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Footer_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Footer_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Header_vue__ = __webpack_require__(334);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Header_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__Header_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Sidebar_vue__ = __webpack_require__(335);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Sidebar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__Sidebar_vue__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "d", function() { return __WEBPACK_IMPORTED_MODULE_0__Breadcrumb_vue___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__Footer_vue___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__Header_vue___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_3__Sidebar_vue___default.a; });







/***/ }),

/***/ 230:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(355);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__containers_RootContainer__ = __webpack_require__(339);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__containers_RootContainer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__containers_RootContainer__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__views_Dashboard__ = __webpack_require__(340);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__views_Dashboard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__views_Dashboard__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__views_Tasklists__ = __webpack_require__(342);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__views_Tasklists___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__views_Tasklists__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__views_Tasklist__ = __webpack_require__(341);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__views_Tasklist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__views_Tasklist__);



// Containers


// Views




__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]({
  mode: 'hash',
  linkActiveClass: 'open active',
  scrollBehavior: function scrollBehavior() {
    return { y: 0 };
  },
  routes: [{
    path: '/',
    redirect: 'dashboard',
    name: 'Home',
    component: __WEBPACK_IMPORTED_MODULE_2__containers_RootContainer___default.a,
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: __WEBPACK_IMPORTED_MODULE_3__views_Dashboard___default.a
    }, {
      path: 'tasklists',
      name: 'Tasklists',
      component: __WEBPACK_IMPORTED_MODULE_4__views_Tasklists___default.a
    }, {
      path: 'tasklist/:id',
      name: 'Tasklist',
      component: __WEBPACK_IMPORTED_MODULE_5__views_Tasklist___default.a
    }]
  }]
}));

/***/ }),

/***/ 288:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tether__ = __webpack_require__(328);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_tether___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_tether__);
function observeDOM(t,e,i){var n=window.MutationObserver||window.WebKitMutationObserver,s=window.addEventListener;n?new n(function(t){(t[0].addedNodes.length>0||t[0].removedNodes.length>0)&&e()}).observe(t,assign({childList:!0,subtree:!0},i)):s&&(t.addEventListener("DOMNodeInserted",e,!1),t.addEventListener("DOMNodeRemoved",e,!1))}function warn(t){console.warn("[Bootstrap-Vue warn]: "+t)}function isVisible(t){return t&&(t.offsetWidth>0||t.offsetHeight>0)}function filterVisible(t){return t?t.filter(function(t){return isVisible(t)}):[]}function pickLinkProps(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return keys(props).reduce(function(e,i){return arrayIncludes(t,i)&&(e[i]=props[i]),e},{})}function omitLinkProps(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return keys(props).reduce(function(e,i){return arrayIncludes(t,i)||(e[i]=props[i]),e},{})}function isVisible$1(t){return t&&(t.offsetWidth>0||t.offsetHeight>0)}function getTransisionEndEvent(t){for(var e in TransitionEndEvents)if(void 0!==t.style[e])return TransitionEndEvents[e];return null}function isVisible$2(t){return t&&(t.offsetWidth>0||t.offsetHeight>0)}function findFirstVisible(t,e){if(!t||!t.querySelectorAll||!e)return null;for(var i=from(t.querySelectorAll(e)),n=i.find?i.find(function(t){return isVisible$2(t)}):null,s=0;!n&&s<i.length;s++)isVisible$2(i[s])&&(n=i[s]);return n}function isVisible$3(t){return t&&(t.offsetWidth>0||t.offsetHeight>0)}function makePageArray(t,e){return range(e).map(function(e,i){return{number:i+t,className:null}})}function isVisible$4(t){return t&&(t.offsetWidth>0||t.offsetHeight>0)}function makePageArray$1(t,e){return range(e).map(function(e,i){return{number:i+t,className:null}})}function targets(t,e,i,n){var s=keys(e.modifiers||{}).filter(function(t){return!all_listen_types[t]});e.value&&s.push(e.value);var r=function(){n({targets:s,vnode:t})};return keys(all_listen_types).forEach(function(n){(i[n]||e.modifiers[n])&&t.elm.addEventListener(n,r)}),s}function isElement(t){return t.nodeType}function closest(t,e){var i=t.closest(e);return i===t?null:i}function $QSA(t,e){return e||(e=document),isElement(e)?from(e.querySelectorAll(t)):[]}function $QS(t,e){return e||(e=document),isElement(e)?e.querySelector(t)||null:null}function getVm(t){return t?t.__vue__:null}function toType(t){return{}.toString.call(t).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function typeCheckConfig(t,e,i){for(var n in i)if(Object.prototype.hasOwnProperty.call(i,n)){var s=i[n],r=e[n],o=r&&isElement(r)?"element":toType(r);new RegExp(s).test(o)||console.error(t+': Option "'+n+'" provided type "'+o+'" but expected type "'+s+'"')}}function ScrollSpy(t,e){this._$el=t,this._selector=[Selector.NAV_LINKS,Selector.LIST_ITEMS,Selector.DROPDOWN_ITEMS].join(","),this._config=assign({},Default),this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,this._$root=null,this._resizeTimeout=null,this.updateConfig(e)}Array.from||(Array.from=function(){var t=Object.prototype.toString,e=function(e){return"function"==typeof e||"[object Function]"===t.call(e)},i=function(t){var e=Number(t);return isNaN(e)?0:0!==e&&isFinite(e)?(e>0?1:-1)*Math.floor(Math.abs(e)):e},n=Math.pow(2,53)-1,s=function(t){return Math.min(Math.max(i(t),0),n)};return function(t){var i=this,n=Object(t);if(null==t)throw new TypeError("Array.from requires an array-like object - not null or undefined");var r,o=arguments.length>1?arguments[1]:void 0;if(void 0!==o){if(!e(o))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(r=arguments[2])}for(var a,l=s(n.length),u=e(i)?Object(new i(l)):new Array(l),d=0;d<l;)a=n[d],u[d]=o?void 0===r?o(a,d):o.call(r,a,d):a,d+=1;return u.length=l,u}}()),Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)});var from=Array.from,isArray=Array.isArray,arrayIncludes=function(t,e){return-1!==t.indexOf(e)};"function"!=typeof Object.assign&&(Object.assign=function(t,e){var i=arguments;if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var n=Object(t),s=1;s<arguments.length;s++){var r=i[s];if(null!=r)for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(n[o]=r[o])}return n});var assign=Object.assign,keys=Object.keys,alert={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.localShow?i("div",{class:t.classObject,attrs:{role:"alert","aria-live":"polite","aria-atomic":"true"}},[i("button",{staticClass:"close",attrs:{type:"button","data-dismiss":"alert","aria-label":t.dismissLabel},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.dismiss(e)}}},[i("span",{attrs:{"aria-hidden":"true"}},[t._v("×")])]),t._t("default")],2):t._e()},staticRenderFns:[],data:function(){return{countDownTimerId:null,dismissed:!1}},created:function(){this.state&&warn('<b-alert> "state" property is deprecated, please use "variant" property instead.')},computed:{classObject:function(){return["alert",this.alertVariant,this.dismissible?"alert-dismissible":""]},alertVariant:function(){return"alert-"+(this.state||this.variant||"info")},localShow:function(){return!this.dismissed&&(this.countDownTimerId||this.show)}},props:{variant:{type:String,default:"info"},state:{type:String,default:null},dismissible:{type:Boolean,default:!1},dismissLabel:{type:String,default:"Close"},show:{type:[Boolean,Number],default:!1}},watch:{show:function(){this.showChanged()}},mounted:function(){this.showChanged()},methods:{dismiss:function(){this.clearCounter(),this.dismissed=!0,"number"==typeof this.show&&this.$emit("dismiss-count-down",0),this.$emit("dismissed")},clearCounter:function(){this.countDownTimerId&&(clearInterval(this.countDownTimerId),this.countDownTimerId=null)},showChanged:function(){var t=this;if(this.dismissed=!1,!0!==this.show&&!1!==this.show&&null!==this.show&&0!==this.show){var e=this.show;this.$emit("dismiss-count-down",e),this.clearCounter(),this.countDownTimerId=setInterval(function(){if(e<2)return t.dismiss();e--,t.$emit("dismiss-count-down",e)},1e3)}}}},clickoutMixin={mounted:function(){"undefined"!=typeof document&&document.documentElement.addEventListener("click",this._clickOutListener)},destroyed:function(){"undefined"!=typeof document&&document.removeEventListener("click",this._clickOutListener)},methods:{_clickOutListener:function(t){this.$el.contains(t.target)||this.clickOutListener&&this.clickOutListener()}}},BVRL="__BV_root_listeners__",listenOnRootMixin={methods:{listenOnRoot:function(t,e){return this[BVRL]&&isArray(this[BVRL])||(this[BVRL]=[]),this[BVRL].push({event:t,callback:e}),this.$root.$on(t,e),this},emitOnRoot:function(t){for(var e=[],i=arguments.length-1;i-- >0;)e[i]=arguments[i+1];return(n=this.$root).$emit.apply(n,[t].concat(e)),this;var n}},destroyed:function(){var t=this;if(this[BVRL]&&isArray(this[BVRL]))for(;this[BVRL].length>0;){var e=t[BVRL].shift(),i=e.event,n=e.callback;t.$root.$off(i,n)}}},ITEM_SELECTOR=".dropdown-item:not(.disabled):not([disabled])",dropdownMixin={mixins:[clickoutMixin,listenOnRootMixin],props:{id:{type:String},text:{type:String,default:""},dropup:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},right:{type:Boolean,default:!1}},data:function(){return{visible:!1}},created:function(){var t=this,e=function(e){e!==t&&(t.visible=!1)};this.listenOnRoot("shown::dropdown",e),this.listenOnRoot("clicked::link",e)},watch:{visible:function(t,e){var i=this;t!==e&&(t?(this.emitOnRoot("shown::dropdown",this),this.$emit("shown"),"ontouchstart"in document.documentElement&&from(document.body.children).forEach(function(t){t.addEventListener("mouseover",i.noop)}),this.$nextTick(function(){i.focusFirstItem()})):(this.emitOnRoot("hidden::dropdown",this),this.$emit("hidden"),"ontouchstart"in document.documentElement&&from(document.body.children).forEach(function(t){t.removeEventListener("mouseover",i.noop)})))}},computed:{toggler:function(){return this.split&&this.$refs.toggle?this.$refs.toggle.$el||this.$refs.toggle:this.$refs.button.$el||this.$refs.button}},methods:{noop:function(){},clickOutListener:function(){this.visible=!1},click:function(t){this.disabled?this.visible=!1:this.split?(this.$emit("click",t),this.emitOnRoot("shown::dropdown",this)):this.toggle()},toggle:function(){this.disabled?this.visible=!1:this.visible=!this.visible},onTab:function(){this.visible&&(this.visible=!1)},onEsc:function(t){var e=this;this.visible&&(this.visible=!1,t.preventDefault(),t.stopPropagation(),this.$nextTick(function(){e.focusToggler()}))},onMouseOver:function(t){var e=t.target;e.classList.contains("dropdown-item")&&!e.disabled&&!e.classList.contains("disabled")&&e.focus&&e.focus()},focusNext:function(t,e){var i=this;this.visible&&(t.preventDefault(),t.stopPropagation(),this.$nextTick(function(){var n=i.getItems();if(!(n.length<1)){var s=n.indexOf(t.target);e&&s>0?s--:!e&&s<n.length-1&&s++,s<0&&(s=0),i.focusItem(s,n)}}))},focusItem:function(t,e){var i=e.find(function(e,i){return i===t});i&&"-1"!==i.getAttribute("tabindex")&&i.focus()},getItems:function(){return filterVisible(from(this.$refs.menu.querySelectorAll(ITEM_SELECTOR)))},getFirstItem:function(){return this.getItems()[0]||null},focusFirstItem:function(){var t=this.getFirstItem();t&&this.focusItem(0,[t])},focusToggler:function(){var t=this.toggler;t&&t.focus&&t.focus()}}},formMixin={props:{name:{type:String},id:{type:String},disabled:{type:Boolean},required:{type:Boolean,default:!1}}},formCheckBoxMixin={computed:{checkboxClass:function(){return{"custom-control":this.custom,"form-check-inline":this.inline}}}},formCustomMixin={computed:{custom:function(){return!this.plain}},props:{plain:{type:Boolean,default:!1}}},formOptionsMixin={computed:{formOptions:function(){var t=this,e=this.options||{};return e=isArray(e)?e.map(function(e){return"object"==typeof e?{value:e[t.valueField],text:e[t.textField],disabled:e.disabled||!1}:{text:String(e),value:e||{}}}):keys(e).map(function(i){var n=e[i]||{};return"object"!=typeof n&&(n={text:String(n)}),n.value=n[t.valueField]||i,n.text=n[t.textField]||i,n})},selectedValue:function(){var t=this,e=this.formOptions;if(this.returnObject&&!this.multiple){for(var i=0;i<e.length;i++)if(e[i].value===t.localValue)return e[i];return null}return this.localValue}},props:{valueField:{type:String,default:"value"},textField:{type:String,default:"text"}},watch:{localValue:function(t,e){t!==e&&this.$emit("input",this.selectedValue)},value:function(t,e){t!==e&&(this.localValue=t)}}},props={active:{type:Boolean,default:!1},activeClass:{type:String,default:"active"},append:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},event:{type:[String,Array],default:"click"},exact:{type:Boolean,default:!1},exactActiveClass:{type:String,default:"active"},href:{type:String,default:"#"},rel:{type:String,default:null},replace:{type:Boolean,default:!1},routerTag:{type:String,default:"a"},tag:{type:String,default:null},target:{type:String,default:"_self"},to:{type:[String,Object],default:null}},computed={linkProps:function(){var t=this;return keys(props).reduce(function(e,i){return e[i]=t[i],e},{})},isRouterLink:function(){return Boolean(this.$router&&this.to&&!this.disabled)},_href:function(){return this.disabled?"#":this.href?this.href:this.to&&"string"==typeof this.to?this.to:void 0},computedRel:function(){return"_blank"===this.target&&null===this.rel?"noopener":this.rel||null},componentTag:function(){return this.tag?(warn('<b-link> "tag" property is deprecated, please use "routerTag" property instead.'),this.tag):this.routerTag},linkClassObject:function(){return[this.active?this.exact?this.exactActiveClass:this.activeClass:null,this.disabled?"disabled":null]}},methods={linkClick:function(t){this.disabled?t.stopPropagation():(this.$root.$emit("clicked::link",this),this.$emit("click",t)),this.isRouterLink||"#"!==this._href||t.preventDefault()}},linkMixin={props:props,computed:computed,methods:methods},TRIGGER_LISTENERS={click:{click:"toggle"},hover:{mouseenter:"show",mouseleave:"hide"},focus:{focus:"show",blur:"hide"}},PLACEMENT_PARAMS={top:"bottom center",bottom:"top center",left:"middle right",right:"middle left"},TETHER_CLASS_PREFIX="bs-tether",TETHER_CLASSES={element:!1,enabled:!1},TRANSITION_DURATION=150,popoverMixin={mixins:[listenOnRootMixin],props:{constraints:{type:Array,default:function(){return[]}},debounce:{type:[Number],default:300,validator:function(t){return t>=0}},delay:{type:[Number,Object],default:0,validator:function(t){return"number"==typeof t?t>=0:null!==t&&"object"==typeof t&&("number"==typeof t.show&&"number"==typeof t.hide&&t.show>=0&&t.hide>=0)}},offset:{type:String,default:"0 0",validator:function(t){return/^((0\s?)|([+-]?[0-9]+(px|%)\s?)){2}$/.test(t)}},placement:{type:String,default:"top",validator:function(t){return arrayIncludes(keys(PLACEMENT_PARAMS),t)}},popoverStyle:{type:Object,default:null},show:{type:Boolean,default:null},targetOffset:{type:String,default:"0 0",validator:function(t){return/^((0\s?)|([+-]?[0-9]+(px|%)\s?)){2}$/.test(t)}},triggers:{type:[Boolean,String,Array],default:function(){return["click","focus"]},validator:function(t){if(!1===t||""===t)return!0;if("string"==typeof t)return-1!==keys(TRIGGER_LISTENERS).indexOf(t);if(isArray(t)){var e=keys(TRIGGER_LISTENERS);return t.forEach(function(t){if(arrayIncludes(e,t))return!1}),!0}return!1}}},data:function(){return{triggerState:this.show,classState:this.show,lastEvent:null}},computed:{normalizedTriggers:function(){return!1===this.triggers?[]:"string"==typeof this.triggers?[this.triggers]:this.triggers},popoverAlignment:function(){return this.placement&&"default"!==this.placement?"popover-"+this.placement:"popover-top"},showState:function(){return!1!==this.show&&(this.triggerState||this.show)}},watch:{constraints:function(){this.setOptions()},normalizedTriggers:function(t,e){this.updateListeners(t,e)},offset:function(){this.setOptions()},placement:function(){this.setOptions()},showState:function(t){var e=this,i=this.getDelay(t);clearTimeout(this.$data._timeout),i?this.$data._timeout=setTimeout(function(){return e.togglePopover(t)},i):this.togglePopover(t)}},methods:{addListener:function(t){var e=this;for(var i in TRIGGER_LISTENERS[t])e.$data._trigger.addEventListener(i,function(t){return e.eventHandler(t)})},destroyTether:function(){if(this.$data._tether&&!this.showState){this.$data._tether.destroy(),this.$data._tether=null;var t=new RegExp("(^|[^-]\\b)("+TETHER_CLASS_PREFIX+"\\S*)","g");this.$data._trigger&&this.$data._trigger.className&&(this.$data._trigger.className=this.$data._trigger.className.replace(t,""))}},eventHandler:function(t){var e=this;if(!(this.normalizedTriggers.length>1&&this.debounce>0&&null!==this.lastEvent&&t.timeStamp<=this.lastEvent+this.debounce))for(var i in TRIGGER_LISTENERS)for(var n in TRIGGER_LISTENERS[i])if(n===t.type){var s=TRIGGER_LISTENERS[i][n];return void(("toggle"===s||e.triggerState&&"hide"===s||!e.triggerState&&"show"===s)&&(e.triggerState=!e.triggerState,e.lastEvent=t.timeStamp))}},getDelay:function(t){return"object"==typeof this.delay?t?this.delay.show:this.delay.hide:this.delay},getTetherOptions:function(){return{attachment:PLACEMENT_PARAMS[this.placement],element:this.$data._popover,target:this.$data._trigger,classes:TETHER_CLASSES,classPrefix:TETHER_CLASS_PREFIX,offset:this.offset,constraints:this.constraints,targetOffset:this.targetOffset}},hidePopover:function(){var t=this;this.classState=!1,clearTimeout(this.$data._timeout),this.$data._timeout=setTimeout(function(){t.$data._popover.style.display="none",t.destroyTether()},TRANSITION_DURATION)},refreshPosition:function(){var t=this;this.$data._tether&&this.$nextTick(function(){t.$data._tether.position()})},removeListener:function(t){var e=this;for(var i in TRIGGER_LISTENERS[t])e.$data._trigger.removeEventListener(i,function(t){return e.eventHandler(t)})},setOptions:function(){this.$data._tether&&this.$data._tether.setOptions(this.getTetherOptions())},showPopover:function(){var t=this;clearTimeout(this.$data._timeout),this.$data._tether||(this.$data._tether=new __WEBPACK_IMPORTED_MODULE_0_tether___default.a(this.getTetherOptions())),this.$data._popover.style.display="block",this.refreshPosition(),this.$nextTick(function(){t.classState=!0})},togglePopover:function(t){this.$emit("showChange",t),t?(this.showPopover(),this.emitOnRoot("shown::popover")):(this.hidePopover(),this.emitOnRoot("hidden::popover"))},updateListeners:function(t,e){var i=this;void 0===e&&(e=[]);var n=[],s=[];t.forEach(function(t){-1===e.indexOf(t)&&n.push(t)}),e.forEach(function(e){-1===t.indexOf(e)&&s.push(e)}),n.forEach(function(t){return i.addListener(t)}),s.forEach(function(t){return i.removeListener(t)})}},created:function(){var t=this;this.listenOnRoot("hide::popover",function(){t.triggerState=!1})},mounted:function(){this.$data._trigger=this.$refs.trigger.children[0]||this.$refs.trigger,this.$data._popover=this.$refs.popover,this.$data._popover.style.display="none",this.$data._tether=new __WEBPACK_IMPORTED_MODULE_0_tether___default.a(this.getTetherOptions()),this.$data._timeout=0,this.updateListeners(this.normalizedTriggers),this.showState&&this.showPopover()},updated:function(){this.refreshPosition()},beforeDestroy:function(){var t=this;this.normalizedTriggers.forEach(function(e){return t.removeListener(e)}),clearTimeout(this.$data._timeout),this.destroyTether()},destroyed:function(){this.$data._popover.parentElement===document.body&&document.body.removeChild(this.$data._popover)}},bLink={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.isRouterLink?i("router-link",{tag:"a",class:t.linkClassObject,attrs:{"active-class":t.activeClass,"exact-active-class":t.exactActiveClass,disabled:t.disabled,"aria-disabled":t.disabled?"true":"false",to:t.to,exact:t.exact,append:t.append,replace:t.replace,event:t.event,tag:t.componentTag},nativeOn:{click:function(e){t.linkClick(e)}}},[t._t("default")],2):i("a",{class:t.linkClassObject,attrs:{disabled:t.disabled,"aria-disabled":t.disabled?"true":"false",href:t._href,target:t.target||null,rel:t.computedRel},on:{click:t.linkClick}},[t._t("default")],2)},staticRenderFns:[],mixins:[linkMixin]},bLinkPropKeys=keys(props),breadcrumb={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("ol",{staticClass:"breadcrumb"},[t._l(t.normalizedItems,function(e){return i("li",{class:["breadcrumb-item",e.active?"active":null],attrs:{role:"presentation"},on:{click:function(i){t.onClick(e._originalItem)}}},[e.active?i("span",{attrs:{"aria-current":t.ariaCurrent},domProps:{innerHTML:t._s(e.text)}}):i("b-link",t._b({domProps:{innerHTML:t._s(e.text)}},"b-link",e._linkProps,!1))],1)}),t._t("default")],2)},staticRenderFns:[],components:{bLink:bLink},computed:{normalizedItems:function(){var t=!1,e=this.items.length;return this.items.map(function(i,n){var s={_originalItem:i},r=n===e-1;return"string"==typeof i?assign(s,{text:i,link:"#",active:r}):assign(s,i),!0===s.active||!1===s.active||t?s.active&&(t=!0):s.active=r,s.link&&(s.href=s.link),s._linkProps=keys(s).reduce(function(t,e){return arrayIncludes(bLinkPropKeys,e)&&(t[e]=s[e]),t},{}),s})}},props:{items:{type:Array,default:function(){return[]},required:!0},ariaCurrent:{type:String,default:"location"}},methods:{onClick:function(t){this.$emit("click",t)}}},linkProps=assign(omitLinkProps("href","to"),{href:{type:props.href.type},to:{type:props.to.type}}),bBtn={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.componentType,t._b({tag:"button",class:t.classList,attrs:{"data-toggle":t.dataToggle,"aria-pressed":t.ariaPressed,type:t.btnType,disabled:t.disabled,tabindex:t.tabIndex},on:{click:t.onClick},nativeOn:{focusin:function(e){t.handleFocus(e)},focusout:function(e){t.handleFocus(e)}}},"button",t.conditionalLinkProps,!1),[t._t("default")],2)},staticRenderFns:[],components:{bLink:bLink},computed:{linkProps:computed.linkProps,classList:function(){return["btn",this.btnVariant,this.btnSize,this.btnBlock,this.btnDisabled,this.btnPressed]},componentType:function(){return this.href||this.to?"b-link":"button"},btnBlock:function(){return this.block?"btn-block":""},btnVariant:function(){return this.variant?"btn-"+this.variant:"btn-secondary"},btnSize:function(){return this.size?"btn-"+this.size:""},btnDisabled:function(){return this.disabled?"disabled":""},btnType:function(){return this.href||this.to?null:this.type},isToggle:function(){return!0===this.pressed||!1===this.pressed},btnPressed:function(){return this.pressed?"active":""},ariaPressed:function(){return this.isToggle?this.pressed?"true":"false":null},dataToggle:function(){return this.isToggle?"button":null},tabIndex:function(){return this.disabled&&"button"!==this.componentType?"-1":null},conditionalLinkProps:function(){return"button"===this.componentType?{}:this.linkProps}},props:assign(linkProps,{block:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},size:{type:String,default:null},variant:{type:String,default:null},type:{type:String,default:"button"},pressed:{type:Boolean,default:null}}),methods:{onClick:function(t){this.disabled?(t.stopPropagation(),t.preventDefault()):(this.$emit("click",t),this.isToggle&&this.$emit("update:pressed",!this.pressed))},handleFocus:function(t){if(this.isToggle){var e=t.target.classList;"focusin"===t.type?e.add("focus"):"focusout"===t.type&&e.remove("focus")}}}},ITEM_SELECTOR$1=[".btn:not(.disabled):not([disabled])",".form-control:not(.disabled):not([disabled])","select:not(.disabled):not([disabled])",'input[type="checkbox"]:not(.disabled)','input[type="radio"]:not(.disabled)'].join(","),buttonToolbar={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{class:t.classObject,attrs:{role:"toolbar",tabindex:t.keyNav?"0":null},on:{focusin:function(e){if(e.target!==e.currentTarget)return null;t.focusFirst(e)},keydown:[function(e){return"button"in e||!t._k(e.keyCode,"left",37)?"button"in e&&0!==e.button?null:void t.focusNext(e,!0):null},function(e){if(!("button"in e)&&t._k(e.keyCode,"up",38))return null;t.focusNext(e,!0)},function(e){return"button"in e||!t._k(e.keyCode,"right",39)?"button"in e&&2!==e.button?null:void t.focusNext(e,!1):null},function(e){if(!("button"in e)&&t._k(e.keyCode,"down",40))return null;t.focusNext(e,!1)},function(e){return("button"in e||!t._k(e.keyCode,"left",37))&&e.shiftKey?"button"in e&&0!==e.button?null:void t.focusFirst(e):null},function(e){return("button"in e||!t._k(e.keyCode,"up",38))&&e.shiftKey?void t.focusFirst(e):null},function(e){return("button"in e||!t._k(e.keyCode,"right",39))&&e.shiftKey?"button"in e&&2!==e.button?null:void t.focusLast(e):null},function(e){return("button"in e||!t._k(e.keyCode,"down",40))&&e.shiftKey?void t.focusLast(e):null}]}},[t._t("default")],2)},staticRenderFns:[],computed:{classObject:function(){return["btn-toolbar",this.justify&&!this.vertical?"justify-content-between":""]}},props:{justify:{type:Boolean,default:!1},keyNav:{type:Boolean,default:!1}},methods:{setItemFocus:function(t){this.$nextTick(function(){t.focus()})},focusNext:function(t,e){if(this.keyNav){t.preventDefault(),t.stopPropagation();var i=this.getItems();if(!(i.length<1)){var n=i.indexOf(t.target);e&&n>0?n--:!e&&n<i.length-1&&n++,n<0&&(n=0),this.setItemFocus(i[n])}}},focusFirst:function(t){if(this.keyNav){t.preventDefault(),t.stopPropagation();var e=this.getItems();e.length>0&&this.setItemFocus(e[0])}},focusLast:function(t){if(this.keyNav){t.preventDefault(),t.stopPropagation();var e=this.getItems();e.length>0&&this.setItemFocus([e.length-1])}},getItems:function(){var t=from(this.$el.querySelectorAll(ITEM_SELECTOR$1));return t.forEach(function(t){t.tabIndex=-1}),t.filter(function(t){return isVisible$1(t)})}},mounted:function(){this.keyNav&&this.getItems()}},buttonGroup={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{class:t.classObject},[t._t("default")],2)},staticRenderFns:[],computed:{classObject:function(){return["btn-group",this.vertical?"btn-group-vertical":"",this.size?"btn-group-"+this.size:""]}},props:{vertical:{type:Boolean,default:!1},size:{type:String,default:null}}},inputGroup={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:t.classObject,attrs:{role:"group"}},[t._t("left",[t.left?i("div",{staticClass:"input-group-addon",domProps:{innerHTML:t._s(t.left)}}):t._e()]),t._t("default"),t._t("right",[t.right?i("div",{staticClass:"input-group-addon",domProps:{innerHTML:t._s(t.right)}}):t._e()])],2)},staticRenderFns:[],computed:{classObject:function(){return["input-group",this.size?"input-group-"+this.size:"",this.state?"has-"+this.state:""]}},props:{size:{type:String,default:null},state:{type:String,default:null},left:{type:String,default:null},right:{type:String,default:null}}},inputGroupAddon={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{staticClass:"input-group-addon",attrs:{id:t.id||null}},[t._t("default")],2)},staticRenderFns:[],props:{id:{type:String,default:null}}},inputGroupButton={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{staticClass:"input-group-btn"},[t._t("default")],2)},staticRenderFns:[],props:{}},card={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i(t.tag,{tag:"component",class:["card",t.cardVariant,t.cardAlign,t.cardInverse]},[t._t("img",[t.img?i("img",{class:["card-img","img-fluid"],attrs:{src:t.img,alt:t.imgAlt}}):t._e()]),t.header||t.$slots.header?i(t.headerTag,{tag:"component",class:["card-header",t.headerVariant?"bg-"+t.headerVariant:"",t.headerClass]},[t._t("header",[i("div",{domProps:{innerHTML:t._s(t.header)}})])],2):t._e(),t.noBlock?[t._t("default")]:i("div",{class:t.blockClass},[t.title?i(t.titleTag,{tag:"h4",staticClass:"card-title",domProps:{innerHTML:t._s(t.title)}}):t._e(),t.subTitle?i(t.subTitleTag,{tag:"h6",staticClass:"card-subtitle mb-2 text-muted",domProps:{innerHTML:t._s(t.subTitle)}}):t._e(),t._t("default")],2),t.footer||t.$slots.footer?i(t.footerTag,{tag:"component",class:["card-footer",t.footerVariant?"bg-"+t.footerVariant:"",t.footerClass]},[t._t("footer",[i("div",{domProps:{innerHTML:t._s(t.footer)}})])],2):t._e()],2)},staticRenderFns:[],computed:{blockClass:function(){return["card-block",this.overlay?"card-img-overlay":null]},cardVariant:function(){return this.variant?"card-"+this.variant:null},cardInverse:function(){return this.overlay||this.inverse?"card-inverse":null===this.inverse&&this.variant&&this.variant.length>0&&-1===this.variant.indexOf("outline")?"card-inverse":void 0},cardAlign:function(){return this.align?"text-"+this.align:null}},props:{align:{type:String,default:null},inverse:{type:Boolean,default:null},variant:{type:String,default:null},tag:{type:String,default:"div"},header:{type:String,default:null},headerVariant:{type:String,default:null},headerClass:{type:[String,Array],default:""},headerTag:{type:String,default:"div"},footer:{type:String,default:null},footerVariant:{type:String,default:null},footerClass:{type:[String,Array],default:""},footerTag:{type:String,default:"div"},title:{type:String,default:null},titleTag:{type:String,default:"h4"},subTitle:{type:String,default:null},subTitleTag:{type:String,default:"h6"},noBlock:{type:Boolean,default:!1},img:{type:String,default:null},imgAlt:{type:String,default:null},overlay:{type:Boolean,default:!1}}},cardGroup={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.tag,{tag:"component",class:["card-"+t.type]},[t._t("default")],2)},staticRenderFns:[],computed:{type:function(){return this.deck?"deck":this.columns?"columns":"group"}},props:{tag:{type:String,default:"div"},deck:{type:Boolean,default:!1},columns:{type:Boolean,default:!1}}},DIRECTION={next:{dirClass:"carousel-item-left",overlayClass:"carousel-item-next"},prev:{dirClass:"carousel-item-right",overlayClass:"carousel-item-prev"}},TRANS_DURATION=650,TransitionEndEvents={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"},carousel={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"carousel slide",style:{background:t.background,height:t.height},attrs:{role:"region",id:t.id||null,"aria-busy":t.isSliding?"true":"false"},on:{mouseenter:t.pause,mouseleave:t.start,focusin:t.pause,focusout:t.restart,keydown:[function(e){return"button"in e||!t._k(e.keyCode,"left",37)?"button"in e&&0!==e.button?null:(e.stopPropagation(),e.preventDefault(),void t.prev(e)):null},function(e){return"button"in e||!t._k(e.keyCode,"right",39)?"button"in e&&2!==e.button?null:(e.stopPropagation(),e.preventDefault(),void t.next(e)):null}]}},[i("div",{ref:"inner",staticClass:"carousel-inner",attrs:{role:"list",id:t.id?t.id+"__BV_inner_":null}},[t._t("default")],2),t.controls?[i("a",{staticClass:"carousel-control-prev",attrs:{href:"#",role:"button","aria-controls":t.id?t.id+"__BV_inner_":null},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.prev(e)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.stopPropagation(),e.preventDefault(),t.prev(e)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.stopPropagation(),e.preventDefault(),t.prev(e)}]}},[i("span",{staticClass:"carousel-control-prev-icon",attrs:{"aria-hidden":"true"}}),t._v(" "),i("span",{staticClass:"sr-only"},[t._v(t._s(t.labelPrev))])]),i("a",{staticClass:"carousel-control-next",attrs:{href:"#",role:"button","aria-controls":t.id?t.id+"__BV_inner_":null},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.next(e)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.stopPropagation(),e.preventDefault(),t.next(e)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.stopPropagation(),e.preventDefault(),t.next(e)}]}},[i("span",{staticClass:"carousel-control-next-icon",attrs:{"aria-hidden":"true"}}),t._v(" "),i("span",{staticClass:"sr-only"},[t._v(t._s(t.labelNext))])])]:t._e(),i("ol",{directives:[{name:"show",rawName:"v-show",value:t.indicators,expression:"indicators"}],staticClass:"carousel-indicators",attrs:{role:"group",id:t.id?t.id+"__BV_indicators_":null,"aria-hidden":t.indicators?"false":"true","aria-label":t.indicators&&t.labelIndicators?t.labelIndicators:null,"aria-owns":t.indicators&&t.id?t.id+"__BV_inner_":null}},t._l(t.slides.length,function(e){return i("li",{key:"slide_"+e,class:{active:e-1===t.index},attrs:{role:"button",id:t.id?t.id+"__BV_indicator_"+e+"_":null,tabindex:t.indicators?"0":"-1","aria-current":e-1===t.index?"true":"false","aria-label":t.labelGotoSlide+" "+e,"aria-describedby":t.slides[e-1].id||null,"aria-controls":t.id?t.id+"__BV_inner_":null},on:{click:function(i){t.setSlide(e-1)},keydown:[function(i){if(!("button"in i)&&t._k(i.keyCode,"enter",13))return null;i.stopPropagation(),i.preventDefault(),t.setSlide(e-1)},function(i){if(!("button"in i)&&t._k(i.keyCode,"space",32))return null;i.stopPropagation(),i.preventDefault(),t.setSlide(e-1)}]}})}))],2)},staticRenderFns:[],data:function(){return{index:this.value||0,isSliding:!1,intervalId:null,transitionEndEvent:null,slides:[]}},props:{id:{type:String},labelPrev:{type:String,default:"Previous Slide"},labelNext:{type:String,default:"Next Slide"},labelGotoSlide:{type:String,default:"Goto Slide"},labelIndicators:{type:String,default:"Select a slide to display"},interval:{type:Number,default:5e3},indicators:{type:Boolean,default:!1},controls:{type:Boolean,default:!1},height:{type:String},background:{type:String},value:{type:Number,default:0}},computed:{isCycling:function(){return Boolean(this.intervalId)}},methods:{setSlide:function(t){var e=this;if("undefined"==typeof document||!document.visibilityState||!document.hidden){var i=this.slides.length;0!==i&&(this.isSliding?this.$once("slid",function(){return e.setSlide(t)}):(t=Math.floor(t),this.index=t>=i?0:t>=0?t:i-1))}},prev:function(){this.setSlide(this.index-1)},next:function(){this.setSlide(this.index+1)},pause:function(){this.isCycling&&(clearInterval(this.intervalId),this.intervalId=null,this.slides[this.index].tabIndex=0)},start:function(){var t=this;Boolean(this.interval)&&!this.isCycling&&(this.slides.forEach(function(t){t.tabIndex=-1}),this.intervalId=setInterval(function(){t.next()},Math.max(1e3,this.interval)))},restart:function(t){t.relatedTarget&&this.$el.contains(t.relatedTarget)||this.start()},updateSlides:function(){this.pause(),this.slides=from(this.$refs.inner.querySelectorAll(".carousel-item"));var t=this.id,e=this.slides.length,i=Math.max(0,Math.min(Math.floor(this.index),e-1));this.slides.forEach(function(n,s){var r=s+1;n.classList[s===i?"add":"remove"]("active"),n.setAttribute("aria-current",s===i?"true":"false"),n.setAttribute("aria-posinset",String(r)),n.setAttribute("aria-setsize",String(e)),n.tabIndex=-1,t&&n.setAttribute("aria-controlledby",t+"__BV_indicator_"+r+"_")}),this.setSlide(i),this.start()}},watch:{value:function(t,e){t!==e&&this.setSlide(t)},interval:function(t,e){t!==e&&(Boolean(t)?(this.pause(),this.start()):this.pause())},index:function(t,e){var i=this;if(t!==e&&!this.isSliding){var n=t>e?DIRECTION.next:DIRECTION.prev;0===e&&t===this.slides.length-1?n=DIRECTION.prev:e===this.slides.length-1&&0===t&&(n=DIRECTION.next);var s=this.slides[e],r=this.slides[t];if(s&&r){this.isSliding=!0,this.$emit("slide",t),this.$emit("input",this.index),r.classList.add(n.overlayClass),r.offsetHeight,s.classList.add(n.dirClass),r.classList.add(n.dirClass);var o=!1,a=function(e){o||(o=!0,i.transitionEndEvent&&s.removeEventListener(i.transitionEndEvent,a),i._animationTimeout=null,r.classList.remove(n.dirClass),r.classList.remove(n.overlayClass),r.classList.add("active"),s.classList.remove("active"),s.classList.remove(n.dirClass),s.classList.remove(n.overlayClass),s.setAttribute("aria-current","false"),r.setAttribute("aria-current","true"),s.setAttribute("aria-hidden","true"),r.setAttribute("aria-hidden","false"),s.tabIndex=-1,r.tabIndex=-1,i.isCycling||(r.tabIndex=0,i.$nextTick(function(){r.focus()})),i.isSliding=!1,i.$nextTick(function(){return i.$emit("slid",t)}))};this.transitionEndEvent&&s.addEventListener(this.transitionEndEvent,a),this._animationTimeout=setTimeout(a,TRANS_DURATION)}}}},created:function(){this._animationTimeout=null},mounted:function(){this.transitionEndEvent=getTransisionEndEvent(this.$el)||null,this.updateSlides(),observeDOM(this.$refs.inner,this.updateSlides.bind(this),{subtree:!1})},destroyed:function(){clearInterval(this.intervalId),clearTimeout(this._animationTimeout),this._animationTimeout=null}},carouselSlide={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"carousel-item",style:{background:t.background,height:t.height},attrs:{role:"listitem",id:t.id||null}},[t._t("img",[t.img?i("img",{staticClass:"d-block img-fluid",attrs:{src:t.img,alt:t.imgAlt}}):t._e()]),i(t.contentTag,{tag:"div",class:t.contentClasses},[t.caption?i(t.captionTag,{tag:"h3",domProps:{innerHTML:t._s(t.caption)}}):t._e(),t.text?i(t.textTag,{tag:"p",domProps:{innerHTML:t._s(t.text)}}):t._e(),t._t("default")],2)],2)},staticRenderFns:[],props:{id:{type:String},img:{type:String},imgAlt:{type:String},contentVisibleUp:{type:String},contentTag:{type:String,default:"div"},caption:{type:String},captionTag:{type:String,default:"h3"},text:{type:String},textTag:{type:String,default:"p"},background:{type:String},height:{type:String}},computed:{contentClasses:function(){return["carousel-caption",this.contentVisibleUp?"d-none":"",this.contentVisibleUp?"d-"+this.contentVisibleUp+"-block":""]}}},collapse={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("transition",{attrs:{"enter-class":"","enter-active-class":"collapsing","enter-to-class":"","leave-class":"","leave-active-class":"collapsing","leave-to-class":""},on:{enter:t.onEnter,"after-enter":t.onAfterEnter,leave:t.onLeave,"after-leave":t.onAfterLeave}},[i("div",{directives:[{name:"show",rawName:"v-show",value:t.show,expression:"show"}],class:t.classObject,attrs:{id:t.id||null},on:{click:t.clickHandler}},[t._t("default")],2)])},staticRenderFns:[],mixins:[listenOnRootMixin],data:function(){return{show:this.visible,transitioning:!1}},model:{prop:"visible",event:"input"},props:{id:{type:String,required:!0},isNav:{type:Boolean,default:!1},accordion:{type:String,default:null},visible:{type:Boolean,default:!1}},watch:{visible:function(t){t!==this.show&&(this.show=t)},show:function(t,e){t!==e&&this.emitState()}},computed:{classObject:function(){return{"navbar-collapse":this.isNav,collapse:!this.transitioning,show:this.show&&!this.transitioning}}},methods:{toggle:function(){this.show=!this.show},onEnter:function(t){t.style.height=0,this.reflow(t),t.style.height=t.scrollHeight+"px",this.transitioning=!0,this.$emit("show")},onAfterEnter:function(t){t.style.height=null,this.transitioning=!1,this.$emit("shown")},onLeave:function(t){t.style.height="auto",t.style.display="block",t.style.height=t.getBoundingClientRect().height+"px",this.reflow(t),this.transitioning=!0,t.style.height=0,this.$emit("hide")},onAfterLeave:function(t){t.style.height=null,this.transitioning=!1,this.$emit("hidden")},reflow:function(t){t.offsetHeight},emitState:function(){this.$emit("input",this.show),this.$root.$emit("collapse::toggle::state",this.id,this.show),this.accordion&&this.show&&this.$root.$emit("accordion::toggle",this.id,this.accordion)},clickHandler:function(t){var e=t.target;this.isNav&&e&&"block"===getComputedStyle(this.$el).display&&(e.classList.contains("nav-link")||e.classList.contains("dropdown-item"))&&(this.show=!1)},handleToggleEvt:function(t){t===this.id&&this.toggle()},handleAccordionEvt:function(t,e){this.accordion&&e===this.accordion&&(t===this.id?this.show||this.toggle():this.show&&this.toggle())},handleResize:function(){this.show="block"===getComputedStyle(this.$el).display}},created:function(){this.listenOnRoot("collapse::toggle",this.handleToggleEvt),this.listenOnRoot("accordion::toggle",this.handleAccordionEvt)},mounted:function(){this.isNav&&"undefined"!=typeof document&&(window.addEventListener("resize",this.handleResize,!1),window.addEventListener("orientationchange",this.handleResize,!1),this.handleResize()),this.emitState()},destroyed:function(){this.isNav&&"undefined"!=typeof document&&(window.removeEventListener("resize",this.handleResize,!1),window.removeEventListener("orientationchange",this.handleResize,!1))}},dropdown={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:t.dropdownClasses,attrs:{id:t.id||null}},[i("b-button",{ref:"button",class:{"dropdown-toggle":!t.split},attrs:{id:t.id?t.id+"__BV_button_":null,"aria-haspopup":t.split?null:"true","aria-expanded":t.split?null:t.visible?"true":"false",variant:t.variant,size:t.size,disabled:t.disabled},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.click(e)}}},[t._t("button-content",[t._t("text",[t._v(t._s(t.text))])])],2),t.split?i("b-button",{ref:"toggle",class:["dropdown-toggle","dropdown-toggle-split"],attrs:{id:t.id?t.id+"__BV_toggle_":null,"aria-haspopup":t.split?"true":null,"aria-expanded":t.split?t.visible?"true":"false":null,variant:t.variant,size:t.size,disabled:t.disabled},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.toggle(e)}}},[i("span",{staticClass:"sr-only"},[t._v(t._s(t.toggleText))])]):t._e(),i("div",{ref:"menu",class:t.menuClasses,attrs:{role:"menu","aria-labelledby":t.id?t.id+(t.split?"__BV_toggle_":"__BV_button_"):null},on:{mouseover:t.onMouseOver,keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"esc",27))return null;t.onEsc(e)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"tab",9))return null;t.onTab(e)},function(e){if(!("button"in e)&&t._k(e.keyCode,"up",38))return null;t.focusNext(e,!0)},function(e){if(!("button"in e)&&t._k(e.keyCode,"down",40))return null;t.focusNext(e,!1)}]}},[t._t("default")],2)],1)},staticRenderFns:[],mixins:[dropdownMixin],components:{bButton:bBtn},props:{split:{type:Boolean,default:!1},toggleText:{type:String,default:"Toggle Dropdown"},size:{type:String,default:null},variant:{type:String,default:null}},computed:{dropdownClasses:function(){return["b-dropdown","dropdown","btn-group",this.dropup?"dropup":"",this.visible?"show":""]},menuClasses:function(){return["dropdown-menu",this.right?"dropdown-menu-right":"",this.visible?"show":""]}}},dropdownItem={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("b-link",t._b({staticClass:"dropdown-item",attrs:{role:"menuitem"},on:{click:function(e){t.$emit("click",e)}}},"b-link",t.linkProps,!1),[t._t("default")],2)},staticRenderFns:[],components:{bLink:bLink},props:props,computed:{linkProps:computed.linkProps}},dropdownItemButton={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("button",{staticClass:"dropdown-item",attrs:{type:"button",role:"menuitem",disabled:t.disabled},on:{click:t.onClick}},[t._t("default")],2)},staticRenderFns:[],props:{disabled:{type:Boolean,default:!1}},methods:{onClick:function(t){this.$root.$emit("clicked::link",this),this.$emit("click",t)}}},dropdownDivider={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{staticClass:"dropdown-divider",attrs:{role:"separator"}})},staticRenderFns:[],props:{}},dropdownHeader={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.tag,{tag:"component",staticClass:"dropdown-header"},[t._t("default")],2)},staticRenderFns:[],props:{tag:{type:String,default:"h6"}}},dropdownSelect={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"dropdown-select",class:{open:t.show,dropdown:!t.dropup,dropup:t.dropup}},[i("button",{class:["btn","dropdown",t.dropdownToggle,t.btnVariant,t.btnSize],attrs:{id:t.id,role:"button","aria-haspopup":"true","aria-expanded":"show",disabled:t.disabled},on:{click:function(e){e.preventDefault(),t.toggle(e)}}},[i("span",{staticClass:"checked-items",domProps:{innerHTML:t._s(t.displayItem)}})]),i("ul",{staticClass:"dropdown-menu",class:{"dropdown-menu-right":"right"==t.position},attrs:{"aria-labelledby":"dLabel"}},t._l(t.list,function(e){return i("li",[i("button",{staticClass:"dropdown-item",attrs:{click:t.select(e)}},[t._v(t._s(e.text))])])}))])},staticRenderFns:[],data:function(){return{show:!1,selected:!1}},computed:{btnVariant:function(){return this.variant&&"default"!==this.variant?"btn-"+this.variant:"btn-secondary"},btnSize:function(){return this.size&&"default"!==this.size?"btn-"+this.size:""},dropdownToggle:function(){return this.caret?"dropdown-toggle":""},displayItem:function(){if(this.returnObject&&this.model&&!this.model.text||!this.returnObject&&this.model&&0===this.model.length||this.forceDefault)return this.defaultText;if(this.returnObject&&this.model&&this.model.text)return this.model.text;if(!this.returnObject&&this.model){var t=this.model||"";return this.list.forEach(function(e){e.value===this.model&&(t=e.text)}),t}return""}},props:{id:{type:String},model:{required:!1},list:{type:Array,default:[],required:!0},caret:{type:Boolean,default:!0},position:{type:String,default:"left"},size:{type:String,default:""},variant:{type:String,default:"default"},defaultText:{type:String,default:"Plase select one"},forceDefault:{type:Boolean,default:!1},returnObject:{type:Boolean,default:!1},dropup:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},methods:{toggle:function(t){this.show=!this.show,this.show?(this.$root.$emit("shown:dropdown",this.id),t.stopPropagation()):this.$root.$emit("hidden::dropdown",this.id)},select:function(t){this.returnObject?this.model=t:this.model=t.value,this.show=!1,this.$root.$emit("selected::dropdown",this.id,this.model)}},created:function(){this.$root.$on("hide::dropdown",function(){this.show=!1})}},bForm={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("form",{class:t.classObject,on:{submit:function(e){t.$emit("submit",e)}}},[t._t("default")],2)},staticRenderFns:[],computed:{classObject:function(){return[this.inline?"form-inline":""]}},props:{inline:{type:Boolean,default:!1}}},INPUT_SELECTOR=['[role="radiogroup"]',"input","select","textarea",".form-control",".form-control-static",".dropdown",".dropup"].join(","),formFieldset={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:["form-group","row",t.inputState],attrs:{id:t.id||null,role:"group","aria-describedby":t.describedBy}},[t.label||t.$slots.label?i("label",{class:[t.labelSrOnly?"sr-only":"col-form-label",t.labelLayout,t.labelAlignClass],attrs:{for:t.target,id:t.labelId}},[t._t("label",[i("span",{domProps:{innerHTML:t._s(t.label)}})])],2):t._e(),i("div",{ref:"content",class:t.inputLayout},[t._t("default"),t.feedback||t.$slots.feedback?i("div",{staticClass:"form-text form-control-feedback",attrs:{id:t.feedbackId,role:"alert","aria-live":"assertive","aria-atomic":"true"}},[t._t("feedback",[i("span",{domProps:{innerHTML:t._s(t.feedback)}})])],2):t._e(),t.description||t.$slots.description?i("small",{staticClass:"form-text text-muted",attrs:{id:t.descriptionId}},[t._t("description",[i("span",{domProps:{innerHTML:t._s(t.description)}})])],2):t._e()],2)])},staticRenderFns:[],data:function(){return{target:null}},computed:{labelId:function(){return this.id&&this.label?this.id+"__BV_label_":null},descriptionId:function(){return this.id&&this.description?this.id+"__BV_description_":null},feedbackId:function(){return this.id&&this.feedback?this.id+"__BV_feedback_":null},describedBy:function(){return this.id&&(this.label||this.feedback||this.description)?[this.labelId,this.descriptionId,this.feedbackId].filter(function(t){return t}).join(" "):null},inputState:function(){return this.state?"has-"+this.state:""},computedLabelCols:function(){return this.labelSize?(warn("b-form-fieldset: prop label-size has been deprecated. Use label-cols instead"),this.labelSize):this.labelCols},labelLayout:function(){return this.labelSrOnly?null:this.horizontal?"col-sm-"+this.computedLabelCols:"col-12"},labelAlignClass:function(){return this.labelSrOnly?null:this.labelTextAlign?"text-"+this.labelTextAlign:null},inputLayout:function(){return this.horizontal?"col-sm-"+(12-this.computedLabelCols):"col-12"}},methods:{updateTarget:function(){if(this.labelFor)return this.labelFor;var t=this.$refs.content;if(!t)return null;var e=t.querySelector(this.inputSelector);this.target=e&&e.id?e.id:null}},mounted:function(){this.updateTarget()},updated:function(){this.updateTarget()},props:{id:{type:String,default:null},labelFor:{type:String,default:function(){return this&&this.for?(warn("b-form-fieldet: prop 'for' has been deprecated. Use 'label-for' instead"),this.for):null}},for:{type:String,default:null},state:{type:String,default:null},horizontal:{type:Boolean,default:!1},labelCols:{type:Number,default:3,validator:function(t){return t>=1&&t<=11||(warn("b-form-fieldset: label-cols must be a value between 1 and 11"),!1)}},labelSize:{type:Number},labelTextAlign:{type:String,default:null},label:{type:String,default:null},labelSrOnly:{type:Boolean,default:!1},description:{type:String,default:null},feedback:{type:String,default:null},inputSelector:{type:String,default:INPUT_SELECTOR}}},formCheckbox={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("label",{class:t.button?t.btnLabelClasses:t.labelClasses,attrs:{"aria-pressed":t.button?t.isChecked?"true":"false":null}},[i("input",{ref:"check",class:t.custom&&!t.button?"custom-control-input":null,attrs:{type:"checkbox",id:t.id||null,name:t.name,disabled:t.disabled,required:t.required,autocomplete:"off","aria-required":t.required?"true":null},domProps:{value:t.value,checked:t.isChecked},on:{focus:t.handleFocus,blur:t.handleFocus,change:t.handleChange}}),t._v(" "),t.custom&&!t.button?i("span",{staticClass:"custom-control-indicator",attrs:{"aria-hidden":"true"}}):t._e(),t._v(" "),i("span",{class:t.custom&&!t.button?"custom-control-description":null},[t._t("default")],2)])},staticRenderFns:[],mixins:[formMixin,formCustomMixin,formCheckBoxMixin],model:{prop:"checked",event:"change"},props:{value:{default:!0},uncheckedValue:{default:!1},checked:{default:!0},indeterminate:{type:Boolean,default:!1},size:{type:String,default:null},button:{type:Boolean,default:!1},buttonVariant:{type:String,default:"secondary"}},computed:{labelClasses:function(){return[this.size?"form-control-"+this.size:"",this.custom?"custom-checkbox":"",this.checkboxClass]},btnLabelClasses:function(){return["btn","btn-"+this.buttonVariant,this.size?"btn-"+this.size:"",this.isChecked?"active":"",this.disabled?"disabled":""]},isChecked:function(){return isArray(this.checked)?arrayIncludes(this.checked,this.value):this.checked===this.value}},watch:{indeterminate:function(t,e){this.setIndeterminate(t)}},methods:{handleChange:function(t){var e=this,i=t.target.checked;isArray(this.checked)?this.isChecked?this.$emit("change",this.checked.filter(function(t){return t!==e.value})):this.$emit("change",this.checked.concat([this.value])):this.$emit("change",i?this.value:this.uncheckedValue),this.$emit("update:indeterminate",this.$refs.check.indeterminate)},setIndeterminate:function(t){this.$refs.check.indeterminate=t,this.$emit("update:indeterminate",this.$refs.check.indeterminate)},handleFocus:function(t){if(this.button&&t.target&&t.target.parentElement){var e=t.target.parentElement;"focus"===t.type?e.classList.add("focus"):"blur"===t.type&&e.classList.remove("focus")}}},mounted:function(){this.setIndeterminate(this.indeterminate)}},formRadio={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:t.buttons?t.btnGroupClasses:t.radioGroupClasses,attrs:{id:t.id||null,role:"radiogroup","data-toggle":t.buttons?"buttons":null,"aria-required":t.required?"true":null,"aria-invalid":t.invalid?"true":null}},t._l(t.formOptions,function(e,n){return i("label",{key:n,class:t.buttons?t.btnLabelClasses(e,n):t.labelClasses,attrs:{"aria-pressed":t.buttons?e.value===t.localValue?"true":"false":null}},[i("input",{directives:[{name:"model",rawName:"v-model",value:t.localValue,expression:"localValue"}],ref:"inputs",refInFor:!0,class:t.custom&&!t.buttons?"custom-control-input":null,attrs:{id:t.id?t.id+"__BV_radio_"+n:null,type:"radio",autocomplete:"off",name:t.name,required:t.name&&t.required,disabled:e.disabled||t.disabled},domProps:{value:e.value,checked:t._q(t.localValue,e.value)},on:{focus:t.handleFocus,blur:t.handleFocus,change:function(i){t.$emit("change",t.returnObject?e:e.value)},__c:function(i){t.localValue=e.value}}}),t._v(" "),t.custom&&!t.buttons?i("span",{staticClass:"custom-control-indicator",attrs:{"aria-hidden":"true"}}):t._e(),t._v(" "),i("span",{class:t.custom&&!t.buttons?"custom-control-description":null,domProps:{innerHTML:t._s(e.text)}})])}))},staticRenderFns:[],mixins:[formMixin,formCustomMixin,formCheckBoxMixin,formOptionsMixin],data:function(){return{localValue:this.value}},props:{value:{},options:{type:[Array,Object],default:null,required:!0},size:{type:String,default:null},state:{type:String,default:null},invalid:{type:[Boolean,String],default:!1},stacked:{type:Boolean,default:!1},buttons:{type:Boolean,default:!1},buttonVariant:{type:String,default:"secondary"},returnObject:{type:Boolean,default:!1}},computed:{radioGroupClasses:function(){return[this.size?"form-control-"+this.size:null,this.state?"has-"+this.state:"",this.stacked?"custom-controls-stacked":""]},btnGroupClasses:function(){return["btn-group",this.size?"btn-group-"+this.size:null,this.stacked?"btn-group-vertical":""]},labelClasses:function(){return[this.checkboxClass,this.custom?"custom-radio":null]},inline:function(){return!this.stacked}},methods:{btnLabelClasses:function(t,e){return["btn","btn-"+this.buttonVariant,t.disabled||this.disabled?"disabled":"",t.value===this.localValue?"active":null,this.stacked&&e===this.formOptions.length-1?"":"mb-0"]},handleFocus:function(t){if(this.buttons&&t.target&&t.target.parentElement){var e=t.target.parentElement;"focus"===t.type?e.classList.add("focus"):"blur"===t.type&&e.classList.remove("focus")}}}},bFormInputStatic={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("p",{class:t.inputClass,attrs:{id:t.id||null},domProps:{innerHTML:t._s(t.staticValue)}})},staticRenderFns:[],computed:{staticValue:function(){var t=this.value;return""===t||null===t?"&nbsp;":t},inputClass:function(){return["form-control-static",this.size?"form-control-"+this.size:null,this.state?"form-control-"+this.state:null]}},props:{id:{type:String,default:null},value:{default:null},size:{type:String,default:null},state:{type:String,default:null}}},formInput={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.static?i("b-form-input-static",{attrs:{id:t.id||null,value:t.value,size:t.size,state:t.state}}):t.isTextArea?i("textarea",{ref:"input",class:t.inputClass,attrs:{name:t.name,id:t.id||null,disabled:t.disabled,required:t.required,autocomplete:t.autocomplete||null,"aria-required":t.required?"true":null,"aria-invalid":t.ariaInvalid,readonly:t.readonly,rows:t.rows||t.rowsCount,placeholder:t.placeholder},domProps:{value:t.value},on:{input:function(e){t.onInput(e.target.value,e.target)},change:function(e){t.onChange(e.target.value,e.target)},keyup:function(e){t.onKeyUp(e)},focus:function(e){t.$emit("focus")},blur:function(e){t.$emit("blur")}}}):i("input",{ref:"input",class:t.inputClass,attrs:{name:t.name,type:t.type,id:t.id||null,disabled:t.disabled,required:t.required,autocomplete:t.autocomplete||null,"aria-required":t.required?"true":null,"aria-invalid":t.ariaInvalid,readonly:t.readonly,placeholder:t.placeholder},domProps:{value:t.value},on:{input:function(e){t.onInput(e.target.value,e.target)},change:function(e){t.onChange(e.target.value,e.target)},keyup:function(e){t.onKeyUp(e)},focus:function(e){t.$emit("focus")},blur:function(e){t.$emit("blur")}}})},staticRenderFns:[],mixins:[formMixin],components:{bFormInputStatic:bFormInputStatic},computed:{isTextArea:function(){return this.textarea||"textarea"===this.type},rowsCount:function(){return(this.value||"").toString().split("\n").length},inputClass:function(){return["form-control",this.size?"form-control-"+this.size:null,this.state?"form-control-"+this.state:null]},ariaInvalid:function(){return!1===this.invalid?null:!0===this.invalid?"true":this.invalid}},watch:{value:function(t,e){t!==e&&(this.$refs.input.value=t)}},methods:{format:function(t,e){if(this.formatter){var i=this.formatter(t,e);if(i!==t)return this.$refs.input.value=i,i}return this.$refs.input.value=t,t},onInput:function(t,e){var i=t;this.lazyFormatter||(i=this.format(t,e)),this.$emit("input",i)},onChange:function(t,e){var i=this.format(t,e);this.$emit("input",i),this.$emit("change",i)},onKeyUp:function(t){this.$emit("keyup",t)},focus:function(){this.$refs.input.focus()}},props:{value:{default:""},type:{type:String,default:"text"},size:{type:String,default:null},state:{type:String,default:null},invalid:{type:[Boolean,String],default:!1},readonly:{type:Boolean,default:!1},autocomplete:{type:String,default:null},static:{type:Boolean,default:!1},placeholder:{type:String,default:null},rows:{type:Number,default:null},textarea:{type:Boolean,default:!1},formatter:{type:Function},lazyFormatter:{type:Boolean,default:!1}}},formFile={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:t.custom?"custom-file":null,attrs:{id:t.id?t.id+"__BV_file_outer_":null},on:{dragover:function(e){e.stopPropagation(),e.preventDefault(),t.dragover(e)}}},[t.dragging&&t.custom?i("span",{staticClass:"drop-here",attrs:{"data-drop":t.dropLabel},on:{dragover:function(e){e.stopPropagation(),e.preventDefault(),t.dragover(e)},drop:function(e){e.stopPropagation(),e.preventDefault(),t.drop(e)},dragleave:function(e){e.stopPropagation(),e.preventDefault(),t.dragging=!1}}}):t._e(),i("input",{ref:"input",class:t.custom?"custom-file-input":"",attrs:{type:"file",name:t.name,id:t.id||null,disabled:t.disabled,required:t.required,"aria-required":t.required?"true":null,accept:t.accept||null,multiple:t.multiple,webkitdirectory:t.directory,"aria-describedby":t.custom&&t.id?t.id+"__BV_file_control_":null},on:{change:t.onFileChange}}),t._v(" "),t.custom?i("span",{class:["custom-file-control",t.dragging?"dragging":null],attrs:{id:t.id?t.id+"__BV_file_control_":null,"data-choose":t.computedChooseLabel,"data-selected":t.selectedLabel}}):t._e()])},staticRenderFns:[],_scopeId:"data-v-c68bd5f8",mixins:[formMixin,formCustomMixin],data:function(){return{selectedFile:null,dragging:!1}},computed:{selectedLabel:function(){return this.selectedFile&&0!==this.selectedFile.length?this.multiple?1===this.selectedFile.length?this.selectedFile[0].name:this.selectedFormat.replace(":names",this.selectedFile.map(function(t){return t.name}).join(",")).replace(":count",this.selectedFile.length):this.selectedFile.name:this.placeholder||"No file chosen"},computedChooseLabel:function(){return this.chooseLabel||(this.multiple?"Choose Files":"Choose File")}},watch:{selectedFile:function(t,e){t!==e&&(!t&&this.multiple?this.$emit("input",[]):this.$emit("input",t))}},methods:{reset:function(){try{this.$refs.input.value=""}catch(t){}this.$refs.input.type="",this.$refs.input.type="file",this.selectedFile=this.multiple?[]:null},onFileChange:function(t){var e=this;this.$emit("change",t);var i=t.dataTransfer&&t.dataTransfer.items;if(!i||this.noTraverse)this.setFiles(t.target.files||t.dataTransfer.files);else{for(var n=[],s=0;s<i.length;s++){var r=i[s].webkitGetAsEntry();r&&n.push(e.traverseFileTree(r))}Promise.all(n).then(function(t){e.setFiles(from(t))})}},setFiles:function(t){var e=this;if(t)if(this.multiple){for(var i=[],n=0;n<t.length;n++)t[n].type.match(e.accept)&&i.push(t[n]);this.selectedFile=i}else this.selectedFile=t[0];else this.selectedFile=null},dragover:function(t){!this.noDrop&&this.custom&&(this.dragging=!0,t.dataTransfer.dropEffect="copy")},drop:function(t){this.noDrop||(this.dragging=!1,t.dataTransfer.files&&t.dataTransfer.files.length>0&&this.onFileChange(t))},traverseFileTree:function(t,e){var i=this;return new Promise(function(n){e=e||"",t.isFile?t.file(function(t){t.$path=e,n(t)}):t.isDirectory&&t.createReader().readEntries(function(s){for(var r=[],o=0;o<s.length;o++)r.push(i.traverseFileTree(s[o],e+t.name+"/"));Promise.all(r).then(function(t){n(from(t))})})})}},props:{accept:{type:String,default:""},placeholder:{type:String,default:null},chooseLabel:{type:String,default:null},multiple:{type:Boolean,default:!1},directory:{type:Boolean,default:!1},noTraverse:{type:Boolean,default:!1},selectedFormat:{type:String,default:":count Files"},noDrop:{type:Boolean,default:!1},dropLabel:{type:String,default:"Drop files here"}}},formSelect={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("select",{directives:[{name:"model",rawName:"v-model",value:t.localValue,expression:"localValue"}],ref:"input",class:t.inputClass,attrs:{name:t.name,id:t.id||null,multiple:t.multiple||null,size:t.multiple||t.selectSize>1?t.selectSize:null,disabled:t.disabled,required:t.required,"aria-required":t.required?"true":null,"aria-invalid":t.ariaInvalid},on:{change:function(e){var i=Array.prototype.filter.call(e.target.options,function(t){return t.selected}).map(function(t){return"_value"in t?t._value:t.value});t.localValue=e.target.multiple?i:i[0]}}},t._l(t.formOptions,function(e){return i("option",{attrs:{disabled:e.disabled},domProps:{value:e.value,innerHTML:t._s(e.text)}})}))},staticRenderFns:[],mixins:[formMixin,formCustomMixin,formOptionsMixin],data:function(){return{localValue:this.multiple?this.value||[]:this.value}},computed:{inputClass:function(){return["form-control",this.size?"form-control-"+this.size:null,this.plain||this.multiple||this.selectSize>1?null:"custom-select"]},ariaInvalid:function(){return!0===this.invalid||"true"===this.invalid?"true":null}},props:{value:{},invalid:{type:[Boolean,String],default:!1},size:{type:String,default:null},options:{type:[Array,Object],required:!0},multiple:{type:Boolean,default:!1},selectSize:{type:Number,default:0},returnObject:{type:Boolean,default:!1}},created:function(){this.returnObject&&warn("form-select: return-object has been deprecated and will be removed in future releases")}},jumbotron={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{class:["jumbotron",t.fluid?"jumbotron-fluid":null]},[i("div",{class:t.containerFluid?"container-fluid":"container"},[t.header?i(t.headerTag,{tag:"h1",staticClass:"display-3",domProps:{innerHTML:t._s(t.header)}}):t._e(),t.lead?i("p",{staticClass:"lead",domProps:{innerHTML:t._s(t.lead)}}):t._e(),t._t("default")],2)])},staticRenderFns:[],computed:{},props:{fluid:{type:Boolean,default:!1},containerFluid:{type:Boolean,default:!1},header:{type:String,default:null},headerTag:{type:String,default:"h1"},lead:{type:String,default:null}}},badge={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("span",{class:["badge",t.badgeVariant,t.badgePill]},[t._t("default")],2)},staticRenderFns:[],computed:{badgeVariant:function(){return this.variant&&"default"!==this.variant?"badge-"+this.variant:"badge-default"},badgePill:function(){return this.pill?"badge-pill":""}},props:{variant:{type:String,default:"default"},pill:{type:Boolean,default:!1}}},listGroup={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.tag,{tag:"component",class:["list-group",t.flush?"list-group-flush":null]},[t._t("default")],2)},staticRenderFns:[],props:{tag:{type:String,default:"div"},flush:{type:Boolean,default:!1}}},linkProps$1=assign(omitLinkProps("href","to"),{href:{type:props.href.type},to:{type:props.to.type},tag:{type:props.tag.type}}),actionTags=["a","router-link","button","b-link"],listGroupItem={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.myTag,t._b({ref:"item",tag:"component",class:t.classObject},"component",t.conditionalLinkProps,!1),[t._t("default")],2)},staticRenderFns:[],components:{bLink:bLink},computed:{linkProps:computed.linkProps,classObject:function(){return["list-group-item",this.listState,this.active?"active":null,this.disabled?"disabled":null,this.isAction?"list-group-item-action":null]},isAction:function(){return!1!==this.action&&!!(this.action||this.to||this.href||arrayIncludes(actionTags,this.tag))},listState:function(){return this.variant?"list-group-item-"+this.variant:null},myTag:function(){return this.tag?this.tag:this.to||this.href?"b-link":"div"},conditionalLinkProps:function(){return"b-link"!==this.myTag?{}:this.linkProps}},props:assign(linkProps$1,{action:{type:Boolean,default:null},variant:{type:String,default:null}})},media={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"media"},[t.rightAlign?t._e():i("div",{class:["d-flex","mr-3",t.verticalAlignClass]},[t._t("aside")],2),i("div",{staticClass:"media-body"},[t._t("default")],2),t.rightAlign?i("div",{class:["d-flex","ml-3",t.verticalAlignClass]},[t._t("aside")],2):t._e()])},staticRenderFns:[],computed:{verticalAlignClass:function(){return"align-self-"+this.verticalAlign}},props:{rightAlign:{type:Boolean,default:!1},verticalAlign:{type:String,default:"top"}}},FOCUS_SELECTOR=["button:not([disabled])","input:not([disabled])","select:not([disabled])","textarea:not([disabled])","a:not([disabled]):not(.disabled)","[tabindex]:not([disabled]):not(.disabled)"].join(","),modal={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("transition-group",{attrs:{"enter-class":"hidden","enter-to-class":"","enter-active-class":"","leave-class":"show","leave-active-class":"","leave-to-class":"hidden"},on:{"after-enter":t.focusFirst}},[i("div",{directives:[{name:"show",rawName:"v-show",value:t.is_visible,expression:"is_visible"}],key:"modal",ref:"modal",class:["modal",{fade:!t.noFade,show:t.is_visible}],attrs:{id:t.id||null,role:"dialog"},on:{click:function(e){t.onClickOut()},keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"esc",27))return null;t.onEsc()}}},[i("div",{class:["modal-dialog","modal-"+t.size]},[i("div",{ref:"content",staticClass:"modal-content",attrs:{tabindex:"-1",role:"document","aria-labelledby":t.hideHeader||!t.id?null:t.id+"__BV_header_","aria-describedby":t.id?t.id+"__BV_body_":null},on:{click:function(t){t.stopPropagation()}}},[t.hideHeader?t._e():i("header",{ref:"header",staticClass:"modal-header",attrs:{id:t.id?t.id+"__BV_header_":null}},[t._t("modal-header",[i(t.titleTag,{tag:"h5",staticClass:"modal-title"},[t._t("modal-title",[t._v(t._s(t.title))])],2),t.hideHeaderClose?t._e():i("button",{staticClass:"close",attrs:{type:"button","aria-label":t.headerCloseLabel},on:{click:t.hide}},[i("span",{attrs:{"aria-hidden":"true"}},[t._v("×")])])])],2),i("div",{ref:"body",staticClass:"modal-body",attrs:{id:t.id?t.id+"__BV_body_":null}},[t._t("default")],2),t.hideFooter?t._e():i("footer",{ref:"footer",staticClass:"modal-footer"},[t._t("modal-footer",[t.okOnly?t._e():i("b-btn",{attrs:{variant:"secondary",size:t.buttonSize},on:{click:function(e){t.hide(!1)}}},[t._t("modal-cancel",[t._v(t._s(t.closeTitle))])],2),i("b-btn",{attrs:{variant:"primary",size:t.buttonSize,disabled:t.okDisabled},on:{click:function(e){t.hide(!0)}}},[t._t("modal-ok",[t._v(t._s(t.okTitle))])],2)])],2)])])]),t.is_visible?i("div",{key:"modal-backdrop",class:["modal-backdrop",{fade:!t.noFade,show:t.is_visible}]}):t._e()])],1)},staticRenderFns:[],_scopeId:"data-v-1b4cbb68",mixins:[listenOnRootMixin],components:{bBtn:bBtn},data:function(){return{is_visible:!1,return_focus:this.returnFocus||null}},model:{prop:"visible",event:"change"},computed:{body:function(){if("undefined"!=typeof document)return document.querySelector("body")}},watch:{visible:function(t,e){t!==e&&(t?this.show():this.hide())}},props:{id:{type:String,default:null},title:{type:String,default:""},titleTag:{type:String,default:"h5"},size:{type:String,default:"md"},buttonSize:{type:String,default:"md"},noFade:{type:Boolean,default:!1},noCloseOnBackdrop:{type:Boolean,default:!1},noCloseOnEsc:{type:Boolean,default:!1},noAutoFocus:{type:Boolean,default:!1},noEnforceFocus:{type:Boolean,default:!1},hideHeader:{type:Boolean,default:!1},hideFooter:{type:Boolean,default:!1},hideHeaderClose:{type:Boolean,default:!1},okOnly:{type:Boolean,default:!1},okDisabled:{type:Boolean,default:!1},visible:{type:Boolean,default:!1},returnFocus:{default:null},headerCloseLabel:{type:String,default:"Close"},closeTitle:{type:String,default:"Close"},okTitle:{type:String,default:"OK"}},methods:{show:function(){this.is_visible||(this.$emit("show"),this.is_visible=!0,this.$root.$emit("shown::modal",this.id),this.body.classList.add("modal-open"),this.$emit("shown"),this.$emit("change",!0),"undefined"!=typeof document&&(document.removeEventListener("focusin",this.enforceFocus,!1),document.addEventListener("focusin",this.enforceFocus,!1)))},hide:function(t){if(this.is_visible){var e=!1,i={isOK:t,cancel:function(){e=!0}};this.$emit("change",!1),this.$emit("hide",i),!0===t?this.$emit("ok",i):!1===t&&this.$emit("cancel",i),e||("undefined"!=typeof document&&(document.removeEventListener("focusin",this.enforceFocus,!1),this.returnFocusTo()),this.is_visible=!1,this.$root.$emit("hidden::modal",this.id),this.$emit("hidden",i),this.body.classList.remove("modal-open"))}},onClickOut:function(){this.is_visible&&!this.noCloseOnBackdrop&&this.hide()},onEsc:function(){this.is_visible&&!this.noCloseOnEsc&&this.hide()},focusFirst:function(){var t=this;"undefined"!=typeof document&&this.$nextTick(function(){if(!document.activeElement||!t.$refs.content.contains(document.activeElement)){var e;t.noAutoFocus||(t.$refs.body&&(e=findFirstVisible(t.$refs.body,FOCUS_SELECTOR)),!e&&t.$refs.footer&&(e=findFirstVisible(t.$refs.footer,FOCUS_SELECTOR)),!e&&t.$refs.header&&(e=findFirstVisible(t.$refs.header,FOCUS_SELECTOR))),e||(e=t.$refs.content),e&&e.focus&&e.focus()}})},returnFocusTo:function(){var t=this.returnFocus||this.return_focus||null;t&&("string"==typeof t&&(t=document.querySelector(t)),t&&t.$el&&"function"==typeof t.$el.focus?t.$el.focus():t&&"function"==typeof t.focus&&t.focus())},enforceFocus:function(t){!this.noEnforceFocus&&this.is_visible&&document!==t.target&&this.$refs.content&&this.$refs.content!==t.target&&!this.$refs.content.contains(t.target)&&this.$refs.content.focus()},showHandler:function(t,e){t===this.id&&(this.return_focus=e||null,this.show())},hideHandler:function(t){t===this.id&&this.hide()}},created:function(){this.listenOnRoot("show::modal",this.showHandler),this.listenOnRoot("hide::modal",this.hideHandler)},mounted:function(){!0===this.visible&&this.show()},destroyed:function(){"undefined"!=typeof document&&document.removeEventListener("focusin",this.enforceFocus,!1)}},nav={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.type,{tag:"component",class:t.classObject},[t._t("default")],2)},staticRenderFns:[],computed:{classObject:function(){return{nav:!0,"navbar-nav":this.isNavBar,"nav-tabs":this.tabs,"nav-pills":this.pills,"flex-column":this.vertical,"nav-fill":this.fill,"nav-justified":this.justified}}},props:{type:{type:String,default:"ul"},fill:{type:Boolean,default:!1},justified:{type:Boolean,default:!1},tabs:{type:Boolean,default:!1},pills:{type:Boolean,default:!1},vertical:{type:Boolean,default:!1},isNavBar:{type:Boolean,default:!1}}},navItem={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("li",{staticClass:"nav-item"},[i("b-link",t._b({staticClass:"nav-link",on:{click:function(e){t.$emit("click",e)}}},"b-link",t.linkProps,!1),[t._t("default")],2)],1)},staticRenderFns:[],components:{bLink:bLink},props:props,computed:{linkProps:computed.linkProps}},navItemDropdown={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("li",{class:t.dropdownClasses,attrs:{id:t.id||null}},[i("a",{ref:"button",class:["nav-link",t.dropdownToggle,{disabled:t.disabled}],attrs:{href:"#",id:t.id?t.id+"__BV_button_":null,"aria-haspopup":"true","aria-expanded":t.visible?"true":"false",disabled:t.disabled},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.toggle(e)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.stopPropagation(),e.preventDefault(),t.toggle(e)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.stopPropagation(),e.preventDefault(),t.toggle(e)}]}},[t._t("button-content",[t._t("text",[i("span",{domProps:{innerHTML:t._s(t.text)}})])])],2),i("div",{ref:"menu",class:t.menuClasses,attrs:{role:"menu","aria-labelledby":t.id?t.id+"__BV_button_":null},on:{mouseover:t.onMouseOver,keyup:function(e){if(!("button"in e)&&t._k(e.keyCode,"esc",27))return null;t.onEsc(e)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"tab",9))return null;t.onTab(e)},function(e){if(!("button"in e)&&t._k(e.keyCode,"up",38))return null;t.focusNext(e,!0)},function(e){if(!("button"in e)&&t._k(e.keyCode,"down",40))return null;t.focusNext(e,!1)}]}},[t._t("default")],2)])},staticRenderFns:[],mixins:[dropdownMixin],computed:{dropdownToggle:function(){return this.noCaret?"":"dropdown-toggle"},dropdownClasses:function(){return["nav-item","b-nav-dropdown","dropdown",this.dropup?"dropup":"",this.visible?"show":""]},menuClasses:function(){return["dropdown-menu",this.right?"dropdown-menu-right":"",this.visible?"show":""]}},props:{noCaret:{type:Boolean,default:!1}}},navToggle={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("button",{class:t.classObject,attrs:{type:"button","aria-label":t.label,"aria-controls":t.target.id?t.target.id:t.target,"aria-expanded":t.toggleState?"true":"false"},on:{click:t.onclick}},[i("span",{staticClass:"navbar-toggler-icon"})])},staticRenderFns:[],mixins:[listenOnRootMixin],computed:{classObject:function(){return["navbar-toggler","navbar-toggler-"+this.position]}},data:function(){return{toggleState:!1}},props:{label:{type:String,default:"Toggle navigation"},position:{type:String,default:"right"},target:{required:!0}},methods:{onclick:function(){var t=this.target;t.toggle&&t.toggle(),this.$root.$emit("collapse::toggle",this.target)},handleStateEvt:function(t,e){t!==this.target&&t!==this.target.id||(this.toggleState=e)}},created:function(){this.listenOnRoot("collapse::toggle::state",this.handleStateEvt)}},navbar={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("nav",{class:t.classObject},[t._t("default")],2)},staticRenderFns:[],computed:{classObject:function(){return["navbar",this.type?"navbar-"+this.type:null,this.variant?"bg-"+this.variant:null,this.fixed?"fixed-"+this.fixed:null,this.sticky?"sticky-top":null,this.toggleable?this.toggleableClass:null]},toggleableClass:function(){var t="navbar-toggleable";return this.toggleBreakpoint&&(t+="-"+this.toggleBreakpoint),t}},props:{type:{type:String,default:"light"},variant:{type:String},toggleable:{type:Boolean,default:!1},toggleBreakpoint:{type:String,default:null},fixed:{type:String},sticky:{type:Boolean,default:!1}}},linkProps$2=assign(omitLinkProps("href","to","tag"),{href:{type:props.href.type},to:{type:props.to.type},tag:{type:String}}),navbarBrand={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)(t.componentTag,t._b({tag:"component",staticClass:"navbar-brand",on:{click:function(e){t.$emit("click",e)}}},"component",t.conditionalLinkProps,!1),[t._t("default")],2)},staticRenderFns:[],components:{bLink:bLink},props:linkProps$2,computed:{linkProps:computed.linkProps,isLink:function(){return this.to||this.href},componentTag:function(){return this.isLink?"b-link":this.tag||"div"},conditionalLinkProps:function(){return this.isLink?this.linkProps:{}}}},navText={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("span",{staticClass:"navbar-text"},[t._t("default")],2)},staticRenderFns:[],props:{}},navForm={render:function(){var t=this,e=t.$createElement;return(t._self._c||e)("b-form",{attrs:{id:t.id||null,inline:""}},[t._t("default")],2)},staticRenderFns:[],components:[bForm],props:{id:{type:String}}},range=function(t){return Array.apply(null,{length:t})},ELLIPSIS_THRESHOLD=3,pagination={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("ul",{class:["pagination",t.btnSize,t.alignment],attrs:{"aria-disabled":t.disabled?"true":"false","aria-label":t.ariaLabel?t.ariaLabel:null,role:"menubar"},on:{focusin:function(e){if(e.target!==e.currentTarget)return null;t.focusCurrent(e)},keydown:[function(e){return"button"in e||!t._k(e.keyCode,"left",37)?"button"in e&&0!==e.button?null:(e.preventDefault(),void t.focusPrev(e)):null},function(e){return"button"in e||!t._k(e.keyCode,"right",39)?"button"in e&&2!==e.button?null:(e.preventDefault(),void t.focusNext(e)):null},function(e){return("button"in e||!t._k(e.keyCode,"left",37))&&e.shiftKey?"button"in e&&0!==e.button?null:(e.preventDefault(),void t.focusFirst(e)):null},function(e){return("button"in e||!t._k(e.keyCode,"right",39))&&e.shiftKey?"button"in e&&2!==e.button?null:(e.preventDefault(),void t.focusLast(e)):null}]}},[t.hideGotoEndButtons?t._e():[t.isActive(1)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.firstText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("a",{staticClass:"page-link",attrs:{"aria-label":t.labelFirstPage,"aria-controls":t.ariaControls||null,role:"menuitem",href:"#",tabindex:"-1"},on:{click:function(e){e.preventDefault(),t.setPage(e,1)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.preventDefault(),t.setPage(e,1)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.preventDefault(),t.setPage(e,1)}]}},[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.firstText)}})])])],t.isActive(1)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.prevText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("a",{staticClass:"page-link",attrs:{"aria-label":t.labelPrevPage,"aria-controls":t.ariaControls||null,role:"menuitem",href:"#",tabindex:"-1"},on:{click:function(e){e.preventDefault(),t.setPage(e,t.currentPage-1)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.preventDefault(),t.setPage(e,t.currentPage-1)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.preventDefault(),t.setPage(e,t.currentPage-1)}]}},[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.prevText)}})])]),t.showFirstDots?i("li",{staticClass:"page-item disabled hidden-xs-down",attrs:{role:"separator"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.ellipsisText)}})]):t._e(),t._l(t.pageList,function(e){return i("li",{key:e.number,class:t.pageItemClasses(e),attrs:{role:"none presentation"}},[i("a",{class:t.pageLinkClasses(e),attrs:{disabled:t.disabled,"aria-disabled":t.disabled?"true":null,"aria-label":t.labelPage+" "+e.number,"aria-checked":t.isActive(e.number)?"true":"false","aria-controls":t.ariaControls||null,"aria-posinset":e.number,"aria-setsize":t.numberOfPages,role:"menuitemradio",href:"#",tabindex:"-1"},on:{click:function(i){i.preventDefault(),t.setPage(i,e.number)},keydown:[function(i){if(!("button"in i)&&t._k(i.keyCode,"enter",13))return null;i.preventDefault(),t.setPage(i,e.number)},function(i){if(!("button"in i)&&t._k(i.keyCode,"space",32))return null;i.preventDefault(),t.setPage(i,e.number)}]}},[t._v(t._s(e.number))])])}),t.showLastDots?i("li",{staticClass:"page-item disabled hidden-xs-down",attrs:{role:"separator"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.ellipsisText)}})]):t._e(),t.isActive(t.numberOfPages)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.nextText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("a",{staticClass:"page-link",attrs:{"aria-label":t.labelNextPage,"aria-controls":t.ariaControls||null,role:"menuitem",href:"#",tabindex:"-1"},on:{click:function(e){e.preventDefault(),t.setPage(e,t.currentPage+1)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.preventDefault(),t.setPage(e,t.currentPage+1)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.preventDefault(),t.setPage(e,t.currentPage+1)}]}},[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.nextText)}})])]),t.hideGotoEndButtons?t._e():[t.isActive(t.numberOfPages)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.lastText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("a",{staticClass:"page-link",attrs:{"aria-label":t.labelLastPage,"aria-controls":t.ariaControls||null,role:"menuitem",href:"#",tabindex:"-1"},on:{click:function(e){e.preventDefault(),t.setPage(e,t.numberOfPages)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.preventDefault(),t.setPage(e,t.numberOfPages)},function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.preventDefault(),t.setPage(e,t.numberOfPages)}]}},[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.lastText)}})])])]],2)},staticRenderFns:[],_scopeId:"data-v-2792960b",data:function(){return{showFirstDots:!1,showLastDots:!1,currentPage:this.value}},computed:{numberOfPages:function(){var t=Math.ceil(this.totalRows/this.perPage);return t<1?1:t},btnSize:function(){return this.size?"pagination-"+this.size:""},alignment:function(){return"center"===this.align?"justify-content-center":"end"===this.align||"right"===this.align?"justify-content-end":""},pageList:function(){this.currentPage>this.numberOfPages?this.currentPage=this.numberOfPages:this.currentPage<1&&(this.currentPage=1),this.showFirstDots=!1,this.showLastDots=!1;var t=this.limit,e=1;this.numberOfPages<=this.limit?t=this.numberOfPages:this.currentPage<this.limit-1&&this.limit>ELLIPSIS_THRESHOLD?this.hideEllipsis||(t=this.limit-1,this.showLastDots=!0):this.numberOfPages-this.currentPage+2<this.limit&&this.limit>ELLIPSIS_THRESHOLD?(this.hideEllipsis||(this.showFirstDots=!0,t=this.limit-1),e=this.numberOfPages-t+1):(this.limit>ELLIPSIS_THRESHOLD&&!this.hideEllipsis&&(this.showFirstDots=!0,this.showLastDots=!0,t=this.limit-2),e=this.currentPage-Math.floor(t/2)),e<1?e=1:e>this.numberOfPages-t&&(e=this.numberOfPages-t+1);var i=makePageArray(e,t);if(i.length>3){var n=this.currentPage-e;if(0===n)for(var s=3;s<i.length;s++)i[s].className="hidden-xs-down";else if(n===i.length-1)for(var r=0;r<i.length-3;r++)i[r].className="hidden-xs-down";else{for(var o=0;o<n-1;o++)i[o].className="hidden-xs-down";for(var a=i.length-1;a>n+1;a--)i[a].className="hidden-xs-down"}}return i}},methods:{isActive:function(t){return t===this.currentPage},pageItemClasses:function(t){var e=this.isActive(t.number);return["page-item",this.disabled?"disabled":"",e?"active":"",t.className]},pageLinkClasses:function(t){var e=this.isActive(t.number);return["page-link",this.disabled?"disabled":"",e?"active":""]},setPage:function(t,e){var i=this;if(this.disabled)return t.preventDefault(),void t.stopPropagation();e>this.numberOfPages?this.currentPage=this.numberOfPages:e<1?this.currentpage=1:this.currentPage=e,this.$nextTick(function(){isVisible$3(t.target)&&t.target.focus?t.target.focus():i.focusCurrent()}),this.$emit("change",this.currentPage)},getButtons:function(){return from(this.$el.querySelectorAll("a.page-link")).filter(function(t){return isVisible$3(t)})},setBtnFocus:function(t){this.$nextTick(function(){t.focus()})},focusFirst:function(){var t=this.getButtons().find(function(t){return!t.disabled});t&&t.focus&&t!==document.activeElement&&this.setBtnFocus(t)},focusLast:function(){var t=this.getButtons().reverse().find(function(t){return!t.disabled});t&&t.focus&&t!==document.activeElement&&this.setBtnFocus(t)},focusCurrent:function(){var t=this,e=this.getButtons().find(function(e){return parseInt(e.getAttribute("aria-posinset"),10)===t.currentPage});e&&e.focus?this.setBtnFocus(e):this.focusFirst()},focusPrev:function(){var t=this.getButtons(),e=t.indexOf(document.activeElement);e>0&&!t[e-1].disabled&&t[e-1].focus&&this.setBtnFocus(t[e-1])},focusNext:function(){var t=this.getButtons(),e=t.indexOf(document.activeElement);e<t.length-1&&!t[e+1].disabled&&t[e+1].focus&&this.setBtnFocus(t[e+1])}},watch:{currentPage:function(t,e){t!==e&&this.$emit("input",t)},value:function(t,e){t!==e&&(this.currentPage=t)}},props:{disabled:{type:Boolean,default:!1},value:{type:Number,default:1},limit:{type:Number,default:5},perPage:{type:Number,default:20},totalRows:{type:Number,default:20},size:{type:String,default:"md"},align:{type:String,default:"left"},hideGotoEndButtons:{type:Boolean,default:!1},ariaLabel:{type:String,default:"Pagination"},labelFirstPage:{type:String,default:"Goto first page"},firstText:{type:String,default:"&laquo;"},labelPrevPage:{type:String,default:"Goto previous page"},prevText:{type:String,default:"&lsaquo;"},labelNextPage:{type:String,default:"Goto next page"},nextText:{type:String,default:"&rsaquo;"},labelLastPage:{type:String,default:"Goto last page"},lastText:{type:String,default:"&raquo;"},labelPage:{type:String,default:"Goto page"},hideEllipsis:{type:Boolean,default:!1},ellipsisText:{type:String,default:"&hellip;"},ariaControls:{type:String,default:null}}},ELLIPSIS_THRESHOLD$1=3,routerProps=pickLinkProps("activeClass","exactActiveClass","append","exact","replace","target","rel"),props$1=assign({numberOfPages:{type:Number,default:1},baseUrl:{type:String,default:"/"},useRouter:{type:Boolean,default:!1},linkGen:{type:Function,default:null},pageGen:{type:Function,default:null}},{disabled:{type:Boolean,default:!1},value:{type:Number,default:1},limit:{type:Number,default:5},size:{type:String,default:"md"},align:{type:String,default:"left"},hideGotoEndButtons:{type:Boolean,default:!1},ariaLabel:{type:String,default:"Pagination"},labelFirstPage:{type:String,default:"Goto first page"},firstText:{type:String,default:"&laquo;"},labelPrevPage:{type:String,default:"Goto previous page"},prevText:{type:String,default:"&lsaquo;"},labelNextPage:{type:String,default:"Goto next page"},nextText:{type:String,default:"&rsaquo;"},labelLastPage:{type:String,default:"Goto last page"},lastText:{type:String,default:"&raquo;"},labelPage:{type:String,default:"Goto page"},hideEllipsis:{type:Boolean,default:!1},ellipsisText:{type:String,default:"&hellip;"}},routerProps),paginationNav={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("nav",[i("ul",{class:["pagination",t.btnSize,t.alignment],attrs:{"aria-disabled":t.disabled?"true":"false","aria-label":t.ariaLabel?t.ariaLabel:null,role:"menubar"},on:{focusin:function(e){if(e.target!==e.currentTarget)return null;t.focusCurrent(e)},keydown:[function(e){return"button"in e||!t._k(e.keyCode,"left",37)?"button"in e&&0!==e.button?null:(e.preventDefault(),void t.focusPrev(e)):null},function(e){return"button"in e||!t._k(e.keyCode,"right",39)?"button"in e&&2!==e.button?null:(e.preventDefault(),void t.focusNext(e)):null},function(e){return("button"in e||!t._k(e.keyCode,"left",37))&&e.shiftKey?"button"in e&&0!==e.button?null:(e.preventDefault(),void t.focusFirst(e)):null},function(e){return("button"in e||!t._k(e.keyCode,"right",39))&&e.shiftKey?"button"in e&&2!==e.button?null:(e.preventDefault(),void t.focusLast(e)):null}]}},[t.hideGotoEndButtons?t._e():[t.isActive(1)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.firstText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("b-link",t._b({staticClass:"page-link",attrs:{"aria-label":t.labelFirstPage,role:"menuitem",tabindex:"-1"},on:{click:function(e){t.onClick(1)}}},"b-link",t.linkProps(1),!1),[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.firstText)}})])],1)],t.isActive(1)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.prevText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("b-link",t._b({staticClass:"page-link",attrs:{"aria-label":t.labelPrevPage,role:"menuitem",tabindex:"-1"},on:{click:function(e){t.onClick(t.currentPage-1)}}},"b-link",t.linkProps(t.currentPage-1),!1),[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.prevText)}})])],1),t.showFirstDots?i("li",{staticClass:"page-item disabled hidden-xs-down",attrs:{role:"separator"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.ellipsisText)}})]):t._e(),t._l(t.pageList,function(e){return i("li",{key:e.number,class:t.pageItemClasses(e),attrs:{role:"none presentation"}},[t.disabled?i("span",{staticClass:"page-link"},[t._v(t._s(e.number))]):i("b-link",t._b({class:t.pageLinkClasses(e),attrs:{disabled:t.disabled,"aria-disabled":t.disabled?"true":null,"aria-label":t.labelPage+" "+e.number,"aria-checked":t.isActive(e.number)?"true":"false","aria-posinset":e.number,"aria-setsize":t.numberOfPages,role:"menuitemradio",tabindex:"-1"},on:{click:function(i){t.onClick(e.number)}}},"b-link",t.linkProps(e.number),!1),[t._v(t._s(t.makePage(e.number)))])],1)}),t.showLastDots?i("li",{staticClass:"page-item disabled hidden-xs-down",attrs:{role:"separator"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.ellipsisText)}})]):t._e(),t.isActive(t.numberOfPages)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.nextText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("b-link",t._b({staticClass:"page-link",attrs:{"aria-label":t.labelNextPage,role:"menuitem",tabindex:"-1"},on:{click:function(e){t.onClick(t.currentPage+1)}}},"b-link",t.linkProps(t.currentPage+1),!1),[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.nextText)}})])],1),t.hideGotoEndButtons?t._e():[t.isActive(t.numberOfPages)||t.disabled?i("li",{staticClass:"page-item disabled",attrs:{role:"none presentation","aria-hidden":"true"}},[i("span",{staticClass:"page-link",domProps:{innerHTML:t._s(t.lastText)}})]):i("li",{staticClass:"page-item",attrs:{role:"none presentation"}},[i("b-link",t._b({staticClass:"page-link",attrs:{"aria-label":t.labelLastPage,role:"menuitem"},on:{click:function(e){t.onClick(t.numberOfPages)}}},"b-link",t.linkProps(t.numberOfPages),!1),[i("span",{attrs:{"aria-hidden":"true"},domProps:{innerHTML:t._s(t.lastText)}})])],1)]],2)])},staticRenderFns:[],_scopeId:"data-v-20c4e761",components:{bLink:bLink},data:function(){return{showFirstDots:!1,showLastDots:!1,currentPage:this.value}},props:props$1,watch:{currentPage:function(t,e){t!==e&&this.$emit("input",t)},value:function(t,e){t!==e&&(this.currentPage=t)}},computed:{btnSize:function(){return this.size?"pagination-"+this.size:""},alignment:function(){return"center"===this.align?"justify-content-center":"end"===this.align||"right"===this.align?"justify-content-end":""},pageList:function(){this.currentPage>this.numberOfPages?this.currentPage=this.numberOfPages:this.currentPage<1&&(this.currentPage=1),this.showFirstDots=!1,this.showLastDots=!1;var t=this.limit,e=1;this.numberOfPages<=this.limit?t=this.numberOfPages:this.currentPage<this.limit-1&&this.limit>ELLIPSIS_THRESHOLD$1?this.hideEllipsis||(t=this.limit-1,this.showLastDots=!0):this.numberOfPages-this.currentPage+2<this.limit&&this.limit>ELLIPSIS_THRESHOLD$1?(this.hideEllipsis||(this.showFirstDots=!0,t=this.limit-1),e=this.numberOfPages-t+1):(this.limit>ELLIPSIS_THRESHOLD$1&&!this.hideEllipsis&&(this.showFirstDots=!0,this.showLastDots=!0,t=this.limit-2),e=this.currentPage-Math.floor(t/2)),e<1?e=1:e>this.numberOfPages-t&&(e=this.numberOfPages-t+1);var i=makePageArray$1(e,t);if(i.length>3){var n=this.currentPage-e;if(0===n)for(var s=3;s<i.length;s++)i[s].className="hidden-xs-down";else if(n===i.length-1)for(var r=0;r<i.length-3;r++)i[r].className="hidden-xs-down";else{for(var o=0;o<n-1;o++)i[o].className="hidden-xs-down";for(var a=i.length-1;a>n+1;a--)i[a].className="hidden-xs-down"}}return i}},methods:{onClick:function(t){this.currentPage=t},makeLink:function(t){if(this.linkGen&&"function"==typeof this.linkGen)return this.linkGen(t);var e=""+this.baseUrl+t;return this.useRouter?{path:e}:e},makePage:function(t){return this.pageGen&&"function"==typeof this.pageGen?this.pageGen(t):t},linkProps:function(t){var e=this.makeLink(t),i={href:"string"==typeof e?e:null,target:this.target||null,rel:this.rel||null,disabled:this.disabled};return(this.useRouter||"object"==typeof e)&&(i=assign(i,{to:e,exact:this.exact,activeClass:this.activeClass,exactActiveClass:this.exactActiveClass,append:this.append,replace:this.replace})),i},isActive:function(t){return t===this.currentPage},pageItemClasses:function(t){var e=this.isActive(t.number);return["page-item",this.disabled?"disabled":"",e?"active":"",t.className]},pageLinkClasses:function(t){var e=this.isActive(t.number);return["page-link",this.disabled?"disabled":"",e?"active":""]},getButtons:function(){return from(this.$el.querySelectorAll("a.page-link")).filter(function(t){return isVisible$4(t)})},setBtnFocus:function(t){this.$nextTick(function(){t.focus()})},focusFirst:function(){var t=this.getButtons().find(function(t){return!t.disabled});t&&t.focus&&t!==document.activeElement&&this.setBtnFocus(t)},focusLast:function(){var t=this.getButtons().reverse().find(function(t){return!t.disabled});t&&t.focus&&t!==document.activeElement&&this.setBtnFocus(t)},focusCurrent:function(){var t=this,e=this.getButtons().find(function(e){return parseInt(e.getAttribute("aria-posinset"),10)===t.currentPage});e&&e.focus?this.setBtnFocus(e):this.focusFirst()},focusPrev:function(){var t=this.getButtons(),e=t.indexOf(document.activeElement);e>0&&!t[e-1].disabled&&t[e-1].focus&&this.setBtnFocus(t[e-1])},focusNext:function(){var t=this.getButtons(),e=t.indexOf(document.activeElement);e<t.length-1&&!t[e+1].disabled&&t[e+1].focus&&this.setBtnFocus(t[e+1])}}},popover={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("span",{ref:"trigger"},[t._t("default")],2),i("div",{ref:"popover",class:["popover","fade",t.classState?"show":"",t.popoverAlignment],style:t.popoverStyle,attrs:{tabindex:"-1"},on:{focus:function(e){t.$emit("focus")},blur:function(e){t.$emit("blur")}}},[i("div",{staticClass:"popover-arrow"}),t.title?i(t.titletag,{tag:"h3",staticClass:"popover-title",domProps:{innerHTML:t._s(t.title)}}):t._e(),i("div",{staticClass:"popover-content"},[i("div",{staticClass:"popover-content-wrapper"},[t._t("content",[i("span",{domProps:{innerHTML:t._s(t.content)}})])],2)])])])},staticRenderFns:[],mixins:[popoverMixin],props:{title:{type:String,default:""},titleTag:{type:String,default:"h3"},content:{type:String,default:""},popoverStyle:{type:Object,default:null}}},progress={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"progress"},[i("transition",[i("div",{class:t.classObject,style:t.styleObject,attrs:{role:"progressbar","aria-valuenow":t.value,"aria-valuemin":0,"aria-valuemax":t.max}},[t._t("default",[t.showProgress?[t._v(t._s(t.progress)+"%")]:t.showValue?[t._v(t._s(t.value))]:t._e()])],2)])],1)},staticRenderFns:[],computed:{classObject:function(){return["progress-bar",this.progressVariant,this.striped||this.animated?"progress-bar-striped":"",this.animated?"progress-bar-animated":""]},styleObject:function(){return{width:this.progress+"%"}},progressVariant:function(){return this.variant?"bg-"+this.variant:null},progress:function(){var t=Math.pow(10,this.precision);return Math.round(100*t*this.value/this.max)/t}},props:{striped:{type:Boolean,default:!1},animated:{type:Boolean,default:!1},precision:{type:Number,default:0},value:{type:Number,default:0},max:{type:Number,default:100},variant:{type:String,default:null},showProgress:{type:Boolean,default:!1},showValue:{type:Boolean,default:!1}}},toString=function(t){return t?t instanceof Object?keys(t).map(function(e){return toString(t[e])}).join(" "):String(t):""},recToString=function(t){return t instanceof Object?toString(keys(t).reduce(function(e,i){return/^_/.test(i)||"state"===i||(e[i]=t[i]),e},{})):""},defaultSortCompare=function(t,e,i){return"number"==typeof t[i]&&"number"==typeof e[i]?t[i]<e[i]&&-1||t[i]>e[i]&&1||0:toString(t[i]).localeCompare(toString(e[i]),void 0,{numeric:!0})},table={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("table",{class:t.tableClass,attrs:{id:t.id||null,"aria-busy":t.computedBusy?"true":"false"}},[i("thead",{class:t.headClass},[i("tr",t._l(t.fields,function(e,n){return i("th",{key:n,class:t.fieldClass(e,n),style:e.thStyle||{},attrs:{"aria-label":e.sortable?t.localSortDesc&&t.localSortBy===n?t.labelSortAsc:t.labelSortDesc:null,"aria-sort":e.sortable&&t.localSortBy===n?t.localSortDesc?"descending":"ascending":null,tabindex:e.sortable?"0":null},on:{click:function(i){i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)},keydown:[function(i){if(!("button"in i)&&t._k(i.keyCode,"enter",13))return null;i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)},function(i){if(!("button"in i)&&t._k(i.keyCode,"space",32))return null;i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)}]}},[t._t("HEAD_"+n,[i("div",{domProps:{innerHTML:t._s(e.label)}})],{label:e.label,column:n,field:e})],2)}))]),t.footClone?i("tfoot",{class:t.footClass},[i("tr",t._l(t.fields,function(e,n){return i("th",{key:n,class:t.fieldClass(e,n),style:e.thStyle||{},attrs:{"aria-label":e.sortable?t.localSortDesc&&t.localSortBy===n?t.labelSortAsc:t.labelSortDesc:null,"aria-sort":e.sortable&&t.localSortBy===n?t.localSortDesc?"descending":"ascending":null,tabindex:e.sortable?"0":null},on:{click:function(i){i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)},keydown:[function(i){if(!("button"in i)&&t._k(i.keyCode,"enter",13))return null;i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)},function(i){if(!("button"in i)&&t._k(i.keyCode,"space",32))return null;i.stopPropagation(),i.preventDefault(),t.headClicked(i,e,n)}]}},[t.$scopedSlots["FOOT_"+n]?t._t("FOOT_"+n,[i("div",{domProps:{innerHTML:t._s(e.label)}})],{label:e.label,column:n,field:e}):t._t("HEAD_"+n,[i("div",{domProps:{innerHTML:t._s(e.label)}})],{label:e.label,column:n,field:e})],2)}))]):t._e(),i("tbody",[t._l(t._items,function(e,n){return i("tr",{key:n,class:t.rowClass(e),on:{click:function(i){t.rowClicked(i,e,n)},dblclick:function(i){t.rowDblClicked(i,e,n)},mouseenter:function(i){t.rowHovered(i,e,n)}}},[t._l(t.fields,function(s,r){return[t.hasFormatter(s)?i("td",{key:r,class:t.tdClass(s,e,r),domProps:{innerHTML:t._s(t.callFormatter(e,r,s))}}):i("td",{key:r,class:t.tdClass(s,e,r)},[t._t(r,[t._v(t._s(e[r]))],{value:e[r],item:e,index:n})],2)]})],2)}),!t.showEmpty||t._items&&0!==t._items.length?t._e():i("tr",[i("td",{attrs:{colspan:t.keys(t.fields).length}},[t.filter?i("div",{attrs:{role:"alert","aria-live":"polite"}},[t._t("emptyfiltered",[i("div",{staticClass:"text-center my-2",domProps:{innerHTML:t._s(t.emptyFilteredText)}})])],2):i("div",{attrs:{role:"alert","aria-live":"polite"}},[t._t("empty",[i("div",{staticClass:"text-center my-2",domProps:{innerHTML:t._s(t.emptyText)}})])],2)])])],2)])},staticRenderFns:[],mixins:[listenOnRootMixin],data:function(){return{localSortBy:this.sortBy||"",localSortDesc:this.sortDesc||!1,localItems:[],filteredItems:[],localBusy:this.busy}},props:{id:{type:String,default:""},items:{type:[Array,Function],default:function(){return this&&this.itemsProvider?(warn("b-table: prop 'items-provider' has been deprecated. Pass a function to 'items' instead"),this.itemsProvider):[]}},sortBy:{type:String,default:null},sortDesc:{type:Boolean,default:!1},apiUrl:{type:String,default:""},fields:{type:Object,default:{}},striped:{type:Boolean,default:!1},bordered:{type:Boolean,default:!1},inverse:{type:Boolean,default:!1},hover:{type:Boolean,default:!1},small:{type:Boolean,default:!1},responsive:{type:Boolean,default:!1},headVariant:{type:String,default:""},footVariant:{type:String,default:""},perPage:{type:Number,default:null},currentPage:{type:Number,default:1},filter:{type:[String,RegExp,Function],default:null},sortCompare:{type:Function,default:null},itemsProvider:{type:Function,default:null},noProviderPaging:{type:Boolean,default:!1},noProviderSorting:{type:Boolean,default:!1},noProviderFiltering:{type:Boolean,default:!1},busy:{type:Boolean,default:!1},value:{type:Array,default:function(){return[]}},footClone:{type:Boolean,default:!1},labelSortAsc:{type:String,default:"Click to sort Ascending"},labelSortDesc:{type:String,default:"Click to sort Descending"},showEmpty:{type:Boolean,default:!1},emptyText:{type:String,default:"There are no records to show"},emptyFilteredText:{type:String,default:"There are no records matching your request"}},watch:{items:function(t,e){e!==t&&this._providerUpdate()},filteredItems:function(t,e){this.providerFiltering||t.length===e.length||this.$emit("filtered",t)},sortDesc:function(t,e){t!==this.localSortDesc&&(this.localSortDesc=t||!1)},localSortDesc:function(t,e){t!==e&&(this.$emit("update:sortDesc",t),this.noProviderSorting||this._providerUpdate())},sortBy:function(t,e){t!==this.localSortBy&&(this.localSortBy=t||null)},localSortBy:function(t,e){t!==e&&(this.$emit("update:sortBy",t),this.noProviderSorting||this._providerUpdate())},perPage:function(t,e){e===t||this.noProviderPaging||this._providerUpdate()},currentPage:function(t,e){e===t||this.noProviderPaging||this._providerUpdate()},filter:function(t,e){e===t||this.noProviderFiltering||this._providerUpdate()},localBusy:function(t,e){t!==e&&this.$emit("update:busy",t)}},mounted:function(){var t=this;this.localSortBy=this.sortBy,this.localSortDesc=this.sortDesc,this.localBusy=this.busy,this.hasProvider&&this._providerUpdate(),this.listenOnRoot("table::refresh",function(e){e===t.id&&t._providerUpdate()})},computed:{tableClass:function(){return["table","b-table",this.striped?"table-striped":"",this.hover?"table-hover":"",this.inverse?"table-inverse":"",this.bordered?"table-bordered":"",this.responsive?"table-responsive":"",this.small?"table-sm":""]},headClass:function(){return this.headVariant?"thead-"+this.headVariant:""},footClass:function(){var t=this.footVariant||this.headVariant||null;return t?"thead-"+t:""},hasProvider:function(){return this.items instanceof Function},providerFiltering:function(){return Boolean(this.hasProvider&&!this.noProviderFiltering)},providerSorting:function(){return Boolean(this.hasProvider&&!this.noProviderSorting)},providerPaging:function(){return Boolean(this.hasProvider&&!this.noProviderPaging)},context:function(){return{perPage:this.perPage,currentPage:this.currentPage,filter:this.filter,apiUrl:this.apiUrl,sortBy:this.localSortBy,sortDesc:this.localSortDesc}},_items:function(){var t=this.perPage,e=this.currentPage,i=this.filter,n=this.localSortBy,s=this.localSortDesc,r=this.sortCompare||defaultSortCompare,o=this.hasProvider?this.localItems:this.items;if(!o)return this.$nextTick(this._providerUpdate),[];if(o=o.slice(),i&&!this.providerFiltering)if(i instanceof Function)o=o.filter(i);else{var a;a=i instanceof RegExp?i:new RegExp(".*"+i+".*","ig"),o=o.filter(function(t){var e=a.test(recToString(t));return a.lastIndex=0,e})}return this.providerFiltering||(this.filteredItems=o.slice()),n&&!this.providerSorting&&(o=o.sort(function(t,e){var i=r(t,e,n);return s?-1*i:i})),t&&!this.providerPaging&&(o=o.slice((e-1)*t,e*t)),this.$emit("input",o),o},computedBusy:function(){return this.busy||this.localBusy}},methods:{keys:keys,fieldClass:function(t,e){return[t.sortable?"sorting":"",t.sortable&&this.localSortBy===e?"sorting_"+(this.localSortDesc?"desc":"asc"):"",t.variant?"table-"+t.variant:"",t.class?t.class:"",t.thClass?t.thClass:""]},tdClass:function(t,e,i){var n="";return e._cellVariants&&e._cellVariants[i]&&(n=(this.inverse?"bg-":"table-")+e._cellVariants[i]),[t.variant&&!n?(this.inverse?"bg-":"table-")+t.variant:"",n,t.class?t.class:"",t.tdClass?t.tdClass:""]},rowClass:function(t){var e=t._rowVariant||t.state||null;return[e?(this.inverse?"bg-":"table-")+e:""]},rowClicked:function(t,e,i){if(this.computedBusy)return t.preventDefault(),void t.stopPropagation();this.$emit("row-clicked",e,i,t)},rowDblClicked:function(t,e,i){if(this.computedBusy)return t.preventDefault(),void t.stopPropagation();this.$emit("row-dblclicked",e,i,t)},rowHovered:function(t,e,i){if(this.computedBusy)return t.preventDefault(),void t.stopPropagation();this.$emit("row-hovered",e,i,t)},headClicked:function(t,e,i){if(this.computedBusy)return t.preventDefault(),void t.stopPropagation();var n=!1;e.sortable?(i===this.localSortBy?this.localSortDesc=!this.localSortDesc:(this.localSortBy=i,this.localSortDesc=!1),n=!0):this.localSortBy&&(this.localSortBy=null,this.localSortDesc=!1,n=!0),this.$emit("head-clicked",i,e,t),n&&this.$emit("sort-changed",this.context)},refresh:function(){this.hasProvider&&this._providerUpdate()},_providerSetLocal:function(t){this.localItems=t&&t.length>0?t.slice():[],this.localBusy=!1,this.$emit("refreshed"),this.emitOnRoot("table::refreshed",this.id)},_providerUpdate:function(){var t=this;if(!this.computedBusy&&this.hasProvider){this.localBusy=!0;var e=this.items(this.context,this._providerSetLocal);e&&(e.then&&"function"==typeof e.then?e.then(function(e){t._providerSetLocal(e)}):this._providerSetLocal(e))}},hasFormatter:function(t){return t.formatter&&("function"==typeof t.formatter||"string"==typeof t.formatter)},callFormatter:function(t,e,i){return i.formatter&&"function"==typeof i.formatter?i.formatter(t[e]):i.formatter&&"function"==typeof this.$parent[i.formatter]?this.$parent[i.formatter](t[e]):void 0}}},tabs={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i(t.tag,{tag:"component",staticClass:"tabs",attrs:{id:t.id||null}},[t.bottom?i("div",{ref:"tabsContainer",class:["tab-content",{"card-block":t.card}]},[t._t("default"),t.tabs&&t.tabs.length?t._e():t._t("empty")],2):t._e(),i("div",{class:{"card-header":t.card}},[i("ul",{class:["nav","nav-"+t.navStyle,t.card?"card-header-"+t.navStyle:null],attrs:{role:"tablist",tabindex:"0","aria-setsize":t.tabs.length,"aria-posinset":t.currentTab+1},on:{keydown:[function(e){return"button"in e||!t._k(e.keyCode,"left",37)?"button"in e&&0!==e.button?null:void t.previousTab(e):null},function(e){if(!("button"in e)&&t._k(e.keyCode,"up",38))return null;t.previousTab(e)},function(e){return"button"in e||!t._k(e.keyCode,"right",39)?"button"in e&&2!==e.button?null:void t.nextTab(e):null},function(e){if(!("button"in e)&&t._k(e.keyCode,"down",40))return null;t.nextTab(e)},function(e){return("button"in e||!t._k(e.keyCode,"left",37))&&e.shiftKey?"button"in e&&0!==e.button?null:void t.setTab(-1,!1,1):null},function(e){return("button"in e||!t._k(e.keyCode,"up",38))&&e.shiftKey?void t.setTab(-1,!1,1):null},function(e){return("button"in e||!t._k(e.keyCode,"right",39))&&e.shiftKey?"button"in e&&2!==e.button?null:void t.setTab(t.tabs.length,!1,-1):null},function(e){return("button"in e||!t._k(e.keyCode,"down",40))&&e.shiftKey?void t.setTab(t.tabs.length,!1,-1):null}]}},[t._l(t.tabs,function(e,n){return i("li",{staticClass:"nav-item",attrs:{role:"presentation"}},[e.headHtml?i("div",{class:["tab-head",{small:t.small,active:e.localActive,disabled:e.disabled}],attrs:{role:"heading",tabindex:"-1"},domProps:{innerHTML:t._s(e.headHtml)}}):i("a",{class:["nav-link",{small:t.small,active:e.localActive,disabled:e.disabled}],attrs:{href:e.href,role:"tab","aria-selected":e.localActive?"true":"false","aria-controls":e.id||null,id:e.controlledBy||null,tabindex:"-1"},domProps:{innerHTML:t._s(e.title)},on:{click:function(e){e.preventDefault(),e.stopPropagation(),t.setTab(n)},keydown:[function(e){if(!("button"in e)&&t._k(e.keyCode,"space",32))return null;e.preventDefault(),e.stopPropagation(),t.setTab(n)},function(e){if(!("button"in e)&&t._k(e.keyCode,"enter",13))return null;e.preventDefault(),e.stopPropagation(),t.setTab(n)}]}})])}),t._t("tabs")],2)]),t.bottom?t._e():i("div",{ref:"tabsContainer",class:["tab-content",{"card-block":t.card}]},[t._t("default"),t.tabs&&t.tabs.length?t._e():t._t("empty")],2)])},staticRenderFns:[],data:function(){return{currentTab:this.value,tabs:[]}},props:{id:{type:String,default:""},tag:{type:String,default:"div"},noFade:{type:Boolean,default:!1},card:{type:Boolean,default:!1},small:{type:Boolean,default:!1},value:{type:Number,default:null},pills:{type:Boolean,default:!1},lazy:{type:Boolean,default:!1},bottom:{type:Boolean,default:!1}},watch:{currentTab:function(t,e){t!==e&&(this.$root.$emit("changed::tab",this,t,this.tabs[t]),this.$emit("input",t),this.tabs[t].$emit("click"))},value:function(t,e){t!==e&&this.setTab(t)},fade:function(t,e){var i=this;t!==e&&this.tabs.forEach(function(e){i.$set(e,"fade",t)})}},computed:{fade:function(){return!this.noFade},navStyle:function(){return this.pills?"pills":"tabs"}},methods:{sign:function(t){return 0===t?0:t>0?1:-1},nextTab:function(){this.setTab(this.currentTab,!1,1)},previousTab:function(){this.setTab(this.currentTab,!1,-1)},setTab:function(t,e,i){var n=this;if(i=i||0,e||t+i!==this.currentTab){var s=this.tabs[t+i];s&&(s.disabled?i&&this.setTab(t,e,i+this.sign(i)):(this.tabs.forEach(function(t){t===s?n.$set(t,"localActive",!0):n.$set(t,"localActive",!1)}),this.currentTab=t+i))}},updateTabs:function(){var t=this;this.$slots.default?this.tabs=this.$slots.default.filter(function(t){return t.componentInstance||!1}).map(function(t){return t.componentInstance}):this.tabs=[],this.tabs.forEach(function(e){t.$set(e,"fade",t.fade),t.$set(e,"lazy",t.lazy)});var e=this.currentTab;null!==e&&void 0!==e||(e=null),null===e&&this.tabs.forEach(function(t,i){t.active&&!t.disabled&&(e=i)}),null===e&&this.tabs.forEach(function(t,i){t.disabled||null!==e||(e=i)});var i=0;e>=this.tabs.length&&(i=-1),this.setTab(e||0,!0,i)}},mounted:function(){this.updateTabs(),observeDOM(this.$refs.tabsContainer,this.updateTabs.bind(this),{subtree:!1})}},tab={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("transition",{attrs:{mode:"out-in"},on:{"before-enter":t.beforeEnter,"after-enter":t.afterEnter,"after-leave":t.afterLeave}},[t.localActive||!t.lazy?i(t.tag,{directives:[{name:"show",rawName:"v-show",value:t.localActive,expression:"localActive"}],ref:"panel",tag:"component",class:["tab-pane",{show:t.show,fade:t.fade,disabled:t.disabled,active:t.localActive}],attrs:{id:t.id||null,role:"tabpanel","aria-hidden":t.localActive?"false":"true","aria-expanded":t.localActive?"true":"false","aria-lablelledby":t.controlledBy||null,css:!1}},[t._t("default")],2):t._e()],1)},staticRenderFns:[],methods:{beforeEnter:function(){this.show=!1},afterEnter:function(){this.show=!0},afterLeave:function(){this.show=!1}},data:function(){return{fade:!1,localActive:this.active,lazy:!0,show:!1}},computed:{controlledBy:function(){return this.buttonId||(this.id?this.id+"__BV_tab_button__":null)}},props:{id:{type:String,default:""},tag:{type:String,default:"div"},buttonId:{type:String,default:""},title:{type:String,default:""},headHtml:{type:String,default:null},disabled:{type:Boolean,default:!1},active:{type:Boolean,default:!1},href:{type:String,default:"#"}}},tooltip={render:function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"d-inline-block"},[i("span",{ref:"trigger",staticClass:"d-inline-block"},[t._t("default")],2),i("div",{ref:"popover",class:["tooltip","tooltip-"+this.placement],style:{opacity:t.showState?1:0},attrs:{tabindex:"-1"},on:{focus:function(e){t.$emit("focus")},blur:function(e){t.$emit("blur")}}},[i("div",{staticClass:"tooltip-inner"},[t._t("content",[i("span",{domProps:{innerHTML:t._s(t.content)}})])],2)])])},staticRenderFns:[],mixins:[popoverMixin],props:{content:{type:String,default:""},triggers:{type:[Boolean,String,Array],default:"hover"}}},components=Object.freeze({bAlert:alert,bBreadcrumb:breadcrumb,bButton:bBtn,bBtn:bBtn,bButtonToolbar:buttonToolbar,bBtnToolbar:buttonToolbar,bButtonGroup:buttonGroup,bBtnGroup:buttonGroup,bInputGroup:inputGroup,bInputGroupAddon:inputGroupAddon,bInputGroupButton:inputGroupButton,bInputGroupBtn:inputGroupButton,bCard:card,bCardGroup:cardGroup,bDropdown:dropdown,bDropdownItem:dropdownItem,bDropdownItemButton:dropdownItemButton,bDropdownItemBtn:dropdownItemButton,bDropdownDivider:dropdownDivider,bDropdownHeader:dropdownHeader,bDropdownSelect:dropdownSelect,bForm:bForm,bFormCheckbox:formCheckbox,bFormFieldset:formFieldset,bFormGroup:formFieldset,bFormFile:formFile,bFormRadio:formRadio,bFormInput:formInput,bFormInputStatic:bFormInputStatic,bFormSelect:formSelect,bJumbotron:jumbotron,bBadge:badge,bMedia:media,bModal:modal,bNavbar:navbar,bNavbarBrand:navbarBrand,bNavText:navText,bNavForm:navForm,bPagination:pagination,bPaginationNav:paginationNav,bPopover:popover,bProgress:progress,bTable:table,bTooltip:tooltip,bTab:tab,bTabs:tabs,bNav:nav,bNavItem:navItem,bNavItemDropdown:navItemDropdown,bNavToggle:navToggle,bListGroupItem:listGroupItem,bListGroup:listGroup,bCarouselSlide:carouselSlide,bCarousel:carousel,bCollapse:collapse,bLink:bLink}),all_listen_types={hover:!0,click:!0,focus:!0},inBrowser="undefined"!=typeof window,listen_types={click:!0},BVT="__BV_toggle__",EVENT_TOGGLE="collapse::toggle",EVENT_STATE="collapse::toggle::state",toggle={bind:function(t,e,i){var n=targets(i,e,listen_types,function(t){var e=t.targets,i=t.vnode;e.forEach(function(t){i.context.$root.$emit(EVENT_TOGGLE,t)})});inBrowser&&i.context&&n.length>0&&(t.setAttribute("aria-controls",n.join(" ")),t.setAttribute("aria-expanded","false"),t[BVT]=function(e,i){-1!==n.indexOf(e)&&(t.setAttribute("aria-expanded",i?"true":"false"),i?t.classList.remove("collapsed"):t.classList.add("collapsed"))},i.context.$root.$on(EVENT_STATE,t[BVT]))},unbind:function(t,e,i){t[BVT]&&(i.context.$root.$off(EVENT_STATE,t[BVT]),t[BVT]=null)}},listen_types$1={click:!0},modal$1={bind:function(t,e,i){targets(i,e,listen_types$1,function(t){var e=t.targets,i=t.vnode;e.forEach(function(t){i.context.$root.$emit("show::modal",t,i.elm)})})}},inBrowser$1="undefined"!=typeof window,isServer=!inBrowser$1;inBrowser$1&&window.Element&&!Element.prototype.closest&&(Element.prototype.closest=function(t){var e,i=(this.document||this.ownerDocument).querySelectorAll(t),n=this;do{for(e=i.length;--e>=0&&i.item(e)!==n;);}while(e<0&&(n=n.parentElement));return n});var NAME="v-b-scrollspy",EVENT="scrollspy::activate",BVSS="__BV_ScrollSpy__",Default={element:"body",offset:10,method:"auto",throttle:100},DefaultType={element:"(string|element)",offset:"number",method:"string",throttle:"number"},ClassName={DROPDOWN_ITEM:"dropdown-item",DROPDOWN_MENU:"dropdown-menu",DROPDOWN_TOGGLE:"dropdown-toggle",NAV_LINK:"nav-link",LIST_ITEM:"list-group-item",ACTIVE:"active"},Selector={ACTIVE:".active",NAV_LIST_GROUP:".nav, .list-group",NAV:".nav",LIST_GROUP:".list-group",NAV_LINKS:".nav-link",LIST_ITEMS:".list-group-item",DROPDOWN:".dropdown",DROPDOWN_ITEMS:".dropdown-item",DROPDOWN_TOGGLE:".dropdown-toggle"},OffsetMethod={OFFSET:"offset",POSITION:"position"};ScrollSpy.prototype.updateConfig=function(t){var e=this;t.arg&&(this._config.element="#"+t.arg),keys(t.modifiers).forEach(function(t){/^\d+$/.test(t)?e._config.offset=parseInt(t,10):/^(auto|position|offset)$/.test(t)&&(e._config.method=t)}),"string"==typeof t.value?this._config.element=t.value:"number"==typeof t.value?this._config.offset=Math.round(t.value):"object"==typeof t.value&&keys(t.value).filter(function(t){return Boolean(DefaultType[t])}).forEach(function(i){e._config[i]=t.value[i]}),typeCheckConfig(NAME,this._config,DefaultType);var i=getVm(this._$el);return i&&i.$root&&(this._$root=i.$root),this},ScrollSpy.prototype.listen=function(){var t=this._getScroller();return t&&("BODY"!==t.tagName&&t.addEventListener("scroll",this,!1),window.addEventListener("scroll",this,!1),window.addEventListener("orientationchange",this,!1),window.addEventListener("resize",this,!1)),this},ScrollSpy.prototype.unListen=function(){var t=this._getScroller();return t&&("BODY"!==t.tagName&&t.removeEventListener("scroll",this,!1),window.removeEventListener("scroll",this,!1),window.removeEventListener("orientationchange",this,!1),window.removeEventListener("resize",this,!1)),this},ScrollSpy.prototype.refresh=function(){var t=this,e=this._getScroller();if(!e)return this;var i="BODY"===e.tagName?OffsetMethod.OFFSET:OffsetMethod.POSITION,n="auto"===this._config.method?i:this._config.method,s=n===OffsetMethod.OFFSET?0:this._getScrollTop();return this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),$QSA(this._selector,this._$el).map(function(t){var i=t.getAttribute("href");if(i&&"#"===i.charAt(0)&&"#"!==i&&-1===i.indexOf("#/")){var r=$QS(i,e);if(!r)return null;var o=r.getBoundingClientRect();if(o.width||o.height)return{offset:(n===OffsetMethod.OFFSET?o.top:r.offsetTop)+s,href:i}}return null}).filter(function(t){return t}).sort(function(t,e){return t.offset-e.offset}).forEach(function(e){t._offsets.push(e.offset),t._targets.push(e.href)}),this},ScrollSpy.prototype.process=function(){var t=this;if(!this._getScroller)return this;var e=this._getScrollTop()+this._config.offset,i=this._getScrollHeight(),n=this._config.offset+i-this._getOffsetHeight();if(this._scrollHeight!==i&&this.refresh(),e>=n){var s=this._targets[this._targets.length-1];return this._activeTarget!==s&&this._activate(s),this}if(this._activeTarget&&e<this._offsets[0]&&this._offsets[0]>0)return this._activeTarget=null,this._clear(),this;for(var r=this._offsets.length;r--;)t._activeTarget!==t._targets[r]&&e>=t._offsets[r]&&(void 0===t._offsets[r+1]||e<t._offsets[r+1])&&t._activate(t._targets[r]);return this},ScrollSpy.prototype.scheduleRefresh=function(){return this.handleEvent({type:"resize"}),this},ScrollSpy.prototype.dispose=function(){this.unListen(),clearTimeout(this._resizeTimeout),this._resizeTimeout=null,this._$el=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null,this._$root=null},ScrollSpy.prototype.handleEvent=function(t){var e=this;"scroll"===t.type?this.process():"orientationchange"!==t.type&&"resize"!==t.type||(clearTimeout(e._resizeTimeout),e._resizeTimeout=setTimeout(function(){e.refresh().process()},e._config.throttle||Default.throttle))},ScrollSpy.prototype._getScroller=function(){if(isServer)return null;var t=this._config.element;return t?t&&isElement(t)?t:"string"==typeof t?"body"===t?document.body:$QS(t):null:null},ScrollSpy.prototype._getScrollTop=function(){var t=this._getScroller();return t?"BODY"===t.tagName?window.pageYOffset:t.scrollTop:0},ScrollSpy.prototype._getScrollHeight=function(){var t=this._getScroller();return t?"BODY"===t.tagName?Math.max(document.body.scrollHeight,document.documentElement.scrollHeight):t.scrollHeight:0},ScrollSpy.prototype._getOffsetHeight=function(){var t=this._getScroller();return t?"BODY"===t.tagName?window.innerHeight:t.getBoundingClientRect().height:0},ScrollSpy.prototype._activate=function(t){var e=this;this._activeTarget=t,this._clear();var i=this._selector.split(","),n=$QSA((i=i.map(function(e){return e+'[href="'+t+'"]'})).join(","),this._$el);n.forEach(function(t){if(t.classList.contains(ClassName.DROPDOWN_ITEM)){var i=closest(t,Selector.DROPDOWN);if(i){var n=$QS(Selector.DROPDOWN_TOGGLE,i);n&&e._setActiveState(n,!0)}e._setActiveState(t,!0)}else e._setActiveState(t,!0),e._setParentsSiblingActiveState(t,Selector.NAV_LIST_GROUP,[ClassName.NAV_LINK,ClassName.LIST_ITEM],!0)}),n&&n.length>0&&this._$root&&this._$root.$emit&&this._$root.$emit(EVENT,t)},ScrollSpy.prototype._clear=function(){var t=this;$QSA(this._selector,this._$el).filter(function(t){if(t.classList.contains(ClassName.ACTIVE)){var e=t.getAttribute("href");return"#"===e.charAt(0)&&0!==e.indexOf("#/")}return!1}).forEach(function(e){t._setActiveState(e,!1)})},ScrollSpy.prototype._setActiveState=function(t,e){if(t){t.classList.contains(ClassName.NAV_LINK)&&!t.classList.contains(ClassName.DROPDOWN_TOGGLE)&&(t=t.parentElement);var i=getVm(t);i&&Object.prototype.hasOwnProperty.call(i.$props,"active")?i.$props.active=e:t.classList[e?"add":"remove"](ClassName.ACTIVE)}},ScrollSpy.prototype._setParentsSiblingActiveState=function(t,e,i,n){var s=this;if(i){isArray(i)||(i=[i]);for(var r=t;r;)if((r=closest(r,e))&&r.previousElementSibling)for(var o=0;o<i.length-1;o++)r.previousElementSibling.classList.contains(i[o])&&s._setActiveState(r,n)}};var scrollspy={bind:function(t,e){isServer||t[BVSS]||(t[BVSS]=new ScrollSpy(t,e))},inserted:function(t,e){isServer||(t[BVSS]?t[BVSS].updateConfig(e).listen():(t[BVSS]=new ScrollSpy(t,e),t[BVSS].listen()),t[BVSS].refresh().process().scheduleRefresh())},update:function(t,e){isServer||(t[BVSS]?t[BVSS].updateConfig(e):(t[BVSS]=new ScrollSpy(t,e),t[BVSS].listen()),t[BVSS].refresh().process().scheduleRefresh())},componentUpdated:function(t,e){isServer||(t[BVSS]?t[BVSS].updateConfig(e):(t[BVSS]=new ScrollSpy(t,e),t[BVSS].listen()),t[BVSS].refresh().process().scheduleRefresh())},unbind:function(t){!isServer&&t[BVSS]&&(t[BVSS].unListen().dispose(),t[BVSS]=null)}},directives=Object.freeze({bToggle:toggle,bModal:modal$1,bScrollspy:scrollspy}),VuePlugin={install:function(t){if(!t._bootstrap_vue_installed){t._bootstrap_vue_installed=!0;for(var e in components)t.component(e,components[e]);for(var i in directives)t.directive(i,directives[i])}}};"undefined"!=typeof window&&window.Vue&&window.Vue.use(VuePlugin);/* harmony default export */ __webpack_exports__["a"] = (VuePlugin);
//# sourceMappingURL=bootstrap-vue.esm.js.map


/***/ }),

/***/ 302:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)();
exports.push([module.i, "/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */@font-face{font-family:'FontAwesome';src:url("+__webpack_require__(308)+");src:url("+__webpack_require__(307)+"?#iefix&v=4.7.0) format('embedded-opentype'),url("+__webpack_require__(311)+") format('woff2'),url("+__webpack_require__(312)+") format('woff'),url("+__webpack_require__(310)+") format('truetype'),url("+__webpack_require__(309)+"#fontawesomeregular) format('svg');font-weight:normal;font-style:normal}.fa{display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em;text-align:center}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:solid .08em #eee;border-radius:.1em}.fa-pull-left{float:left}.fa-pull-right{float:right}.fa.fa-pull-left{margin-right:.3em}.fa.fa-pull-right{margin-left:.3em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";-webkit-transform:scale(-1, 1);-ms-transform:scale(-1, 1);transform:scale(-1, 1)}.fa-flip-vertical{-ms-filter:\"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";-webkit-transform:scale(1, -1);-ms-transform:scale(1, -1);transform:scale(1, -1)}:root .fa-rotate-90,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-flip-horizontal,:root .fa-flip-vertical{filter:none}.fa-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\\f000\"}.fa-music:before{content:\"\\f001\"}.fa-search:before{content:\"\\f002\"}.fa-envelope-o:before{content:\"\\f003\"}.fa-heart:before{content:\"\\f004\"}.fa-star:before{content:\"\\f005\"}.fa-star-o:before{content:\"\\f006\"}.fa-user:before{content:\"\\f007\"}.fa-film:before{content:\"\\f008\"}.fa-th-large:before{content:\"\\f009\"}.fa-th:before{content:\"\\f00a\"}.fa-th-list:before{content:\"\\f00b\"}.fa-check:before{content:\"\\f00c\"}.fa-remove:before,.fa-close:before,.fa-times:before{content:\"\\f00d\"}.fa-search-plus:before{content:\"\\f00e\"}.fa-search-minus:before{content:\"\\f010\"}.fa-power-off:before{content:\"\\f011\"}.fa-signal:before{content:\"\\f012\"}.fa-gear:before,.fa-cog:before{content:\"\\f013\"}.fa-trash-o:before{content:\"\\f014\"}.fa-home:before{content:\"\\f015\"}.fa-file-o:before{content:\"\\f016\"}.fa-clock-o:before{content:\"\\f017\"}.fa-road:before{content:\"\\f018\"}.fa-download:before{content:\"\\f019\"}.fa-arrow-circle-o-down:before{content:\"\\f01a\"}.fa-arrow-circle-o-up:before{content:\"\\f01b\"}.fa-inbox:before{content:\"\\f01c\"}.fa-play-circle-o:before{content:\"\\f01d\"}.fa-rotate-right:before,.fa-repeat:before{content:\"\\f01e\"}.fa-refresh:before{content:\"\\f021\"}.fa-list-alt:before{content:\"\\f022\"}.fa-lock:before{content:\"\\f023\"}.fa-flag:before{content:\"\\f024\"}.fa-headphones:before{content:\"\\f025\"}.fa-volume-off:before{content:\"\\f026\"}.fa-volume-down:before{content:\"\\f027\"}.fa-volume-up:before{content:\"\\f028\"}.fa-qrcode:before{content:\"\\f029\"}.fa-barcode:before{content:\"\\f02a\"}.fa-tag:before{content:\"\\f02b\"}.fa-tags:before{content:\"\\f02c\"}.fa-book:before{content:\"\\f02d\"}.fa-bookmark:before{content:\"\\f02e\"}.fa-print:before{content:\"\\f02f\"}.fa-camera:before{content:\"\\f030\"}.fa-font:before{content:\"\\f031\"}.fa-bold:before{content:\"\\f032\"}.fa-italic:before{content:\"\\f033\"}.fa-text-height:before{content:\"\\f034\"}.fa-text-width:before{content:\"\\f035\"}.fa-align-left:before{content:\"\\f036\"}.fa-align-center:before{content:\"\\f037\"}.fa-align-right:before{content:\"\\f038\"}.fa-align-justify:before{content:\"\\f039\"}.fa-list:before{content:\"\\f03a\"}.fa-dedent:before,.fa-outdent:before{content:\"\\f03b\"}.fa-indent:before{content:\"\\f03c\"}.fa-video-camera:before{content:\"\\f03d\"}.fa-photo:before,.fa-image:before,.fa-picture-o:before{content:\"\\f03e\"}.fa-pencil:before{content:\"\\f040\"}.fa-map-marker:before{content:\"\\f041\"}.fa-adjust:before{content:\"\\f042\"}.fa-tint:before{content:\"\\f043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\\f044\"}.fa-share-square-o:before{content:\"\\f045\"}.fa-check-square-o:before{content:\"\\f046\"}.fa-arrows:before{content:\"\\f047\"}.fa-step-backward:before{content:\"\\f048\"}.fa-fast-backward:before{content:\"\\f049\"}.fa-backward:before{content:\"\\f04a\"}.fa-play:before{content:\"\\f04b\"}.fa-pause:before{content:\"\\f04c\"}.fa-stop:before{content:\"\\f04d\"}.fa-forward:before{content:\"\\f04e\"}.fa-fast-forward:before{content:\"\\f050\"}.fa-step-forward:before{content:\"\\f051\"}.fa-eject:before{content:\"\\f052\"}.fa-chevron-left:before{content:\"\\f053\"}.fa-chevron-right:before{content:\"\\f054\"}.fa-plus-circle:before{content:\"\\f055\"}.fa-minus-circle:before{content:\"\\f056\"}.fa-times-circle:before{content:\"\\f057\"}.fa-check-circle:before{content:\"\\f058\"}.fa-question-circle:before{content:\"\\f059\"}.fa-info-circle:before{content:\"\\f05a\"}.fa-crosshairs:before{content:\"\\f05b\"}.fa-times-circle-o:before{content:\"\\f05c\"}.fa-check-circle-o:before{content:\"\\f05d\"}.fa-ban:before{content:\"\\f05e\"}.fa-arrow-left:before{content:\"\\f060\"}.fa-arrow-right:before{content:\"\\f061\"}.fa-arrow-up:before{content:\"\\f062\"}.fa-arrow-down:before{content:\"\\f063\"}.fa-mail-forward:before,.fa-share:before{content:\"\\f064\"}.fa-expand:before{content:\"\\f065\"}.fa-compress:before{content:\"\\f066\"}.fa-plus:before{content:\"\\f067\"}.fa-minus:before{content:\"\\f068\"}.fa-asterisk:before{content:\"\\f069\"}.fa-exclamation-circle:before{content:\"\\f06a\"}.fa-gift:before{content:\"\\f06b\"}.fa-leaf:before{content:\"\\f06c\"}.fa-fire:before{content:\"\\f06d\"}.fa-eye:before{content:\"\\f06e\"}.fa-eye-slash:before{content:\"\\f070\"}.fa-warning:before,.fa-exclamation-triangle:before{content:\"\\f071\"}.fa-plane:before{content:\"\\f072\"}.fa-calendar:before{content:\"\\f073\"}.fa-random:before{content:\"\\f074\"}.fa-comment:before{content:\"\\f075\"}.fa-magnet:before{content:\"\\f076\"}.fa-chevron-up:before{content:\"\\f077\"}.fa-chevron-down:before{content:\"\\f078\"}.fa-retweet:before{content:\"\\f079\"}.fa-shopping-cart:before{content:\"\\f07a\"}.fa-folder:before{content:\"\\f07b\"}.fa-folder-open:before{content:\"\\f07c\"}.fa-arrows-v:before{content:\"\\f07d\"}.fa-arrows-h:before{content:\"\\f07e\"}.fa-bar-chart-o:before,.fa-bar-chart:before{content:\"\\f080\"}.fa-twitter-square:before{content:\"\\f081\"}.fa-facebook-square:before{content:\"\\f082\"}.fa-camera-retro:before{content:\"\\f083\"}.fa-key:before{content:\"\\f084\"}.fa-gears:before,.fa-cogs:before{content:\"\\f085\"}.fa-comments:before{content:\"\\f086\"}.fa-thumbs-o-up:before{content:\"\\f087\"}.fa-thumbs-o-down:before{content:\"\\f088\"}.fa-star-half:before{content:\"\\f089\"}.fa-heart-o:before{content:\"\\f08a\"}.fa-sign-out:before{content:\"\\f08b\"}.fa-linkedin-square:before{content:\"\\f08c\"}.fa-thumb-tack:before{content:\"\\f08d\"}.fa-external-link:before{content:\"\\f08e\"}.fa-sign-in:before{content:\"\\f090\"}.fa-trophy:before{content:\"\\f091\"}.fa-github-square:before{content:\"\\f092\"}.fa-upload:before{content:\"\\f093\"}.fa-lemon-o:before{content:\"\\f094\"}.fa-phone:before{content:\"\\f095\"}.fa-square-o:before{content:\"\\f096\"}.fa-bookmark-o:before{content:\"\\f097\"}.fa-phone-square:before{content:\"\\f098\"}.fa-twitter:before{content:\"\\f099\"}.fa-facebook-f:before,.fa-facebook:before{content:\"\\f09a\"}.fa-github:before{content:\"\\f09b\"}.fa-unlock:before{content:\"\\f09c\"}.fa-credit-card:before{content:\"\\f09d\"}.fa-feed:before,.fa-rss:before{content:\"\\f09e\"}.fa-hdd-o:before{content:\"\\f0a0\"}.fa-bullhorn:before{content:\"\\f0a1\"}.fa-bell:before{content:\"\\f0f3\"}.fa-certificate:before{content:\"\\f0a3\"}.fa-hand-o-right:before{content:\"\\f0a4\"}.fa-hand-o-left:before{content:\"\\f0a5\"}.fa-hand-o-up:before{content:\"\\f0a6\"}.fa-hand-o-down:before{content:\"\\f0a7\"}.fa-arrow-circle-left:before{content:\"\\f0a8\"}.fa-arrow-circle-right:before{content:\"\\f0a9\"}.fa-arrow-circle-up:before{content:\"\\f0aa\"}.fa-arrow-circle-down:before{content:\"\\f0ab\"}.fa-globe:before{content:\"\\f0ac\"}.fa-wrench:before{content:\"\\f0ad\"}.fa-tasks:before{content:\"\\f0ae\"}.fa-filter:before{content:\"\\f0b0\"}.fa-briefcase:before{content:\"\\f0b1\"}.fa-arrows-alt:before{content:\"\\f0b2\"}.fa-group:before,.fa-users:before{content:\"\\f0c0\"}.fa-chain:before,.fa-link:before{content:\"\\f0c1\"}.fa-cloud:before{content:\"\\f0c2\"}.fa-flask:before{content:\"\\f0c3\"}.fa-cut:before,.fa-scissors:before{content:\"\\f0c4\"}.fa-copy:before,.fa-files-o:before{content:\"\\f0c5\"}.fa-paperclip:before{content:\"\\f0c6\"}.fa-save:before,.fa-floppy-o:before{content:\"\\f0c7\"}.fa-square:before{content:\"\\f0c8\"}.fa-navicon:before,.fa-reorder:before,.fa-bars:before{content:\"\\f0c9\"}.fa-list-ul:before{content:\"\\f0ca\"}.fa-list-ol:before{content:\"\\f0cb\"}.fa-strikethrough:before{content:\"\\f0cc\"}.fa-underline:before{content:\"\\f0cd\"}.fa-table:before{content:\"\\f0ce\"}.fa-magic:before{content:\"\\f0d0\"}.fa-truck:before{content:\"\\f0d1\"}.fa-pinterest:before{content:\"\\f0d2\"}.fa-pinterest-square:before{content:\"\\f0d3\"}.fa-google-plus-square:before{content:\"\\f0d4\"}.fa-google-plus:before{content:\"\\f0d5\"}.fa-money:before{content:\"\\f0d6\"}.fa-caret-down:before{content:\"\\f0d7\"}.fa-caret-up:before{content:\"\\f0d8\"}.fa-caret-left:before{content:\"\\f0d9\"}.fa-caret-right:before{content:\"\\f0da\"}.fa-columns:before{content:\"\\f0db\"}.fa-unsorted:before,.fa-sort:before{content:\"\\f0dc\"}.fa-sort-down:before,.fa-sort-desc:before{content:\"\\f0dd\"}.fa-sort-up:before,.fa-sort-asc:before{content:\"\\f0de\"}.fa-envelope:before{content:\"\\f0e0\"}.fa-linkedin:before{content:\"\\f0e1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\\f0e2\"}.fa-legal:before,.fa-gavel:before{content:\"\\f0e3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\\f0e4\"}.fa-comment-o:before{content:\"\\f0e5\"}.fa-comments-o:before{content:\"\\f0e6\"}.fa-flash:before,.fa-bolt:before{content:\"\\f0e7\"}.fa-sitemap:before{content:\"\\f0e8\"}.fa-umbrella:before{content:\"\\f0e9\"}.fa-paste:before,.fa-clipboard:before{content:\"\\f0ea\"}.fa-lightbulb-o:before{content:\"\\f0eb\"}.fa-exchange:before{content:\"\\f0ec\"}.fa-cloud-download:before{content:\"\\f0ed\"}.fa-cloud-upload:before{content:\"\\f0ee\"}.fa-user-md:before{content:\"\\f0f0\"}.fa-stethoscope:before{content:\"\\f0f1\"}.fa-suitcase:before{content:\"\\f0f2\"}.fa-bell-o:before{content:\"\\f0a2\"}.fa-coffee:before{content:\"\\f0f4\"}.fa-cutlery:before{content:\"\\f0f5\"}.fa-file-text-o:before{content:\"\\f0f6\"}.fa-building-o:before{content:\"\\f0f7\"}.fa-hospital-o:before{content:\"\\f0f8\"}.fa-ambulance:before{content:\"\\f0f9\"}.fa-medkit:before{content:\"\\f0fa\"}.fa-fighter-jet:before{content:\"\\f0fb\"}.fa-beer:before{content:\"\\f0fc\"}.fa-h-square:before{content:\"\\f0fd\"}.fa-plus-square:before{content:\"\\f0fe\"}.fa-angle-double-left:before{content:\"\\f100\"}.fa-angle-double-right:before{content:\"\\f101\"}.fa-angle-double-up:before{content:\"\\f102\"}.fa-angle-double-down:before{content:\"\\f103\"}.fa-angle-left:before{content:\"\\f104\"}.fa-angle-right:before{content:\"\\f105\"}.fa-angle-up:before{content:\"\\f106\"}.fa-angle-down:before{content:\"\\f107\"}.fa-desktop:before{content:\"\\f108\"}.fa-laptop:before{content:\"\\f109\"}.fa-tablet:before{content:\"\\f10a\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\\f10b\"}.fa-circle-o:before{content:\"\\f10c\"}.fa-quote-left:before{content:\"\\f10d\"}.fa-quote-right:before{content:\"\\f10e\"}.fa-spinner:before{content:\"\\f110\"}.fa-circle:before{content:\"\\f111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\\f112\"}.fa-github-alt:before{content:\"\\f113\"}.fa-folder-o:before{content:\"\\f114\"}.fa-folder-open-o:before{content:\"\\f115\"}.fa-smile-o:before{content:\"\\f118\"}.fa-frown-o:before{content:\"\\f119\"}.fa-meh-o:before{content:\"\\f11a\"}.fa-gamepad:before{content:\"\\f11b\"}.fa-keyboard-o:before{content:\"\\f11c\"}.fa-flag-o:before{content:\"\\f11d\"}.fa-flag-checkered:before{content:\"\\f11e\"}.fa-terminal:before{content:\"\\f120\"}.fa-code:before{content:\"\\f121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\\f122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\\f123\"}.fa-location-arrow:before{content:\"\\f124\"}.fa-crop:before{content:\"\\f125\"}.fa-code-fork:before{content:\"\\f126\"}.fa-unlink:before,.fa-chain-broken:before{content:\"\\f127\"}.fa-question:before{content:\"\\f128\"}.fa-info:before{content:\"\\f129\"}.fa-exclamation:before{content:\"\\f12a\"}.fa-superscript:before{content:\"\\f12b\"}.fa-subscript:before{content:\"\\f12c\"}.fa-eraser:before{content:\"\\f12d\"}.fa-puzzle-piece:before{content:\"\\f12e\"}.fa-microphone:before{content:\"\\f130\"}.fa-microphone-slash:before{content:\"\\f131\"}.fa-shield:before{content:\"\\f132\"}.fa-calendar-o:before{content:\"\\f133\"}.fa-fire-extinguisher:before{content:\"\\f134\"}.fa-rocket:before{content:\"\\f135\"}.fa-maxcdn:before{content:\"\\f136\"}.fa-chevron-circle-left:before{content:\"\\f137\"}.fa-chevron-circle-right:before{content:\"\\f138\"}.fa-chevron-circle-up:before{content:\"\\f139\"}.fa-chevron-circle-down:before{content:\"\\f13a\"}.fa-html5:before{content:\"\\f13b\"}.fa-css3:before{content:\"\\f13c\"}.fa-anchor:before{content:\"\\f13d\"}.fa-unlock-alt:before{content:\"\\f13e\"}.fa-bullseye:before{content:\"\\f140\"}.fa-ellipsis-h:before{content:\"\\f141\"}.fa-ellipsis-v:before{content:\"\\f142\"}.fa-rss-square:before{content:\"\\f143\"}.fa-play-circle:before{content:\"\\f144\"}.fa-ticket:before{content:\"\\f145\"}.fa-minus-square:before{content:\"\\f146\"}.fa-minus-square-o:before{content:\"\\f147\"}.fa-level-up:before{content:\"\\f148\"}.fa-level-down:before{content:\"\\f149\"}.fa-check-square:before{content:\"\\f14a\"}.fa-pencil-square:before{content:\"\\f14b\"}.fa-external-link-square:before{content:\"\\f14c\"}.fa-share-square:before{content:\"\\f14d\"}.fa-compass:before{content:\"\\f14e\"}.fa-toggle-down:before,.fa-caret-square-o-down:before{content:\"\\f150\"}.fa-toggle-up:before,.fa-caret-square-o-up:before{content:\"\\f151\"}.fa-toggle-right:before,.fa-caret-square-o-right:before{content:\"\\f152\"}.fa-euro:before,.fa-eur:before{content:\"\\f153\"}.fa-gbp:before{content:\"\\f154\"}.fa-dollar:before,.fa-usd:before{content:\"\\f155\"}.fa-rupee:before,.fa-inr:before{content:\"\\f156\"}.fa-cny:before,.fa-rmb:before,.fa-yen:before,.fa-jpy:before{content:\"\\f157\"}.fa-ruble:before,.fa-rouble:before,.fa-rub:before{content:\"\\f158\"}.fa-won:before,.fa-krw:before{content:\"\\f159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\\f15a\"}.fa-file:before{content:\"\\f15b\"}.fa-file-text:before{content:\"\\f15c\"}.fa-sort-alpha-asc:before{content:\"\\f15d\"}.fa-sort-alpha-desc:before{content:\"\\f15e\"}.fa-sort-amount-asc:before{content:\"\\f160\"}.fa-sort-amount-desc:before{content:\"\\f161\"}.fa-sort-numeric-asc:before{content:\"\\f162\"}.fa-sort-numeric-desc:before{content:\"\\f163\"}.fa-thumbs-up:before{content:\"\\f164\"}.fa-thumbs-down:before{content:\"\\f165\"}.fa-youtube-square:before{content:\"\\f166\"}.fa-youtube:before{content:\"\\f167\"}.fa-xing:before{content:\"\\f168\"}.fa-xing-square:before{content:\"\\f169\"}.fa-youtube-play:before{content:\"\\f16a\"}.fa-dropbox:before{content:\"\\f16b\"}.fa-stack-overflow:before{content:\"\\f16c\"}.fa-instagram:before{content:\"\\f16d\"}.fa-flickr:before{content:\"\\f16e\"}.fa-adn:before{content:\"\\f170\"}.fa-bitbucket:before{content:\"\\f171\"}.fa-bitbucket-square:before{content:\"\\f172\"}.fa-tumblr:before{content:\"\\f173\"}.fa-tumblr-square:before{content:\"\\f174\"}.fa-long-arrow-down:before{content:\"\\f175\"}.fa-long-arrow-up:before{content:\"\\f176\"}.fa-long-arrow-left:before{content:\"\\f177\"}.fa-long-arrow-right:before{content:\"\\f178\"}.fa-apple:before{content:\"\\f179\"}.fa-windows:before{content:\"\\f17a\"}.fa-android:before{content:\"\\f17b\"}.fa-linux:before{content:\"\\f17c\"}.fa-dribbble:before{content:\"\\f17d\"}.fa-skype:before{content:\"\\f17e\"}.fa-foursquare:before{content:\"\\f180\"}.fa-trello:before{content:\"\\f181\"}.fa-female:before{content:\"\\f182\"}.fa-male:before{content:\"\\f183\"}.fa-gittip:before,.fa-gratipay:before{content:\"\\f184\"}.fa-sun-o:before{content:\"\\f185\"}.fa-moon-o:before{content:\"\\f186\"}.fa-archive:before{content:\"\\f187\"}.fa-bug:before{content:\"\\f188\"}.fa-vk:before{content:\"\\f189\"}.fa-weibo:before{content:\"\\f18a\"}.fa-renren:before{content:\"\\f18b\"}.fa-pagelines:before{content:\"\\f18c\"}.fa-stack-exchange:before{content:\"\\f18d\"}.fa-arrow-circle-o-right:before{content:\"\\f18e\"}.fa-arrow-circle-o-left:before{content:\"\\f190\"}.fa-toggle-left:before,.fa-caret-square-o-left:before{content:\"\\f191\"}.fa-dot-circle-o:before{content:\"\\f192\"}.fa-wheelchair:before{content:\"\\f193\"}.fa-vimeo-square:before{content:\"\\f194\"}.fa-turkish-lira:before,.fa-try:before{content:\"\\f195\"}.fa-plus-square-o:before{content:\"\\f196\"}.fa-space-shuttle:before{content:\"\\f197\"}.fa-slack:before{content:\"\\f198\"}.fa-envelope-square:before{content:\"\\f199\"}.fa-wordpress:before{content:\"\\f19a\"}.fa-openid:before{content:\"\\f19b\"}.fa-institution:before,.fa-bank:before,.fa-university:before{content:\"\\f19c\"}.fa-mortar-board:before,.fa-graduation-cap:before{content:\"\\f19d\"}.fa-yahoo:before{content:\"\\f19e\"}.fa-google:before{content:\"\\f1a0\"}.fa-reddit:before{content:\"\\f1a1\"}.fa-reddit-square:before{content:\"\\f1a2\"}.fa-stumbleupon-circle:before{content:\"\\f1a3\"}.fa-stumbleupon:before{content:\"\\f1a4\"}.fa-delicious:before{content:\"\\f1a5\"}.fa-digg:before{content:\"\\f1a6\"}.fa-pied-piper-pp:before{content:\"\\f1a7\"}.fa-pied-piper-alt:before{content:\"\\f1a8\"}.fa-drupal:before{content:\"\\f1a9\"}.fa-joomla:before{content:\"\\f1aa\"}.fa-language:before{content:\"\\f1ab\"}.fa-fax:before{content:\"\\f1ac\"}.fa-building:before{content:\"\\f1ad\"}.fa-child:before{content:\"\\f1ae\"}.fa-paw:before{content:\"\\f1b0\"}.fa-spoon:before{content:\"\\f1b1\"}.fa-cube:before{content:\"\\f1b2\"}.fa-cubes:before{content:\"\\f1b3\"}.fa-behance:before{content:\"\\f1b4\"}.fa-behance-square:before{content:\"\\f1b5\"}.fa-steam:before{content:\"\\f1b6\"}.fa-steam-square:before{content:\"\\f1b7\"}.fa-recycle:before{content:\"\\f1b8\"}.fa-automobile:before,.fa-car:before{content:\"\\f1b9\"}.fa-cab:before,.fa-taxi:before{content:\"\\f1ba\"}.fa-tree:before{content:\"\\f1bb\"}.fa-spotify:before{content:\"\\f1bc\"}.fa-deviantart:before{content:\"\\f1bd\"}.fa-soundcloud:before{content:\"\\f1be\"}.fa-database:before{content:\"\\f1c0\"}.fa-file-pdf-o:before{content:\"\\f1c1\"}.fa-file-word-o:before{content:\"\\f1c2\"}.fa-file-excel-o:before{content:\"\\f1c3\"}.fa-file-powerpoint-o:before{content:\"\\f1c4\"}.fa-file-photo-o:before,.fa-file-picture-o:before,.fa-file-image-o:before{content:\"\\f1c5\"}.fa-file-zip-o:before,.fa-file-archive-o:before{content:\"\\f1c6\"}.fa-file-sound-o:before,.fa-file-audio-o:before{content:\"\\f1c7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\\f1c8\"}.fa-file-code-o:before{content:\"\\f1c9\"}.fa-vine:before{content:\"\\f1ca\"}.fa-codepen:before{content:\"\\f1cb\"}.fa-jsfiddle:before{content:\"\\f1cc\"}.fa-life-bouy:before,.fa-life-buoy:before,.fa-life-saver:before,.fa-support:before,.fa-life-ring:before{content:\"\\f1cd\"}.fa-circle-o-notch:before{content:\"\\f1ce\"}.fa-ra:before,.fa-resistance:before,.fa-rebel:before{content:\"\\f1d0\"}.fa-ge:before,.fa-empire:before{content:\"\\f1d1\"}.fa-git-square:before{content:\"\\f1d2\"}.fa-git:before{content:\"\\f1d3\"}.fa-y-combinator-square:before,.fa-yc-square:before,.fa-hacker-news:before{content:\"\\f1d4\"}.fa-tencent-weibo:before{content:\"\\f1d5\"}.fa-qq:before{content:\"\\f1d6\"}.fa-wechat:before,.fa-weixin:before{content:\"\\f1d7\"}.fa-send:before,.fa-paper-plane:before{content:\"\\f1d8\"}.fa-send-o:before,.fa-paper-plane-o:before{content:\"\\f1d9\"}.fa-history:before{content:\"\\f1da\"}.fa-circle-thin:before{content:\"\\f1db\"}.fa-header:before{content:\"\\f1dc\"}.fa-paragraph:before{content:\"\\f1dd\"}.fa-sliders:before{content:\"\\f1de\"}.fa-share-alt:before{content:\"\\f1e0\"}.fa-share-alt-square:before{content:\"\\f1e1\"}.fa-bomb:before{content:\"\\f1e2\"}.fa-soccer-ball-o:before,.fa-futbol-o:before{content:\"\\f1e3\"}.fa-tty:before{content:\"\\f1e4\"}.fa-binoculars:before{content:\"\\f1e5\"}.fa-plug:before{content:\"\\f1e6\"}.fa-slideshare:before{content:\"\\f1e7\"}.fa-twitch:before{content:\"\\f1e8\"}.fa-yelp:before{content:\"\\f1e9\"}.fa-newspaper-o:before{content:\"\\f1ea\"}.fa-wifi:before{content:\"\\f1eb\"}.fa-calculator:before{content:\"\\f1ec\"}.fa-paypal:before{content:\"\\f1ed\"}.fa-google-wallet:before{content:\"\\f1ee\"}.fa-cc-visa:before{content:\"\\f1f0\"}.fa-cc-mastercard:before{content:\"\\f1f1\"}.fa-cc-discover:before{content:\"\\f1f2\"}.fa-cc-amex:before{content:\"\\f1f3\"}.fa-cc-paypal:before{content:\"\\f1f4\"}.fa-cc-stripe:before{content:\"\\f1f5\"}.fa-bell-slash:before{content:\"\\f1f6\"}.fa-bell-slash-o:before{content:\"\\f1f7\"}.fa-trash:before{content:\"\\f1f8\"}.fa-copyright:before{content:\"\\f1f9\"}.fa-at:before{content:\"\\f1fa\"}.fa-eyedropper:before{content:\"\\f1fb\"}.fa-paint-brush:before{content:\"\\f1fc\"}.fa-birthday-cake:before{content:\"\\f1fd\"}.fa-area-chart:before{content:\"\\f1fe\"}.fa-pie-chart:before{content:\"\\f200\"}.fa-line-chart:before{content:\"\\f201\"}.fa-lastfm:before{content:\"\\f202\"}.fa-lastfm-square:before{content:\"\\f203\"}.fa-toggle-off:before{content:\"\\f204\"}.fa-toggle-on:before{content:\"\\f205\"}.fa-bicycle:before{content:\"\\f206\"}.fa-bus:before{content:\"\\f207\"}.fa-ioxhost:before{content:\"\\f208\"}.fa-angellist:before{content:\"\\f209\"}.fa-cc:before{content:\"\\f20a\"}.fa-shekel:before,.fa-sheqel:before,.fa-ils:before{content:\"\\f20b\"}.fa-meanpath:before{content:\"\\f20c\"}.fa-buysellads:before{content:\"\\f20d\"}.fa-connectdevelop:before{content:\"\\f20e\"}.fa-dashcube:before{content:\"\\f210\"}.fa-forumbee:before{content:\"\\f211\"}.fa-leanpub:before{content:\"\\f212\"}.fa-sellsy:before{content:\"\\f213\"}.fa-shirtsinbulk:before{content:\"\\f214\"}.fa-simplybuilt:before{content:\"\\f215\"}.fa-skyatlas:before{content:\"\\f216\"}.fa-cart-plus:before{content:\"\\f217\"}.fa-cart-arrow-down:before{content:\"\\f218\"}.fa-diamond:before{content:\"\\f219\"}.fa-ship:before{content:\"\\f21a\"}.fa-user-secret:before{content:\"\\f21b\"}.fa-motorcycle:before{content:\"\\f21c\"}.fa-street-view:before{content:\"\\f21d\"}.fa-heartbeat:before{content:\"\\f21e\"}.fa-venus:before{content:\"\\f221\"}.fa-mars:before{content:\"\\f222\"}.fa-mercury:before{content:\"\\f223\"}.fa-intersex:before,.fa-transgender:before{content:\"\\f224\"}.fa-transgender-alt:before{content:\"\\f225\"}.fa-venus-double:before{content:\"\\f226\"}.fa-mars-double:before{content:\"\\f227\"}.fa-venus-mars:before{content:\"\\f228\"}.fa-mars-stroke:before{content:\"\\f229\"}.fa-mars-stroke-v:before{content:\"\\f22a\"}.fa-mars-stroke-h:before{content:\"\\f22b\"}.fa-neuter:before{content:\"\\f22c\"}.fa-genderless:before{content:\"\\f22d\"}.fa-facebook-official:before{content:\"\\f230\"}.fa-pinterest-p:before{content:\"\\f231\"}.fa-whatsapp:before{content:\"\\f232\"}.fa-server:before{content:\"\\f233\"}.fa-user-plus:before{content:\"\\f234\"}.fa-user-times:before{content:\"\\f235\"}.fa-hotel:before,.fa-bed:before{content:\"\\f236\"}.fa-viacoin:before{content:\"\\f237\"}.fa-train:before{content:\"\\f238\"}.fa-subway:before{content:\"\\f239\"}.fa-medium:before{content:\"\\f23a\"}.fa-yc:before,.fa-y-combinator:before{content:\"\\f23b\"}.fa-optin-monster:before{content:\"\\f23c\"}.fa-opencart:before{content:\"\\f23d\"}.fa-expeditedssl:before{content:\"\\f23e\"}.fa-battery-4:before,.fa-battery:before,.fa-battery-full:before{content:\"\\f240\"}.fa-battery-3:before,.fa-battery-three-quarters:before{content:\"\\f241\"}.fa-battery-2:before,.fa-battery-half:before{content:\"\\f242\"}.fa-battery-1:before,.fa-battery-quarter:before{content:\"\\f243\"}.fa-battery-0:before,.fa-battery-empty:before{content:\"\\f244\"}.fa-mouse-pointer:before{content:\"\\f245\"}.fa-i-cursor:before{content:\"\\f246\"}.fa-object-group:before{content:\"\\f247\"}.fa-object-ungroup:before{content:\"\\f248\"}.fa-sticky-note:before{content:\"\\f249\"}.fa-sticky-note-o:before{content:\"\\f24a\"}.fa-cc-jcb:before{content:\"\\f24b\"}.fa-cc-diners-club:before{content:\"\\f24c\"}.fa-clone:before{content:\"\\f24d\"}.fa-balance-scale:before{content:\"\\f24e\"}.fa-hourglass-o:before{content:\"\\f250\"}.fa-hourglass-1:before,.fa-hourglass-start:before{content:\"\\f251\"}.fa-hourglass-2:before,.fa-hourglass-half:before{content:\"\\f252\"}.fa-hourglass-3:before,.fa-hourglass-end:before{content:\"\\f253\"}.fa-hourglass:before{content:\"\\f254\"}.fa-hand-grab-o:before,.fa-hand-rock-o:before{content:\"\\f255\"}.fa-hand-stop-o:before,.fa-hand-paper-o:before{content:\"\\f256\"}.fa-hand-scissors-o:before{content:\"\\f257\"}.fa-hand-lizard-o:before{content:\"\\f258\"}.fa-hand-spock-o:before{content:\"\\f259\"}.fa-hand-pointer-o:before{content:\"\\f25a\"}.fa-hand-peace-o:before{content:\"\\f25b\"}.fa-trademark:before{content:\"\\f25c\"}.fa-registered:before{content:\"\\f25d\"}.fa-creative-commons:before{content:\"\\f25e\"}.fa-gg:before{content:\"\\f260\"}.fa-gg-circle:before{content:\"\\f261\"}.fa-tripadvisor:before{content:\"\\f262\"}.fa-odnoklassniki:before{content:\"\\f263\"}.fa-odnoklassniki-square:before{content:\"\\f264\"}.fa-get-pocket:before{content:\"\\f265\"}.fa-wikipedia-w:before{content:\"\\f266\"}.fa-safari:before{content:\"\\f267\"}.fa-chrome:before{content:\"\\f268\"}.fa-firefox:before{content:\"\\f269\"}.fa-opera:before{content:\"\\f26a\"}.fa-internet-explorer:before{content:\"\\f26b\"}.fa-tv:before,.fa-television:before{content:\"\\f26c\"}.fa-contao:before{content:\"\\f26d\"}.fa-500px:before{content:\"\\f26e\"}.fa-amazon:before{content:\"\\f270\"}.fa-calendar-plus-o:before{content:\"\\f271\"}.fa-calendar-minus-o:before{content:\"\\f272\"}.fa-calendar-times-o:before{content:\"\\f273\"}.fa-calendar-check-o:before{content:\"\\f274\"}.fa-industry:before{content:\"\\f275\"}.fa-map-pin:before{content:\"\\f276\"}.fa-map-signs:before{content:\"\\f277\"}.fa-map-o:before{content:\"\\f278\"}.fa-map:before{content:\"\\f279\"}.fa-commenting:before{content:\"\\f27a\"}.fa-commenting-o:before{content:\"\\f27b\"}.fa-houzz:before{content:\"\\f27c\"}.fa-vimeo:before{content:\"\\f27d\"}.fa-black-tie:before{content:\"\\f27e\"}.fa-fonticons:before{content:\"\\f280\"}.fa-reddit-alien:before{content:\"\\f281\"}.fa-edge:before{content:\"\\f282\"}.fa-credit-card-alt:before{content:\"\\f283\"}.fa-codiepie:before{content:\"\\f284\"}.fa-modx:before{content:\"\\f285\"}.fa-fort-awesome:before{content:\"\\f286\"}.fa-usb:before{content:\"\\f287\"}.fa-product-hunt:before{content:\"\\f288\"}.fa-mixcloud:before{content:\"\\f289\"}.fa-scribd:before{content:\"\\f28a\"}.fa-pause-circle:before{content:\"\\f28b\"}.fa-pause-circle-o:before{content:\"\\f28c\"}.fa-stop-circle:before{content:\"\\f28d\"}.fa-stop-circle-o:before{content:\"\\f28e\"}.fa-shopping-bag:before{content:\"\\f290\"}.fa-shopping-basket:before{content:\"\\f291\"}.fa-hashtag:before{content:\"\\f292\"}.fa-bluetooth:before{content:\"\\f293\"}.fa-bluetooth-b:before{content:\"\\f294\"}.fa-percent:before{content:\"\\f295\"}.fa-gitlab:before{content:\"\\f296\"}.fa-wpbeginner:before{content:\"\\f297\"}.fa-wpforms:before{content:\"\\f298\"}.fa-envira:before{content:\"\\f299\"}.fa-universal-access:before{content:\"\\f29a\"}.fa-wheelchair-alt:before{content:\"\\f29b\"}.fa-question-circle-o:before{content:\"\\f29c\"}.fa-blind:before{content:\"\\f29d\"}.fa-audio-description:before{content:\"\\f29e\"}.fa-volume-control-phone:before{content:\"\\f2a0\"}.fa-braille:before{content:\"\\f2a1\"}.fa-assistive-listening-systems:before{content:\"\\f2a2\"}.fa-asl-interpreting:before,.fa-american-sign-language-interpreting:before{content:\"\\f2a3\"}.fa-deafness:before,.fa-hard-of-hearing:before,.fa-deaf:before{content:\"\\f2a4\"}.fa-glide:before{content:\"\\f2a5\"}.fa-glide-g:before{content:\"\\f2a6\"}.fa-signing:before,.fa-sign-language:before{content:\"\\f2a7\"}.fa-low-vision:before{content:\"\\f2a8\"}.fa-viadeo:before{content:\"\\f2a9\"}.fa-viadeo-square:before{content:\"\\f2aa\"}.fa-snapchat:before{content:\"\\f2ab\"}.fa-snapchat-ghost:before{content:\"\\f2ac\"}.fa-snapchat-square:before{content:\"\\f2ad\"}.fa-pied-piper:before{content:\"\\f2ae\"}.fa-first-order:before{content:\"\\f2b0\"}.fa-yoast:before{content:\"\\f2b1\"}.fa-themeisle:before{content:\"\\f2b2\"}.fa-google-plus-circle:before,.fa-google-plus-official:before{content:\"\\f2b3\"}.fa-fa:before,.fa-font-awesome:before{content:\"\\f2b4\"}.fa-handshake-o:before{content:\"\\f2b5\"}.fa-envelope-open:before{content:\"\\f2b6\"}.fa-envelope-open-o:before{content:\"\\f2b7\"}.fa-linode:before{content:\"\\f2b8\"}.fa-address-book:before{content:\"\\f2b9\"}.fa-address-book-o:before{content:\"\\f2ba\"}.fa-vcard:before,.fa-address-card:before{content:\"\\f2bb\"}.fa-vcard-o:before,.fa-address-card-o:before{content:\"\\f2bc\"}.fa-user-circle:before{content:\"\\f2bd\"}.fa-user-circle-o:before{content:\"\\f2be\"}.fa-user-o:before{content:\"\\f2c0\"}.fa-id-badge:before{content:\"\\f2c1\"}.fa-drivers-license:before,.fa-id-card:before{content:\"\\f2c2\"}.fa-drivers-license-o:before,.fa-id-card-o:before{content:\"\\f2c3\"}.fa-quora:before{content:\"\\f2c4\"}.fa-free-code-camp:before{content:\"\\f2c5\"}.fa-telegram:before{content:\"\\f2c6\"}.fa-thermometer-4:before,.fa-thermometer:before,.fa-thermometer-full:before{content:\"\\f2c7\"}.fa-thermometer-3:before,.fa-thermometer-three-quarters:before{content:\"\\f2c8\"}.fa-thermometer-2:before,.fa-thermometer-half:before{content:\"\\f2c9\"}.fa-thermometer-1:before,.fa-thermometer-quarter:before{content:\"\\f2ca\"}.fa-thermometer-0:before,.fa-thermometer-empty:before{content:\"\\f2cb\"}.fa-shower:before{content:\"\\f2cc\"}.fa-bathtub:before,.fa-s15:before,.fa-bath:before{content:\"\\f2cd\"}.fa-podcast:before{content:\"\\f2ce\"}.fa-window-maximize:before{content:\"\\f2d0\"}.fa-window-minimize:before{content:\"\\f2d1\"}.fa-window-restore:before{content:\"\\f2d2\"}.fa-times-rectangle:before,.fa-window-close:before{content:\"\\f2d3\"}.fa-times-rectangle-o:before,.fa-window-close-o:before{content:\"\\f2d4\"}.fa-bandcamp:before{content:\"\\f2d5\"}.fa-grav:before{content:\"\\f2d6\"}.fa-etsy:before{content:\"\\f2d7\"}.fa-imdb:before{content:\"\\f2d8\"}.fa-ravelry:before{content:\"\\f2d9\"}.fa-eercast:before{content:\"\\f2da\"}.fa-microchip:before{content:\"\\f2db\"}.fa-snowflake-o:before{content:\"\\f2dc\"}.fa-superpowers:before{content:\"\\f2dd\"}.fa-wpexplorer:before{content:\"\\f2de\"}.fa-meetup:before{content:\"\\f2e0\"}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}\n", ""]);

/***/ }),

/***/ 303:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)();
exports.push([module.i, "@font-face {\n  font-family: 'simple-line-icons';\n  src: url("+__webpack_require__(22)+");\n  src: url("+__webpack_require__(22)+"#iefix) format('embedded-opentype'), url("+__webpack_require__(315)+") format('woff2'), url("+__webpack_require__(314)+") format('truetype'), url("+__webpack_require__(316)+") format('woff'), url("+__webpack_require__(313)+"#simple-line-icons) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n/*\n Use the following CSS code if you want to have a class per icon.\n Instead of a list of all class selectors, you can use the generic [class*=\"icon-\"] selector, but it's slower:\n*/\n.icon-user,\n.icon-people,\n.icon-user-female,\n.icon-user-follow,\n.icon-user-following,\n.icon-user-unfollow,\n.icon-login,\n.icon-logout,\n.icon-emotsmile,\n.icon-phone,\n.icon-call-end,\n.icon-call-in,\n.icon-call-out,\n.icon-map,\n.icon-location-pin,\n.icon-direction,\n.icon-directions,\n.icon-compass,\n.icon-layers,\n.icon-menu,\n.icon-list,\n.icon-options-vertical,\n.icon-options,\n.icon-arrow-down,\n.icon-arrow-left,\n.icon-arrow-right,\n.icon-arrow-up,\n.icon-arrow-up-circle,\n.icon-arrow-left-circle,\n.icon-arrow-right-circle,\n.icon-arrow-down-circle,\n.icon-check,\n.icon-clock,\n.icon-plus,\n.icon-minus,\n.icon-close,\n.icon-event,\n.icon-exclamation,\n.icon-organization,\n.icon-trophy,\n.icon-screen-smartphone,\n.icon-screen-desktop,\n.icon-plane,\n.icon-notebook,\n.icon-mustache,\n.icon-mouse,\n.icon-magnet,\n.icon-energy,\n.icon-disc,\n.icon-cursor,\n.icon-cursor-move,\n.icon-crop,\n.icon-chemistry,\n.icon-speedometer,\n.icon-shield,\n.icon-screen-tablet,\n.icon-magic-wand,\n.icon-hourglass,\n.icon-graduation,\n.icon-ghost,\n.icon-game-controller,\n.icon-fire,\n.icon-eyeglass,\n.icon-envelope-open,\n.icon-envelope-letter,\n.icon-bell,\n.icon-badge,\n.icon-anchor,\n.icon-wallet,\n.icon-vector,\n.icon-speech,\n.icon-puzzle,\n.icon-printer,\n.icon-present,\n.icon-playlist,\n.icon-pin,\n.icon-picture,\n.icon-handbag,\n.icon-globe-alt,\n.icon-globe,\n.icon-folder-alt,\n.icon-folder,\n.icon-film,\n.icon-feed,\n.icon-drop,\n.icon-drawer,\n.icon-docs,\n.icon-doc,\n.icon-diamond,\n.icon-cup,\n.icon-calculator,\n.icon-bubbles,\n.icon-briefcase,\n.icon-book-open,\n.icon-basket-loaded,\n.icon-basket,\n.icon-bag,\n.icon-action-undo,\n.icon-action-redo,\n.icon-wrench,\n.icon-umbrella,\n.icon-trash,\n.icon-tag,\n.icon-support,\n.icon-frame,\n.icon-size-fullscreen,\n.icon-size-actual,\n.icon-shuffle,\n.icon-share-alt,\n.icon-share,\n.icon-rocket,\n.icon-question,\n.icon-pie-chart,\n.icon-pencil,\n.icon-note,\n.icon-loop,\n.icon-home,\n.icon-grid,\n.icon-graph,\n.icon-microphone,\n.icon-music-tone-alt,\n.icon-music-tone,\n.icon-earphones-alt,\n.icon-earphones,\n.icon-equalizer,\n.icon-like,\n.icon-dislike,\n.icon-control-start,\n.icon-control-rewind,\n.icon-control-play,\n.icon-control-pause,\n.icon-control-forward,\n.icon-control-end,\n.icon-volume-1,\n.icon-volume-2,\n.icon-volume-off,\n.icon-calendar,\n.icon-bulb,\n.icon-chart,\n.icon-ban,\n.icon-bubble,\n.icon-camrecorder,\n.icon-camera,\n.icon-cloud-download,\n.icon-cloud-upload,\n.icon-envelope,\n.icon-eye,\n.icon-flag,\n.icon-heart,\n.icon-info,\n.icon-key,\n.icon-link,\n.icon-lock,\n.icon-lock-open,\n.icon-magnifier,\n.icon-magnifier-add,\n.icon-magnifier-remove,\n.icon-paper-clip,\n.icon-paper-plane,\n.icon-power,\n.icon-refresh,\n.icon-reload,\n.icon-settings,\n.icon-star,\n.icon-symbol-female,\n.icon-symbol-male,\n.icon-target,\n.icon-credit-card,\n.icon-paypal,\n.icon-social-tumblr,\n.icon-social-twitter,\n.icon-social-facebook,\n.icon-social-instagram,\n.icon-social-linkedin,\n.icon-social-pinterest,\n.icon-social-github,\n.icon-social-google,\n.icon-social-reddit,\n.icon-social-skype,\n.icon-social-dribbble,\n.icon-social-behance,\n.icon-social-foursqare,\n.icon-social-soundcloud,\n.icon-social-spotify,\n.icon-social-stumbleupon,\n.icon-social-youtube,\n.icon-social-dropbox,\n.icon-social-vkontakte,\n.icon-social-steam {\n  font-family: 'simple-line-icons';\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-transform: none;\n  line-height: 1;\n  /* Better Font Rendering =========== */\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.icon-user:before {\n  content: \"\\e005\";\n}\n.icon-people:before {\n  content: \"\\e001\";\n}\n.icon-user-female:before {\n  content: \"\\e000\";\n}\n.icon-user-follow:before {\n  content: \"\\e002\";\n}\n.icon-user-following:before {\n  content: \"\\e003\";\n}\n.icon-user-unfollow:before {\n  content: \"\\e004\";\n}\n.icon-login:before {\n  content: \"\\e066\";\n}\n.icon-logout:before {\n  content: \"\\e065\";\n}\n.icon-emotsmile:before {\n  content: \"\\e021\";\n}\n.icon-phone:before {\n  content: \"\\e600\";\n}\n.icon-call-end:before {\n  content: \"\\e048\";\n}\n.icon-call-in:before {\n  content: \"\\e047\";\n}\n.icon-call-out:before {\n  content: \"\\e046\";\n}\n.icon-map:before {\n  content: \"\\e033\";\n}\n.icon-location-pin:before {\n  content: \"\\e096\";\n}\n.icon-direction:before {\n  content: \"\\e042\";\n}\n.icon-directions:before {\n  content: \"\\e041\";\n}\n.icon-compass:before {\n  content: \"\\e045\";\n}\n.icon-layers:before {\n  content: \"\\e034\";\n}\n.icon-menu:before {\n  content: \"\\e601\";\n}\n.icon-list:before {\n  content: \"\\e067\";\n}\n.icon-options-vertical:before {\n  content: \"\\e602\";\n}\n.icon-options:before {\n  content: \"\\e603\";\n}\n.icon-arrow-down:before {\n  content: \"\\e604\";\n}\n.icon-arrow-left:before {\n  content: \"\\e605\";\n}\n.icon-arrow-right:before {\n  content: \"\\e606\";\n}\n.icon-arrow-up:before {\n  content: \"\\e607\";\n}\n.icon-arrow-up-circle:before {\n  content: \"\\e078\";\n}\n.icon-arrow-left-circle:before {\n  content: \"\\e07a\";\n}\n.icon-arrow-right-circle:before {\n  content: \"\\e079\";\n}\n.icon-arrow-down-circle:before {\n  content: \"\\e07b\";\n}\n.icon-check:before {\n  content: \"\\e080\";\n}\n.icon-clock:before {\n  content: \"\\e081\";\n}\n.icon-plus:before {\n  content: \"\\e095\";\n}\n.icon-minus:before {\n  content: \"\\e615\";\n}\n.icon-close:before {\n  content: \"\\e082\";\n}\n.icon-event:before {\n  content: \"\\e619\";\n}\n.icon-exclamation:before {\n  content: \"\\e617\";\n}\n.icon-organization:before {\n  content: \"\\e616\";\n}\n.icon-trophy:before {\n  content: \"\\e006\";\n}\n.icon-screen-smartphone:before {\n  content: \"\\e010\";\n}\n.icon-screen-desktop:before {\n  content: \"\\e011\";\n}\n.icon-plane:before {\n  content: \"\\e012\";\n}\n.icon-notebook:before {\n  content: \"\\e013\";\n}\n.icon-mustache:before {\n  content: \"\\e014\";\n}\n.icon-mouse:before {\n  content: \"\\e015\";\n}\n.icon-magnet:before {\n  content: \"\\e016\";\n}\n.icon-energy:before {\n  content: \"\\e020\";\n}\n.icon-disc:before {\n  content: \"\\e022\";\n}\n.icon-cursor:before {\n  content: \"\\e06e\";\n}\n.icon-cursor-move:before {\n  content: \"\\e023\";\n}\n.icon-crop:before {\n  content: \"\\e024\";\n}\n.icon-chemistry:before {\n  content: \"\\e026\";\n}\n.icon-speedometer:before {\n  content: \"\\e007\";\n}\n.icon-shield:before {\n  content: \"\\e00e\";\n}\n.icon-screen-tablet:before {\n  content: \"\\e00f\";\n}\n.icon-magic-wand:before {\n  content: \"\\e017\";\n}\n.icon-hourglass:before {\n  content: \"\\e018\";\n}\n.icon-graduation:before {\n  content: \"\\e019\";\n}\n.icon-ghost:before {\n  content: \"\\e01a\";\n}\n.icon-game-controller:before {\n  content: \"\\e01b\";\n}\n.icon-fire:before {\n  content: \"\\e01c\";\n}\n.icon-eyeglass:before {\n  content: \"\\e01d\";\n}\n.icon-envelope-open:before {\n  content: \"\\e01e\";\n}\n.icon-envelope-letter:before {\n  content: \"\\e01f\";\n}\n.icon-bell:before {\n  content: \"\\e027\";\n}\n.icon-badge:before {\n  content: \"\\e028\";\n}\n.icon-anchor:before {\n  content: \"\\e029\";\n}\n.icon-wallet:before {\n  content: \"\\e02a\";\n}\n.icon-vector:before {\n  content: \"\\e02b\";\n}\n.icon-speech:before {\n  content: \"\\e02c\";\n}\n.icon-puzzle:before {\n  content: \"\\e02d\";\n}\n.icon-printer:before {\n  content: \"\\e02e\";\n}\n.icon-present:before {\n  content: \"\\e02f\";\n}\n.icon-playlist:before {\n  content: \"\\e030\";\n}\n.icon-pin:before {\n  content: \"\\e031\";\n}\n.icon-picture:before {\n  content: \"\\e032\";\n}\n.icon-handbag:before {\n  content: \"\\e035\";\n}\n.icon-globe-alt:before {\n  content: \"\\e036\";\n}\n.icon-globe:before {\n  content: \"\\e037\";\n}\n.icon-folder-alt:before {\n  content: \"\\e039\";\n}\n.icon-folder:before {\n  content: \"\\e089\";\n}\n.icon-film:before {\n  content: \"\\e03a\";\n}\n.icon-feed:before {\n  content: \"\\e03b\";\n}\n.icon-drop:before {\n  content: \"\\e03e\";\n}\n.icon-drawer:before {\n  content: \"\\e03f\";\n}\n.icon-docs:before {\n  content: \"\\e040\";\n}\n.icon-doc:before {\n  content: \"\\e085\";\n}\n.icon-diamond:before {\n  content: \"\\e043\";\n}\n.icon-cup:before {\n  content: \"\\e044\";\n}\n.icon-calculator:before {\n  content: \"\\e049\";\n}\n.icon-bubbles:before {\n  content: \"\\e04a\";\n}\n.icon-briefcase:before {\n  content: \"\\e04b\";\n}\n.icon-book-open:before {\n  content: \"\\e04c\";\n}\n.icon-basket-loaded:before {\n  content: \"\\e04d\";\n}\n.icon-basket:before {\n  content: \"\\e04e\";\n}\n.icon-bag:before {\n  content: \"\\e04f\";\n}\n.icon-action-undo:before {\n  content: \"\\e050\";\n}\n.icon-action-redo:before {\n  content: \"\\e051\";\n}\n.icon-wrench:before {\n  content: \"\\e052\";\n}\n.icon-umbrella:before {\n  content: \"\\e053\";\n}\n.icon-trash:before {\n  content: \"\\e054\";\n}\n.icon-tag:before {\n  content: \"\\e055\";\n}\n.icon-support:before {\n  content: \"\\e056\";\n}\n.icon-frame:before {\n  content: \"\\e038\";\n}\n.icon-size-fullscreen:before {\n  content: \"\\e057\";\n}\n.icon-size-actual:before {\n  content: \"\\e058\";\n}\n.icon-shuffle:before {\n  content: \"\\e059\";\n}\n.icon-share-alt:before {\n  content: \"\\e05a\";\n}\n.icon-share:before {\n  content: \"\\e05b\";\n}\n.icon-rocket:before {\n  content: \"\\e05c\";\n}\n.icon-question:before {\n  content: \"\\e05d\";\n}\n.icon-pie-chart:before {\n  content: \"\\e05e\";\n}\n.icon-pencil:before {\n  content: \"\\e05f\";\n}\n.icon-note:before {\n  content: \"\\e060\";\n}\n.icon-loop:before {\n  content: \"\\e064\";\n}\n.icon-home:before {\n  content: \"\\e069\";\n}\n.icon-grid:before {\n  content: \"\\e06a\";\n}\n.icon-graph:before {\n  content: \"\\e06b\";\n}\n.icon-microphone:before {\n  content: \"\\e063\";\n}\n.icon-music-tone-alt:before {\n  content: \"\\e061\";\n}\n.icon-music-tone:before {\n  content: \"\\e062\";\n}\n.icon-earphones-alt:before {\n  content: \"\\e03c\";\n}\n.icon-earphones:before {\n  content: \"\\e03d\";\n}\n.icon-equalizer:before {\n  content: \"\\e06c\";\n}\n.icon-like:before {\n  content: \"\\e068\";\n}\n.icon-dislike:before {\n  content: \"\\e06d\";\n}\n.icon-control-start:before {\n  content: \"\\e06f\";\n}\n.icon-control-rewind:before {\n  content: \"\\e070\";\n}\n.icon-control-play:before {\n  content: \"\\e071\";\n}\n.icon-control-pause:before {\n  content: \"\\e072\";\n}\n.icon-control-forward:before {\n  content: \"\\e073\";\n}\n.icon-control-end:before {\n  content: \"\\e074\";\n}\n.icon-volume-1:before {\n  content: \"\\e09f\";\n}\n.icon-volume-2:before {\n  content: \"\\e0a0\";\n}\n.icon-volume-off:before {\n  content: \"\\e0a1\";\n}\n.icon-calendar:before {\n  content: \"\\e075\";\n}\n.icon-bulb:before {\n  content: \"\\e076\";\n}\n.icon-chart:before {\n  content: \"\\e077\";\n}\n.icon-ban:before {\n  content: \"\\e07c\";\n}\n.icon-bubble:before {\n  content: \"\\e07d\";\n}\n.icon-camrecorder:before {\n  content: \"\\e07e\";\n}\n.icon-camera:before {\n  content: \"\\e07f\";\n}\n.icon-cloud-download:before {\n  content: \"\\e083\";\n}\n.icon-cloud-upload:before {\n  content: \"\\e084\";\n}\n.icon-envelope:before {\n  content: \"\\e086\";\n}\n.icon-eye:before {\n  content: \"\\e087\";\n}\n.icon-flag:before {\n  content: \"\\e088\";\n}\n.icon-heart:before {\n  content: \"\\e08a\";\n}\n.icon-info:before {\n  content: \"\\e08b\";\n}\n.icon-key:before {\n  content: \"\\e08c\";\n}\n.icon-link:before {\n  content: \"\\e08d\";\n}\n.icon-lock:before {\n  content: \"\\e08e\";\n}\n.icon-lock-open:before {\n  content: \"\\e08f\";\n}\n.icon-magnifier:before {\n  content: \"\\e090\";\n}\n.icon-magnifier-add:before {\n  content: \"\\e091\";\n}\n.icon-magnifier-remove:before {\n  content: \"\\e092\";\n}\n.icon-paper-clip:before {\n  content: \"\\e093\";\n}\n.icon-paper-plane:before {\n  content: \"\\e094\";\n}\n.icon-power:before {\n  content: \"\\e097\";\n}\n.icon-refresh:before {\n  content: \"\\e098\";\n}\n.icon-reload:before {\n  content: \"\\e099\";\n}\n.icon-settings:before {\n  content: \"\\e09a\";\n}\n.icon-star:before {\n  content: \"\\e09b\";\n}\n.icon-symbol-female:before {\n  content: \"\\e09c\";\n}\n.icon-symbol-male:before {\n  content: \"\\e09d\";\n}\n.icon-target:before {\n  content: \"\\e09e\";\n}\n.icon-credit-card:before {\n  content: \"\\e025\";\n}\n.icon-paypal:before {\n  content: \"\\e608\";\n}\n.icon-social-tumblr:before {\n  content: \"\\e00a\";\n}\n.icon-social-twitter:before {\n  content: \"\\e009\";\n}\n.icon-social-facebook:before {\n  content: \"\\e00b\";\n}\n.icon-social-instagram:before {\n  content: \"\\e609\";\n}\n.icon-social-linkedin:before {\n  content: \"\\e60a\";\n}\n.icon-social-pinterest:before {\n  content: \"\\e60b\";\n}\n.icon-social-github:before {\n  content: \"\\e60c\";\n}\n.icon-social-google:before {\n  content: \"\\e60d\";\n}\n.icon-social-reddit:before {\n  content: \"\\e60e\";\n}\n.icon-social-skype:before {\n  content: \"\\e60f\";\n}\n.icon-social-dribbble:before {\n  content: \"\\e00d\";\n}\n.icon-social-behance:before {\n  content: \"\\e610\";\n}\n.icon-social-foursqare:before {\n  content: \"\\e611\";\n}\n.icon-social-soundcloud:before {\n  content: \"\\e612\";\n}\n.icon-social-spotify:before {\n  content: \"\\e613\";\n}\n.icon-social-stumbleupon:before {\n  content: \"\\e614\";\n}\n.icon-social-youtube:before {\n  content: \"\\e008\";\n}\n.icon-social-dropbox:before {\n  content: \"\\e00c\";\n}\n.icon-social-vkontakte:before {\n  content: \"\\e618\";\n}\n.icon-social-steam:before {\n  content: \"\\e620\";\n}\n", ""]);

/***/ }),

/***/ 304:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)();
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Montserrat);", ""]);
exports.push([module.i, "\n@charset \"UTF-8\";\n/**\n * CoreUI - Open Source Bootstrap Admin Template\n * @version v1.0.0-alpha.6\n * @link http://coreui.io\n * Copyright (c) 2017 creativeLabs Łukasz Holeczek\n * @license MIT\n */\n/*!\n * Bootstrap v4.0.0-beta (https://getbootstrap.com)\n * Copyright 2011-2017 The Bootstrap Authors\n * Copyright 2011-2017 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n\n@media print {\n*,\n  *::before,\n  *::after {\n    text-shadow: none !important;\n    box-shadow: none !important;\n}\na,\n  a:visited {\n    text-decoration: underline;\n}\nabbr[title]::after {\n    content: \" (\" attr(title) \")\";\n}\npre {\n    white-space: pre-wrap !important;\n}\npre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid;\n}\nthead {\n    display: table-header-group;\n}\ntr,\n  img {\n    page-break-inside: avoid;\n}\np,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n}\nh2,\n  h3 {\n    page-break-after: avoid;\n}\n.navbar {\n    display: none;\n}\n.badge {\n    border: 1px solid #000;\n}\n.table {\n    border-collapse: collapse !important;\n}\n.table td,\n    .table th {\n      background-color: #fff !important;\n}\n.table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important;\n}\n}\nhtml {\n  box-sizing: border-box;\n  font-family: sans-serif;\n  line-height: 1.15;\n  -webkit-text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%;\n  -ms-overflow-style: scrollbar;\n  -webkit-tap-highlight-color: transparent;\n}\n*,\n*::before,\n*::after {\n  box-sizing: inherit;\n}\n@-ms-viewport {\n  width: device-width;\n}\narticle, aside, dialog, figcaption, figure, footer, header, hgroup, main, nav, section {\n  display: block;\n}\nbody {\n  margin: 0;\n  font-family: \"Montserrat\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 0.875rem;\n  font-weight: normal;\n  line-height: 1.5;\n  color: #536a85;\n  background-color: #ffffff;\n}\n[tabindex=\"-1\"]:focus {\n  outline: none !important;\n}\nhr {\n  box-sizing: content-box;\n  height: 0;\n  overflow: visible;\n}\nh1, h2, h3, h4, h5, h6 {\n  margin-top: 0;\n  margin-bottom: .5rem;\n}\np {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nabbr[title],\nabbr[data-original-title] {\n  text-decoration: underline;\n  text-decoration: underline dotted;\n  cursor: help;\n  border-bottom: 0;\n}\naddress {\n  margin-bottom: 1rem;\n  font-style: normal;\n  line-height: inherit;\n}\nol,\nul,\ndl {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nol ol,\nul ul,\nol ul,\nul ol {\n  margin-bottom: 0;\n}\ndt {\n  font-weight: bold;\n}\ndd {\n  margin-bottom: .5rem;\n  margin-left: 0;\n}\nblockquote {\n  margin: 0 0 1rem;\n}\ndfn {\n  font-style: italic;\n}\nb,\nstrong {\n  font-weight: bolder;\n}\nsmall {\n  font-size: 80%;\n}\nsub,\nsup {\n  position: relative;\n  font-size: 75%;\n  line-height: 0;\n  vertical-align: baseline;\n}\nsub {\n  bottom: -.25em;\n}\nsup {\n  top: -.5em;\n}\na {\n  color: #20a8d8;\n  text-decoration: none;\n  background-color: transparent;\n  -webkit-text-decoration-skip: objects;\n}\na:hover {\n    color: #167495;\n    text-decoration: underline;\n}\na:not([href]):not([tabindex]) {\n  color: inherit;\n  text-decoration: none;\n}\na:not([href]):not([tabindex]):focus, a:not([href]):not([tabindex]):hover {\n    color: inherit;\n    text-decoration: none;\n}\na:not([href]):not([tabindex]):focus {\n    outline: 0;\n}\npre,\ncode,\nkbd,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\npre {\n  margin-top: 0;\n  margin-bottom: 1rem;\n  overflow: auto;\n}\nfigure {\n  margin: 0 0 1rem;\n}\nimg {\n  vertical-align: middle;\n  border-style: none;\n}\nsvg:not(:root) {\n  overflow: hidden;\n}\na,\narea,\nbutton,\n[role=\"button\"],\ninput,\nlabel,\nselect,\nsummary,\ntextarea {\n  -ms-touch-action: manipulation;\n      touch-action: manipulation;\n}\ntable {\n  border-collapse: collapse;\n}\ncaption {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  color: #536c79;\n  text-align: left;\n  caption-side: bottom;\n}\nth {\n  text-align: left;\n}\nlabel {\n  display: inline-block;\n  margin-bottom: .5rem;\n}\nbutton:focus {\n  outline: 1px dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n}\ninput,\nbutton,\nselect,\noptgroup,\ntextarea {\n  margin: 0;\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\nbutton,\ninput {\n  overflow: visible;\n}\nbutton,\nselect {\n  text-transform: none;\n}\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  padding: 0;\n  border-style: none;\n}\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  box-sizing: border-box;\n  padding: 0;\n}\ninput[type=\"date\"],\ninput[type=\"time\"],\ninput[type=\"datetime-local\"],\ninput[type=\"month\"] {\n  -webkit-appearance: listbox;\n}\ntextarea {\n  overflow: auto;\n  resize: vertical;\n}\nfieldset {\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\nlegend {\n  display: block;\n  width: 100%;\n  max-width: 100%;\n  padding: 0;\n  margin-bottom: .5rem;\n  font-size: 1.5rem;\n  line-height: inherit;\n  color: inherit;\n  white-space: normal;\n}\nprogress {\n  vertical-align: baseline;\n}\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n[type=\"search\"] {\n  outline-offset: -2px;\n  -webkit-appearance: none;\n}\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n::-webkit-file-upload-button {\n  font: inherit;\n  -webkit-appearance: button;\n}\noutput {\n  display: inline-block;\n}\nsummary {\n  display: list-item;\n}\ntemplate {\n  display: none;\n}\n[hidden] {\n  display: none !important;\n}\nh1, h2, h3, h4, h5, h6,\n.h1, .h2, .h3, .h4, .h5, .h6 {\n  margin-bottom: 0.5rem;\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1.1;\n  color: inherit;\n}\nh1, .h1 {\n  font-size: 2.5rem;\n}\nh2, .h2 {\n  font-size: 2rem;\n}\nh3, .h3 {\n  font-size: 1.75rem;\n}\nh4, .h4 {\n  font-size: 1.5rem;\n}\nh5, .h5 {\n  font-size: 1.25rem;\n}\nh6, .h6 {\n  font-size: 1rem;\n}\n.lead {\n  font-size: 1.25rem;\n  font-weight: 300;\n}\n.display-1 {\n  font-size: 6rem;\n  font-weight: 300;\n  line-height: 1.1;\n}\n.display-2 {\n  font-size: 5.5rem;\n  font-weight: 300;\n  line-height: 1.1;\n}\n.display-3 {\n  font-size: 4.5rem;\n  font-weight: 300;\n  line-height: 1.1;\n}\n.display-4 {\n  font-size: 3.5rem;\n  font-weight: 300;\n  line-height: 1.1;\n}\nhr {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  border: 0;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n}\nsmall,\n.small {\n  font-size: 80%;\n  font-weight: normal;\n}\nmark,\n.mark {\n  padding: 0.2em;\n  background-color: #fcf8e3;\n}\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline-item {\n  display: inline-block;\n}\n.list-inline-item:not(:last-child) {\n    margin-right: 5px;\n}\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\n.blockquote {\n  margin-bottom: 1rem;\n  font-size: 1.09375rem;\n}\n.blockquote-footer {\n  display: block;\n  font-size: 80%;\n  color: #536c79;\n}\n.blockquote-footer::before {\n    content: \"\\2014 \\00A0\";\n}\n.img-fluid {\n  max-width: 100%;\n  height: auto;\n}\n.img-thumbnail {\n  padding: 0.25rem;\n  background-color: #ffffff;\n  border: 1px solid #ddd;\n  transition: all 0.2s ease-in-out;\n  max-width: 100%;\n  height: auto;\n}\n.figure {\n  display: inline-block;\n}\n.figure-img {\n  margin-bottom: 0.5rem;\n  line-height: 1;\n}\n.figure-caption {\n  font-size: 90%;\n  color: #536c79;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: \"Montserrat\", Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\ncode {\n  padding: 0.2rem 0.4rem;\n  font-size: 90%;\n  color: #bd4147;\n  background-color: #f0f3f5;\n}\na > code {\n    padding: 0;\n    color: inherit;\n    background-color: inherit;\n}\nkbd {\n  padding: 0.2rem 0.4rem;\n  font-size: 90%;\n  color: #fff;\n  background-color: #151b1e;\n}\nkbd kbd {\n    padding: 0;\n    font-size: 100%;\n    font-weight: bold;\n}\npre {\n  display: block;\n  margin-top: 0;\n  margin-bottom: 1rem;\n  font-size: 90%;\n  color: #151b1e;\n}\npre code {\n    padding: 0;\n    font-size: inherit;\n    color: inherit;\n    background-color: transparent;\n    border-radius: 0;\n}\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n.container {\n  margin-right: auto;\n  margin-left: auto;\n  padding-right: 15px;\n  padding-left: 15px;\n  width: 100%;\n}\n@media (min-width: 576px) {\n.container {\n      max-width: 540px;\n}\n}\n@media (min-width: 768px) {\n.container {\n      max-width: 720px;\n}\n}\n@media (min-width: 992px) {\n.container {\n      max-width: 960px;\n}\n}\n@media (min-width: 1200px) {\n.container {\n      max-width: 1140px;\n}\n}\n.container-fluid {\n  width: 100%;\n  margin-right: auto;\n  margin-left: auto;\n  padding-right: 15px;\n  padding-left: 15px;\n  width: 100%;\n}\n.row {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  margin-right: -15px;\n  margin-left: -15px;\n}\n.no-gutters {\n  margin-right: 0;\n  margin-left: 0;\n}\n.no-gutters > .col,\n  .no-gutters > [class*=\"col-\"] {\n    padding-right: 0;\n    padding-left: 0;\n}\n.col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, .col,\n.col-auto, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm,\n.col-sm-auto, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, .col-md,\n.col-md-auto, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg,\n.col-lg-auto, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl,\n.col-xl-auto {\n  position: relative;\n  width: 100%;\n  min-height: 1px;\n  padding-right: 15px;\n  padding-left: 15px;\n}\n.col {\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  max-width: 100%;\n}\n.col-auto {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  width: auto;\n  max-width: none;\n}\n.col-1 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 8.33333%;\n          flex: 0 0 8.33333%;\n  max-width: 8.33333%;\n}\n.col-2 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 16.66667%;\n          flex: 0 0 16.66667%;\n  max-width: 16.66667%;\n}\n.col-3 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 25%;\n          flex: 0 0 25%;\n  max-width: 25%;\n}\n.col-4 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 33.33333%;\n          flex: 0 0 33.33333%;\n  max-width: 33.33333%;\n}\n.col-5 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 41.66667%;\n          flex: 0 0 41.66667%;\n  max-width: 41.66667%;\n}\n.col-6 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 50%;\n          flex: 0 0 50%;\n  max-width: 50%;\n}\n.col-7 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 58.33333%;\n          flex: 0 0 58.33333%;\n  max-width: 58.33333%;\n}\n.col-8 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 66.66667%;\n          flex: 0 0 66.66667%;\n  max-width: 66.66667%;\n}\n.col-9 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 75%;\n          flex: 0 0 75%;\n  max-width: 75%;\n}\n.col-10 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 83.33333%;\n          flex: 0 0 83.33333%;\n  max-width: 83.33333%;\n}\n.col-11 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 91.66667%;\n          flex: 0 0 91.66667%;\n  max-width: 91.66667%;\n}\n.col-12 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  max-width: 100%;\n}\n.order-1 {\n  -webkit-box-ordinal-group: 2;\n      -ms-flex-order: 1;\n          order: 1;\n}\n.order-2 {\n  -webkit-box-ordinal-group: 3;\n      -ms-flex-order: 2;\n          order: 2;\n}\n.order-3 {\n  -webkit-box-ordinal-group: 4;\n      -ms-flex-order: 3;\n          order: 3;\n}\n.order-4 {\n  -webkit-box-ordinal-group: 5;\n      -ms-flex-order: 4;\n          order: 4;\n}\n.order-5 {\n  -webkit-box-ordinal-group: 6;\n      -ms-flex-order: 5;\n          order: 5;\n}\n.order-6 {\n  -webkit-box-ordinal-group: 7;\n      -ms-flex-order: 6;\n          order: 6;\n}\n.order-7 {\n  -webkit-box-ordinal-group: 8;\n      -ms-flex-order: 7;\n          order: 7;\n}\n.order-8 {\n  -webkit-box-ordinal-group: 9;\n      -ms-flex-order: 8;\n          order: 8;\n}\n.order-9 {\n  -webkit-box-ordinal-group: 10;\n      -ms-flex-order: 9;\n          order: 9;\n}\n.order-10 {\n  -webkit-box-ordinal-group: 11;\n      -ms-flex-order: 10;\n          order: 10;\n}\n.order-11 {\n  -webkit-box-ordinal-group: 12;\n      -ms-flex-order: 11;\n          order: 11;\n}\n.order-12 {\n  -webkit-box-ordinal-group: 13;\n      -ms-flex-order: 12;\n          order: 12;\n}\n@media (min-width: 576px) {\n.col-sm {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-sm-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-sm-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-sm-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-sm-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-sm-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-sm-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-sm-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-sm-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-sm-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-sm-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-sm-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-sm-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-sm-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-sm-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-sm-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-sm-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-sm-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-sm-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-sm-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-sm-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-sm-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-sm-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-sm-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-sm-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-sm-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n}\n@media (min-width: 768px) {\n.col-md {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-md-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-md-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-md-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-md-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-md-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-md-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-md-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-md-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-md-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-md-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-md-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-md-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-md-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-md-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-md-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-md-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-md-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-md-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-md-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-md-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-md-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-md-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-md-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-md-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-md-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n}\n@media (min-width: 992px) {\n.col-lg {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-lg-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-lg-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-lg-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-lg-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-lg-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-lg-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-lg-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-lg-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-lg-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-lg-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-lg-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-lg-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-lg-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-lg-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-lg-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-lg-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-lg-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-lg-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-lg-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-lg-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-lg-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-lg-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-lg-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-lg-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-lg-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n}\n@media (min-width: 1200px) {\n.col-xl {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-xl-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-xl-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-xl-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-xl-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-xl-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-xl-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-xl-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-xl-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-xl-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-xl-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-xl-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-xl-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-xl-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-xl-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-xl-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-xl-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-xl-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-xl-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-xl-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-xl-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-xl-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-xl-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-xl-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-xl-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-xl-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n}\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 1rem;\n  background-color: transparent;\n}\n.table th,\n  .table td {\n    padding: 0.75rem;\n    vertical-align: top;\n    border-top: 1px solid #c2cfd6;\n}\n.table thead th {\n    vertical-align: bottom;\n    border-bottom: 2px solid #c2cfd6;\n}\n.table tbody + tbody {\n    border-top: 2px solid #c2cfd6;\n}\n.table .table {\n    background-color: #ffffff;\n}\n.table-sm th,\n.table-sm td {\n  padding: 0.3rem;\n}\n.table-bordered {\n  border: 1px solid #c2cfd6;\n}\n.table-bordered th,\n  .table-bordered td {\n    border: 1px solid #c2cfd6;\n}\n.table-bordered thead th,\n  .table-bordered thead td {\n    border-bottom-width: 2px;\n}\n.table-striped tbody tr:nth-of-type(odd) {\n  background-color: rgba(0, 0, 0, 0.05);\n}\n.table-hover tbody tr:hover {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-primary,\n.table-primary > th,\n.table-primary > td {\n  background-color: #c1e7f4;\n}\n.table-hover .table-primary:hover {\n  background-color: #abdff0;\n}\n.table-hover .table-primary:hover > td,\n  .table-hover .table-primary:hover > th {\n    background-color: #abdff0;\n}\n.table-secondary,\n.table-secondary > th,\n.table-secondary > td {\n  background-color: #e6ebee;\n}\n.table-hover .table-secondary:hover {\n  background-color: #d7dfe4;\n}\n.table-hover .table-secondary:hover > td,\n  .table-hover .table-secondary:hover > th {\n    background-color: #d7dfe4;\n}\n.table-success,\n.table-success > th,\n.table-success > td {\n  background-color: #cdedd8;\n}\n.table-hover .table-success:hover {\n  background-color: #bae6c9;\n}\n.table-hover .table-success:hover > td,\n  .table-hover .table-success:hover > th {\n    background-color: #bae6c9;\n}\n.table-info,\n.table-info > th,\n.table-info > td {\n  background-color: #d3eef6;\n}\n.table-hover .table-info:hover {\n  background-color: #bee6f2;\n}\n.table-hover .table-info:hover > td,\n  .table-hover .table-info:hover > th {\n    background-color: #bee6f2;\n}\n.table-warning,\n.table-warning > th,\n.table-warning > td {\n  background-color: #ffeeba;\n}\n.table-hover .table-warning:hover {\n  background-color: #ffe8a1;\n}\n.table-hover .table-warning:hover > td,\n  .table-hover .table-warning:hover > th {\n    background-color: #ffe8a1;\n}\n.table-danger,\n.table-danger > th,\n.table-danger > td {\n  background-color: #fdd6d6;\n}\n.table-hover .table-danger:hover {\n  background-color: #fcbebe;\n}\n.table-hover .table-danger:hover > td,\n  .table-hover .table-danger:hover > th {\n    background-color: #fcbebe;\n}\n.table-light,\n.table-light > th,\n.table-light > td {\n  background-color: #fbfcfc;\n}\n.table-hover .table-light:hover {\n  background-color: #ecf1f1;\n}\n.table-hover .table-light:hover > td,\n  .table-hover .table-light:hover > th {\n    background-color: #ecf1f1;\n}\n.table-dark,\n.table-dark > th,\n.table-dark > td {\n  background-color: #c3c7c9;\n}\n.table-hover .table-dark:hover {\n  background-color: #b6babd;\n}\n.table-hover .table-dark:hover > td,\n  .table-hover .table-dark:hover > th {\n    background-color: #b6babd;\n}\n.table-active,\n.table-active > th,\n.table-active > td {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-hover .table-active:hover {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-hover .table-active:hover > td,\n  .table-hover .table-active:hover > th {\n    background-color: rgba(0, 0, 0, 0.075);\n}\n.thead-inverse th {\n  color: #ffffff;\n  background-color: #151b1e;\n}\n.thead-default th {\n  color: #3e515b;\n  background-color: #c2cfd6;\n}\n.table-inverse {\n  color: #ffffff;\n  background-color: #151b1e;\n}\n.table-inverse th,\n  .table-inverse td,\n  .table-inverse thead th {\n    border-color: #252f35;\n}\n.table-inverse.table-bordered {\n    border: 0;\n}\n.table-inverse.table-striped tbody tr:nth-of-type(odd) {\n    background-color: rgba(255, 255, 255, 0.05);\n}\n.table-inverse.table-hover tbody tr:hover {\n    background-color: rgba(255, 255, 255, 0.075);\n}\n@media (max-width: 991px) {\n.table-responsive {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive.table-bordered {\n      border: 0;\n}\n}\n.form-control {\n  display: block;\n  width: 100%;\n  padding: 0.5rem 0.75rem;\n  font-size: 0.875rem;\n  line-height: 1.25;\n  color: #3e515b;\n  background-color: #fff;\n  background-image: none;\n  background-clip: padding-box;\n  border: 1px solid #c2cfd6;\n  border-radius: 0;\n  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;\n}\n.form-control::-ms-expand {\n    background-color: transparent;\n    border: 0;\n}\n.form-control:focus {\n    color: #3e515b;\n    background-color: #fff;\n    border-color: #8ad4ee;\n    outline: none;\n}\n.form-control::-webkit-input-placeholder {\n    color: #536c79;\n    opacity: 1;\n}\n.form-control:-ms-input-placeholder {\n    color: #536c79;\n    opacity: 1;\n}\n.form-control::placeholder {\n    color: #536c79;\n    opacity: 1;\n}\n.form-control:disabled, .form-control[readonly] {\n    background-color: #c2cfd6;\n    opacity: 1;\n}\nselect.form-control:not([size]):not([multiple]) {\n  height: calc(2.09375rem + 2px);\n}\nselect.form-control:focus::-ms-value {\n  color: #3e515b;\n  background-color: #fff;\n}\n.form-control-file,\n.form-control-range {\n  display: block;\n}\n.col-form-label {\n  padding-top: calc(0.5rem - 1px * 2);\n  padding-bottom: calc(0.5rem - 1px * 2);\n  margin-bottom: 0;\n}\n.col-form-label-lg {\n  padding-top: calc(0.5rem - 1px * 2);\n  padding-bottom: calc(0.5rem - 1px * 2);\n  font-size: 1.25rem;\n}\n.col-form-label-sm {\n  padding-top: calc(0.25rem - 1px * 2);\n  padding-bottom: calc(0.25rem - 1px * 2);\n  font-size: 0.875rem;\n}\n.col-form-legend {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n}\n.form-control-plaintext {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  margin-bottom: 0;\n  line-height: 1.25;\n  border: solid transparent;\n  border-width: 1px 0;\n}\n.form-control-plaintext.form-control-sm, .input-group-sm > .form-control-plaintext.form-control,\n  .input-group-sm > .form-control-plaintext.input-group-addon,\n  .input-group-sm > .input-group-btn > .form-control-plaintext.btn, .form-control-plaintext.form-control-lg, .input-group-lg > .form-control-plaintext.form-control,\n  .input-group-lg > .form-control-plaintext.input-group-addon,\n  .input-group-lg > .input-group-btn > .form-control-plaintext.btn {\n    padding-right: 0;\n    padding-left: 0;\n}\n.form-control-sm, .input-group-sm > .form-control,\n.input-group-sm > .input-group-addon,\n.input-group-sm > .input-group-btn > .btn {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\nselect.form-control-sm:not([size]):not([multiple]), .input-group-sm > select.form-control:not([size]):not([multiple]),\n.input-group-sm > select.input-group-addon:not([size]):not([multiple]),\n.input-group-sm > .input-group-btn > select.btn:not([size]):not([multiple]) {\n  height: calc(1.8125rem + 2px);\n}\n.form-control-lg, .input-group-lg > .form-control,\n.input-group-lg > .input-group-addon,\n.input-group-lg > .input-group-btn > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\nselect.form-control-lg:not([size]):not([multiple]), .input-group-lg > select.form-control:not([size]):not([multiple]),\n.input-group-lg > select.input-group-addon:not([size]):not([multiple]),\n.input-group-lg > .input-group-btn > select.btn:not([size]):not([multiple]) {\n  height: calc(2.3125rem + 2px);\n}\n.form-group {\n  margin-bottom: 1rem;\n}\n.form-text {\n  display: block;\n  margin-top: 0.25rem;\n}\n.form-row {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  margin-right: -5px;\n  margin-left: -5px;\n}\n.form-row > .col,\n  .form-row > [class*=\"col-\"] {\n    padding-right: 5px;\n    padding-left: 5px;\n}\n.form-check {\n  position: relative;\n  display: block;\n  margin-bottom: 0.5rem;\n}\n.form-check.disabled .form-check-label {\n    color: #536c79;\n}\n.form-check-label {\n  padding-left: 1.25rem;\n  margin-bottom: 0;\n}\n.form-check-input {\n  position: absolute;\n  margin-top: 0.25rem;\n  margin-left: -1.25rem;\n}\n.form-check-input:only-child {\n    position: static;\n}\n.form-check-inline {\n  display: inline-block;\n}\n.form-check-inline .form-check-label {\n    vertical-align: middle;\n}\n.form-check-inline + .form-check-inline {\n    margin-left: 0.75rem;\n}\n.invalid-feedback {\n  display: none;\n  margin-top: .25rem;\n  font-size: .875rem;\n  color: #f86c6b;\n}\n.invalid-tooltip {\n  position: absolute;\n  top: 100%;\n  z-index: 5;\n  display: none;\n  width: 250px;\n  padding: .5rem;\n  margin-top: .1rem;\n  font-size: .875rem;\n  line-height: 1;\n  color: #fff;\n  background-color: rgba(248, 108, 107, 0.8);\n  border-radius: .2rem;\n}\n.was-validated .form-control:valid, .form-control.is-valid, .was-validated\n.custom-select:valid,\n.custom-select.is-valid {\n  border-color: #4dbd74;\n}\n.was-validated .form-control:valid:focus, .form-control.is-valid:focus, .was-validated\n  .custom-select:valid:focus,\n  .custom-select.is-valid:focus {\n    box-shadow: 0 0 0 0.2rem rgba(77, 189, 116, 0.25);\n}\n.was-validated .form-control:valid ~ .invalid-feedback,\n  .was-validated .form-control:valid ~ .invalid-tooltip, .form-control.is-valid ~ .invalid-feedback,\n  .form-control.is-valid ~ .invalid-tooltip, .was-validated\n  .custom-select:valid ~ .invalid-feedback,\n  .was-validated\n  .custom-select:valid ~ .invalid-tooltip,\n  .custom-select.is-valid ~ .invalid-feedback,\n  .custom-select.is-valid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .form-check-input:valid + .form-check-label, .form-check-input.is-valid + .form-check-label {\n  color: #4dbd74;\n}\n.was-validated .custom-control-input:valid ~ .custom-control-indicator, .custom-control-input.is-valid ~ .custom-control-indicator {\n  background-color: rgba(77, 189, 116, 0.25);\n}\n.was-validated .custom-control-input:valid ~ .custom-control-description, .custom-control-input.is-valid ~ .custom-control-description {\n  color: #4dbd74;\n}\n.was-validated .custom-file-input:valid ~ .custom-file-control, .custom-file-input.is-valid ~ .custom-file-control {\n  border-color: #4dbd74;\n}\n.was-validated .custom-file-input:valid ~ .custom-file-control::before, .custom-file-input.is-valid ~ .custom-file-control::before {\n    border-color: inherit;\n}\n.was-validated .custom-file-input:valid:focus, .custom-file-input.is-valid:focus {\n  box-shadow: 0 0 0 0.2rem rgba(77, 189, 116, 0.25);\n}\n.was-validated .form-control:invalid, .form-control.is-invalid, .was-validated\n.custom-select:invalid,\n.custom-select.is-invalid {\n  border-color: #f86c6b;\n}\n.was-validated .form-control:invalid:focus, .form-control.is-invalid:focus, .was-validated\n  .custom-select:invalid:focus,\n  .custom-select.is-invalid:focus {\n    box-shadow: 0 0 0 0.2rem rgba(248, 108, 107, 0.25);\n}\n.was-validated .form-control:invalid ~ .invalid-feedback,\n  .was-validated .form-control:invalid ~ .invalid-tooltip, .form-control.is-invalid ~ .invalid-feedback,\n  .form-control.is-invalid ~ .invalid-tooltip, .was-validated\n  .custom-select:invalid ~ .invalid-feedback,\n  .was-validated\n  .custom-select:invalid ~ .invalid-tooltip,\n  .custom-select.is-invalid ~ .invalid-feedback,\n  .custom-select.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .form-check-input:invalid + .form-check-label, .form-check-input.is-invalid + .form-check-label {\n  color: #f86c6b;\n}\n.was-validated .custom-control-input:invalid ~ .custom-control-indicator, .custom-control-input.is-invalid ~ .custom-control-indicator {\n  background-color: rgba(248, 108, 107, 0.25);\n}\n.was-validated .custom-control-input:invalid ~ .custom-control-description, .custom-control-input.is-invalid ~ .custom-control-description {\n  color: #f86c6b;\n}\n.was-validated .custom-file-input:invalid ~ .custom-file-control, .custom-file-input.is-invalid ~ .custom-file-control {\n  border-color: #f86c6b;\n}\n.was-validated .custom-file-input:invalid ~ .custom-file-control::before, .custom-file-input.is-invalid ~ .custom-file-control::before {\n    border-color: inherit;\n}\n.was-validated .custom-file-input:invalid:focus, .custom-file-input.is-invalid:focus {\n  box-shadow: 0 0 0 0.2rem rgba(248, 108, 107, 0.25);\n}\n.form-inline {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-flow: row wrap;\n          flex-flow: row wrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.form-inline .form-check {\n    width: 100%;\n}\n@media (min-width: 576px) {\n.form-inline label {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      margin-bottom: 0;\n}\n.form-inline .form-group {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-flex: 0;\n          -ms-flex: 0 0 auto;\n              flex: 0 0 auto;\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-flow: row wrap;\n              flex-flow: row wrap;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      margin-bottom: 0;\n}\n.form-inline .form-control {\n      display: inline-block;\n      width: auto;\n      vertical-align: middle;\n}\n.form-inline .form-control-plaintext {\n      display: inline-block;\n}\n.form-inline .input-group {\n      width: auto;\n}\n.form-inline .form-control-label {\n      margin-bottom: 0;\n      vertical-align: middle;\n}\n.form-inline .form-check {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      width: auto;\n      margin-top: 0;\n      margin-bottom: 0;\n}\n.form-inline .form-check-label {\n      padding-left: 0;\n}\n.form-inline .form-check-input {\n      position: relative;\n      margin-top: 0;\n      margin-right: 0.25rem;\n      margin-left: 0;\n}\n.form-inline .custom-control {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      padding-left: 0;\n}\n.form-inline .custom-control-indicator {\n      position: static;\n      display: inline-block;\n      margin-right: 0.25rem;\n      vertical-align: text-bottom;\n}\n.form-inline .has-feedback .form-control-feedback {\n      top: 0;\n}\n}\n.btn {\n  display: inline-block;\n  font-weight: normal;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  border: 1px solid transparent;\n  padding: 0.5rem 0.75rem;\n  font-size: 0.875rem;\n  line-height: 1.25;\n  transition: all 0.15s ease-in-out;\n}\n.btn:focus, .btn:hover {\n    text-decoration: none;\n}\n.btn:focus, .btn.focus {\n    outline: 0;\n    box-shadow: 0 0 0 3px rgba(32, 168, 216, 0.25);\n}\n.btn.disabled, .btn:disabled {\n    opacity: .65;\n}\n.btn:active, .btn.active {\n    background-image: none;\n}\na.btn.disabled,\nfieldset[disabled] a.btn {\n  pointer-events: none;\n}\n.btn-primary {\n  color: #fff;\n  background-color: #20a8d8;\n  border-color: #20a8d8;\n}\n.btn-primary:hover {\n    color: #fff;\n    background-color: #1b8eb7;\n    border-color: #1985ac;\n}\n.btn-primary:focus, .btn-primary.focus {\n    box-shadow: 0 0 0 3px rgba(32, 168, 216, 0.5);\n}\n.btn-primary.disabled, .btn-primary:disabled {\n    background-color: #20a8d8;\n    border-color: #20a8d8;\n}\n.btn-primary:active, .btn-primary.active,\n  .show > .btn-primary.dropdown-toggle {\n    background-color: #1b8eb7;\n    background-image: none;\n    border-color: #1985ac;\n}\n.btn-secondary {\n  color: #111;\n  background-color: #a4b7c1;\n  border-color: #a4b7c1;\n}\n.btn-secondary:hover {\n    color: #111;\n    background-color: #8da5b2;\n    border-color: #869fac;\n}\n.btn-secondary:focus, .btn-secondary.focus {\n    box-shadow: 0 0 0 3px rgba(164, 183, 193, 0.5);\n}\n.btn-secondary.disabled, .btn-secondary:disabled {\n    background-color: #a4b7c1;\n    border-color: #a4b7c1;\n}\n.btn-secondary:active, .btn-secondary.active,\n  .show > .btn-secondary.dropdown-toggle {\n    background-color: #8da5b2;\n    background-image: none;\n    border-color: #869fac;\n}\n.btn-success {\n  color: #fff;\n  background-color: #4dbd74;\n  border-color: #4dbd74;\n}\n.btn-success:hover {\n    color: #fff;\n    background-color: #3ea662;\n    border-color: #3a9d5d;\n}\n.btn-success:focus, .btn-success.focus {\n    box-shadow: 0 0 0 3px rgba(77, 189, 116, 0.5);\n}\n.btn-success.disabled, .btn-success:disabled {\n    background-color: #4dbd74;\n    border-color: #4dbd74;\n}\n.btn-success:active, .btn-success.active,\n  .show > .btn-success.dropdown-toggle {\n    background-color: #3ea662;\n    background-image: none;\n    border-color: #3a9d5d;\n}\n.btn-info {\n  color: #111;\n  background-color: #63c2de;\n  border-color: #63c2de;\n}\n.btn-info:hover {\n    color: #111;\n    background-color: #43b6d7;\n    border-color: #39b2d5;\n}\n.btn-info:focus, .btn-info.focus {\n    box-shadow: 0 0 0 3px rgba(99, 194, 222, 0.5);\n}\n.btn-info.disabled, .btn-info:disabled {\n    background-color: #63c2de;\n    border-color: #63c2de;\n}\n.btn-info:active, .btn-info.active,\n  .show > .btn-info.dropdown-toggle {\n    background-color: #43b6d7;\n    background-image: none;\n    border-color: #39b2d5;\n}\n.btn-warning {\n  color: #111;\n  background-color: #ffc107;\n  border-color: #ffc107;\n}\n.btn-warning:hover {\n    color: #111;\n    background-color: #e0a800;\n    border-color: #d39e00;\n}\n.btn-warning:focus, .btn-warning.focus {\n    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.5);\n}\n.btn-warning.disabled, .btn-warning:disabled {\n    background-color: #ffc107;\n    border-color: #ffc107;\n}\n.btn-warning:active, .btn-warning.active,\n  .show > .btn-warning.dropdown-toggle {\n    background-color: #e0a800;\n    background-image: none;\n    border-color: #d39e00;\n}\n.btn-danger {\n  color: #fff;\n  background-color: #f86c6b;\n  border-color: #f86c6b;\n}\n.btn-danger:hover {\n    color: #fff;\n    background-color: #f64846;\n    border-color: #f63c3a;\n}\n.btn-danger:focus, .btn-danger.focus {\n    box-shadow: 0 0 0 3px rgba(248, 108, 107, 0.5);\n}\n.btn-danger.disabled, .btn-danger:disabled {\n    background-color: #f86c6b;\n    border-color: #f86c6b;\n}\n.btn-danger:active, .btn-danger.active,\n  .show > .btn-danger.dropdown-toggle {\n    background-color: #f64846;\n    background-image: none;\n    border-color: #f63c3a;\n}\n.btn-light {\n  color: #111;\n  background-color: #f0f3f5;\n  border-color: #f0f3f5;\n}\n.btn-light:hover {\n    color: #111;\n    background-color: #d9e1e6;\n    border-color: #d1dbe1;\n}\n.btn-light:focus, .btn-light.focus {\n    box-shadow: 0 0 0 3px rgba(240, 243, 245, 0.5);\n}\n.btn-light.disabled, .btn-light:disabled {\n    background-color: #f0f3f5;\n    border-color: #f0f3f5;\n}\n.btn-light:active, .btn-light.active,\n  .show > .btn-light.dropdown-toggle {\n    background-color: #d9e1e6;\n    background-image: none;\n    border-color: #d1dbe1;\n}\n.btn-dark {\n  color: #fff;\n  background-color: #29363d;\n  border-color: #29363d;\n}\n.btn-dark:hover {\n    color: #fff;\n    background-color: #1a2226;\n    border-color: #151b1f;\n}\n.btn-dark:focus, .btn-dark.focus {\n    box-shadow: 0 0 0 3px rgba(41, 54, 61, 0.5);\n}\n.btn-dark.disabled, .btn-dark:disabled {\n    background-color: #29363d;\n    border-color: #29363d;\n}\n.btn-dark:active, .btn-dark.active,\n  .show > .btn-dark.dropdown-toggle {\n    background-color: #1a2226;\n    background-image: none;\n    border-color: #151b1f;\n}\n.btn-outline-primary {\n  color: #20a8d8;\n  background-color: transparent;\n  background-image: none;\n  border-color: #20a8d8;\n}\n.btn-outline-primary:hover {\n    color: #fff;\n    background-color: #20a8d8;\n    border-color: #20a8d8;\n}\n.btn-outline-primary:focus, .btn-outline-primary.focus {\n    box-shadow: 0 0 0 3px rgba(32, 168, 216, 0.5);\n}\n.btn-outline-primary.disabled, .btn-outline-primary:disabled {\n    color: #20a8d8;\n    background-color: transparent;\n}\n.btn-outline-primary:active, .btn-outline-primary.active,\n  .show > .btn-outline-primary.dropdown-toggle {\n    color: #fff;\n    background-color: #20a8d8;\n    border-color: #20a8d8;\n}\n.btn-outline-secondary {\n  color: #a4b7c1;\n  background-color: transparent;\n  background-image: none;\n  border-color: #a4b7c1;\n}\n.btn-outline-secondary:hover {\n    color: #fff;\n    background-color: #a4b7c1;\n    border-color: #a4b7c1;\n}\n.btn-outline-secondary:focus, .btn-outline-secondary.focus {\n    box-shadow: 0 0 0 3px rgba(164, 183, 193, 0.5);\n}\n.btn-outline-secondary.disabled, .btn-outline-secondary:disabled {\n    color: #a4b7c1;\n    background-color: transparent;\n}\n.btn-outline-secondary:active, .btn-outline-secondary.active,\n  .show > .btn-outline-secondary.dropdown-toggle {\n    color: #fff;\n    background-color: #a4b7c1;\n    border-color: #a4b7c1;\n}\n.btn-outline-success {\n  color: #4dbd74;\n  background-color: transparent;\n  background-image: none;\n  border-color: #4dbd74;\n}\n.btn-outline-success:hover {\n    color: #fff;\n    background-color: #4dbd74;\n    border-color: #4dbd74;\n}\n.btn-outline-success:focus, .btn-outline-success.focus {\n    box-shadow: 0 0 0 3px rgba(77, 189, 116, 0.5);\n}\n.btn-outline-success.disabled, .btn-outline-success:disabled {\n    color: #4dbd74;\n    background-color: transparent;\n}\n.btn-outline-success:active, .btn-outline-success.active,\n  .show > .btn-outline-success.dropdown-toggle {\n    color: #fff;\n    background-color: #4dbd74;\n    border-color: #4dbd74;\n}\n.btn-outline-info {\n  color: #63c2de;\n  background-color: transparent;\n  background-image: none;\n  border-color: #63c2de;\n}\n.btn-outline-info:hover {\n    color: #fff;\n    background-color: #63c2de;\n    border-color: #63c2de;\n}\n.btn-outline-info:focus, .btn-outline-info.focus {\n    box-shadow: 0 0 0 3px rgba(99, 194, 222, 0.5);\n}\n.btn-outline-info.disabled, .btn-outline-info:disabled {\n    color: #63c2de;\n    background-color: transparent;\n}\n.btn-outline-info:active, .btn-outline-info.active,\n  .show > .btn-outline-info.dropdown-toggle {\n    color: #fff;\n    background-color: #63c2de;\n    border-color: #63c2de;\n}\n.btn-outline-warning {\n  color: #ffc107;\n  background-color: transparent;\n  background-image: none;\n  border-color: #ffc107;\n}\n.btn-outline-warning:hover {\n    color: #fff;\n    background-color: #ffc107;\n    border-color: #ffc107;\n}\n.btn-outline-warning:focus, .btn-outline-warning.focus {\n    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.5);\n}\n.btn-outline-warning.disabled, .btn-outline-warning:disabled {\n    color: #ffc107;\n    background-color: transparent;\n}\n.btn-outline-warning:active, .btn-outline-warning.active,\n  .show > .btn-outline-warning.dropdown-toggle {\n    color: #fff;\n    background-color: #ffc107;\n    border-color: #ffc107;\n}\n.btn-outline-danger {\n  color: #f86c6b;\n  background-color: transparent;\n  background-image: none;\n  border-color: #f86c6b;\n}\n.btn-outline-danger:hover {\n    color: #fff;\n    background-color: #f86c6b;\n    border-color: #f86c6b;\n}\n.btn-outline-danger:focus, .btn-outline-danger.focus {\n    box-shadow: 0 0 0 3px rgba(248, 108, 107, 0.5);\n}\n.btn-outline-danger.disabled, .btn-outline-danger:disabled {\n    color: #f86c6b;\n    background-color: transparent;\n}\n.btn-outline-danger:active, .btn-outline-danger.active,\n  .show > .btn-outline-danger.dropdown-toggle {\n    color: #fff;\n    background-color: #f86c6b;\n    border-color: #f86c6b;\n}\n.btn-outline-light {\n  color: #f0f3f5;\n  background-color: transparent;\n  background-image: none;\n  border-color: #f0f3f5;\n}\n.btn-outline-light:hover {\n    color: #fff;\n    background-color: #f0f3f5;\n    border-color: #f0f3f5;\n}\n.btn-outline-light:focus, .btn-outline-light.focus {\n    box-shadow: 0 0 0 3px rgba(240, 243, 245, 0.5);\n}\n.btn-outline-light.disabled, .btn-outline-light:disabled {\n    color: #f0f3f5;\n    background-color: transparent;\n}\n.btn-outline-light:active, .btn-outline-light.active,\n  .show > .btn-outline-light.dropdown-toggle {\n    color: #fff;\n    background-color: #f0f3f5;\n    border-color: #f0f3f5;\n}\n.btn-outline-dark {\n  color: #29363d;\n  background-color: transparent;\n  background-image: none;\n  border-color: #29363d;\n}\n.btn-outline-dark:hover {\n    color: #fff;\n    background-color: #29363d;\n    border-color: #29363d;\n}\n.btn-outline-dark:focus, .btn-outline-dark.focus {\n    box-shadow: 0 0 0 3px rgba(41, 54, 61, 0.5);\n}\n.btn-outline-dark.disabled, .btn-outline-dark:disabled {\n    color: #29363d;\n    background-color: transparent;\n}\n.btn-outline-dark:active, .btn-outline-dark.active,\n  .show > .btn-outline-dark.dropdown-toggle {\n    color: #fff;\n    background-color: #29363d;\n    border-color: #29363d;\n}\n.btn-link {\n  font-weight: normal;\n  color: #20a8d8;\n  border-radius: 0;\n}\n.btn-link, .btn-link:active, .btn-link.active, .btn-link:disabled {\n    background-color: transparent;\n}\n.btn-link, .btn-link:focus, .btn-link:active {\n    border-color: transparent;\n    box-shadow: none;\n}\n.btn-link:hover {\n    border-color: transparent;\n}\n.btn-link:focus, .btn-link:hover {\n    color: #167495;\n    text-decoration: underline;\n    background-color: transparent;\n}\n.btn-link:disabled {\n    color: #536c79;\n}\n.btn-link:disabled:focus, .btn-link:disabled:hover {\n      text-decoration: none;\n}\n.btn-lg, .btn-group-lg > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n.btn-sm, .btn-group-sm > .btn {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n.btn-block {\n  display: block;\n  width: 100%;\n}\n.btn-block + .btn-block {\n  margin-top: 0.5rem;\n}\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%;\n}\n.fade {\n  opacity: 0;\n  transition: opacity 0.15s linear;\n}\n.fade.show {\n    opacity: 1;\n}\n.collapse {\n  display: none;\n}\n.collapse.show {\n    display: block;\n}\ntr.collapse.show {\n  display: table-row;\n}\ntbody.collapse.show {\n  display: table-row-group;\n}\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  transition: height 0.35s ease;\n}\n.dropup,\n.dropdown {\n  position: relative;\n}\n.dropdown-toggle::after {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-left: 0.3em solid transparent;\n}\n.dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropup .dropdown-menu {\n  margin-top: 0;\n  margin-bottom: 0.125rem;\n}\n.dropup .dropdown-toggle::after {\n  border-top: 0;\n  border-bottom: 0.3em solid;\n}\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 10rem;\n  padding: 0 0;\n  margin: 0.125rem 0 0;\n  font-size: 0.875rem;\n  color: #536a85;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid #c2cfd6;\n}\n.dropdown-divider {\n  height: 0;\n  margin: 0.5rem 0;\n  overflow: hidden;\n  border-top: 1px solid #f0f3f5;\n}\n.dropdown-item {\n  display: block;\n  width: 100%;\n  padding: 0.25rem 1.5rem;\n  clear: both;\n  font-weight: normal;\n  color: #151b1e;\n  text-align: inherit;\n  white-space: nowrap;\n  background: none;\n  border: 0;\n}\n.dropdown-item:focus, .dropdown-item:hover {\n    color: #0b0e0f;\n    text-decoration: none;\n    background-color: #f0f3f5;\n}\n.dropdown-item.active, .dropdown-item:active {\n    color: #fff;\n    text-decoration: none;\n    background-color: #20a8d8;\n}\n.dropdown-item.disabled, .dropdown-item:disabled {\n    color: #536c79;\n    background-color: transparent;\n}\n.show > a {\n  outline: 0;\n}\n.dropdown-menu.show {\n  display: block;\n}\n.dropdown-header {\n  display: block;\n  padding: 0 1.5rem;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  color: #536c79;\n  white-space: nowrap;\n}\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  vertical-align: middle;\n}\n.btn-group > .btn,\n  .btn-group-vertical > .btn {\n    position: relative;\n    -webkit-box-flex: 0;\n        -ms-flex: 0 1 auto;\n            flex: 0 1 auto;\n    margin-bottom: 0;\n}\n.btn-group > .btn:hover,\n    .btn-group-vertical > .btn:hover {\n      z-index: 2;\n}\n.btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,\n    .btn-group-vertical > .btn:focus,\n    .btn-group-vertical > .btn:active,\n    .btn-group-vertical > .btn.active {\n      z-index: 2;\n}\n.btn-group .btn + .btn,\n  .btn-group .btn + .btn-group,\n  .btn-group .btn-group + .btn,\n  .btn-group .btn-group + .btn-group,\n  .btn-group-vertical .btn + .btn,\n  .btn-group-vertical .btn + .btn-group,\n  .btn-group-vertical .btn-group + .btn,\n  .btn-group-vertical .btn-group + .btn-group {\n    margin-left: -1px;\n}\n.btn-toolbar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.btn-toolbar .input-group {\n    width: auto;\n}\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n.btn-group > .btn:first-child {\n  margin-left: 0;\n}\n.btn-group > .btn-group {\n  float: left;\n}\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.btn + .dropdown-toggle-split {\n  padding-right: 0.5625rem;\n  padding-left: 0.5625rem;\n}\n.btn + .dropdown-toggle-split::after {\n    margin-left: 0;\n}\n.btn-sm + .dropdown-toggle-split, .btn-group-sm > .btn + .dropdown-toggle-split {\n  padding-right: 0.375rem;\n  padding-left: 0.375rem;\n}\n.btn-lg + .dropdown-toggle-split, .btn-group-lg > .btn + .dropdown-toggle-split {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem;\n}\n.btn-group-vertical {\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.btn-group-vertical .btn,\n  .btn-group-vertical .btn-group {\n    width: 100%;\n}\n.btn-group-vertical > .btn + .btn,\n  .btn-group-vertical > .btn + .btn-group,\n  .btn-group-vertical > .btn-group + .btn,\n  .btn-group-vertical > .btn-group + .btn-group {\n    margin-top: -1px;\n    margin-left: 0;\n}\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n[data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n.input-group {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n}\n.input-group .form-control {\n    position: relative;\n    z-index: 2;\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 auto;\n            flex: 1 1 auto;\n    width: 1%;\n    margin-bottom: 0;\n}\n.input-group .form-control:focus, .input-group .form-control:active, .input-group .form-control:hover {\n      z-index: 3;\n}\n.input-group-addon,\n.input-group-btn,\n.input-group .form-control {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.input-group-addon,\n.input-group-btn {\n  white-space: nowrap;\n  vertical-align: middle;\n}\n.input-group-addon {\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  font-weight: normal;\n  line-height: 1.25;\n  color: #3e515b;\n  text-align: center;\n  background-color: #f0f3f5;\n  border: 1px solid #c2cfd6;\n}\n.input-group-addon.form-control-sm,\n  .input-group-sm > .input-group-addon,\n  .input-group-sm > .input-group-btn > .input-group-addon.btn {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n}\n.input-group-addon.form-control-lg,\n  .input-group-lg > .input-group-addon,\n  .input-group-lg > .input-group-btn > .input-group-addon.btn {\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n}\n.input-group-addon input[type=\"radio\"],\n  .input-group-addon input[type=\"checkbox\"] {\n    margin-top: 0;\n}\n.input-group-addon:not(:last-child) {\n  border-right: 0;\n}\n.form-control + .input-group-addon:not(:first-child) {\n  border-left: 0;\n}\n.input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap;\n}\n.input-group-btn > .btn {\n    position: relative;\n}\n.input-group-btn > .btn + .btn {\n      margin-left: -1px;\n}\n.input-group-btn > .btn:focus, .input-group-btn > .btn:active, .input-group-btn > .btn:hover {\n      z-index: 3;\n}\n.input-group-btn:not(:last-child) > .btn,\n  .input-group-btn:not(:last-child) > .btn-group {\n    margin-right: -1px;\n}\n.input-group-btn:not(:first-child) > .btn,\n  .input-group-btn:not(:first-child) > .btn-group {\n    z-index: 2;\n    margin-left: -1px;\n}\n.input-group-btn:not(:first-child) > .btn:focus, .input-group-btn:not(:first-child) > .btn:active, .input-group-btn:not(:first-child) > .btn:hover,\n    .input-group-btn:not(:first-child) > .btn-group:focus,\n    .input-group-btn:not(:first-child) > .btn-group:active,\n    .input-group-btn:not(:first-child) > .btn-group:hover {\n      z-index: 3;\n}\n.custom-control {\n  position: relative;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  min-height: 1.5rem;\n  padding-left: 1.5rem;\n  margin-right: 1rem;\n}\n.custom-control-input {\n  position: absolute;\n  z-index: -1;\n  opacity: 0;\n}\n.custom-control-input:checked ~ .custom-control-indicator {\n    color: #fff;\n    background-color: #20a8d8;\n}\n.custom-control-input:focus ~ .custom-control-indicator {\n    box-shadow: 0 0 0 1px #ffffff, 0 0 0 3px #20a8d8;\n}\n.custom-control-input:active ~ .custom-control-indicator {\n    color: #fff;\n    background-color: #b6e4f4;\n}\n.custom-control-input:disabled ~ .custom-control-indicator {\n    background-color: #c2cfd6;\n}\n.custom-control-input:disabled ~ .custom-control-description {\n    color: #536c79;\n}\n.custom-control-indicator {\n  position: absolute;\n  top: 0.25rem;\n  left: 0;\n  display: block;\n  width: 1rem;\n  height: 1rem;\n  pointer-events: none;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  background-color: #ddd;\n  background-repeat: no-repeat;\n  background-position: center center;\n  background-size: 50% 50%;\n}\n.custom-checkbox .custom-control-input:checked ~ .custom-control-indicator {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E\");\n}\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-indicator {\n  background-color: #20a8d8;\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Cpath stroke='%23fff' d='M0 2h4'/%3E%3C/svg%3E\");\n}\n.custom-radio .custom-control-indicator {\n  border-radius: 50%;\n}\n.custom-radio .custom-control-input:checked ~ .custom-control-indicator {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%23fff'/%3E%3C/svg%3E\");\n}\n.custom-controls-stacked {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n}\n.custom-controls-stacked .custom-control {\n    margin-bottom: 0.25rem;\n}\n.custom-controls-stacked .custom-control + .custom-control {\n      margin-left: 0;\n}\n.custom-select {\n  display: inline-block;\n  max-width: 100%;\n  height: calc(2.09375rem + 2px);\n  padding: 0.375rem 1.75rem 0.375rem 0.75rem;\n  line-height: 1.25;\n  color: #3e515b;\n  vertical-align: middle;\n  background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23333' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center;\n  background-size: 8px 10px;\n  border: 1px solid #c2cfd6;\n  border-radius: 0;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.custom-select:focus {\n    border-color: #8ad4ee;\n    outline: none;\n}\n.custom-select:focus::-ms-value {\n      color: #3e515b;\n      background-color: #fff;\n}\n.custom-select:disabled {\n    color: #536c79;\n    background-color: #c2cfd6;\n}\n.custom-select::-ms-expand {\n    opacity: 0;\n}\n.custom-select-sm {\n  height: calc(1.8125rem + 2px);\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n  font-size: 75%;\n}\n.custom-file {\n  position: relative;\n  display: inline-block;\n  max-width: 100%;\n  height: 2.5rem;\n  margin-bottom: 0;\n}\n.custom-file-input {\n  min-width: 14rem;\n  max-width: 100%;\n  height: 2.5rem;\n  margin: 0;\n  opacity: 0;\n}\n.custom-file-control {\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 5;\n  height: 2.5rem;\n  padding: 0.5rem 1rem;\n  line-height: 1.5;\n  color: #3e515b;\n  pointer-events: none;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  background-color: #fff;\n  border: 1px solid #c2cfd6;\n}\n.custom-file-control:lang(en):empty::after {\n    content: \"Choose file...\";\n}\n.custom-file-control::before {\n    position: absolute;\n    top: -1px;\n    right: -1px;\n    bottom: -1px;\n    z-index: 6;\n    display: block;\n    height: 2.5rem;\n    padding: 0.5rem 1rem;\n    line-height: 1.5;\n    color: #3e515b;\n    background-color: #c2cfd6;\n    border: 1px solid #c2cfd6;\n}\n.custom-file-control:lang(en)::before {\n    content: \"Browse\";\n}\n.nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.nav-link, .navbar .dropdown-toggle {\n  display: block;\n  padding: 0.5rem 1rem;\n}\n.nav-link:focus, .navbar .dropdown-toggle:focus, .nav-link:hover, .navbar .dropdown-toggle:hover {\n    text-decoration: none;\n}\n.nav-link.disabled, .navbar .disabled.dropdown-toggle {\n    color: #536c79;\n}\n.nav-tabs {\n  border-bottom: 1px solid #ddd;\n}\n.nav-tabs .nav-item {\n    margin-bottom: -1px;\n}\n.nav-tabs .nav-link, .nav-tabs .navbar .dropdown-toggle, .navbar .nav-tabs .dropdown-toggle {\n    border: 1px solid transparent;\n}\n.nav-tabs .nav-link:focus, .nav-tabs .navbar .dropdown-toggle:focus, .navbar .nav-tabs .dropdown-toggle:focus, .nav-tabs .nav-link:hover, .nav-tabs .navbar .dropdown-toggle:hover, .navbar .nav-tabs .dropdown-toggle:hover {\n      border-color: #c2cfd6 #c2cfd6 #ddd;\n}\n.nav-tabs .nav-link.disabled, .nav-tabs .navbar .disabled.dropdown-toggle, .navbar .nav-tabs .disabled.dropdown-toggle {\n      color: #536c79;\n      background-color: transparent;\n      border-color: transparent;\n}\n.nav-tabs .nav-link.active, .nav-tabs .navbar .active.dropdown-toggle, .navbar .nav-tabs .active.dropdown-toggle,\n  .nav-tabs .nav-item.show .nav-link,\n  .nav-tabs .nav-item.show .navbar .dropdown-toggle, .navbar\n  .nav-tabs .nav-item.show .dropdown-toggle {\n    color: #3e515b;\n    background-color: #ffffff;\n    border-color: #ddd #ddd #ffffff;\n}\n.nav-tabs .dropdown-menu {\n    margin-top: -1px;\n}\n.nav-pills .nav-link.active, .nav-pills .navbar .active.dropdown-toggle, .navbar .nav-pills .active.dropdown-toggle,\n.show > .nav-pills .nav-link,\n.show > .nav-pills .navbar .dropdown-toggle, .navbar\n.show > .nav-pills .dropdown-toggle {\n  color: #fff;\n  background-color: #20a8d8;\n}\n.nav-fill .nav-item {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  text-align: center;\n}\n.nav-justified .nav-item {\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  text-align: center;\n}\n.tab-content > .tab-pane {\n  display: none;\n}\n.tab-content > .active {\n  display: block;\n}\n.navbar {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  padding: 0.5rem 1rem;\n}\n.navbar > .container,\n  .navbar > .container-fluid {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -webkit-box-pack: justify;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n}\n.navbar-brand {\n  display: inline-block;\n  padding-top: 0.21875rem;\n  padding-bottom: 0.21875rem;\n  margin-right: 1rem;\n  font-size: 1.25rem;\n  line-height: inherit;\n  white-space: nowrap;\n}\n.navbar-brand:focus, .navbar-brand:hover {\n    text-decoration: none;\n}\n.navbar-nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.navbar-nav .nav-link, .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-nav .dropdown-toggle {\n    padding-right: 0;\n    padding-left: 0;\n}\n.navbar-nav .dropdown-menu {\n    position: static;\n    float: none;\n}\n.navbar-text {\n  display: inline-block;\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n.navbar-collapse {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.navbar-toggler {\n  padding: 0.25rem 0.75rem;\n  font-size: 1.25rem;\n  line-height: 1;\n  background: transparent;\n  border: 1px solid transparent;\n}\n.navbar-toggler:focus, .navbar-toggler:hover {\n    text-decoration: none;\n}\n.navbar-toggler-icon {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  vertical-align: middle;\n  content: \"\";\n  background: no-repeat center center;\n  background-size: 100% 100%;\n}\n@media (max-width: 575px) {\n.navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 576px) {\n.navbar-expand-sm {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-sm .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-sm .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-sm .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-sm .navbar-nav .nav-link, .navbar-expand-sm .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-expand-sm .navbar-nav .dropdown-toggle {\n        padding-right: .5rem;\n        padding-left: .5rem;\n}\n.navbar-expand-sm > .container,\n    .navbar-expand-sm > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-sm .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n}\n.navbar-expand-sm .navbar-toggler {\n      display: none;\n}\n}\n@media (max-width: 767px) {\n.navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 768px) {\n.navbar-expand-md {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-md .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-md .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-md .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-md .navbar-nav .nav-link, .navbar-expand-md .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-expand-md .navbar-nav .dropdown-toggle {\n        padding-right: .5rem;\n        padding-left: .5rem;\n}\n.navbar-expand-md > .container,\n    .navbar-expand-md > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-md .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n}\n.navbar-expand-md .navbar-toggler {\n      display: none;\n}\n}\n@media (max-width: 991px) {\n.navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 992px) {\n.navbar-expand-lg {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-lg .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-lg .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-lg .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-lg .navbar-nav .nav-link, .navbar-expand-lg .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-expand-lg .navbar-nav .dropdown-toggle {\n        padding-right: .5rem;\n        padding-left: .5rem;\n}\n.navbar-expand-lg > .container,\n    .navbar-expand-lg > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-lg .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n}\n.navbar-expand-lg .navbar-toggler {\n      display: none;\n}\n}\n@media (max-width: 1199px) {\n.navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 1200px) {\n.navbar-expand-xl {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-xl .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-xl .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-xl .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-xl .navbar-nav .nav-link, .navbar-expand-xl .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-expand-xl .navbar-nav .dropdown-toggle {\n        padding-right: .5rem;\n        padding-left: .5rem;\n}\n.navbar-expand-xl > .container,\n    .navbar-expand-xl > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-xl .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n}\n.navbar-expand-xl .navbar-toggler {\n      display: none;\n}\n}\n.navbar-expand {\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: nowrap;\n      flex-wrap: nowrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.navbar-expand > .container,\n  .navbar-expand > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n.navbar-expand .navbar-nav {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n}\n.navbar-expand .navbar-nav .dropdown-menu {\n      position: absolute;\n}\n.navbar-expand .navbar-nav .dropdown-menu-right {\n      right: 0;\n      left: auto;\n}\n.navbar-expand .navbar-nav .nav-link, .navbar-expand .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-expand .navbar-nav .dropdown-toggle {\n      padding-right: .5rem;\n      padding-left: .5rem;\n}\n.navbar-expand > .container,\n  .navbar-expand > .container-fluid {\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n}\n.navbar-expand .navbar-collapse {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.navbar-expand .navbar-toggler {\n    display: none;\n}\n.navbar-light .navbar-brand {\n  color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-brand:focus, .navbar-light .navbar-brand:hover {\n    color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-nav .nav-link, .navbar-light .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-light .navbar-nav .dropdown-toggle {\n  color: rgba(0, 0, 0, 0.5);\n}\n.navbar-light .navbar-nav .nav-link:focus, .navbar-light .navbar-nav .navbar .dropdown-toggle:focus, .navbar .navbar-light .navbar-nav .dropdown-toggle:focus, .navbar-light .navbar-nav .nav-link:hover, .navbar-light .navbar-nav .navbar .dropdown-toggle:hover, .navbar .navbar-light .navbar-nav .dropdown-toggle:hover {\n    color: rgba(0, 0, 0, 0.7);\n}\n.navbar-light .navbar-nav .nav-link.disabled, .navbar-light .navbar-nav .navbar .disabled.dropdown-toggle, .navbar .navbar-light .navbar-nav .disabled.dropdown-toggle {\n    color: rgba(0, 0, 0, 0.3);\n}\n.navbar-light .navbar-nav .show > .nav-link, .navbar-light .navbar-nav .navbar .show > .dropdown-toggle, .navbar .navbar-light .navbar-nav .show > .dropdown-toggle,\n.navbar-light .navbar-nav .active > .nav-link,\n.navbar-light .navbar-nav .navbar .active > .dropdown-toggle, .navbar\n.navbar-light .navbar-nav .active > .dropdown-toggle,\n.navbar-light .navbar-nav .nav-link.show,\n.navbar-light .navbar-nav .navbar .show.dropdown-toggle, .navbar\n.navbar-light .navbar-nav .show.dropdown-toggle,\n.navbar-light .navbar-nav .nav-link.active,\n.navbar-light .navbar-nav .navbar .active.dropdown-toggle, .navbar\n.navbar-light .navbar-nav .active.dropdown-toggle {\n  color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-toggler {\n  color: rgba(0, 0, 0, 0.5);\n  border-color: rgba(0, 0, 0, 0.1);\n}\n.navbar-light .navbar-toggler-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.navbar-light .navbar-text {\n  color: rgba(0, 0, 0, 0.5);\n}\n.navbar-dark .navbar-brand {\n  color: white;\n}\n.navbar-dark .navbar-brand:focus, .navbar-dark .navbar-brand:hover {\n    color: white;\n}\n.navbar-dark .navbar-nav .nav-link, .navbar-dark .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-dark .navbar-nav .dropdown-toggle {\n  color: rgba(255, 255, 255, 0.5);\n}\n.navbar-dark .navbar-nav .nav-link:focus, .navbar-dark .navbar-nav .navbar .dropdown-toggle:focus, .navbar .navbar-dark .navbar-nav .dropdown-toggle:focus, .navbar-dark .navbar-nav .nav-link:hover, .navbar-dark .navbar-nav .navbar .dropdown-toggle:hover, .navbar .navbar-dark .navbar-nav .dropdown-toggle:hover {\n    color: rgba(255, 255, 255, 0.75);\n}\n.navbar-dark .navbar-nav .nav-link.disabled, .navbar-dark .navbar-nav .navbar .disabled.dropdown-toggle, .navbar .navbar-dark .navbar-nav .disabled.dropdown-toggle {\n    color: rgba(255, 255, 255, 0.25);\n}\n.navbar-dark .navbar-nav .show > .nav-link, .navbar-dark .navbar-nav .navbar .show > .dropdown-toggle, .navbar .navbar-dark .navbar-nav .show > .dropdown-toggle,\n.navbar-dark .navbar-nav .active > .nav-link,\n.navbar-dark .navbar-nav .navbar .active > .dropdown-toggle, .navbar\n.navbar-dark .navbar-nav .active > .dropdown-toggle,\n.navbar-dark .navbar-nav .nav-link.show,\n.navbar-dark .navbar-nav .navbar .show.dropdown-toggle, .navbar\n.navbar-dark .navbar-nav .show.dropdown-toggle,\n.navbar-dark .navbar-nav .nav-link.active,\n.navbar-dark .navbar-nav .navbar .active.dropdown-toggle, .navbar\n.navbar-dark .navbar-nav .active.dropdown-toggle {\n  color: white;\n}\n.navbar-dark .navbar-toggler {\n  color: rgba(255, 255, 255, 0.5);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.navbar-dark .navbar-toggler-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.navbar-dark .navbar-text {\n  color: rgba(255, 255, 255, 0.5);\n}\n.card {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  min-width: 0;\n  word-wrap: break-word;\n  background-color: #fff;\n  background-clip: border-box;\n  border: 1px solid #c2cfd6;\n}\n.card-body, .card-block {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  padding: 1.25rem;\n}\n.card-title {\n  margin-bottom: 0.75rem;\n}\n.card-subtitle {\n  margin-top: -0.375rem;\n  margin-bottom: 0;\n}\n.card-text:last-child {\n  margin-bottom: 0;\n}\n.card-link:hover {\n  text-decoration: none;\n}\n.card-link + .card-link {\n  margin-left: 1.25rem;\n}\n.card-header {\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 0;\n  background-color: #f0f3f5;\n  border-bottom: 1px solid #c2cfd6;\n}\n.card-footer {\n  padding: 0.75rem 1.25rem;\n  background-color: #f0f3f5;\n  border-top: 1px solid #c2cfd6;\n}\n.card-header-tabs {\n  margin-right: -0.625rem;\n  margin-bottom: -0.75rem;\n  margin-left: -0.625rem;\n  border-bottom: 0;\n}\n.card-header-pills {\n  margin-right: -0.625rem;\n  margin-left: -0.625rem;\n}\n.card-img-overlay {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: 1.25rem;\n}\n.card-img {\n  width: 100%;\n}\n.card-img-top {\n  width: 100%;\n}\n.card-img-bottom {\n  width: 100%;\n}\n@media (min-width: 576px) {\n.card-deck {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row wrap;\n            flex-flow: row wrap;\n    margin-right: -15px;\n    margin-left: -15px;\n}\n.card-deck .card {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-flex: 1;\n          -ms-flex: 1 0 0%;\n              flex: 1 0 0%;\n      -webkit-box-orient: vertical;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: column;\n              flex-direction: column;\n      margin-right: 15px;\n      margin-left: 15px;\n}\n}\n@media (min-width: 576px) {\n.card-group {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row wrap;\n            flex-flow: row wrap;\n}\n.card-group .card {\n      -webkit-box-flex: 1;\n          -ms-flex: 1 0 0%;\n              flex: 1 0 0%;\n}\n.card-group .card + .card {\n        margin-left: 0;\n        border-left: 0;\n}\n}\n.card-columns .card {\n  margin-bottom: 0.75rem;\n}\n@media (min-width: 576px) {\n.card-columns {\n    -webkit-column-count: 3;\n            column-count: 3;\n    -webkit-column-gap: 1.25rem;\n            column-gap: 1.25rem;\n}\n.card-columns .card {\n      display: inline-block;\n      width: 100%;\n}\n}\n.breadcrumb {\n  padding: 0.75rem 1rem;\n  margin-bottom: 1rem;\n  list-style: none;\n  background-color: #fff;\n}\n.breadcrumb::after {\n    display: block;\n    clear: both;\n    content: \"\";\n}\n.breadcrumb-item {\n  float: left;\n}\n.breadcrumb-item + .breadcrumb-item::before {\n    display: inline-block;\n    padding-right: 0.5rem;\n    padding-left: 0.5rem;\n    color: #536c79;\n    content: \"/\";\n}\n.breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: underline;\n}\n.breadcrumb-item + .breadcrumb-item:hover::before {\n    text-decoration: none;\n}\n.breadcrumb-item.active {\n    color: #536c79;\n}\n.pagination {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding-left: 0;\n  list-style: none;\n}\n.page-item:first-child .page-link, .pagination-datatables li:first-child .page-link, .pagination li:first-child .page-link, .page-item:first-child .pagination-datatables li a, .pagination-datatables li .page-item:first-child a, .pagination-datatables li:first-child a, .page-item:first-child .pagination li a, .pagination li .page-item:first-child a, .pagination li:first-child a {\n  margin-left: 0;\n}\n.page-item.active .page-link, .pagination-datatables li.active .page-link, .pagination li.active .page-link, .page-item.active .pagination-datatables li a, .pagination-datatables li .page-item.active a, .pagination-datatables li.active a, .page-item.active .pagination li a, .pagination li .page-item.active a, .pagination li.active a {\n  z-index: 2;\n  color: #fff;\n  background-color: #20a8d8;\n  border-color: #20a8d8;\n}\n.page-item.disabled .page-link, .pagination-datatables li.disabled .page-link, .pagination li.disabled .page-link, .page-item.disabled .pagination-datatables li a, .pagination-datatables li .page-item.disabled a, .pagination-datatables li.disabled a, .page-item.disabled .pagination li a, .pagination li .page-item.disabled a, .pagination li.disabled a {\n  color: #536c79;\n  pointer-events: none;\n  background-color: #fff;\n  border-color: #ddd;\n}\n.page-link, .pagination-datatables li a, .pagination li a {\n  position: relative;\n  display: block;\n  padding: 0.5rem 0.75rem;\n  margin-left: -1px;\n  line-height: 1.25;\n  color: #20a8d8;\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n.page-link:focus, .pagination-datatables li a:focus, .pagination li a:focus, .page-link:hover, .pagination-datatables li a:hover, .pagination li a:hover {\n    color: #167495;\n    text-decoration: none;\n    background-color: #c2cfd6;\n    border-color: #ddd;\n}\n.pagination-lg .page-link, .pagination-lg .pagination-datatables li a, .pagination-datatables li .pagination-lg a, .pagination-lg .pagination li a, .pagination li .pagination-lg a {\n  padding: 0.75rem 1.5rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n.pagination-sm .page-link, .pagination-sm .pagination-datatables li a, .pagination-datatables li .pagination-sm a, .pagination-sm .pagination li a, .pagination li .pagination-sm a {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n.badge {\n  display: inline-block;\n  padding: 0.25em 0.4em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n}\n.badge:empty {\n    display: none;\n}\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n.badge-pill {\n  padding-right: 0.6em;\n  padding-left: 0.6em;\n}\n.badge-primary {\n  color: #fff;\n  background-color: #20a8d8;\n}\n.badge-primary[href]:focus, .badge-primary[href]:hover {\n    color: #fff;\n    text-decoration: none;\n    background-color: #1985ac;\n}\n.badge-secondary {\n  color: #111;\n  background-color: #a4b7c1;\n}\n.badge-secondary[href]:focus, .badge-secondary[href]:hover {\n    color: #111;\n    text-decoration: none;\n    background-color: #869fac;\n}\n.badge-success {\n  color: #fff;\n  background-color: #4dbd74;\n}\n.badge-success[href]:focus, .badge-success[href]:hover {\n    color: #fff;\n    text-decoration: none;\n    background-color: #3a9d5d;\n}\n.badge-info {\n  color: #111;\n  background-color: #63c2de;\n}\n.badge-info[href]:focus, .badge-info[href]:hover {\n    color: #111;\n    text-decoration: none;\n    background-color: #39b2d5;\n}\n.badge-warning {\n  color: #111;\n  background-color: #ffc107;\n}\n.badge-warning[href]:focus, .badge-warning[href]:hover {\n    color: #111;\n    text-decoration: none;\n    background-color: #d39e00;\n}\n.badge-danger {\n  color: #fff;\n  background-color: #f86c6b;\n}\n.badge-danger[href]:focus, .badge-danger[href]:hover {\n    color: #fff;\n    text-decoration: none;\n    background-color: #f63c3a;\n}\n.badge-light {\n  color: #111;\n  background-color: #f0f3f5;\n}\n.badge-light[href]:focus, .badge-light[href]:hover {\n    color: #111;\n    text-decoration: none;\n    background-color: #d1dbe1;\n}\n.badge-dark {\n  color: #fff;\n  background-color: #29363d;\n}\n.badge-dark[href]:focus, .badge-dark[href]:hover {\n    color: #fff;\n    text-decoration: none;\n    background-color: #151b1f;\n}\n.jumbotron {\n  padding: 2rem 1rem;\n  margin-bottom: 2rem;\n  background-color: #c2cfd6;\n}\n@media (min-width: 576px) {\n.jumbotron {\n      padding: 4rem 2rem;\n}\n}\n.jumbotron-fluid {\n  padding-right: 0;\n  padding-left: 0;\n}\n.alert {\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 1rem;\n  border: 1px solid transparent;\n}\n.alert-heading {\n  color: inherit;\n}\n.alert-link {\n  font-weight: bold;\n}\n.alert-dismissible .close {\n  position: relative;\n  top: -0.75rem;\n  right: -1.25rem;\n  padding: 0.75rem 1.25rem;\n  color: inherit;\n}\n.alert-primary {\n  color: #115770;\n  background-color: #d2eef7;\n  border-color: #c1e7f4;\n}\n.alert-primary hr {\n    border-top-color: #abdff0;\n}\n.alert-primary .alert-link {\n    color: #0a3544;\n}\n.alert-secondary {\n  color: #555f64;\n  background-color: #edf1f3;\n  border-color: #e6ebee;\n}\n.alert-secondary hr {\n    border-top-color: #d7dfe4;\n}\n.alert-secondary .alert-link {\n    color: #3e4548;\n}\n.alert-success {\n  color: #28623c;\n  background-color: #dbf2e3;\n  border-color: #cdedd8;\n}\n.alert-success hr {\n    border-top-color: #bae6c9;\n}\n.alert-success .alert-link {\n    color: #193e26;\n}\n.alert-info {\n  color: #336573;\n  background-color: #e0f3f8;\n  border-color: #d3eef6;\n}\n.alert-info hr {\n    border-top-color: #bee6f2;\n}\n.alert-info .alert-link {\n    color: #234650;\n}\n.alert-warning {\n  color: #856404;\n  background-color: #fff3cd;\n  border-color: #ffeeba;\n}\n.alert-warning hr {\n    border-top-color: #ffe8a1;\n}\n.alert-warning .alert-link {\n    color: #533f03;\n}\n.alert-danger {\n  color: #813838;\n  background-color: #fee2e1;\n  border-color: #fdd6d6;\n}\n.alert-danger hr {\n    border-top-color: #fcbebe;\n}\n.alert-danger .alert-link {\n    color: #5d2929;\n}\n.alert-light {\n  color: #7d7e7f;\n  background-color: #fcfdfd;\n  border-color: #fbfcfc;\n}\n.alert-light hr {\n    border-top-color: #ecf1f1;\n}\n.alert-light .alert-link {\n    color: #646565;\n}\n.alert-dark {\n  color: #151c20;\n  background-color: #d4d7d8;\n  border-color: #c3c7c9;\n}\n.alert-dark hr {\n    border-top-color: #b6babd;\n}\n.alert-dark .alert-link {\n    color: #010101;\n}\n@-webkit-keyframes progress-bar-stripes {\nfrom {\n    background-position: 1rem 0;\n}\nto {\n    background-position: 0 0;\n}\n}\n@keyframes progress-bar-stripes {\nfrom {\n    background-position: 1rem 0;\n}\nto {\n    background-position: 0 0;\n}\n}\n.progress {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  overflow: hidden;\n  font-size: 0.75rem;\n  line-height: 1rem;\n  text-align: center;\n  background-color: #f0f3f5;\n}\n.progress-bar {\n  height: 1rem;\n  line-height: 1rem;\n  color: #fff;\n  background-color: #20a8d8;\n  transition: width 0.6s ease;\n}\n.progress-bar-striped {\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 1rem 1rem;\n}\n.progress-bar-animated {\n  -webkit-animation: progress-bar-stripes 1s linear infinite;\n          animation: progress-bar-stripes 1s linear infinite;\n}\n.media {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n}\n.media-body {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.list-group {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n}\n.list-group-item-action {\n  width: 100%;\n  color: #3e515b;\n  text-align: inherit;\n}\n.list-group-item-action:focus, .list-group-item-action:hover {\n    color: #3e515b;\n    text-decoration: none;\n    background-color: #f0f3f5;\n}\n.list-group-item-action:active {\n    color: #536a85;\n    background-color: #c2cfd6;\n}\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 0.75rem 1.25rem;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.125);\n}\n.list-group-item:last-child {\n    margin-bottom: 0;\n}\n.list-group-item:focus, .list-group-item:hover {\n    text-decoration: none;\n}\n.list-group-item.disabled, .list-group-item:disabled {\n    color: #536c79;\n    background-color: #fff;\n}\n.list-group-item.active {\n    z-index: 2;\n    color: #fff;\n    background-color: #20a8d8;\n    border-color: #20a8d8;\n}\n.list-group-flush .list-group-item {\n  border-right: 0;\n  border-left: 0;\n  border-radius: 0;\n}\n.list-group-flush:first-child .list-group-item:first-child {\n  border-top: 0;\n}\n.list-group-flush:last-child .list-group-item:last-child {\n  border-bottom: 0;\n}\n.list-group-item-primary {\n  color: #115770;\n  background-color: #c1e7f4;\n}\na.list-group-item-primary,\nbutton.list-group-item-primary {\n  color: #115770;\n}\na.list-group-item-primary:focus, a.list-group-item-primary:hover,\n  button.list-group-item-primary:focus,\n  button.list-group-item-primary:hover {\n    color: #115770;\n    background-color: #abdff0;\n}\na.list-group-item-primary.active,\n  button.list-group-item-primary.active {\n    color: #fff;\n    background-color: #115770;\n    border-color: #115770;\n}\n.list-group-item-secondary {\n  color: #555f64;\n  background-color: #e6ebee;\n}\na.list-group-item-secondary,\nbutton.list-group-item-secondary {\n  color: #555f64;\n}\na.list-group-item-secondary:focus, a.list-group-item-secondary:hover,\n  button.list-group-item-secondary:focus,\n  button.list-group-item-secondary:hover {\n    color: #555f64;\n    background-color: #d7dfe4;\n}\na.list-group-item-secondary.active,\n  button.list-group-item-secondary.active {\n    color: #fff;\n    background-color: #555f64;\n    border-color: #555f64;\n}\n.list-group-item-success {\n  color: #28623c;\n  background-color: #cdedd8;\n}\na.list-group-item-success,\nbutton.list-group-item-success {\n  color: #28623c;\n}\na.list-group-item-success:focus, a.list-group-item-success:hover,\n  button.list-group-item-success:focus,\n  button.list-group-item-success:hover {\n    color: #28623c;\n    background-color: #bae6c9;\n}\na.list-group-item-success.active,\n  button.list-group-item-success.active {\n    color: #fff;\n    background-color: #28623c;\n    border-color: #28623c;\n}\n.list-group-item-info {\n  color: #336573;\n  background-color: #d3eef6;\n}\na.list-group-item-info,\nbutton.list-group-item-info {\n  color: #336573;\n}\na.list-group-item-info:focus, a.list-group-item-info:hover,\n  button.list-group-item-info:focus,\n  button.list-group-item-info:hover {\n    color: #336573;\n    background-color: #bee6f2;\n}\na.list-group-item-info.active,\n  button.list-group-item-info.active {\n    color: #fff;\n    background-color: #336573;\n    border-color: #336573;\n}\n.list-group-item-warning {\n  color: #856404;\n  background-color: #ffeeba;\n}\na.list-group-item-warning,\nbutton.list-group-item-warning {\n  color: #856404;\n}\na.list-group-item-warning:focus, a.list-group-item-warning:hover,\n  button.list-group-item-warning:focus,\n  button.list-group-item-warning:hover {\n    color: #856404;\n    background-color: #ffe8a1;\n}\na.list-group-item-warning.active,\n  button.list-group-item-warning.active {\n    color: #fff;\n    background-color: #856404;\n    border-color: #856404;\n}\n.list-group-item-danger {\n  color: #813838;\n  background-color: #fdd6d6;\n}\na.list-group-item-danger,\nbutton.list-group-item-danger {\n  color: #813838;\n}\na.list-group-item-danger:focus, a.list-group-item-danger:hover,\n  button.list-group-item-danger:focus,\n  button.list-group-item-danger:hover {\n    color: #813838;\n    background-color: #fcbebe;\n}\na.list-group-item-danger.active,\n  button.list-group-item-danger.active {\n    color: #fff;\n    background-color: #813838;\n    border-color: #813838;\n}\n.list-group-item-light {\n  color: #7d7e7f;\n  background-color: #fbfcfc;\n}\na.list-group-item-light,\nbutton.list-group-item-light {\n  color: #7d7e7f;\n}\na.list-group-item-light:focus, a.list-group-item-light:hover,\n  button.list-group-item-light:focus,\n  button.list-group-item-light:hover {\n    color: #7d7e7f;\n    background-color: #ecf1f1;\n}\na.list-group-item-light.active,\n  button.list-group-item-light.active {\n    color: #fff;\n    background-color: #7d7e7f;\n    border-color: #7d7e7f;\n}\n.list-group-item-dark {\n  color: #151c20;\n  background-color: #c3c7c9;\n}\na.list-group-item-dark,\nbutton.list-group-item-dark {\n  color: #151c20;\n}\na.list-group-item-dark:focus, a.list-group-item-dark:hover,\n  button.list-group-item-dark:focus,\n  button.list-group-item-dark:hover {\n    color: #151c20;\n    background-color: #b6babd;\n}\na.list-group-item-dark.active,\n  button.list-group-item-dark.active {\n    color: #fff;\n    background-color: #151c20;\n    border-color: #151c20;\n}\n.close {\n  float: right;\n  font-size: 1.3125rem;\n  font-weight: bold;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: .5;\n}\n.close:focus, .close:hover {\n    color: #000;\n    text-decoration: none;\n    opacity: .75;\n}\nbutton.close {\n  padding: 0;\n  background: transparent;\n  border: 0;\n  -webkit-appearance: none;\n}\n.modal-open {\n  overflow: hidden;\n}\n.modal {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  display: none;\n  overflow: hidden;\n  outline: 0;\n}\n.modal.fade .modal-dialog {\n    transition: -webkit-transform 0.3s ease-out;\n    transition: transform 0.3s ease-out;\n    transition: transform 0.3s ease-out, -webkit-transform 0.3s ease-out;\n    -webkit-transform: translate(0, -25%);\n            transform: translate(0, -25%);\n}\n.modal.show .modal-dialog {\n    -webkit-transform: translate(0, 0);\n            transform: translate(0, 0);\n}\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 10px;\n}\n.modal-content {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n  outline: 0;\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000;\n}\n.modal-backdrop.fade {\n    opacity: 0;\n}\n.modal-backdrop.show {\n    opacity: 0.5;\n}\n.modal-header {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  padding: 15px;\n  border-bottom: 1px solid #c2cfd6;\n}\n.modal-title {\n  margin-bottom: 0;\n  line-height: 1.5;\n}\n.modal-body {\n  position: relative;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  padding: 15px;\n}\n.modal-footer {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n  padding: 15px;\n  border-top: 1px solid #c2cfd6;\n}\n.modal-footer > :not(:first-child) {\n    margin-left: .25rem;\n}\n.modal-footer > :not(:last-child) {\n    margin-right: .25rem;\n}\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n@media (min-width: 576px) {\n.modal-dialog {\n    max-width: 500px;\n    margin: 30px auto;\n}\n.modal-sm {\n    max-width: 300px;\n}\n}\n@media (min-width: 992px) {\n.modal-lg {\n    max-width: 800px;\n}\n}\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  margin: 0;\n  font-family: \"Montserrat\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  white-space: normal;\n  line-break: auto;\n  font-size: 0.875rem;\n  word-wrap: break-word;\n  opacity: 0;\n}\n.tooltip.show {\n    opacity: 0.9;\n}\n.tooltip .arrow {\n    position: absolute;\n    display: block;\n    width: 5px;\n    height: 5px;\n}\n.tooltip.bs-tooltip-top, .tooltip.bs-tooltip-auto[x-placement^=\"top\"] {\n    padding: 5px 0;\n}\n.tooltip.bs-tooltip-top .arrow, .tooltip.bs-tooltip-auto[x-placement^=\"top\"] .arrow {\n      bottom: 0;\n}\n.tooltip.bs-tooltip-top .arrow::before, .tooltip.bs-tooltip-auto[x-placement^=\"top\"] .arrow::before {\n      margin-left: -3px;\n      content: \"\";\n      border-width: 5px 5px 0;\n      border-top-color: #000;\n}\n.tooltip.bs-tooltip-right, .tooltip.bs-tooltip-auto[x-placement^=\"right\"] {\n    padding: 0 5px;\n}\n.tooltip.bs-tooltip-right .arrow, .tooltip.bs-tooltip-auto[x-placement^=\"right\"] .arrow {\n      left: 0;\n}\n.tooltip.bs-tooltip-right .arrow::before, .tooltip.bs-tooltip-auto[x-placement^=\"right\"] .arrow::before {\n      margin-top: -3px;\n      content: \"\";\n      border-width: 5px 5px 5px 0;\n      border-right-color: #000;\n}\n.tooltip.bs-tooltip-bottom, .tooltip.bs-tooltip-auto[x-placement^=\"bottom\"] {\n    padding: 5px 0;\n}\n.tooltip.bs-tooltip-bottom .arrow, .tooltip.bs-tooltip-auto[x-placement^=\"bottom\"] .arrow {\n      top: 0;\n}\n.tooltip.bs-tooltip-bottom .arrow::before, .tooltip.bs-tooltip-auto[x-placement^=\"bottom\"] .arrow::before {\n      margin-left: -3px;\n      content: \"\";\n      border-width: 0 5px 5px;\n      border-bottom-color: #000;\n}\n.tooltip.bs-tooltip-left, .tooltip.bs-tooltip-auto[x-placement^=\"left\"] {\n    padding: 0 5px;\n}\n.tooltip.bs-tooltip-left .arrow, .tooltip.bs-tooltip-auto[x-placement^=\"left\"] .arrow {\n      right: 0;\n}\n.tooltip.bs-tooltip-left .arrow::before, .tooltip.bs-tooltip-auto[x-placement^=\"left\"] .arrow::before {\n      right: 0;\n      margin-top: -3px;\n      content: \"\";\n      border-width: 5px 0 5px 5px;\n      border-left-color: #000;\n}\n.tooltip .arrow::before {\n    position: absolute;\n    border-color: transparent;\n    border-style: solid;\n}\n.tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n}\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: block;\n  max-width: 276px;\n  padding: 1px;\n  font-family: \"Montserrat\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  white-space: normal;\n  line-break: auto;\n  font-size: 0.875rem;\n  word-wrap: break-word;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.2);\n}\n.popover .arrow {\n    position: absolute;\n    display: block;\n    width: 10px;\n    height: 5px;\n}\n.popover .arrow::before,\n  .popover .arrow::after {\n    position: absolute;\n    display: block;\n    border-color: transparent;\n    border-style: solid;\n}\n.popover .arrow::before {\n    content: \"\";\n    border-width: 11px;\n}\n.popover .arrow::after {\n    content: \"\";\n    border-width: 11px;\n}\n.popover.bs-popover-top, .popover.bs-popover-auto[x-placement^=\"top\"] {\n    margin-bottom: 10px;\n}\n.popover.bs-popover-top .arrow, .popover.bs-popover-auto[x-placement^=\"top\"] .arrow {\n      bottom: 0;\n}\n.popover.bs-popover-top .arrow::before, .popover.bs-popover-auto[x-placement^=\"top\"] .arrow::before,\n    .popover.bs-popover-top .arrow::after, .popover.bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      border-bottom-width: 0;\n}\n.popover.bs-popover-top .arrow::before, .popover.bs-popover-auto[x-placement^=\"top\"] .arrow::before {\n      bottom: -11px;\n      margin-left: -6px;\n      border-top-color: rgba(0, 0, 0, 0.25);\n}\n.popover.bs-popover-top .arrow::after, .popover.bs-popover-auto[x-placement^=\"top\"] .arrow::after {\n      bottom: -10px;\n      margin-left: -6px;\n      border-top-color: #fff;\n}\n.popover.bs-popover-right, .popover.bs-popover-auto[x-placement^=\"right\"] {\n    margin-left: 10px;\n}\n.popover.bs-popover-right .arrow, .popover.bs-popover-auto[x-placement^=\"right\"] .arrow {\n      left: 0;\n}\n.popover.bs-popover-right .arrow::before, .popover.bs-popover-auto[x-placement^=\"right\"] .arrow::before,\n    .popover.bs-popover-right .arrow::after, .popover.bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      margin-top: -8px;\n      border-left-width: 0;\n}\n.popover.bs-popover-right .arrow::before, .popover.bs-popover-auto[x-placement^=\"right\"] .arrow::before {\n      left: -11px;\n      border-right-color: rgba(0, 0, 0, 0.25);\n}\n.popover.bs-popover-right .arrow::after, .popover.bs-popover-auto[x-placement^=\"right\"] .arrow::after {\n      left: -10px;\n      border-right-color: #fff;\n}\n.popover.bs-popover-bottom, .popover.bs-popover-auto[x-placement^=\"bottom\"] {\n    margin-top: 10px;\n}\n.popover.bs-popover-bottom .arrow, .popover.bs-popover-auto[x-placement^=\"bottom\"] .arrow {\n      top: 0;\n}\n.popover.bs-popover-bottom .arrow::before, .popover.bs-popover-auto[x-placement^=\"bottom\"] .arrow::before,\n    .popover.bs-popover-bottom .arrow::after, .popover.bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      margin-left: -7px;\n      border-top-width: 0;\n}\n.popover.bs-popover-bottom .arrow::before, .popover.bs-popover-auto[x-placement^=\"bottom\"] .arrow::before {\n      top: -11px;\n      border-bottom-color: rgba(0, 0, 0, 0.25);\n}\n.popover.bs-popover-bottom .arrow::after, .popover.bs-popover-auto[x-placement^=\"bottom\"] .arrow::after {\n      top: -10px;\n      border-bottom-color: #fff;\n}\n.popover.bs-popover-bottom .popover-header::before, .popover.bs-popover-auto[x-placement^=\"bottom\"] .popover-header::before {\n      position: absolute;\n      top: 0;\n      left: 50%;\n      display: block;\n      width: 20px;\n      margin-left: -10px;\n      content: \"\";\n      border-bottom: 1px solid #f7f7f7;\n}\n.popover.bs-popover-left, .popover.bs-popover-auto[x-placement^=\"left\"] {\n    margin-right: 10px;\n}\n.popover.bs-popover-left .arrow, .popover.bs-popover-auto[x-placement^=\"left\"] .arrow {\n      right: 0;\n}\n.popover.bs-popover-left .arrow::before, .popover.bs-popover-auto[x-placement^=\"left\"] .arrow::before,\n    .popover.bs-popover-left .arrow::after, .popover.bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      margin-top: -8px;\n      border-right-width: 0;\n}\n.popover.bs-popover-left .arrow::before, .popover.bs-popover-auto[x-placement^=\"left\"] .arrow::before {\n      right: -11px;\n      border-left-color: rgba(0, 0, 0, 0.25);\n}\n.popover.bs-popover-left .arrow::after, .popover.bs-popover-auto[x-placement^=\"left\"] .arrow::after {\n      right: -10px;\n      border-left-color: #fff;\n}\n.popover-header {\n  padding: 8px 14px;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  color: inherit;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n}\n.popover-header:empty {\n    display: none;\n}\n.popover-body {\n  padding: 9px 14px;\n  color: #536a85;\n}\n.carousel {\n  position: relative;\n}\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n}\n.carousel-item {\n  position: relative;\n  display: none;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  width: 100%;\n  transition: -webkit-transform 0.6s ease;\n  transition: transform 0.6s ease;\n  transition: transform 0.6s ease, -webkit-transform 0.6s ease;\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n  -webkit-perspective: 1000px;\n          perspective: 1000px;\n}\n.carousel-item.active,\n.carousel-item-next,\n.carousel-item-prev {\n  display: block;\n}\n.carousel-item-next,\n.carousel-item-prev {\n  position: absolute;\n  top: 0;\n}\n.carousel-item-next.carousel-item-left,\n.carousel-item-prev.carousel-item-right {\n  -webkit-transform: translateX(0);\n          transform: translateX(0);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-next.carousel-item-left,\n    .carousel-item-prev.carousel-item-right {\n      -webkit-transform: translate3d(0, 0, 0);\n              transform: translate3d(0, 0, 0);\n}\n}\n.carousel-item-next,\n.active.carousel-item-right {\n  -webkit-transform: translateX(100%);\n          transform: translateX(100%);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-next,\n    .active.carousel-item-right {\n      -webkit-transform: translate3d(100%, 0, 0);\n              transform: translate3d(100%, 0, 0);\n}\n}\n.carousel-item-prev,\n.active.carousel-item-left {\n  -webkit-transform: translateX(-100%);\n          transform: translateX(-100%);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-prev,\n    .active.carousel-item-left {\n      -webkit-transform: translate3d(-100%, 0, 0);\n              transform: translate3d(-100%, 0, 0);\n}\n}\n.carousel-control-prev,\n.carousel-control-next {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  width: 15%;\n  color: #fff;\n  text-align: center;\n  opacity: 0.5;\n}\n.carousel-control-prev:focus, .carousel-control-prev:hover,\n  .carousel-control-next:focus,\n  .carousel-control-next:hover {\n    color: #fff;\n    text-decoration: none;\n    outline: 0;\n    opacity: .9;\n}\n.carousel-control-prev {\n  left: 0;\n}\n.carousel-control-next {\n  right: 0;\n}\n.carousel-control-prev-icon,\n.carousel-control-next-icon {\n  display: inline-block;\n  width: 20px;\n  height: 20px;\n  background: transparent no-repeat center center;\n  background-size: 100% 100%;\n}\n.carousel-control-prev-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M4 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E\");\n}\n.carousel-control-next-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M1.5 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E\");\n}\n.carousel-indicators {\n  position: absolute;\n  right: 0;\n  bottom: 10px;\n  left: 0;\n  z-index: 15;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding-left: 0;\n  margin-right: 15%;\n  margin-left: 15%;\n  list-style: none;\n}\n.carousel-indicators li {\n    position: relative;\n    -webkit-box-flex: 0;\n        -ms-flex: 0 1 auto;\n            flex: 0 1 auto;\n    width: 30px;\n    height: 3px;\n    margin-right: 3px;\n    margin-left: 3px;\n    text-indent: -999px;\n    background-color: rgba(255, 255, 255, 0.5);\n}\n.carousel-indicators li::before {\n      position: absolute;\n      top: -10px;\n      left: 0;\n      display: inline-block;\n      width: 100%;\n      height: 10px;\n      content: \"\";\n}\n.carousel-indicators li::after {\n      position: absolute;\n      bottom: -10px;\n      left: 0;\n      display: inline-block;\n      width: 100%;\n      height: 10px;\n      content: \"\";\n}\n.carousel-indicators .active {\n    background-color: #fff;\n}\n.carousel-caption {\n  position: absolute;\n  right: 15%;\n  bottom: 20px;\n  left: 15%;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n}\n.align-baseline {\n  vertical-align: baseline !important;\n}\n.align-top {\n  vertical-align: top !important;\n}\n.align-middle {\n  vertical-align: middle !important;\n}\n.align-bottom {\n  vertical-align: bottom !important;\n}\n.align-text-bottom {\n  vertical-align: text-bottom !important;\n}\n.align-text-top {\n  vertical-align: text-top !important;\n}\n.bg-primary {\n  background-color: #20a8d8 !important;\n}\na.bg-primary:focus, a.bg-primary:hover {\n  background-color: #1985ac !important;\n}\n.bg-secondary {\n  background-color: #a4b7c1 !important;\n}\na.bg-secondary:focus, a.bg-secondary:hover {\n  background-color: #869fac !important;\n}\n.bg-success {\n  background-color: #4dbd74 !important;\n}\na.bg-success:focus, a.bg-success:hover {\n  background-color: #3a9d5d !important;\n}\n.bg-info {\n  background-color: #63c2de !important;\n}\na.bg-info:focus, a.bg-info:hover {\n  background-color: #39b2d5 !important;\n}\n.bg-warning {\n  background-color: #ffc107 !important;\n}\na.bg-warning:focus, a.bg-warning:hover {\n  background-color: #d39e00 !important;\n}\n.bg-danger {\n  background-color: #f86c6b !important;\n}\na.bg-danger:focus, a.bg-danger:hover {\n  background-color: #f63c3a !important;\n}\n.bg-light {\n  background-color: #f0f3f5 !important;\n}\na.bg-light:focus, a.bg-light:hover {\n  background-color: #d1dbe1 !important;\n}\n.bg-dark {\n  background-color: #29363d !important;\n}\na.bg-dark:focus, a.bg-dark:hover {\n  background-color: #151b1f !important;\n}\n.bg-white {\n  background-color: #fff !important;\n}\n.bg-transparent {\n  background-color: transparent !important;\n}\n.border {\n  border: 1px solid #c2cfd6 !important;\n}\n.border-0 {\n  border: 0 !important;\n}\n.border-top-0 {\n  border-top: 0 !important;\n}\n.border-right-0 {\n  border-right: 0 !important;\n}\n.border-bottom-0 {\n  border-bottom: 0 !important;\n}\n.border-left-0 {\n  border-left: 0 !important;\n}\n.border-primary {\n  border-color: #20a8d8 !important;\n}\n.border-secondary {\n  border-color: #a4b7c1 !important;\n}\n.border-success {\n  border-color: #4dbd74 !important;\n}\n.border-info {\n  border-color: #63c2de !important;\n}\n.border-warning {\n  border-color: #ffc107 !important;\n}\n.border-danger {\n  border-color: #f86c6b !important;\n}\n.border-light {\n  border-color: #f0f3f5 !important;\n}\n.border-dark {\n  border-color: #29363d !important;\n}\n.border-white {\n  border-color: #fff !important;\n}\n.rounded {\n  border-radius: 0.25rem !important;\n}\n.rounded-top {\n  border-top-left-radius: 0.25rem !important;\n  border-top-right-radius: 0.25rem !important;\n}\n.rounded-right {\n  border-top-right-radius: 0.25rem !important;\n  border-bottom-right-radius: 0.25rem !important;\n}\n.rounded-bottom {\n  border-bottom-right-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n.rounded-left {\n  border-top-left-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n.rounded-circle {\n  border-radius: 50%;\n}\n.rounded-0 {\n  border-radius: 0;\n}\n.clearfix::after {\n  display: block;\n  clear: both;\n  content: \"\";\n}\n.d-none {\n  display: none !important;\n}\n.d-inline {\n  display: inline !important;\n}\n.d-inline-block {\n  display: inline-block !important;\n}\n.d-block {\n  display: block !important;\n}\n.d-table {\n  display: table !important;\n}\n.d-table-cell {\n  display: table-cell !important;\n}\n.d-flex {\n  display: -webkit-box !important;\n  display: -ms-flexbox !important;\n  display: flex !important;\n}\n.d-inline-flex {\n  display: -webkit-inline-box !important;\n  display: -ms-inline-flexbox !important;\n  display: inline-flex !important;\n}\n@media (min-width: 576px) {\n.d-sm-none {\n    display: none !important;\n}\n.d-sm-inline {\n    display: inline !important;\n}\n.d-sm-inline-block {\n    display: inline-block !important;\n}\n.d-sm-block {\n    display: block !important;\n}\n.d-sm-table {\n    display: table !important;\n}\n.d-sm-table-cell {\n    display: table-cell !important;\n}\n.d-sm-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-sm-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 768px) {\n.d-md-none {\n    display: none !important;\n}\n.d-md-inline {\n    display: inline !important;\n}\n.d-md-inline-block {\n    display: inline-block !important;\n}\n.d-md-block {\n    display: block !important;\n}\n.d-md-table {\n    display: table !important;\n}\n.d-md-table-cell {\n    display: table-cell !important;\n}\n.d-md-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-md-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 992px) {\n.d-lg-none {\n    display: none !important;\n}\n.d-lg-inline {\n    display: inline !important;\n}\n.d-lg-inline-block {\n    display: inline-block !important;\n}\n.d-lg-block {\n    display: block !important;\n}\n.d-lg-table {\n    display: table !important;\n}\n.d-lg-table-cell {\n    display: table-cell !important;\n}\n.d-lg-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-lg-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 1200px) {\n.d-xl-none {\n    display: none !important;\n}\n.d-xl-inline {\n    display: inline !important;\n}\n.d-xl-inline-block {\n    display: inline-block !important;\n}\n.d-xl-block {\n    display: block !important;\n}\n.d-xl-table {\n    display: table !important;\n}\n.d-xl-table-cell {\n    display: table-cell !important;\n}\n.d-xl-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-xl-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n.d-print-block {\n  display: none !important;\n}\n@media print {\n.d-print-block {\n      display: block !important;\n}\n}\n.d-print-inline {\n  display: none !important;\n}\n@media print {\n.d-print-inline {\n      display: inline !important;\n}\n}\n.d-print-inline-block {\n  display: none !important;\n}\n@media print {\n.d-print-inline-block {\n      display: inline-block !important;\n}\n}\n@media print {\n.d-print-none {\n    display: none !important;\n}\n}\n.embed-responsive {\n  position: relative;\n  display: block;\n  width: 100%;\n  padding: 0;\n  overflow: hidden;\n}\n.embed-responsive::before {\n    display: block;\n    content: \"\";\n}\n.embed-responsive .embed-responsive-item,\n  .embed-responsive iframe,\n  .embed-responsive embed,\n  .embed-responsive object,\n  .embed-responsive video {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    border: 0;\n}\n.embed-responsive-21by9::before {\n  padding-top: 42.85714%;\n}\n.embed-responsive-16by9::before {\n  padding-top: 56.25%;\n}\n.embed-responsive-4by3::before {\n  padding-top: 75%;\n}\n.embed-responsive-1by1::before {\n  padding-top: 100%;\n}\n.flex-row {\n  -webkit-box-orient: horizontal !important;\n  -webkit-box-direction: normal !important;\n      -ms-flex-direction: row !important;\n          flex-direction: row !important;\n}\n.flex-column {\n  -webkit-box-orient: vertical !important;\n  -webkit-box-direction: normal !important;\n      -ms-flex-direction: column !important;\n          flex-direction: column !important;\n}\n.flex-row-reverse {\n  -webkit-box-orient: horizontal !important;\n  -webkit-box-direction: reverse !important;\n      -ms-flex-direction: row-reverse !important;\n          flex-direction: row-reverse !important;\n}\n.flex-column-reverse {\n  -webkit-box-orient: vertical !important;\n  -webkit-box-direction: reverse !important;\n      -ms-flex-direction: column-reverse !important;\n          flex-direction: column-reverse !important;\n}\n.flex-wrap {\n  -ms-flex-wrap: wrap !important;\n      flex-wrap: wrap !important;\n}\n.flex-nowrap {\n  -ms-flex-wrap: nowrap !important;\n      flex-wrap: nowrap !important;\n}\n.flex-wrap-reverse {\n  -ms-flex-wrap: wrap-reverse !important;\n      flex-wrap: wrap-reverse !important;\n}\n.justify-content-start {\n  -webkit-box-pack: start !important;\n      -ms-flex-pack: start !important;\n          justify-content: flex-start !important;\n}\n.justify-content-end {\n  -webkit-box-pack: end !important;\n      -ms-flex-pack: end !important;\n          justify-content: flex-end !important;\n}\n.justify-content-center {\n  -webkit-box-pack: center !important;\n      -ms-flex-pack: center !important;\n          justify-content: center !important;\n}\n.justify-content-between {\n  -webkit-box-pack: justify !important;\n      -ms-flex-pack: justify !important;\n          justify-content: space-between !important;\n}\n.justify-content-around {\n  -ms-flex-pack: distribute !important;\n      justify-content: space-around !important;\n}\n.align-items-start {\n  -webkit-box-align: start !important;\n      -ms-flex-align: start !important;\n          align-items: flex-start !important;\n}\n.align-items-end {\n  -webkit-box-align: end !important;\n      -ms-flex-align: end !important;\n          align-items: flex-end !important;\n}\n.align-items-center {\n  -webkit-box-align: center !important;\n      -ms-flex-align: center !important;\n          align-items: center !important;\n}\n.align-items-baseline {\n  -webkit-box-align: baseline !important;\n      -ms-flex-align: baseline !important;\n          align-items: baseline !important;\n}\n.align-items-stretch {\n  -webkit-box-align: stretch !important;\n      -ms-flex-align: stretch !important;\n          align-items: stretch !important;\n}\n.align-content-start {\n  -ms-flex-line-pack: start !important;\n      align-content: flex-start !important;\n}\n.align-content-end {\n  -ms-flex-line-pack: end !important;\n      align-content: flex-end !important;\n}\n.align-content-center {\n  -ms-flex-line-pack: center !important;\n      align-content: center !important;\n}\n.align-content-between {\n  -ms-flex-line-pack: justify !important;\n      align-content: space-between !important;\n}\n.align-content-around {\n  -ms-flex-line-pack: distribute !important;\n      align-content: space-around !important;\n}\n.align-content-stretch {\n  -ms-flex-line-pack: stretch !important;\n      align-content: stretch !important;\n}\n.align-self-auto {\n  -ms-flex-item-align: auto !important;\n      -ms-grid-row-align: auto !important;\n      align-self: auto !important;\n}\n.align-self-start {\n  -ms-flex-item-align: start !important;\n      align-self: flex-start !important;\n}\n.align-self-end {\n  -ms-flex-item-align: end !important;\n      align-self: flex-end !important;\n}\n.align-self-center {\n  -ms-flex-item-align: center !important;\n      -ms-grid-row-align: center !important;\n      align-self: center !important;\n}\n.align-self-baseline {\n  -ms-flex-item-align: baseline !important;\n      align-self: baseline !important;\n}\n.align-self-stretch {\n  -ms-flex-item-align: stretch !important;\n      -ms-grid-row-align: stretch !important;\n      align-self: stretch !important;\n}\n@media (min-width: 576px) {\n.flex-sm-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-sm-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-sm-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-sm-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-sm-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-sm-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-sm-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-sm-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-sm-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-sm-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-sm-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-sm-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-sm-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-sm-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-sm-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-sm-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-sm-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-sm-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-sm-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-sm-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-sm-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-sm-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-sm-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-sm-auto {\n    -ms-flex-item-align: auto !important;\n        -ms-grid-row-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-sm-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-sm-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-sm-center {\n    -ms-flex-item-align: center !important;\n        -ms-grid-row-align: center !important;\n        align-self: center !important;\n}\n.align-self-sm-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-sm-stretch {\n    -ms-flex-item-align: stretch !important;\n        -ms-grid-row-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 768px) {\n.flex-md-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-md-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-md-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-md-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-md-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-md-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-md-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-md-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-md-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-md-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-md-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-md-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-md-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-md-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-md-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-md-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-md-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-md-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-md-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-md-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-md-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-md-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-md-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-md-auto {\n    -ms-flex-item-align: auto !important;\n        -ms-grid-row-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-md-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-md-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-md-center {\n    -ms-flex-item-align: center !important;\n        -ms-grid-row-align: center !important;\n        align-self: center !important;\n}\n.align-self-md-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-md-stretch {\n    -ms-flex-item-align: stretch !important;\n        -ms-grid-row-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 992px) {\n.flex-lg-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-lg-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-lg-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-lg-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-lg-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-lg-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-lg-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-lg-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-lg-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-lg-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-lg-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-lg-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-lg-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-lg-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-lg-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-lg-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-lg-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-lg-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-lg-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-lg-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-lg-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-lg-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-lg-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-lg-auto {\n    -ms-flex-item-align: auto !important;\n        -ms-grid-row-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-lg-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-lg-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-lg-center {\n    -ms-flex-item-align: center !important;\n        -ms-grid-row-align: center !important;\n        align-self: center !important;\n}\n.align-self-lg-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-lg-stretch {\n    -ms-flex-item-align: stretch !important;\n        -ms-grid-row-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 1200px) {\n.flex-xl-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-xl-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-xl-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-xl-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-xl-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-xl-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-xl-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-xl-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-xl-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-xl-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-xl-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-xl-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-xl-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-xl-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-xl-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-xl-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-xl-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-xl-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-xl-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-xl-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-xl-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-xl-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-xl-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-xl-auto {\n    -ms-flex-item-align: auto !important;\n        -ms-grid-row-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-xl-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-xl-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-xl-center {\n    -ms-flex-item-align: center !important;\n        -ms-grid-row-align: center !important;\n        align-self: center !important;\n}\n.align-self-xl-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-xl-stretch {\n    -ms-flex-item-align: stretch !important;\n        -ms-grid-row-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n.float-left {\n  float: left !important;\n}\n.float-right {\n  float: right !important;\n}\n.float-none {\n  float: none !important;\n}\n@media (min-width: 576px) {\n.float-sm-left {\n    float: left !important;\n}\n.float-sm-right {\n    float: right !important;\n}\n.float-sm-none {\n    float: none !important;\n}\n}\n@media (min-width: 768px) {\n.float-md-left {\n    float: left !important;\n}\n.float-md-right {\n    float: right !important;\n}\n.float-md-none {\n    float: none !important;\n}\n}\n@media (min-width: 992px) {\n.float-lg-left {\n    float: left !important;\n}\n.float-lg-right {\n    float: right !important;\n}\n.float-lg-none {\n    float: none !important;\n}\n}\n@media (min-width: 1200px) {\n.float-xl-left {\n    float: left !important;\n}\n.float-xl-right {\n    float: right !important;\n}\n.float-xl-none {\n    float: none !important;\n}\n}\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1030;\n}\n@supports ((position: -webkit-sticky) or (position: sticky)) {\n.sticky-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n}\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  -webkit-clip-path: inset(50%);\n          clip-path: inset(50%);\n  border: 0;\n}\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  overflow: visible;\n  clip: auto;\n  white-space: normal;\n  -webkit-clip-path: none;\n          clip-path: none;\n}\n.w-25 {\n  width: 25% !important;\n}\n.w-50 {\n  width: 50% !important;\n}\n.w-75 {\n  width: 75% !important;\n}\n.w-100 {\n  width: 100% !important;\n}\n.h-25 {\n  height: 25% !important;\n}\n.h-50 {\n  height: 50% !important;\n}\n.h-75 {\n  height: 75% !important;\n}\n.h-100 {\n  height: 100% !important;\n}\n.mw-100 {\n  max-width: 100% !important;\n}\n.mh-100 {\n  max-height: 100% !important;\n}\n.m-0 {\n  margin: 0 !important;\n}\n.mt-0 {\n  margin-top: 0 !important;\n}\n.mr-0 {\n  margin-right: 0 !important;\n}\n.mb-0 {\n  margin-bottom: 0 !important;\n}\n.ml-0 {\n  margin-left: 0 !important;\n}\n.mx-0 {\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n}\n.my-0 {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n}\n.m-1 {\n  margin: 0.25rem !important;\n}\n.mt-1 {\n  margin-top: 0.25rem !important;\n}\n.mr-1 {\n  margin-right: 0.25rem !important;\n}\n.mb-1 {\n  margin-bottom: 0.25rem !important;\n}\n.ml-1 {\n  margin-left: 0.25rem !important;\n}\n.mx-1 {\n  margin-right: 0.25rem !important;\n  margin-left: 0.25rem !important;\n}\n.my-1 {\n  margin-top: 0.25rem !important;\n  margin-bottom: 0.25rem !important;\n}\n.m-2 {\n  margin: 0.5rem !important;\n}\n.mt-2 {\n  margin-top: 0.5rem !important;\n}\n.mr-2 {\n  margin-right: 0.5rem !important;\n}\n.mb-2 {\n  margin-bottom: 0.5rem !important;\n}\n.ml-2 {\n  margin-left: 0.5rem !important;\n}\n.mx-2 {\n  margin-right: 0.5rem !important;\n  margin-left: 0.5rem !important;\n}\n.my-2 {\n  margin-top: 0.5rem !important;\n  margin-bottom: 0.5rem !important;\n}\n.m-3 {\n  margin: 1rem !important;\n}\n.mt-3 {\n  margin-top: 1rem !important;\n}\n.mr-3 {\n  margin-right: 1rem !important;\n}\n.mb-3 {\n  margin-bottom: 1rem !important;\n}\n.ml-3 {\n  margin-left: 1rem !important;\n}\n.mx-3 {\n  margin-right: 1rem !important;\n  margin-left: 1rem !important;\n}\n.my-3 {\n  margin-top: 1rem !important;\n  margin-bottom: 1rem !important;\n}\n.m-4 {\n  margin: 1.5rem !important;\n}\n.mt-4 {\n  margin-top: 1.5rem !important;\n}\n.mr-4 {\n  margin-right: 1.5rem !important;\n}\n.mb-4 {\n  margin-bottom: 1.5rem !important;\n}\n.ml-4 {\n  margin-left: 1.5rem !important;\n}\n.mx-4 {\n  margin-right: 1.5rem !important;\n  margin-left: 1.5rem !important;\n}\n.my-4 {\n  margin-top: 1.5rem !important;\n  margin-bottom: 1.5rem !important;\n}\n.m-5 {\n  margin: 3rem !important;\n}\n.mt-5 {\n  margin-top: 3rem !important;\n}\n.mr-5 {\n  margin-right: 3rem !important;\n}\n.mb-5 {\n  margin-bottom: 3rem !important;\n}\n.ml-5 {\n  margin-left: 3rem !important;\n}\n.mx-5 {\n  margin-right: 3rem !important;\n  margin-left: 3rem !important;\n}\n.my-5 {\n  margin-top: 3rem !important;\n  margin-bottom: 3rem !important;\n}\n.p-0 {\n  padding: 0 !important;\n}\n.pt-0 {\n  padding-top: 0 !important;\n}\n.pr-0 {\n  padding-right: 0 !important;\n}\n.pb-0 {\n  padding-bottom: 0 !important;\n}\n.pl-0 {\n  padding-left: 0 !important;\n}\n.px-0 {\n  padding-right: 0 !important;\n  padding-left: 0 !important;\n}\n.py-0 {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n.p-1 {\n  padding: 0.25rem !important;\n}\n.pt-1 {\n  padding-top: 0.25rem !important;\n}\n.pr-1 {\n  padding-right: 0.25rem !important;\n}\n.pb-1 {\n  padding-bottom: 0.25rem !important;\n}\n.pl-1 {\n  padding-left: 0.25rem !important;\n}\n.px-1 {\n  padding-right: 0.25rem !important;\n  padding-left: 0.25rem !important;\n}\n.py-1 {\n  padding-top: 0.25rem !important;\n  padding-bottom: 0.25rem !important;\n}\n.p-2 {\n  padding: 0.5rem !important;\n}\n.pt-2 {\n  padding-top: 0.5rem !important;\n}\n.pr-2 {\n  padding-right: 0.5rem !important;\n}\n.pb-2 {\n  padding-bottom: 0.5rem !important;\n}\n.pl-2 {\n  padding-left: 0.5rem !important;\n}\n.px-2 {\n  padding-right: 0.5rem !important;\n  padding-left: 0.5rem !important;\n}\n.py-2 {\n  padding-top: 0.5rem !important;\n  padding-bottom: 0.5rem !important;\n}\n.p-3 {\n  padding: 1rem !important;\n}\n.pt-3 {\n  padding-top: 1rem !important;\n}\n.pr-3 {\n  padding-right: 1rem !important;\n}\n.pb-3 {\n  padding-bottom: 1rem !important;\n}\n.pl-3 {\n  padding-left: 1rem !important;\n}\n.px-3 {\n  padding-right: 1rem !important;\n  padding-left: 1rem !important;\n}\n.py-3 {\n  padding-top: 1rem !important;\n  padding-bottom: 1rem !important;\n}\n.p-4 {\n  padding: 1.5rem !important;\n}\n.pt-4 {\n  padding-top: 1.5rem !important;\n}\n.pr-4 {\n  padding-right: 1.5rem !important;\n}\n.pb-4 {\n  padding-bottom: 1.5rem !important;\n}\n.pl-4 {\n  padding-left: 1.5rem !important;\n}\n.px-4 {\n  padding-right: 1.5rem !important;\n  padding-left: 1.5rem !important;\n}\n.py-4 {\n  padding-top: 1.5rem !important;\n  padding-bottom: 1.5rem !important;\n}\n.p-5 {\n  padding: 3rem !important;\n}\n.pt-5 {\n  padding-top: 3rem !important;\n}\n.pr-5 {\n  padding-right: 3rem !important;\n}\n.pb-5 {\n  padding-bottom: 3rem !important;\n}\n.pl-5 {\n  padding-left: 3rem !important;\n}\n.px-5 {\n  padding-right: 3rem !important;\n  padding-left: 3rem !important;\n}\n.py-5 {\n  padding-top: 3rem !important;\n  padding-bottom: 3rem !important;\n}\n.m-auto {\n  margin: auto !important;\n}\n.mt-auto {\n  margin-top: auto !important;\n}\n.mr-auto {\n  margin-right: auto !important;\n}\n.mb-auto {\n  margin-bottom: auto !important;\n}\n.ml-auto {\n  margin-left: auto !important;\n}\n.mx-auto {\n  margin-right: auto !important;\n  margin-left: auto !important;\n}\n.my-auto {\n  margin-top: auto !important;\n  margin-bottom: auto !important;\n}\n@media (min-width: 576px) {\n.m-sm-0 {\n    margin: 0 !important;\n}\n.mt-sm-0 {\n    margin-top: 0 !important;\n}\n.mr-sm-0 {\n    margin-right: 0 !important;\n}\n.mb-sm-0 {\n    margin-bottom: 0 !important;\n}\n.ml-sm-0 {\n    margin-left: 0 !important;\n}\n.mx-sm-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n}\n.my-sm-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n}\n.m-sm-1 {\n    margin: 0.25rem !important;\n}\n.mt-sm-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-sm-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-sm-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-sm-1 {\n    margin-left: 0.25rem !important;\n}\n.mx-sm-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n}\n.my-sm-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n}\n.m-sm-2 {\n    margin: 0.5rem !important;\n}\n.mt-sm-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-sm-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-sm-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-sm-2 {\n    margin-left: 0.5rem !important;\n}\n.mx-sm-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n}\n.my-sm-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n}\n.m-sm-3 {\n    margin: 1rem !important;\n}\n.mt-sm-3 {\n    margin-top: 1rem !important;\n}\n.mr-sm-3 {\n    margin-right: 1rem !important;\n}\n.mb-sm-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-sm-3 {\n    margin-left: 1rem !important;\n}\n.mx-sm-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n}\n.my-sm-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n}\n.m-sm-4 {\n    margin: 1.5rem !important;\n}\n.mt-sm-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-sm-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-sm-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-sm-4 {\n    margin-left: 1.5rem !important;\n}\n.mx-sm-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n}\n.my-sm-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n}\n.m-sm-5 {\n    margin: 3rem !important;\n}\n.mt-sm-5 {\n    margin-top: 3rem !important;\n}\n.mr-sm-5 {\n    margin-right: 3rem !important;\n}\n.mb-sm-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-sm-5 {\n    margin-left: 3rem !important;\n}\n.mx-sm-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n}\n.my-sm-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n}\n.p-sm-0 {\n    padding: 0 !important;\n}\n.pt-sm-0 {\n    padding-top: 0 !important;\n}\n.pr-sm-0 {\n    padding-right: 0 !important;\n}\n.pb-sm-0 {\n    padding-bottom: 0 !important;\n}\n.pl-sm-0 {\n    padding-left: 0 !important;\n}\n.px-sm-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n}\n.py-sm-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n}\n.p-sm-1 {\n    padding: 0.25rem !important;\n}\n.pt-sm-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-sm-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-sm-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-sm-1 {\n    padding-left: 0.25rem !important;\n}\n.px-sm-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n}\n.py-sm-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n}\n.p-sm-2 {\n    padding: 0.5rem !important;\n}\n.pt-sm-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-sm-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-sm-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-sm-2 {\n    padding-left: 0.5rem !important;\n}\n.px-sm-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n}\n.py-sm-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n}\n.p-sm-3 {\n    padding: 1rem !important;\n}\n.pt-sm-3 {\n    padding-top: 1rem !important;\n}\n.pr-sm-3 {\n    padding-right: 1rem !important;\n}\n.pb-sm-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-sm-3 {\n    padding-left: 1rem !important;\n}\n.px-sm-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n}\n.py-sm-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n}\n.p-sm-4 {\n    padding: 1.5rem !important;\n}\n.pt-sm-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-sm-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-sm-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-sm-4 {\n    padding-left: 1.5rem !important;\n}\n.px-sm-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n}\n.py-sm-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n}\n.p-sm-5 {\n    padding: 3rem !important;\n}\n.pt-sm-5 {\n    padding-top: 3rem !important;\n}\n.pr-sm-5 {\n    padding-right: 3rem !important;\n}\n.pb-sm-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-sm-5 {\n    padding-left: 3rem !important;\n}\n.px-sm-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n}\n.py-sm-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n}\n.m-sm-auto {\n    margin: auto !important;\n}\n.mt-sm-auto {\n    margin-top: auto !important;\n}\n.mr-sm-auto {\n    margin-right: auto !important;\n}\n.mb-sm-auto {\n    margin-bottom: auto !important;\n}\n.ml-sm-auto {\n    margin-left: auto !important;\n}\n.mx-sm-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n}\n.my-sm-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n}\n}\n@media (min-width: 768px) {\n.m-md-0 {\n    margin: 0 !important;\n}\n.mt-md-0 {\n    margin-top: 0 !important;\n}\n.mr-md-0 {\n    margin-right: 0 !important;\n}\n.mb-md-0 {\n    margin-bottom: 0 !important;\n}\n.ml-md-0 {\n    margin-left: 0 !important;\n}\n.mx-md-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n}\n.my-md-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n}\n.m-md-1 {\n    margin: 0.25rem !important;\n}\n.mt-md-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-md-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-md-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-md-1 {\n    margin-left: 0.25rem !important;\n}\n.mx-md-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n}\n.my-md-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n}\n.m-md-2 {\n    margin: 0.5rem !important;\n}\n.mt-md-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-md-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-md-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-md-2 {\n    margin-left: 0.5rem !important;\n}\n.mx-md-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n}\n.my-md-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n}\n.m-md-3 {\n    margin: 1rem !important;\n}\n.mt-md-3 {\n    margin-top: 1rem !important;\n}\n.mr-md-3 {\n    margin-right: 1rem !important;\n}\n.mb-md-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-md-3 {\n    margin-left: 1rem !important;\n}\n.mx-md-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n}\n.my-md-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n}\n.m-md-4 {\n    margin: 1.5rem !important;\n}\n.mt-md-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-md-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-md-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-md-4 {\n    margin-left: 1.5rem !important;\n}\n.mx-md-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n}\n.my-md-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n}\n.m-md-5 {\n    margin: 3rem !important;\n}\n.mt-md-5 {\n    margin-top: 3rem !important;\n}\n.mr-md-5 {\n    margin-right: 3rem !important;\n}\n.mb-md-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-md-5 {\n    margin-left: 3rem !important;\n}\n.mx-md-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n}\n.my-md-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n}\n.p-md-0 {\n    padding: 0 !important;\n}\n.pt-md-0 {\n    padding-top: 0 !important;\n}\n.pr-md-0 {\n    padding-right: 0 !important;\n}\n.pb-md-0 {\n    padding-bottom: 0 !important;\n}\n.pl-md-0 {\n    padding-left: 0 !important;\n}\n.px-md-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n}\n.py-md-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n}\n.p-md-1 {\n    padding: 0.25rem !important;\n}\n.pt-md-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-md-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-md-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-md-1 {\n    padding-left: 0.25rem !important;\n}\n.px-md-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n}\n.py-md-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n}\n.p-md-2 {\n    padding: 0.5rem !important;\n}\n.pt-md-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-md-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-md-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-md-2 {\n    padding-left: 0.5rem !important;\n}\n.px-md-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n}\n.py-md-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n}\n.p-md-3 {\n    padding: 1rem !important;\n}\n.pt-md-3 {\n    padding-top: 1rem !important;\n}\n.pr-md-3 {\n    padding-right: 1rem !important;\n}\n.pb-md-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-md-3 {\n    padding-left: 1rem !important;\n}\n.px-md-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n}\n.py-md-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n}\n.p-md-4 {\n    padding: 1.5rem !important;\n}\n.pt-md-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-md-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-md-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-md-4 {\n    padding-left: 1.5rem !important;\n}\n.px-md-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n}\n.py-md-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n}\n.p-md-5 {\n    padding: 3rem !important;\n}\n.pt-md-5 {\n    padding-top: 3rem !important;\n}\n.pr-md-5 {\n    padding-right: 3rem !important;\n}\n.pb-md-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-md-5 {\n    padding-left: 3rem !important;\n}\n.px-md-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n}\n.py-md-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n}\n.m-md-auto {\n    margin: auto !important;\n}\n.mt-md-auto {\n    margin-top: auto !important;\n}\n.mr-md-auto {\n    margin-right: auto !important;\n}\n.mb-md-auto {\n    margin-bottom: auto !important;\n}\n.ml-md-auto {\n    margin-left: auto !important;\n}\n.mx-md-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n}\n.my-md-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n}\n}\n@media (min-width: 992px) {\n.m-lg-0 {\n    margin: 0 !important;\n}\n.mt-lg-0 {\n    margin-top: 0 !important;\n}\n.mr-lg-0 {\n    margin-right: 0 !important;\n}\n.mb-lg-0 {\n    margin-bottom: 0 !important;\n}\n.ml-lg-0 {\n    margin-left: 0 !important;\n}\n.mx-lg-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n}\n.my-lg-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n}\n.m-lg-1 {\n    margin: 0.25rem !important;\n}\n.mt-lg-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-lg-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-lg-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-lg-1 {\n    margin-left: 0.25rem !important;\n}\n.mx-lg-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n}\n.my-lg-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n}\n.m-lg-2 {\n    margin: 0.5rem !important;\n}\n.mt-lg-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-lg-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-lg-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-lg-2 {\n    margin-left: 0.5rem !important;\n}\n.mx-lg-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n}\n.my-lg-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n}\n.m-lg-3 {\n    margin: 1rem !important;\n}\n.mt-lg-3 {\n    margin-top: 1rem !important;\n}\n.mr-lg-3 {\n    margin-right: 1rem !important;\n}\n.mb-lg-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-lg-3 {\n    margin-left: 1rem !important;\n}\n.mx-lg-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n}\n.my-lg-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n}\n.m-lg-4 {\n    margin: 1.5rem !important;\n}\n.mt-lg-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-lg-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-lg-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-lg-4 {\n    margin-left: 1.5rem !important;\n}\n.mx-lg-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n}\n.my-lg-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n}\n.m-lg-5 {\n    margin: 3rem !important;\n}\n.mt-lg-5 {\n    margin-top: 3rem !important;\n}\n.mr-lg-5 {\n    margin-right: 3rem !important;\n}\n.mb-lg-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-lg-5 {\n    margin-left: 3rem !important;\n}\n.mx-lg-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n}\n.my-lg-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n}\n.p-lg-0 {\n    padding: 0 !important;\n}\n.pt-lg-0 {\n    padding-top: 0 !important;\n}\n.pr-lg-0 {\n    padding-right: 0 !important;\n}\n.pb-lg-0 {\n    padding-bottom: 0 !important;\n}\n.pl-lg-0 {\n    padding-left: 0 !important;\n}\n.px-lg-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n}\n.py-lg-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n}\n.p-lg-1 {\n    padding: 0.25rem !important;\n}\n.pt-lg-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-lg-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-lg-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-lg-1 {\n    padding-left: 0.25rem !important;\n}\n.px-lg-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n}\n.py-lg-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n}\n.p-lg-2 {\n    padding: 0.5rem !important;\n}\n.pt-lg-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-lg-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-lg-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-lg-2 {\n    padding-left: 0.5rem !important;\n}\n.px-lg-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n}\n.py-lg-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n}\n.p-lg-3 {\n    padding: 1rem !important;\n}\n.pt-lg-3 {\n    padding-top: 1rem !important;\n}\n.pr-lg-3 {\n    padding-right: 1rem !important;\n}\n.pb-lg-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-lg-3 {\n    padding-left: 1rem !important;\n}\n.px-lg-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n}\n.py-lg-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n}\n.p-lg-4 {\n    padding: 1.5rem !important;\n}\n.pt-lg-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-lg-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-lg-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-lg-4 {\n    padding-left: 1.5rem !important;\n}\n.px-lg-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n}\n.py-lg-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n}\n.p-lg-5 {\n    padding: 3rem !important;\n}\n.pt-lg-5 {\n    padding-top: 3rem !important;\n}\n.pr-lg-5 {\n    padding-right: 3rem !important;\n}\n.pb-lg-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-lg-5 {\n    padding-left: 3rem !important;\n}\n.px-lg-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n}\n.py-lg-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n}\n.m-lg-auto {\n    margin: auto !important;\n}\n.mt-lg-auto {\n    margin-top: auto !important;\n}\n.mr-lg-auto {\n    margin-right: auto !important;\n}\n.mb-lg-auto {\n    margin-bottom: auto !important;\n}\n.ml-lg-auto {\n    margin-left: auto !important;\n}\n.mx-lg-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n}\n.my-lg-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n}\n}\n@media (min-width: 1200px) {\n.m-xl-0 {\n    margin: 0 !important;\n}\n.mt-xl-0 {\n    margin-top: 0 !important;\n}\n.mr-xl-0 {\n    margin-right: 0 !important;\n}\n.mb-xl-0 {\n    margin-bottom: 0 !important;\n}\n.ml-xl-0 {\n    margin-left: 0 !important;\n}\n.mx-xl-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n}\n.my-xl-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n}\n.m-xl-1 {\n    margin: 0.25rem !important;\n}\n.mt-xl-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-xl-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-xl-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-xl-1 {\n    margin-left: 0.25rem !important;\n}\n.mx-xl-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n}\n.my-xl-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n}\n.m-xl-2 {\n    margin: 0.5rem !important;\n}\n.mt-xl-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-xl-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-xl-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-xl-2 {\n    margin-left: 0.5rem !important;\n}\n.mx-xl-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n}\n.my-xl-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n}\n.m-xl-3 {\n    margin: 1rem !important;\n}\n.mt-xl-3 {\n    margin-top: 1rem !important;\n}\n.mr-xl-3 {\n    margin-right: 1rem !important;\n}\n.mb-xl-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-xl-3 {\n    margin-left: 1rem !important;\n}\n.mx-xl-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n}\n.my-xl-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n}\n.m-xl-4 {\n    margin: 1.5rem !important;\n}\n.mt-xl-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-xl-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-xl-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-xl-4 {\n    margin-left: 1.5rem !important;\n}\n.mx-xl-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n}\n.my-xl-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n}\n.m-xl-5 {\n    margin: 3rem !important;\n}\n.mt-xl-5 {\n    margin-top: 3rem !important;\n}\n.mr-xl-5 {\n    margin-right: 3rem !important;\n}\n.mb-xl-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-xl-5 {\n    margin-left: 3rem !important;\n}\n.mx-xl-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n}\n.my-xl-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n}\n.p-xl-0 {\n    padding: 0 !important;\n}\n.pt-xl-0 {\n    padding-top: 0 !important;\n}\n.pr-xl-0 {\n    padding-right: 0 !important;\n}\n.pb-xl-0 {\n    padding-bottom: 0 !important;\n}\n.pl-xl-0 {\n    padding-left: 0 !important;\n}\n.px-xl-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n}\n.py-xl-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n}\n.p-xl-1 {\n    padding: 0.25rem !important;\n}\n.pt-xl-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-xl-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-xl-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-xl-1 {\n    padding-left: 0.25rem !important;\n}\n.px-xl-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n}\n.py-xl-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n}\n.p-xl-2 {\n    padding: 0.5rem !important;\n}\n.pt-xl-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-xl-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-xl-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-xl-2 {\n    padding-left: 0.5rem !important;\n}\n.px-xl-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n}\n.py-xl-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n}\n.p-xl-3 {\n    padding: 1rem !important;\n}\n.pt-xl-3 {\n    padding-top: 1rem !important;\n}\n.pr-xl-3 {\n    padding-right: 1rem !important;\n}\n.pb-xl-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-xl-3 {\n    padding-left: 1rem !important;\n}\n.px-xl-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n}\n.py-xl-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n}\n.p-xl-4 {\n    padding: 1.5rem !important;\n}\n.pt-xl-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-xl-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-xl-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-xl-4 {\n    padding-left: 1.5rem !important;\n}\n.px-xl-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n}\n.py-xl-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n}\n.p-xl-5 {\n    padding: 3rem !important;\n}\n.pt-xl-5 {\n    padding-top: 3rem !important;\n}\n.pr-xl-5 {\n    padding-right: 3rem !important;\n}\n.pb-xl-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-xl-5 {\n    padding-left: 3rem !important;\n}\n.px-xl-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n}\n.py-xl-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n}\n.m-xl-auto {\n    margin: auto !important;\n}\n.mt-xl-auto {\n    margin-top: auto !important;\n}\n.mr-xl-auto {\n    margin-right: auto !important;\n}\n.mb-xl-auto {\n    margin-bottom: auto !important;\n}\n.ml-xl-auto {\n    margin-left: auto !important;\n}\n.mx-xl-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n}\n.my-xl-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n}\n}\n.text-justify {\n  text-align: justify !important;\n}\n.text-nowrap {\n  white-space: nowrap !important;\n}\n.text-truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.text-left {\n  text-align: left !important;\n}\n.text-right {\n  text-align: right !important;\n}\n.text-center {\n  text-align: center !important;\n}\n@media (min-width: 576px) {\n.text-sm-left {\n    text-align: left !important;\n}\n.text-sm-right {\n    text-align: right !important;\n}\n.text-sm-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 768px) {\n.text-md-left {\n    text-align: left !important;\n}\n.text-md-right {\n    text-align: right !important;\n}\n.text-md-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 992px) {\n.text-lg-left {\n    text-align: left !important;\n}\n.text-lg-right {\n    text-align: right !important;\n}\n.text-lg-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 1200px) {\n.text-xl-left {\n    text-align: left !important;\n}\n.text-xl-right {\n    text-align: right !important;\n}\n.text-xl-center {\n    text-align: center !important;\n}\n}\n.text-lowercase {\n  text-transform: lowercase !important;\n}\n.text-uppercase {\n  text-transform: uppercase !important;\n}\n.text-capitalize {\n  text-transform: capitalize !important;\n}\n.font-weight-normal {\n  font-weight: normal;\n}\n.font-weight-bold {\n  font-weight: bold;\n}\n.font-italic {\n  font-style: italic;\n}\n.text-white {\n  color: #fff !important;\n}\n.text-primary {\n  color: #20a8d8 !important;\n}\na.text-primary:focus, a.text-primary:hover {\n  color: #1985ac !important;\n}\n.text-secondary {\n  color: #a4b7c1 !important;\n}\na.text-secondary:focus, a.text-secondary:hover {\n  color: #869fac !important;\n}\n.text-success {\n  color: #4dbd74 !important;\n}\na.text-success:focus, a.text-success:hover {\n  color: #3a9d5d !important;\n}\n.text-info {\n  color: #63c2de !important;\n}\na.text-info:focus, a.text-info:hover {\n  color: #39b2d5 !important;\n}\n.text-warning {\n  color: #ffc107 !important;\n}\na.text-warning:focus, a.text-warning:hover {\n  color: #d39e00 !important;\n}\n.text-danger {\n  color: #f86c6b !important;\n}\na.text-danger:focus, a.text-danger:hover {\n  color: #f63c3a !important;\n}\n.text-light {\n  color: #f0f3f5 !important;\n}\na.text-light:focus, a.text-light:hover {\n  color: #d1dbe1 !important;\n}\n.text-dark {\n  color: #29363d !important;\n}\na.text-dark:focus, a.text-dark:hover {\n  color: #151b1f !important;\n}\n.text-muted {\n  color: #536c79 !important;\n}\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n.visible {\n  visibility: visible !important;\n}\n.invisible {\n  visibility: hidden !important;\n}\n.chart-legend,\n.bar-legend,\n.line-legend,\n.pie-legend,\n.radar-legend,\n.polararea-legend,\n.doughnut-legend {\n  list-style-type: none;\n  margin-top: 5px;\n  text-align: center;\n  -webkit-padding-start: 0;\n  -moz-padding-start: 0;\n  padding-left: 0;\n}\n.chart-legend li,\n.bar-legend li,\n.line-legend li,\n.pie-legend li,\n.radar-legend li,\n.polararea-legend li,\n.doughnut-legend li {\n  display: inline-block;\n  white-space: nowrap;\n  position: relative;\n  margin-bottom: 4px;\n  padding: 2px 8px 2px 28px;\n  font-size: smaller;\n  cursor: default;\n}\n.chart-legend li span,\n.bar-legend li span,\n.line-legend li span,\n.pie-legend li span,\n.radar-legend li span,\n.polararea-legend li span,\n.doughnut-legend li span {\n  display: block;\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 20px;\n  height: 20px;\n}\nbody {\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n}\n.font-xs {\n  font-size: .75rem !important;\n}\n.font-sm {\n  font-size: .85rem !important;\n}\n.font-lg {\n  font-size: 1rem !important;\n}\n.font-xl {\n  font-size: 1.25rem !important;\n}\n.font-2xl {\n  font-size: 1.5rem !important;\n}\n.font-3xl {\n  font-size: 1.75rem !important;\n}\n.font-4xl {\n  font-size: 2rem !important;\n}\n.font-5xl {\n  font-size: 2.5rem !important;\n}\n.animated {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n}\n.animated.infinite {\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n}\n.animated.hinge {\n  -webkit-animation-duration: 2s;\n  animation-duration: 2s;\n}\n@-webkit-keyframes fadeIn {\nfrom {\n    opacity: 0;\n}\nto {\n    opacity: 1;\n}\n}\n@keyframes fadeIn {\nfrom {\n    opacity: 0;\n}\nto {\n    opacity: 1;\n}\n}\n.fadeIn {\n  -webkit-animation-name: fadeIn;\n  animation-name: fadeIn;\n}\n.aside-menu {\n  z-index: 1019;\n  width: 250px;\n  color: #29363d;\n  background: #fff;\n  border-left: 1px solid #c2cfd6;\n}\n.aside-menu .nav-tabs {\n    border-color: #c2cfd6;\n}\n.aside-menu .nav-tabs .nav-link, .aside-menu .nav-tabs .navbar .dropdown-toggle, .navbar .aside-menu .nav-tabs .dropdown-toggle {\n      padding: 0.75rem 1rem;\n      color: #536a85;\n      border-top: 0;\n}\n.aside-menu .nav-tabs .nav-link.active, .aside-menu .nav-tabs .navbar .active.dropdown-toggle, .navbar .aside-menu .nav-tabs .active.dropdown-toggle {\n        color: #20a8d8;\n        border-right-color: #c2cfd6;\n        border-left-color: #c2cfd6;\n}\n.aside-menu .nav-tabs .nav-item:first-child .nav-link, .aside-menu .nav-tabs .nav-item:first-child .navbar .dropdown-toggle, .navbar .aside-menu .nav-tabs .nav-item:first-child .dropdown-toggle {\n      border-left: 0;\n}\n.aside-menu .tab-content {\n    position: relative;\n    overflow-x: hidden;\n    overflow-y: auto;\n    border: 0;\n    border-top: 1px solid #c2cfd6;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.aside-menu .tab-content::-webkit-scrollbar {\n      width: 10px;\n      margin-left: -10px;\n      -webkit-appearance: none;\n}\n.aside-menu .tab-content::-webkit-scrollbar-track {\n      background-color: white;\n      border-right: 1px solid #f2f2f2;\n      border-left: 1px solid #f2f2f2;\n}\n.aside-menu .tab-content::-webkit-scrollbar-thumb {\n      height: 50px;\n      background-color: #e6e6e6;\n      background-clip: content-box;\n      border-color: transparent;\n      border-style: solid;\n      border-width: 1px 2px;\n}\n.aside-menu .tab-content .tab-pane {\n      padding: 0;\n}\n.img-avatar {\n  border-radius: 50em;\n}\n.avatar {\n  position: relative;\n  display: inline-block;\n  width: 36px;\n}\n.avatar .img-avatar {\n    width: 36px;\n    height: 36px;\n}\n.avatar .avatar-status {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    display: block;\n    width: 10px;\n    height: 10px;\n    border: 1px solid #fff;\n    border-radius: 50em;\n}\n.avatar.avatar-xs {\n  position: relative;\n  display: inline-block;\n  width: 20px;\n}\n.avatar.avatar-xs .img-avatar {\n    width: 20px;\n    height: 20px;\n}\n.avatar.avatar-xs .avatar-status {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    display: block;\n    width: 8px;\n    height: 8px;\n    border: 1px solid #fff;\n    border-radius: 50em;\n}\n.avatar.avatar-sm {\n  position: relative;\n  display: inline-block;\n  width: 24px;\n}\n.avatar.avatar-sm .img-avatar {\n    width: 24px;\n    height: 24px;\n}\n.avatar.avatar-sm .avatar-status {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    display: block;\n    width: 8px;\n    height: 8px;\n    border: 1px solid #fff;\n    border-radius: 50em;\n}\n.avatar.avatar-lg {\n  position: relative;\n  display: inline-block;\n  width: 72px;\n}\n.avatar.avatar-lg .img-avatar {\n    width: 72px;\n    height: 72px;\n}\n.avatar.avatar-lg .avatar-status {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    display: block;\n    width: 12px;\n    height: 12px;\n    border: 1px solid #fff;\n    border-radius: 50em;\n}\n.avatars-stack .avatar.avatar-xs {\n  margin-right: -10px;\n}\n.avatars-stack .avatar {\n  margin-right: -15px;\n  transition: margin-left 0.25s, margin-right 0.25s;\n}\n.avatars-stack .avatar:hover {\n    margin-right: 0 !important;\n}\n.badge-pill {\n  border-radius: 10rem;\n}\n.breadcrumb-menu {\n  position: absolute;\n  top: 0;\n  right: 1rem;\n}\n.breadcrumb-menu::before {\n    display: none;\n}\n.breadcrumb-menu .btn {\n    padding-top: 0.75rem;\n    padding-bottom: 0.75rem;\n}\n.breadcrumb-menu .btn {\n    color: #536c79;\n}\n.breadcrumb-menu .btn:hover, .breadcrumb-menu .btn.active {\n      color: #536a85;\n      background: transparent;\n}\n.breadcrumb-menu .open .btn {\n    color: #536a85;\n    background: transparent;\n}\n.breadcrumb-menu .dropdown-menu {\n    min-width: 180px;\n    line-height: 1.5;\n}\n.breadcrumb {\n  position: relative;\n  margin-bottom: 1.5rem;\n  border-bottom: 1px solid #c2cfd6;\n}\nbutton {\n  cursor: pointer;\n}\n.btn .badge {\n  position: absolute;\n  top: 2px;\n  right: 6px;\n  font-size: 9px;\n}\n.btn-transparent {\n  color: #fff;\n  background-color: transparent;\n  border-color: transparent;\n}\n.btn [class^=\"icon-\"], .btn [class*=\" icon-\"] {\n  display: inline-block;\n  margin-top: -2px;\n  vertical-align: middle;\n}\n.btn-facebook,\n.btn-twitter,\n.btn-linkedin,\n.btn-flickr,\n.btn-tumblr,\n.btn-xing,\n.btn-github,\n.btn-html5,\n.btn-openid,\n.btn-stack-overflow,\n.btn-youtube,\n.btn-css3,\n.btn-dribbble,\n.btn-google-plus,\n.btn-instagram,\n.btn-pinterest,\n.btn-vk,\n.btn-yahoo,\n.btn-behance,\n.btn-dropbox,\n.btn-reddit,\n.btn-spotify,\n.btn-vine,\n.btn-foursquare,\n.btn-vimeo {\n  position: relative;\n  overflow: hidden;\n  color: #fff !important;\n  text-align: center;\n  padding: 0.5rem 0.75rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  border: 0;\n}\n.btn-facebook::before,\n  .btn-twitter::before,\n  .btn-linkedin::before,\n  .btn-flickr::before,\n  .btn-tumblr::before,\n  .btn-xing::before,\n  .btn-github::before,\n  .btn-html5::before,\n  .btn-openid::before,\n  .btn-stack-overflow::before,\n  .btn-youtube::before,\n  .btn-css3::before,\n  .btn-dribbble::before,\n  .btn-google-plus::before,\n  .btn-instagram::before,\n  .btn-pinterest::before,\n  .btn-vk::before,\n  .btn-yahoo::before,\n  .btn-behance::before,\n  .btn-dropbox::before,\n  .btn-reddit::before,\n  .btn-spotify::before,\n  .btn-vine::before,\n  .btn-foursquare::before,\n  .btn-vimeo::before {\n    position: absolute;\n    top: 0;\n    left: 0;\n    display: block;\n    font-family: \"FontAwesome\";\n    font-style: normal;\n    font-weight: normal;\n    -moz-osx-font-smoothing: grayscale;\n    -webkit-font-smoothing: antialiased;\n}\n.btn-facebook:hover,\n  .btn-twitter:hover,\n  .btn-linkedin:hover,\n  .btn-flickr:hover,\n  .btn-tumblr:hover,\n  .btn-xing:hover,\n  .btn-github:hover,\n  .btn-html5:hover,\n  .btn-openid:hover,\n  .btn-stack-overflow:hover,\n  .btn-youtube:hover,\n  .btn-css3:hover,\n  .btn-dribbble:hover,\n  .btn-google-plus:hover,\n  .btn-instagram:hover,\n  .btn-pinterest:hover,\n  .btn-vk:hover,\n  .btn-yahoo:hover,\n  .btn-behance:hover,\n  .btn-dropbox:hover,\n  .btn-reddit:hover,\n  .btn-spotify:hover,\n  .btn-vine:hover,\n  .btn-foursquare:hover,\n  .btn-vimeo:hover {\n    color: #fff;\n}\n.btn-facebook.icon span,\n  .btn-twitter.icon span,\n  .btn-linkedin.icon span,\n  .btn-flickr.icon span,\n  .btn-tumblr.icon span,\n  .btn-xing.icon span,\n  .btn-github.icon span,\n  .btn-html5.icon span,\n  .btn-openid.icon span,\n  .btn-stack-overflow.icon span,\n  .btn-youtube.icon span,\n  .btn-css3.icon span,\n  .btn-dribbble.icon span,\n  .btn-google-plus.icon span,\n  .btn-instagram.icon span,\n  .btn-pinterest.icon span,\n  .btn-vk.icon span,\n  .btn-yahoo.icon span,\n  .btn-behance.icon span,\n  .btn-dropbox.icon span,\n  .btn-reddit.icon span,\n  .btn-spotify.icon span,\n  .btn-vine.icon span,\n  .btn-foursquare.icon span,\n  .btn-vimeo.icon span {\n    display: none;\n}\n.btn-facebook.text::before,\n  .btn-twitter.text::before,\n  .btn-linkedin.text::before,\n  .btn-flickr.text::before,\n  .btn-tumblr.text::before,\n  .btn-xing.text::before,\n  .btn-github.text::before,\n  .btn-html5.text::before,\n  .btn-openid.text::before,\n  .btn-stack-overflow.text::before,\n  .btn-youtube.text::before,\n  .btn-css3.text::before,\n  .btn-dribbble.text::before,\n  .btn-google-plus.text::before,\n  .btn-instagram.text::before,\n  .btn-pinterest.text::before,\n  .btn-vk.text::before,\n  .btn-yahoo.text::before,\n  .btn-behance.text::before,\n  .btn-dropbox.text::before,\n  .btn-reddit.text::before,\n  .btn-spotify.text::before,\n  .btn-vine.text::before,\n  .btn-foursquare.text::before,\n  .btn-vimeo.text::before {\n    display: none;\n}\n.btn-facebook.text span,\n  .btn-twitter.text span,\n  .btn-linkedin.text span,\n  .btn-flickr.text span,\n  .btn-tumblr.text span,\n  .btn-xing.text span,\n  .btn-github.text span,\n  .btn-html5.text span,\n  .btn-openid.text span,\n  .btn-stack-overflow.text span,\n  .btn-youtube.text span,\n  .btn-css3.text span,\n  .btn-dribbble.text span,\n  .btn-google-plus.text span,\n  .btn-instagram.text span,\n  .btn-pinterest.text span,\n  .btn-vk.text span,\n  .btn-yahoo.text span,\n  .btn-behance.text span,\n  .btn-dropbox.text span,\n  .btn-reddit.text span,\n  .btn-spotify.text span,\n  .btn-vine.text span,\n  .btn-foursquare.text span,\n  .btn-vimeo.text span {\n    margin-left: 0 !important;\n}\n.btn-facebook::before,\n  .btn-twitter::before,\n  .btn-linkedin::before,\n  .btn-flickr::before,\n  .btn-tumblr::before,\n  .btn-xing::before,\n  .btn-github::before,\n  .btn-html5::before,\n  .btn-openid::before,\n  .btn-stack-overflow::before,\n  .btn-youtube::before,\n  .btn-css3::before,\n  .btn-dribbble::before,\n  .btn-google-plus::before,\n  .btn-instagram::before,\n  .btn-pinterest::before,\n  .btn-vk::before,\n  .btn-yahoo::before,\n  .btn-behance::before,\n  .btn-dropbox::before,\n  .btn-reddit::before,\n  .btn-spotify::before,\n  .btn-vine::before,\n  .btn-foursquare::before,\n  .btn-vimeo::before {\n    width: 2.3125rem;\n    height: 2.3125rem;\n    padding: 0.5rem 0;\n    font-size: 0.875rem;\n    line-height: 1.5;\n}\n.btn-facebook span,\n  .btn-twitter span,\n  .btn-linkedin span,\n  .btn-flickr span,\n  .btn-tumblr span,\n  .btn-xing span,\n  .btn-github span,\n  .btn-html5 span,\n  .btn-openid span,\n  .btn-stack-overflow span,\n  .btn-youtube span,\n  .btn-css3 span,\n  .btn-dribbble span,\n  .btn-google-plus span,\n  .btn-instagram span,\n  .btn-pinterest span,\n  .btn-vk span,\n  .btn-yahoo span,\n  .btn-behance span,\n  .btn-dropbox span,\n  .btn-reddit span,\n  .btn-spotify span,\n  .btn-vine span,\n  .btn-foursquare span,\n  .btn-vimeo span {\n    margin-left: 2.3125rem;\n}\n.btn-facebook.icon,\n  .btn-twitter.icon,\n  .btn-linkedin.icon,\n  .btn-flickr.icon,\n  .btn-tumblr.icon,\n  .btn-xing.icon,\n  .btn-github.icon,\n  .btn-html5.icon,\n  .btn-openid.icon,\n  .btn-stack-overflow.icon,\n  .btn-youtube.icon,\n  .btn-css3.icon,\n  .btn-dribbble.icon,\n  .btn-google-plus.icon,\n  .btn-instagram.icon,\n  .btn-pinterest.icon,\n  .btn-vk.icon,\n  .btn-yahoo.icon,\n  .btn-behance.icon,\n  .btn-dropbox.icon,\n  .btn-reddit.icon,\n  .btn-spotify.icon,\n  .btn-vine.icon,\n  .btn-foursquare.icon,\n  .btn-vimeo.icon {\n    width: 2.3125rem;\n    height: 2.3125rem;\n}\n.btn-facebook.btn-lg, .btn-group-lg > .btn-facebook.btn,\n  .btn-twitter.btn-lg,\n  .btn-group-lg > .btn-twitter.btn,\n  .btn-linkedin.btn-lg,\n  .btn-group-lg > .btn-linkedin.btn,\n  .btn-flickr.btn-lg,\n  .btn-group-lg > .btn-flickr.btn,\n  .btn-tumblr.btn-lg,\n  .btn-group-lg > .btn-tumblr.btn,\n  .btn-xing.btn-lg,\n  .btn-group-lg > .btn-xing.btn,\n  .btn-github.btn-lg,\n  .btn-group-lg > .btn-github.btn,\n  .btn-html5.btn-lg,\n  .btn-group-lg > .btn-html5.btn,\n  .btn-openid.btn-lg,\n  .btn-group-lg > .btn-openid.btn,\n  .btn-stack-overflow.btn-lg,\n  .btn-group-lg > .btn-stack-overflow.btn,\n  .btn-youtube.btn-lg,\n  .btn-group-lg > .btn-youtube.btn,\n  .btn-css3.btn-lg,\n  .btn-group-lg > .btn-css3.btn,\n  .btn-dribbble.btn-lg,\n  .btn-group-lg > .btn-dribbble.btn,\n  .btn-google-plus.btn-lg,\n  .btn-group-lg > .btn-google-plus.btn,\n  .btn-instagram.btn-lg,\n  .btn-group-lg > .btn-instagram.btn,\n  .btn-pinterest.btn-lg,\n  .btn-group-lg > .btn-pinterest.btn,\n  .btn-vk.btn-lg,\n  .btn-group-lg > .btn-vk.btn,\n  .btn-yahoo.btn-lg,\n  .btn-group-lg > .btn-yahoo.btn,\n  .btn-behance.btn-lg,\n  .btn-group-lg > .btn-behance.btn,\n  .btn-dropbox.btn-lg,\n  .btn-group-lg > .btn-dropbox.btn,\n  .btn-reddit.btn-lg,\n  .btn-group-lg > .btn-reddit.btn,\n  .btn-spotify.btn-lg,\n  .btn-group-lg > .btn-spotify.btn,\n  .btn-vine.btn-lg,\n  .btn-group-lg > .btn-vine.btn,\n  .btn-foursquare.btn-lg,\n  .btn-group-lg > .btn-foursquare.btn,\n  .btn-vimeo.btn-lg,\n  .btn-group-lg > .btn-vimeo.btn {\n    padding: 0.5rem 1rem;\n    font-size: 1.25rem;\n    line-height: 1.5;\n    border: 0;\n}\n.btn-facebook.btn-lg::before, .btn-group-lg > .btn-facebook.btn::before,\n    .btn-twitter.btn-lg::before,\n    .btn-group-lg > .btn-twitter.btn::before,\n    .btn-linkedin.btn-lg::before,\n    .btn-group-lg > .btn-linkedin.btn::before,\n    .btn-flickr.btn-lg::before,\n    .btn-group-lg > .btn-flickr.btn::before,\n    .btn-tumblr.btn-lg::before,\n    .btn-group-lg > .btn-tumblr.btn::before,\n    .btn-xing.btn-lg::before,\n    .btn-group-lg > .btn-xing.btn::before,\n    .btn-github.btn-lg::before,\n    .btn-group-lg > .btn-github.btn::before,\n    .btn-html5.btn-lg::before,\n    .btn-group-lg > .btn-html5.btn::before,\n    .btn-openid.btn-lg::before,\n    .btn-group-lg > .btn-openid.btn::before,\n    .btn-stack-overflow.btn-lg::before,\n    .btn-group-lg > .btn-stack-overflow.btn::before,\n    .btn-youtube.btn-lg::before,\n    .btn-group-lg > .btn-youtube.btn::before,\n    .btn-css3.btn-lg::before,\n    .btn-group-lg > .btn-css3.btn::before,\n    .btn-dribbble.btn-lg::before,\n    .btn-group-lg > .btn-dribbble.btn::before,\n    .btn-google-plus.btn-lg::before,\n    .btn-group-lg > .btn-google-plus.btn::before,\n    .btn-instagram.btn-lg::before,\n    .btn-group-lg > .btn-instagram.btn::before,\n    .btn-pinterest.btn-lg::before,\n    .btn-group-lg > .btn-pinterest.btn::before,\n    .btn-vk.btn-lg::before,\n    .btn-group-lg > .btn-vk.btn::before,\n    .btn-yahoo.btn-lg::before,\n    .btn-group-lg > .btn-yahoo.btn::before,\n    .btn-behance.btn-lg::before,\n    .btn-group-lg > .btn-behance.btn::before,\n    .btn-dropbox.btn-lg::before,\n    .btn-group-lg > .btn-dropbox.btn::before,\n    .btn-reddit.btn-lg::before,\n    .btn-group-lg > .btn-reddit.btn::before,\n    .btn-spotify.btn-lg::before,\n    .btn-group-lg > .btn-spotify.btn::before,\n    .btn-vine.btn-lg::before,\n    .btn-group-lg > .btn-vine.btn::before,\n    .btn-foursquare.btn-lg::before,\n    .btn-group-lg > .btn-foursquare.btn::before,\n    .btn-vimeo.btn-lg::before,\n    .btn-group-lg > .btn-vimeo.btn::before {\n      width: 2.875rem;\n      height: 2.875rem;\n      padding: 0.5rem 0;\n      font-size: 1.25rem;\n      line-height: 1.5;\n}\n.btn-facebook.btn-lg span, .btn-group-lg > .btn-facebook.btn span,\n    .btn-twitter.btn-lg span, .btn-group-lg > .btn-twitter.btn span,\n    .btn-linkedin.btn-lg span, .btn-group-lg > .btn-linkedin.btn span,\n    .btn-flickr.btn-lg span, .btn-group-lg > .btn-flickr.btn span,\n    .btn-tumblr.btn-lg span, .btn-group-lg > .btn-tumblr.btn span,\n    .btn-xing.btn-lg span, .btn-group-lg > .btn-xing.btn span,\n    .btn-github.btn-lg span, .btn-group-lg > .btn-github.btn span,\n    .btn-html5.btn-lg span, .btn-group-lg > .btn-html5.btn span,\n    .btn-openid.btn-lg span, .btn-group-lg > .btn-openid.btn span,\n    .btn-stack-overflow.btn-lg span, .btn-group-lg > .btn-stack-overflow.btn span,\n    .btn-youtube.btn-lg span, .btn-group-lg > .btn-youtube.btn span,\n    .btn-css3.btn-lg span, .btn-group-lg > .btn-css3.btn span,\n    .btn-dribbble.btn-lg span, .btn-group-lg > .btn-dribbble.btn span,\n    .btn-google-plus.btn-lg span, .btn-group-lg > .btn-google-plus.btn span,\n    .btn-instagram.btn-lg span, .btn-group-lg > .btn-instagram.btn span,\n    .btn-pinterest.btn-lg span, .btn-group-lg > .btn-pinterest.btn span,\n    .btn-vk.btn-lg span, .btn-group-lg > .btn-vk.btn span,\n    .btn-yahoo.btn-lg span, .btn-group-lg > .btn-yahoo.btn span,\n    .btn-behance.btn-lg span, .btn-group-lg > .btn-behance.btn span,\n    .btn-dropbox.btn-lg span, .btn-group-lg > .btn-dropbox.btn span,\n    .btn-reddit.btn-lg span, .btn-group-lg > .btn-reddit.btn span,\n    .btn-spotify.btn-lg span, .btn-group-lg > .btn-spotify.btn span,\n    .btn-vine.btn-lg span, .btn-group-lg > .btn-vine.btn span,\n    .btn-foursquare.btn-lg span, .btn-group-lg > .btn-foursquare.btn span,\n    .btn-vimeo.btn-lg span, .btn-group-lg > .btn-vimeo.btn span {\n      margin-left: 2.875rem;\n}\n.btn-facebook.btn-lg.icon, .btn-group-lg > .btn-facebook.icon.btn,\n    .btn-twitter.btn-lg.icon,\n    .btn-group-lg > .btn-twitter.icon.btn,\n    .btn-linkedin.btn-lg.icon,\n    .btn-group-lg > .btn-linkedin.icon.btn,\n    .btn-flickr.btn-lg.icon,\n    .btn-group-lg > .btn-flickr.icon.btn,\n    .btn-tumblr.btn-lg.icon,\n    .btn-group-lg > .btn-tumblr.icon.btn,\n    .btn-xing.btn-lg.icon,\n    .btn-group-lg > .btn-xing.icon.btn,\n    .btn-github.btn-lg.icon,\n    .btn-group-lg > .btn-github.icon.btn,\n    .btn-html5.btn-lg.icon,\n    .btn-group-lg > .btn-html5.icon.btn,\n    .btn-openid.btn-lg.icon,\n    .btn-group-lg > .btn-openid.icon.btn,\n    .btn-stack-overflow.btn-lg.icon,\n    .btn-group-lg > .btn-stack-overflow.icon.btn,\n    .btn-youtube.btn-lg.icon,\n    .btn-group-lg > .btn-youtube.icon.btn,\n    .btn-css3.btn-lg.icon,\n    .btn-group-lg > .btn-css3.icon.btn,\n    .btn-dribbble.btn-lg.icon,\n    .btn-group-lg > .btn-dribbble.icon.btn,\n    .btn-google-plus.btn-lg.icon,\n    .btn-group-lg > .btn-google-plus.icon.btn,\n    .btn-instagram.btn-lg.icon,\n    .btn-group-lg > .btn-instagram.icon.btn,\n    .btn-pinterest.btn-lg.icon,\n    .btn-group-lg > .btn-pinterest.icon.btn,\n    .btn-vk.btn-lg.icon,\n    .btn-group-lg > .btn-vk.icon.btn,\n    .btn-yahoo.btn-lg.icon,\n    .btn-group-lg > .btn-yahoo.icon.btn,\n    .btn-behance.btn-lg.icon,\n    .btn-group-lg > .btn-behance.icon.btn,\n    .btn-dropbox.btn-lg.icon,\n    .btn-group-lg > .btn-dropbox.icon.btn,\n    .btn-reddit.btn-lg.icon,\n    .btn-group-lg > .btn-reddit.icon.btn,\n    .btn-spotify.btn-lg.icon,\n    .btn-group-lg > .btn-spotify.icon.btn,\n    .btn-vine.btn-lg.icon,\n    .btn-group-lg > .btn-vine.icon.btn,\n    .btn-foursquare.btn-lg.icon,\n    .btn-group-lg > .btn-foursquare.icon.btn,\n    .btn-vimeo.btn-lg.icon,\n    .btn-group-lg > .btn-vimeo.icon.btn {\n      width: 2.875rem;\n      height: 2.875rem;\n}\n.btn-facebook.btn-sm, .btn-group-sm > .btn-facebook.btn,\n  .btn-twitter.btn-sm,\n  .btn-group-sm > .btn-twitter.btn,\n  .btn-linkedin.btn-sm,\n  .btn-group-sm > .btn-linkedin.btn,\n  .btn-flickr.btn-sm,\n  .btn-group-sm > .btn-flickr.btn,\n  .btn-tumblr.btn-sm,\n  .btn-group-sm > .btn-tumblr.btn,\n  .btn-xing.btn-sm,\n  .btn-group-sm > .btn-xing.btn,\n  .btn-github.btn-sm,\n  .btn-group-sm > .btn-github.btn,\n  .btn-html5.btn-sm,\n  .btn-group-sm > .btn-html5.btn,\n  .btn-openid.btn-sm,\n  .btn-group-sm > .btn-openid.btn,\n  .btn-stack-overflow.btn-sm,\n  .btn-group-sm > .btn-stack-overflow.btn,\n  .btn-youtube.btn-sm,\n  .btn-group-sm > .btn-youtube.btn,\n  .btn-css3.btn-sm,\n  .btn-group-sm > .btn-css3.btn,\n  .btn-dribbble.btn-sm,\n  .btn-group-sm > .btn-dribbble.btn,\n  .btn-google-plus.btn-sm,\n  .btn-group-sm > .btn-google-plus.btn,\n  .btn-instagram.btn-sm,\n  .btn-group-sm > .btn-instagram.btn,\n  .btn-pinterest.btn-sm,\n  .btn-group-sm > .btn-pinterest.btn,\n  .btn-vk.btn-sm,\n  .btn-group-sm > .btn-vk.btn,\n  .btn-yahoo.btn-sm,\n  .btn-group-sm > .btn-yahoo.btn,\n  .btn-behance.btn-sm,\n  .btn-group-sm > .btn-behance.btn,\n  .btn-dropbox.btn-sm,\n  .btn-group-sm > .btn-dropbox.btn,\n  .btn-reddit.btn-sm,\n  .btn-group-sm > .btn-reddit.btn,\n  .btn-spotify.btn-sm,\n  .btn-group-sm > .btn-spotify.btn,\n  .btn-vine.btn-sm,\n  .btn-group-sm > .btn-vine.btn,\n  .btn-foursquare.btn-sm,\n  .btn-group-sm > .btn-foursquare.btn,\n  .btn-vimeo.btn-sm,\n  .btn-group-sm > .btn-vimeo.btn {\n    padding: 0.25rem 0.5rem;\n    font-size: 0.875rem;\n    line-height: 1.5;\n    border: 0;\n}\n.btn-facebook.btn-sm::before, .btn-group-sm > .btn-facebook.btn::before,\n    .btn-twitter.btn-sm::before,\n    .btn-group-sm > .btn-twitter.btn::before,\n    .btn-linkedin.btn-sm::before,\n    .btn-group-sm > .btn-linkedin.btn::before,\n    .btn-flickr.btn-sm::before,\n    .btn-group-sm > .btn-flickr.btn::before,\n    .btn-tumblr.btn-sm::before,\n    .btn-group-sm > .btn-tumblr.btn::before,\n    .btn-xing.btn-sm::before,\n    .btn-group-sm > .btn-xing.btn::before,\n    .btn-github.btn-sm::before,\n    .btn-group-sm > .btn-github.btn::before,\n    .btn-html5.btn-sm::before,\n    .btn-group-sm > .btn-html5.btn::before,\n    .btn-openid.btn-sm::before,\n    .btn-group-sm > .btn-openid.btn::before,\n    .btn-stack-overflow.btn-sm::before,\n    .btn-group-sm > .btn-stack-overflow.btn::before,\n    .btn-youtube.btn-sm::before,\n    .btn-group-sm > .btn-youtube.btn::before,\n    .btn-css3.btn-sm::before,\n    .btn-group-sm > .btn-css3.btn::before,\n    .btn-dribbble.btn-sm::before,\n    .btn-group-sm > .btn-dribbble.btn::before,\n    .btn-google-plus.btn-sm::before,\n    .btn-group-sm > .btn-google-plus.btn::before,\n    .btn-instagram.btn-sm::before,\n    .btn-group-sm > .btn-instagram.btn::before,\n    .btn-pinterest.btn-sm::before,\n    .btn-group-sm > .btn-pinterest.btn::before,\n    .btn-vk.btn-sm::before,\n    .btn-group-sm > .btn-vk.btn::before,\n    .btn-yahoo.btn-sm::before,\n    .btn-group-sm > .btn-yahoo.btn::before,\n    .btn-behance.btn-sm::before,\n    .btn-group-sm > .btn-behance.btn::before,\n    .btn-dropbox.btn-sm::before,\n    .btn-group-sm > .btn-dropbox.btn::before,\n    .btn-reddit.btn-sm::before,\n    .btn-group-sm > .btn-reddit.btn::before,\n    .btn-spotify.btn-sm::before,\n    .btn-group-sm > .btn-spotify.btn::before,\n    .btn-vine.btn-sm::before,\n    .btn-group-sm > .btn-vine.btn::before,\n    .btn-foursquare.btn-sm::before,\n    .btn-group-sm > .btn-foursquare.btn::before,\n    .btn-vimeo.btn-sm::before,\n    .btn-group-sm > .btn-vimeo.btn::before {\n      width: 1.8125rem;\n      height: 1.8125rem;\n      padding: 0.25rem 0;\n      font-size: 0.875rem;\n      line-height: 1.5;\n}\n.btn-facebook.btn-sm span, .btn-group-sm > .btn-facebook.btn span,\n    .btn-twitter.btn-sm span, .btn-group-sm > .btn-twitter.btn span,\n    .btn-linkedin.btn-sm span, .btn-group-sm > .btn-linkedin.btn span,\n    .btn-flickr.btn-sm span, .btn-group-sm > .btn-flickr.btn span,\n    .btn-tumblr.btn-sm span, .btn-group-sm > .btn-tumblr.btn span,\n    .btn-xing.btn-sm span, .btn-group-sm > .btn-xing.btn span,\n    .btn-github.btn-sm span, .btn-group-sm > .btn-github.btn span,\n    .btn-html5.btn-sm span, .btn-group-sm > .btn-html5.btn span,\n    .btn-openid.btn-sm span, .btn-group-sm > .btn-openid.btn span,\n    .btn-stack-overflow.btn-sm span, .btn-group-sm > .btn-stack-overflow.btn span,\n    .btn-youtube.btn-sm span, .btn-group-sm > .btn-youtube.btn span,\n    .btn-css3.btn-sm span, .btn-group-sm > .btn-css3.btn span,\n    .btn-dribbble.btn-sm span, .btn-group-sm > .btn-dribbble.btn span,\n    .btn-google-plus.btn-sm span, .btn-group-sm > .btn-google-plus.btn span,\n    .btn-instagram.btn-sm span, .btn-group-sm > .btn-instagram.btn span,\n    .btn-pinterest.btn-sm span, .btn-group-sm > .btn-pinterest.btn span,\n    .btn-vk.btn-sm span, .btn-group-sm > .btn-vk.btn span,\n    .btn-yahoo.btn-sm span, .btn-group-sm > .btn-yahoo.btn span,\n    .btn-behance.btn-sm span, .btn-group-sm > .btn-behance.btn span,\n    .btn-dropbox.btn-sm span, .btn-group-sm > .btn-dropbox.btn span,\n    .btn-reddit.btn-sm span, .btn-group-sm > .btn-reddit.btn span,\n    .btn-spotify.btn-sm span, .btn-group-sm > .btn-spotify.btn span,\n    .btn-vine.btn-sm span, .btn-group-sm > .btn-vine.btn span,\n    .btn-foursquare.btn-sm span, .btn-group-sm > .btn-foursquare.btn span,\n    .btn-vimeo.btn-sm span, .btn-group-sm > .btn-vimeo.btn span {\n      margin-left: 1.8125rem;\n}\n.btn-facebook.btn-sm.icon, .btn-group-sm > .btn-facebook.icon.btn,\n    .btn-twitter.btn-sm.icon,\n    .btn-group-sm > .btn-twitter.icon.btn,\n    .btn-linkedin.btn-sm.icon,\n    .btn-group-sm > .btn-linkedin.icon.btn,\n    .btn-flickr.btn-sm.icon,\n    .btn-group-sm > .btn-flickr.icon.btn,\n    .btn-tumblr.btn-sm.icon,\n    .btn-group-sm > .btn-tumblr.icon.btn,\n    .btn-xing.btn-sm.icon,\n    .btn-group-sm > .btn-xing.icon.btn,\n    .btn-github.btn-sm.icon,\n    .btn-group-sm > .btn-github.icon.btn,\n    .btn-html5.btn-sm.icon,\n    .btn-group-sm > .btn-html5.icon.btn,\n    .btn-openid.btn-sm.icon,\n    .btn-group-sm > .btn-openid.icon.btn,\n    .btn-stack-overflow.btn-sm.icon,\n    .btn-group-sm > .btn-stack-overflow.icon.btn,\n    .btn-youtube.btn-sm.icon,\n    .btn-group-sm > .btn-youtube.icon.btn,\n    .btn-css3.btn-sm.icon,\n    .btn-group-sm > .btn-css3.icon.btn,\n    .btn-dribbble.btn-sm.icon,\n    .btn-group-sm > .btn-dribbble.icon.btn,\n    .btn-google-plus.btn-sm.icon,\n    .btn-group-sm > .btn-google-plus.icon.btn,\n    .btn-instagram.btn-sm.icon,\n    .btn-group-sm > .btn-instagram.icon.btn,\n    .btn-pinterest.btn-sm.icon,\n    .btn-group-sm > .btn-pinterest.icon.btn,\n    .btn-vk.btn-sm.icon,\n    .btn-group-sm > .btn-vk.icon.btn,\n    .btn-yahoo.btn-sm.icon,\n    .btn-group-sm > .btn-yahoo.icon.btn,\n    .btn-behance.btn-sm.icon,\n    .btn-group-sm > .btn-behance.icon.btn,\n    .btn-dropbox.btn-sm.icon,\n    .btn-group-sm > .btn-dropbox.icon.btn,\n    .btn-reddit.btn-sm.icon,\n    .btn-group-sm > .btn-reddit.icon.btn,\n    .btn-spotify.btn-sm.icon,\n    .btn-group-sm > .btn-spotify.icon.btn,\n    .btn-vine.btn-sm.icon,\n    .btn-group-sm > .btn-vine.icon.btn,\n    .btn-foursquare.btn-sm.icon,\n    .btn-group-sm > .btn-foursquare.icon.btn,\n    .btn-vimeo.btn-sm.icon,\n    .btn-group-sm > .btn-vimeo.icon.btn {\n      width: 1.8125rem;\n      height: 1.8125rem;\n}\n.btn-facebook {\n  background: #3b5998;\n}\n.btn-facebook::before {\n    content: \"\\f09a\";\n    background: #344e86;\n}\n.btn-facebook:hover {\n    background: #344e86;\n}\n.btn-facebook:hover::before {\n      background: #2d4373;\n}\n.btn-twitter {\n  background: #00aced;\n}\n.btn-twitter::before {\n    content: \"\\f099\";\n    background: #0099d4;\n}\n.btn-twitter:hover {\n    background: #0099d4;\n}\n.btn-twitter:hover::before {\n      background: #0087ba;\n}\n.btn-linkedin {\n  background: #4875b4;\n}\n.btn-linkedin::before {\n    content: \"\\f0e1\";\n    background: #4169a2;\n}\n.btn-linkedin:hover {\n    background: #4169a2;\n}\n.btn-linkedin:hover::before {\n      background: #395d90;\n}\n.btn-flickr {\n  background: #ff0084;\n}\n.btn-flickr::before {\n    content: \"\\f16e\";\n    background: #e60077;\n}\n.btn-flickr:hover {\n    background: #e60077;\n}\n.btn-flickr:hover::before {\n      background: #cc006a;\n}\n.btn-tumblr {\n  background: #32506d;\n}\n.btn-tumblr::before {\n    content: \"\\f173\";\n    background: #2a435c;\n}\n.btn-tumblr:hover {\n    background: #2a435c;\n}\n.btn-tumblr:hover::before {\n      background: #22364a;\n}\n.btn-xing {\n  background: #026466;\n}\n.btn-xing::before {\n    content: \"\\f168\";\n    background: #024b4d;\n}\n.btn-xing:hover {\n    background: #024b4d;\n}\n.btn-xing:hover::before {\n      background: #013334;\n}\n.btn-github {\n  background: #4183c4;\n}\n.btn-github::before {\n    content: \"\\f09b\";\n    background: #3876b4;\n}\n.btn-github:hover {\n    background: #3876b4;\n}\n.btn-github:hover::before {\n      background: #3269a0;\n}\n.btn-html5 {\n  background: #e34f26;\n}\n.btn-html5::before {\n    content: \"\\f13b\";\n    background: #d4431b;\n}\n.btn-html5:hover {\n    background: #d4431b;\n}\n.btn-html5:hover::before {\n      background: #be3c18;\n}\n.btn-openid {\n  background: #f78c40;\n}\n.btn-openid::before {\n    content: \"\\f19b\";\n    background: #f67d28;\n}\n.btn-openid:hover {\n    background: #f67d28;\n}\n.btn-openid:hover::before {\n      background: #f56f0f;\n}\n.btn-stack-overflow {\n  background: #fe7a15;\n}\n.btn-stack-overflow::before {\n    content: \"\\f16c\";\n    background: #f86c01;\n}\n.btn-stack-overflow:hover {\n    background: #f86c01;\n}\n.btn-stack-overflow:hover::before {\n      background: #df6101;\n}\n.btn-css3 {\n  background: #0170ba;\n}\n.btn-css3::before {\n    content: \"\\f13c\";\n    background: #0161a1;\n}\n.btn-css3:hover {\n    background: #0161a1;\n}\n.btn-css3:hover::before {\n      background: #015187;\n}\n.btn-youtube {\n  background: #b00;\n}\n.btn-youtube::before {\n    content: \"\\f167\";\n    background: #a20000;\n}\n.btn-youtube:hover {\n    background: #a20000;\n}\n.btn-youtube:hover::before {\n      background: #880000;\n}\n.btn-dribbble {\n  background: #ea4c89;\n}\n.btn-dribbble::before {\n    content: \"\\f17d\";\n    background: #e7357a;\n}\n.btn-dribbble:hover {\n    background: #e7357a;\n}\n.btn-dribbble:hover::before {\n      background: #e51e6b;\n}\n.btn-google-plus {\n  background: #d34836;\n}\n.btn-google-plus::before {\n    content: \"\\f0d5\";\n    background: #c43d2b;\n}\n.btn-google-plus:hover {\n    background: #c43d2b;\n}\n.btn-google-plus:hover::before {\n      background: #b03626;\n}\n.btn-instagram {\n  background: #517fa4;\n}\n.btn-instagram::before {\n    content: \"\\f16d\";\n    background: #497293;\n}\n.btn-instagram:hover {\n    background: #497293;\n}\n.btn-instagram:hover::before {\n      background: #406582;\n}\n.btn-pinterest {\n  background: #cb2027;\n}\n.btn-pinterest::before {\n    content: \"\\f0d2\";\n    background: #b51d23;\n}\n.btn-pinterest:hover {\n    background: #b51d23;\n}\n.btn-pinterest:hover::before {\n      background: #9f191f;\n}\n.btn-vk {\n  background: #45668e;\n}\n.btn-vk::before {\n    content: \"\\f189\";\n    background: #3d5a7d;\n}\n.btn-vk:hover {\n    background: #3d5a7d;\n}\n.btn-vk:hover::before {\n      background: #344d6c;\n}\n.btn-yahoo {\n  background: #400191;\n}\n.btn-yahoo::before {\n    content: \"\\f19e\";\n    background: #350178;\n}\n.btn-yahoo:hover {\n    background: #350178;\n}\n.btn-yahoo:hover::before {\n      background: #2a015e;\n}\n.btn-behance {\n  background: #1769ff;\n}\n.btn-behance::before {\n    content: \"\\f1b4\";\n    background: #0059fd;\n}\n.btn-behance:hover {\n    background: #0059fd;\n}\n.btn-behance:hover::before {\n      background: #0050e3;\n}\n.btn-dropbox {\n  background: #007ee5;\n}\n.btn-dropbox::before {\n    content: \"\\f16b\";\n    background: #0070cc;\n}\n.btn-dropbox:hover {\n    background: #0070cc;\n}\n.btn-dropbox:hover::before {\n      background: #0062b2;\n}\n.btn-reddit {\n  background: #ff4500;\n}\n.btn-reddit::before {\n    content: \"\\f1a1\";\n    background: #e63e00;\n}\n.btn-reddit:hover {\n    background: #e63e00;\n}\n.btn-reddit:hover::before {\n      background: #cc3700;\n}\n.btn-spotify {\n  background: #7ab800;\n}\n.btn-spotify::before {\n    content: \"\\f1bc\";\n    background: #699f00;\n}\n.btn-spotify:hover {\n    background: #699f00;\n}\n.btn-spotify:hover::before {\n      background: #588500;\n}\n.btn-vine {\n  background: #00bf8f;\n}\n.btn-vine::before {\n    content: \"\\f1ca\";\n    background: #00a67c;\n}\n.btn-vine:hover {\n    background: #00a67c;\n}\n.btn-vine:hover::before {\n      background: #008c69;\n}\n.btn-foursquare {\n  background: #1073af;\n}\n.btn-foursquare::before {\n    content: \"\\f180\";\n    background: #0e6498;\n}\n.btn-foursquare:hover {\n    background: #0e6498;\n}\n.btn-foursquare:hover::before {\n      background: #0c5480;\n}\n.btn-vimeo {\n  background: #aad450;\n}\n.btn-vimeo::before {\n    content: \"\\f194\";\n    background: #a0cf3c;\n}\n.btn-vimeo:hover {\n    background: #a0cf3c;\n}\n.btn-vimeo:hover::before {\n      background: #93c130;\n}\n.callout {\n  position: relative;\n  padding: 0 1rem;\n  margin: 1rem 0;\n  border: 0 solid #c2cfd6;\n  border-left-width: .25rem;\n}\n.callout .chart-wrapper {\n    position: absolute;\n    top: 10px;\n    left: 50%;\n    float: right;\n    width: 50%;\n}\n.callout-bordered {\n  border: 1px solid #c2cfd6;\n  border-left-width: .25rem;\n}\n.callout code {\n  border-radius: .25rem;\n}\n.callout h4 {\n  margin-top: 0;\n  margin-bottom: .25rem;\n}\n.callout p:last-child {\n  margin-bottom: 0;\n}\n.callout + .callout {\n  margin-top: -0.25rem;\n}\n.callout-default {\n  border-left-color: #536c79;\n}\n.callout-default h4 {\n    color: #536c79;\n}\n.callout-primary {\n  border-left-color: #20a8d8;\n}\n.callout-primary h4 {\n    color: #20a8d8;\n}\n.callout-secondary {\n  border-left-color: #a4b7c1;\n}\n.callout-secondary h4 {\n    color: #a4b7c1;\n}\n.callout-success {\n  border-left-color: #4dbd74;\n}\n.callout-success h4 {\n    color: #4dbd74;\n}\n.callout-info {\n  border-left-color: #63c2de;\n}\n.callout-info h4 {\n    color: #63c2de;\n}\n.callout-warning {\n  border-left-color: #ffc107;\n}\n.callout-warning h4 {\n    color: #ffc107;\n}\n.callout-danger {\n  border-left-color: #f86c6b;\n}\n.callout-danger h4 {\n    color: #f86c6b;\n}\n.callout-light {\n  border-left-color: #f0f3f5;\n}\n.callout-light h4 {\n    color: #f0f3f5;\n}\n.callout-dark {\n  border-left-color: #29363d;\n}\n.callout-dark h4 {\n    color: #29363d;\n}\n.card {\n  margin-bottom: 1.5rem;\n}\n.card.bg-primary {\n    border-color: #187da0;\n}\n.card.bg-primary .card-header {\n      background-color: #1e9ecb;\n      border-color: #187da0;\n}\n.card.bg-secondary {\n    border-color: #7e99a7;\n}\n.card.bg-secondary .card-header {\n      background-color: #9bb0bb;\n      border-color: #7e99a7;\n}\n.card.bg-success {\n    border-color: #379457;\n}\n.card.bg-success .card-header {\n      background-color: #44b76c;\n      border-color: #379457;\n}\n.card.bg-info {\n    border-color: #2eadd3;\n}\n.card.bg-info .card-header {\n      background-color: #56bddb;\n      border-color: #2eadd3;\n}\n.card.bg-warning {\n    border-color: #c69500;\n}\n.card.bg-warning .card-header {\n      background-color: #f7b900;\n      border-color: #c69500;\n}\n.card.bg-danger {\n    border-color: #f5302e;\n}\n.card.bg-danger .card-header {\n      background-color: #f75d5c;\n      border-color: #f5302e;\n}\n.card.bg-light {\n    border-color: #cad4dc;\n}\n.card.bg-light .card-header {\n      background-color: #e7ecef;\n      border-color: #cad4dc;\n}\n.card.bg-dark {\n    border-color: #0f1417;\n}\n.card.bg-dark .card-header {\n      background-color: #232e34;\n      border-color: #0f1417;\n}\n.text-white .text-muted {\n  color: rgba(255, 255, 255, 0.6) !important;\n}\n.card-header .icon-bg {\n  display: inline-body;\n  padding: 0.75rem 1.25rem !important;\n  margin-top: -0.75rem;\n  margin-right: 1.25rem;\n  margin-bottom: -0.75rem;\n  margin-left: -1.25rem;\n  line-height: inherit;\n  color: #536a85;\n  vertical-align: bottom;\n  background: transparent;\n  border-right: 1px solid #c2cfd6;\n}\n.card-header .nav.nav-tabs {\n  margin-top: -0.75rem;\n  margin-bottom: -0.75rem;\n  border-bottom: 0;\n}\n.card-header .nav.nav-tabs .nav-item {\n    border-top: 0;\n}\n.card-header .nav.nav-tabs .nav-link, .card-header .nav.nav-tabs .navbar .dropdown-toggle, .navbar .card-header .nav.nav-tabs .dropdown-toggle {\n    padding: 0.75rem 0.625rem;\n    color: #536c79;\n    border-top: 0;\n}\n.card-header .nav.nav-tabs .nav-link.active, .card-header .nav.nav-tabs .navbar .active.dropdown-toggle, .navbar .card-header .nav.nav-tabs .active.dropdown-toggle {\n      color: #536a85;\n      background: #fff;\n}\n.card-header.card-header-inverse {\n  color: #fff;\n}\n.card-header .btn {\n  margin-top: -0.5rem;\n}\n.card-header .btn-sm, .card-header .btn-group-sm > .btn {\n  margin-top: -0.25rem;\n}\n.card-header .btn-lg, .card-header .btn-group-lg > .btn {\n  margin-top: -0.5rem;\n}\n.card-footer ul {\n  display: table;\n  width: 100%;\n  padding: 0;\n  margin: 0;\n  table-layout: fixed;\n}\n.card-footer ul li {\n    display: table-cell;\n    padding: 0 1.25rem;\n    text-align: center;\n}\n[class*=\"card-outline-\"] .card-body, [class*=\"card-outline-\"] .card-block {\n  background: #fff !important;\n}\n[class*=\"card-outline-\"].card-outline-top {\n  border-top-width: 2px;\n  border-right-color: #c2cfd6;\n  border-bottom-color: #c2cfd6;\n  border-left-color: #c2cfd6;\n}\n.card-accent-primary {\n  border-top-width: 2px;\n  border-top-color: #20a8d8;\n}\n.card-accent-secondary {\n  border-top-width: 2px;\n  border-top-color: #a4b7c1;\n}\n.card-accent-success {\n  border-top-width: 2px;\n  border-top-color: #4dbd74;\n}\n.card-accent-info {\n  border-top-width: 2px;\n  border-top-color: #63c2de;\n}\n.card-accent-warning {\n  border-top-width: 2px;\n  border-top-color: #ffc107;\n}\n.card-accent-danger {\n  border-top-width: 2px;\n  border-top-color: #f86c6b;\n}\n.card-accent-light {\n  border-top-width: 2px;\n  border-top-color: #f0f3f5;\n}\n.card-accent-dark {\n  border-top-width: 2px;\n  border-top-color: #29363d;\n}\n.card-header > i {\n  margin-right: 0.5rem;\n}\n.card-header .card-actions {\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n.card-header .card-actions a, .card-header .card-actions button {\n    display: block;\n    float: left;\n    width: 50px;\n    padding: 0.75rem 0;\n    margin: 0 !important;\n    color: #536a85;\n    text-align: center;\n    background: transparent;\n    border: 0;\n    border-left: 1px solid #c2cfd6;\n    box-shadow: 0;\n}\n.card-header .card-actions a:hover, .card-header .card-actions button:hover {\n      text-decoration: none;\n}\n.card-header .card-actions a [class^=\"icon-\"], .card-header .card-actions a [class*=\" icon-\"], .card-header .card-actions button [class^=\"icon-\"], .card-header .card-actions button [class*=\" icon-\"] {\n      display: inline-body;\n      vertical-align: middle;\n}\n.card-header .card-actions a i, .card-header .card-actions button i {\n      display: inline-body;\n      transition: .4s;\n}\n.card-header .card-actions a .r180, .card-header .card-actions button .r180 {\n      -webkit-transform: rotate(180deg);\n              transform: rotate(180deg);\n}\n.card-header .card-actions .input-group {\n    width: 230px;\n    margin: 6px;\n}\n.card-header .card-actions .input-group .input-group-addon {\n      background: #fff;\n}\n.card-header .card-actions .input-group input {\n      border-left: 0;\n}\n.card-full {\n  margin-top: -1rem;\n  margin-right: -15px;\n  margin-left: -15px;\n  border: 0;\n  border-bottom: 1px solid #c2cfd6;\n}\n@media (min-width: 576px) {\n.card-columns.cols-2 {\n    -webkit-column-count: 2;\n            column-count: 2;\n}\n}\n.card.drag, .card .drag {\n  cursor: move;\n}\n.card-placeholder {\n  background: rgba(0, 0, 0, 0.025);\n  border: 1px dashed #a4b7c1;\n}\n.chart-wrapper canvas {\n  width: 100% !important;\n}\nbase-chart.chart {\n  display: block !important;\n}\n.dropdown-item {\n  position: relative;\n  padding: 10px 20px;\n  border-bottom: 1px solid #c2cfd6;\n}\n.dropdown-item:last-child {\n    border-bottom: 0;\n}\n.dropdown-item i {\n    display: inline-block;\n    width: 20px;\n    margin-right: 10px;\n    margin-left: -10px;\n    color: #c2cfd6;\n    text-align: center;\n}\n.dropdown-item .badge {\n    position: absolute;\n    right: 10px;\n    margin-top: 2px;\n}\n.dropdown-header {\n  padding: 8px 20px;\n  background: #f0f3f5;\n  border-bottom: 1px solid #c2cfd6;\n}\n.dropdown-header .btn {\n    margin-top: -7px;\n    color: #536c79;\n}\n.dropdown-header .btn:hover {\n      color: #536a85;\n}\n.dropdown-header .btn.pull-right {\n      margin-right: -20px;\n}\n.dropdown-menu-lg {\n  width: 250px;\n}\n.app-header .navbar-nav .dropdown-menu {\n  position: absolute;\n}\n.app-header .navbar-nav .dropdown-menu-right {\n  right: 0;\n  left: auto;\n}\n.app-header .navbar-nav .dropdown-menu-left {\n  right: auto;\n  left: 0;\n}\n.app-footer {\n  min-height: 50px;\n  padding: 0 1rem;\n  line-height: 50px;\n  color: #536a85;\n  background: #f0f3f5;\n  border-top: 1px solid #c2cfd6;\n}\n.row.row-equal {\n  padding-right: 7.5px;\n  padding-left: 7.5px;\n  margin-right: -15px;\n  margin-left: -15px;\n}\n.row.row-equal [class*=\"col-\"] {\n    padding-right: 7.5px;\n    padding-left: 7.5px;\n}\n.main .container-fluid {\n  padding: 0 30px;\n}\n.input-group-addon,\n.input-group-btn {\n  min-width: 40px;\n  white-space: nowrap;\n  vertical-align: middle;\n}\n#loading-bar,\n#loading-bar-spinner {\n  -webkit-pointer-events: none;\n  pointer-events: none;\n  transition: 350ms linear all;\n}\n#loading-bar.ng-enter,\n#loading-bar.ng-leave.ng-leave-active,\n#loading-bar-spinner.ng-enter,\n#loading-bar-spinner.ng-leave.ng-leave-active {\n  opacity: 0;\n}\n#loading-bar.ng-enter.ng-enter-active,\n#loading-bar.ng-leave,\n#loading-bar-spinner.ng-enter.ng-enter-active,\n#loading-bar-spinner.ng-leave {\n  opacity: 1;\n}\n#loading-bar .bar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 20002;\n  width: 100%;\n  height: 2px;\n  background: #20a8d8;\n  border-top-right-radius: 1px;\n  border-bottom-right-radius: 1px;\n  transition: width 350ms;\n}\n#loading-bar .peg {\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 70px;\n  height: 2px;\n  border-radius: 100%;\n  -ms-box-shadow: #29d 1px 0 6px 1px;\n  box-shadow: #29d 1px 0 6px 1px;\n  opacity: .45;\n}\n#loading-bar-spinner {\n  position: fixed;\n  top: 10px;\n  left: 10px;\n  z-index: 10002;\n  display: block;\n}\n#loading-bar-spinner .spinner-icon {\n  width: 14px;\n  height: 14px;\n  border: solid 2px transparent;\n  border-top-color: #29d;\n  border-left-color: #29d;\n  border-radius: 50%;\n  -webkit-animation: loading-bar-spinner 400ms linear infinite;\n  animation: loading-bar-spinner 400ms linear infinite;\n}\n@-webkit-keyframes loading-bar-spinner {\n0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n}\n100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n}\n}\n@keyframes loading-bar-spinner {\n0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n    transform: rotate(0deg);\n}\n100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n    transform: rotate(360deg);\n}\n}\n.pace {\n  -webkit-pointer-events: none;\n  pointer-events: none;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n      user-select: none;\n}\n.pace-inactive {\n  display: none;\n}\n.pace .pace-progress {\n  position: fixed;\n  top: 0;\n  right: 100%;\n  z-index: 2000;\n  width: 100%;\n  height: 2px;\n  background: #20a8d8;\n}\n.modal-primary .modal-content {\n  border-color: #20a8d8;\n}\n.modal-primary .modal-header {\n  color: #fff;\n  background-color: #20a8d8;\n}\n.modal-secondary .modal-content {\n  border-color: #a4b7c1;\n}\n.modal-secondary .modal-header {\n  color: #fff;\n  background-color: #a4b7c1;\n}\n.modal-success .modal-content {\n  border-color: #4dbd74;\n}\n.modal-success .modal-header {\n  color: #fff;\n  background-color: #4dbd74;\n}\n.modal-info .modal-content {\n  border-color: #63c2de;\n}\n.modal-info .modal-header {\n  color: #fff;\n  background-color: #63c2de;\n}\n.modal-warning .modal-content {\n  border-color: #ffc107;\n}\n.modal-warning .modal-header {\n  color: #fff;\n  background-color: #ffc107;\n}\n.modal-danger .modal-content {\n  border-color: #f86c6b;\n}\n.modal-danger .modal-header {\n  color: #fff;\n  background-color: #f86c6b;\n}\n.modal-light .modal-content {\n  border-color: #f0f3f5;\n}\n.modal-light .modal-header {\n  color: #fff;\n  background-color: #f0f3f5;\n}\n.modal-dark .modal-content {\n  border-color: #29363d;\n}\n.modal-dark .modal-header {\n  color: #fff;\n  background-color: #29363d;\n}\n.nav-tabs .nav-link, .nav-tabs .navbar .dropdown-toggle, .navbar .nav-tabs .dropdown-toggle {\n  color: #536c79;\n}\n.nav-tabs .nav-link.active, .nav-tabs .navbar .active.dropdown-toggle, .navbar .nav-tabs .active.dropdown-toggle {\n    color: #29363d;\n    background: #fff;\n    border-color: #c2cfd6;\n    border-bottom-color: #fff;\n}\n.nav-tabs .nav-link.active:focus, .nav-tabs .navbar .active.dropdown-toggle:focus, .navbar .nav-tabs .active.dropdown-toggle:focus {\n      background: #fff;\n      border-color: #c2cfd6;\n      border-bottom-color: #fff;\n}\n.tab-content {\n  margin-top: -1px;\n  background: #fff;\n  border: 1px solid #c2cfd6;\n}\n.tab-content .tab-pane {\n    padding: 1rem;\n}\n.card-block .tab-content {\n  margin-top: 0;\n  border: 0;\n}\n.app-header.navbar {\n  position: relative;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  height: 55px;\n  padding: 0;\n  margin: 0;\n  background-color: #fff;\n  border-bottom: 1px solid #c2cfd6;\n}\n.app-header.navbar .navbar-brand {\n    display: inline-block;\n    width: 155px;\n    height: 55px;\n    padding: 0.5rem 1rem;\n    margin-right: 0;\n    background-color: #fff;\n    background-repeat: no-repeat;\n    background-position: center center;\n    background-size: 70px auto;\n    border-bottom: 1px solid #c2cfd6;\n}\n.app-header.navbar .navbar-toggler {\n    color: #536c79;\n}\n.app-header.navbar .navbar-nav {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n.app-header.navbar .nav-item {\n    position: relative;\n    min-width: 50px;\n    margin: 0 !important;\n    text-align: center;\n}\n.app-header.navbar .nav-item button {\n      margin: 0 auto;\n}\n.app-header.navbar .nav-item .nav-link, .app-header.navbar .nav-item .dropdown-toggle {\n      padding-top: 0;\n      padding-bottom: 0;\n      background: 0;\n      border: 0;\n}\n.app-header.navbar .nav-item .nav-link .badge, .app-header.navbar .nav-item .dropdown-toggle .badge {\n        position: absolute;\n        top: 50%;\n        left: 50%;\n        margin-top: -16px;\n        margin-left: 0;\n}\n.app-header.navbar .nav-item .nav-link > .img-avatar, .app-header.navbar .nav-item .dropdown-toggle > .img-avatar {\n        height: 35px;\n        margin: 0 10px;\n}\n.app-header.navbar .dropdown-menu {\n    padding-bottom: 0;\n    line-height: 1.5;\n}\n.app-header.navbar .dropdown-item {\n    min-width: 180px;\n}\n.navbar-brand {\n  color: #29363d;\n}\n.navbar-brand:focus, .navbar-brand:hover {\n    color: #29363d;\n}\n.navbar-nav .nav-link, .navbar-nav .navbar .dropdown-toggle, .navbar .navbar-nav .dropdown-toggle {\n  color: #536c79;\n}\n.navbar-nav .nav-link:focus, .navbar-nav .navbar .dropdown-toggle:focus, .navbar .navbar-nav .dropdown-toggle:focus, .navbar-nav .nav-link:hover, .navbar-nav .navbar .dropdown-toggle:hover, .navbar .navbar-nav .dropdown-toggle:hover {\n    color: #29363d;\n}\n.navbar-nav .open > .nav-link, .navbar-nav .navbar .open > .dropdown-toggle, .navbar .navbar-nav .open > .dropdown-toggle, .navbar-nav .open > .nav-link:focus, .navbar-nav .navbar .open > .dropdown-toggle:focus, .navbar .navbar-nav .open > .dropdown-toggle:focus, .navbar-nav .open > .nav-link:hover, .navbar-nav .navbar .open > .dropdown-toggle:hover, .navbar .navbar-nav .open > .dropdown-toggle:hover,\n.navbar-nav .active > .nav-link,\n.navbar-nav .navbar .active > .dropdown-toggle, .navbar\n.navbar-nav .active > .dropdown-toggle,\n.navbar-nav .active > .nav-link:focus,\n.navbar-nav .navbar .active > .dropdown-toggle:focus, .navbar\n.navbar-nav .active > .dropdown-toggle:focus,\n.navbar-nav .active > .nav-link:hover,\n.navbar-nav .navbar .active > .dropdown-toggle:hover, .navbar\n.navbar-nav .active > .dropdown-toggle:hover,\n.navbar-nav .nav-link.open,\n.navbar-nav .navbar .open.dropdown-toggle, .navbar\n.navbar-nav .open.dropdown-toggle,\n.navbar-nav .nav-link.open:focus,\n.navbar-nav .navbar .open.dropdown-toggle:focus, .navbar\n.navbar-nav .open.dropdown-toggle:focus,\n.navbar-nav .nav-link.open:hover,\n.navbar-nav .navbar .open.dropdown-toggle:hover, .navbar\n.navbar-nav .open.dropdown-toggle:hover,\n.navbar-nav .nav-link.active,\n.navbar-nav .navbar .active.dropdown-toggle, .navbar\n.navbar-nav .active.dropdown-toggle,\n.navbar-nav .nav-link.active:focus,\n.navbar-nav .navbar .active.dropdown-toggle:focus, .navbar\n.navbar-nav .active.dropdown-toggle:focus,\n.navbar-nav .nav-link.active:hover,\n.navbar-nav .navbar .active.dropdown-toggle:hover, .navbar\n.navbar-nav .active.dropdown-toggle:hover {\n  color: #29363d;\n}\n.navbar-divider {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.progress-xs {\n  height: 4px;\n}\n.progress-sm {\n  height: 8px;\n}\n.progress-white {\n  background-color: rgba(255, 255, 255, 0.2) !important;\n}\n.progress-white .progress-bar {\n    background-color: #fff;\n}\n.sidebar {\n  padding: 0;\n  overflow: hidden;\n  color: #fff;\n  background: #29363d;\n}\n.sidebar .sidebar-close {\n    position: absolute;\n    right: 0;\n    display: none;\n    padding: 0 1rem;\n    font-size: 24px;\n    font-weight: 800;\n    line-height: 55px;\n    color: #fff;\n    background: 0;\n    border: 0;\n    opacity: .8;\n}\n.sidebar .sidebar-close:hover {\n      opacity: 1;\n}\n.sidebar .sidebar-nav {\n    position: relative;\n    overflow-x: hidden;\n    overflow-y: auto;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n    width: 200px;\n}\n.sidebar .sidebar-nav::-webkit-scrollbar {\n      position: absolute;\n      width: 10px;\n      margin-left: -10px;\n      -webkit-appearance: none;\n}\n.sidebar .sidebar-nav::-webkit-scrollbar-track {\n      background-color: #33444c;\n      border-right: 1px solid #1f292e;\n      border-left: 1px solid #1f292e;\n}\n.sidebar .sidebar-nav::-webkit-scrollbar-thumb {\n      height: 50px;\n      background-color: #151b1f;\n      background-clip: content-box;\n      border-color: transparent;\n      border-style: solid;\n      border-width: 1px 2px;\n}\n.sidebar .nav {\n    width: 200px;\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.sidebar .nav .nav-title {\n      padding: 0.75rem 1rem;\n      font-size: 11px;\n      font-weight: 600;\n      color: #c2cfd6;\n      text-transform: uppercase;\n}\n.sidebar .nav .divider {\n      height: 10px;\n}\n.sidebar .nav .nav-item {\n      position: relative;\n      margin: 0;\n      transition: background .3s ease-in-out;\n}\n.sidebar .nav .nav-item ul {\n        max-height: 0;\n        padding: 0;\n        margin: 0;\n        overflow-y: hidden;\n        transition: max-height .3s ease-in-out;\n}\n.sidebar .nav .nav-item ul li {\n          padding: 0;\n          list-style: none;\n}\n.sidebar .nav .nav-item .nav-link, .sidebar .nav .nav-item .navbar .dropdown-toggle, .navbar .sidebar .nav .nav-item .dropdown-toggle {\n        display: block;\n        padding: 0.75rem 1rem;\n        color: #fff;\n        text-decoration: none;\n        background: transparent;\n}\n.sidebar .nav .nav-item .nav-link:hover, .sidebar .nav .nav-item .navbar .dropdown-toggle:hover, .navbar .sidebar .nav .nav-item .dropdown-toggle:hover {\n          color: #fff !important;\n          background: #20a8d8 !important;\n}\n.sidebar .nav .nav-item .nav-link:hover i, .sidebar .nav .nav-item .navbar .dropdown-toggle:hover i, .navbar .sidebar .nav .nav-item .dropdown-toggle:hover i {\n            color: #fff;\n}\n.sidebar .nav .nav-item .nav-link.active, .sidebar .nav .nav-item .navbar .active.dropdown-toggle, .navbar .sidebar .nav .nav-item .active.dropdown-toggle {\n          color: #fff;\n          background: #33444c;\n}\n.sidebar .nav .nav-item .nav-link.active i, .sidebar .nav .nav-item .navbar .active.dropdown-toggle i, .navbar .sidebar .nav .nav-item .active.dropdown-toggle i {\n            color: #20a8d8;\n}\n.sidebar .nav .nav-item .nav-link [class^=\"icon-\"], .sidebar .nav .nav-item .navbar .dropdown-toggle [class^=\"icon-\"], .navbar .sidebar .nav .nav-item .dropdown-toggle [class^=\"icon-\"], .sidebar .nav .nav-item .nav-link [class*=\" icon-\"], .sidebar .nav .nav-item .navbar .dropdown-toggle [class*=\" icon-\"], .navbar .sidebar .nav .nav-item .dropdown-toggle [class*=\" icon-\"] {\n          display: inline-block;\n          margin-top: -4px;\n          vertical-align: middle;\n}\n.sidebar .nav .nav-item .nav-link i, .sidebar .nav .nav-item .navbar .dropdown-toggle i, .navbar .sidebar .nav .nav-item .dropdown-toggle i {\n          width: 20px;\n          margin: 0 0.5rem 0 0;\n          font-size: 14px;\n          color: #536c79;\n          text-align: center;\n}\n.sidebar .nav .nav-item .nav-link .badge, .sidebar .nav .nav-item .navbar .dropdown-toggle .badge, .navbar .sidebar .nav .nav-item .dropdown-toggle .badge {\n          float: right;\n          margin-top: 2px;\n}\n.sidebar .nav .nav-item .nav-link.nav-dropdown-toggle::before, .sidebar .nav .nav-item .navbar .nav-dropdown-toggle.dropdown-toggle::before, .navbar .sidebar .nav .nav-item .nav-dropdown-toggle.dropdown-toggle::before {\n          position: absolute;\n          top: 0.96875rem;\n          right: 1rem;\n          display: block;\n          width: 0.875rem;\n          height: 0.875rem;\n          padding: 0;\n          font-size: 0.875rem;\n          line-height: 0.65625rem;\n          text-align: center;\n          content: \"\\2039\";\n          transition: .3s;\n}\n.sidebar .nav .nav-item.nav-dropdown.open {\n        background: rgba(0, 0, 0, 0.2);\n}\n.sidebar .nav .nav-item.nav-dropdown.open > ul, .sidebar .nav .nav-item.nav-dropdown.open > ol {\n          max-height: 1000px;\n}\n.sidebar .nav .nav-item.nav-dropdown.open .nav-link, .sidebar .nav .nav-item.nav-dropdown.open .navbar .dropdown-toggle, .navbar .sidebar .nav .nav-item.nav-dropdown.open .dropdown-toggle {\n          color: #fff;\n          border-left: 0 !important;\n}\n.sidebar .nav .nav-item.nav-dropdown.open > .nav-link.nav-dropdown-toggle::before, .sidebar .nav .navbar .nav-item.nav-dropdown.open > .nav-dropdown-toggle.dropdown-toggle::before, .navbar .sidebar .nav .nav-item.nav-dropdown.open > .nav-dropdown-toggle.dropdown-toggle::before {\n          -webkit-transform: rotate(-90deg);\n                  transform: rotate(-90deg);\n}\n.sidebar .nav .nav-item.nav-dropdown.open .nav-dropdown.open {\n          border-left: 0;\n}\n.sidebar .nav .nav-item.nav-dropdown.nt {\n        transition: 0s !important;\n}\n.sidebar .nav .nav-item.nav-dropdown.nt > ul, .sidebar .nav .nav-item.nav-dropdown.nt > ol {\n          transition: 0s !important;\n}\n.sidebar .nav .nav-item.nav-dropdown.nt .nav-link.nav-dropdown-toggle::before, .sidebar .nav .nav-item.nav-dropdown.nt .navbar .nav-dropdown-toggle.dropdown-toggle::before, .navbar .sidebar .nav .nav-item.nav-dropdown.nt .nav-dropdown-toggle.dropdown-toggle::before {\n          transition: 0s !important;\n}\n.sidebar .nav .nav-item .nav-label {\n        display: block;\n        padding: 0.09375rem 1rem;\n        color: #c2cfd6;\n}\n.sidebar .nav .nav-item .nav-label:hover {\n          color: #fff;\n          text-decoration: none;\n}\n.sidebar .nav .nav-item .nav-label i {\n          width: 20px;\n          margin: -3px 0.5rem 0 0;\n          font-size: 10px;\n          color: #536c79;\n          text-align: center;\n          vertical-align: middle;\n}\n.sidebar .nav .nav-item .progress {\n        background-color: #485f6b !important;\n}\n@media (min-width: 992px) {\n.sidebar-compact .sidebar .sidebar-nav {\n    width: 150px;\n}\n.sidebar-compact .sidebar .nav {\n    width: 150px;\n}\n.sidebar-compact .sidebar .nav .nav-title {\n      text-align: center;\n}\n.sidebar-compact .sidebar .nav .nav-item {\n      width: 150px;\n      border-left: 0 !important;\n}\n.sidebar-compact .sidebar .nav .nav-item .nav-link, .sidebar-compact .sidebar .nav .nav-item .navbar .dropdown-toggle, .navbar .sidebar-compact .sidebar .nav .nav-item .dropdown-toggle {\n        text-align: center;\n}\n.sidebar-compact .sidebar .nav .nav-item .nav-link i, .sidebar-compact .sidebar .nav .nav-item .navbar .dropdown-toggle i, .navbar .sidebar-compact .sidebar .nav .nav-item .dropdown-toggle i {\n          display: block;\n          width: 100%;\n          margin: 0.25rem 0;\n          font-size: 24px;\n}\n.sidebar-compact .sidebar .nav .nav-item .nav-link .badge, .sidebar-compact .sidebar .nav .nav-item .navbar .dropdown-toggle .badge, .navbar .sidebar-compact .sidebar .nav .nav-item .dropdown-toggle .badge {\n          position: absolute;\n          top: 18px;\n          right: 10px;\n}\n.sidebar-compact .sidebar .nav .nav-item .nav-link.nav-dropdown-toggle::before, .sidebar-compact .sidebar .nav .nav-item .navbar .nav-dropdown-toggle.dropdown-toggle::before, .navbar .sidebar-compact .sidebar .nav .nav-item .nav-dropdown-toggle.dropdown-toggle::before {\n          top: 30px;\n}\n.sidebar-minimized .hidden-cn {\n    display: none;\n}\n.sidebar-minimized .sidebar {\n    z-index: 1019;\n}\n.sidebar-minimized .sidebar:hover {\n      overflow: visible;\n}\n.sidebar-minimized .sidebar .sidebar-nav {\n      overflow: visible;\n      width: 50px;\n}\n.sidebar-minimized .sidebar .nav {\n      width: 50px;\n}\n.sidebar-minimized .sidebar .nav .nav-title, .sidebar-minimized .sidebar .nav .divider {\n        display: none;\n}\n.sidebar-minimized .sidebar .nav .nav-item {\n        width: 50px;\n        overflow: hidden;\n        border-left: 0 !important;\n}\n.sidebar-minimized .sidebar .nav .nav-item ul {\n          background: #29363d;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link, .sidebar-minimized .sidebar .nav .nav-item .navbar .dropdown-toggle, .navbar .sidebar-minimized .sidebar .nav .nav-item .dropdown-toggle {\n          position: relative;\n          padding-left: 0;\n          margin: 0;\n          white-space: nowrap;\n          border-left: 0 !important;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link.nav-dropdown-toggle::before, .sidebar-minimized .sidebar .nav .nav-item .navbar .nav-dropdown-toggle.dropdown-toggle::before, .navbar .sidebar-minimized .sidebar .nav .nav-item .nav-dropdown-toggle.dropdown-toggle::before {\n            display: none;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link i, .sidebar-minimized .sidebar .nav .nav-item .navbar .dropdown-toggle i, .navbar .sidebar-minimized .sidebar .nav .nav-item .dropdown-toggle i {\n            display: block;\n            float: left;\n            width: 50px;\n            padding: 0;\n            margin: 0 !important;\n            font-size: 18px;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link .badge, .sidebar-minimized .sidebar .nav .nav-item .navbar .dropdown-toggle .badge, .navbar .sidebar-minimized .sidebar .nav .nav-item .dropdown-toggle .badge {\n            position: absolute;\n            right: 15px;\n            display: none;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link:hover, .sidebar-minimized .sidebar .nav .nav-item .navbar .dropdown-toggle:hover, .navbar .sidebar-minimized .sidebar .nav .nav-item .dropdown-toggle:hover {\n            width: 200px;\n}\n.sidebar-minimized .sidebar .nav .nav-item .nav-link:hover .badge, .sidebar-minimized .sidebar .nav .nav-item .navbar .dropdown-toggle:hover .badge, .navbar .sidebar-minimized .sidebar .nav .nav-item .dropdown-toggle:hover .badge {\n              display: inline;\n}\n.sidebar-minimized .sidebar .nav .nav-item ul {\n          position: absolute;\n          left: 50px;\n}\n.sidebar-minimized .sidebar .nav .nav-item ul li {\n            position: relative;\n            padding: 0;\n}\n.sidebar-minimized .sidebar .nav .nav-item ul li .nav-link, .sidebar-minimized .sidebar .nav .nav-item ul li .navbar .dropdown-toggle, .navbar .sidebar-minimized .sidebar .nav .nav-item ul li .dropdown-toggle {\n              width: 150px;\n}\n.sidebar-minimized .sidebar .nav .nav-item ul li ul, .sidebar-minimized .sidebar .nav .nav-item ul li ol {\n              position: absolute;\n              top: 0;\n              left: 100%;\n}\n.sidebar-minimized .sidebar .nav .nav-item.nav-dropdown.open {\n          background: #33444c;\n}\n.sidebar-minimized .sidebar .nav .nav-item.nav-dropdown.open > .nav-link i, .sidebar-minimized .sidebar .nav .navbar .nav-item.nav-dropdown.open > .dropdown-toggle i, .navbar .sidebar-minimized .sidebar .nav .nav-item.nav-dropdown.open > .dropdown-toggle i {\n            color: #20a8d8;\n}\n.sidebar-minimized .sidebar .nav .nav-item.nav-dropdown.open > ul, .sidebar-minimized .sidebar .nav .nav-item.nav-dropdown.open > ol {\n            display: none;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover {\n          width: 250px;\n          overflow: visible;\n          background: #20a8d8;\n          transition: 0s;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover > .nav-link, .sidebar-minimized .sidebar .nav .navbar .nav-item:hover > .dropdown-toggle, .navbar .sidebar-minimized .sidebar .nav .nav-item:hover > .dropdown-toggle {\n            width: 250px;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover > ul, .sidebar-minimized .sidebar .nav .nav-item:hover > ol {\n            display: inline;\n            max-height: 10000px;\n            transition: 0s;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover > ul li, .sidebar-minimized .sidebar .nav .nav-item:hover > ol li {\n              width: 200px;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover > ul li .nav-link, .sidebar-minimized .sidebar .nav .nav-item:hover > ul li .navbar .dropdown-toggle, .navbar .sidebar-minimized .sidebar .nav .nav-item:hover > ul li .dropdown-toggle, .sidebar-minimized .sidebar .nav .nav-item:hover > ol li .nav-link, .sidebar-minimized .sidebar .nav .nav-item:hover > ol li .navbar .dropdown-toggle, .navbar .sidebar-minimized .sidebar .nav .nav-item:hover > ol li .dropdown-toggle {\n                width: 200px;\n}\n.sidebar-minimized .sidebar .nav .nav-item:hover.nav-dropdown.open > ul, .sidebar-minimized .sidebar .nav .nav-item:hover.nav-dropdown.open > ol {\n            display: inline;\n}\n}\n.switch.switch-default {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  width: 40px;\n  height: 24px;\n  background-color: transparent;\n  cursor: pointer;\n}\n.switch.switch-default .switch-input {\n    position: absolute;\n    top: 0;\n    left: 0;\n    opacity: 0;\n}\n.switch.switch-default .switch-label {\n    position: relative;\n    display: block;\n    height: inherit;\n    font-size: 10px;\n    font-weight: 600;\n    text-transform: uppercase;\n    background-color: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 2px;\n    transition: opacity background .15s ease-out;\n}\n.switch.switch-default .switch-input:checked ~ .switch-label::before {\n    opacity: 0;\n}\n.switch.switch-default .switch-input:checked ~ .switch-label::after {\n    opacity: 1;\n}\n.switch.switch-default .switch-handle {\n    position: absolute;\n    top: 2px;\n    left: 2px;\n    width: 20px;\n    height: 20px;\n    background: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 1px;\n    transition: left .15s ease-out;\n}\n.switch.switch-default .switch-input:checked ~ .switch-handle {\n    left: 18px;\n}\n.switch.switch-default.switch-lg {\n    width: 48px;\n    height: 28px;\n}\n.switch.switch-default.switch-lg .switch-label {\n      font-size: 12px;\n}\n.switch.switch-default.switch-lg .switch-handle {\n      width: 24px;\n      height: 24px;\n}\n.switch.switch-default.switch-lg .switch-input:checked ~ .switch-handle {\n      left: 22px;\n}\n.switch.switch-default.switch-sm {\n    width: 32px;\n    height: 20px;\n}\n.switch.switch-default.switch-sm .switch-label {\n      font-size: 8px;\n}\n.switch.switch-default.switch-sm .switch-handle {\n      width: 16px;\n      height: 16px;\n}\n.switch.switch-default.switch-sm .switch-input:checked ~ .switch-handle {\n      left: 14px;\n}\n.switch.switch-default.switch-xs {\n    width: 24px;\n    height: 16px;\n}\n.switch.switch-default.switch-xs .switch-label {\n      font-size: 7px;\n}\n.switch.switch-default.switch-xs .switch-handle {\n      width: 12px;\n      height: 12px;\n}\n.switch.switch-default.switch-xs .switch-input:checked ~ .switch-handle {\n      left: 10px;\n}\n.switch.switch-text {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  width: 48px;\n  height: 24px;\n  background-color: transparent;\n  cursor: pointer;\n}\n.switch.switch-text .switch-input {\n    position: absolute;\n    top: 0;\n    left: 0;\n    opacity: 0;\n}\n.switch.switch-text .switch-label {\n    position: relative;\n    display: block;\n    height: inherit;\n    font-size: 10px;\n    font-weight: 600;\n    text-transform: uppercase;\n    background-color: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 2px;\n    transition: opacity background .15s ease-out;\n}\n.switch.switch-text .switch-label::before,\n  .switch.switch-text .switch-label::after {\n    position: absolute;\n    top: 50%;\n    width: 50%;\n    margin-top: -.5em;\n    line-height: 1;\n    text-align: center;\n    transition: inherit;\n}\n.switch.switch-text .switch-label::before {\n    right: 1px;\n    color: #c2cfd6;\n    content: attr(data-off);\n}\n.switch.switch-text .switch-label::after {\n    left: 1px;\n    color: #fff;\n    content: attr(data-on);\n    opacity: 0;\n}\n.switch.switch-text .switch-input:checked ~ .switch-label::before {\n    opacity: 0;\n}\n.switch.switch-text .switch-input:checked ~ .switch-label::after {\n    opacity: 1;\n}\n.switch.switch-text .switch-handle {\n    position: absolute;\n    top: 2px;\n    left: 2px;\n    width: 20px;\n    height: 20px;\n    background: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 1px;\n    transition: left .15s ease-out;\n}\n.switch.switch-text .switch-input:checked ~ .switch-handle {\n    left: 26px;\n}\n.switch.switch-text.switch-lg {\n    width: 56px;\n    height: 28px;\n}\n.switch.switch-text.switch-lg .switch-label {\n      font-size: 12px;\n}\n.switch.switch-text.switch-lg .switch-handle {\n      width: 24px;\n      height: 24px;\n}\n.switch.switch-text.switch-lg .switch-input:checked ~ .switch-handle {\n      left: 30px;\n}\n.switch.switch-text.switch-sm {\n    width: 40px;\n    height: 20px;\n}\n.switch.switch-text.switch-sm .switch-label {\n      font-size: 8px;\n}\n.switch.switch-text.switch-sm .switch-handle {\n      width: 16px;\n      height: 16px;\n}\n.switch.switch-text.switch-sm .switch-input:checked ~ .switch-handle {\n      left: 22px;\n}\n.switch.switch-text.switch-xs {\n    width: 32px;\n    height: 16px;\n}\n.switch.switch-text.switch-xs .switch-label {\n      font-size: 7px;\n}\n.switch.switch-text.switch-xs .switch-handle {\n      width: 12px;\n      height: 12px;\n}\n.switch.switch-text.switch-xs .switch-input:checked ~ .switch-handle {\n      left: 18px;\n}\n.switch.switch-icon {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  width: 48px;\n  height: 24px;\n  background-color: transparent;\n  cursor: pointer;\n}\n.switch.switch-icon .switch-input {\n    position: absolute;\n    top: 0;\n    left: 0;\n    opacity: 0;\n}\n.switch.switch-icon .switch-label {\n    position: relative;\n    display: block;\n    height: inherit;\n    font-family: FontAwesome;\n    font-size: 10px;\n    font-weight: 600;\n    text-transform: uppercase;\n    background-color: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 2px;\n    transition: opacity background .15s ease-out;\n}\n.switch.switch-icon .switch-label::before,\n  .switch.switch-icon .switch-label::after {\n    position: absolute;\n    top: 50%;\n    width: 50%;\n    margin-top: -.5em;\n    line-height: 1;\n    text-align: center;\n    transition: inherit;\n}\n.switch.switch-icon .switch-label::before {\n    right: 1px;\n    color: #c2cfd6;\n    content: attr(data-off);\n}\n.switch.switch-icon .switch-label::after {\n    left: 1px;\n    color: #fff;\n    content: attr(data-on);\n    opacity: 0;\n}\n.switch.switch-icon .switch-input:checked ~ .switch-label::before {\n    opacity: 0;\n}\n.switch.switch-icon .switch-input:checked ~ .switch-label::after {\n    opacity: 1;\n}\n.switch.switch-icon .switch-handle {\n    position: absolute;\n    top: 2px;\n    left: 2px;\n    width: 20px;\n    height: 20px;\n    background: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 1px;\n    transition: left .15s ease-out;\n}\n.switch.switch-icon .switch-input:checked ~ .switch-handle {\n    left: 26px;\n}\n.switch.switch-icon.switch-lg {\n    width: 56px;\n    height: 28px;\n}\n.switch.switch-icon.switch-lg .switch-label {\n      font-size: 12px;\n}\n.switch.switch-icon.switch-lg .switch-handle {\n      width: 24px;\n      height: 24px;\n}\n.switch.switch-icon.switch-lg .switch-input:checked ~ .switch-handle {\n      left: 30px;\n}\n.switch.switch-icon.switch-sm {\n    width: 40px;\n    height: 20px;\n}\n.switch.switch-icon.switch-sm .switch-label {\n      font-size: 8px;\n}\n.switch.switch-icon.switch-sm .switch-handle {\n      width: 16px;\n      height: 16px;\n}\n.switch.switch-icon.switch-sm .switch-input:checked ~ .switch-handle {\n      left: 22px;\n}\n.switch.switch-icon.switch-xs {\n    width: 32px;\n    height: 16px;\n}\n.switch.switch-icon.switch-xs .switch-label {\n      font-size: 7px;\n}\n.switch.switch-icon.switch-xs .switch-handle {\n      width: 12px;\n      height: 12px;\n}\n.switch.switch-icon.switch-xs .switch-input:checked ~ .switch-handle {\n      left: 18px;\n}\n.switch.switch-3d {\n  position: relative;\n  display: inline-block;\n  vertical-align: top;\n  width: 40px;\n  height: 24px;\n  background-color: transparent;\n  cursor: pointer;\n}\n.switch.switch-3d .switch-input {\n    position: absolute;\n    top: 0;\n    left: 0;\n    opacity: 0;\n}\n.switch.switch-3d .switch-label {\n    position: relative;\n    display: block;\n    height: inherit;\n    font-size: 10px;\n    font-weight: 600;\n    text-transform: uppercase;\n    background-color: #f0f3f5;\n    border: 1px solid #c2cfd6;\n    border-radius: 2px;\n    transition: opacity background .15s ease-out;\n}\n.switch.switch-3d .switch-input:checked ~ .switch-label::before {\n    opacity: 0;\n}\n.switch.switch-3d .switch-input:checked ~ .switch-label::after {\n    opacity: 1;\n}\n.switch.switch-3d .switch-handle {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 24px;\n    height: 24px;\n    background: #fff;\n    border: 1px solid #c2cfd6;\n    border-radius: 1px;\n    transition: left .15s ease-out;\n    border: 0;\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n}\n.switch.switch-3d .switch-input:checked ~ .switch-handle {\n    left: 16px;\n}\n.switch.switch-3d.switch-lg {\n    width: 48px;\n    height: 28px;\n}\n.switch.switch-3d.switch-lg .switch-label {\n      font-size: 12px;\n}\n.switch.switch-3d.switch-lg .switch-handle {\n      width: 28px;\n      height: 28px;\n}\n.switch.switch-3d.switch-lg .switch-input:checked ~ .switch-handle {\n      left: 20px;\n}\n.switch.switch-3d.switch-sm {\n    width: 32px;\n    height: 20px;\n}\n.switch.switch-3d.switch-sm .switch-label {\n      font-size: 8px;\n}\n.switch.switch-3d.switch-sm .switch-handle {\n      width: 20px;\n      height: 20px;\n}\n.switch.switch-3d.switch-sm .switch-input:checked ~ .switch-handle {\n      left: 12px;\n}\n.switch.switch-3d.switch-xs {\n    width: 24px;\n    height: 16px;\n}\n.switch.switch-3d.switch-xs .switch-label {\n      font-size: 7px;\n}\n.switch.switch-3d.switch-xs .switch-handle {\n      width: 16px;\n      height: 16px;\n}\n.switch.switch-3d.switch-xs .switch-input:checked ~ .switch-handle {\n      left: 8px;\n}\n.switch-pill .switch-label, .switch.switch-3d .switch-label,\n.switch-pill .switch-handle, .switch.switch-3d .switch-handle {\n  border-radius: 50em !important;\n}\n.switch-pill .switch-label::before, .switch.switch-3d .switch-label::before {\n  right: 2px !important;\n}\n.switch-pill .switch-label::after, .switch.switch-3d .switch-label::after {\n  left: 2px !important;\n}\n.switch-primary > .switch-input:checked ~ .switch-label {\n  background: #20a8d8 !important;\n  border-color: #1985ac;\n}\n.switch-primary > .switch-input:checked ~ .switch-handle {\n  border-color: #1985ac;\n}\n.switch-primary-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #20a8d8;\n}\n.switch-primary-outline > .switch-input:checked ~ .switch-label::after {\n    color: #20a8d8;\n}\n.switch-primary-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #20a8d8;\n}\n.switch-primary-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #20a8d8;\n}\n.switch-primary-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #20a8d8;\n}\n.switch-primary-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #20a8d8 !important;\n  border-color: #20a8d8;\n}\n.switch-secondary > .switch-input:checked ~ .switch-label {\n  background: #a4b7c1 !important;\n  border-color: #869fac;\n}\n.switch-secondary > .switch-input:checked ~ .switch-handle {\n  border-color: #869fac;\n}\n.switch-secondary-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #a4b7c1;\n}\n.switch-secondary-outline > .switch-input:checked ~ .switch-label::after {\n    color: #a4b7c1;\n}\n.switch-secondary-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #a4b7c1;\n}\n.switch-secondary-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #a4b7c1;\n}\n.switch-secondary-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #a4b7c1;\n}\n.switch-secondary-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #a4b7c1 !important;\n  border-color: #a4b7c1;\n}\n.switch-success > .switch-input:checked ~ .switch-label {\n  background: #4dbd74 !important;\n  border-color: #3a9d5d;\n}\n.switch-success > .switch-input:checked ~ .switch-handle {\n  border-color: #3a9d5d;\n}\n.switch-success-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #4dbd74;\n}\n.switch-success-outline > .switch-input:checked ~ .switch-label::after {\n    color: #4dbd74;\n}\n.switch-success-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #4dbd74;\n}\n.switch-success-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #4dbd74;\n}\n.switch-success-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #4dbd74;\n}\n.switch-success-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #4dbd74 !important;\n  border-color: #4dbd74;\n}\n.switch-info > .switch-input:checked ~ .switch-label {\n  background: #63c2de !important;\n  border-color: #39b2d5;\n}\n.switch-info > .switch-input:checked ~ .switch-handle {\n  border-color: #39b2d5;\n}\n.switch-info-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #63c2de;\n}\n.switch-info-outline > .switch-input:checked ~ .switch-label::after {\n    color: #63c2de;\n}\n.switch-info-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #63c2de;\n}\n.switch-info-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #63c2de;\n}\n.switch-info-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #63c2de;\n}\n.switch-info-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #63c2de !important;\n  border-color: #63c2de;\n}\n.switch-warning > .switch-input:checked ~ .switch-label {\n  background: #ffc107 !important;\n  border-color: #d39e00;\n}\n.switch-warning > .switch-input:checked ~ .switch-handle {\n  border-color: #d39e00;\n}\n.switch-warning-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #ffc107;\n}\n.switch-warning-outline > .switch-input:checked ~ .switch-label::after {\n    color: #ffc107;\n}\n.switch-warning-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #ffc107;\n}\n.switch-warning-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #ffc107;\n}\n.switch-warning-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #ffc107;\n}\n.switch-warning-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #ffc107 !important;\n  border-color: #ffc107;\n}\n.switch-danger > .switch-input:checked ~ .switch-label {\n  background: #f86c6b !important;\n  border-color: #f63c3a;\n}\n.switch-danger > .switch-input:checked ~ .switch-handle {\n  border-color: #f63c3a;\n}\n.switch-danger-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #f86c6b;\n}\n.switch-danger-outline > .switch-input:checked ~ .switch-label::after {\n    color: #f86c6b;\n}\n.switch-danger-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #f86c6b;\n}\n.switch-danger-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #f86c6b;\n}\n.switch-danger-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #f86c6b;\n}\n.switch-danger-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #f86c6b !important;\n  border-color: #f86c6b;\n}\n.switch-light > .switch-input:checked ~ .switch-label {\n  background: #f0f3f5 !important;\n  border-color: #d1dbe1;\n}\n.switch-light > .switch-input:checked ~ .switch-handle {\n  border-color: #d1dbe1;\n}\n.switch-light-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #f0f3f5;\n}\n.switch-light-outline > .switch-input:checked ~ .switch-label::after {\n    color: #f0f3f5;\n}\n.switch-light-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #f0f3f5;\n}\n.switch-light-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #f0f3f5;\n}\n.switch-light-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #f0f3f5;\n}\n.switch-light-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #f0f3f5 !important;\n  border-color: #f0f3f5;\n}\n.switch-dark > .switch-input:checked ~ .switch-label {\n  background: #29363d !important;\n  border-color: #151b1f;\n}\n.switch-dark > .switch-input:checked ~ .switch-handle {\n  border-color: #151b1f;\n}\n.switch-dark-outline > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #29363d;\n}\n.switch-dark-outline > .switch-input:checked ~ .switch-label::after {\n    color: #29363d;\n}\n.switch-dark-outline > .switch-input:checked ~ .switch-handle {\n  border-color: #29363d;\n}\n.switch-dark-outline-alt > .switch-input:checked ~ .switch-label {\n  background: #fff !important;\n  border-color: #29363d;\n}\n.switch-dark-outline-alt > .switch-input:checked ~ .switch-label::after {\n    color: #29363d;\n}\n.switch-dark-outline-alt > .switch-input:checked ~ .switch-handle {\n  background: #29363d !important;\n  border-color: #29363d;\n}\n.table-outline {\n  border: 1px solid #c2cfd6;\n}\n.table-outline td {\n    vertical-align: middle;\n}\n.table-align-middle td {\n  vertical-align: middle;\n}\n.table-clear td {\n  border: 0;\n}\n.social-box {\n  min-height: 160px;\n  margin-bottom: 1.5rem;\n  text-align: center;\n  background: #fff;\n  border: 1px solid #c2cfd6;\n}\n.social-box i {\n    display: block;\n    margin: -1px -1px 0;\n    font-size: 40px;\n    line-height: 90px;\n    background: #c2cfd6;\n}\n.social-box .chart-wrapper {\n    height: 90px;\n    margin: -90px 0 0;\n}\n.social-box .chart-wrapper canvas {\n      width: 100% !important;\n      height: 90px !important;\n}\n.social-box ul {\n    padding: 10px 0;\n    list-style: none;\n}\n.social-box ul li {\n      display: block;\n      float: left;\n      width: 50%;\n}\n.social-box ul li:first-child {\n        border-right: 1px solid #c2cfd6;\n}\n.social-box ul li strong {\n        display: block;\n        font-size: 20px;\n}\n.social-box ul li span {\n        font-size: 10px;\n        font-weight: 500;\n        color: #c2cfd6;\n        text-transform: uppercase;\n}\n.social-box.facebook i {\n    color: #fff;\n    background: #3b5998;\n}\n.social-box.twitter i {\n    color: #fff;\n    background: #00aced;\n}\n.social-box.linkedin i {\n    color: #fff;\n    background: #4875b4;\n}\n.social-box.google-plus i {\n    color: #fff;\n    background: #d34836;\n}\n.horizontal-bars {\n  padding: 0;\n  margin: 0;\n  list-style: none;\n}\n.horizontal-bars li {\n    position: relative;\n    height: 40px;\n    line-height: 40px;\n    vertical-align: middle;\n}\n.horizontal-bars li .title {\n      width: 100px;\n      font-size: 12px;\n      font-weight: 600;\n      color: #536c79;\n      vertical-align: middle;\n}\n.horizontal-bars li .bars {\n      position: absolute;\n      top: 15px;\n      width: 100%;\n      padding-left: 100px;\n}\n.horizontal-bars li .bars .progress:first-child {\n        margin-bottom: 2px;\n}\n.horizontal-bars li.legend {\n      text-align: center;\n}\n.horizontal-bars li.legend .badge {\n        display: inline-block;\n        width: 8px;\n        height: 8px;\n        padding: 0;\n}\n.horizontal-bars li.divider {\n      height: 40px;\n}\n.horizontal-bars li.divider i {\n        margin: 0 !important;\n}\n.horizontal-bars.type-2 li {\n    overflow: hidden;\n}\n.horizontal-bars.type-2 li i {\n      display: inline-block;\n      margin-right: 1rem;\n      margin-left: 5px;\n      font-size: 18px;\n      line-height: 40px;\n}\n.horizontal-bars.type-2 li .title {\n      display: inline-block;\n      width: auto;\n      margin-top: -9px;\n      font-size: 0.875rem;\n      font-weight: normal;\n      line-height: 40px;\n      color: #536a85;\n}\n.horizontal-bars.type-2 li .value {\n      float: right;\n      font-weight: 600;\n}\n.horizontal-bars.type-2 li .bars {\n      position: absolute;\n      top: auto;\n      bottom: 0;\n      padding: 0;\n}\n.icons-list {\n  padding: 0;\n  margin: 0;\n  list-style: none;\n}\n.icons-list li {\n    position: relative;\n    height: 40px;\n    vertical-align: middle;\n}\n.icons-list li i {\n      display: block;\n      float: left;\n      width: 35px !important;\n      height: 35px !important;\n      margin: 2px;\n      line-height: 35px !important;\n      text-align: center;\n}\n.icons-list li .desc {\n      height: 40px;\n      margin-left: 50px;\n      border-bottom: 1px solid #c2cfd6;\n}\n.icons-list li .desc .title {\n        padding: 2px 0 0;\n        margin: 0;\n}\n.icons-list li .desc small {\n        display: block;\n        margin-top: -4px;\n        color: #536c79;\n}\n.icons-list li .value {\n      position: absolute;\n      top: 2px;\n      right: 45px;\n      text-align: right;\n}\n.icons-list li .value strong {\n        display: block;\n        margin-top: -3px;\n}\n.icons-list li .actions {\n      position: absolute;\n      top: -4px;\n      right: 10px;\n      width: 40px;\n      height: 40px;\n      line-height: 40px;\n      text-align: center;\n}\n.icons-list li .actions i {\n        float: none;\n        width: auto;\n        height: auto;\n        padding: 0;\n        margin: 0;\n        line-height: normal;\n}\n.icons-list li.divider {\n      height: 40px;\n}\n.icons-list li.divider i {\n        width: auto;\n        height: auto;\n        margin: 2px 0 0;\n        font-size: 18px;\n}\n@media all and (-ms-high-contrast: none) {\nhtml {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n}\n.app,\napp-dashboard,\napp-root {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  min-height: 100vh;\n}\n.app-header {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 55px;\n          flex: 0 0 55px;\n}\n.app-footer {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 50px;\n          flex: 0 0 50px;\n}\n.app-body {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  overflow-x: hidden;\n}\n.app-body .main {\n    -webkit-box-flex: 1;\n        -ms-flex: 1;\n            flex: 1;\n    min-width: 0;\n}\n.app-body .sidebar {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 200px;\n            flex: 0 0 200px;\n    -webkit-box-ordinal-group: 0;\n        -ms-flex-order: -1;\n            order: -1;\n}\n.app-body .aside-menu {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 250px;\n            flex: 0 0 250px;\n}\n.header-fixed .app-header {\n  position: fixed;\n  z-index: 1020;\n  width: 100%;\n}\n.header-fixed .app-body {\n  margin-top: 55px;\n}\n.sidebar-hidden .sidebar {\n  margin-left: -200px;\n}\n.sidebar-fixed .sidebar {\n  position: fixed;\n  width: 200px;\n  height: 100%;\n}\n.sidebar-fixed .sidebar .sidebar-nav {\n    height: calc(100vh - 55px);\n}\n.sidebar-fixed .main, .sidebar-fixed .app-footer {\n  margin-left: 200px;\n}\n.sidebar-fixed.sidebar-hidden .main, .sidebar-fixed.sidebar-hidden .app-footer {\n  margin-left: 0;\n}\n.sidebar-off-canvas .sidebar {\n  position: fixed;\n  z-index: 1019;\n  height: 100%;\n}\n.sidebar-off-canvas .sidebar .sidebar-nav {\n    height: calc(100vh - 55px);\n}\n@media (min-width: 992px) {\n.sidebar-compact .sidebar {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 150px;\n            flex: 0 0 150px;\n}\n.sidebar-compact.sidebar-hidden .sidebar {\n    margin-left: -150px;\n}\n.sidebar-compact.sidebar-fixed .main, .sidebar-compact.sidebar-fixed .app-footer {\n    margin-left: 150px;\n}\n.sidebar-compact.sidebar-fixed .sidebar {\n    width: 150px;\n}\n.sidebar-compact.sidebar-fixed.sidebar-hidden .main, .sidebar-compact.sidebar-fixed.sidebar-hidden .app-footer {\n    margin-left: 0;\n}\n.sidebar-minimized .sidebar {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50px;\n            flex: 0 0 50px;\n}\n.sidebar-minimized.sidebar-hidden .sidebar {\n    margin-left: -50px;\n}\n.sidebar-minimized.sidebar-fixed .main, .sidebar-minimized.sidebar-fixed .app-footer {\n    margin-left: 50px;\n}\n.sidebar-minimized.sidebar-fixed .sidebar {\n    width: 50px;\n}\n.sidebar-minimized.sidebar-fixed.sidebar-hidden .main, .sidebar-minimized.sidebar-fixed.sidebar-hidden .app-footer {\n    margin-left: 0;\n}\n}\n.aside-menu-hidden .aside-menu {\n  margin-right: -250px;\n}\n.aside-menu-fixed .aside-menu {\n  position: fixed;\n  right: 0;\n  height: 100%;\n}\n.aside-menu-fixed .aside-menu .tab-content {\n    height: calc(100vh - 2.375rem - 55px);\n}\n.aside-menu-fixed .main, .aside-menu-fixed .app-footer {\n  margin-right: 250px;\n}\n.aside-menu-fixed.aside-menu-hidden .main, .aside-menu-fixed.aside-menu-hidden .app-footer {\n  margin-right: 0;\n}\n.aside-menu-off-canvas .aside-menu {\n  position: fixed;\n  right: 0;\n  z-index: 1019;\n  height: 100%;\n}\n.aside-menu-off-canvas .aside-menu .tab-content {\n    height: calc(100vh - 2.375rem - 55px);\n}\n.breadcrumb-fixed .main {\n  padding-top: 3.875rem;\n}\n.breadcrumb-fixed .breadcrumb {\n  position: fixed;\n  top: 55px;\n  right: 0;\n  left: 0;\n  z-index: 1018;\n}\n.breadcrumb-fixed .main:nth-child(2) .breadcrumb {\n  right: 250px;\n  left: 200px;\n}\n.breadcrumb-fixed .main:first-child .breadcrumb {\n  right: 250px;\n  left: 0;\n}\n.breadcrumb-fixed .main:last-child .breadcrumb {\n  right: 0;\n}\n.breadcrumb-fixed.sidebar-minimized .main .breadcrumb {\n  left: 50px;\n}\n.breadcrumb-fixed.sidebar-hidden .main .breadcrumb, .breadcrumb-fixed.sidebar-off-canvas .main .breadcrumb {\n  left: 0;\n}\n.breadcrumb-fixed.aside-menu-hidden .main .breadcrumb, .breadcrumb-fixed.aside-menu-off-canvas .main .breadcrumb {\n  right: 0;\n}\n.footer-fixed .app-footer {\n  position: fixed;\n  bottom: 0;\n  z-index: 1020;\n  width: 100%;\n}\n.footer-fixed .app-body {\n  margin-bottom: 50px;\n}\n.app-header,\n.app-footer,\n.sidebar,\n.main,\n.aside-menu {\n  transition: margin-left 0.25s, margin-right 0.25s, width 0.25s, -webkit-box-flex 0.25s;\n  transition: margin-left 0.25s, margin-right 0.25s, width 0.25s, flex 0.25s;\n  transition: margin-left 0.25s, margin-right 0.25s, width 0.25s, flex 0.25s, -webkit-box-flex 0.25s, -ms-flex 0.25s;\n}\n.breadcrumb {\n  transition: left 0.25s, right 0.25s, width 0.25s;\n}\n@media (max-width: 991px) {\n.app-header {\n    position: fixed !important;\n    z-index: 1020;\n    width: 100%;\n    text-align: center;\n}\n.app-header .navbar-toggler {\n      color: #536c79;\n}\n.app-header .navbar-brand {\n      position: absolute;\n      left: 50%;\n      margin-left: -77.5px;\n}\n.app-body {\n    margin-top: 55px;\n}\n.sidebar {\n    position: fixed;\n    width: 220px;\n    height: 100%;\n    margin-left: -220px;\n}\n.sidebar .sidebar-nav,\n    .sidebar .nav {\n      width: 220px !important;\n}\n.main, .app-footer {\n    margin-left: 0 !important;\n}\n.sidebar-hidden .sidebar {\n    margin-left: -220px;\n}\n.sidebar-mobile-show .sidebar {\n    width: 220px;\n    margin-left: 0;\n}\n.sidebar-mobile-show .sidebar .sidebar-nav {\n      height: calc(100vh - 55px);\n}\n.sidebar-mobile-show .main {\n    margin-right: -220px !important;\n    margin-left: 220px !important;\n}\n.breadcrumb-fixed .main .breadcrumb {\n    right: 0 !important;\n    left: 0 !important;\n}\n}\nhr.transparent {\n  border-top: 1px solid transparent;\n}\n.bg-primary,\n.bg-success,\n.bg-info,\n.bg-warning,\n.bg-danger,\n.bg-inverse {\n  color: #fff;\n}\n.b-a-0 {\n  border: 0 !important;\n}\n.b-t-0 {\n  border-top: 0 !important;\n}\n.b-r-0 {\n  border-right: 0 !important;\n}\n.b-b-0 {\n  border-bottom: 0 !important;\n}\n.b-l-0 {\n  border-left: 0 !important;\n}\n.b-a-1 {\n  border: 1px solid #c2cfd6 !important;\n}\n.b-t-1 {\n  border-top: 1px solid #c2cfd6 !important;\n}\n.b-r-1 {\n  border-right: 1px solid #c2cfd6 !important;\n}\n.b-b-1 {\n  border-bottom: 1px solid #c2cfd6 !important;\n}\n.b-l-1 {\n  border-left: 1px solid #c2cfd6 !important;\n}\n.b-a-2 {\n  border: 2px solid #c2cfd6 !important;\n}\n.b-t-2 {\n  border-top: 2px solid #c2cfd6 !important;\n}\n.b-r-2 {\n  border-right: 2px solid #c2cfd6 !important;\n}\n.b-b-2 {\n  border-bottom: 2px solid #c2cfd6 !important;\n}\n.b-l-2 {\n  border-left: 2px solid #c2cfd6 !important;\n}\n@media (max-width: 575px) {\n.d-down-none {\n    display: none !important;\n}\n}\n@media (max-width: 767px) {\n.d-sm-down-none {\n    display: none !important;\n}\n}\n@media (max-width: 991px) {\n.d-md-down-none {\n    display: none !important;\n}\n}\n@media (max-width: 1199px) {\n.d-lg-down-none {\n    display: none !important;\n}\n}\n.d-xl-down-none {\n  display: none !important;\n}\n.label-pill {\n  border-radius: 1rem !important;\n}\n.open > .dropdown-menu, .show > .dropdown-menu {\n  display: block;\n}\n.open > .dropdown-menu-right, .show > .dropdown-menu-right {\n  right: 0;\n  left: auto;\n}\n.open > a, .show > a {\n  outline: 0;\n}\n.modal-open .modal {\n  display: block;\n}\n.navbar .dropdown-toggle::after {\n  margin-right: 0.75rem !important;\n}\n.navbar .dropdown-toggle .img-avatar {\n  height: 35px;\n  margin: 0 !important;\n}\n.bd-pageheader {\n  margin: -1.6rem -1.9rem 3rem -1.9rem;\n  padding-bottom: 4rem;\n  padding-top: 4rem;\n  text-align: left;\n  background-color: #6a90bd;\n  color: #fff;\n}\n.bolder {\n  font-weight: 600 !important;\n}\n.faded {\n  opacity: 0.6;\n}\n.light-faded {\n  opacity: 0.3;\n}\n.borderless {\n  border: 0;\n}\n.bd-pageheader h1.display-3 {\n  font-size: 2.5rem;\n  font-weight: 500;\n  line-height: 1.1;\n}\n.bd-pageheader h2.display-3 {\n  font-size: 2rem;\n  font-weight: 500;\n  line-height: 1.1;\n}\n.bd-pageheader h3.display-3 {\n  font-size: 1.75rem;\n  font-weight: 500;\n  line-height: 1.1;\n}\n.bd-pageheader h4.display-3 {\n  font-size: 1.25rem;\n  font-weight: 500;\n  line-height: 1.1;\n}\n.img-assignee-list {\n  margin-right: 5px;\n  max-width: 30px;\n}\n.btn-circle {\n  width: 25px;\n  height: 25px;\n  text-align: center;\n  padding: 4px 0;\n  font-size: 12px;\n  line-height: 1.428571429;\n  border-radius: 15px;\n}\n.task-entry {\n  font-size: 1.15rem;\n  color: #38485a;\n}\n.table-task-list th, .table-task-list td {\n  border: 0 !important;\n}\n.btn-edit {\n  color: #536a85;\n  opacity: 0.3;\n}\n.btn-edit:hover {\n  border: 0 !important;\n  background-color: transparent;\n  color: #38485a;\n  opacity: 1;\n}\n*[dir=\"rtl\"] {\n  direction: rtl;\n  unicode-bidi: embed;\n}\n*[dir=\"rtl\"] ul {\n    -webkit-padding-start: 0;\n}\n*[dir=\"rtl\"] table tr th {\n    text-align: right;\n}\n*[dir=\"rtl\"] .breadcrumb-item {\n    float: right;\n}\n*[dir=\"rtl\"] .breadcrumb-menu {\n    right: auto;\n    left: 1rem;\n}\n*[dir=\"rtl\"] .dropdown-item {\n    text-align: right;\n}\n*[dir=\"rtl\"] .dropdown-item i {\n      margin-right: -10px;\n      margin-left: 10px;\n}\n*[dir=\"rtl\"] .dropdown-item .badge {\n      right: auto;\n      left: 10px;\n}\n*[dir=\"rtl\"] .sidebar-hidden .sidebar {\n    margin-right: -200px;\n}\n*[dir=\"rtl\"] .sidebar-fixed .main, *[dir=\"rtl\"] .sidebar-fixed .app-footer {\n    margin-right: 200px;\n}\n*[dir=\"rtl\"] .sidebar-fixed.sidebar-hidden .main, *[dir=\"rtl\"] .sidebar-fixed.sidebar-hidden .app-footer {\n    margin-right: 0;\n}\n*[dir=\"rtl\"] .sidebar-minimized .sidebar {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50px;\n            flex: 0 0 50px;\n}\n*[dir=\"rtl\"] .sidebar-minimized.sidebar-hidden .sidebar {\n    margin-left: -50px;\n}\n*[dir=\"rtl\"] .sidebar-minimized.sidebar-fixed .main, *[dir=\"rtl\"] .sidebar-minimized.sidebar-fixed .app-footer {\n    margin-left: 50px;\n}\n*[dir=\"rtl\"] .sidebar-minimized.sidebar-fixed.sidebar-hidden .main, *[dir=\"rtl\"] .sidebar-minimized.sidebar-fixed.sidebar-hidden .app-footer {\n    margin-left: 0;\n}\n*[dir=\"rtl\"] .aside-menu-hidden .aside-menu {\n    margin-left: -250px;\n}\n*[dir=\"rtl\"] .aside-menu-fixed .aside-menu {\n    right: auto;\n    left: 0;\n}\n*[dir=\"rtl\"] .aside-menu-fixed .main, *[dir=\"rtl\"] .aside-menu-fixed .app-footer {\n    margin-left: 250px;\n}\n*[dir=\"rtl\"] .aside-menu-fixed.aside-menu-hidden .main, *[dir=\"rtl\"] .aside-menu-fixed.aside-menu-hidden .app-footer {\n    margin-left: 0;\n}\n*[dir=\"rtl\"] .aside-menu-off-canvas .aside-menu {\n    position: fixed;\n    right: 0;\n    z-index: 1019;\n    height: 100%;\n}\n*[dir=\"rtl\"] .aside-menu-off-canvas .aside-menu .tab-content {\n      height: calc(100vh - 2.375rem - 55px);\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav {\n    direction: ltr;\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav * {\n      direction: rtl;\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .nav-link [class^=\"icon-\"], *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .navbar .dropdown-toggle [class^=\"icon-\"], .navbar *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .dropdown-toggle [class^=\"icon-\"], *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .nav-link [class*=\" icon-\"], *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .navbar .dropdown-toggle [class*=\" icon-\"], .navbar *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .dropdown-toggle [class*=\" icon-\"] {\n      margin-right: -4px;\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .nav-link .badge, *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .navbar .dropdown-toggle .badge, .navbar *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .dropdown-toggle .badge {\n      float: left;\n      margin-top: 2px;\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .nav-link.nav-dropdown-toggle::before, *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .navbar .nav-dropdown-toggle.dropdown-toggle::before, .navbar *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item .nav-dropdown-toggle.dropdown-toggle::before {\n      position: absolute;\n      right: auto !important;\n      left: 1rem;\n}\n*[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item.nav-dropdown.open > .nav-link.nav-dropdown-toggle::before, *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .navbar .nav-item.nav-dropdown.open > .nav-dropdown-toggle.dropdown-toggle::before, .navbar *[dir=\"rtl\"] .sidebar .sidebar-nav .nav .nav-item.nav-dropdown.open > .nav-dropdown-toggle.dropdown-toggle::before {\n      -webkit-transform: rotate(90deg);\n              transform: rotate(90deg);\n}\n*[dir=\"rtl\"] .horizontal-bars li .bars {\n    padding-right: 100px;\n    padding-left: 0;\n}\n*[dir=\"rtl\"] .horizontal-bars li .bars .progress:first-child {\n      margin-bottom: 2px;\n}\n*[dir=\"rtl\"] .horizontal-bars.type-2 li i {\n    margin-right: 5px;\n    margin-left: 1rem;\n}\n*[dir=\"rtl\"] .horizontal-bars.type-2 li .value {\n    float: left;\n    font-weight: 600;\n}\n*[dir=\"rtl\"] .horizontal-bars.type-2 li .bars {\n    padding: 0;\n}\n*[dir=\"rtl\"] .icons-list li {\n    position: relative;\n    height: 40px;\n    vertical-align: middle;\n}\n*[dir=\"rtl\"] .icons-list li i {\n      float: right;\n}\n*[dir=\"rtl\"] .icons-list li .desc {\n      margin-right: 50px;\n      margin-left: 0;\n}\n*[dir=\"rtl\"] .icons-list li .value {\n      right: auto;\n      left: 45px;\n      text-align: left;\n}\n*[dir=\"rtl\"] .icons-list li .value strong {\n        display: block;\n        margin-top: -3px;\n}\n*[dir=\"rtl\"] .icons-list li .actions {\n      right: auto;\n      left: 10px;\n}\n*[dir=\"rtl\"] .callout {\n    border: 0 solid #c2cfd6;\n    border-right-width: .25rem;\n}\n*[dir=\"rtl\"] .callout .chart-wrapper {\n      left: 0;\n      float: left;\n}\n*[dir=\"rtl\"] .callout-default {\n    border-right-color: #536c79;\n}\n*[dir=\"rtl\"].callout-primary {\n    border-right-color: #20a8d8;\n}\n*[dir=\"rtl\"].callout-secondary {\n    border-right-color: #a4b7c1;\n}\n*[dir=\"rtl\"].callout-success {\n    border-right-color: #4dbd74;\n}\n*[dir=\"rtl\"].callout-info {\n    border-right-color: #63c2de;\n}\n*[dir=\"rtl\"].callout-warning {\n    border-right-color: #ffc107;\n}\n*[dir=\"rtl\"].callout-danger {\n    border-right-color: #f86c6b;\n}\n*[dir=\"rtl\"].callout-light {\n    border-right-color: #f0f3f5;\n}\n*[dir=\"rtl\"].callout-dark {\n    border-right-color: #29363d;\n}\n", ""]);

/***/ }),

/***/ 305:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)();
exports.i(__webpack_require__(302), "");
exports.i(__webpack_require__(303), "");
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n// Import Font Awesome Icons Set\n$fa-font-path: \"~font-awesome/fonts/\";\n\n// Import Simple Line Icons Set\n$simple-line-font-path: \"~simple-line-icons/fonts/\";\n\n", ""]);

/***/ }),

/***/ 306:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)();
exports.push([module.i, "\n.nav-link {\n  cursor:pointer;\n}\n", ""]);

/***/ }),

/***/ 307:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.eot?674f50d287a8c48dc19ba404d20fe713";

/***/ }),

/***/ 308:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.eot?674f50d287a8c48dc19ba404d20fe713";

/***/ }),

/***/ 309:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.svg?912ec66d7572ff821749319396470bde";

/***/ }),

/***/ 310:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.ttf?b06871f281fee6b241d60582ae9369b9";

/***/ }),

/***/ 311:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.woff2?af7ae505a9eed503f8b8e6982036873e";

/***/ }),

/***/ 312:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/font-awesome/fontawesome-webfont.woff?fee66e712a8a08eef5805a46892932ad";

/***/ }),

/***/ 313:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/simple-line-icons/Simple-Line-Icons.svg?2fe2efe63441d830b1acd106c1fe8734";

/***/ }),

/***/ 314:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/simple-line-icons/Simple-Line-Icons.ttf?d2285965fe34b05465047401b8595dd0";

/***/ }),

/***/ 315:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/simple-line-icons/Simple-Line-Icons.woff2?0cb0b9c589c0624c9c78dd3d83e946f6";

/***/ }),

/***/ 316:
/***/ (function(module, exports) {

module.exports = "/fonts/vendor/simple-line-icons/Simple-Line-Icons.woff?78f07e2c2a535c26ef21d95e41bd7175";

/***/ }),

/***/ 328:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! tether 1.4.0 */

(function(root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Tether = factory();
  }
}(this, function(require, exports, module) {

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TetherBase = undefined;
if (typeof TetherBase === 'undefined') {
  TetherBase = { modules: [] };
}

var zeroElement = null;

// Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
// if the element lies within a nested document (<frame> or <iframe>-like).
function getActualBoundingClientRect(node) {
  var boundingRect = node.getBoundingClientRect();

  // The original object returned by getBoundingClientRect is immutable, so we clone it
  // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
  var rect = {};
  for (var k in boundingRect) {
    rect[k] = boundingRect[k];
  }

  if (node.ownerDocument !== document) {
    var _frameElement = node.ownerDocument.defaultView.frameElement;
    if (_frameElement) {
      var frameRect = getActualBoundingClientRect(_frameElement);
      rect.top += frameRect.top;
      rect.bottom += frameRect.top;
      rect.left += frameRect.left;
      rect.right += frameRect.left;
    }
  }

  return rect;
}

function getScrollParents(el) {
  // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
  // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  var computedStyle = getComputedStyle(el) || {};
  var position = computedStyle.position;
  var parents = [];

  if (position === 'fixed') {
    return [el];
  }

  var parent = el;
  while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
    var style = undefined;
    try {
      style = getComputedStyle(parent);
    } catch (err) {}

    if (typeof style === 'undefined' || style === null) {
      parents.push(parent);
      return parents;
    }

    var _style = style;
    var overflow = _style.overflow;
    var overflowX = _style.overflowX;
    var overflowY = _style.overflowY;

    if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
      if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
        parents.push(parent);
      }
    }
  }

  parents.push(el.ownerDocument.body);

  // If the node is within a frame, account for the parent window scroll
  if (el.ownerDocument !== document) {
    parents.push(el.ownerDocument.defaultView);
  }

  return parents;
}

var uniqueId = (function () {
  var id = 0;
  return function () {
    return ++id;
  };
})();

var zeroPosCache = {};
var getOrigin = function getOrigin() {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  var node = zeroElement;
  if (!node || !document.body.contains(node)) {
    node = document.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    document.body.appendChild(node);

    zeroElement = node;
  }

  var id = node.getAttribute('data-tether-id');
  if (typeof zeroPosCache[id] === 'undefined') {
    zeroPosCache[id] = getActualBoundingClientRect(node);

    // Clear the cache when this position call is done
    defer(function () {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
};

function removeUtilElements() {
  if (zeroElement) {
    document.body.removeChild(zeroElement);
  }
  zeroElement = null;
};

function getBounds(el) {
  var doc = undefined;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  var docEl = doc.documentElement;

  var box = getActualBoundingClientRect(el);

  var origin = getOrigin();

  box.top -= origin.top;
  box.left -= origin.left;

  if (typeof box.width === 'undefined') {
    box.width = document.body.scrollWidth - box.left - box.right;
  }
  if (typeof box.height === 'undefined') {
    box.height = document.body.scrollHeight - box.top - box.bottom;
  }

  box.top = box.top - docEl.clientTop;
  box.left = box.left - docEl.clientLeft;
  box.right = doc.body.clientWidth - box.width - box.left;
  box.bottom = doc.body.clientHeight - box.height - box.top;

  return box;
}

function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}

var _scrollBarSize = null;
function getScrollBarSize() {
  if (_scrollBarSize) {
    return _scrollBarSize;
  }
  var inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '200px';

  var outer = document.createElement('div');
  extend(outer.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
    width: '200px',
    height: '150px',
    overflow: 'hidden'
  });

  outer.appendChild(inner);

  document.body.appendChild(outer);

  var widthContained = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  var widthScroll = inner.offsetWidth;

  if (widthContained === widthScroll) {
    widthScroll = outer.clientWidth;
  }

  document.body.removeChild(outer);

  var width = widthContained - widthScroll;

  _scrollBarSize = { width: width, height: width };
  return _scrollBarSize;
}

function extend() {
  var out = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var args = [];

  Array.prototype.push.apply(args, arguments);

  args.slice(1).forEach(function (obj) {
    if (obj) {
      for (var key in obj) {
        if (({}).hasOwnProperty.call(obj, key)) {
          out[key] = obj[key];
        }
      }
    }
  });

  return out;
}

function removeClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.remove(cls);
      }
    });
  } else {
    var regex = new RegExp('(^| )' + name.split(' ').join('|') + '( |$)', 'gi');
    var className = getClassName(el).replace(regex, ' ');
    setClassName(el, className);
  }
}

function addClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.add(cls);
      }
    });
  } else {
    removeClass(el, name);
    var cls = getClassName(el) + (' ' + name);
    setClassName(el, cls);
  }
}

function hasClass(el, name) {
  if (typeof el.classList !== 'undefined') {
    return el.classList.contains(name);
  }
  var className = getClassName(el);
  return new RegExp('(^| )' + name + '( |$)', 'gi').test(className);
}

function getClassName(el) {
  // Can't use just SVGAnimatedString here since nodes within a Frame in IE have
  // completely separately SVGAnimatedString base classes
  if (el.className instanceof el.ownerDocument.defaultView.SVGAnimatedString) {
    return el.className.baseVal;
  }
  return el.className;
}

function setClassName(el, className) {
  el.setAttribute('class', className);
}

function updateClasses(el, add, all) {
  // Of the set of 'all' classes, we need the 'add' classes, and only the
  // 'add' classes to be set.
  all.forEach(function (cls) {
    if (add.indexOf(cls) === -1 && hasClass(el, cls)) {
      removeClass(el, cls);
    }
  });

  add.forEach(function (cls) {
    if (!hasClass(el, cls)) {
      addClass(el, cls);
    }
  });
}

var deferred = [];

var defer = function defer(fn) {
  deferred.push(fn);
};

var flush = function flush() {
  var fn = undefined;
  while (fn = deferred.pop()) {
    fn();
  }
};

var Evented = (function () {
  function Evented() {
    _classCallCheck(this, Evented);
  }

  _createClass(Evented, [{
    key: 'on',
    value: function on(event, handler, ctx) {
      var once = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      if (typeof this.bindings === 'undefined') {
        this.bindings = {};
      }
      if (typeof this.bindings[event] === 'undefined') {
        this.bindings[event] = [];
      }
      this.bindings[event].push({ handler: handler, ctx: ctx, once: once });
    }
  }, {
    key: 'once',
    value: function once(event, handler, ctx) {
      this.on(event, handler, ctx, true);
    }
  }, {
    key: 'off',
    value: function off(event, handler) {
      if (typeof this.bindings === 'undefined' || typeof this.bindings[event] === 'undefined') {
        return;
      }

      if (typeof handler === 'undefined') {
        delete this.bindings[event];
      } else {
        var i = 0;
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }, {
    key: 'trigger',
    value: function trigger(event) {
      if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
        var i = 0;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        while (i < this.bindings[event].length) {
          var _bindings$event$i = this.bindings[event][i];
          var handler = _bindings$event$i.handler;
          var ctx = _bindings$event$i.ctx;
          var once = _bindings$event$i.once;

          var context = ctx;
          if (typeof context === 'undefined') {
            context = this;
          }

          handler.apply(context, args);

          if (once) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }
    }
  }]);

  return Evented;
})();

TetherBase.Utils = {
  getActualBoundingClientRect: getActualBoundingClientRect,
  getScrollParents: getScrollParents,
  getBounds: getBounds,
  getOffsetParent: getOffsetParent,
  extend: extend,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  updateClasses: updateClasses,
  defer: defer,
  flush: flush,
  uniqueId: uniqueId,
  Evented: Evented,
  getScrollBarSize: getScrollBarSize,
  removeUtilElements: removeUtilElements
};
/* globals TetherBase, performance */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

if (typeof TetherBase === 'undefined') {
  throw new Error('You must include the utils.js file before tether.js');
}

var _TetherBase$Utils = TetherBase.Utils;
var getScrollParents = _TetherBase$Utils.getScrollParents;
var getBounds = _TetherBase$Utils.getBounds;
var getOffsetParent = _TetherBase$Utils.getOffsetParent;
var extend = _TetherBase$Utils.extend;
var addClass = _TetherBase$Utils.addClass;
var removeClass = _TetherBase$Utils.removeClass;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;
var flush = _TetherBase$Utils.flush;
var getScrollBarSize = _TetherBase$Utils.getScrollBarSize;
var removeUtilElements = _TetherBase$Utils.removeUtilElements;

function within(a, b) {
  var diff = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  return a + diff >= b && b >= a - diff;
}

var transformKey = (function () {
  if (typeof document === 'undefined') {
    return '';
  }
  var el = document.createElement('div');

  var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
  for (var i = 0; i < transforms.length; ++i) {
    var key = transforms[i];
    if (el.style[key] !== undefined) {
      return key;
    }
  }
})();

var tethers = [];

var position = function position() {
  tethers.forEach(function (tether) {
    tether.position(false);
  });
  flush();
};

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
    return performance.now();
  }
  return +new Date();
}

(function () {
  var lastCall = null;
  var lastDuration = null;
  var pendingTimeout = null;

  var tick = function tick() {
    if (typeof lastDuration !== 'undefined' && lastDuration > 16) {
      // We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250);

      // Just in case this is the last event, remember to position just once more
      pendingTimeout = setTimeout(tick, 250);
      return;
    }

    if (typeof lastCall !== 'undefined' && now() - lastCall < 10) {
      // Some browsers call events a little too frequently, refuse to run more than is reasonable
      return;
    }

    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    lastCall = now();
    position();
    lastDuration = now() - lastCall;
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
    ['resize', 'scroll', 'touchmove'].forEach(function (event) {
      window.addEventListener(event, tick);
    });
  }
})();

var MIRROR_LR = {
  center: 'center',
  left: 'right',
  right: 'left'
};

var MIRROR_TB = {
  middle: 'middle',
  top: 'bottom',
  bottom: 'top'
};

var OFFSET_MAP = {
  top: 0,
  left: 0,
  middle: '50%',
  center: '50%',
  bottom: '100%',
  right: '100%'
};

var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (left === 'auto') {
    left = MIRROR_LR[relativeToAttachment.left];
  }

  if (top === 'auto') {
    top = MIRROR_TB[relativeToAttachment.top];
  }

  return { left: left, top: top };
};

var attachmentToOffset = function attachmentToOffset(attachment) {
  var left = attachment.left;
  var top = attachment.top;

  if (typeof OFFSET_MAP[attachment.left] !== 'undefined') {
    left = OFFSET_MAP[attachment.left];
  }

  if (typeof OFFSET_MAP[attachment.top] !== 'undefined') {
    top = OFFSET_MAP[attachment.top];
  }

  return { left: left, top: top };
};

function addOffset() {
  var out = { top: 0, left: 0 };

  for (var _len = arguments.length, offsets = Array(_len), _key = 0; _key < _len; _key++) {
    offsets[_key] = arguments[_key];
  }

  offsets.forEach(function (_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (typeof top === 'string') {
      top = parseFloat(top, 10);
    }
    if (typeof left === 'string') {
      left = parseFloat(left, 10);
    }

    out.top += top;
    out.left += left;
  });

  return out;
}

function offsetToPx(offset, size) {
  if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left, 10) / 100 * size.width;
  }
  if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top, 10) / 100 * size.height;
  }

  return offset;
}

var parseOffset = function parseOffset(value) {
  var _value$split = value.split(' ');

  var _value$split2 = _slicedToArray(_value$split, 2);

  var top = _value$split2[0];
  var left = _value$split2[1];

  return { top: top, left: left };
};
var parseAttachment = parseOffset;

var TetherClass = (function (_Evented) {
  _inherits(TetherClass, _Evented);

  function TetherClass(options) {
    var _this = this;

    _classCallCheck(this, TetherClass);

    _get(Object.getPrototypeOf(TetherClass.prototype), 'constructor', this).call(this);
    this.position = this.position.bind(this);

    tethers.push(this);

    this.history = [];

    this.setOptions(options, false);

    TetherBase.modules.forEach(function (module) {
      if (typeof module.initialize !== 'undefined') {
        module.initialize.call(_this);
      }
    });

    this.position();
  }

  _createClass(TetherClass, [{
    key: 'getClass',
    value: function getClass() {
      var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var classes = this.options.classes;

      if (typeof classes !== 'undefined' && classes[key]) {
        return this.options.classes[key];
      } else if (this.options.classPrefix) {
        return this.options.classPrefix + '-' + key;
      } else {
        return key;
      }
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var _this2 = this;

      var pos = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var defaults = {
        offset: '0 0',
        targetOffset: '0 0',
        targetAttachment: 'auto auto',
        classPrefix: 'tether'
      };

      this.options = extend(defaults, options);

      var _options = this.options;
      var element = _options.element;
      var target = _options.target;
      var targetModifier = _options.targetModifier;

      this.element = element;
      this.target = target;
      this.targetModifier = targetModifier;

      if (this.target === 'viewport') {
        this.target = document.body;
        this.targetModifier = 'visible';
      } else if (this.target === 'scroll-handle') {
        this.target = document.body;
        this.targetModifier = 'scroll-handle';
      }

      ['element', 'target'].forEach(function (key) {
        if (typeof _this2[key] === 'undefined') {
          throw new Error('Tether Error: Both element and target must be defined');
        }

        if (typeof _this2[key].jquery !== 'undefined') {
          _this2[key] = _this2[key][0];
        } else if (typeof _this2[key] === 'string') {
          _this2[key] = document.querySelector(_this2[key]);
        }
      });

      addClass(this.element, this.getClass('element'));
      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('target'));
      }

      if (!this.options.attachment) {
        throw new Error('Tether Error: You must provide an attachment');
      }

      this.targetAttachment = parseAttachment(this.options.targetAttachment);
      this.attachment = parseAttachment(this.options.attachment);
      this.offset = parseOffset(this.options.offset);
      this.targetOffset = parseOffset(this.options.targetOffset);

      if (typeof this.scrollParents !== 'undefined') {
        this.disable();
      }

      if (this.targetModifier === 'scroll-handle') {
        this.scrollParents = [this.target];
      } else {
        this.scrollParents = getScrollParents(this.target);
      }

      if (!(this.options.enabled === false)) {
        this.enable(pos);
      }
    }
  }, {
    key: 'getTargetBounds',
    value: function getTargetBounds() {
      if (typeof this.targetModifier !== 'undefined') {
        if (this.targetModifier === 'visible') {
          if (this.target === document.body) {
            return { top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth };
          } else {
            var bounds = getBounds(this.target);

            var out = {
              height: bounds.height,
              width: bounds.width,
              top: bounds.top,
              left: bounds.left
            };

            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
            out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
            out.height = Math.min(innerHeight, out.height);
            out.height -= 2;

            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
            out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
            out.width = Math.min(innerWidth, out.width);
            out.width -= 2;

            if (out.top < pageYOffset) {
              out.top = pageYOffset;
            }
            if (out.left < pageXOffset) {
              out.left = pageXOffset;
            }

            return out;
          }
        } else if (this.targetModifier === 'scroll-handle') {
          var bounds = undefined;
          var target = this.target;
          if (target === document.body) {
            target = document.documentElement;

            bounds = {
              left: pageXOffset,
              top: pageYOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            bounds = getBounds(target);
          }

          var style = getComputedStyle(target);

          var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || this.target !== document.body;

          var scrollBottom = 0;
          if (hasBottomScroll) {
            scrollBottom = 15;
          }

          var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;

          var out = {
            width: 15,
            height: height * 0.975 * (height / target.scrollHeight),
            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
          };

          var fitAdj = 0;
          if (height < 408 && this.target === document.body) {
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
          }

          if (this.target !== document.body) {
            out.height = Math.max(out.height, 24);
          }

          var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
          out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);

          if (this.target === document.body) {
            out.height = Math.max(out.height, 24);
          }

          return out;
        }
      } else {
        return getBounds(this.target);
      }
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this._cache = {};
    }
  }, {
    key: 'cache',
    value: function cache(k, getter) {
      // More than one module will often need the same DOM info, so
      // we keep a cache which is cleared on each position call
      if (typeof this._cache === 'undefined') {
        this._cache = {};
      }

      if (typeof this._cache[k] === 'undefined') {
        this._cache[k] = getter.call(this);
      }

      return this._cache[k];
    }
  }, {
    key: 'enable',
    value: function enable() {
      var _this3 = this;

      var pos = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('enabled'));
      }
      addClass(this.element, this.getClass('enabled'));
      this.enabled = true;

      this.scrollParents.forEach(function (parent) {
        if (parent !== _this3.target.ownerDocument) {
          parent.addEventListener('scroll', _this3.position);
        }
      });

      if (pos) {
        this.position();
      }
    }
  }, {
    key: 'disable',
    value: function disable() {
      var _this4 = this;

      removeClass(this.target, this.getClass('enabled'));
      removeClass(this.element, this.getClass('enabled'));
      this.enabled = false;

      if (typeof this.scrollParents !== 'undefined') {
        this.scrollParents.forEach(function (parent) {
          parent.removeEventListener('scroll', _this4.position);
        });
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      this.disable();

      tethers.forEach(function (tether, i) {
        if (tether === _this5) {
          tethers.splice(i, 1);
        }
      });

      // Remove any elements we were using for convenience from the DOM
      if (tethers.length === 0) {
        removeUtilElements();
      }
    }
  }, {
    key: 'updateAttachClasses',
    value: function updateAttachClasses(elementAttach, targetAttach) {
      var _this6 = this;

      elementAttach = elementAttach || this.attachment;
      targetAttach = targetAttach || this.targetAttachment;
      var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];

      if (typeof this._addAttachClasses !== 'undefined' && this._addAttachClasses.length) {
        // updateAttachClasses can be called more than once in a position call, so
        // we need to clean up after ourselves such that when the last defer gets
        // ran it doesn't add any extra classes from previous calls.
        this._addAttachClasses.splice(0, this._addAttachClasses.length);
      }

      if (typeof this._addAttachClasses === 'undefined') {
        this._addAttachClasses = [];
      }
      var add = this._addAttachClasses;

      if (elementAttach.top) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.top);
      }
      if (elementAttach.left) {
        add.push(this.getClass('element-attached') + '-' + elementAttach.left);
      }
      if (targetAttach.top) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.top);
      }
      if (targetAttach.left) {
        add.push(this.getClass('target-attached') + '-' + targetAttach.left);
      }

      var all = [];
      sides.forEach(function (side) {
        all.push(_this6.getClass('element-attached') + '-' + side);
        all.push(_this6.getClass('target-attached') + '-' + side);
      });

      defer(function () {
        if (!(typeof _this6._addAttachClasses !== 'undefined')) {
          return;
        }

        updateClasses(_this6.element, _this6._addAttachClasses, all);
        if (!(_this6.options.addTargetClasses === false)) {
          updateClasses(_this6.target, _this6._addAttachClasses, all);
        }

        delete _this6._addAttachClasses;
      });
    }
  }, {
    key: 'position',
    value: function position() {
      var _this7 = this;

      var flushChanges = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      // flushChanges commits the changes immediately, leave true unless you are positioning multiple
      // tethers (in which case call Tether.Utils.flush yourself when you're done)

      if (!this.enabled) {
        return;
      }

      this.clearCache();

      // Turn 'auto' attachments into the appropriate corner or edge
      var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);

      this.updateAttachClasses(this.attachment, targetAttachment);

      var elementPos = this.cache('element-bounds', function () {
        return getBounds(_this7.element);
      });

      var width = elementPos.width;
      var height = elementPos.height;

      if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
        var _lastSize = this.lastSize;

        // We cache the height and width to make it possible to position elements that are
        // getting hidden.
        width = _lastSize.width;
        height = _lastSize.height;
      } else {
        this.lastSize = { width: width, height: height };
      }

      var targetPos = this.cache('target-bounds', function () {
        return _this7.getTargetBounds();
      });
      var targetSize = targetPos;

      // Get an actual px offset from the attachment
      var offset = offsetToPx(attachmentToOffset(this.attachment), { width: width, height: height });
      var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);

      var manualOffset = offsetToPx(this.offset, { width: width, height: height });
      var manualTargetOffset = offsetToPx(this.targetOffset, targetSize);

      // Add the manually provided offset
      offset = addOffset(offset, manualOffset);
      targetOffset = addOffset(targetOffset, manualTargetOffset);

      // It's now our goal to make (element position + offset) == (target position + target offset)
      var left = targetPos.left + targetOffset.left - offset.left;
      var top = targetPos.top + targetOffset.top - offset.top;

      for (var i = 0; i < TetherBase.modules.length; ++i) {
        var _module2 = TetherBase.modules[i];
        var ret = _module2.position.call(this, {
          left: left,
          top: top,
          targetAttachment: targetAttachment,
          targetPos: targetPos,
          elementPos: elementPos,
          offset: offset,
          targetOffset: targetOffset,
          manualOffset: manualOffset,
          manualTargetOffset: manualTargetOffset,
          scrollbarSize: scrollbarSize,
          attachment: this.attachment
        });

        if (ret === false) {
          return false;
        } else if (typeof ret === 'undefined' || typeof ret !== 'object') {
          continue;
        } else {
          top = ret.top;
          left = ret.left;
        }
      }

      // We describe the position three different ways to give the optimizer
      // a chance to decide the best possible way to position the element
      // with the fewest repaints.
      var next = {
        // It's position relative to the page (absolute positioning when
        // the element is a child of the body)
        page: {
          top: top,
          left: left
        },

        // It's position relative to the viewport (fixed positioning)
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };

      var doc = this.target.ownerDocument;
      var win = doc.defaultView;

      var scrollbarSize = undefined;
      if (win.innerHeight > doc.documentElement.clientHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.bottom -= scrollbarSize.height;
      }

      if (win.innerWidth > doc.documentElement.clientWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
        next.viewport.right -= scrollbarSize.width;
      }

      if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = doc.body.scrollHeight - top - height;
        next.page.right = doc.body.scrollWidth - left - width;
      }

      if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
        (function () {
          var offsetParent = _this7.cache('target-offsetparent', function () {
            return getOffsetParent(_this7.target);
          });
          var offsetPosition = _this7.cache('target-offsetparent-bounds', function () {
            return getBounds(offsetParent);
          });
          var offsetParentStyle = getComputedStyle(offsetParent);
          var offsetParentSize = offsetPosition;

          var offsetBorder = {};
          ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
            offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle['border' + side + 'Width']);
          });

          offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
          offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

          if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
            if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
              // We're within the visible part of the target's scroll parent
              var scrollTop = offsetParent.scrollTop;
              var scrollLeft = offsetParent.scrollLeft;

              // It's position relative to the target's offset parent (absolute positioning when
              // the element is moved to be a child of the target's offset parent).
              next.offset = {
                top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
                left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
              };
            }
          }
        })();
      }

      // We could also travel up the DOM and try each containing context, rather than only
      // looking at the body, but we're gonna get diminishing returns.

      this.move(next);

      this.history.unshift(next);

      if (this.history.length > 3) {
        this.history.pop();
      }

      if (flushChanges) {
        flush();
      }

      return true;
    }

    // THE ISSUE
  }, {
    key: 'move',
    value: function move(pos) {
      var _this8 = this;

      if (!(typeof this.element.parentNode !== 'undefined')) {
        return;
      }

      var same = {};

      for (var type in pos) {
        same[type] = {};

        for (var key in pos[type]) {
          var found = false;

          for (var i = 0; i < this.history.length; ++i) {
            var point = this.history[i];
            if (typeof point[type] !== 'undefined' && !within(point[type][key], pos[type][key])) {
              found = true;
              break;
            }
          }

          if (!found) {
            same[type][key] = true;
          }
        }
      }

      var css = { top: '', left: '', right: '', bottom: '' };

      var transcribe = function transcribe(_same, _pos) {
        var hasOptimizations = typeof _this8.options.optimizations !== 'undefined';
        var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;
        if (gpu !== false) {
          var yPos = undefined,
              xPos = undefined;
          if (_same.top) {
            css.top = 0;
            yPos = _pos.top;
          } else {
            css.bottom = 0;
            yPos = -_pos.bottom;
          }

          if (_same.left) {
            css.left = 0;
            xPos = _pos.left;
          } else {
            css.right = 0;
            xPos = -_pos.right;
          }

          if (window.matchMedia) {
            // HubSpot/tether#207
            var retina = window.matchMedia('only screen and (min-resolution: 1.3dppx)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3)').matches;
            if (!retina) {
              xPos = Math.round(xPos);
              yPos = Math.round(yPos);
            }
          }

          css[transformKey] = 'translateX(' + xPos + 'px) translateY(' + yPos + 'px)';

          if (transformKey !== 'msTransform') {
            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
            // but IE9 doesn't support 3d transforms and will choke.
            css[transformKey] += " translateZ(0)";
          }
        } else {
          if (_same.top) {
            css.top = _pos.top + 'px';
          } else {
            css.bottom = _pos.bottom + 'px';
          }

          if (_same.left) {
            css.left = _pos.left + 'px';
          } else {
            css.right = _pos.right + 'px';
          }
        }
      };

      var moved = false;
      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, pos.page);
      } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, pos.viewport);
      } else if (typeof same.offset !== 'undefined' && same.offset.top && same.offset.left) {
        (function () {
          css.position = 'absolute';
          var offsetParent = _this8.cache('target-offsetparent', function () {
            return getOffsetParent(_this8.target);
          });

          if (getOffsetParent(_this8.element) !== offsetParent) {
            defer(function () {
              _this8.element.parentNode.removeChild(_this8.element);
              offsetParent.appendChild(_this8.element);
            });
          }

          transcribe(same.offset, pos.offset);
          moved = true;
        })();
      } else {
        css.position = 'absolute';
        transcribe({ top: true, left: true }, pos.page);
      }

      if (!moved) {
        if (this.options.bodyElement) {
          this.options.bodyElement.appendChild(this.element);
        } else {
          var offsetParentIsBody = true;
          var currentNode = this.element.parentNode;
          while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY') {
            if (getComputedStyle(currentNode).position !== 'static') {
              offsetParentIsBody = false;
              break;
            }

            currentNode = currentNode.parentNode;
          }

          if (!offsetParentIsBody) {
            this.element.parentNode.removeChild(this.element);
            this.element.ownerDocument.body.appendChild(this.element);
          }
        }
      }

      // Any css change will trigger a repaint, so let's avoid one if nothing changed
      var writeCSS = {};
      var write = false;
      for (var key in css) {
        var val = css[key];
        var elVal = this.element.style[key];

        if (elVal !== val) {
          write = true;
          writeCSS[key] = val;
        }
      }

      if (write) {
        defer(function () {
          extend(_this8.element.style, writeCSS);
          _this8.trigger('repositioned');
        });
      }
    }
  }]);

  return TetherClass;
})(Evented);

TetherClass.modules = [];

TetherBase.position = position;

var Tether = extend(TetherClass, TetherBase);
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var extend = _TetherBase$Utils.extend;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

function getBoundingRect(tether, to) {
  if (to === 'scrollParent') {
    to = tether.scrollParents[0];
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (typeof to.nodeType !== 'undefined') {
    (function () {
      var node = to;
      var size = getBounds(to);
      var pos = size;
      var style = getComputedStyle(to);

      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

      // Account any parent Frames scroll offset
      if (node.ownerDocument !== document) {
        var win = node.ownerDocument.defaultView;
        to[0] += win.pageXOffset;
        to[1] += win.pageYOffset;
        to[2] += win.pageXOffset;
        to[3] += win.pageYOffset;
      }

      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);
        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style['border' + side + 'Width']);
        } else {
          to[i] -= parseFloat(style['border' + side + 'Width']);
        }
      });
    })();
  }

  return to;
}

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;
    var targetAttachment = _ref.targetAttachment;

    if (!this.options.constraints) {
      return true;
    }

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
      var _lastSize = this.lastSize;

      // Handle the item getting hidden as a result of our positioning without glitching
      // the classes in and out
      width = _lastSize.width;
      height = _lastSize.height;
    }

    var targetSize = this.cache('target-bounds', function () {
      return _this.getTargetBounds();
    });

    var targetHeight = targetSize.height;
    var targetWidth = targetSize.width;

    var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];

    this.options.constraints.forEach(function (constraint) {
      var outOfBoundsClass = constraint.outOfBoundsClass;
      var pinnedClass = constraint.pinnedClass;

      if (outOfBoundsClass) {
        allClasses.push(outOfBoundsClass);
      }
      if (pinnedClass) {
        allClasses.push(pinnedClass);
      }
    });

    allClasses.forEach(function (cls) {
      ['left', 'top', 'right', 'bottom'].forEach(function (side) {
        allClasses.push(cls + '-' + side);
      });
    });

    var addClasses = [];

    var tAttachment = extend({}, targetAttachment);
    var eAttachment = extend({}, this.attachment);

    this.options.constraints.forEach(function (constraint) {
      var to = constraint.to;
      var attachment = constraint.attachment;
      var pin = constraint.pin;

      if (typeof attachment === 'undefined') {
        attachment = '';
      }

      var changeAttachX = undefined,
          changeAttachY = undefined;
      if (attachment.indexOf(' ') >= 0) {
        var _attachment$split = attachment.split(' ');

        var _attachment$split2 = _slicedToArray(_attachment$split, 2);

        changeAttachY = _attachment$split2[0];
        changeAttachX = _attachment$split2[1];
      } else {
        changeAttachX = changeAttachY = attachment;
      }

      var bounds = getBoundingRect(_this, to);

      if (changeAttachY === 'target' || changeAttachY === 'both') {
        if (top < bounds[1] && tAttachment.top === 'top') {
          top += targetHeight;
          tAttachment.top = 'bottom';
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          top -= targetHeight;
          tAttachment.top = 'top';
        }
      }

      if (changeAttachY === 'together') {
        if (tAttachment.top === 'top') {
          if (eAttachment.top === 'bottom' && top < bounds[1]) {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top += height;
            eAttachment.top = 'top';
          } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
            top -= height - targetHeight;
            tAttachment.top = 'bottom';

            eAttachment.top = 'bottom';
          }
        }

        if (tAttachment.top === 'bottom') {
          if (eAttachment.top === 'top' && top + height > bounds[3]) {
            top -= targetHeight;
            tAttachment.top = 'top';

            top -= height;
            eAttachment.top = 'bottom';
          } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
            top += height - targetHeight;
            tAttachment.top = 'top';

            eAttachment.top = 'top';
          }
        }

        if (tAttachment.top === 'middle') {
          if (top + height > bounds[3] && eAttachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          } else if (top < bounds[1] && eAttachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
        }
      }

      if (changeAttachX === 'target' || changeAttachX === 'both') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          left += targetWidth;
          tAttachment.left = 'right';
        }

        if (left + width > bounds[2] && tAttachment.left === 'right') {
          left -= targetWidth;
          tAttachment.left = 'left';
        }
      }

      if (changeAttachX === 'together') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          if (eAttachment.left === 'right') {
            left += targetWidth;
            tAttachment.left = 'right';

            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';

            left -= width;
            eAttachment.left = 'right';
          }
        } else if (left + width > bounds[2] && tAttachment.left === 'right') {
          if (eAttachment.left === 'left') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left += width;
            eAttachment.left = 'left';
          }
        } else if (tAttachment.left === 'center') {
          if (left + width > bounds[2] && eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (left < bounds[0] && eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          }
        }
      }

      if (changeAttachY === 'element' || changeAttachY === 'both') {
        if (top < bounds[1] && eAttachment.top === 'bottom') {
          top += height;
          eAttachment.top = 'top';
        }

        if (top + height > bounds[3] && eAttachment.top === 'top') {
          top -= height;
          eAttachment.top = 'bottom';
        }
      }

      if (changeAttachX === 'element' || changeAttachX === 'both') {
        if (left < bounds[0]) {
          if (eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'center') {
            left += width / 2;
            eAttachment.left = 'left';
          }
        }

        if (left + width > bounds[2]) {
          if (eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'center') {
            left -= width / 2;
            eAttachment.left = 'right';
          }
        }
      }

      if (typeof pin === 'string') {
        pin = pin.split(',').map(function (p) {
          return p.trim();
        });
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];

      var pinned = [];
      var oob = [];

      if (top < bounds[1]) {
        if (pin.indexOf('top') >= 0) {
          top = bounds[1];
          pinned.push('top');
        } else {
          oob.push('top');
        }
      }

      if (top + height > bounds[3]) {
        if (pin.indexOf('bottom') >= 0) {
          top = bounds[3] - height;
          pinned.push('bottom');
        } else {
          oob.push('bottom');
        }
      }

      if (left < bounds[0]) {
        if (pin.indexOf('left') >= 0) {
          left = bounds[0];
          pinned.push('left');
        } else {
          oob.push('left');
        }
      }

      if (left + width > bounds[2]) {
        if (pin.indexOf('right') >= 0) {
          left = bounds[2] - width;
          pinned.push('right');
        } else {
          oob.push('right');
        }
      }

      if (pinned.length) {
        (function () {
          var pinnedClass = undefined;
          if (typeof _this.options.pinnedClass !== 'undefined') {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = _this.getClass('pinned');
          }

          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push(pinnedClass + '-' + side);
          });
        })();
      }

      if (oob.length) {
        (function () {
          var oobClass = undefined;
          if (typeof _this.options.outOfBoundsClass !== 'undefined') {
            oobClass = _this.options.outOfBoundsClass;
          } else {
            oobClass = _this.getClass('out-of-bounds');
          }

          addClasses.push(oobClass);
          oob.forEach(function (side) {
            addClasses.push(oobClass + '-' + side);
          });
        })();
      }

      if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }

      if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
        _this.updateAttachClasses(eAttachment, tAttachment);
        _this.trigger('update', {
          attachment: eAttachment,
          targetAttachment: tAttachment
        });
      }
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return { top: top, left: left };
  }
});
/* globals TetherBase */

'use strict';

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    var targetPos = this.getTargetBounds();

    var bottom = top + height;
    var right = left + width;

    var abutted = [];
    if (top <= targetPos.bottom && bottom >= targetPos.top) {
      ['left', 'right'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === left || targetPosSide === right) {
          abutted.push(side);
        }
      });
    }

    if (left <= targetPos.right && right >= targetPos.left) {
      ['top', 'bottom'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === top || targetPosSide === bottom) {
          abutted.push(side);
        }
      });
    }

    var allClasses = [];
    var addClasses = [];

    var sides = ['left', 'top', 'right', 'bottom'];
    allClasses.push(this.getClass('abutted'));
    sides.forEach(function (side) {
      allClasses.push(_this.getClass('abutted') + '-' + side);
    });

    if (abutted.length) {
      addClasses.push(this.getClass('abutted'));
    }

    abutted.forEach(function (side) {
      addClasses.push(_this.getClass('abutted') + '-' + side);
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return true;
  }
});
/* globals TetherBase */

'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

TetherBase.modules.push({
  position: function position(_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (!this.options.shift) {
      return;
    }

    var shift = this.options.shift;
    if (typeof this.options.shift === 'function') {
      shift = this.options.shift.call(this, { top: top, left: left });
    }

    var shiftTop = undefined,
        shiftLeft = undefined;
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] = shift[1] || shift[0];

      var _shift = shift;

      var _shift2 = _slicedToArray(_shift, 2);

      shiftTop = _shift2[0];
      shiftLeft = _shift2[1];

      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      shiftTop = shift.top;
      shiftLeft = shift.left;
    }

    top += shiftTop;
    left += shiftLeft;

    return { top: top, left: left };
  }
});
return Tether;

}));


/***/ }),

/***/ 331:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(357)
__webpack_require__(356)

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(165),
  /* template */
  __webpack_require__(351),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/App.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] App.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-715bc427", Component.options)
  } else {
    hotAPI.reload("data-v-715bc427", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 332:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(166),
  /* template */
  __webpack_require__(345),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/Breadcrumb.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Breadcrumb.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1bf7f5e2", Component.options)
  } else {
    hotAPI.reload("data-v-1bf7f5e2", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 333:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(167),
  /* template */
  __webpack_require__(354),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/Footer.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Footer.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f7232a0c", Component.options)
  } else {
    hotAPI.reload("data-v-f7232a0c", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 334:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(168),
  /* template */
  __webpack_require__(353),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/Header.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Header.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b4be6228", Component.options)
  } else {
    hotAPI.reload("data-v-b4be6228", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 335:
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(358)

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(169),
  /* template */
  __webpack_require__(352),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/Sidebar.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Sidebar.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-9bed1ee6", Component.options)
  } else {
    hotAPI.reload("data-v-9bed1ee6", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 336:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(170),
  /* template */
  __webpack_require__(347),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/SidebarNavDropdown.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] SidebarNavDropdown.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-35fff492", Component.options)
  } else {
    hotAPI.reload("data-v-35fff492", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 337:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(171),
  /* template */
  __webpack_require__(348),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/SidebarNavLink.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] SidebarNavLink.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5b1967c0", Component.options)
  } else {
    hotAPI.reload("data-v-5b1967c0", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 338:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(172),
  /* template */
  __webpack_require__(349),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/components/SidebarNavTitle.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] SidebarNavTitle.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-601a4422", Component.options)
  } else {
    hotAPI.reload("data-v-601a4422", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 339:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(173),
  /* template */
  __webpack_require__(343),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/containers/RootContainer.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] RootContainer.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0fcca8ac", Component.options)
  } else {
    hotAPI.reload("data-v-0fcca8ac", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 340:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(174),
  /* template */
  __webpack_require__(344),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/views/Dashboard.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Dashboard.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1358fc39", Component.options)
  } else {
    hotAPI.reload("data-v-1358fc39", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 341:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(175),
  /* template */
  __webpack_require__(350),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/views/Tasklist.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Tasklist.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6278260e", Component.options)
  } else {
    hotAPI.reload("data-v-6278260e", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 342:
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(176),
  /* template */
  __webpack_require__(346),
  /* scopeId */
  null,
  /* cssModules */
  null
)
Component.options.__file = "/home/sixtay/code/html/GreenShootLabs/zeno/resources/assets/js/zeno/views/Tasklists.vue"
if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
if (Component.options.functional) {console.error("[vue-loader] Tasklists.vue: functional components are not supported with templates, they should use render functions.")}

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1f8f8656", Component.options)
  } else {
    hotAPI.reload("data-v-1f8f8656", Component.options)
  }
})()}

module.exports = Component.exports


/***/ }),

/***/ 343:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "app"
  }, [_c('AppHeader'), _vm._v(" "), _c('div', {
    staticClass: "app-body"
  }, [_c('Sidebar', {
    attrs: {
      "navItems": _vm.nav
    }
  }), _vm._v(" "), _c('main', {
    staticClass: "main"
  }, [_c('breadcrumb', {
    attrs: {
      "list": _vm.list
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "container-fluid"
  }, [_c('router-view')], 1)], 1)], 1), _vm._v(" "), _c('AppFooter')], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-0fcca8ac", module.exports)
  }
}

/***/ }),

/***/ 344:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "animated fadeIn"
  }, [_c('b-jumbotron', {
    staticClass: "bd-pageheader",
    attrs: {
      "header": "Team<strong>Task</strong>",
      "header-tag": "h1",
      "lead": "Teamtask project tasks"
    }
  }), _vm._v(" "), _vm._m(0), _vm._v(" "), _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-sm-12 col-lg-4"
  }, [_c('b-card', {
    staticClass: "bg-primary",
    attrs: {
      "no-block": true
    }
  }, [_c('div', {
    staticClass: "card-body font-weight-bold pb-0"
  }, [_c('b-dropdown', {
    staticClass: "float-right",
    attrs: {
      "variant": "transparent p-0",
      "right": ""
    }
  }, [_c('template', {
    slot: "button-content"
  }, [_c('i', {
    staticClass: "icon-settings"
  })]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Another action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Something else here...")]), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "disabled": ""
    }
  }, [_vm._v("Disabled action")])], 2), _vm._v(" "), _c('div', {
    staticClass: "h1 text-right mb-4"
  }, [_c('i', {
    staticClass: "icon-pie-chart"
  })]), _vm._v(" "), _c('h4', {
    staticClass: "mb-0"
  }, [_vm._v("15")]), _vm._v(" "), _c('p', {
    staticClass: "h2 font-weight-bold"
  }, [_vm._v("Active")])], 1)])], 1), _vm._v(" "), _c('div', {
    staticClass: "col-sm-12 col-lg-4"
  }, [_c('b-card', {
    staticClass: "bg-info",
    attrs: {
      "no-block": true
    }
  }, [_c('div', {
    staticClass: "card-body pb-0"
  }, [_c('b-dropdown', {
    staticClass: "float-right",
    attrs: {
      "variant": "transparent p-0",
      "right": ""
    }
  }, [_c('template', {
    slot: "button-content"
  }, [_c('i', {
    staticClass: "icon-settings"
  })]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Another action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Something else here...")]), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "disabled": ""
    }
  }, [_vm._v("Disabled action")])], 2), _vm._v(" "), _c('div', {
    staticClass: "h1 text-right mb-4"
  }, [_c('i', {
    staticClass: "icon-pie-chart"
  })]), _vm._v(" "), _c('h4', {
    staticClass: "mb-0"
  }, [_vm._v("5")]), _vm._v(" "), _c('p', {
    staticClass: "h2 font-weight-bold"
  }, [_vm._v("Paused")])], 1)])], 1), _vm._v(" "), _c('div', {
    staticClass: "col-sm-12 col-lg-4"
  }, [_c('b-card', {
    staticClass: "bg-warning",
    attrs: {
      "no-block": true
    }
  }, [_c('div', {
    staticClass: "card-body pb-0"
  }, [_c('b-dropdown', {
    staticClass: "float-right",
    attrs: {
      "variant": "transparent p-0",
      "right": ""
    }
  }, [_c('template', {
    slot: "button-content"
  }, [_c('i', {
    staticClass: "icon-settings"
  })]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Another action")]), _vm._v(" "), _c('b-dropdown-item', [_vm._v("Something else here...")]), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "disabled": ""
    }
  }, [_vm._v("Disabled action")])], 2), _vm._v(" "), _c('div', {
    staticClass: "h1 text-right mb-4"
  }, [_c('i', {
    staticClass: "icon-pie-chart"
  })]), _vm._v(" "), _c('h4', {
    staticClass: "mb-0"
  }, [_vm._v("6")]), _vm._v(" "), _c('p', {
    staticClass: "h2 font-weight-bold"
  }, [_vm._v("Templates")])], 1)])], 1)]), _vm._v(" "), _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-md-12"
  }, [_c('b-card', {
    staticClass: "borderless",
    attrs: {
      "title": "<h5><strong>Upcoming tasks</strong></h5>",
      "border-variant": "light"
    }
  }, [_c('b-table', {
    staticClass: "table-task-list mb-0",
    attrs: {
      "hover": "",
      "responsive": "",
      "items": _vm.tableItems,
      "fields": _vm.tableFields,
      "head-variant": "light"
    },
    scopedSlots: _vm._u([{
      key: "action",
      fn: function(item) {
        return [_c('div', {
          staticClass: "avatar"
        }, [_c('i', {
          staticClass: "fa fa-check-circle-o fa-lg light-faded"
        })])]
      }
    }, {
      key: "tasklist",
      fn: function(item) {
        return [_c('div', {
          staticClass: "task-entry bolder"
        }, [_vm._v("\n              " + _vm._s(item.value.name) + "\n              "), _c('b-button', {
          staticClass: "btn-edit borderless",
          attrs: {
            "size": "sm",
            "variant": "outline-primary"
          }
        }, [_c('i', {
          staticClass: "fa fa-pencil"
        })])], 1), _vm._v(" "), _c('div', {
          staticClass: "small text-muted"
        }, [_c('span', {
          staticClass: "bolder faded"
        }, [_vm._v(_vm._s(item.value.detail))]), _vm._v(" |\n              "), _c('span', [(item.value.new) ? [_c('strong', [_vm._v("Once")])] : [_c('strong', [_vm._v("Recurring")])]], 2)])]
      }
    }, {
      key: "due",
      fn: function(item) {
        return [_c('strong', [_vm._v(_vm._s(item.value.date))])]
      }
    }, {
      key: "state",
      fn: function(item) {
        return [_c('div', {
          staticClass: "clearfix"
        }, [_c('div', {
          staticClass: "float-left"
        }, [_c('b-form-radio', {
          staticClass: "mb-4",
          attrs: {
            "id": "btnradios2",
            "buttons": "",
            "button-variant": "outline-primary borderless",
            "size": "sm",
            "options": _vm.statusOptions
          },
          model: {
            value: (item.value),
            callback: function($$v) {
              item.value = $$v
            },
            expression: "item.value"
          }
        })], 1)])]
      }
    }])
  })], 1)], 1)])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-sm-6 col-lg-3"
  }, [_c('h2', [_c('strong', [_vm._v("Lists")])]), _vm._v(" "), _c('br')])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1358fc39", module.exports)
  }
}

/***/ }),

/***/ 345:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('ol', {
    staticClass: "breadcrumb"
  }, _vm._l((_vm.list), function(item, index) {
    return _c('li', {
      staticClass: "breadcrumb-item"
    }, [(_vm.isLast(index)) ? _c('span', {
      staticClass: "active"
    }, [_vm._v(_vm._s(_vm.showName(item)))]) : _c('router-link', {
      attrs: {
        "to": item.path
      }
    }, [_vm._v(_vm._s(_vm.showName(item)))])], 1)
  }))
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1bf7f5e2", module.exports)
  }
}

/***/ }),

/***/ 346:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "animated fadeIn"
  }, [_c('b-jumbotron', {
    staticClass: "bd-pageheader",
    attrs: {
      "header": "DeesonAgency <strong>Lists</strong>",
      "header-tag": "h1",
      "lead": "Teamtask project tasks"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-md-12"
  }, [_c('b-card', {
    staticClass: "borderless",
    attrs: {
      "border-variant": "light"
    }
  }, [_c('b-table', {
    staticClass: "table-task-list mb-0",
    attrs: {
      "hover": "",
      "responsive": "",
      "items": _vm.tableItems,
      "fields": _vm.tableFields,
      "head-variant": "light"
    },
    scopedSlots: _vm._u([{
      key: "action",
      fn: function(item) {
        return [_c('div', {
          staticClass: "avatar"
        }, [_c('i', {
          staticClass: "fa fa-check-circle-o fa-lg light-faded"
        })])]
      }
    }, {
      key: "task",
      fn: function(item) {
        return [_c('div', {
          staticClass: "task-entry bolder"
        }, [_vm._v(_vm._s(item.value.name))]), _vm._v(" "), _c('div', {
          staticClass: "small text-muted"
        }, [_c('span', {
          staticClass: "bolder faded"
        }, [_vm._v(_vm._s(item.value.detail))]), _vm._v(" |\n              "), _c('span', [(item.value.new) ? [_vm._v("Once")] : [_vm._v("Recurring")]], 2)])]
      }
    }, {
      key: "due",
      fn: function(item) {
        return [_c('strong', [_vm._v(_vm._s(item.value.date))])]
      }
    }, {
      key: "state",
      fn: function(item) {
        return [_c('div', {
          staticClass: "clearfix"
        }, [_c('div', {
          staticClass: "float-left"
        }, [_c('b-form-radio', {
          staticClass: "mb-4",
          attrs: {
            "id": "btnradios2",
            "buttons": "",
            "button-variant": "outline-primary borderless",
            "size": "sm",
            "options": _vm.statusOptions
          },
          model: {
            value: (item.value),
            callback: function($$v) {
              item.value = $$v
            },
            expression: "item.value"
          }
        })], 1)])]
      }
    }])
  })], 1)], 1)])], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-1f8f8656", module.exports)
  }
}

/***/ }),

/***/ 347:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('router-link', {
    staticClass: "nav-item nav-dropdown",
    attrs: {
      "tag": "li",
      "to": _vm.url,
      "disabled": ""
    }
  }, [_c('div', {
    staticClass: "nav-link nav-dropdown-toggle",
    on: {
      "click": _vm.handleClick
    }
  }, [_c('i', {
    class: _vm.icon
  }), _vm._v(" " + _vm._s(_vm.name))]), _vm._v(" "), _c('ul', {
    staticClass: "nav-dropdown-items"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-35fff492", module.exports)
  }
}

/***/ }),

/***/ 348:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('router-link', {
    staticClass: "nav-link",
    attrs: {
      "to": _vm.url
    }
  }, [_c('i', {
    class: _vm.icon
  }), _vm._v(" " + _vm._s(_vm.name) + "\n  "), _c('b-badge', {
    attrs: {
      "variant": _vm.badge.variant
    }
  }, [_vm._v(_vm._s(_vm.badge.text))])], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-5b1967c0", module.exports)
  }
}

/***/ }),

/***/ 349:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('li', {
    staticClass: "nav-title",
    class: _vm.classes
  }, [(_vm.wrapper && _vm.wrapper.element) ? [_c(_vm.wrapper.element, _vm._b({
    tag: "component"
  }, 'component', _vm.wrapper.attributes, false), [_vm._v("\n      " + _vm._s(_vm.name) + "\n    ")])] : [_vm._v("\n    " + _vm._s(_vm.name) + "\n  ")]], 2)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-601a4422", module.exports)
  }
}

/***/ }),

/***/ 350:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "animated fadeIn"
  }, [_c('b-jumbotron', {
    staticClass: "bd-pageheader",
    attrs: {
      "header": "Active List",
      "header-tag": "h4"
    }
  }, [_c('h1', {
    staticClass: "bolder"
  }, [_vm._v("Onboarding List")])]), _vm._v(" "), _vm._m(0), _vm._v(" "), _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-md-12"
  }, [_c('b-card', {
    staticClass: "borderless",
    attrs: {
      "border-variant": "light"
    }
  }, [_c('b-table', {
    staticClass: "table-task-list mb-0",
    attrs: {
      "hover": "",
      "responsive": "",
      "items": _vm.tableItems,
      "fields": _vm.tableFields,
      "head-variant": "light"
    },
    scopedSlots: _vm._u([{
      key: "action",
      fn: function(item) {
        return [_c('div', {
          staticClass: "avatar"
        }, [_c('i', {
          staticClass: "fa fa-check-circle-o fa-lg light-faded"
        })])]
      }
    }, {
      key: "task",
      fn: function(item) {
        return [_c('h4', {
          staticClass: "task-entry bolder"
        }, [_vm._v(_vm._s(item.value.name))]), _vm._v(" "), _c('div', {
          staticClass: "small text-muted"
        }, [_c('span', {
          staticClass: "bolder faded"
        }, [_vm._v(_vm._s(item.value.detail))]), _vm._v(" |\n              "), _c('span', [(item.value.new) ? [_vm._v("Once")] : [_vm._v("Recurring")]], 2)])]
      }
    }, {
      key: "assignees",
      fn: function(item) {
        return [_c('div', {
          staticClass: "clearfix"
        }, [_c('div', {
          staticClass: "float-left"
        }, [_vm._l((item.value), function(assignee) {
          return _c('img', {
            staticClass: "img-fluid img-thumbnail rounded-circle img-assignee-list",
            attrs: {
              "src": _vm.getRandomImageFromRange(1, 8),
              "alt": assignee.name
            }
          })
        }), _vm._v(" "), _c('b-button', {
          staticClass: "light-faded",
          attrs: {
            "size": "circle",
            "variant": "outline-primary"
          }
        }, [_c('span', {
          staticClass: "bolder"
        }, [_vm._v("+")])])], 2)])]
      }
    }, {
      key: "due",
      fn: function(item) {
        return [_c('strong', [_vm._v(_vm._s(item.value.date))])]
      }
    }])
  })], 1)], 1)])], 1)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "container"
  }, [_c('div', {
    staticClass: "row"
  }, [_c('div', {
    staticClass: "col-sm-6 col-lg-3"
  }, [_c('p', {
    staticClass: "bolder"
  }, [_vm._v("Recurring Rules")]), _vm._v(" "), _c('br')])])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-6278260e", module.exports)
  }
}

/***/ }),

/***/ 351:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('router-view')
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-715bc427", module.exports)
  }
}

/***/ }),

/***/ 352:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "sidebar"
  }, [_c('nav', {
    staticClass: "sidebar-nav"
  }, [_c('div', {
    slot: "header"
  }), _vm._v(" "), _c('ul', {
    staticClass: "nav"
  }, _vm._l((_vm.navItems), function(item, index) {
    return _c('li', {
      staticClass: "nav-item"
    }, [(item.title) ? [_c('SidebarNavTitle', {
      attrs: {
        "name": item.name,
        "classes": item.class,
        "wrapper": item.wrapper
      }
    })] : (item.divider) ? [_c('li', {
      staticClass: "divider"
    })] : [(item.children) ? [_c('SidebarNavDropdown', {
      attrs: {
        "name": item.name,
        "url": item.url,
        "icon": item.icon
      }
    }, [_vm._l((item.children), function(child, index) {
      return [(child.children) ? [_c('SidebarNavDropdown', {
        attrs: {
          "name": child.name,
          "url": child.url,
          "icon": child.icon
        }
      }, _vm._l((item.children), function(child, index) {
        return _c('li', {
          staticClass: "nav-item"
        }, [_c('SidebarNavLink', {
          attrs: {
            "name": child.name,
            "url": child.url,
            "icon": child.icon,
            "badge": child.badge
          }
        })], 1)
      }))] : [_c('li', {
        staticClass: "nav-item"
      }, [_c('SidebarNavLink', {
        attrs: {
          "name": child.name,
          "url": child.url,
          "icon": child.icon,
          "badge": child.badge
        }
      })], 1)]]
    })], 2)] : [_c('SidebarNavLink', {
      attrs: {
        "name": item.name,
        "url": item.url,
        "icon": item.icon,
        "badge": item.badge
      }
    })]]], 2)
  })), _vm._v(" "), _vm._t("default"), _vm._v(" "), _c('div', {
    slot: "footer"
  })], 2)])
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-9bed1ee6", module.exports)
  }
}

/***/ }),

/***/ 353:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('header', {
    staticClass: "app-header navbar"
  }, [_c('button', {
    staticClass: "navbar-toggler mobile-sidebar-toggler d-lg-none",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.mobileSidebarToggle
    }
  }, [_vm._v("☰")]), _vm._v(" "), _c('b-link', {
    staticClass: "navbar-brand",
    attrs: {
      "to": "Home"
    }
  }, [_vm._v("team"), _c('strong', [_vm._v("assist")])]), _vm._v(" "), _c('button', {
    staticClass: "navbar-toggler sidebar-toggler d-md-down-none",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.sidebarMinimize
    }
  }, [_vm._v("☰")]), _vm._v(" "), _c('b-nav', {
    staticClass: "d-md-down-none",
    attrs: {
      "is-nav-bar": ""
    }
  }, [_c('b-nav-item', {
    staticClass: "px-3"
  }, [_c('router-link', {
    attrs: {
      "to": {
        name: 'dashboard'
      }
    }
  }, [_vm._v("Dashboard")])], 1)], 1), _vm._v(" "), _c('b-nav', {
    staticClass: "ml-auto",
    attrs: {
      "is-nav-bar": ""
    }
  }, [_c('b-nav-item-dropdown', {
    attrs: {
      "right": ""
    }
  }, [_c('template', {
    slot: "button-content"
  }, [_c('img', {
    staticClass: "img-avatar",
    attrs: {
      "src": "static/img/avatars/6.jpg",
      "alt": "admin@bootstrapmaster.com"
    }
  }), _vm._v(" "), _c('span', {
    staticClass: "d-md-down-none"
  })]), _vm._v(" "), _c('b-dropdown-header', {
    staticClass: "text-center",
    attrs: {
      "tag": "div"
    }
  }, [_c('strong', [_vm._v("Account")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-bell-o"
  }), _vm._v(" Updates"), _c('span', {
    staticClass: "badge badge-info"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-envelope-o"
  }), _vm._v(" Messages"), _c('span', {
    staticClass: "badge badge-success"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-tasks"
  }), _vm._v(" Tasks"), _c('span', {
    staticClass: "badge badge-danger"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-comments"
  }), _vm._v(" Comments"), _c('span', {
    staticClass: "badge badge-warning"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-header', {
    staticClass: "text-center",
    attrs: {
      "tag": "div"
    }
  }, [_c('strong', [_vm._v("Settings")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-user"
  }), _vm._v(" Profile")]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-wrench"
  }), _vm._v(" Settings")]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-usd"
  }), _vm._v(" Payments"), _c('span', {
    staticClass: "badge badge-default"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-file"
  }), _vm._v(" Projects"), _c('span', {
    staticClass: "badge badge-primary"
  }, [_vm._v("42")])]), _vm._v(" "), _c('b-dropdown-divider'), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-shield"
  }), _vm._v(" Lock Account")]), _vm._v(" "), _c('b-dropdown-item', [_c('i', {
    staticClass: "fa fa-lock"
  }), _vm._v(" Logout")])], 2)], 1)], 1)
},staticRenderFns: []}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-b4be6228", module.exports)
  }
}

/***/ }),

/***/ 354:
/***/ (function(module, exports, __webpack_require__) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('footer', {
    staticClass: "app-footer"
  }, [_c('a', {
    attrs: {
      "href": "http://coreui.io"
    }
  }, [_vm._v("CoreUI")]), _vm._v(" © 2017 creativeLabs.\n  "), _c('span', {
    staticClass: "float-right"
  }, [_vm._v("Powered by "), _c('a', {
    attrs: {
      "href": "http://coreui.io"
    }
  }, [_vm._v("CoreUI")])])])
}]}
module.exports.render._withStripped = true
if (false) {
  module.hot.accept()
  if (module.hot.data) {
     require("vue-hot-reload-api").rerender("data-v-f7232a0c", module.exports)
  }
}

/***/ }),

/***/ 355:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
  * vue-router v2.7.0
  * (c) 2017 Evan You
  * @license MIT
  */
/*  */

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

function warn (condition, message) {
  if ("development" !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
  }
}

function isError (err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

var View = {
  name: 'router-view',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render: function render (_, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    var h = parent.$createElement;
    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent && parent._routerRoot !== parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      if (parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    var matched = route.matched[depth];
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null;
      return h()
    }

    var component = cache[name] = matched.components[name];

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = function (vm, val) {
      // val could be undefined for unregistration
      var current = matched.instances[name];
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val;
      }
    }

    // also regiseter instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
      matched.instances[name] = vnode.componentInstance;
    };

    // resolve props
    data.props = resolveProps(route, matched.props && matched.props[name]);

    return h(component, data, children)
  }
};

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (true) {
        warn(
          false,
          "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
          "expecting an object, function or boolean."
        );
      }
  }
}

/*  */

var encodeReserveRE = /[!'()*]/g;
var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
var commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
var encode = function (str) { return encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ','); };

var decode = decodeURIComponent;

function resolveQuery (
  query,
  extraQuery,
  _parseQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  var parse = _parseQuery || parseQuery;
  var parsedQuery;
  try {
    parsedQuery = parse(query || '');
  } catch (e) {
    "development" !== 'production' && warn(false, e.message);
    parsedQuery = {};
  }
  for (var key in extraQuery) {
    var val = extraQuery[key];
    parsedQuery[key] = Array.isArray(val) ? val.slice() : val;
  }
  return parsedQuery
}

function parseQuery (query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0
      ? decode(parts.join('='))
      : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res
}

function stringifyQuery (obj) {
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return encode(key)
    }

    if (Array.isArray(val)) {
      var result = [];
      val.forEach(function (val2) {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&')
    }

    return encode(key) + '=' + encode(val)
  }).filter(function (x) { return x.length > 0; }).join('&') : null;
  return res ? ("?" + res) : ''
}

/*  */


var trailingSlashRE = /\/?$/;

function createRoute (
  record,
  location,
  redirectedFrom,
  router
) {
  var stringifyQuery$$1 = router && router.options.stringifyQuery;
  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: location.query || {},
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery$$1),
    matched: record ? formatMatch(record) : []
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery$$1);
  }
  return Object.freeze(route)
}

// the starting route that represents the initial state
var START = createRoute(null, {
  path: '/'
});

function formatMatch (record) {
  var res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res
}

function getFullPath (
  ref,
  _stringifyQuery
) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  var stringify = _stringifyQuery || stringifyQuery;
  return (path || '/') + stringify(query) + hash
}

function isSameRoute (a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key) {
    var aVal = a[key];
    var bVal = b[key];
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}

function isIncludedRoute (current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/')
    ) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

/*  */

// work around weird flow bug
var toTypes = [String, Object];
var eventTypes = [String, Array];

var Link = {
  name: 'router-link',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;

    var router = this.$router;
    var current = this.$route;
    var ref = router.resolve(this.to, current, this.append);
    var location = ref.location;
    var route = ref.route;
    var href = ref.href;

    var classes = {};
    var globalActiveClass = router.options.linkActiveClass;
    var globalExactActiveClass = router.options.linkExactActiveClass;
    // Support global empty active class
    var activeClassFallback = globalActiveClass == null
            ? 'router-link-active'
            : globalActiveClass;
    var exactActiveClassFallback = globalExactActiveClass == null
            ? 'router-link-exact-active'
            : globalExactActiveClass;
    var activeClass = this.activeClass == null
            ? activeClassFallback
            : this.activeClass;
    var exactActiveClass = this.exactActiveClass == null
            ? exactActiveClassFallback
            : this.exactActiveClass;
    var compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route;

    classes[exactActiveClass] = isSameRoute(current, compareTarget);
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget);

    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(location);
        } else {
          router.push(location);
        }
      }
    };

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = handler; });
    } else {
      on[this.event] = handler;
    }

    var data = {
      class: classes
    };

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href: href };
    } else {
      // find the first <a> child and apply listener and href
      var a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        var extend = _Vue.util.extend;
        var aData = a.data = extend({}, a.data);
        aData.on = on;
        var aAttrs = a.data.attrs = extend({}, a.data.attrs);
        aAttrs.href = href;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default)
  }
};

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) { return }
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

function findAnchor (children) {
  if (children) {
    var child;
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

var _Vue;

function install (Vue) {
  if (install.installed) { return }
  install.installed = true;

  _Vue = Vue;

  var isDef = function (v) { return v !== undefined; };

  var registerInstance = function (vm, callVal) {
    var i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate: function beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed: function destroyed () {
      registerInstance(this);
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this._routerRoot._router }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get: function get () { return this._routerRoot._route }
  });

  Vue.component('router-view', View);
  Vue.component('router-link', Link);

  var strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

/*  */

var inBrowser = typeof window !== 'undefined';

/*  */

function resolvePath (
  relative,
  base,
  append
) {
  var firstChar = relative.charAt(0);
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  var stack = base.split('/');

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '..') {
      stack.pop();
    } else if (segment !== '.') {
      stack.push(segment);
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }

  return stack.join('/')
}

function parsePath (path) {
  var hash = '';
  var query = '';

  var hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  var queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

var index$1 = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var index = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (index$1(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!index$1(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!index$1(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (index$1(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

index.parse = parse_1;
index.compile = compile_1;
index.tokensToFunction = tokensToFunction_1;
index.tokensToRegExp = tokensToRegExp_1;

/*  */

var regexpCompileCache = Object.create(null);

function fillParams (
  path,
  params,
  routeMsg
) {
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = index.compile(path));
    return filler(params || {}, { pretty: true })
  } catch (e) {
    if (true) {
      warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
    }
    return ''
  }
}

/*  */

function createRouteMap (
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap
) {
  // the path list is used to control path matching priority
  var pathList = oldPathList || [];
  var pathMap = oldPathMap || Object.create(null);
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathList, pathMap, nameMap, route);
  });

  // ensure wildcard routes are always at the end
  for (var i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l--;
      i--;
    }
  }

  return {
    pathList: pathList,
    pathMap: pathMap,
    nameMap: nameMap
  }
}

function addRouteRecord (
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  var path = route.path;
  var name = route.name;
  if (true) {
    assert(path != null, "\"path\" is required in a route configuration.");
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
      "string id. Use an actual component instead."
    );
  }

  var normalizedPath = normalizePath(path, parent);
  var pathToRegexpOptions = route.pathToRegexpOptions || {};

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  var record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  };

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (true) {
      if (route.name && !route.redirect && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
        warn(
          false,
          "Named Route '" + (route.name) + "' has a default child route. " +
          "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
          "the default child route will not be rendered. Remove the name from " +
          "this route and use the name of the default child route for named " +
          "links instead."
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs
        ? cleanPath((matchAs + "/" + (child.path)))
        : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (route.alias !== undefined) {
    var aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias];

    aliases.forEach(function (alias) {
      var aliasRoute = {
        path: alias,
        children: route.children
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      );
    });
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if ("development" !== 'production' && !matchAs) {
      warn(
        false,
        "Duplicate named routes definition: " +
        "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

function compileRouteRegex (path, pathToRegexpOptions) {
  var regex = index(path, [], pathToRegexpOptions);
  if (true) {
    var keys = {};
    regex.keys.forEach(function (key) {
      warn(!keys[key.name], ("Duplicate param keys in route with path: \"" + path + "\""));
      keys[key.name] = true;
    });
  }
  return regex
}

function normalizePath (path, parent) {
  path = path.replace(/\/$/, '');
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  return cleanPath(((parent.path) + "/" + path))
}

/*  */


function normalizeLocation (
  raw,
  current,
  append,
  router
) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next.name || next._normalized) {
    return next
  }

  // relative params
  if (!next.path && next.params && current) {
    next = assign({}, next);
    next._normalized = true;
    var params = assign(assign({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params;
    } else if (current.matched.length) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params, ("path " + (current.path)));
    } else if (true) {
      warn(false, "relative params navigation requires a current route.");
    }
    return next
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath;

  var query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  );

  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

function assign (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a
}

/*  */


function createMatcher (
  routes,
  router
) {
  var ref = createRouteMap(routes);
  var pathList = ref.pathList;
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap);
  }

  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    var location = normalizeLocation(raw, currentRoute, false, router);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      if (true) {
        warn(record, ("Route with name '" + name + "' does not exist"));
      }
      if (!record) { return _createRoute(null, location) }
      var paramNames = record.regex.keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {};
      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        var record$1 = pathMap[path];
        if (matchRoute(record$1.regex, location.path, location.params)) {
          return _createRoute(record$1, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location, null, router))
        : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      if (true) {
        warn(
          false, ("invalid redirect option: " + (JSON.stringify(redirect)))
        );
      }
      return _createRoute(null, location)
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      if (true) {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      if (true) {
        warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
      }
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match: match,
    addRoutes: addRoutes
  }
}

function matchRoute (
  regex,
  path,
  params
) {
  var m = path.match(regex);

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = regex.keys[i - 1];
    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
    if (key) {
      params[key.name] = val;
    }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */


var positionStore = Object.create(null);

function setupScroll () {
  window.addEventListener('popstate', function (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  });
}

function handleScroll (
  router,
  to,
  from,
  isPop
) {
  if (!router.app) {
    return
  }

  var behavior = router.options.scrollBehavior;
  if (!behavior) {
    return
  }

  if (true) {
    assert(typeof behavior === 'function', "scrollBehavior must be a function");
  }

  // wait until re-render finishes before scrolling
  router.app.$nextTick(function () {
    var position = getScrollPosition();
    var shouldScroll = behavior(to, from, isPop ? position : null);
    if (!shouldScroll) {
      return
    }
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      var el = document.querySelector(shouldScroll.selector);
      if (el) {
        var offset = shouldScroll.offset && typeof shouldScroll.offset === 'object' ? shouldScroll.offset : {};
        offset = normalizeOffset(offset);
        position = getElementPosition(el, offset);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }

    if (position) {
      window.scrollTo(position.x, position.y);
    }
  });
}

function saveScrollPosition () {
  var key = getStateKey();
  if (key) {
    positionStore[key] = {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
}

function getScrollPosition () {
  var key = getStateKey();
  if (key) {
    return positionStore[key]
  }
}

function getElementPosition (el, offset) {
  var docEl = document.documentElement;
  var docRect = docEl.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  return {
    x: elRect.left - docRect.left - offset.x,
    y: elRect.top - docRect.top - offset.y
  }
}

function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

function normalizeOffset (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : 0,
    y: isNumber(obj.y) ? obj.y : 0
  }
}

function isNumber (v) {
  return typeof v === 'number'
}

/*  */

var supportsPushState = inBrowser && (function () {
  var ua = window.navigator.userAgent;

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return window.history && 'pushState' in window.history
})();

// use User Timing api (if present) for more accurate key precision
var Time = inBrowser && window.performance && window.performance.now
  ? window.performance
  : Date;

var _key = genKey();

function genKey () {
  return Time.now().toFixed(3)
}

function getStateKey () {
  return _key
}

function setStateKey (key) {
  _key = key;
}

function pushState (url, replace) {
  saveScrollPosition();
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  var history = window.history;
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url);
    } else {
      _key = genKey();
      history.pushState({ key: _key }, '', url);
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

function replaceState (url) {
  pushState(url, true);
}

/*  */

function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}

/*  */

function resolveAsyncComponents (matched) {
  return function (to, from, next) {
    var hasAsync = false;
    var pending = 0;
    var error = null;

    flatMapComponents(matched, function (def, _, match, key) {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending++;

        var resolve = once(function (resolvedDef) {
          if (resolvedDef.__esModule && resolvedDef.default) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending--;
          if (pending <= 0) {
            next();
          }
        });

        var reject = once(function (reason) {
          var msg = "Failed to resolve async component " + key + ": " + reason;
          "development" !== 'production' && warn(false, msg);
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg);
            next(error);
          }
        });

        var res;
        try {
          res = def(resolve, reject);
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            var comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });

    if (!hasAsync) { next(); }
  }
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  var called = false;
  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (called) { return }
    called = true;
    return fn.apply(this, args)
  }
}

/*  */

var History = function History (router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START;
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
  this.readyErrorCbs = [];
  this.errorCbs = [];
};

History.prototype.listen = function listen (cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady (cb, errorCb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
    if (errorCb) {
      this.readyErrorCbs.push(errorCb);
    }
  }
};

History.prototype.onError = function onError (errorCb) {
  this.errorCbs.push(errorCb);
};

History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
    var this$1 = this;

  var route = this.router.match(location, this.current);
  this.confirmTransition(route, function () {
    this$1.updateRoute(route);
    onComplete && onComplete(route);
    this$1.ensureURL();

    // fire ready cbs once
    if (!this$1.ready) {
      this$1.ready = true;
      this$1.readyCbs.forEach(function (cb) { cb(route); });
    }
  }, function (err) {
    if (onAbort) {
      onAbort(err);
    }
    if (err && !this$1.ready) {
      this$1.ready = true;
      this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
    }
  });
};

History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
    var this$1 = this;

  var current = this.current;
  var abort = function (err) {
    if (isError(err)) {
      if (this$1.errorCbs.length) {
        this$1.errorCbs.forEach(function (cb) { cb(err); });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    route.matched.length === current.matched.length
  ) {
    this.ensureURL();
    return abort()
  }

  var ref = resolveQueue(this.current.matched, route.matched);
    var updated = ref.updated;
    var deactivated = ref.deactivated;
    var activated = ref.activated;

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated),
    // global before hooks
    this.router.beforeHooks,
    // in-component update hooks
    extractUpdateHooks(updated),
    // in-config enter guards
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    resolveAsyncComponents(activated)
  );

  this.pending = route;
  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort()
    }
    try {
      hook(route, current, function (to) {
        if (to === false || isError(to)) {
          // next(false) -> abort navigation, ensure current URL
          this$1.ensureURL(true);
          abort(to);
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' && (
            typeof to.path === 'string' ||
            typeof to.name === 'string'
          ))
        ) {
          // next('/') or next({ path: '/' }) -> redirect
          abort();
          if (typeof to === 'object' && to.replace) {
            this$1.replace(to);
          } else {
            this$1.push(to);
          }
        } else {
          // confirm transition and pass on the value
          next(to);
        }
      });
    } catch (e) {
      abort(e);
    }
  };

  runQueue(queue, iterator, function () {
    var postEnterCbs = [];
    var isValid = function () { return this$1.current === route; };
    // wait until async components are resolved before
    // extracting in-component enter guards
    var enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
    var queue = enterGuards.concat(this$1.router.resolveHooks);
    runQueue(queue, iterator, function () {
      if (this$1.pending !== route) {
        return abort()
      }
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          postEnterCbs.forEach(function (cb) { cb(); });
        });
      }
    });
  });
};

History.prototype.updateRoute = function updateRoute (route) {
  var prev = this.current;
  this.current = route;
  this.cb && this.cb(route);
  this.router.afterHooks.forEach(function (hook) {
    hook && hook(route, prev);
  });
};

function normalizeBase (base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      // strip full URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '')
}

function resolveQueue (
  current,
  next
) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

function extractGuards (
  records,
  name,
  bind,
  reverse
) {
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
        : bind(guard, instance, match, key)
    }
  });
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  return def.options[key]
}

function extractLeaveGuards (deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks (updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard (guard, instance) {
  if (instance) {
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}

function extractEnterGuards (
  activated,
  cbs,
  isValid
) {
  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
    return bindEnterGuard(guard, match, key, cbs, isValid)
  })
}

function bindEnterGuard (
  guard,
  match,
  key,
  cbs,
  isValid
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      next(cb);
      if (typeof cb === 'function') {
        cbs.push(function () {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid);
        });
      }
    })
  }
}

function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (instances[key]) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(function () {
      poll(cb, instances, key, isValid);
    }, 16);
  }
}

/*  */


var HTML5History = (function (History$$1) {
  function HTML5History (router, base) {
    var this$1 = this;

    History$$1.call(this, router, base);

    var expectScroll = router.options.scrollBehavior;

    if (expectScroll) {
      setupScroll();
    }

    window.addEventListener('popstate', function (e) {
      var current = this$1.current;
      this$1.transitionTo(getLocation(this$1.base), function (route) {
        if (expectScroll) {
          handleScroll(router, route, current, true);
        }
      });
    });
  }

  if ( History$$1 ) HTML5History.__proto__ = History$$1;
  HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.go = function go (n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.ensureURL = function ensureURL (push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
    return getLocation(this.base)
  };

  return HTML5History;
}(History));

function getLocation (base) {
  var path = window.location.pathname;
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length);
  }
  return (path || '/') + window.location.search + window.location.hash
}

/*  */


var HashHistory = (function (History$$1) {
  function HashHistory (router, base, fallback) {
    History$$1.call(this, router, base);
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash();
  }

  if ( History$$1 ) HashHistory.__proto__ = History$$1;
  HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  HashHistory.prototype.constructor = HashHistory;

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  HashHistory.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    window.addEventListener('hashchange', function () {
      if (!ensureSlash()) {
        return
      }
      this$1.transitionTo(getHash(), function (route) {
        replaceHash(route.fullPath);
      });
    });
  };

  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
    this.transitionTo(location, function (route) {
      pushHash(route.fullPath);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    this.transitionTo(location, function (route) {
      replaceHash(route.fullPath);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.go = function go (n) {
    window.history.go(n);
  };

  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath;
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current);
    }
  };

  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    return getHash()
  };

  return HashHistory;
}(History));

function checkFallback (base) {
  var location = getLocation(base);
  if (!/^\/#/.test(location)) {
    window.location.replace(
      cleanPath(base + '/#' + location)
    );
    return true
  }
}

function ensureSlash () {
  var path = getHash();
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path);
  return false
}

function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var index = href.indexOf('#');
  return index === -1 ? '' : href.slice(index + 1)
}

function pushHash (path) {
  window.location.hash = path;
}

function replaceHash (path) {
  var href = window.location.href;
  var i = href.indexOf('#');
  var base = i >= 0 ? href.slice(0, i) : href;
  window.location.replace((base + "#" + path));
}

/*  */


var AbstractHistory = (function (History$$1) {
  function AbstractHistory (router, base) {
    History$$1.call(this, router, base);
    this.stack = [];
    this.index = -1;
  }

  if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
  AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
      this$1.index++;
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex];
    this.confirmTransition(route, function () {
      this$1.index = targetIndex;
      this$1.updateRoute(route);
    });
  };

  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    var current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/'
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };

  return AbstractHistory;
}(History));

/*  */

var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || [], this);

  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (true) {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

var prototypeAccessors = { currentRoute: {} };

VueRouter.prototype.match = function match (
  raw,
  current,
  redirectedFrom
) {
  return this.matcher.match(raw, current, redirectedFrom)
};

prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

VueRouter.prototype.init = function init (app /* Vue component instance */) {
    var this$1 = this;

  "development" !== 'production' && assert(
    install.installed,
    "not installed. Make sure to call `Vue.use(VueRouter)` " +
    "before creating root instance."
  );

  this.apps.push(app);

  // main app already initialized.
  if (this.app) {
    return
  }

  this.app = app;

  var history = this.history;

  if (history instanceof HTML5History) {
    history.transitionTo(history.getCurrentLocation());
  } else if (history instanceof HashHistory) {
    var setupHashListener = function () {
      history.setupListeners();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    );
  }

  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};

VueRouter.prototype.beforeEach = function beforeEach (fn) {
  return registerHook(this.beforeHooks, fn)
};

VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
  return registerHook(this.resolveHooks, fn)
};

VueRouter.prototype.afterEach = function afterEach (fn) {
  return registerHook(this.afterHooks, fn)
};

VueRouter.prototype.onReady = function onReady (cb, errorCb) {
  this.history.onReady(cb, errorCb);
};

VueRouter.prototype.onError = function onError (errorCb) {
  this.history.onError(errorCb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
  this.history.push(location, onComplete, onAbort);
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
  this.history.replace(location, onComplete, onAbort);
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};

VueRouter.prototype.back = function back () {
  this.go(-1);
};

VueRouter.prototype.forward = function forward () {
  this.go(1);
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? to.matched
      ? to
      : this.resolve(to).route
    : this.currentRoute;
  if (!route) {
    return []
  }
  return [].concat.apply([], route.matched.map(function (m) {
    return Object.keys(m.components).map(function (key) {
      return m.components[key]
    })
  }))
};

VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  var location = normalizeLocation(
    to,
    current || this.history.current,
    append,
    this
  );
  var route = this.match(location, current);
  var fullPath = route.redirectedFrom || route.fullPath;
  var base = this.history.base;
  var href = createHref(base, fullPath, this.mode);
  return {
    location: location,
    route: route,
    href: href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
};

VueRouter.prototype.addRoutes = function addRoutes (routes) {
  this.matcher.addRoutes(routes);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

Object.defineProperties( VueRouter.prototype, prototypeAccessors );

function registerHook (list, fn) {
  list.push(fn);
  return function () {
    var i = list.indexOf(fn);
    if (i > -1) { list.splice(i, 1); }
  }
}

function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath;
  return base ? cleanPath(base + '/' + path) : path
}

VueRouter.install = install;
VueRouter.version = '2.7.0';

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}

/* harmony default export */ __webpack_exports__["a"] = (VueRouter);


/***/ }),

/***/ 356:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(304);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(13)("6f3a3c62", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-715bc427\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./App.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-715bc427\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/sass-loader/lib/loader.js!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=1!./App.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 357:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(305);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(13)("587d5314", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-715bc427\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-715bc427\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 358:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(306);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(13)("e336d284", content, false);
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-9bed1ee6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Sidebar.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"id\":\"data-v-9bed1ee6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Sidebar.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 359:
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),

/***/ 362:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(143);


/***/ }),

/***/ 6:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),

/***/ 7:
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*!
 * Vue.js v2.4.2
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
	 true ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Vue = factory());
}(this, (function () { 'use strict';

/*  */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

var _toString = Object.prototype.toString;

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(val);
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if a attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,is');

/**
 * Remove an item from an array
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
});

/**
 * Simple bind, faster than native
 */
function bind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/**
 * Return same value
 */
var identity = function (_) { return _; };

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
];

/*  */

var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

var emptyObject = Object.freeze({});

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

var warn = noop;
var tip = noop;
var formatComponentName = (null); // work around flow check

{
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) { return str
    .replace(classifyRE, function (c) { return c.toUpperCase(); })
    .replace(/[-_]/g, ''); };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn("[Vue tip]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>'
    }
    var name = typeof vm === 'string'
      ? vm
      : typeof vm === 'function' && vm.options
        ? vm.options.name
        : vm._isVue
          ? vm.$options.name || vm.$options._componentTag
          : vm.name;

    var file = vm._isVue && vm.$options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) { res += str; }
      if (n > 1) { str += str; }
      n >>= 1;
    }
    return res
  };

  var generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
            : formatComponentName(vm))); })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
}

/*  */

function handleError (err, vm, info) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, info);
  } else {
    {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if (inBrowser && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }
}

/*  */
/* globals MutationObserver */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefix has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function nextTickHandler () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        _resolve = resolve;
      })
    }
  }
})();

var _Set;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */


var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ("development" !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (hasOwn(target, key)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
{
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this) : parentVal
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      "development" !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn.call(this, parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal
    ? extend(res, childVal)
    : res
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (parentVal, childVal) {
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    var lower = key.toLowerCase();
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options) {
  var inject = options.inject;
  if (Array.isArray(inject)) {
    var normalized = options.inject = {};
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = inject[i];
    }
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child);
  normalizeInject(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ("development" !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */

function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (isType(Boolean, prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ("development" !== 'production' && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    valid = typeof value === expectedType.toLowerCase();
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isType (type, fn) {
  if (!Array.isArray(fn)) {
    return getType(fn) === getType(type)
  }
  for (var i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === getType(type)) {
      return true
    }
  }
  /* istanbul ignore next */
  return false
}

/*  */

var mark;
var measure;

{
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = function (tag) { return perf.mark(tag); };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      perf.clearMeasures(name);
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

{
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      "referenced during render. Make sure to declare reactive data " +
      "properties in the data option.",
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.functionalContext = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: {} };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.isCloned = true;
  return cloned
}

function cloneVNodes (vnodes) {
  var len = vnodes.length;
  var res = new Array(len);
  for (var i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i]);
  }
  return res
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments$1);
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  vm
) {
  var name, cur, old, event;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
      "development" !== 'production' && warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur);
      }
      add(event.name, cur, event.once, event.capture, event.passive);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      {
        var keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            "Prop \"" + keyInLowerCase + "\" is passed to component " +
            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
            " \"" + key + "\". " +
            "Note that HTML attributes are case-insensitive and camelCased " +
            "props need to use their kebab-case equivalents when using in-DOM " +
            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    last = res[res.length - 1];
    //  nested
    if (Array.isArray(c)) {
      res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        (last).text += String(c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[res.length - 1] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function ensureCtor (comp, base) {
  if (comp.__esModule && comp.default) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor,
  context
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (isDef(factory.contexts)) {
    // already pending
    factory.contexts.push(context);
  } else {
    var contexts = factory.contexts = [context];
    var sync = true;

    var forceRender = function () {
      for (var i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate();
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender();
      }
    });

    var reject = once(function (reason) {
      "development" !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender();
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (typeof res.then === 'function') {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isDef(res.component) && typeof res.component.then === 'function') {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            setTimeout(function () {
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender();
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(function () {
            if (isUndef(factory.resolved)) {
              reject(
                "timeout (" + (res.timeout) + "ms)"
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && isDef(c.componentOptions)) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn, once$$1) {
  if (once$$1) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var this$1 = this;

    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        this$1.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var this$1 = this;

    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        this$1.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args);
        } catch (e) {
          handleError(e, vm, ("event handler for \"" + event + "\""));
        }
      }
    }
    return vm
  };
}

/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  var slots = {};
  if (!children) {
    return slots
  }
  var defaultSlot = [];
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
      child.data && child.data.slot != null
    ) {
      var name = child.data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore whitespace
  if (!defaultSlot.every(isWhitespace)) {
    slots.default = defaultSlot;
  }
  return slots
}

function isWhitespace (node) {
  return node.isComment || node.text === ' '
}

function resolveScopedSlots (
  fns, // see flow/vnode
  res
) {
  res = res || {};
  for (var i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res);
    } else {
      res[fns[i].key] = fns[i].fn;
    }
  }
  return res
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
      // no need for the ref nodes after initial patch
      // this prevents keeping a detached DOM tree in memory (#5851)
      vm.$options._parentElm = vm.$options._refElm = null;
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if ("development" !== 'production' && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure((name + " render"), startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure((name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  vm._watcher = new Watcher(vm, updateComponent, noop);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  var hasChildren = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listensers hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data && parentVnode.data.attrs;
  vm.$listeners = listeners;

  // update props
  if (propsData && vm.$options.props) {
    observerState.shouldConvert = false;
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      props[key] = validateProp(key, vm.$options.props, propsData, vm);
    }
    observerState.shouldConvert = true;
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  if (listeners) {
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);
  }
  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm);
      } catch (e) {
        handleError(e, vm, (hook + " hook"));
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
}

/*  */


var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ("development" !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = expOrFn.toString();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set();
function traverse (val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function checkOptionType (vm, name) {
  var option = vm.$options[name];
  if (!isPlainObject(option)) {
    warn(
      ("component option \"" + name + "\" should be an object."),
      vm
    );
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  observerState.shouldConvert = isRoot;
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    {
      if (isReservedAttribute(key) || config.isReservedAttr(key)) {
        warn(
          ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(props, key, value, function () {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  observerState.shouldConvert = true;
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    "development" !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
      "development" !== 'production' && warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  try {
    return data.call(vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  "development" !== 'production' && checkOptionType(vm, 'computed');
  var watchers = vm._computedWatchers = Object.create(null);

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ("development" !== 'production' && getter == null) {
      warn(
        ("Getter is missing for computed property \"" + key + "\"."),
        vm
      );
    }
    // create internal watcher for the computed property.
    watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else {
      if (key in vm.$data) {
        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
      }
    }
  }
}

function defineComputed (target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop;
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop;
  }
  if ("development" !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function initMethods (vm, methods) {
  "development" !== 'production' && checkOptionType(vm, 'methods');
  var props = vm.$options.props;
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    {
      if (methods[key] == null) {
        warn(
          "method \"" + key + "\" has an undefined value in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
    }
  }
}

function initWatch (vm, watch) {
  "development" !== 'production' && checkOptionType(vm, 'watch');
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  keyOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(keyOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    observerState.shouldConvert = false;
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      {
        defineReactive$$1(vm, key, result[key], function () {
          warn(
            "Avoid mutating an injected value directly since the changes will be " +
            "overwritten whenever the provided component re-renders. " +
            "injection being mutated: \"" + key + "\"",
            vm
          );
        });
      }
    });
    observerState.shouldConvert = true;
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var provideKey = inject[key];
      var source = vm;
      while (source) {
        if (source._provided && provideKey in source._provided) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if ("development" !== 'production' && !source) {
        warn(("Injection \"" + key + "\" not found"), vm);
      }
    }
    return result
  }
}

/*  */

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {};
  var propOptions = Ctor.options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || {});
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var _context = Object.create(context);
  var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
  var vnode = Ctor.options.render.call(null, h, {
    data: data,
    props: props,
    children: children,
    parent: context,
    listeners: data.on || {},
    injections: resolveInject(Ctor.options.inject, context),
    slots: function () { return resolveSlots(children, context); }
  });
  if (vnode instanceof VNode) {
    vnode.functionalContext = context;
    vnode.functionalOptions = Ctor.options;
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot;
    }
  }
  return vnode
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

// hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (
    vnode,
    hydrating,
    parentElm,
    refElm
  ) {
    if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance,
        parentElm,
        refElm
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    } else if (vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );
  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent, // activeInstance in lifecycle state
  parentElm,
  refElm
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options)
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = componentVNodeHooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1 (one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d);
    two(a, b, c, d);
  }
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  if (isDef(on[event])) {
    on[event] = [data.model.callback].concat(on[event]);
  } else {
    on[event] = data.model.callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
    "development" !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if ("development" !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    warn(
      'Avoid using non-primitive value as key, ' +
      'use string/number value instead.',
      context
    );
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (isDef(vnode)) {
    if (ns) { applyNS(vnode, ns); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    return
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && isUndef(child.ns)) {
        applyNS(child, ns);
      }
    }
  }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    keys = Object.keys(val);
    ret = new Array(keys.length);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  }
  if (isDef(ret)) {
    (ret)._isVList = true;
  }
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      props = extend(extend({}, bindObject), props);
    }
    return scopedSlotFn(props) || fallback
  } else {
    var slotNodes = this.$slots[name];
    // warn duplicate slot usage
    if (slotNodes && "development" !== 'production') {
      slotNodes._rendered && warn(
        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
        "- this will likely cause render errors.",
        this
      );
      slotNodes._rendered = true;
    }
    return slotNodes || fallback
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

/**
 * Runtime helper for checking keyCodes from config.
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInAlias
) {
  var keyCodes = config.keyCodes[key] || builtInAlias;
  if (Array.isArray(keyCodes)) {
    return keyCodes.indexOf(eventKeyCode) === -1
  } else {
    return keyCodes !== eventKeyCode
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
      "development" !== 'production' && warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        if (!(key in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var tree = this._staticTrees[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree by doing a shallow clone.
  if (tree && !isInFor) {
    return Array.isArray(tree)
      ? cloneVNodes(tree)
      : cloneVNode(tree)
  }
  // otherwise, render a fresh tree.
  tree = this._staticTrees[index] =
    this.$options.staticRenderFns[index].call(this._renderProxy);
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      "development" !== 'production' && warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(ours, existing) : ours;
      }
    }
  }
  return data
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  var parentVnode = vm.$vnode = vm.$options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;
  /* istanbul ignore else */
  {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', vm.$options._parentListeners, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  }
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render function");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      {
        vnode = vm.$options.renderError
          ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          : vm._vnode;
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ("development" !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };

  // internal render helpers.
  // these are exposed on the instance prototype to reduce generated render
  // code size.
  Vue.prototype._o = markOnce;
  Vue.prototype._n = toNumber;
  Vue.prototype._s = toString;
  Vue.prototype._l = renderList;
  Vue.prototype._t = renderSlot;
  Vue.prototype._q = looseEqual;
  Vue.prototype._i = looseIndexOf;
  Vue.prototype._m = renderStatic;
  Vue.prototype._f = resolveFilter;
  Vue.prototype._k = checkKeyCodes;
  Vue.prototype._b = bindObjectProps;
  Vue.prototype._v = createTextVNode;
  Vue.prototype._e = createEmptyVNode;
  Vue.prototype._u = resolveScopedSlots;
  Vue.prototype._g = bindObjectListeners;
}

/*  */

var uid$1 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$1++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ("development" !== 'production' && config.performance && mark) {
      startTag = "vue-perf-init:" + (vm._uid);
      endTag = "vue-perf-end:" + (vm._uid);
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    {
      initProxy(vm);
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ("development" !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(((vm._name) + " init"), startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var extended = Ctor.extendOptions;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = dedupe(latest[key], extended[key], sealed[key]);
    }
  }
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    var res = [];
    sealed = Array.isArray(sealed) ? sealed : [sealed];
    extended = Array.isArray(extended) ? extended : [extended];
    for (var i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i]);
      }
    }
    return res
  } else {
    return latest
  }
}

function Vue$3 (options) {
  if ("development" !== 'production' &&
    !(this instanceof Vue$3)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue$3);
stateMixin(Vue$3);
eventsMixin(Vue$3);
lifecycleMixin(Vue$3);
renderMixin(Vue$3);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        );
      }
    }

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */

var patternTypes = [String, RegExp, Array];

function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (cache, current, filter) {
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        if (cachedNode !== current) {
          pruneCacheEntry(cachedNode);
        }
        cache[key] = null;
      }
    }
  }
}

function pruneCacheEntry (vnode) {
  if (vnode) {
    vnode.componentInstance.$destroy();
  }
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes
  },

  created: function created () {
    this.cache = Object.create(null);
  },

  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this$1.cache) {
      pruneCacheEntry(this$1.cache[key]);
    }
  },

  watch: {
    include: function include (val) {
      pruneCache(this.cache, this._vnode, function (name) { return matches(val, name); });
    },
    exclude: function exclude (val) {
      pruneCache(this.cache, this._vnode, function (name) { return !matches(val, name); });
    }
  },

  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (this.cache[key]) {
        vnode.componentInstance = this.cache[key].componentInstance;
      } else {
        this.cache[key] = vnode;
      }
      vnode.data.keepAlive = true;
    }
    return vnode
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue$3);

Object.defineProperty(Vue$3.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue$3.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

Vue$3.version = '2.4.2';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isPreTag = function (tag) { return tag === 'pre'; };

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
      "development" !== 'production' && warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val);
}


var nodeOps = Object.freeze({
	createElement: createElement$1,
	createElementNS: createElementNS,
	createTextNode: createTextNode,
	createComment: createComment,
	insertBefore: insertBefore,
	removeChild: removeChild,
	appendChild: appendChild,
	parentNode: parentNode,
	nextSibling: nextSibling,
	tagName: tagName,
	setTextContent: setTextContent,
	setAttribute: setAttribute
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

// Some browsers do not support dynamically changing type for <input>
// so they need to be treated as different nodes
function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  var inPre = 0;
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if ("development" !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (ref$$1.parentNode === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    var ancestor = vnode;
    while (ancestor) {
      if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
        nodeOps.setAttribute(vnode.elm, i, '');
      }
      ancestor = ancestor.parent;
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if ("development" !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
          }
          if (sameVnode(elmToMove, newStartVnode)) {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var bailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.elm = elm;
      vnode.isAsyncPlaceholder = true;
      return true
    }
    {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          var childrenMatch = true;
          var childNode = elm.firstChild;
          for (var i$1 = 0; i$1 < children.length; i$1++) {
            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
              childrenMatch = false;
              break
            }
            childNode = childNode.nextSibling;
          }
          // if childNode is not null, it means the actual childNodes list is
          // longer than the virtual children list.
          if (!childrenMatch || childNode) {
            if ("development" !== 'production' &&
              typeof console !== 'undefined' &&
              !bailed
            ) {
              bailed = true;
              console.warn('Parent: ', elm);
              console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        for (var key in data) {
          if (!isRenderedModule(key)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode) {
    if (isDef(vnode.tag)) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }
        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm$1 = nodeOps.parentNode(oldElm);
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm$1,
          nodeOps.nextSibling(oldElm)
        );

        if (isDef(vnode.parent)) {
          // component root element replaced.
          // update parent placeholder node element, recursively
          var ancestor = vnode.parent;
          while (ancestor) {
            ancestor.elm = vnode.elm;
            ancestor = ancestor.parent;
          }
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent);
            }
          }
        }

        if (isDef(parentElm$1)) {
          removeVnodes(parentElm$1, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  /* istanbul ignore if */
  if (isIE9 && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

var validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        var j = i - 1;
        var p = (void 0);
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break }
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return ("_f(\"" + name + "\")(" + exp + "," + args)
  }
}

/*  */

function baseWarn (msg) {
  console.error(("[Vue compiler]: " + msg));
}

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
    : []
}

function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name: name, value: value });
}

function addAttr (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  modifiers
) {
  (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn
) {
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
    "development" !== 'production' && warn &&
    modifiers && modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.'
    );
  }
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture;
    name = '!' + name; // mark the event as captured
  }
  if (modifiers && modifiers.once) {
    delete modifiers.once;
    name = '~' + name; // mark the event as once
  }
  /* istanbul ignore if */
  if (modifiers && modifiers.passive) {
    delete modifiers.passive;
    name = '&' + name; // mark the event as passive
  }
  var events;
  if (modifiers && modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }
  var newHandler = { value: value, modifiers: modifiers };
  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

function getAndRemoveAttr (el, name) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  return val
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;

  var baseValueExpression = '$$v';
  var valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }
  var assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: ("(" + value + ")"),
    expression: ("\"" + value + "\""),
    callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  var modelRs = parseModel(value);
  if (modelRs.idx === null) {
    return (value + "=" + assignment)
  } else {
    return ("$set(" + (modelRs.exp) + ", " + (modelRs.idx) + ", " + assignment + ")")
  }
}

/**
 * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
 *
 * for loop possible cases:
 *
 * - test
 * - test[idx]
 * - test[test1[idx]]
 * - test["a"][idx]
 * - xxx.test[a[a].test1[idx]]
 * - test.xxx.a["asa"][test1[idx]]
 *
 */

var len;
var str;
var chr;
var index$1;
var expressionPos;
var expressionEndPos;

function parseModel (val) {
  str = val;
  len = str.length;
  index$1 = expressionPos = expressionEndPos = 0;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    return {
      exp: val,
      idx: null
    }
  }

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.substring(0, expressionPos),
    idx: val.substring(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  var inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) { inBracket++; }
    if (chr === 0x5D) { inBracket--; }
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  var stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type;

  {
    var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (tag === 'input' && dynamicType) {
      warn$1(
        "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
        "v-model does not support dynamic input types. Use v-if branches instead."
      );
    }
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
        "File inputs are read only. Use a v-on:change listener instead."
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else {
    warn$1(
      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
      "v-model is not supported on this element type. " +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.'
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
  );
  addHandler(el, CHECKBOX_RADIO_TOKEN,
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
          '$$i=_i($$a,$$v);' +
      "if($$el.checked){$$i<0&&(" + value + "=$$a.concat($$v))}" +
      "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
    "}else{" + (genAssignmentCode(value, '$$c')) + "}",
    null, true
  );
}

function genRadioModel (
    el,
    value,
    modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
  addHandler(el, CHECKBOX_RADIO_TOKEN, genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
    el,
    value,
    modifiers
) {
  var number = modifiers && modifiers.number;
  var selectedVal = "Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
    "return " + (number ? '_n(val)' : 'val') + "})";

  var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  var code = "var $$selectedVal = " + selectedVal + ";";
  code = code + " " + (genAssignmentCode(value, assignment));
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  var type = el.attrsMap.type;
  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var needCompositionGuard = !lazy && type !== 'range';
  var event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  var valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = "$event.target.value.trim()";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  addProp(el, 'value', ("(" + value + ")"));
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  var event;
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    // Chrome fires microtasks in between click/change, leads to #4521
    event = isChrome ? 'click' : 'change';
    on[event] = [].concat(on[CHECKBOX_RADIO_TOKEN], on[event] || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function add$1 (
  event,
  handler,
  once$$1,
  capture,
  passive
) {
  if (once$$1) {
    var oldHandler = handler;
    var _target = target$1; // save current target element in closure
    handler = function (ev) {
      var res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, handler, capture, _target);
      }
    };
  }
  target$1.addEventListener(
    event,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  event,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(event, handler, capture);
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, vnode.context);
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (isUndef(props[key])) {
      elm[key] = '';
    }
  }
  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
    }

    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, vnode, strCur)) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (
  elm,
  vnode,
  checkVal
) {
  return (!elm.composing && (
    vnode.tag === 'option' ||
    isDirty(elm, checkVal) ||
    isInputChanged(elm, checkVal)
  ))
}

function isDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isInputChanged (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers) && modifiers.number) {
    return toNumber(value) !== toNumber(newVal)
  }
  if (isDef(modifiers) && modifiers.trim) {
    return value.trim() !== newVal.trim()
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likley wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser && window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : setTimeout;

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ("development" !== 'production' && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      addTransitionClass(el, toClass);
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        if (isValidDuration(explicitEnterDuration)) {
          setTimeout(cb, explicitEnterDuration);
        } else {
          whenTransitionEnds(el, type, cb);
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        addTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          if (isValidDuration(explicitLeaveDuration)) {
            setTimeout(cb, explicitLeaveDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var model$1 = {
  inserted: function inserted (el, binding, vnode) {
    if (vnode.tag === 'select') {
      var cb = function () {
        setSelected(el, binding, vnode.context);
      };
      cb();
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
        }
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        trigger(el, 'change');
      }
    }
  }
};

function setSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    "development" !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: model$1,
  show: show
};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$options._renderChildren;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ("development" !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if ("development" !== 'production' &&
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild && (oldChild.data.transition = extend({}, data));
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final desired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else {
          var opts = c.componentOptions;
          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    var body = document.body;
    var f = body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue$3.config.mustUseProp = mustUseProp;
Vue$3.config.isReservedTag = isReservedTag;
Vue$3.config.isReservedAttr = isReservedAttr;
Vue$3.config.getTagNamespace = getTagNamespace;
Vue$3.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue$3.options.directives, platformDirectives);
extend(Vue$3.options.components, platformComponents);

// install platform patch function
Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue$3);
    } else if ("development" !== 'production' && isChrome) {
      console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
    }
  }
  if ("development" !== 'production' &&
    config.productionTip !== false &&
    inBrowser && typeof console !== 'undefined'
  ) {
    console[console.info ? 'info' : 'log'](
      "You are running Vue in development mode.\n" +
      "Make sure to turn on production mode when deploying for production.\n" +
      "See more tips at https://vuejs.org/guide/deployment.html"
    );
  }
}, 0);

/*  */

// check whether current browser encodes a char inside attribute values
function shouldDecode (content, encoded) {
  var div = document.createElement('div');
  div.innerHTML = "<div a=\"" + content + "\"/>";
  return div.innerHTML.indexOf(encoded) > 0
}

// #3663
// IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

/*  */

var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

var buildRegex = cached(function (delimiters) {
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});

function parseText (
  text,
  delimiters
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return tokens.join('+')
}

/*  */

function transformNode (el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');
  if ("development" !== 'production' && staticClass) {
    var expression = parseText(staticClass, options.delimiters);
    if (expression) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  var data = '';
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ",";
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ",";
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData
};

/*  */

function transformNode$1 (el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    {
      var expression = parseText(staticStyle, options.delimiters);
      if (expression) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.'
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  var data = '';
  if (el.staticStyle) {
    data += "staticStyle:" + (el.staticStyle) + ",";
  }
  if (el.styleBinding) {
    data += "style:(" + (el.styleBinding) + "),";
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

var modules$1 = [
  klass$1,
  style$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
  }
}

var directives$1 = {
  model: model,
  text: text,
  html: html
};

/*  */

var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/*  */

var baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag: isPreTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

var decoder;

var he = {
  decode: function decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
var singleAttrIdentifier = /([^\s"'<>/=]+)/;
var singleAttrAssign = /(?:=)/;
var singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
];
var attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
);

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
var startTagOpen = new RegExp('^<' + qnameCapture);
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
var doctype = /^<!DOCTYPE [^>]+>/i;
var comment = /^<!--/;
var conditionalComment = /^<!\[/;

var IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === '';
});

// Special Elements (can contain anything)
var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};

var decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n'
};
var encodedAttr = /&(?:lt|gt|quot|amp);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

// #5992
var isIgnoreNewlineTag = makeMap('pre,textarea', true);
var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

function decodeAttr (value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, function (match) { return decodingMap[match]; })
}

function parseHTML (html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd));
            }
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1);
          }
          continue
        }
      }

      var text = (void 0), rest = (void 0), next = (void 0);
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) { break }
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
        advance(textEnd);
      }

      if (textEnd < 0) {
        text = html;
        html = '';
      }

      if (options.chars && text) {
        options.chars(text);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ("development" !== 'production' && !stack.length && options.warn) {
        options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3]; }
        if (args[4] === '') { delete args[4]; }
        if (args[5] === '') { delete args[5]; }
      }
      var value = args[3] || args[4] || args[5] || '';
      attrs[i] = {
        name: args[1],
        value: decodeAttr(
          value,
          options.shouldDecodeNewlines
        )
      };
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    var pos, lowerCasedTagName;
    if (start == null) { start = index; }
    if (end == null) { end = index; }

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
    }

    // Find the closest opened tag of the same type
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if ("development" !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

var onRE = /^@|^v-on:/;
var dirRE = /^v-|^@|^:/;
var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

var argRE = /:(.*)$/;
var bindRE = /^:|^v-bind:/;
var modifierRE = /\.[^.]+/g;

var decodeHTMLCached = cached(he.decode);

// configurable state
var warn$2;
var delimiters;
var transforms;
var preTransforms;
var postTransforms;
var platformIsPreTag;
var platformMustUseProp;
var platformGetTagNamespace;

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce (msg) {
    if (!warned) {
      warned = true;
      warn$2(msg);
    }
  }

  function endPre (element) {
    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
  }

  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldKeepComment: options.comments,
    start: function start (tag, attrs, unary) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      };
      if (ns) {
        element.ns = ns;
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
        "development" !== 'production' && warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">" + ', as they will not be parsed.'
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        preTransforms[i](element, options);
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else {
        processFor(element);
        processIf(element);
        processOnce(element);
        processKey(element);

        // determine whether this is a plain element after
        // removing structural attributes
        element.plain = !element.key && !attrs.length;

        processRef(element);
        processSlot(element);
        processComponent(element);
        for (var i$1 = 0; i$1 < transforms.length; i$1++) {
          transforms[i$1](element, options);
        }
        processAttrs(element);
      }

      function checkRootConstraints (el) {
        {
          if (el.tag === 'slot' || el.tag === 'template') {
            warnOnce(
              "Cannot use <" + (el.tag) + "> as component root element because it may " +
              'contain multiple nodes.'
            );
          }
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warnOnce(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements.'
            );
          }
        }
      }

      // tree management
      if (!root) {
        root = element;
        checkRootConstraints(root);
      } else if (!stack.length) {
        // allow root elements with v-if, v-else-if and v-else
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element);
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else {
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead."
          );
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else if (element.slotScope) { // scoped slot
          currentParent.plain = false;
          var name = element.slotTarget || '"default"';(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        } else {
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }
      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        endPre(element);
      }
      // apply post-transforms
      for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
        postTransforms[i$2](element, options);
      }
    },

    end: function end () {
      // remove trailing whitespace
      var element = stack[stack.length - 1];
      var lastNode = element.children[element.children.length - 1];
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
        element.children.pop();
      }
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      endPre(element);
    },

    chars: function chars (text) {
      if (!currentParent) {
        {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.'
            );
          } else if ((text = text.trim())) {
            warnOnce(
              ("text \"" + text + "\" outside root element will be ignored.")
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      var children = currentParent.children;
      text = inPre || text.trim()
        ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : preserveWhitespace && children.length ? ' ' : '';
      if (text) {
        var expression;
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          children.push({
            type: 2,
            expression: expression,
            text: text
          });
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          children.push({
            type: 3,
            text: text
          });
        }
      }
    },
    comment: function comment (text) {
      currentParent.children.push({
        type: 3,
        text: text,
        isComment: true
      });
    }
  });
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  var l = el.attrsList.length;
  if (l) {
    var attrs = el.attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      };
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processKey (el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    if ("development" !== 'production' && el.tag === 'template') {
      warn$2("<template> cannot be keyed. Place the key on real elements instead.");
    }
    el.key = exp;
  }
}

function processRef (el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  var exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var inMatch = exp.match(forAliasRE);
    if (!inMatch) {
      "development" !== 'production' && warn$2(
        ("Invalid v-for expression: " + exp)
      );
      return
    }
    el.for = inMatch[2].trim();
    var alias = inMatch[1].trim();
    var iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim();
      el.iterator1 = iteratorMatch[2].trim();
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim();
      }
    } else {
      el.alias = alias;
    }
  }
}

function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else {
    warn$2(
      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
      "used on element <" + (el.tag) + "> without corresponding v-if."
    );
  }
}

function findPrevElement (children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ("development" !== 'production' && children[i].text !== ' ') {
        warn$2(
          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
          "will be ignored."
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  var once$$1 = getAndRemoveAttr(el, 'v-once');
  if (once$$1 != null) {
    el.once = true;
  }
}

function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ("development" !== 'production' && el.key) {
      warn$2(
        "`key` does not work on <slot> because slots are abstract outlets " +
        "and can possibly expand into multiple elements. " +
        "Use the key on a wrapping element instead."
      );
    }
  } else {
    var slotTarget = getBindingAttr(el, 'slot');
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    }
    if (el.tag === 'template') {
      el.slotScope = getAndRemoveAttr(el, 'scope');
    }
  }
}

function processComponent (el) {
  var binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, isProp;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name);
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isProp = false;
        if (modifiers) {
          if (modifiers.prop) {
            isProp = true;
            name = camelize(name);
            if (name === 'innerHtml') { name = 'innerHTML'; }
          }
          if (modifiers.camel) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            addHandler(
              el,
              ("update:" + (camelize(name))),
              genAssignmentCode(value, "$event")
            );
          }
        }
        if (isProp || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value);
        } else {
          addAttr(el, name, value);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        addHandler(el, name, value, modifiers, false, warn$2);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
        }
        addDirective(el, name, rawName, value, arg, modifiers);
        if ("development" !== 'production' && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      {
        var expression = parseText(value, delimiters);
        if (expression) {
          warn$2(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          );
        }
      }
      addAttr(el, name, JSON.stringify(value));
    }
  }
}

function checkInFor (el) {
  var parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  var match = name.match(modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    if (
      "development" !== 'production' &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  var res = [];
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  var _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "You are binding v-model directly to a v-for iteration alias. " +
        "This will not be able to modify the v-for source array because " +
        "writing to the alias is like modifying a function local variable. " +
        "Consider using an array of objects and use v-model on an object property instead."
      );
    }
    _el = _el.parent;
  }
}

/*  */

var isStaticKey;
var isPlatformReservedTag;

var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) {
  if (!root) { return }
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard("$event.target !== $event.currentTarget"),
  ctrl: genGuard("!$event.ctrlKey"),
  shift: genGuard("!$event.shiftKey"),
  alt: genGuard("!$event.altKey"),
  meta: genGuard("!$event.metaKey"),
  left: genGuard("'button' in $event && $event.button !== 0"),
  middle: genGuard("'button' in $event && $event.button !== 1"),
  right: genGuard("'button' in $event && $event.button !== 2")
};

function genHandlers (
  events,
  isNative,
  warn
) {
  var res = isNative ? 'nativeOn:{' : 'on:{';
  for (var name in events) {
    var handler = events[name];
    // #5330: warn click.right, since right clicks do not actually fire click events.
    if ("development" !== 'production' &&
      name === 'click' &&
      handler && handler.modifiers && handler.modifiers.right
    ) {
      warn(
        "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
        "do not actually fire \"click\" events."
      );
    }
    res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
  }
  return res.slice(0, -1) + '}'
}

function genHandler (
  name,
  handler
) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);

  if (!handler.modifiers) {
    return isMethodPath || isFunctionExpression
      ? handler.value
      : ("function($event){" + (handler.value) + "}") // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    var handlerCode = isMethodPath
      ? handler.value + '($event)'
      : isFunctionExpression
        ? ("(" + (handler.value) + ")($event)")
        : handler.value;
    return ("function($event){" + code + handlerCode + "}")
  }
}

function genKeyFilter (keys) {
  return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
}

function genFilterCode (key) {
  var keyVal = parseInt(key, 10);
  if (keyVal) {
    return ("$event.keyCode!==" + keyVal)
  }
  var alias = keyCodes[key];
  return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
}

/*  */

function on (el, dir) {
  if ("development" !== 'production' && dir.modifiers) {
    warn("v-on without argument does not support modifiers.");
  }
  el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = function (code) {
    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
  };
}

/*  */

var baseDirectives = {
  on: on,
  bind: bind$1,
  cloak: noop
};

/*  */

var CodegenState = function CodegenState (options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;
  this.maybeComponent = function (el) { return !isReservedTag(el.tag); };
  this.onceId = 0;
  this.staticRenderFns = [];
};



function generate (
  ast,
  options
) {
  var state = new CodegenState(options);
  var code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data = el.plain ? undefined : genData$2(el, state);

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  el.staticProcessed = true;
  state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
  return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
      "development" !== 'production' && state.warn(
        "v-once can only be used inside v-for that is keyed. "
      );
      return genElement(el, state)
    }
    return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + (key ? ("," + key) : "") + ")")
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  var condition = conditions.shift();
  if (condition.exp) {
    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
  } else {
    return ("" + (genTernaryExp(condition.block)))
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

  if ("development" !== 'production' &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
      "v-for should have explicit keys. " +
      "See https://vuejs.org/guide/list.html#key for more info.",
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return (altHelper || '_l') + "((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + ((altGen || genElement)(el, state)) +
    '})'
}

function genData$2 (el, state) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el, state);
  if (dirs) { data += dirs + ','; }

  // key
  if (el.key) {
    data += "key:" + (el.key) + ",";
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ",";
  }
  if (el.refInFor) {
    data += "refInFor:true,";
  }
  // pre
  if (el.pre) {
    data += "pre:true,";
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\",";
  }
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += "attrs:{" + (genProps(el.attrs)) + "},";
  }
  // DOM props
  if (el.props) {
    data += "domProps:{" + (genProps(el.props)) + "},";
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events, false, state.warn)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
  }
  // slot target
  if (el.slotTarget) {
    data += "slot:" + (el.slotTarget) + ",";
  }
  // scoped slots
  if (el.scopedSlots) {
    data += (genScopedSlots(el.scopedSlots, state)) + ",";
  }
  // component v-model
  if (el.model) {
    data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  var ast = el.children[0];
  if ("development" !== 'production' && (
    el.children.length > 1 || ast.type !== 1
  )) {
    state.warn('Inline-template components must have exactly one child element.');
  }
  if (ast.type === 1) {
    var inlineRenderFns = generate(ast, state.options);
    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
  }
}

function genScopedSlots (
  slots,
  state
) {
  return ("scopedSlots:_u([" + (Object.keys(slots).map(function (key) {
      return genScopedSlot(key, slots[key], state)
    }).join(',')) + "])")
}

function genScopedSlot (
  key,
  el,
  state
) {
  if (el.for && !el.forProcessed) {
    return genForScopedSlot(key, el, state)
  }
  return "{key:" + key + ",fn:function(" + (String(el.attrsMap.scope)) + "){" +
    "return " + (el.tag === 'template'
      ? genChildren(el, state) || 'void 0'
      : genElement(el, state)) + "}}"
}

function genForScopedSlot (
  key,
  el,
  state
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
  el.forProcessed = true; // avoid recursion
  return "_l((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + (genScopedSlot(key, el, state)) +
    '})'
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el$1.for &&
      el$1.tag !== 'template' &&
      el$1.tag !== 'slot'
    ) {
      return (altGenElement || genElement)(el$1, state)
    }
    var normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    var gen = altGenNode || genNode;
    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

function genComment (comment) {
  return ("_e(" + (JSON.stringify(comment.text)) + ")")
}

function genSlot (el, state) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el, state);
  var res = "_t(" + slotName + (children ? ("," + children) : '');
  var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
  var bind$$1 = el.attrsMap['v-bind'];
  if ((attrs || bind$$1) && !children) {
    res += ",null";
  }
  if (attrs) {
    res += "," + attrs;
  }
  if (bind$$1) {
    res += (attrs ? '' : ',null') + "," + bind$$1;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
}

function genProps (props) {
  var res = '';
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
  }
  return res.slice(0, -1)
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
var unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// check valid identifier for v-for
var identRE = /[A-Za-z_$][\w$]*/;

// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast) {
  var errors = [];
  if (ast) {
    checkNode(ast, errors);
  }
  return errors
}

function checkNode (node, errors) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];
        if (value) {
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), errors);
          } else if (onRE.test(name)) {
            checkEvent(value, (name + "=\"" + value + "\""), errors);
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), errors);
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], errors);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, errors);
  }
}

function checkEvent (exp, text, errors) {
  var stipped = exp.replace(stripStringRE, '');
  var keywordMatch = stipped.match(unaryOperatorsRE);
  if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
    errors.push(
      "avoid using JavaScript unary operator as property name: " +
      "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
    );
  }
  checkExpression(exp, text, errors);
}

function checkFor (node, text, errors) {
  checkExpression(node.for || '', text, errors);
  checkIdentifier(node.alias, 'v-for alias', text, errors);
  checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
  checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
}

function checkIdentifier (ident, type, text, errors) {
  if (typeof ident === 'string' && !identRE.test(ident)) {
    errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
  }
}

function checkExpression (exp, text, errors) {
  try {
    new Function(("return " + exp));
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      errors.push(
        "avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
      );
    } else {
      errors.push(("invalid expression: " + (text.trim())));
    }
  }
}

/*  */

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  var cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = options || {};

    /* istanbul ignore if */
    {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    var key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    {
      if (compiled.errors && compiled.errors.length) {
        warn(
          "Error compiling template:\n\n" + template + "\n\n" +
          compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
          vm
        );
      }
      if (compiled.tips && compiled.tips.length) {
        compiled.tips.forEach(function (msg) { return tip(msg, vm); });
      }
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          "Failed to generate render function:\n\n" +
          fnGenErrors.map(function (ref) {
            var err = ref.err;
            var code = ref.code;

            return ((err.toString()) + " in\n\n" + code + "\n");
        }).join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];
      finalOptions.warn = function (msg, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives),
            options.directives
          );
        }
        // copy other options
        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      var compiled = baseCompile(template, finalOptions);
      {
        errors.push.apply(errors, detectErrors(compiled.ast));
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  var ast = parse(template.trim(), options);
  optimize(ast, options);
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

var ref$1 = createCompiler(baseOptions);
var compileToFunctions = ref$1.compileToFunctions;

/*  */

var idToTemplate = cached(function (id) {
  var el = query(id);
  return el && el.innerHTML
});

var mount = Vue$3.prototype.$mount;
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    "development" !== 'production' && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ("development" !== 'production' && !template) {
            warn(
              ("Template element not found or is empty: " + (options.template)),
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        mark('compile');
      }

      var ref = compileToFunctions(template, {
        shouldDecodeNewlines: shouldDecodeNewlines,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        mark('compile end');
        measure(((this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue$3.compile = compileToFunctions;

return Vue$3;

})));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ })

/******/ });