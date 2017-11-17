const apiService = require('../../../utils/ApiService');
const RegExpUtil = require('../../../utils/RegExpUtil');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        clock: '',
        phoneStr: '您的手机号码格式输入有误，请重新输入',
        mobile: '',
        code: '',
        isCode: true,
        isMobile: true,
        isSubmit: false,
        focus: false,
        jumpUrl: null
    },
    onLoad: function (options) {
        var _this = this;
        if (options.jumpUrl) {
            options.jumpUrl = decodeURIComponent(options.jumpUrl);
        }
        let data = {
            jumpUrl: null,
            resId: null
        };
        Object.assign(data, options);
        _this.setData({jumpUrl: data.jumpUrl, resId: data.resId});
    },
    formSubmit: function () {
        let _this = this,
            mobile = this.data.mobile;
        if (this.data.isMobile) {
            apiService.getSmsCode(
                {"mobile": mobile, msgTemp: "SMS_DEFAULT_CONTENT"},
                function () {
                    util.showToast('验证码已发送');
                    _this.setData({focus: true});
                    let total_micro_second = 60 * 1000;
                    new util.Countdown(total_micro_second, 'ss').countdown(_this, 'clock');
                });
        } else {
            if (!mobile) {
                util.showToast('手机号码为空');
            } else if (!RegExpUtil.isPhone(mobile)) {
                util.showToast('手机号码格式不正确');
            }
        }

    },
    queSubmit: function (e) {
        let that = this,
            code = e.detail.value.code,
            mobile = e.detail.value.mobile;
        let data = {
            openId: app.globalData.openId,
            resId: that.data.resId
        };
        if (!code || code.length === 0) {
            util.showToast('验证码为空');
            return;
        } else if (code.length !== 6) {
            util.showToast('验证码位数不足');
            return;
        }
        if (this.data.isSubmit) {
            let apiName = 'checkBindMobile';
            if (data.resId && data.resId.length > 0) {
                apiName = 'checkMemberBindMobile';
            }
            app[apiName](data, function (rsp) {
                if (rsp.code == 2000) {//已绑定手机号
                    util.showToast('已绑定手机号');
                    util.go(-1);
                    return;
                } else if (rsp.code == 4003) {
                    let data = {
                        "openId": app.globalData.openId,
                        type: 1,
                        "mobile": mobile,
                        "code": code,
                        "resId": that.data.resId
                    };
                    apiService.bindWechatUser(data, function () {
                        if (that.data.jumpUrl && RegExpUtil.isPath(that.data.jumpUrl)) {
                            util.go(that.data.jumpUrl, {
                                type: 'blank'
                            })
                        } else {
                            util.go(-1);
                        }
                    });
                } else {
                    util.showToast(rsp.message);
                }
            });
        } else {
            util.showToast('手机号码格式不正确');
        }
    },
    bindInput(e) {
        let value = e.detail.value,
            type = e.currentTarget.dataset.type;
        this.data[type] = value;
        this.setSubmit();
    },
    setSubmit() {
        if (this.data.mobile && RegExpUtil.isPhone(this.data.mobile)) {
            this.setData({isMobile: true});
        } else {
            this.setData({isMobile: false});
        }

        if (this.data.code && this.data.code.length === 6) {
            this.setData({isCode: true});
        } else {
            this.setData({isCode: false});
        }

        if (this.data.isCode && this.data.isMobile) {
            this.setData({isSubmit: true});
        } else {
            this.setData({isSubmit: false});
        }
    }
});