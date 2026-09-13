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
                    "./src/common/fall-model.js" (__unused_rspack_module, exports, __webpack_require__) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.assessWindow = assessWindow;
                        exports.createWindow = createWindow;
                        exports.extractFeatures = extractFeatures;
                        exports.pushSample = pushSample;
                        exports.resetWindow = resetWindow;
                        var _generatedModel = __webpack_require__("./src/common/generated-model.js");
                        function magnitude(sample) {
                            return Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
                        }
                        function mean(values) {
                            if (!values.length) return 0;
                            let total = 0;
                            for(let index = 0; index < values.length; index += 1)total += values[index];
                            return total / values.length;
                        }
                        function variance(values) {
                            if (!values.length) return 0;
                            const average = mean(values);
                            let total = 0;
                            for(let index = 0; index < values.length; index += 1){
                                const delta = values[index] - average;
                                total += delta * delta;
                            }
                            return total / values.length;
                        }
                        function createWindow(maxSamples) {
                            return {
                                samples: [],
                                maxSamples: maxSamples || 64,
                                startedAt: 0,
                                endedAt: 0
                            };
                        }
                        function resetWindow(window) {
                            window.samples = [];
                            window.startedAt = 0;
                            window.endedAt = 0;
                        }
                        function pushSample(window, sample) {
                            const now = sample.timestamp || Date.now();
                            if (!window.startedAt) window.startedAt = now;
                            window.endedAt = now;
                            window.samples.push(sample);
                            if (window.samples.length > window.maxSamples) window.samples.shift();
                        }
                        function extractFeatures(window) {
                            const samples = window.samples;
                            const magnitudes = [];
                            let peakG = 0;
                            let minG = 99;
                            let lowMotionCount = 0;
                            for(let index = 0; index < samples.length; index += 1){
                                const currentMagnitude = magnitude(samples[index]);
                                magnitudes.push(currentMagnitude);
                                peakG = Math.max(peakG, currentMagnitude);
                                minG = Math.min(minG, currentMagnitude);
                                if (index > 0) {
                                    const previousMagnitude = magnitudes[index - 1];
                                    if (Math.abs(currentMagnitude - previousMagnitude) < 0.025) lowMotionCount += 1;
                                }
                            }
                            const tailSize = Math.min(10, magnitudes.length);
                            const tail = magnitudes.slice(magnitudes.length - tailSize);
                            const first = samples[0] || {
                                z: 1
                            };
                            const last = samples[samples.length - 1] || {
                                z: 1
                            };
                            const durationMs = Math.max(window.endedAt - window.startedAt, samples.length > 1 ? (samples.length - 1) * 80 : 0);
                            return {
                                peakG: peakG,
                                minG: 99 === minG ? 0 : minG,
                                variance: variance(magnitudes),
                                postVariance: variance(tail),
                                orientationChange: Math.abs(first.z - last.z),
                                lowMotionRatio: samples.length > 1 ? lowMotionCount / (samples.length - 1) : 0,
                                durationMs: durationMs,
                                sampleCount: samples.length
                            };
                        }
                        function reasonsFor(label, features) {
                            if ("fall" === label) return [
                                "检测到冲击峰值 " + features.peakG.toFixed(1) + "g",
                                "冲击前出现失重特征",
                                "冲击后姿态改变并趋于静止"
                            ];
                            if ("immobility" === label) return [
                                "持续低活动 " + Math.round(features.durationMs / 1000) + " 秒",
                                "运动波动低于个体基线",
                                "建议确认佩戴者状态"
                            ];
                            return [
                                "运动模式符合日常活动",
                                "未形成危险事件组合"
                            ];
                        }
                        function assessWindow(window) {
                            const features = extractFeatures(window);
                            const vector = [
                                features.peakG,
                                features.minG,
                                features.variance,
                                features.postVariance,
                                features.orientationChange,
                                features.lowMotionRatio,
                                features.durationMs
                            ];
                            const prediction = (0, _generatedModel.predict)(vector);
                            return {
                                label: prediction.label,
                                confidence: prediction.confidence,
                                features: features,
                                reasons: reasonsFor(prediction.label, features),
                                model: _generatedModel.MODEL_META
                            };
                        }
                    },
                    "./src/common/generated-model.js" (__unused_rspack_module, exports) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.MODEL_META = void 0;
                        exports.predict = predict;
                        const MODEL_META = exports.MODEL_META = {
                            name: "VelaGuardDecisionTree",
                            version: "1.0.0",
                            maxDepth: 4,
                            classes: [
                                "fall",
                                "immobility",
                                "normal"
                            ],
                            featureCount: 7
                        };
                        function predict(features) {
                            if (features[2] <= 0.030013723) if (features[5] <= 0.81816101) return {
                                label: "normal",
                                confidence: 1
                            };
                            else if (features[6] <= 3336.5211) return {
                                label: "immobility",
                                confidence: 0.60234333
                            };
                            else return {
                                label: "immobility",
                                confidence: 1
                            };
                            if (features[4] <= 0.39101994) if (features[1] <= 0.24567758) return {
                                label: "fall",
                                confidence: 0.84172662
                            };
                            else if (features[2] <= 0.40540738) return {
                                label: "normal",
                                confidence: 0.98417529
                            };
                            else return {
                                label: "normal",
                                confidence: 0.7073955
                            };
                            if (!(features[3] <= 0.076256741)) return {
                                label: "normal",
                                confidence: 1
                            };
                            if (features[5] <= 0.36436877) return {
                                label: "fall",
                                confidence: 0.93413174
                            };
                            return {
                                label: "fall",
                                confidence: 0.99904156
                            };
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
                                backgroundColor: "#07100f"
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
                                height: "100%",
                                paddingTop: "22px",
                                paddingRight: "28px",
                                paddingBottom: "20px",
                                paddingLeft: "28px",
                                flexDirection: "column"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "topbar"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "42px",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "clock"
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
                                    "top-status"
                                ]
                            ],
                            {
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "network-badge"
                                ]
                            ],
                            {
                                paddingTop: "5px",
                                paddingRight: "9px",
                                paddingBottom: "5px",
                                paddingLeft: "9px",
                                borderRadius: "12px",
                                color: "#ffffff",
                                fontSize: "11px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "network-online"
                                ]
                            ],
                            {
                                backgroundColor: "#123d31"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "network-offline"
                                ]
                            ],
                            {
                                backgroundColor: "#5a2b25"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "queue-chip"
                                ]
                            ],
                            {
                                paddingTop: "5px",
                                paddingRight: "8px",
                                paddingBottom: "5px",
                                paddingLeft: "8px",
                                marginRight: "6px",
                                borderRadius: "12px",
                                backgroundColor: "#49351b",
                                color: "#ffd27e",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-card"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "156px",
                                marginTop: "7px",
                                paddingTop: "15px",
                                paddingRight: "15px",
                                paddingBottom: "15px",
                                paddingLeft: "15px",
                                borderRadius: "22px",
                                flexDirection: "column"
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
                                backgroundColor: "#0d3b30"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-monitoring"
                                ]
                            ],
                            {
                                backgroundColor: "#173751"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-warning"
                                ]
                            ],
                            {
                                backgroundColor: "#632d26"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-head"
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
                                    "status-dot"
                                ]
                            ],
                            {
                                width: "8px",
                                height: "8px",
                                marginRight: "6px",
                                borderRadius: "4px",
                                backgroundColor: "#7affd4"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-kicker"
                                ]
                            ],
                            {
                                flex: 1,
                                color: "#a7c8c0",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "source-chip"
                                ]
                            ],
                            {
                                paddingTop: "3px",
                                paddingRight: "7px",
                                paddingBottom: "3px",
                                paddingLeft: "7px",
                                borderRadius: "9px",
                                backgroundColor: "#163f35",
                                color: "#80e6bd",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "28px",
                                fontWeight: "bold",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-description"
                                ]
                            ],
                            {
                                color: "#c6d8d3",
                                fontSize: "12px",
                                marginTop: "1px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "metric-row"
                                ]
                            ],
                            {
                                width: "100%",
                                marginTop: "11px",
                                justifyContent: "space-between"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "metric"
                                ]
                            ],
                            {
                                width: "31%",
                                height: "43px",
                                backgroundColor: "#09251f",
                                borderRadius: "12px",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "metric-value"
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
                                    "metric-label"
                                ]
                            ],
                            {
                                color: "#92aaa4",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "sos-button"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "50px",
                                marginTop: "12px",
                                borderRadius: "25px",
                                backgroundColor: "#ff5d50",
                                color: "#ffffff",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "nav-row"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "48px",
                                marginTop: "10px",
                                justifyContent: "space-between"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "nav-button"
                                ]
                            ],
                            {
                                width: "31%",
                                height: "48px",
                                borderRadius: "18px",
                                backgroundColor: "#172824",
                                color: "#cce0da",
                                fontSize: "12px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "disclaimer"
                                ]
                            ],
                            {
                                width: "100%",
                                marginTop: "9px",
                                textAlign: "center",
                                color: "#526762",
                                fontSize: "9px"
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
                        var _system2 = _interopRequireDefault($app_require$1("@app-module/system.network"));
                        var _system3 = _interopRequireDefault($app_require$1("@app-module/system.sensor"));
                        var _fallModel = __webpack_require__("./src/common/fall-model.js");
                        var _eventMachine = __webpack_require__("./src/common/event-machine.js");
                        var _storage = __webpack_require__("./src/common/storage.js");
                        function _interopRequireDefault(e) {
                            return e && e.__esModule ? e : {
                                default: e
                            };
                        }
                        function magnitude(sample) {
                            return Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
                        }
                        function pad(value) {
                            return value < 10 ? "0" + value : String(value);
                        }
                        var _default = exports.default = {
                            private: {
                                clockText: "--:--",
                                networkText: "检测中",
                                networkClass: "network-online",
                                statusClass: "status-safe",
                                statusKicker: "端侧守护中",
                                statusTitle: "状态正常",
                                statusDescription: "未发现安全风险",
                                currentG: "1.00",
                                peakG: "1.00",
                                riskScore: "--",
                                sourceText: "模拟",
                                pendingCount: 0
                            },
                            onInit () {
                                this.sampleWindow = (0, _fallModel.createWindow)(64);
                                this.clockTimer = null;
                                this.liveSampleCount = 0;
                                this.liveAlertLocked = false;
                            },
                            onShow () {
                                this.startClock();
                                this.refreshState();
                            },
                            onHide () {
                                this.stopClock();
                                this.stopLiveSensor();
                            },
                            onDestroy () {
                                this.stopClock();
                                this.stopLiveSensor();
                            },
                            startClock () {
                                const page = this;
                                this.stopClock();
                                this.updateClock();
                                this.clockTimer = setInterval(function() {
                                    page.updateClock();
                                }, 1000);
                            },
                            stopClock () {
                                if (this.clockTimer) {
                                    clearInterval(this.clockTimer);
                                    this.clockTimer = null;
                                }
                            },
                            updateClock () {
                                const now = new Date();
                                this.clockText = pad(now.getHours()) + ":" + pad(now.getMinutes());
                            },
                            refreshState () {
                                const page = this;
                                (0, _storage.loadEvents)(function(events) {
                                    page.pendingCount = (0, _storage.countQueued)(events);
                                });
                                (0, _storage.loadSettings)(function(settings) {
                                    page.settings = settings;
                                    page.sourceText = settings.useRealSensor ? "真机" : "模拟";
                                    page.refreshNetwork(settings.demoOffline);
                                    if (settings.useRealSensor) page.startLiveSensor();
                                    else page.stopLiveSensor();
                                });
                            },
                            refreshNetwork (demoOffline) {
                                const page = this;
                                if (demoOffline) {
                                    this.networkText = "离线";
                                    this.networkClass = "network-offline";
                                    return;
                                }
                                _system2.default.getType({
                                    success: function(data) {
                                        if ("none" === data.type) {
                                            page.networkText = "离线";
                                            page.networkClass = "network-offline";
                                        } else {
                                            page.networkText = "wifi" === data.type ? "Wi-Fi" : "联网";
                                            page.networkClass = "network-online";
                                        }
                                    },
                                    fail: function() {
                                        page.networkText = "模拟联网";
                                        page.networkClass = "network-online";
                                    }
                                });
                            },
                            startLiveSensor () {
                                const page = this;
                                this.stopLiveSensor();
                                (0, _fallModel.resetWindow)(this.sampleWindow);
                                this.liveSampleCount = 0;
                                this.liveAlertLocked = false;
                                _system3.default.subscribeAccelerometer({
                                    interval: "game",
                                    callback: function(sample) {
                                        page.onLiveSample(sample);
                                    },
                                    fail: function() {
                                        page.sourceText = "模拟";
                                        page.statusDescription = "模拟器无 IMU，请使用场景测试";
                                    }
                                });
                            },
                            stopLiveSensor () {
                                try {
                                    _system3.default.unsubscribeAccelerometer();
                                } catch (error) {
                                    console.log("unsubscribe accelerometer skipped", error);
                                }
                            },
                            onLiveSample (sample) {
                                if (this.liveAlertLocked) return;
                                sample.timestamp = Date.now();
                                (0, _fallModel.pushSample)(this.sampleWindow, sample);
                                this.liveSampleCount += 1;
                                const current = magnitude(sample);
                                this.currentG = current.toFixed(2);
                                this.peakG = Math.max(Number(this.peakG), current).toFixed(2);
                                if (this.liveSampleCount >= 50 && this.liveSampleCount % 10 === 0) {
                                    const result = (0, _fallModel.assessWindow)(this.sampleWindow);
                                    this.riskScore = Math.round(100 * result.confidence) + "%";
                                    if ("normal" !== result.label) {
                                        this.liveAlertLocked = true;
                                        this.openAlert((0, _eventMachine.createAlert)(result, "真机 IMU"));
                                    }
                                }
                            },
                            openAlert (alert) {
                                this.$app.$def.setCurrentAlert(alert);
                                _system.default.push({
                                    uri: "/pages/alert"
                                });
                            },
                            triggerSos () {
                                this.openAlert((0, _eventMachine.createSosAlert)());
                            },
                            openScenarios () {
                                _system.default.push({
                                    uri: "/pages/scenarios"
                                });
                            },
                            openHistory () {
                                _system.default.push({
                                    uri: "/pages/history"
                                });
                            },
                            openSettings () {
                                _system.default.push({
                                    uri: "/pages/settings"
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
                                        "content"
                                    ]
                                }
                            }, [
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "topbar"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "clock"
                                            ],
                                            value: function() {
                                                return _vm_.clockText;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "top-status"
                                            ]
                                        }
                                    }, [
                                        aiot.__ci__({
                                            __vm__: _vm_,
                                            __opts__: {
                                                shown: function() {
                                                    return _vm_.pendingCount > 0;
                                                }
                                            }
                                        }, function() {
                                            return [
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "queue-chip"
                                                        ],
                                                        value: function() {
                                                            return "待补发 " + _vm_.pendingCount;
                                                        }
                                                    }
                                                }, [])
                                            ];
                                        }),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: function() {
                                                    const $classValue$ = "network-badge " + _vm_.networkClass;
                                                    if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                                    return $classValue$;
                                                },
                                                value: function() {
                                                    return _vm_.networkText;
                                                }
                                            }
                                        }, [])
                                    ])
                                ]),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: function() {
                                            const $classValue$ = "status-card " + _vm_.statusClass;
                                            if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                            return $classValue$;
                                        }
                                    }
                                }, [
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "status-head"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "status-dot"
                                                ]
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "status-kicker"
                                                ],
                                                value: function() {
                                                    return _vm_.statusKicker;
                                                }
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "source-chip"
                                                ],
                                                value: function() {
                                                    return _vm_.sourceText;
                                                }
                                            }
                                        }, [])
                                    ]),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "status-title"
                                            ],
                                            value: function() {
                                                return _vm_.statusTitle;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "status-description"
                                            ],
                                            value: function() {
                                                return _vm_.statusDescription;
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "metric-row"
                                            ]
                                        }
                                    }, [
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "metric"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-value"
                                                    ],
                                                    value: function() {
                                                        return _vm_.currentG;
                                                    }
                                                }
                                            }, []),
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-label"
                                                    ],
                                                    value: "当前 g"
                                                }
                                            }, [])
                                        ]),
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "metric"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-value"
                                                    ],
                                                    value: function() {
                                                        return _vm_.peakG;
                                                    }
                                                }
                                            }, []),
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-label"
                                                    ],
                                                    value: "峰值 g"
                                                }
                                            }, [])
                                        ]),
                                        aiot.__ce__("div", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "metric"
                                                ]
                                            }
                                        }, [
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-value"
                                                    ],
                                                    value: function() {
                                                        return _vm_.riskScore;
                                                    }
                                                }
                                            }, []),
                                            aiot.__ce__("text", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "metric-label"
                                                    ],
                                                    value: "可信度"
                                                }
                                            }, [])
                                        ])
                                    ])
                                ]),
                                aiot.__ce__("input", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "sos-button"
                                        ],
                                        type: "button",
                                        value: "立即求助 SOS",
                                        events: {
                                            click: function(evt) {
                                                return _vm_.triggerSos(evt);
                                            }
                                        }
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "nav-row"
                                        ]
                                    }
                                }, [
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "nav-button"
                                            ],
                                            type: "button",
                                            value: "场景测试",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.openScenarios(evt);
                                                }
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "nav-button"
                                            ],
                                            type: "button",
                                            value: "事件历史",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.openHistory(evt);
                                                }
                                            }
                                        }
                                    }, []),
                                    aiot.__ce__("input", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "nav-button"
                                            ],
                                            type: "button",
                                            value: "设置",
                                            events: {
                                                click: function(evt) {
                                                    return _vm_.openSettings(evt);
                                                }
                                            }
                                        }
                                    }, [])
                                ]),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "disclaimer"
                                        ],
                                        value: "安全辅助原型 · 不用于医疗诊断"
                                    }
                                }, [])
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
