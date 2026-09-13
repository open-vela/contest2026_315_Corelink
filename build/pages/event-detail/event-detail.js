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
                                paddingTop: "26px",
                                paddingRight: "22px",
                                paddingBottom: "36px",
                                paddingLeft: "22px",
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
                                flexShrink: 0
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
                                    "header-copy"
                                ]
                            ],
                            {
                                flex: 1,
                                marginLeft: "12px",
                                flexDirection: "column"
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
                                color: "#62ddb3",
                                fontSize: "10px",
                                letterSpacing: "1px"
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
                                width: "100%",
                                color: "#ffffff",
                                fontSize: "24px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-chip"
                                ]
                            ],
                            {
                                paddingTop: "5px",
                                paddingRight: "9px",
                                paddingBottom: "5px",
                                paddingLeft: "9px",
                                borderRadius: "13px",
                                fontSize: "11px"
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
                                color: "#82d1ff",
                                backgroundColor: "#17354a"
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
                                color: "#ffd27b",
                                backgroundColor: "#41311c"
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
                                color: "#dfc6ff",
                                backgroundColor: "#382d4a"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-cancelled"
                                ]
                            ],
                            {
                                color: "#76eabd",
                                backgroundColor: "#17392f"
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
                                marginTop: "15px",
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
                                fontSize: "11px"
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
                                    "page-caption"
                                ]
                            ],
                            {
                                width: "100%",
                                marginTop: "14px",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-caption-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "19px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "page-caption-count"
                                ]
                            ],
                            {
                                color: "#6f8981",
                                fontSize: "11px"
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
                                    "summary-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "17px",
                                paddingRight: "17px",
                                paddingBottom: "17px",
                                paddingLeft: "17px",
                                marginTop: "10px",
                                borderRadius: "22px",
                                backgroundColor: "#10342a",
                                flexDirection: "column",
                                flexShrink: 0
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
                                justifyContent: "space-between"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "right-summary"
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
                                    "summary-label"
                                ]
                            ],
                            {
                                color: "#79978e",
                                fontSize: "11px"
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
                                color: "#70f1bf",
                                fontSize: "23px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "location"
                                ]
                            ],
                            {
                                color: "#b5ccc5",
                                fontSize: "13px",
                                marginTop: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "result"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "15px",
                                fontWeight: "bold",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "section"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "16px",
                                paddingRight: "16px",
                                paddingBottom: "16px",
                                paddingLeft: "16px",
                                marginTop: "13px",
                                borderRadius: "20px",
                                backgroundColor: "#111f1c",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "section-head"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "section-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "17px",
                                fontWeight: "bold",
                                marginBottom: "8px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "snapshot-badge"
                                ]
                            ],
                            {
                                paddingTop: "4px",
                                paddingRight: "7px",
                                paddingBottom: "4px",
                                paddingLeft: "7px",
                                borderRadius: "10px",
                                color: "#9eb4ad",
                                backgroundColor: "#25332f",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "reason-row"
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
                                backgroundColor: "#63e8b8",
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
                                color: "#b8cbc5",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "feature-row"
                                ]
                            ],
                            {
                                width: "100%",
                                justifyContent: "space-between",
                                marginTop: "12px",
                                paddingTop: "9px",
                                borderTopWidth: "1px",
                                borderTopStyle: "solid",
                                borderTopColor: "#263530"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "feature"
                                ]
                            ],
                            {
                                color: "#6f837d",
                                fontSize: "10px"
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
                                color: "#70e6ba",
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
                                color: "#acbeb9",
                                fontSize: "11px",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-row"
                                ]
                            ],
                            {
                                width: "100%",
                                alignItems: "center",
                                marginTop: "8px",
                                paddingTop: "8px",
                                borderTopWidth: "1px",
                                borderTopStyle: "solid",
                                borderTopColor: "#263530"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "priority"
                                ]
                            ],
                            {
                                width: "34px",
                                height: "34px",
                                borderRadius: "17px",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#284a40"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "priority-text"
                                ]
                            ],
                            {
                                color: "#77e9bd",
                                fontSize: "11px",
                                fontWeight: "bold"
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
                                marginLeft: "10px",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-name"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "contact-value"
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
                                    "delivery"
                                ]
                            ],
                            {
                                color: "#88cfff",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-row"
                                ]
                            ],
                            {
                                width: "100%",
                                minHeight: "66px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-rail"
                                ]
                            ],
                            {
                                width: "20px",
                                flexDirection: "column",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-dot"
                                ]
                            ],
                            {
                                width: "9px",
                                height: "9px",
                                borderRadius: "5px",
                                backgroundColor: "#64e9b8",
                                marginTop: "4px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-line"
                                ]
                            ],
                            {
                                width: "2px",
                                height: "50px",
                                backgroundColor: "#284139"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-copy"
                                ]
                            ],
                            {
                                flex: 1,
                                paddingLeft: "8px",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-time"
                                ]
                            ],
                            {
                                color: "#638078",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "13px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-detail"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#8fa39d",
                                fontSize: "10px",
                                marginTop: "2px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "timeline-empty"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#71857f",
                                fontSize: "11px",
                                marginTop: "6px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "withdrawal-card"
                                ]
                            ],
                            {
                                width: "100%",
                                paddingTop: "16px",
                                paddingRight: "16px",
                                paddingBottom: "16px",
                                paddingLeft: "16px",
                                marginTop: "13px",
                                borderRadius: "20px",
                                backgroundColor: "#30263e",
                                flexDirection: "column",
                                flexShrink: 0
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "withdrawal-title"
                                ]
                            ],
                            {
                                color: "#d9baff",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "withdrawal-text"
                                ]
                            ],
                            {
                                color: "#bcabcd",
                                fontSize: "11px",
                                marginTop: "6px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "withdraw-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "52px",
                                marginTop: "16px",
                                borderRadius: "26px",
                                backgroundColor: "#7c55a2",
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
                                    "withdraw-note"
                                ]
                            ],
                            {
                                width: "100%",
                                color: "#776b80",
                                fontSize: "10px",
                                textAlign: "center",
                                marginTop: "7px",
                                flexShrink: 0
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
                                marginTop: "16px",
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
                                    "page-control-count"
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
                        var _eventMachine = __webpack_require__("./src/common/event-machine.js");
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
                        function statusClassFor(status) {
                            if ("queued" === status || "withdrawal_queued" === status) return "status-queued";
                            if ("withdrawn" === status) return "status-withdrawn";
                            if ("cancelled" === status) return "status-cancelled";
                            return "status-sent";
                        }
                        var _default = exports.default = {
                            private: {
                                currentPage: 0,
                                pageTitle: "事件概览",
                                pageIndicator: "1 / 3",
                                overviewTabClass: "page-tab-active",
                                messageTabClass: "",
                                timelineTabClass: "",
                                typeLabel: "事件详情",
                                statusLabel: "--",
                                statusClass: "status-sent",
                                timeLabel: "--",
                                confidence: 0,
                                locationLabel: "--",
                                resultLabel: "--",
                                reasons: [],
                                peakG: "--",
                                source: "--",
                                timeline: [],
                                contacts: [],
                                hasMessage: false,
                                showNoMessage: true,
                                timelineEmpty: true,
                                messageTitle: "",
                                messageType: "",
                                messageTime: "",
                                messageLocation: "",
                                messageConfidence: "",
                                wearerStatus: "",
                                deviceStatus: "",
                                recipientSummary: "",
                                deliveryText: "",
                                canWithdraw: false,
                                hasWithdrawal: false,
                                withdrawalMessage: ""
                            },
                            onShow () {
                                const event = this.$app.$def.getCurrentEvent();
                                if (!event) return void _system.default.back();
                                this.showPage(0);
                                this.renderEvent(event);
                            },
                            renderEvent (event) {
                                this.event = event;
                                this.typeLabel = event.typeLabel;
                                this.statusLabel = event.statusLabel;
                                this.statusClass = statusClassFor(event.status);
                                this.timeLabel = fullTimeLabel(event);
                                this.confidence = event.confidence;
                                this.locationLabel = event.locationLabel;
                                this.resultLabel = event.resultLabel;
                                this.reasons = event.reasons || [];
                                this.peakG = event.peakG;
                                this.source = event.source;
                                this.timeline = event.timeline || [];
                                this.timelineEmpty = 0 === this.timeline.length;
                                this.contacts = event.contacts || [];
                                this.hasMessage = Boolean(event.message);
                                this.showNoMessage = !this.hasMessage;
                                this.deliveryText = "queued" === event.status ? "待发送" : "cancelled" === event.status ? "未发送" : "已通知";
                                this.canWithdraw = "sent" === event.status;
                                this.hasWithdrawal = Boolean(event.withdrawalMessage);
                                this.withdrawalMessage = event.withdrawalMessage || "";
                                if (event.message) {
                                    this.messageTitle = event.message.title;
                                    this.messageType = event.message.type;
                                    this.messageTime = event.message.time;
                                    this.messageLocation = event.message.location;
                                    this.messageConfidence = event.message.confidence;
                                    this.wearerStatus = event.message.wearerStatus;
                                    this.deviceStatus = event.message.deviceStatus;
                                    this.recipientSummary = event.message.recipients;
                                }
                            },
                            showPage (pageIndex) {
                                this.currentPage = pageIndex;
                                this.overviewTabClass = 0 === pageIndex ? "page-tab-active" : "";
                                this.messageTabClass = 1 === pageIndex ? "page-tab-active" : "";
                                this.timelineTabClass = 2 === pageIndex ? "page-tab-active" : "";
                                if (0 === pageIndex) this.pageTitle = "事件概览";
                                else if (1 === pageIndex) this.pageTitle = "求助信息";
                                else this.pageTitle = "处理过程";
                                this.pageIndicator = pageIndex + 1 + " / 3";
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
                                        const detailScroll = page.$element("detailScroll");
                                        if (detailScroll) detailScroll.scrollTo({
                                            top: 0,
                                            left: 0,
                                            behavior: "instant"
                                        });
                                    } catch (error) {
                                        console.log("detail scroll reset skipped", error);
                                    }
                                }, 0);
                            },
                            withdraw () {
                                const page = this;
                                if (!this.event || !this.canWithdraw) return;
                                (0, _storage.loadSettings)(function(settings) {
                                    const updated = (0, _eventMachine.withdrawEvent)(page.event, settings.demoOffline);
                                    (0, _storage.updateEvent)(updated, function() {
                                        page.$app.$def.setCurrentEvent(updated);
                                        page.renderEvent(updated);
                                    });
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
                                id: "detailScroll",
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
                                                    "eyebrow"
                                                ],
                                                value: "EVENT TRACE"
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
                                        }, [])
                                    ]),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: function() {
                                                const $classValue$ = "status-chip " + _vm_.statusClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            value: function() {
                                                return _vm_.statusLabel;
                                            }
                                        }
                                    }, [])
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
                                                const $classValue$ = "page-tab " + _vm_.overviewTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "事件概览",
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
                                                const $classValue$ = "page-tab " + _vm_.messageTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "求助信息",
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
                                                const $classValue$ = "page-tab " + _vm_.timelineTabClass;
                                                if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                return $classValue$;
                                            },
                                            type: "button",
                                            value: "处理过程",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.showPage(2, evt);
                                                }
                                            }
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "page-caption"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "page-caption-title"
                                            ],
                                            value: function() {
                                                return _vm_.pageTitle;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "page-caption-count"
                                            ],
                                            value: function() {
                                                return _vm_.pageIndicator;
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
                                                        "summary-card"
                                                    ]
                                                }
                                            }, [
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
                                                        __opts__: {}
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "summary-label"
                                                                ],
                                                                value: "事件时间"
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "summary-value"
                                                                ],
                                                                value: function() {
                                                                    return _vm_.timeLabel;
                                                                }
                                                            }
                                                        }, [])
                                                    ]),
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "right-summary"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "summary-label"
                                                                ],
                                                                value: "可信度"
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
                                                    ])
                                                ]),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "location"
                                                        ],
                                                        value: function() {
                                                            return _vm_.locationLabel;
                                                        }
                                                    }
                                                }, []),
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "result"
                                                        ],
                                                        value: function() {
                                                            return _vm_.resultLabel;
                                                        }
                                                    }
                                                }, [])
                                            ]),
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "section"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "section-title"
                                                        ],
                                                        value: "判断依据"
                                                    }
                                                }, []),
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
                                                                    "reason-row"
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
                                                            "feature-row"
                                                        ]
                                                    }
                                                }, [
                                                    aiot.__ce__("text", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "feature"
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
                                                                "feature"
                                                            ],
                                                            value: function() {
                                                                return "来源 " + _vm_.source;
                                                            }
                                                        }
                                                    }, [])
                                                ])
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
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.hasMessage;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "section"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("div", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "section-head"
                                                                ]
                                                            }
                                                        }, [
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "section-title"
                                                                    ],
                                                                    value: "求助消息快照"
                                                                }
                                                            }, []),
                                                            aiot.__ce__("text", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "snapshot-badge"
                                                                    ],
                                                                    value: "不可变记录"
                                                                }
                                                            }, [])
                                                        ]),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "message-title"
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
                                                                    return "类型：" + _vm_.messageType;
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
                                                                    return "位置：" + _vm_.messageLocation;
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
                                                                    return "置信度：" + _vm_.messageConfidence;
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
                                                ];
                                            }),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.showNoMessage;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "section"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "section-title"
                                                                ],
                                                                value: "未生成求助消息"
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "message-line"
                                                                ],
                                                                value: "佩戴者已在倒计时结束前确认安全，本次事件仅保留端侧判断与处理记录。"
                                                            }
                                                        }, [])
                                                    ])
                                                ];
                                            }),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.contacts.length > 0;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "section"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "section-title"
                                                                ],
                                                                value: "本次通知顺序"
                                                            }
                                                        }, []),
                                                        aiot.__cf__({
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                exp: function() {
                                                                    return {
                                                                        __list__: _vm_.contacts,
                                                                        __tid__: "id"
                                                                    };
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
                                                                            "contact-row"
                                                                        ]
                                                                    }
                                                                }, [
                                                                    aiot.__ce__("div", {
                                                                        __vm__: _vm_,
                                                                        __opts__: {
                                                                            classList: [
                                                                                "priority"
                                                                            ]
                                                                        }
                                                                    }, [
                                                                        aiot.__ce__("text", {
                                                                            __vm__: _vm_,
                                                                            __opts__: {
                                                                                classList: [
                                                                                    "priority-text"
                                                                                ],
                                                                                value: function() {
                                                                                    return "P" + $item.priority;
                                                                                }
                                                                            }
                                                                        }, [])
                                                                    ]),
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
                                                                                    "contact-name"
                                                                                ],
                                                                                value: function() {
                                                                                    return $item.name;
                                                                                }
                                                                            }
                                                                        }, []),
                                                                        aiot.__ce__("text", {
                                                                            __vm__: _vm_,
                                                                            __opts__: {
                                                                                classList: [
                                                                                    "contact-value"
                                                                                ],
                                                                                value: function() {
                                                                                    return $item.maskedContact;
                                                                                }
                                                                            }
                                                                        }, [])
                                                                    ]),
                                                                    aiot.__ce__("text", {
                                                                        __vm__: _vm_,
                                                                        __opts__: {
                                                                            classList: [
                                                                                "delivery"
                                                                            ],
                                                                            value: function() {
                                                                                return _vm_.deliveryText;
                                                                            }
                                                                        }
                                                                    }, [])
                                                                ])
                                                            ];
                                                        })
                                                    ])
                                                ];
                                            })
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
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "section"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "section-title"
                                                        ],
                                                        value: "事件时间线"
                                                    }
                                                }, []),
                                                aiot.__cf__({
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        exp: function() {
                                                            return {
                                                                __list__: _vm_.timeline,
                                                                __tid__: "id"
                                                            };
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
                                                                    "timeline-row"
                                                                ]
                                                            }
                                                        }, [
                                                            aiot.__ce__("div", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "timeline-rail"
                                                                    ]
                                                                }
                                                            }, [
                                                                aiot.__ce__("div", {
                                                                    __vm__: _vm_,
                                                                    __opts__: {
                                                                        classList: [
                                                                            "timeline-dot"
                                                                        ]
                                                                    }
                                                                }, []),
                                                                aiot.__ce__("div", {
                                                                    __vm__: _vm_,
                                                                    __opts__: {
                                                                        classList: [
                                                                            "timeline-line"
                                                                        ]
                                                                    }
                                                                }, [])
                                                            ]),
                                                            aiot.__ce__("div", {
                                                                __vm__: _vm_,
                                                                __opts__: {
                                                                    classList: [
                                                                        "timeline-copy"
                                                                    ]
                                                                }
                                                            }, [
                                                                aiot.__ce__("text", {
                                                                    __vm__: _vm_,
                                                                    __opts__: {
                                                                        classList: [
                                                                            "timeline-time"
                                                                        ],
                                                                        value: function() {
                                                                            return $item.timeLabel;
                                                                        }
                                                                    }
                                                                }, []),
                                                                aiot.__ce__("text", {
                                                                    __vm__: _vm_,
                                                                    __opts__: {
                                                                        classList: [
                                                                            "timeline-title"
                                                                        ],
                                                                        value: function() {
                                                                            return $item.title;
                                                                        }
                                                                    }
                                                                }, []),
                                                                aiot.__ce__("text", {
                                                                    __vm__: _vm_,
                                                                    __opts__: {
                                                                        classList: [
                                                                            "timeline-detail"
                                                                        ],
                                                                        value: function() {
                                                                            return $item.detail;
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
                                                            return _vm_.timelineEmpty;
                                                        }
                                                    }
                                                }, function() {
                                                    return [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "timeline-empty"
                                                                ],
                                                                value: "暂无分步时间线，事件基础信息仍已保留。"
                                                            }
                                                        }, [])
                                                    ];
                                                })
                                            ]),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.hasWithdrawal;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("div", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "withdrawal-card"
                                                            ]
                                                        }
                                                    }, [
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "withdrawal-title"
                                                                ],
                                                                value: "安全状态更新"
                                                            }
                                                        }, []),
                                                        aiot.__ce__("text", {
                                                            __vm__: _vm_,
                                                            __opts__: {
                                                                classList: [
                                                                    "withdrawal-text"
                                                                ],
                                                                value: function() {
                                                                    return _vm_.withdrawalMessage;
                                                                }
                                                            }
                                                        }, [])
                                                    ])
                                                ];
                                            }),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.canWithdraw;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("input", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "withdraw-button"
                                                            ],
                                                            type: "button",
                                                            value: "我已安全，发送撤回更新",
                                                            events: {
                                                                click: function(evt) {
                                                                    return _vm_.withdraw(evt);
                                                                }
                                                            }
                                                        }
                                                    }, [])
                                                ];
                                            }),
                                            aiot.__ci__({
                                                __vm__: _vm_,
                                                __opts__: {
                                                    shown: function() {
                                                        return _vm_.canWithdraw;
                                                    }
                                                }
                                            }, function() {
                                                return [
                                                    aiot.__ce__("text", {
                                                        __vm__: _vm_,
                                                        __opts__: {
                                                            classList: [
                                                                "withdraw-note"
                                                            ],
                                                            value: "原始求助和发送记录会保留，仅追加“用户已安全”更新。"
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
                                                "page-control-count"
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
