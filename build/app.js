export default function(global, globalThis, window, $app_exports$, $app_evaluate$) {
    var org_app_require = $app_require$;
    (function(global, globalThis, window, $app_exports$, $app_evaluate$) {
        var setTimeout = global.setTimeout;
        var setInterval = global.setInterval;
        var clearTimeout = global.clearTimeout;
        var clearInterval = global.clearInterval;
        var $app_require$1 = global.$app_require$ || org_app_require;
        var createAppHandler = function() {
            return (()=>{
                var __webpack_modules__ = {
                    "./src/manifest.json" (module) {
                        "use strict";
                        module.exports = JSON.parse('{"package":"com.openvela.contest.velaguard","name":"VelaGuard","versionName":"1.0.0","versionCode":1,"minPlatformVersion":1000,"icon":"/common/logo.png","deviceTypeList":["watch"],"features":[{"name":"system.router"},{"name":"system.storage"},{"name":"system.network"},{"name":"system.vibrator"},{"name":"system.sensor"}],"config":{"logLevel":"log","designWidth":"device-width"},"router":{"entry":"pages/cover","pages":{"pages/cover":{"component":"cover"},"pages/home":{"component":"home"},"pages/scenarios":{"component":"scenarios"},"pages/alert":{"component":"alert"},"pages/history":{"component":"history"},"pages/all-events":{"component":"all-events"},"pages/event-detail":{"component":"event-detail"},"pages/contacts":{"component":"contacts"},"pages/settings":{"component":"settings"}}}}');
                    }
                };
                var __webpack_module_cache__ = {};
                function __webpack_require__(moduleId) {
                    var cachedModule = __webpack_module_cache__[moduleId];
                    if (void 0 !== cachedModule) return cachedModule.exports;
                    var module = __webpack_module_cache__[moduleId] = {
                        exports: {}
                    };
                    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
                    return module.exports;
                }
                (()=>{
                    __webpack_require__.g = (()=>{
                        if ('object' == typeof globalThis) return globalThis;
                        try {
                            return this || new Function('return this')();
                        } catch (e) {
                            if ('object' == typeof window) return window;
                        }
                    })();
                })();
                (()=>{
                    __webpack_require__.rv = ()=>"1.7.12";
                })();
                (()=>{
                    __webpack_require__.ruid = "bundler=rspack@1.7.12";
                })();
                (()=>{
                    var $app_style$ = [];
                    var $app_script$ = function __scriptModule__(module, exports, $app_require$1) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.default = void 0;
                        var _default = exports.default = {
                            data: {
                                currentAlert: null,
                                currentEvent: null
                            },
                            onCreate () {
                                console.log("VelaGuard application created");
                            },
                            onDestroy () {
                                console.log("VelaGuard application destroyed");
                            },
                            setCurrentAlert (alert) {
                                this.data.currentAlert = alert;
                            },
                            getCurrentAlert () {
                                return this.data.currentAlert;
                            },
                            clearCurrentAlert () {
                                this.data.currentAlert = null;
                            },
                            setCurrentEvent (event) {
                                this.data.currentEvent = event;
                            },
                            getCurrentEvent () {
                                return this.data.currentEvent;
                            },
                            clearCurrentEvent () {
                                this.data.currentEvent = null;
                            }
                        };
                    };
                    $app_script$({}, $app_exports$, $app_require$1);
                    $app_exports$.default.style = $app_style$;
                    $app_exports$.default.manifest = __webpack_require__("./src/manifest.json");
                    var $translateStyle$ = function(value) {
                        if ('string' == typeof value) return Object.fromEntries(value.split(';').filter((item)=>Boolean(item && item.trim())).map((item)=>{
                            const matchs = item.match(/([^:]+):(.*)/);
                            if (matchs && matchs.length > 2) return [
                                matchs[1].trim().replace(/-([a-z])/g, (_, match)=>match.toUpperCase()),
                                matchs[2].trim()
                            ];
                            return [];
                        }));
                        return value;
                    };
                    __webpack_require__.g.$translateStyle$ = $translateStyle$;
                })();
            })();
        };
        return createAppHandler();
    })(global, globalThis, window, $app_exports$, $app_evaluate$);
}
