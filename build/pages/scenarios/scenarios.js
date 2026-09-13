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
                    "./src/common/sensor-replay.js" (__unused_rspack_module, exports) {
                        "use strict";
                        Object.defineProperty(exports, "__esModule", {
                            value: true
                        });
                        exports.createReplayEngine = createReplayEngine;
                        exports.getScenarioCatalog = getScenarioCatalog;
                        const SAMPLE_INTERVAL_MS = 80;
                        const SCENARIOS = [
                            {
                                id: "normal",
                                title: "日常步行",
                                subtitle: "低风险基线",
                                samples: 40
                            },
                            {
                                id: "run",
                                title: "正常跑步",
                                subtitle: "验证不误报",
                                samples: 44
                            },
                            {
                                id: "shake",
                                title: "剧烈晃动",
                                subtitle: "冲击但持续运动",
                                samples: 44
                            },
                            {
                                id: "fall",
                                title: "疑似跌倒",
                                subtitle: "失重·冲击·静止",
                                samples: 48
                            },
                            {
                                id: "immobility",
                                title: "异常静止",
                                subtitle: "长时间低活动",
                                samples: 56
                            }
                        ];
                        function oscillation(index, speed) {
                            return Math.sin(index * speed);
                        }
                        function normalSample(index) {
                            return {
                                x: 0.08 * oscillation(index, 0.7),
                                y: 0.06 * oscillation(index, 0.43),
                                z: 1 + 0.08 * oscillation(index, 0.9)
                            };
                        }
                        function runSample(index) {
                            return {
                                x: 0.3 * oscillation(index, 1.1),
                                y: 0.18 * oscillation(index, 0.73),
                                z: 1.05 + 0.72 * oscillation(index, 1.45)
                            };
                        }
                        function shakeSample(index) {
                            if (12 === index) return {
                                x: 2.6,
                                y: 1.7,
                                z: 1.4
                            };
                            return {
                                x: 0.8 * oscillation(index, 1.9),
                                y: 0.65 * oscillation(index, 1.2),
                                z: 1 + 0.55 * oscillation(index, 1.55)
                            };
                        }
                        function fallSample(index) {
                            if (index < 13) return normalSample(index);
                            if (13 === index) return {
                                x: 0.08,
                                y: 0.05,
                                z: 0.18
                            };
                            if (14 === index) return {
                                x: 2.9,
                                y: 1.7,
                                z: 1.3
                            };
                            if (index < 21) {
                                const decay = (21 - index) / 7;
                                return {
                                    x: 0.96 + 0.25 * decay * oscillation(index, 1.4),
                                    y: 0.08 * decay,
                                    z: 0.2 + 0.3 * decay
                                };
                            }
                            return {
                                x: 0.97 + 0.004 * oscillation(index, 0.5),
                                y: 0.03,
                                z: 0.18 + 0.004 * oscillation(index, 0.8)
                            };
                        }
                        function immobilitySample(index) {
                            if (index < 6) return {
                                x: 0.03 + 0.002 * index,
                                y: 0.02,
                                z: 0.99
                            };
                            return {
                                x: 0.025 + 0.002 * oscillation(index, 0.31),
                                y: 0.018 + 0.001 * oscillation(index, 0.47),
                                z: 0.999 + 0.002 * oscillation(index, 0.27)
                            };
                        }
                        function makeSample(scenarioId, index) {
                            let vector = normalSample(index);
                            if ("run" === scenarioId) vector = runSample(index);
                            else if ("shake" === scenarioId) vector = shakeSample(index);
                            else if ("fall" === scenarioId) vector = fallSample(index);
                            else if ("immobility" === scenarioId) vector = immobilitySample(index);
                            return {
                                x: vector.x,
                                y: vector.y,
                                z: vector.z,
                                timestamp: Date.now()
                            };
                        }
                        function getScenarioCatalog() {
                            return SCENARIOS;
                        }
                        function createReplayEngine(callbacks) {
                            let timer = null;
                            function stop() {
                                if (timer) {
                                    clearInterval(timer);
                                    timer = null;
                                }
                            }
                            function start(scenarioId) {
                                stop();
                                let definition = SCENARIOS[0];
                                for(let index = 0; index < SCENARIOS.length; index += 1)if (SCENARIOS[index].id === scenarioId) {
                                    definition = SCENARIOS[index];
                                    break;
                                }
                                let sampleIndex = 0;
                                if (callbacks.onStart) callbacks.onStart(definition);
                                timer = setInterval(function() {
                                    const sample = makeSample(definition.id, sampleIndex);
                                    if (callbacks.onSample) callbacks.onSample(sample, sampleIndex + 1, definition.samples);
                                    sampleIndex += 1;
                                    if (sampleIndex >= definition.samples) {
                                        stop();
                                        if (callbacks.onComplete) callbacks.onComplete(definition);
                                    }
                                }, SAMPLE_INTERVAL_MS);
                            }
                            return {
                                start: start,
                                stop: stop
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
                                minHeight: "100%",
                                paddingTop: "22px",
                                paddingRight: "28px",
                                paddingBottom: "30px",
                                paddingLeft: "28px",
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
                                marginBottom: "12px"
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
                                width: "38px",
                                height: "38px",
                                marginRight: "9px",
                                borderRadius: "19px",
                                backgroundColor: "#162521",
                                color: "#ffffff",
                                fontSize: "26px"
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
                                    "title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "23px",
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
                                paddingTop: "5px",
                                paddingRight: "8px",
                                paddingBottom: "5px",
                                paddingLeft: "8px",
                                borderRadius: "11px",
                                backgroundColor: "#173b31",
                                color: "#83e8c2",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "result-card"
                                ]
                            ],
                            {
                                width: "100%",
                                minHeight: "155px",
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
                                    "status-ready"
                                ]
                            ],
                            {
                                backgroundColor: "#152521"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "status-running"
                                ]
                            ],
                            {
                                backgroundColor: "#183852"
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
                                    "result-head"
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
                                backgroundColor: "#76f0c2"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "result-kicker"
                                ]
                            ],
                            {
                                color: "#a7c8c0",
                                fontSize: "10px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "result-title"
                                ]
                            ],
                            {
                                color: "#ffffff",
                                fontSize: "25px",
                                fontWeight: "bold",
                                marginTop: "3px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "result-description"
                                ]
                            ],
                            {
                                color: "#b8ccc6",
                                fontSize: "11px",
                                marginTop: "2px"
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
                                marginTop: "12px",
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
                                borderRadius: "12px",
                                backgroundColor: "#09251f",
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
                                fontSize: "16px",
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
                                color: "#8ea69f",
                                fontSize: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "progress-track"
                                ]
                            ],
                            {
                                width: "100%",
                                height: "4px",
                                marginTop: "10px",
                                borderRadius: "2px",
                                backgroundColor: "#24443d"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "progress-fill"
                                ]
                            ],
                            {
                                height: "4px",
                                borderRadius: "2px",
                                backgroundColor: "#6dffcd"
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
                                marginTop: "16px",
                                marginBottom: "9px"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "scenario-grid"
                                ]
                            ],
                            {
                                width: "100%",
                                flexWrap: "wrap",
                                justifyContent: "space-between"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "scenario-card"
                                ]
                            ],
                            {
                                width: "48%",
                                minHeight: "66px",
                                paddingTop: "11px",
                                paddingRight: "11px",
                                paddingBottom: "11px",
                                paddingLeft: "11px",
                                marginBottom: "9px",
                                borderRadius: "17px",
                                backgroundColor: "#111f1d",
                                flexDirection: "column",
                                justifyContent: "center"
                            }
                        ],
                        [
                            [
                                [
                                    0,
                                    "scenario-title"
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
                                    "scenario-subtitle"
                                ]
                            ],
                            {
                                color: "#77908a",
                                fontSize: "9px",
                                marginTop: "2px"
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
                                color: "#5d746e",
                                fontSize: "9px",
                                textAlign: "center",
                                marginTop: "4px"
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
                        var _fallModel = __webpack_require__("./src/common/fall-model.js");
                        var _sensorReplay = __webpack_require__("./src/common/sensor-replay.js");
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
                        var _default = exports.default = {
                            private: {
                                sourceText: "模拟",
                                statusClass: "status-ready",
                                statusKicker: "准备就绪",
                                statusTitle: "选择一个场景",
                                statusDescription: "验证端侧识别与误报抑制",
                                currentG: "--",
                                peakG: "--",
                                riskScore: "--",
                                isRunning: false,
                                progressWidth: "0%",
                                scenarios: (0, _sensorReplay.getScenarioCatalog)()
                            },
                            onInit () {
                                const page = this;
                                this.sampleWindow = (0, _fallModel.createWindow)(64);
                                this.replay = (0, _sensorReplay.createReplayEngine)({
                                    onStart: function(definition) {
                                        page.onReplayStart(definition);
                                    },
                                    onSample: function(sample, index, total) {
                                        page.onReplaySample(sample, index, total);
                                    },
                                    onComplete: function(definition) {
                                        page.onReplayComplete(definition);
                                    }
                                });
                            },
                            onShow () {
                                const page = this;
                                (0, _storage.loadSettings)(function(settings) {
                                    page.sourceText = settings.useRealSensor ? "真机配置" : "模拟";
                                });
                            },
                            onDestroy () {
                                if (this.replay) this.replay.stop();
                            },
                            runScenario (scenarioId) {
                                if (this.isRunning) return;
                                this.replay.start(scenarioId);
                            },
                            onReplayStart (definition) {
                                (0, _fallModel.resetWindow)(this.sampleWindow);
                                this.isRunning = true;
                                this.progressWidth = "0%";
                                this.statusClass = "status-running";
                                this.statusKicker = "正在分析";
                                this.statusTitle = definition.title;
                                this.statusDescription = "提取腕端运动特征";
                                this.currentG = "--";
                                this.peakG = "0.00";
                                this.riskScore = "--";
                            },
                            onReplaySample (sample, index, total) {
                                (0, _fallModel.pushSample)(this.sampleWindow, sample);
                                const current = magnitude(sample);
                                this.currentG = current.toFixed(2);
                                this.peakG = Math.max(Number(this.peakG), current).toFixed(2);
                                this.progressWidth = Math.round(index / total * 100) + "%";
                            },
                            onReplayComplete (definition) {
                                const result = (0, _fallModel.assessWindow)(this.sampleWindow);
                                this.isRunning = false;
                                this.progressWidth = "100%";
                                this.riskScore = Math.round(100 * result.confidence) + "%";
                                if ("normal" === result.label) {
                                    this.statusClass = "status-safe";
                                    this.statusKicker = "未发现风险";
                                    this.statusTitle = "状态正常";
                                    this.statusDescription = "shake" === definition.id ? "冲击后仍持续运动，未判定跌倒" : "运动符合日常活动模式";
                                    return;
                                }
                                this.statusClass = "status-warning";
                                this.statusKicker = "发现风险";
                                this.statusTitle = "fall" === result.label ? "疑似跌倒" : "异常静止";
                                this.statusDescription = "即将进入安全确认";
                                this.$app.$def.setCurrentAlert((0, _eventMachine.createAlert)(result, definition.title + "回放"));
                                _system.default.push({
                                    uri: "/pages/alert"
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
                                                value: "场景测试"
                                            }
                                        }, []),
                                        aiot.__ce__("text", {
                                            __vm__: _vm_,
                                            __opts__: {
                                                classList: [
                                                    "subtitle"
                                                ],
                                                value: "端侧 IMU 可复现回放"
                                            }
                                        }, [])
                                    ]),
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
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: function() {
                                            const $classValue$ = "result-card " + _vm_.statusClass;
                                            if ('string' == typeof $classValue$) return $classValue$.split(' ').map((item)=>item.trim()).filter(Boolean);
                                            return $classValue$;
                                        }
                                    }
                                }, [
                                    aiot.__ce__("div", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "result-head"
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
                                                    "result-kicker"
                                                ],
                                                value: function() {
                                                    return _vm_.statusKicker;
                                                }
                                            }
                                        }, [])
                                    ]),
                                    aiot.__ce__("text", {
                                        __vm__: _vm_,
                                        __opts__: {
                                            classList: [
                                                "result-title"
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
                                                "result-description"
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
                                    ]),
                                    aiot.__ci__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            shown: function() {
                                                return _vm_.isRunning;
                                            }
                                        }
                                    }, function() {
                                        return [
                                            aiot.__ce__("div", {
                                                __vm__: _vm_,
                                                __opts__: {
                                                    classList: [
                                                        "progress-track"
                                                    ]
                                                }
                                            }, [
                                                aiot.__ce__("div", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "progress-fill"
                                                        ],
                                                        style: function() {
                                                            return __webpack_require__.g.$translateStyle$("width: " + _vm_.progressWidth + ";");
                                                        }
                                                    }
                                                }, [])
                                            ])
                                        ];
                                    })
                                ]),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "section-title"
                                        ],
                                        value: "选择测试场景"
                                    }
                                }, []),
                                aiot.__ce__("div", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "scenario-grid"
                                        ]
                                    }
                                }, [
                                    aiot.__cf__({
                                        __vm__: _vm_,
                                        __opts__: {
                                            exp: function() {
                                                return {
                                                    __list__: _vm_.scenarios,
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
                                                        "scenario-card"
                                                    ],
                                                    events: {
                                                        click: function(evt) {
                                                            return _vm_.runScenario($item.id, evt);
                                                        }
                                                    }
                                                }
                                            }, [
                                                aiot.__ce__("text", {
                                                    __vm__: _vm_,
                                                    __opts__: {
                                                        classList: [
                                                            "scenario-title"
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
                                                            "scenario-subtitle"
                                                        ],
                                                        value: function() {
                                                            return $item.subtitle;
                                                        }
                                                    }
                                                }, [])
                                            ])
                                        ];
                                    })
                                ]),
                                aiot.__ce__("text", {
                                    __vm__: _vm_,
                                    __opts__: {
                                        classList: [
                                            "hint"
                                        ],
                                        value: "测试过程中请勿重复点击；风险场景完成后会进入安全确认。"
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
