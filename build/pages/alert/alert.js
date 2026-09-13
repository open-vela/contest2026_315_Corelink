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
                                backgroundColor: "#1a0c0b"
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
                                minHeight: "100%",
                                paddingTop: "22px",
                                paddingRight: "28px",
                                paddingBottom: "30px",
                                paddingLeft: "28px",
                                flexDirection: "column",
                                alignItems: "center",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "eyebrow"
                                ]
                            ],
                            {
                                color: "#ff9b91",
                                fontSize: "13px",
                                letterSpacing: "2px",
                                fontWeight: "bold"
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
                                fontSize: "30px",
                                fontWeight: "bold",
                                marginTop: "3px"
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
                                color: "#d4b5b1",
                                fontSize: "13px",
                                marginTop: "1px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "countdown-ring"
                                ]
                            ],
                            {
                                width: "108px",
                                height: "108px",
                                marginTop: "12px",
                                borderTopColor: "#ff665a",
                                borderRightColor: "#ff665a",
                                borderBottomColor: "#ff665a",
                                borderLeftColor: "#ff665a",
                                borderStyle: "solid",
                                borderTopWidth: "6px",
                                borderRightWidth: "6px",
                                borderBottomWidth: "6px",
                                borderLeftWidth: "6px",
                                borderRadius: "54px",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "countdown"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "42px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "countdown-unit"
                                ]
                            ],
                            {
                                color: "#e8aaa4",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "evidence-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "16px",
                                paddingRight: "16px",
                                paddingBottom: "16px",
                                paddingLeft: "16px",
                                marginTop: "16px",
                                borderRadius: "20px",
                                backgroundColor: "#2b1715",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "evidence-head"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "evidence-title"
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
                                    "confidence"
                                ]
                            ],
                            {
                                color: "#ffb44a",
                                fontSize: "19px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "reason"
                                ]
                            ],
                            {
                                width: "100%",
                                alignItems: "center",
                                marginTop: "7px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "reason-dot"
                                ]
                            ],
                            {
                                width: "7px",
                                height: "7px",
                                borderRadius: "4px",
                                backgroundColor: "#ff665a",
                                marginRight: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "reason-text"
                                ]
                            ],
                            {
                                color: "#dec4c1",
                                fontSize: "13px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "evidence-footer"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                marginTop: "13px",
                                paddingTop: "10px",
                                borderTopWidth: "1px",
                                borderTopStyle: "solid",
                                borderTopColor: "#52302c"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "evidence-small"
                                ]
                            ],
                            {
                                color: "#9d7d79",
                                fontSize: "11px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "16px",
                                paddingRight: "16px",
                                paddingBottom: "16px",
                                paddingLeft: "16px",
                                marginTop: "14px",
                                borderRadius: "20px",
                                backgroundColor: "#13241f",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-head"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-title"
                                ]
                            ],
                            {
                                color: "#75e8bd",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-badge"
                                ]
                            ],
                            {
                                paddingTop: "4px",
                                paddingRight: "7px",
                                paddingBottom: "4px",
                                paddingLeft: "7px",
                                borderRadius: "10px",
                                backgroundColor: "#1d3a32",
                                color: "#8acbb5",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-name"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "15px",
                                fontWeight: "bold",
                                marginBottom: "5px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "message-line"
                                ]
                            ],
                            {
                                color: "#a9beb7",
                                fontSize: "12px",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "safe-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "48px",
                                marginTop: "12px",
                                borderRadius: "24px",
                                backgroundColor: "#66efbd",
                                color: "#09221b",
                                fontSize: "15px",
                                fontWeight: "bold",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "help-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "48px",
                                marginTop: "8px",
                                borderRadius: "24px",
                                backgroundColor: "#ff594d",
                                color: "#ffffff",
                                fontSize: "15px",
                                fontWeight: "bold",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "hint"
                                ]
                            ],
                            {
                                width: "100%",
                                marginTop: "7px",
                                color: "#876b68",
                                fontSize: "9px",
                                textAlign: "center",
                                flexShrink: 0
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
                        var _system2 = _interopRequireDefault($app_require$1("@app-module/system.vibrator"));
                        var _eventMachine = __webpack_require__("./src/common/event-machine.js");
                        var _storage = __webpack_require__("./src/common/storage.js");
                        function _interopRequireDefault(e) {
                            return e && e.__esModule ? e : {
                                default: e
                            };
                        }
                        var _default = exports.default = {
                            private: {
                                typeLabel: "安全确认",
                                confidence: 100,
                                reasons: [],
                                peakG: "--",
                                locationLabel: "位置待确认",
                                countdown: 10,
                                messageTitle: "VelaGuard安全提醒",
                                messageTime: "--",
                                wearerStatus: "佩戴者10秒内未响应",
                                deviceStatus: "检查网络状态中",
                                recipientSummary: "读取联系人中"
                            },
                            onInit () {
                                this.timer = null;
                                this.handled = false;
                            },
                            onShow () {
                                const alert = this.$app.$def.getCurrentAlert();
                                if (!alert) return void _system.default.back();
                                this.alert = alert;
                                this.typeLabel = alert.typeLabel;
                                this.confidence = alert.confidence;
                                this.reasons = alert.reasons;
                                this.peakG = alert.peakG;
                                this.locationLabel = alert.locationLabel;
                                this.countdown = "sos" === alert.type ? 6 : 10;
                                this.messageTime = alert.timeLabel;
                                this.loadPreview();
                                this.startCountdown();
                                this.vibrate();
                            },
                            loadPreview () {
                                const page = this;
                                (0, _storage.loadSettings)(function(settings) {
                                    page.settings = settings;
                                    (0, _storage.loadContacts)(function(contacts) {
                                        page.contacts = contacts;
                                        const message = (0, _eventMachine.buildEmergencyMessage)(page.alert, "timeout", settings.demoOffline, contacts);
                                        page.messageTitle = message.title;
                                        page.wearerStatus = message.wearerStatus;
                                        page.deviceStatus = message.deviceStatus;
                                        page.recipientSummary = message.recipients;
                                    });
                                });
                            },
                            onHide () {
                                this.stopCountdown();
                            },
                            onDestroy () {
                                this.stopCountdown();
                            },
                            vibrate () {
                                try {
                                    _system2.default.vibrate({
                                        mode: "long"
                                    });
                                } catch (error) {
                                    console.log("vibrator unavailable", error);
                                }
                            },
                            startCountdown () {
                                const page = this;
                                this.stopCountdown();
                                this.timer = setInterval(function() {
                                    page.countdown -= 1;
                                    if (page.countdown <= 0) page.resolve("timeout");
                                }, 1000);
                            },
                            stopCountdown () {
                                if (this.timer) {
                                    clearInterval(this.timer);
                                    this.timer = null;
                                }
                            },
                            confirmSafe () {
                                this.resolve("safe");
                            },
                            requestHelp () {
                                this.resolve("help");
                            },
                            resolve (action) {
                                const page = this;
                                if (this.handled || !this.alert) return;
                                this.handled = true;
                                this.stopCountdown();
                                (0, _storage.loadSettings)(function(settings) {
                                    (0, _storage.loadContacts)(function(contacts) {
                                        const resolved = (0, _eventMachine.resolveAlert)(page.alert, action, settings.demoOffline, contacts);
                                        (0, _storage.addEvent)(resolved, function() {
                                            page.$app.$def.clearCurrentAlert();
                                            page.$app.$def.setCurrentEvent(resolved);
                                            _system.default.push({
                                                uri: "/pages/event-detail"
                                            });
                                        });
                                    });
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
                        return aiot.__ce__("scroll", {
                            __vm__: _vm_,
                            __opts__: {
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
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "eyebrow"
                                        ],
                                        value: "SAFETY CHECK"
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "title"
                                        ],
                                        value: function() {
                                            return _vm_.typeLabel;
                                        }
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "subtitle"
                                        ],
                                        value: "请确认你现在是否安全"
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "countdown-ring"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "countdown"
                                            ],
                                            value: function() {
                                                return _vm_.countdown;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "countdown-unit"
                                            ],
                                            value: "秒后自动求助"
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("input", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "safe-button"
                                        ],
                                        type: "button",
                                        value: "我没事，取消告警",
                                        events: {
                                            click: function(evt) {
                                                return _vm_.confirmSafe(evt);
                                            }
                                        }
                                    }
                                }, []),
                                aiot.__ce__("input", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "help-button"
                                        ],
                                        type: "button",
                                        value: "立即求助",
                                        events: {
                                            click: function(evt) {
                                                return _vm_.requestHelp(evt);
                                            }
                                        }
                                    }
                                }, []),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "hint"
                                        ],
                                        value: "无操作时自动发送或进入离线队列"
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "evidence-card"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "evidence-head"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "evidence-title"
                                                ],
                                                value: "端侧判断依据"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "confidence"
                                                ],
                                                value: function() {
                                                    return _vm_.confidence + "%";
                                                }
                                            }
                                        }, [])
                                    ]),
                                    aiot.__cf__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            exp: function() {
                                                return _vm_.reasons;
                                            },
                                            key: "$idx",
                                            value: "$item"
                                        }
                                    }, function($idx, $item) {
                                        return [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "reason"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("div", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "reason-dot"
                                                        ]
                                                    }
                                                }, []),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "reason-text"
                                                        ],
                                                        value: function() {
                                                            return $item;
                                                        }
                                                    }
                                                }, [])
                                            ])
                                        ];
                                    }),
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "evidence-footer"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "evidence-small"
                                                ],
                                                value: function() {
                                                    return "峰值 " + _vm_.peakG + "g";
                                                }
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "evidence-small"
                                                ],
                                                value: function() {
                                                    return _vm_.locationLabel;
                                                }
                                            }
                                        }, [])
                                    ])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "message-card"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-head"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "message-title"
                                                ],
                                                value: "求助消息预览"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "message-badge"
                                                ],
                                                value: "结构化"
                                            }
                                        }, [])
                                    ]),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-name"
                                            ],
                                            value: function() {
                                                return _vm_.messageTitle;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "类型：" + _vm_.typeLabel;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "时间：" + _vm_.messageTime;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "位置：" + _vm_.locationLabel;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "置信度：" + _vm_.confidence + "%";
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "佩戴者：" + _vm_.wearerStatus;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "设备状态：" + _vm_.deviceStatus;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "message-line"
                                            ],
                                            value: function() {
                                                return "通知对象：" + _vm_.recipientSummary;
                                            }
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
            })();
        };
        return createPageHandler();
    })(global, globalThis, window, $app_exports$, $app_evaluate$);
}
