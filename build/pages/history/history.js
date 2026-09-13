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
                                paddingTop: "26px",
                                paddingRight: "22px",
                                paddingBottom: "26px",
                                paddingLeft: "22px",
                                backgroundColor: "#08110f",
                                flexDirection: "column"
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
                                justifyContent: "space-between"
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
                                    "header-title-block"
                                ]
                            ],
                            {
                                flex: 1,
                                flexDirection: "column",
                                alignItems: "center"
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
                                    "clear-button"
                                ]
                            ],
                            {
                                width: "58px",
                                height: "38px",
                                borderRadius: "19px",
                                backgroundColor: "#2e1e1b",
                                color: "#ff958a",
                                fontSize: "13px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "summary-row"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                marginTop: "20px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "summary-card"
                                ]
                            ],
                            {
                                width: "48%",
                                height: "78px",
                                paddingTop: "12px",
                                paddingRight: "15px",
                                paddingBottom: "12px",
                                paddingLeft: "15px",
                                borderRadius: "18px",
                                backgroundColor: "#112a24",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "warning-card"
                                ]
                            ],
                            {
                                backgroundColor: "#372817"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "summary-value"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "27px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "summary-label"
                                ]
                            ],
                            {
                                color: "#8da29c",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "empty-state"
                                ]
                            ],
                            {
                                width: "100%",
                                flex: 1,
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "empty-icon"
                                ]
                            ],
                            {
                                width: "72px",
                                height: "72px",
                                borderRadius: "36px",
                                backgroundColor: "#123a2f",
                                color: "#6ff4c2",
                                fontSize: "40px",
                                textAlign: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "empty-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "21px",
                                fontWeight: "bold",
                                marginTop: "16px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "empty-note"
                                ]
                            ],
                            {
                                width: "82%",
                                color: "#6f817d",
                                fontSize: "13px",
                                textAlign: "center",
                                marginTop: "6px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-list"
                                ]
                            ],
                            {
                                width: "100%",
                                flex: 1,
                                marginTop: "16px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-card"
                                ]
                            ],
                            {
                                width: "100%",
                                minHeight: "150px",
                                paddingTop: "13px",
                                paddingRight: "13px",
                                paddingBottom: "13px",
                                paddingLeft: "13px",
                                marginBottom: "10px",
                                borderRadius: "18px",
                                backgroundColor: "#111f1c",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-top"
                                ]
                            ],
                            {
                                width: "100%",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-icon"
                                ]
                            ],
                            {
                                width: "42px",
                                height: "42px",
                                borderRadius: "21px",
                                justifyContent: "center",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "icon-safe"
                                ]
                            ],
                            {
                                backgroundColor: "#154333"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "icon-queued"
                                ]
                            ],
                            {
                                backgroundColor: "#593e1b"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "icon-sent"
                                ]
                            ],
                            {
                                backgroundColor: "#173850"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "icon-withdrawn"
                                ]
                            ],
                            {
                                backgroundColor: "#3c3153"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-icon-text"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "21px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-copy"
                                ]
                            ],
                            {
                                flex: 1,
                                marginLeft: "11px",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-sequence"
                                ]
                            ],
                            {
                                color: "#5f7f75",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-title"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#ffffff",
                                fontSize: "17px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-time"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#70847f",
                                fontSize: "11px",
                                marginTop: "2px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-result-row"
                                ]
                            ],
                            {
                                width: "100%",
                                marginTop: "10px",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-result-copy"
                                ]
                            ],
                            {
                                flex: 1,
                                marginRight: "8px",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-result"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#b2c3be",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-source"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#667b75",
                                fontSize: "10px",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-status"
                                ]
                            ],
                            {
                                paddingTop: "4px",
                                paddingRight: "7px",
                                paddingBottom: "4px",
                                paddingLeft: "7px",
                                borderRadius: "10px",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-safe"
                                ]
                            ],
                            {
                                color: "#78e9bd",
                                backgroundColor: "#18382f"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-queued"
                                ]
                            ],
                            {
                                color: "#ffd07a",
                                backgroundColor: "#45341d"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-sent"
                                ]
                            ],
                            {
                                color: "#81cfff",
                                backgroundColor: "#173146"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-withdrawn"
                                ]
                            ],
                            {
                                color: "#d0b7ff",
                                backgroundColor: "#352b49"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-meta"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                marginTop: "10px",
                                paddingTop: "8px",
                                borderTopWidth: "1px",
                                borderTopStyle: "solid",
                                borderTopColor: "#24332f"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-meta-text"
                                ]
                            ],
                            {
                                color: "#60736e",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "event-open"
                                ]
                            ],
                            {
                                color: "#69deb4",
                                fontSize: "10px"
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
                        function pad(value) {
                            return value < 10 ? "0" + value : String(value);
                        }
                        function fullTimeLabel(event) {
                            if (!event.createdAt) return event.timeLabel;
                            const date = new Date(event.createdAt);
                            return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
                        }
                        function decorate(event) {
                            const item = event;
                            if ("cancelled" === event.status) {
                                item.icon = "✓";
                                item.iconClass = "icon-safe";
                                item.statusClass = "status-safe";
                            } else if ("queued" === event.status) {
                                item.icon = "!";
                                item.iconClass = "icon-queued";
                                item.statusClass = "status-queued";
                            } else if ("withdrawal_queued" === event.status) {
                                item.icon = "↶";
                                item.iconClass = "icon-queued";
                                item.statusClass = "status-queued";
                            } else if ("withdrawn" === event.status) {
                                item.icon = "✓";
                                item.iconClass = "icon-withdrawn";
                                item.statusClass = "status-withdrawn";
                            } else {
                                item.icon = "↑";
                                item.iconClass = "icon-sent";
                                item.statusClass = "status-sent";
                            }
                            return item;
                        }
                        var _default = exports.default = {
                            private: {
                                events: [],
                                totalCount: 0,
                                queuedCount: 0
                            },
                            openDetail (eventId) {
                                for(let index = 0; index < this.events.length; index += 1)if (this.events[index].id === eventId) {
                                    this.$app.$def.setCurrentEvent(this.events[index]);
                                    _system.default.push({
                                        uri: "/pages/event-detail"
                                    });
                                    return;
                                }
                            },
                            openAllEvents () {
                                _system.default.push({
                                    uri: "/pages/all-events"
                                });
                            },
                            onShow () {
                                this.reload();
                            },
                            reload () {
                                const page = this;
                                (0, _storage.loadEvents)(function(events) {
                                    const decorated = [];
                                    for(let index = 0; index < events.length; index += 1){
                                        const item = decorate(events[index]);
                                        item.sequenceLabel = "事件 #" + (events.length - index);
                                        item.fullTimeLabel = fullTimeLabel(item);
                                        decorated.push(item);
                                    }
                                    page.events = decorated;
                                    page.totalCount = decorated.length;
                                    page.queuedCount = (0, _storage.countQueued)(decorated);
                                });
                            },
                            clearAll () {
                                const page = this;
                                (0, _storage.clearEvents)(function() {
                                    page.events = [];
                                    page.totalCount = 0;
                                    page.queuedCount = 0;
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
                        return aiot.__ce__("div", {
                            __vm__: _vm_,
                            __opts__: {
                                classList: [
                                    "page"
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
                                            "header-title-block"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "title"
                                            ],
                                            value: "事件历史"
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "subtitle"
                                            ],
                                            value: "本地留痕 · 最多保留 30 条"
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("input", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "clear-button"
                                        ],
                                        type: "button",
                                        value: "清空",
                                        events: {
                                            click: function(evt) {
                                                return _vm_.clearAll(evt);
                                            }
                                        }
                                    }
                                }, [])
                            ]),
                            aiot.__ce__("div", {
                                __vm__: _vm_,
                                __opts__: {
                                    classList: [
                                        "summary-row"
                                    ]
                                }
                            }, [
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "summary-card"
                                        ],
                                        events: {
                                            click: function(evt) {
                                                return _vm_.openAllEvents(evt);
                                            }
                                        }
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "summary-value"
                                            ],
                                            value: function() {
                                                return _vm_.totalCount;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "summary-label"
                                            ],
                                            value: "全部事件"
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "summary-card",
                                            "warning-card"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "summary-value"
                                            ],
                                            value: function() {
                                                return _vm_.queuedCount;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "summary-label"
                                            ],
                                            value: "等待补发"
                                        }
                                    }, [])
                                ])
                            ]),
                            aiot.__ci__({
                                __vm__: _vm_,
                                __opts__: {
                                    shown: function() {
                                        return 0 === _vm_.events.length;
                                    }
                                }
                            }, function() {
                                return [
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "empty-state"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "empty-icon"
                                                ],
                                                value: "✓"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "empty-title"
                                                ],
                                                value: "暂无安全事件"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "empty-note"
                                                ],
                                                value: "从首页运行场景实验后，处理结果会保存在这里"
                                            }
                                        }, [])
                                    ])
                                ];
                            }),
                            aiot.__ci__({
                                __vm__: _vm_,
                                __opts__: {
                                    shown: function() {
                                        return 0 !== _vm_.events.length;
                                    }
                                }
                            }, function() {
                                return [
                                    aiot.__ce__("list", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "event-list"
                                            ]
                                        }
                                    }, [
                                        aiot.__cf__({
                                            __vm__: _vm_,
                                            __opts__: {
                                                exp: function() {
                                                    return {
                                                        __list__: _vm_.events,
                                                        __tid__: "id"
                                                    };
                                                },
                                                key: "$idx",
                                                value: "$item"
                                            }
                                        }, function($idx, $item) {
                                            return [
                                                aiot.__ce__("list-item", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "event-card"
                                                        ],
                                                        type: "event",
                                                        events: {
                                                            click: function(evt) {
                                                                return _vm_.openDetail($item.id, evt);
                                                            }
                                                        }
                                                    }
                                                }, [
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "event-top"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("div", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: function() {
                                                                    const $classValue$ = "event-icon " + $item.iconClass;
                                                                    if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                                    return $classValue$;
                                                                }
                                                            }
                                                        }, [
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-icon-text"
                                                                    ],
                                                                    value: function() {
                                                                        return $item.icon;
                                                                    }
                                                                }
                                                            }, [])
                                                        ]),
                                                        aiot.__ce__("div", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "event-copy"
                                                                ]
                                                            }
                                                        }, [
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-sequence"
                                                                    ],
                                                                    value: function() {
                                                                        return $item.sequenceLabel;
                                                                    }
                                                                }
                                                            }, []),
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-title"
                                                                    ],
                                                                    value: function() {
                                                                        return $item.typeLabel;
                                                                    }
                                                                }
                                                            }, []),
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-time"
                                                                    ],
                                                                    value: function() {
                                                                        return $item.fullTimeLabel;
                                                                    }
                                                                }
                                                            }, [])
                                                        ])
                                                    ]),
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "event-result-row"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("div", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "event-result-copy"
                                                                ]
                                                            }
                                                        }, [
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-result"
                                                                    ],
                                                                    value: function() {
                                                                        return $item.resultLabel;
                                                                    }
                                                                }
                                                            }, []),
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "event-source"
                                                                    ],
                                                                    value: function() {
                                                                        return "来源：" + $item.source;
                                                                    }
                                                                }
                                                            }, [])
                                                        ]),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: function() {
                                                                    const $classValue$ = "event-status " + $item.statusClass;
                                                                    if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                                    return $classValue$;
                                                                },
                                                                value: function() {
                                                                    return $item.statusLabel;
                                                                }
                                                            }
                                                        }, [])
                                                    ]),
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "event-meta"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "event-meta-text"
                                                                ],
                                                                value: function() {
                                                                    return "可信度 " + $item.confidence + "%";
                                                                }
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "event-meta-text"
                                                                ],
                                                                value: function() {
                                                                    return "峰值 " + $item.peakG + "g";
                                                                }
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "event-open"
                                                                ],
                                                                value: "查看详情 ›"
                                                            }
                                                        }, [])
                                                    ])
                                                ])
                                            ];
                                        })
                                    ])
                                ];
                            })
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
