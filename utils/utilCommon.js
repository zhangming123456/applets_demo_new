'use strict';


var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call(Object);

var support = {};


module.exports.isArray = Array.isArray;

function isBoolean(arg) {
    return typeof arg === 'boolean';
}

module.exports.isBoolean = isBoolean;

function isNull(arg) {
    return arg === null;
}

module.exports.isNull = isNull;

function isNullOrUndefined(arg) {
    return arg === null || arg === undefined;
}

module.exports.isNullOrUndefined = isNullOrUndefined;

function isEqualToString(value, other) {
    return JSON.stringify(value) === JSON.stringify(other);
}

module.exports.isEqualToString = isEqualToString;

function isNumber(arg) {
    return typeof arg === 'number';
}

module.exports.isNumber = isNumber;

function isNumberOfNaN(arg) {
    if (arg) {
        arg = Number(arg);
    }
    return typeof arg === 'number' && !isNaN(arg);
}

module.exports.isNumberOfNaN = isNumberOfNaN;

function isString(arg) {
    return typeof arg === 'string';
}

module.exports.isString = isString;

function isSymbol(arg) {
    return typeof arg === 'symbol';
}

module.exports.isSymbol = isSymbol;

function isUndefined(arg) {
    return arg === undefined;
}

module.exports.isUndefined = isUndefined;

function isRegExp(re) {
    return binding.isRegExp(re);
}

module.exports.isRegExp = isRegExp;

function isObject(arg) {
    return arg !== null && typeof arg === 'object';
}

module.exports.isObject = isObject;

function isDate(d) {
    return binding.isDate(d);
}

module.exports.isDate = isDate;

function isFunction(arg) {
    return typeof arg === 'function';
}

module.exports.isFunction = isFunction;

function isPlainObject(obj) {
    var proto, Ctor;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || toString.call(obj) !== "[object Object]") {
        return false;
    }

    proto = getProto(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
}

module.exports.isPlainObject = isPlainObject;

function isPrimitive(arg) {
    return arg === null ||
        typeof arg !== 'object' && typeof arg !== 'function';
}

module.exports.isPrimitive = isPrimitive;

// module.exports.isBuffer = Buffer.isBuffer;

function pad(n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp(text) {
    var d = new Date();
    var time = [pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds())].join(':');
    return [d.getDate(), months[d.getMonth()], time].join(' ');
}


module.exports.timestamp = timestamp;

/**
 * 判断是否为非空对象
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    try {
        var name;
        for (name in obj) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
        console.log('非对象');
    }
}

module.exports.isEmptyObject = isEmptyObject;

/**
 * 判断是否为非空值
 * @param value
 * @returns {boolean}
 */
function isEmptyValue(value) {
    try {
        if (!value) {
            return false;
        } else if (isString(value)) {
            return !!value;
        }else if (isObject(value)) {
            return isEmptyObject(value);
        }else {
            return false;
        }
    } catch (e) {
        return false;
        console.log('判断是否为非空值出差', value);
    }
}

module.exports.isEmptyValue = isEmptyValue;

function isFalse(arg) {
    if (isString(arg) && arg.trim() === '') {
        return arg.trim();
    }
    if (arg === 'false' || arg === false || arg === null) {
        return false;
    } else if (arg === 'undefined') {
        return undefined;
    } else if (arg === 'true') {
        return true;
    } else if (arg === 'null') {
        return null;
    } else if (arg === 'NaN') {
        return NaN;
    } else {
        return arg
    }
}

module.exports.isFalse = isFalse;
// log is just a thin wrapper to console.log that prepends a timestamp
module.exports.log = function () {
    console.log('%s - %s', timestamp(), module.exports.format.apply(module.exports, arguments));
};

