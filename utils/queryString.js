const QueryString = {
    location: {},
    stringify,
    parse,
    escape: qsEscape,
    queryString(href) {
        href = decodeURIComponent(href);
        if (!href || href.length === 0) {
            if (!location)
                return;
            href = location.href;
        }
        const url = href.split('#'),
            href_search = url[0].split('?'),
            protocol_host_pathname = href_search[0].split('://'),
            host_pathname = protocol_host_pathname[1].split('/'),
            hostname_post = host_pathname[0].split(':');
        this.location = {
            href: href,
            hash: url[1] ? '#' + url[1] : '',
            host: host_pathname[0] || '',
            hostname: hostname_post[0] || '',
            origin: host_pathname[0] ? (protocol_host_pathname[0] + '://' + host_pathname[0]) : '',
            pathname: host_pathname[1] ? ('/' + host_pathname.slice(1).join('/')) : '',
            port: hostname_post[1] || '',
            protocol: protocol_host_pathname[0] || '',
            search: href_search[1] ? ('?' + href_search[1]) : ''
        };
        return this.location;
    }
};
const noEscape = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
    0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, // 32 - 47
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, // 80 - 95
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0  // 112 - 127
];

function qsEscape(str) {
    if (typeof str !== 'string') {
        if (typeof str === 'object')
            str = String(str);
        else
            str += '';
    }
    var out = '';
    var lastPos = 0;

    for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);

        // ASCII
        if (c < 0x80) {
            if (noEscape[c] === 1)
                continue;
            if (lastPos < i)
                out += str.slice(lastPos, i);
            lastPos = i + 1;
            out += hexTable[c];
            continue;
        }

        if (lastPos < i)
            out += str.slice(lastPos, i);

        // Multi-byte characters ...
        if (c < 0x800) {
            lastPos = i + 1;
            out += hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)];
            continue;
        }
        if (c < 0xD800 || c >= 0xE000) {
            lastPos = i + 1;
            out += hexTable[0xE0 | (c >> 12)] +
                hexTable[0x80 | ((c >> 6) & 0x3F)] +
                hexTable[0x80 | (c & 0x3F)];
            continue;
        }
        // Surrogate pair
        ++i;
        var c2;
        if (i < str.length)
            c2 = str.charCodeAt(i) & 0x3FF;
        else
            throw new URIError('URI malformed');
        lastPos = i + 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | c2);
        out += hexTable[0xF0 | (c >> 18)] +
            hexTable[0x80 | ((c >> 12) & 0x3F)] +
            hexTable[0x80 | ((c >> 6) & 0x3F)] +
            hexTable[0x80 | (c & 0x3F)];
    }
    if (lastPos === 0)
        return str;
    if (lastPos < str.length)
        return out + str.slice(lastPos);
    return out;
}

function stringifyPrimitive(v) {
    if (typeof v === 'string')
        return v;
    if (typeof v === 'number' && isFinite(v))
        return '' + v;
    if (typeof v === 'boolean')
        return v ? 'true' : 'false';
    return '';
}

function stringify(obj, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';

    var encode = encodeURIComponent;
    if (options && typeof options.encodeURIComponent === 'function') {
        encode = options.encodeURIComponent;
    }

    if (obj !== null && typeof obj === 'object') {
        var keys = Object.keys(obj);
        var len = keys.length;
        var flast = len - 1;
        var fields = '';
        for (var i = 0; i < len; ++i) {
            var k = keys[i];
            var v = obj[k];
            var ks = encode(stringifyPrimitive(k)) + eq;

            if (Array.isArray(v)) {
                var vlen = v.length;
                var vlast = vlen - 1;
                for (var j = 0; j < vlen; ++j) {
                    fields += ks + encode(stringifyPrimitive(v[j]));
                    if (j < vlast)
                        fields += sep;
                }
                if (vlen && i < flast)
                    fields += sep;
            } else {
                fields += ks + encode(stringifyPrimitive(v));
                if (i < flast)
                    fields += sep;
            }
        }
        return fields;
    }
    return '';
}

function parse(url) {
    if (!this.queryString(url))
        return;
    const reg = /([^\?\=\&]+)\=([^\?\=\&]*)/g;
    let obj = {};
    while (reg.exec(this.location.search)) {
        obj[RegExp.$1] = RegExp.$2;
    }
    this.location.query = obj;
    return obj;
}

module.exports = QueryString;




