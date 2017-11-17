const Reg = {
    isPath,
    isPhone,
    pathReg: /^\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/,
    PhoneReg: /^1[3|4|5|7|8]\d{9}$/
};
module.exports = Reg;

function isPath(text) {
    return Reg.pathReg.test(text);
}

function isPhone(text) {
    return text.length == 11 && Reg.PhoneReg.test(text);
}

module.exports = Reg;