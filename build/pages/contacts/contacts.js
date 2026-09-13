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
                var __webpack_modules__ = {
                    "./src/common/event-machine.js" (__unused_rspack_module, exports) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.appendTimeline = appendTimeline;
                        exports.buildEmergencyMessage = buildEmergencyMessage;
                        exports.createAlert = createAlert;
                        exports.createSosAlert = createSosAlert;
                        exports.formatTime = formatTime;
                        exports.resolveAlert = resolveAlert;
                        exports.withdrawEvent = withdrawEvent;
                        function pad(value) {
                            return value < 10 ? "0" + value : String(value);
                        }
                        function formatTime(timestamp) {
                            const date = new Date(timestamp);
                            return pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
                        }
                        function typeLabel(type) {
                            if ("fall" === type) return "疑似跌倒";
                            if ("immobility" === type) return "异常静止";
                            if ("sos" === type) return "主动 SOS";
                            return "安全事件";
                        }
                        function appendTimeline(event, title, detail, timestamp) {
                            if (!event.timeline) event.timeline = [];
                            const time = timestamp || Date.now();
                            event.timeline.push({
                                id: event.id + "-timeline-" + event.timeline.length + "-" + time,
                                time: time,
                                timeLabel: formatTime(time),
                                title: title,
                                detail: detail
                            });
                            return event;
                        }
                        function contactSummary(contacts) {
                            if (!contacts || !contacts.length) return "未配置紧急联系人";
                            const names = [];
                            for(let index = 0; index < contacts.length; index += 1)names.push(contacts[index].name + "（P" + contacts[index].priority + "）");
                            return names.join("、");
                        }
                        function buildEmergencyMessage(alert, action, offline, contacts) {
                            const wearerStatus = "timeout" === action ? "佩戴者10秒内未响应" : "佩戴者主动确认需要帮助";
                            const deviceStatus = "电量68%，" + (offline ? "当前离线，将自动补发" : "网络已连接");
                            const message = {
                                title: "VelaGuard安全提醒",
                                type: alert.typeLabel,
                                time: alert.timeLabel,
                                location: alert.locationLabel,
                                confidence: alert.confidence + "%",
                                wearerStatus: wearerStatus,
                                deviceStatus: deviceStatus,
                                recipients: contactSummary(contacts)
                            };
                            message.body = message.title + "\n类型：" + message.type + "\n时间：" + message.time + "\n位置：" + message.location + "\n置信度：" + message.confidence + "\n佩戴者：" + message.wearerStatus + "\n设备状态：" + message.deviceStatus + "\n通知对象：" + message.recipients;
                            return message;
                        }
                        function createAlert(result, source) {
                            const now = Date.now();
                            const alert = {
                                id: "event-" + now,
                                type: result.label,
                                typeLabel: typeLabel(result.label),
                                confidence: Math.round(100 * result.confidence),
                                reasons: result.reasons || [],
                                source: source || "演示数据",
                                createdAt: now,
                                timeLabel: formatTime(now),
                                status: "confirming",
                                statusLabel: "等待确认",
                                resultLabel: "尚未处理",
                                locationLabel: "校园东区 · 模拟位置",
                                peakG: result.features ? result.features.peakG.toFixed(1) : "--",
                                timeline: []
                            };
                            appendTimeline(alert, "主动 SOS" === alert.typeLabel ? "用户主动触发 SOS" : "端侧检测到" + alert.typeLabel, "来源：" + alert.source + "，可信度 " + alert.confidence + "%", now);
                            appendTimeline(alert, "进入腕端安全确认", "sos" === alert.type ? "启动6秒快速确认" : "启动10秒二次确认", now + 1);
                            return alert;
                        }
                        function createSosAlert() {
                            return createAlert({
                                label: "sos",
                                confidence: 1,
                                reasons: [
                                    "用户主动触发求助",
                                    "无需等待算法复核"
                                ],
                                features: null
                            }, "腕端按钮");
                        }
                        function resolveAlert(alert, action, offline, contacts) {
                            const resolved = {};
                            const keys = Object.keys(alert);
                            for(let index = 0; index < keys.length; index += 1)resolved[keys[index]] = alert[keys[index]];
                            resolved.resolvedAt = Date.now();
                            resolved.timeline = alert.timeline ? alert.timeline.slice() : [];
                            if ("safe" === action) {
                                resolved.status = "cancelled";
                                resolved.statusLabel = "已取消";
                                resolved.resultLabel = "佩戴者确认安全";
                                appendTimeline(resolved, "佩戴者确认安全", "事件已取消，没有生成求助消息");
                                return resolved;
                            }
                            resolved.status = offline ? "queued" : "sent";
                            resolved.statusLabel = offline ? "待发送" : "已发送";
                            resolved.resultLabel = "timeout" === action ? "超时自动求助" : "用户立即求助";
                            resolved.contacts = contacts || [];
                            resolved.message = buildEmergencyMessage(resolved, action, offline, contacts);
                            appendTimeline(resolved, "timeout" === action ? "确认倒计时结束" : "用户点击立即求助", resolved.message.wearerStatus);
                            appendTimeline(resolved, offline ? "求助消息进入离线队列" : "求助消息已发送", offline ? "等待网络恢复后补发至：" + resolved.message.recipients : "通知对象：" + resolved.message.recipients);
                            return resolved;
                        }
                        function withdrawEvent(event, offline) {
                            const updated = {};
                            const keys = Object.keys(event);
                            for(let index = 0; index < keys.length; index += 1)updated[keys[index]] = event[keys[index]];
                            updated.timeline = event.timeline ? event.timeline.slice() : [];
                            updated.originalDeliveryStatus = event.originalDeliveryStatus || event.status;
                            updated.withdrawnAt = Date.now();
                            updated.status = offline ? "withdrawal_queued" : "withdrawn";
                            updated.statusLabel = offline ? "撤回待发" : "已撤回";
                            updated.resultLabel = "用户随后确认安全";
                            updated.withdrawalMessage = "VelaGuard状态更新\n事件：" + updated.typeLabel + "\n时间：" + formatTime(updated.withdrawnAt) + "\n状态：佩戴者已确认安全\n说明：保留原始求助记录，本消息用于更新联系人。";
                            appendTimeline(updated, "用户随后确认安全", offline ? "撤回更新已进入离线队列" : "已向原通知对象发送安全状态更新");
                            if (!offline) appendTimeline(updated, "撤回更新已发送", "原始求助记录保留，不执行删除");
                            return updated;
                        }
                    },
                    "./src/common/storage.js" (__unused_rspack_module, exports, __webpack_require__) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.addEvent = addEvent;
                        exports.clearEvents = clearEvents;
                        exports.countQueued = countQueued;
                        exports.flushQueuedEvents = flushQueuedEvents;
                        exports.loadContacts = loadContacts;
                        exports.loadEvents = loadEvents;
                        exports.loadSettings = loadSettings;
                        exports.saveContacts = saveContacts;
                        exports.saveEvents = saveEvents;
                        exports.saveSettings = saveSettings;
                        exports.updateEvent = updateEvent;
                        var _system = _interopRequireDefault($app_require$1("@app-module/system.storage"));
                        var _eventMachine = __webpack_require__("./src/common/event-machine.js");
                        function _interopRequireDefault(e) {
                            return e && e.__esModule ? e : {
                                default: e
                            };
                        }
                        const EVENTS_KEY = "velaguard.events.v1";
                        const SETTINGS_KEY = "velaguard.settings.v1";
                        const CONTACTS_KEY = "velaguard.contacts.v1";
                        const DEFAULT_SETTINGS = {
                            demoOffline: false,
                            useRealSensor: false
                        };
                        const DEFAULT_CONTACTS = [
                            {
                                id: "contact-1",
                                name: "张老师",
                                maskedContact: "138****2468",
                                priority: 1
                            },
                            {
                                id: "contact-2",
                                name: "家人",
                                maskedContact: "186****5310",
                                priority: 2
                            }
                        ];
                        function parseJson(value, fallback) {
                            if (!value) return fallback;
                            try {
                                return JSON.parse(value);
                            } catch (error) {
                                console.log("VelaGuard storage parse failed", error);
                                return fallback;
                            }
                        }
                        function loadEvents(callback) {
                            _system.default.get({
                                key: EVENTS_KEY,
                                default: "[]",
                                success: function(data) {
                                    callback(parseJson(data, []));
                                },
                                fail: function(data, code) {
                                    console.log("load events failed", data, code);
                                    callback([]);
                                }
                            });
                        }
                        function saveEvents(events, callback) {
                            _system.default.set({
                                key: EVENTS_KEY,
                                value: JSON.stringify(events.slice(0, 30)),
                                success: function() {
                                    if (callback) callback(events);
                                },
                                fail: function(data, code) {
                                    console.log("save events failed", data, code);
                                    if (callback) callback(events);
                                }
                            });
                        }
                        function addEvent(event, callback) {
                            loadEvents(function(events) {
                                events.unshift(event);
                                saveEvents(events, callback);
                            });
                        }
                        function updateEvent(event, callback) {
                            loadEvents(function(events) {
                                let replaced = false;
                                for(let index = 0; index < events.length; index += 1)if (events[index].id === event.id) {
                                    events[index] = event;
                                    replaced = true;
                                    break;
                                }
                                if (!replaced) events.unshift(event);
                                saveEvents(events, callback);
                            });
                        }
                        function clearEvents(callback) {
                            _system.default.delete({
                                key: EVENTS_KEY,
                                success: function() {
                                    if (callback) callback([]);
                                },
                                fail: function() {
                                    saveEvents([], callback);
                                }
                            });
                        }
                        function loadSettings(callback) {
                            _system.default.get({
                                key: SETTINGS_KEY,
                                default: JSON.stringify(DEFAULT_SETTINGS),
                                success: function(data) {
                                    const parsed = parseJson(data, DEFAULT_SETTINGS);
                                    callback({
                                        demoOffline: Boolean(parsed.demoOffline),
                                        useRealSensor: Boolean(parsed.useRealSensor)
                                    });
                                },
                                fail: function() {
                                    callback(DEFAULT_SETTINGS);
                                }
                            });
                        }
                        function saveSettings(settings, callback) {
                            _system.default.set({
                                key: SETTINGS_KEY,
                                value: JSON.stringify(settings),
                                success: function() {
                                    if (callback) callback(settings);
                                },
                                fail: function() {
                                    if (callback) callback(settings);
                                }
                            });
                        }
                        function loadContacts(callback) {
                            _system.default.get({
                                key: CONTACTS_KEY,
                                default: JSON.stringify(DEFAULT_CONTACTS),
                                success: function(data) {
                                    const contacts = parseJson(data, DEFAULT_CONTACTS);
                                    callback(contacts.length ? contacts : DEFAULT_CONTACTS);
                                },
                                fail: function() {
                                    callback(DEFAULT_CONTACTS);
                                }
                            });
                        }
                        function saveContacts(contacts, callback) {
                            _system.default.set({
                                key: CONTACTS_KEY,
                                value: JSON.stringify(contacts),
                                success: function() {
                                    if (callback) callback(contacts);
                                },
                                fail: function() {
                                    if (callback) callback(contacts);
                                }
                            });
                        }
                        function flushQueuedEvents(callback) {
                            loadEvents(function(events) {
                                let changed = 0;
                                for(let index = 0; index < events.length; index += 1)if ("queued" === events[index].status) {
                                    events[index].status = "sent";
                                    events[index].statusLabel = "已补发";
                                    events[index].sentAt = Date.now();
                                    if (events[index].message) events[index].message.deviceStatus = "电量68%，网络恢复后已补发";
                                    (0, _eventMachine.appendTimeline)(events[index], "离线求助已补发", "网络恢复，消息发送状态更新为已补发");
                                    changed += 1;
                                } else if ("withdrawal_queued" === events[index].status) {
                                    events[index].status = "withdrawn";
                                    events[index].statusLabel = "撤回已补发";
                                    events[index].withdrawalSentAt = Date.now();
                                    (0, _eventMachine.appendTimeline)(events[index], "撤回更新已补发", "联系人已收到“用户已确认安全”状态更新");
                                    changed += 1;
                                }
                                saveEvents(events, function() {
                                    if (callback) callback(changed, events);
                                });
                            });
                        }
                        function countQueued(events) {
                            let count = 0;
                            for(let index = 0; index < events.length; index += 1)if ("queued" === events[index].status || "withdrawal_queued" === events[index].status) count += 1;
                            return count;
                        }
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
                    __webpack_require__.rv = ()=>"1.7.12";
                })();
                (()=>{
                    __webpack_require__.ruid = "bundler=rspack@1.7.12";
                })();
                var __webpack_exports__ = {};
                (()=>{
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
                                backgroundColor: "#08110f"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "content"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "28px",
                                paddingRight: "24px",
                                paddingBottom: "38px",
                                paddingLeft: "24px",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "header"
                                ]
                            ],
                            {
                                width: "100%",
                                alignItems: "center",
                                marginBottom: "18px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "header-copy"
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
                                    "back-button"
                                ]
                            ],
                            {
                                width: "44px",
                                height: "44px",
                                marginRight: "13px",
                                borderRadius: "22px",
                                backgroundColor: "#162521",
                                color: "#ffffff",
                                fontSize: "30px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "25px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "subtitle"
                                ]
                            ],
                            {
                                color: "#70847f",
                                fontSize: "11px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-tabs"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "40px",
                                marginBottom: "13px",
                                paddingTop: "3px",
                                paddingRight: "3px",
                                paddingBottom: "3px",
                                paddingLeft: "3px",
                                borderRadius: "20px",
                                backgroundColor: "#101e1b",
                                justifyContent: "space-between",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-tab"
                                ]
                            ],
                            {
                                width: "32%",
                                height: "34px",
                                borderRadius: "17px",
                                backgroundColor: "#101e1b",
                                color: "#789089",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-tab-active"
                                ]
                            ],
                            {
                                backgroundColor: "#245044",
                                color: "#ffffff",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-panel"
                                ]
                            ],
                            {
                                width: "100%",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "privacy-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "14px",
                                paddingRight: "14px",
                                paddingBottom: "14px",
                                paddingLeft: "14px",
                                marginBottom: "13px",
                                borderRadius: "18px",
                                backgroundColor: "#30291b",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "privacy-title"
                                ]
                            ],
                            {
                                color: "#ffd27d",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "privacy-note"
                                ]
                            ],
                            {
                                color: "#ae9d7e",
                                fontSize: "10px",
                                marginTop: "4px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "17px",
                                paddingRight: "17px",
                                paddingBottom: "17px",
                                paddingLeft: "17px",
                                marginBottom: "13px",
                                borderRadius: "22px",
                                backgroundColor: "#111f1c",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-head"
                                ]
                            ],
                            {
                                width: "100%",
                                alignItems: "center",
                                marginBottom: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-copy"
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
                                    "priority-chip"
                                ]
                            ],
                            {
                                width: "43px",
                                height: "43px",
                                marginRight: "11px",
                                borderRadius: "22px",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#174438",
                                color: "#77efc1",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "priority-two"
                                ]
                            ],
                            {
                                backgroundColor: "#17364c",
                                color: "#8fd4ff"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "17px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-note"
                                ]
                            ],
                            {
                                color: "#70847e",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "field-label"
                                ]
                            ],
                            {
                                color: "#8ca09a",
                                fontSize: "11px",
                                marginTop: "9px",
                                marginBottom: "4px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "text-field"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "44px",
                                paddingLeft: "12px",
                                paddingRight: "12px",
                                borderRadius: "14px",
                                backgroundColor: "#1c2d29",
                                color: "#ffffff",
                                fontSize: "14px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "swap-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "46px",
                                borderRadius: "23px",
                                backgroundColor: "#283a35",
                                color: "#c2d5cf",
                                fontSize: "14px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "save-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "52px",
                                marginTop: "11px",
                                borderRadius: "26px",
                                backgroundColor: "#65e9b8",
                                color: "#082019",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "saved-text"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#6fe5b8",
                                fontSize: "11px",
                                textAlign: "center",
                                marginTop: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-controls"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "46px",
                                marginTop: "14px",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-button"
                                ]
                            ],
                            {
                                width: "32%",
                                height: "42px",
                                borderRadius: "21px",
                                backgroundColor: "#1d332e",
                                color: "#bcd5ce",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-button-placeholder"
                                ]
                            ],
                            {
                                width: "32%",
                                height: "42px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "next-button"
                                ]
                            ],
                            {
                                backgroundColor: "#24604f",
                                color: "#ffffff"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-indicator"
                                ]
                            ],
                            {
                                width: "28%",
                                color: "#70877f",
                                fontSize: "11px",
                                textAlign: "center"
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
                        var _storage = __webpack_require__("./src/common/storage.js");
                        function _interopRequireDefault(e) {
                            return e && e.__esModule ? e : {
                                default: e
                            };
                        }
                        function eventValue(event, fallback) {
                            if (event && void 0 !== event.value) return event.value;
                            return fallback;
                        }
                        var _default = exports.default = {
                            private: {
                                currentPage: 0,
                                pageIndicator: "1 / 3",
                                primaryTabClass: "page-tab-active",
                                secondaryTabClass: "",
                                saveTabClass: "",
                                primaryName: "",
                                primaryContact: "",
                                secondaryName: "",
                                secondaryContact: "",
                                saved: false,
                                savedText: ""
                            },
                            onShow () {
                                const page = this;
                                (0, _storage.loadContacts)(function(contacts) {
                                    page.primaryName = contacts[0].name;
                                    page.primaryContact = contacts[0].maskedContact;
                                    page.secondaryName = contacts[1].name;
                                    page.secondaryContact = contacts[1].maskedContact;
                                });
                            },
                            showPage (pageIndex) {
                                this.currentPage = pageIndex;
                                this.pageIndicator = pageIndex + 1 + " / 3";
                                this.primaryTabClass = 0 === pageIndex ? "page-tab-active" : "";
                                this.secondaryTabClass = 1 === pageIndex ? "page-tab-active" : "";
                                this.saveTabClass = 2 === pageIndex ? "page-tab-active" : "";
                                this.scrollToTop();
                            },
                            previousPage () {
                                if (this.currentPage > 0) this.showPage(this.currentPage - 1);
                            },
                            nextPage () {
                                if (this.currentPage < 2) this.showPage(this.currentPage + 1);
                            },
                            scrollToTop () {
                                const page = this;
                                setTimeout(function() {
                                    try {
                                        const contactScroll = page.$element("contactScroll");
                                        if (contactScroll) contactScroll.scrollTo({
                                            top: 0,
                                            left: 0,
                                            behavior: "instant"
                                        });
                                    } catch (error) {
                                        console.log("contact scroll reset skipped", error);
                                    }
                                }, 0);
                            },
                            onPrimaryNameChange (event) {
                                this.primaryName = eventValue(event, this.primaryName);
                                this.saved = false;
                            },
                            onPrimaryContactChange (event) {
                                this.primaryContact = eventValue(event, this.primaryContact);
                                this.saved = false;
                            },
                            onSecondaryNameChange (event) {
                                this.secondaryName = eventValue(event, this.secondaryName);
                                this.saved = false;
                            },
                            onSecondaryContactChange (event) {
                                this.secondaryContact = eventValue(event, this.secondaryContact);
                                this.saved = false;
                            },
                            swapPriority () {
                                const name = this.primaryName;
                                const contact = this.primaryContact;
                                this.primaryName = this.secondaryName;
                                this.primaryContact = this.secondaryContact;
                                this.secondaryName = name;
                                this.secondaryContact = contact;
                                this.saved = false;
                            },
                            save () {
                                const page = this;
                                const contacts = [
                                    {
                                        id: "contact-1",
                                        name: this.primaryName || "第一联系人",
                                        maskedContact: this.primaryContact || "***",
                                        priority: 1
                                    },
                                    {
                                        id: "contact-2",
                                        name: this.secondaryName || "第二联系人",
                                        maskedContact: this.secondaryContact || "***",
                                        priority: 2
                                    }
                                ];
                                (0, _storage.saveContacts)(contacts, function() {
                                    page.saved = true;
                                    page.savedText = "已保存：通知顺序为 " + contacts[0].name + " → " + contacts[1].name;
                                });
                            },
                            goBack () {
                                _system.default.back();
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
                        return aiot.__ce__("scroll", {
                            __vm__: _vm_,
                            __opts__: {
                                id: "contactScroll",
                                classList: [
                                    "page"
                                ],
                                scrollY: "true"
                            }
                        }, [
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "content"
                                    ]
                                }
                            }, [
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "header"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "back-button"
                                            ],
                                            type: "button",
                                            value: "‹",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.goBack(evt);
                                                }
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "header-copy"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "title"
                                                ],
                                                value: "紧急联系人"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "subtitle"
                                                ],
                                                value: "仅保存脱敏联系方式"
                                            }
                                        }, [])
                                    ])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "page-tabs"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: function() {
                                                const $classValue$ = "page-tab " + _vm_.primaryTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "第一联系人",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.showPage(0, evt);
                                                }
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: function() {
                                                const $classValue$ = "page-tab " + _vm_.secondaryTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "第二联系人",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.showPage(1, evt);
                                                }
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: function() {
                                                const $classValue$ = "page-tab " + _vm_.saveTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "保存设置",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.showPage(2, evt);
                                                }
                                            }
                                        }
                                    }, [])
                                ]),
                                aiot.__ci__({
                                    __vm__: _vm_,
                                    __opts__: {
                                        shown: function() {
                                            return 0 === _vm_.currentPage;
                                        }
                                    }
                                }, function() {
                                    return [
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "page-panel"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "privacy-card"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "privacy-title"
                                                        ],
                                                        value: "隐私提示"
                                                    }
                                                }, []),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "privacy-note"
                                                        ],
                                                        value: "初赛原型不发送真实短信。请填写138****2468一类掩码，不要提交真实手机号。"
                                                    }
                                                }, [])
                                            ]),
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "contact-card"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("div", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "contact-head"
                                                        ]
                                                    }
                                                }, [
                                                    aiot.__ce__("text", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "priority-chip"
                                                            ],
                                                            value: "P1"
                                                        }
                                                    }, []),
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "contact-copy"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "contact-title"
                                                                ],
                                                                value: "第一联系人"
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "contact-note"
                                                                ],
                                                                value: "优先生成通知状态"
                                                            }
                                                        }, [])
                                                    ])
                                                ]),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "field-label"
                                                        ],
                                                        value: "联系人姓名"
                                                    }
                                                }, []),
                                                aiot.__ce__("input", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "text-field"
                                                        ],
                                                        type: "text",
                                                        value: function() {
                                                            return _vm_.primaryName;
                                                        },
                                                        events: {
                                                            change: function(evt) {
                                                                return _vm_.onPrimaryNameChange(evt);
                                                            }
                                                        }
                                                    }
                                                }, []),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "field-label"
                                                        ],
                                                        value: "联系方式掩码"
                                                    }
                                                }, []),
                                                aiot.__ce__("input", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "text-field"
                                                        ],
                                                        type: "text",
                                                        value: function() {
                                                            return _vm_.primaryContact;
                                                        },
                                                        events: {
                                                            change: function(evt) {
                                                                return _vm_.onPrimaryContactChange(evt);
                                                            }
                                                        }
                                                    }
                                                }, [])
                                            ])
                                        ])
                                    ];
                                }),
                                aiot.__ci__({
                                    __vm__: _vm_,
                                    __opts__: {
                                        shown: function() {
                                            return 1 === _vm_.currentPage;
                                        }
                                    }
                                }, function() {
                                    return [
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "page-panel"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "contact-card"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("div", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "contact-head"
                                                        ]
                                                    }
                                                }, [
                                                    aiot.__ce__("text", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "priority-chip",
                                                                "priority-two"
                                                            ],
                                                            value: "P2"
                                                        }
                                                    }, []),
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "contact-copy"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "contact-title"
                                                                ],
                                                                value: "第二联系人"
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "contact-note"
                                                                ],
                                                                value: "第一联系人之后通知"
                                                            }
                                                        }, [])
                                                    ])
                                                ]),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "field-label"
                                                        ],
                                                        value: "联系人姓名"
                                                    }
                                                }, []),
                                                aiot.__ce__("input", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "text-field"
                                                        ],
                                                        type: "text",
                                                        value: function() {
                                                            return _vm_.secondaryName;
                                                        },
                                                        events: {
                                                            change: function(evt) {
                                                                return _vm_.onSecondaryNameChange(evt);
                                                            }
                                                        }
                                                    }
                                                }, []),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "field-label"
                                                        ],
                                                        value: "联系方式掩码"
                                                    }
                                                }, []),
                                                aiot.__ce__("input", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "text-field"
                                                        ],
                                                        type: "text",
                                                        value: function() {
                                                            return _vm_.secondaryContact;
                                                        },
                                                        events: {
                                                            change: function(evt) {
                                                                return _vm_.onSecondaryContactChange(evt);
                                                            }
                                                        }
                                                    }
                                                }, [])
                                            ])
                                        ])
                                    ];
                                }),
                                aiot.__ci__({
                                    __vm__: _vm_,
                                    __opts__: {
                                        shown: function() {
                                            return 2 === _vm_.currentPage;
                                        }
                                    }
                                }, function() {
                                    return [
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "page-panel"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("input", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "swap-button"
                                                    ],
                                                    type: "button",
                                                    value: "交换 P1 / P2 通知优先级",
                                                    events: {
                                                        click: function(evt) {
                                                            return _vm_.swapPriority(evt);
                                                        }
                                                    }
                                                }
                                            }, []),
                                            aiot.__ce__("input", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "save-button"
                                                    ],
                                                    type: "button",
                                                    value: "保存联系人配置",
                                                    events: {
                                                        click: function(evt) {
                                                            return _vm_.save(evt);
                                                        }
                                                    }
                                                }
                                            }, []),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.saved;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("text", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "saved-text"
                                                            ],
                                                            value: function() {
                                                                return _vm_.savedText;
                                                            }
                                                        }
                                                    }, [])
                                                ];
                                            })
                                        ])
                                    ];
                                }),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "page-controls"
                                        ]
                                    }
                                }, [
                                    aiot.__ci__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            shown: function() {
                                                return 0 === _vm_.currentPage;
                                            }
                                        }
                                    }, function() {
                                        return [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "page-button-placeholder"
                                                    ]
                                                }
                                            }, [])
                                        ];
                                    }),
                                    aiot.__ci__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            shown: function() {
                                                return _vm_.currentPage > 0;
                                            }
                                        }
                                    }, function() {
                                        return [
                                            aiot.__ce__("input", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "page-button"
                                                    ],
                                                    type: "button",
                                                    value: "‹ 上一页",
                                                    events: {
                                                        click: function(evt) {
                                                            return _vm_.previousPage(evt);
                                                        }
                                                    }
                                                }
                                            }, [])
                                        ];
                                    }),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "page-indicator"
                                            ],
                                            value: function() {
                                                return _vm_.pageIndicator;
                                            }
                                        }
                                    }, []),
                                    aiot.__ci__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            shown: function() {
                                                return 2 === _vm_.currentPage;
                                            }
                                        }
                                    }, function() {
                                        return [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "page-button-placeholder"
                                                    ]
                                                }
                                            }, [])
                                        ];
                                    }),
                                    aiot.__ci__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            shown: function() {
                                                return _vm_.currentPage < 2;
                                            }
                                        }
                                    }, function() {
                                        return [
                                            aiot.__ce__("input", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "page-button",
                                                        "next-button"
                                                    ],
                                                    type: "button",
                                                    value: "下一页 ›",
                                                    events: {
                                                        click: function(evt) {
                                                            return _vm_.nextPage(evt);
                                                        }
                                                    }
                                                }
                                            }, [])
                                        ];
                                    })
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
            })();
        };
        return createPageHandler();
    })(global, globalThis, window, $app_exports$, $app_evaluate$);
}
