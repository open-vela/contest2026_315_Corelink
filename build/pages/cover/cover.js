export default function(global, globalThis, window, $app_exports$, $app_evaluate$) {
    var org_app_require = $app_require$;
    (function(global, globalThis, window, $app_exports$, $app_evaluate$) {
        var setTimeout = global.setTimeout;
        var setInterval = global.setInterval;
        var clearTimeout = global.clearTimeout;
        var clearInterval = global.clearInterval;
        var $app_require$1 = global.$app_require$ || org_app_require;
        var createPageHandler = function() {
            return (()=>{
                var __webpack_modules__ = {};
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
                    __webpack_require__.rv = ()=>"1.7.12";
                })();
                (()=>{
                    __webpack_require__.ruid = "bundler=rspack@1.7.12";
                })();
                var $app_style$ = [
                    [
                        [
                            [
                                0,
                                "page"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#031511"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "wallpaper"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "100%",
                            top: "-115px",
                            objectFit: "cover"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "veil"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 13, 10, 0.28)"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "overlay"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "100%",
                            paddingTop: "27px",
                            paddingRight: "30px",
                            paddingBottom: "25px",
                            paddingLeft: "30px",
                            flexDirection: "column"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "top-row"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "28px",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "date-text"
                            ]
                        ],
                        {
                            color: "#d9fff2",
                            fontSize: "13px",
                            fontWeight: "bold"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "location-chip"
                            ]
                        ],
                        {
                            height: "27px",
                            paddingLeft: "9px",
                            paddingRight: "10px",
                            borderRadius: "14px",
                            backgroundColor: "rgba(5, 40, 32, 0.86)",
                            alignItems: "center"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "location-dot"
                            ]
                        ],
                        {
                            color: "#65efbe",
                            fontSize: "8px",
                            marginRight: "5px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "location-text"
                            ]
                        ],
                        {
                            color: "#dcfff3",
                            fontSize: "10px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "time-block"
                            ]
                        ],
                        {
                            width: "100%",
                            marginTop: "8px",
                            flexDirection: "column"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "time-text"
                            ]
                        ],
                        {
                            width: "100%",
                            color: "#ffffff",
                            fontSize: "55px",
                            fontWeight: "bold",
                            letterSpacing: "1px",
                            textShadow: "0 3px 10px #001a14"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weekday-text"
                            ]
                        ],
                        {
                            color: "#7ff0c5",
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginTop: "-3px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "brand-space"
                            ]
                        ],
                        {
                            width: "100%",
                            flex: 1
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weather-card"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "73px",
                            paddingTop: "12px",
                            paddingRight: "15px",
                            paddingBottom: "12px",
                            paddingLeft: "15px",
                            borderRadius: "22px",
                            backgroundColor: "rgba(3, 31, 25, 0.88)",
                            alignItems: "center"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weather-main"
                            ]
                        ],
                        {
                            flex: 1,
                            flexDirection: "column"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weather-label"
                            ]
                        ],
                        {
                            color: "#76a99a",
                            fontSize: "9px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weather-text"
                            ]
                        ],
                        {
                            color: "#ffffff",
                            fontSize: "22px",
                            fontWeight: "bold",
                            marginTop: "1px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "weather-divider"
                            ]
                        ],
                        {
                            width: "1px",
                            height: "39px",
                            marginLeft: "13px",
                            marginRight: "14px",
                            backgroundColor: "#285247"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "temperature-block"
                            ]
                        ],
                        {
                            alignItems: "flex-end",
                            flexDirection: "column"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "temperature"
                            ]
                        ],
                        {
                            color: "#7ff1c6",
                            fontSize: "24px",
                            fontWeight: "bold"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "temperature-note"
                            ]
                        ],
                        {
                            color: "#78a99a",
                            fontSize: "9px"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "enter-pill"
                            ]
                        ],
                        {
                            width: "100%",
                            height: "38px",
                            marginTop: "10px",
                            paddingLeft: "14px",
                            paddingRight: "13px",
                            borderRadius: "19px",
                            backgroundColor: "rgba(4, 27, 22, 0.9)",
                            alignItems: "center"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "enter-dot"
                            ]
                        ],
                        {
                            width: "7px",
                            height: "7px",
                            marginRight: "8px",
                            borderRadius: "4px",
                            backgroundColor: "#64e9b8"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "enter-text"
                            ]
                        ],
                        {
                            flex: 1,
                            color: "#e8fff7",
                            fontSize: "12px",
                            fontWeight: "bold"
                        }
                    ],
                    [
                        [
                            [
                                0,
                                "enter-arrow"
                            ]
                        ],
                        {
                            color: "#73e7bd",
                            fontSize: "23px"
                        }
                    ]
                ];
                var $app_script$ = function __scriptModule__(module, exports, $app_require$1) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: true
                    });
                    exports.default = void 0;
                    var _system = _interopRequireDefault($app_require$1("@app-module/system.router"));
                    function _interopRequireDefault(e) {
                        return e && e.__esModule ? e : {
                            default: e
                        };
                    }
                    const WEEKDAYS = [
                        "星期日",
                        "星期一",
                        "星期二",
                        "星期三",
                        "星期四",
                        "星期五",
                        "星期六"
                    ];
                    function pad(value) {
                        return value < 10 ? "0" + value : String(value);
                    }
                    var _default = exports.default = {
                        private: {
                            timeText: "--:--",
                            dateText: "--月--日",
                            weekdayText: "--",
                            weatherText: "晴",
                            temperatureText: "24°C",
                            locationText: "校园东区"
                        },
                        onInit () {
                            this.clockTimer = null;
                        },
                        onShow () {
                            const page = this;
                            this.stopClock();
                            this.updateClock();
                            this.clockTimer = setInterval(function() {
                                page.updateClock();
                            }, 1000);
                        },
                        onHide () {
                            this.stopClock();
                        },
                        onDestroy () {
                            this.stopClock();
                        },
                        updateClock () {
                            const now = new Date();
                            this.timeText = pad(now.getHours()) + ":" + pad(now.getMinutes());
                            this.dateText = pad(now.getMonth() + 1) + "月" + pad(now.getDate()) + "日";
                            this.weekdayText = WEEKDAYS[now.getDay()];
                        },
                        stopClock () {
                            if (this.clockTimer) {
                                clearInterval(this.clockTimer);
                                this.clockTimer = null;
                            }
                        },
                        enterApp () {
                            _system.default.push({
                                uri: "/pages/home"
                            });
                        }
                    };
                    const moduleOwn = exports.default || module.exports;
                    const accessors = [
                        'public',
                        'protected',
                        'private'
                    ];
                    if (moduleOwn.data && accessors.some(function(acc) {
                        return moduleOwn[acc];
                    })) throw new Error('页面VM对象中的属性data不可与"' + accessors.join(',') + '"同时存在，请使用private替换data名称');
                    if (!moduleOwn.data) {
                        moduleOwn.data = {};
                        moduleOwn._descriptor = {};
                        accessors.forEach(function(acc) {
                            const accType = typeof moduleOwn[acc];
                            if ('object' === accType) {
                                moduleOwn.data = Object.assign(moduleOwn.data, moduleOwn[acc]);
                                for(const name in moduleOwn[acc])moduleOwn._descriptor[name] = {
                                    access: acc
                                };
                            } else if ('function' === accType) console.warn('页面VM对象中的属性' + acc + '的值不能是函数，请使用对象');
                        });
                    }
                };
                var $app_template$ = function(vm) {
                    const _vm_ = vm || this;
                    return aiot.__ce__("stack", {
                        __vm__: _vm_,
                        __opts__: {
                            classList: [
                                "page"
                            ]
                        }
                    }, [
                        aiot.__ce__("image", {
                            __vm__: _vm_,
                            __opts__: {
                                classList: [
                                    "wallpaper"
                                ],
                                src: "/common/wallpaper-watch.jpg"
                            }
                        }, []),
                        aiot.__ce__("div", {
                            __vm__: _vm_,
                            __opts__: {
                                classList: [
                                    "veil"
                                ]
                            }
                        }, []),
                        aiot.__ce__("div", {
                            __vm__: _vm_,
                            __opts__: {
                                classList: [
                                    "overlay"
                                ],
                                events: {
                                    click: function(evt) {
                                        return _vm_.enterApp(evt);
                                    }
                                }
                            }
                        }, [
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "top-row"
                                    ]
                                }
                            }, [
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "date-text"
                                        ],
                                        value: function() {
                                            return _vm_.dateText;
                                        }
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "location-chip"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "location-dot"
                                            ],
                                            value: "●"
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "location-text"
                                            ],
                                            value: function() {
                                                return _vm_.locationText;
                                            }
                                        }
                                    }, [])
                                ])
                            ]),
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "time-block"
                                    ]
                                }
                            }, [
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "time-text"
                                        ],
                                        value: function() {
                                            return _vm_.timeText;
                                        }
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "weekday-text"
                                        ],
                                        value: function() {
                                            return _vm_.weekdayText;
                                        }
                                    }
                                }, [])
                            ]),
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "brand-space"
                                    ]
                                }
                            }, []),
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "weather-card"
                                    ]
                                }
                            }, [
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "weather-main"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "weather-label"
                                            ],
                                            value: "今日天气"
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "weather-text"
                                            ],
                                            value: function() {
                                                return _vm_.weatherText;
                                            }
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "weather-divider"
                                        ]
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "temperature-block"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "temperature"
                                            ],
                                            value: function() {
                                                return _vm_.temperatureText;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "temperature-note"
                                            ],
                                            value: "体感舒适"
                                        }
                                    }, [])
                                ])
                            ]),
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "enter-pill"
                                    ]
                                }
                            }, [
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "enter-dot"
                                        ]
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "enter-text"
                                        ],
                                        value: "轻触进入安全中心"
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "enter-arrow"
                                        ],
                                        value: "›"
                                    }
                                }, [])
                            ])
                        ])
                    ]);
                };
                $app_exports$['entry'] = function($app_exports$) {
                    $app_script$({}, $app_exports$, $app_require$1);
                    $app_exports$.default.template = $app_template$;
                    $app_exports$.default.style = $app_style$;
                };
            })();
        };
        return createPageHandler();
    })(global, globalThis, window, $app_exports$, $app_evaluate$);
}
