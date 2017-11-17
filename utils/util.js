"use strict";
const utilMd5 = require('../utils/md5.js'),
    utilCommon = require('../utils/utilCommon'),
    regExpUtil = require('../utils/RegExpUtil'),
    dateFormate = require('../utils/formateDate'),
    queryString = require('../utils/queryString');

function getToken() {
    const app = getApp();
    if (app && app.globalData && app.globalData.token) {
        return app.globalData.token;
    } else {
        return wx.getStorageSync('token');
    }
}

module.exports.getToken = getToken;

let one_year = 31536000000,
    one_month = 2678400000,
    one_day = 86400000,
    one_hour = 3600000,
    one_minute = 60000,
    one_second = 1000;
// dateTime = +new Date('2017-09-25 09:01:01'),
// one_year = dateTime - +new Date('2016-09-25 09:01:01'),
// one_month = dateTime - +new Date('2017-08-25 09:01:01'),
// one_day = dateTime - +new Date('2017-09-24 09:01:01'),
// one_hour = dateTime - +new Date('2017-09-25 08:01:01'),
// one_minute = dateTime - +new Date('2017-09-25 09:00:01'),
// one_second = dateTime - +new Date('2017-09-25 09:01:00');
// 31536000000 2678400000 86400000 90000000 86460000 1000
// console.log(one_year, one_month, one_day, one_hour, one_minute, one_second);

function formatTime(time, config) {
    var time = time || new Date(),
        spacer = config && config.spacer,
        timer = 0;
    if (config && config.Y) {
        timer += Number(config.y) * one_year;
    }
    if (config && config.M) {
        timer += Number(config.M) * one_month;
    }
    if (config && config.M) {
        timer += Number(config.D) * one_day;
    }

    if (config && config.h) {
        timer += Number(config.h) * one_hour;
    }
    if (config && config.m) {
        timer += Number(config.m) * one_minute;
    }
    if (config && config.s) {
        timer += Number(config.s) * one_second;
    }
    if (utilCommon.isString(time) || utilCommon.isNumberOfNaN(time)) {
        try {
            let _time = time.trim().replace(/-/g, '/');
            time = new Date(_time);
            if (isNaN(time)) {
                _time = _time.replace(/\s/g, 'T');
                time = new Date(_time);
            }
        } catch (e) {
            return;
            console.log('时间格式错误', e);
        }
    }

    var date = new Date(+time + timer);

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()


    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    if (spacer) {
        return [year, month, day].map(formatNumber).join(spacer) + ' ' + [hour, minute, second].map(formatNumber).join(':')
    } else {
        return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
    }

}

module.exports.formatTime = formatTime;

function formatTimeEnd(time, config) {
    var timer = 0;
    if (config && config.Y) {
        timer += Number(config.y) * one_year;
    }
    if (config && config.M) {
        timer += Number(config.M) * one_month;
    }
    if (config && config.M) {
        timer += Number(config.D) * one_day;
    }

    if (config && config.h) {
        timer += Number(config.h) * one_hour;
    }
    if (config && config.m) {
        timer += Number(config.m) * one_minute;
    }
    if (config && config.s) {
        timer += Number(config.s) * one_second;
    }
    return timer;
}

function formateDate(strTime, format, needMap) {
    strTime = Number(strTime);
    format = format || 'Y-M-D H:I:S';
    var date = new Date(strTime);
    var dateMap = {
        y: (date.getFullYear() + '').slice(2), Y: date.getFullYear(), M: date.getMonth() + 1, D: date.getDate(),
        h: date.getHours() % 12,
        H: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        I: date.getMinutes() > 9 ? date.getMinutes() : ('0' + date.getMinutes()),
        S: date.getSeconds() > 9 ? date.getSeconds() : ('0' + date.getSeconds()),
        A: date.getHours() >= 12 ? 'pm' : 'am',
        w: date.getDay(),
        W: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    };
    for (var k in dateMap) {
        format = format.replace(new RegExp(k, 'g'), dateMap[k]);
    }

}

function formatTimeDifference(start, end, config) {
    var defaultTime = new Date(), time;

    if (utilCommon.isObject(start)) {
        start = start;
    } else {
        let _start = end.trim().replace(/-/g, '/');
        start = new Date(_start);
        if (isNaN(end)) {
            _start = _start.replace(/\s/g, 'T');
            start = new Date(_start);
        }
    }
    if (utilCommon.isObject(end)) {
        end = end;
    } else {
        let _end = end.trim().replace(/-/g, '/');
        end = new Date(_end);
        if (isNaN(end)) {
            _end = _end.replace(/\s/g, 'T');
            end = new Date(_end);
        }
    }
    time = end.getTime() - start.getTime();
    // console.log(time);
    if (config) {
        var type = '';
        if (utilCommon.isString(config)) {
            type = config;
        } else {
            type = config.type;
        }
        if (type === 'mm:ss') {
            // var curTime = dateFormate.format(new Date(), 'YYYY-MM-DD');
            // var curTimestr = new Date(curTime + ' 16:00:00');
            // var timer = new Date(+curTimestr + time);
            // console.log(timer);
            // return timer(time);
            return dateFormate.format(time, 'mmm:sss');
        } else if (type === 'YYYY-MM-DD') {
            return dateFormate.format(time, 'YYYY-MM-DD');
        } else {
            return dateFormate.format(time);
        }
    } else {
        return time;
    }
}

function timer(intDiff, bol) {
    var date = new Date();
    var day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值
    if (typeof intDiff !== Date) {
        date = new Date(intDiff);
        var dateMap = {
            y: (date.getFullYear() + '').slice(2),
            Y: date.getFullYear(),
            M: date.getMonth() + 1,
            D: date.getDate(),
            h: date.getHours() % 12,
            H: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            I: date.getMinutes() > 9 ? date.getMinutes() : ('0' + date.getMinutes()),
            S: date.getSeconds() > 9 ? date.getSeconds() : ('0' + date.getSeconds()),
            A: date.getHours() >= 12 ? 'pm' : 'am',
            w: date.getDay(),
            W: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
        };
        day = dateMap.D;
        hour = dateMap.H;
        minute = dateMap.I;
        second = dateMap.S;
    } else {
        if (intDiff > 0) {
            //计算相关的天，小时，还有分钟，以及秒
            day = Math.floor(intDiff / (60 * 60 * 24));
            hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
            minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
            second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
    }

    if (bol) {
        return day + '天' + hour + '小时' + minute + '分钟' + second + '秒';
    } else {
        return hour + ':' + minute + ':' + second;
    }
}


module.exports.formatTimeDifference = formatTimeDifference;

function formatTime1(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}

module.exports.formatTime1 = formatTime1;

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

module.exports.formatNumber = formatNumber;

var AND = "&";
var EQUAL = "=";
var QUESTION = "?";

function mergeKeyValue(sb, key, value, format) {
    //if (!key || !value) return "";
    sb += key;
    sb += EQUAL;
    if (format) {
        sb += encodeURI(value);
    } else {
        sb += value;
    }
    return sb;
}

module.exports.mergeKeyValue = mergeKeyValue;

function requestUrlMerge(url, params) {
    if (!params) return url;
    try {
        var sb = url;
        var position = 0;
        for (var key in params) {
            var value = params[key];
            if (value) {
                sb += position == 0 ? QUESTION : AND;
                sb = mergeKeyValue(sb, key, value);
                position++;
            }
        }
        return sb;
    } catch (e) {
    }
    return null;
}

module.exports.requestUrlMerge = requestUrlMerge;

function requestParametersMerge(params) {
    if (!params) return null;
    try {
        var sb = "";
        var position = 0;
        for (var key in params) {
            var value = params[key];
            var flag = true;
            if (!value && value !== 0) {
                value = '';
            }
            if (parseInt(value) == 0) {
                flag = true;
            }
            if (flag) {
                if (position > 0) {
                    sb += AND;
                }
                sb = mergeKeyValue(sb, key, value);
                position++;
            }
        }
        return sb;
    } catch (e) {
    }
    return null;
}

module.exports.requestParametersMerge = requestParametersMerge;

function sign(secretKey, params) {
    if (!params) return null;
    var keys = new Array();
    for (var key in params) {
        keys.push(key);
    }
    keys.sort();
    var sb = "";
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key != "token" && key != "signature") {
            params[key] = utilCommon.isFalse(params[key]);
            if (!params[key] && !utilCommon.isNumberOfNaN(params[key])) {
                params[key] = '';
            }
            sb += key;
            sb += params[key];
        }
    }
    return utilMd5.hexMD5(secretKey + sb).toUpperCase();
}

module.exports.sign = sign;

function initPay(params) {
    var a = "261ad12f08f13811298e2b50f803deab",
        app = getApp();
    if (!params) return null;
    params["signtime"] = Date.parse(new Date()) / 1000;
    params["appId"] = "eb86f42f6504bfefe069e85a204c9734";
    var signNum = sign(a, params);
    params["signature"] = signNum || '';
    // console.log('initPay', app);
    params["token"] = app.getToken() || '';
    return requestParametersMerge(params);
}

module.exports.initPay = initPay;

function getSignature(params) {
    var a = "261ad12f08f13811298e2b50f803deab";
    if (!params) return;
    params["signtime"] = Date.parse(new Date()) / 1000;
    params["appId"] = "eb86f42f6504bfefe069e85a204c9734";
    return sign(a, params);
}

module.exports.getSignature = getSignature;

function money(num) {
    num = parseFloat(num) || 0;
    return num.toFixed(2);
}

module.exports.money = money;

function moneyToFloat(num) {
    num = money(num);
    return parseFloat(num);
}

module.exports.moneyToFloat = moneyToFloat;

/**
 * 提示框（微信内置）
 * @param text
 */
function showToast(option) {
    let data = {
        title: option,
        icon: 'success',
        mask: true,
        duration: 4000
    };
    if (utilCommon.isObject(option)) {
        data.title = option.title;
        data.icon = option.icon || 'success';
        data.image = option.image;
        data.mask = option.mask || true;
        data.duration = option.duration || 2000;
        data.success = option.success ? () => {
            setTimeout(() => {
                option.success();
            }, data.duration)
        } : null;
        data.fail = option.fail;
        data.complete = option.complete;
    } else {
        if (arguments[1] && utilCommon.isFunction(arguments[1])) {
            data.complete = arguments[1];
        }
    }
    wx.hideToast();
    wx.hideLoading();
    wx.showToast(data);
}

module.exports.showToast = showToast;


function failToast(option) {
    let data = {
        title: option,
        icon: 'fail',
        image: '/images/fail.png',
        mask: true,
        duration: 4000
    };
    if (utilCommon.isObject(option)) {
        data.title = option.title;
        data.icon = option.icon || 'success';
        data.image = option.image;
        data.mask = option.mask || true;
        data.duration = option.duration || 2000;
        data.success = option.success ? () => {
            setTimeout(() => {
                option.success();
            }, data.duration)
        } : null;
        data.fail = option.fail;
        data.complete = option.complete;
    } else {
        if (arguments[1] && utilCommon.isFunction(arguments[1])) {
            data.complete = arguments[1];
        }
    }
    wx.hideToast();
    wx.hideLoading();
    wx.showToast(data);
}

module.exports.failToast = failToast;


function showLoading(text, cb) {
    wx.hideToast();
    wx.hideLoading();
    wx.showLoading({
        title: text,
        mask: true,
        success() {
            setTimeout(function () {
                cb && cb();
            }, 2000);
        }
    });
}

module.exports.showLoading = showLoading;

/**
 * 判断是否为非空对象
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    try {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
        console.log('非对象');
    }
}

module.exports.isEmptyObject = isEmptyObject;

/**
 * 对象与数组的复制 第一个值为Boolean并为true时为深度复制
 * @returns {*|{}}
 */
function extend() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    //如果第一个值为bool值，那么就将第二个参数作为目标参数，同时目标参数从2开始计数
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }
    // 当目标参数不是object 或者不是函数的时候，设置成object类型的
    if (typeof target !== "object" && !utilCommon.isFunction(target)) {
        target = {};
    }
    // //如果extend只有一个函数的时候，那么将跳出后面的操作
    // if (length === i) {
    //     target = this;
    //     --i;
    // }
    for (; i < length; i++) {
        // 仅处理不是 null/undefined values
        if ((options = arguments[i]) != null) {
            // 扩展options对象
            for (name in options) {
                src = target[name];
                copy = options[name];
                // 如果目标对象和要拷贝的对象是恒相等的话，那就执行下一个循环。
                if (target === copy) {
                    continue;
                }
                // 如果我们拷贝的对象是一个对象或者数组的话
                if (deep && copy && ( utilCommon.isPlainObject(copy) || (copyIsArray = utilCommon.isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && utilCommon.isArray(src) ? src : [];
                    } else {
                        clone = src && utilCommon.isPlainObject(src) ? src : {};
                    }
                    //不删除目标对象，将目标对象和原对象重新拷贝一份出来。
                    target[name] = extend(deep, clone, copy);
                    // 如果options[name]的不为空，那么将拷贝到目标对象上去。
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    // 返回修改的目标对象
    return target;
}

module.exports.extend = extend;

/**
 * 对象与数组的复制 第一个值为Boolean并为true时为深度复制
 * @returns {*|{}}
 */
function clone(arr, obj) {
    var target = {};
    if (utilCommon.isString(arr)) {
        target[arr] = obj[arr]
    } else if (utilCommon.isArray(arr)) {
        let length = arr.length;
        for (let i = 0; i < length; i++) {
            target[arr[i]] = obj[arr[i]]
        }
    }
    // 返回修改的目标对象
    return target;
}

module.exports.clone = clone;

/**
 * 当前页面路径
 * @returns {*}
 */
function CurrentPages() {
    let urlArr = getCurrentPages();
    return urlArr[urlArr.length - 1].route;
}

module.exports.CurrentPages = CurrentPages;

/**
 * 跳转路径
 * @param a{String|Number} 页面路径地址
 * @param options{Object} type{String}:跳转类型 （blank：关闭当前页面跳转；tab:关闭其他tabBar页面，跳转到tabBar页面；blankAll：关闭所有页面跳转）；data{Object}：跳转携带参数对象
 */
function go(a, options) {
    let stringify = '';
    if (!options) options = {};
    if (options.data) {
        stringify = queryString.stringify(options.data);
    }
    if (utilCommon.isNumberOfNaN(a)) {
        if (a < 0) {
            wx.navigateBack({
                delta: -a,
                success() {
                    options.success && options.success()
                },
                fail() {
                    options.fail && options.fail()
                },
                complete() {
                    options.complete && options.complete()
                }
            })
        }
    } else if (utilCommon.isString(a) && regExpUtil.isPath(a)) {
        if (/\?/.test(a)) {
            a = a + '&';
        } else {
            a = a + '?';
        }
        let url = a + stringify;
        if (options.type === 'blank') {
            wx.redirectTo({
                url: url,
                success() {
                    options.success && options.success()
                },
                fail(res) {
                    options.fail && options.fail()
                },
                complete() {
                    options.complete && options.complete()
                }
            })
        } else if (options.type === 'tab') {
            wx.switchTab({
                url: url,
                success() {
                    options.success && options.success()
                },
                fail(res) {
                    options.fail && options.fail()
                },
                complete() {
                    options.complete && options.complete()
                }
            })
        } else if (options.type === 'blankAll') {
            wx.reLaunch({
                url: url,
                success() {
                    options.success && options.success()
                },
                fail(res) {
                    options.fail && options.fail()
                },
                complete() {
                    options.complete && options.complete()
                }
            })
        } else {
            wx.navigateTo({
                url: url,
                success() {
                    options.success && options.success()
                },
                fail(res) {
                    options.fail && options.fail()
                },
                complete() {
                    options.complete && options.complete()
                }
            })
        }
    }
}

module.exports.go = go;

function chooseLocation() {
    return new Promise(function (resolve, reject) {
        wx.chooseLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                resolve(res);
            },
            cancel(res) {
                reject(res);
            }
        })
    })
}

module.exports.chooseLocation = chooseLocation;

// 时间格式化输出，如3:25:19 86。每10ms都会调用一次
function dateformat(micro_second, type) {
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 小时位
    var hr = Math.floor(second / 3600);
    // 分钟位
    var min = Math.floor((second - hr * 3600) / 60);
    // 秒位
    var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;
    // 毫秒位，保留2位
    var micro_sec = Math.floor((micro_second % 1000) / 10);
    // return hr + ":" + min + ":" + sec + " " + micro_sec;

    min = min < 10 ? '0' + min : min;
    sec = sec < 10 ? '0' + sec : sec;
    if (type === 'ss') {
        return sec;
    } else if (type === 'mm:ss') {
        return min + ":" + sec;
    } else {
        return hr + ":" + min + ":" + sec + " " + micro_sec;
    }
}


class Countdown {
    constructor(time, type) {
        this.time = time > 0 ? time : 0;
        this.type = type;
        this.clearTimeout = null;
        this.onCountdownEnd = null
    }

    clear() {
        this.clearTimeout && clearTimeout(this.clearTimeout);
    }

    /* 毫秒级倒计时 */
    countdown(that, text) {
        // 渲染倒计时时钟
        var _this = this;
        _this.clear();
        that.setData({
            [text]: dateformat(_this.time, _this.type)
        });

        if (_this.time <= 0) {
            _this.onCountdownEnd && _this.onCountdownEnd();
            if (_this.type === 'mm:ss') {
                that.setData({
                    [text]: "00:00"
                });
            } else {
                that.setData({
                    [text]: ''
                });
            }
            // timeout则跳出递归
            return;
        }
        _this.clearTimeout = setTimeout(function () {
            // 放在最后--
            _this.time -= 10;
            _this.countdown(that, text);
        }, 10)
    }


}

module.exports.Countdown = Countdown;
