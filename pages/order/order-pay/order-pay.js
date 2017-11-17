const apiService = require('../../../utils/ApiService'),
    utilMd5 = require('../../../utils/md5.js'),
    appUtil = require('../../../utils/appUtil.js'),
    util = require('../../../utils/util.js'),
    app = getApp();

// 使用function初始化array，相比var initSubMenuDisplay = [] 既避免的引用复制的，同时方式更灵活，将来可以是多种方式实现，个数也不定的
function initSubMenuDisplay() {
    return ['hidden', 'hidden', 'hidden'];
}

//定义初始化数据，用于运行时保存
var initSubMenuHighLight = [
    ['', '', '', '', ''],
    ['', ''],
    ['', '', '']
];
Page({
    data: {
        subMenuDisplay: initSubMenuDisplay(),
        subMenuHighLight: initSubMenuHighLight,
        animationData: ['', '', ''],
        clock: '',
        paymentTime: 15 * 60 * 1000,
        hasMOney: false,
        module: '',
        message: '',
        isCheckSmsCodeByOpenId: true,
        endTime: null,//结束时间

        countdownTime: '15:00',//倒计时时间
        countdown: null,//倒计时实例
        clockCode: '',//60s倒计时时间
        clockCodeCountdown: null,//60s倒计时实例

        isCodeText: true,
        PaymentStatus: false,//支付状态
        isAutomaticGetCode: false,//是否自动发送验证码
    },
    onLoad: function (options) {
        var that = this;
        that.setData(options);
    },
    onShow(options) {
        this.setLoad();
    },
    onHide: function () {
        // 页面隐藏
        if (this.data.countdown) {
            this.data.countdown.clear();
        }
        if (this.data.clockCodeCountdown) {
            this.data.clockCodeCountdown.clear();
        }

    },
    onUnload: function () {
        // 关闭页面
        if (this.data.countdown) {
            this.data.countdown.clear();
        }
        if (this.data.clockCodeCountdown) {
            this.data.clockCodeCountdown.clear();
        }
    },
    setLoad(options) {
        var that = this;
        var data = {consumerId: that.data.consumerId, resId: that.data.resId};
        // console.log(data);
        apiService.getOrderDetail(data, function (rsp) {
            // console.log('订单详情')
            // console.log(rsp);
            that.setData({dingdan: rsp.value});
            let orderFood = rsp.value;
            orderFood.mealNumber = orderFood.consumerNo.substring(orderFood.consumerNo.length - 5);
            that.setData({orderFood});
            if (rsp.value.consumerType == 0) {
                that.setData({menu: "堂食"});
            } else if (rsp.value.consumerType == 1) {
                that.setData({menu: "快餐"});
                var systemTime = that.getNowFormatDate();
                // console.log(systemTime);
                var xiadanTime = rsp.value.createTime.replace(new RegExp("-", "gm"), "/");
                var xiadanHaoMiao = (new Date(xiadanTime)).getTime(); //得到毫秒数
                // console.log(xiadanHaoMiao);
                var timeLag = systemTime - xiadanHaoMiao;
                var total_micro_second = that.data.paymentTime - timeLag;
                if (timeLag < 15 * 60 * 1000) {
                    that.time(total_micro_second);
                } else {
                    total_micro_second = 0;
                    that.setData({
                        clock: "订单已取消"
                    })
                }
            } else {
                that.setData({menu: "外卖"});

                that.data.endTime = util.formatTime(rsp.value.createTime, {m: 15, spacer: '-'});

                // 设置倒计时
                let time = util.formatTimeDifference(new Date(), that.data.endTime);

                function onCountdownEnd() {
                    return;
                    util.go('/pages/order/order-detail/order-detail', {
                        type: 'blank',
                        data: {
                            resId: that.data.resId,
                            consumerId: that.data.consumerId,
                            status: 8
                        }
                    })
                }

                if (time > 0) {


                    that.data.countdown = new util.Countdown(time, 'mm:ss');
                    that.data.countdown.onCountdownEnd = onCountdownEnd;
                    that.data.countdown.countdown(that, 'countdownTime');
                } else {

                    that.setData({
                        countdownTime: '00:00'
                    });
                    onCountdownEnd()
                }


                var systemTime = that.getNowFormatDate();
                // console.log(systemTime);
                var xiadanTime = rsp.value.createTime.replace(new RegExp("-", "gm"), "/");
                var xiadanHaoMiao = (new Date(xiadanTime)).getTime(); //得到毫秒数
                // console.log(xiadanHaoMiao);
                var timeLag = systemTime - xiadanHaoMiao;
                var total_micro_second = that.data.paymentTime - timeLag;
                if (timeLag < 15 * 60 * 1000) {
                    that.time(total_micro_second);
                } else {
                    total_micro_second = 0;
                    that.setData({
                        clock: "订单已取消"
                    })
                }
            }
            that.paymentClick(null, true);
            let data = {openId: app.globalData.openId, resId: that.data.resId};
            apiService.getMemberCardList(data, function (rsp) {
                rsp.value.forEach(function (val, key) {
                    if (val.resId == that.data.resId) {
                        var memberBalance = util.money(val.memberBalance);
                        that.setData({
                            memberBalance: memberBalance,
                            resName: val.resName
                        });
                        if (that.data.orderFood.actualPrice > memberBalance) {
                            that.setData({
                                hasMOney: true
                            });
                        }
                    }
                });
            });
        });
    },
    paymentClick: function (e, bol) {
        var that = this;
        let payment = 'huiyuan';
        if (e) {
            payment = e.detail.value;
        }
        if (!bol) {
            that.setData({payment});
        }
        if (payment == 'huiyuan') {
            if (that.data.bindPhonenumber) {
                return;
            }
            apiService.checkMemberBindMobile({
                openId: app.globalData.openId,
                resId: that.data.resId
            }, (rsp) => {
                if (rsp.code == 4003) {//未绑定手机号
                    that.setData({
                        bindPhonenumber: false,
                        payment: ''
                    });
                    if (!bol) {
                        wx.showModal({
                            title: '温馨提示',
                            content: '对不起，您的会员卡还未绑定手机号，请先绑定手机！',
                            confirmText: '去绑定',
                            cancelText: '不绑定',
                            confirmColor: '#f74b7b',
                            success: function (res) {
                                if (res.confirm) {
                                    that.goBinding()
                                } else if (res.cancel) {

                                }
                            }
                        });
                    }
                } else if (rsp.code == 2000) {
                    that.setData({
                        bindPhonenumber: true,
                    });
                    if (!bol) {
                        that.setData({
                            payment: ''
                        })
                    }
                } else {
                    that.setData({
                        bindPhonenumber: false,
                    });
                }
            });
        }
    },
    startPay: function () {
        if (this.data.PaymentStatus) {
            return;
        }
        var that = this;
        var payment = that.data.payment;
        if (payment == undefined || payment == "") {
            wx.showToast({
                title: "请选择支付方式",
                duration: 2000
            });
        } else {
            if (payment == 'weixin') {
                var date = String(util.formatTime1(new Date()));
                var orderNo = that.data.consumerId;
                var orderMoney = parseInt(that.data.orderFood.actualPrice * 100);
                var subject = '微信点餐';// 商品名称
                var body = '微信点餐';//
                var openid = app.globalData.openId;
                var resId = that.data.resId;
                var params = {orderNo, orderMoney, subject, body, openid, resId};
                if ('000000005c2536d5015c2e169199061f' === resId) {
                    wx.showModal({
                        content: '该店铺为演示店铺，请勿使用微信支付',
                        confirmText: '确认支付',
                        cancelText: '不支付',
                        cancelColor: '#f74b7b',
                        success: function (res) {
                            if (res.confirm) {
                                wxPayForH5()
                            }
                        }
                    });
                } else {
                    wxPayForH5()
                }

                function wxPayForH5() {
                    that.data.PaymentStatus = true;
                    apiService.wxPayForH5(params, function (rsp) {
                        if (rsp.returnStatus) {
                            var value = rsp.value;
                            var wxPay = value.woi;
                            wx.requestPayment({
                                'timeStamp': wxPay.timestamp,
                                'nonceStr': wxPay.noncestr,
                                'package': 'prepay_id=' + wxPay.prepayid,//之前的
                                'signType': 'MD5',
                                'paySign': value.paySign,
                                'appid': wxPay.appid,
                                'total_fee': orderMoney,
                                'openid': app.globalData.openId,
                                'success': function (res) {
                                    that.data.PaymentStatus = false;
                                    // console.log(res);
                                    that.finishPay();
                                },
                                'fail': function (res) {
                                    // console.log(res);
                                    util.go('/pages/order/order-detail/order-detail', {
                                        type: 'blank',
                                        data: {
                                            resId: that.data.resId,
                                            consumerId: that.data.consumerId,
                                            tableCode: that.data.tableCode,
                                            tableName: that.data.tableName,
                                            status: 3
                                        }
                                    });
                                }
                            });
                        } else {
                            // console.log('微信支付失败');
                            wx.showToast({
                                title: "微信支付失败",
                                duration: 3000
                            });
                            that.data.PaymentStatus = false;
                        }
                    });
                }
            } else if (payment == 'huiyuan') {
                // 会员卡支付
                // console.log('会员卡支付');
                if (!that.data.bindPhonenumber) {
                    wx.showToast({
                        title: "请先绑定会员",
                        duration: 2000
                    });
                } else if (that.data.orderFood.actualPrice <= that.data.memberBalance) {
                    if (app.globalData.bindPhonenumber == false) {
                        that.setData({
                            module: 'moduleActive'
                        });
                    } else {
                        if (that.data.isAutomaticGetCode) {
                            that.getCode();
                        }
                        that.setData({
                            message: 'moduleActiveMe'
                        });
                    }
                } else {
                    wx.showToast({
                        title: "会员卡余额不足，请前往收银台充值",
                        duration: 2000
                    });
                }
            }
        }
    },
    finishPay: function () {//完成支付
        app.globalData.clrCar = true;
        var that = this;
        var data = {
            consumerId: that.data.consumerId,
            resId: that.data.resId,
            type: 0,
            openId: app.globalData.openId,
        };
        apiService.finishPay(data, function (rsp) {
            // console.log(rsp)
            if (rsp.returnStatus) {
                util.go('/pages/order/order-detail/order-detail', {
                    type: 'blank',
                    data: {
                        resId: that.data.resId,
                        consumerId: that.data.consumerId,
                        tableCode: that.data.tableCode,
                        tableName: that.data.tableName,
                        status: 5
                    }
                });
            } else {
                wx.showToast({
                    title: rsp.message,
                    duration: 2000
                });
            }
        });
    },
    tapMainMenu: function (e) {
        var that = this;
        //		获取当前显示的一级菜单标识
        var index = parseInt(e.currentTarget.dataset.index);
        // 生成数组，全为hidden的，只对当前的进行显示
        var newSubMenuDisplay = initSubMenuDisplay();
        //		如果目前是显示则隐藏，反之亦反之。同时要隐藏其他的菜单
        if (that.data.subMenuDisplay[index] == 'hidden') {
            newSubMenuDisplay[index] = 'show';
        } else {
            newSubMenuDisplay[index] = 'hidden';
        }
        // 设置为新的数组
        that.setData({
            subMenuDisplay: newSubMenuDisplay
        });
        // 设置动画
        that.animation(index);
        // console.log(this.data.subMenuDisplay);
    },
    tapSubMenu: function (e) {
        var that = this;
        // 隐藏菜单
        that.setData({
            subMenuDisplay: initSubMenuDisplay()
        });
    },
    animation: function (index) {
        var that = this;
        // 定义一个动画
        var animation = wx.createAnimation({
            duration: 1500,
            timingFunction: 'linear',
        })
        // 是显示还是隐藏
        var flag = that.data.subMenuDisplay[index] == 'show' ? 1 : -1;
        // 使之Y轴平移
        animation.translateY(flag * (initSubMenuHighLight[index].length)).step();
        // 导出到数据，绑定给view属性
        var animationStr = animation.export();
        // 原来的数据
        var animationData = that.data.animationData;
        animationData[index] = animationStr;
        that.setData({
            animationData: animationData
        });
    },
    hide: function (e) {
        var that = this;
        // console.log('隐藏菜单');
        // console.log(that.data.subMenuDisplay[0]);
        if (that.data.subMenuDisplay[0] == "show") {
            that.data.subMenuDisplay[0] = "hidden";
            that.setData({
                subMenuDisplay: that.data.subMenuDisplay
            });
            // console.log(that.data.subMenuDisplay[0]);
        }
    },
    time: function (total_micro_second) {
        var that = this;
        // 渲染倒计时时钟
        that.setData({
            clock: that.date_format(total_micro_second)
        });

        if (total_micro_second <= 0) {
            that.setData({
                clock: "订单已取消"
            });
            // timeout则跳出递归
            return;
        }
        // setTimeout(function () {
        //     // 放在最后--
        //     total_micro_second -= 10;
        //     // that.time(total_micro_second);
        // }, 10)
    },
    date_format: function (micro_second) {
        var that = this;
        // 秒数
        var second = Math.floor(micro_second / 1000);
        // 小时位
        var hr = Math.floor(second / 3600);
        // 分钟位
        var min = that.zero(Math.floor((second - hr * 3600) / 60));
        // 秒位
        var sec = that.zero((second - hr * 3600 - min * 60));//

        return min + ":" + sec;
    },
    zero: function (num) {// 位数不足补零
        return num < 10 ? "0" + num : num
    },
    getNowFormatDate: function () {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        currentdate = currentdate.replace(new RegExp("-", "gm"), "/");
        var timeHaoMiao = (new Date(currentdate)).getTime(); //得到毫秒数
        return timeHaoMiao;
    },
    goBinding: function () {
        var that = this;
        util.go("/pages/vkahui/phone-add/phone-add", {
            data: {
                resId: that.data.resId,
                consumerId: that.data.consumerId,
                tableCode: that.data.tableCode,
                tableName: that.data.tableName
            }
        });
    },
    getCode: function () {
        var that = this;
        apiService.getSmsCodeByConn(
            {
                resId: that.data.resId,
                consumerId: that.data.dingdan.consumerId,
                openId: app.globalData.openId,
                msgTemp: "SMS_XIAOFEICODE_CONTENT"
            },
            function (rsp) {
                that.setData({cookies: rsp.value});
                util.showToast('验证码已发送');
                that.data.clockCodeCountdown = new util.Countdown(60 * 1000, 'ss');
                that.data.clockCodeCountdown.countdown(that, 'clockCode');
            });
    },
    inputCodeText: function (e) {
        // console.log('输入的验证码');
        this.data.codeText = e.detail.value;
    },
    confirmCode: function (e) {
        if (!this.data.isCodeText) {
            return;
        }
        var that = this,
            code = e.detail.value.codeText,
            formId = e.detail.formId;
        let data = {
            code: code,
            openId: app.globalData.openId,
            msgTemp: "SMS_XIAOFEICODE_CONTENT"
        };
        if (!code || code.length === 0) {
            util.showToast('验证码不能为空');
            return;
        } else if (code.length < 6) {
            util.showToast('验证码少于6位');
            return;
        } else {
            that.data.isCodeText = false;
            apiService.checkSmsCodeByOpenId(data, function (res) {
                that.data.isCodeText = true;
                if (res.code == 2000) {
                    var data = {
                        openId: app.globalData.openId,
                        amount: that.data.orderFood.actualPrice,
                        consumerId: that.data.consumerId,
                        resId: that.data.resId,
                        code: code,
                        formId
                    };
                    apiService.memberCardPay(data,
                        function () {
                            app.globalData.clrCar = true;
                            util.showToast("会员卡支付成功");
                            // 发送模板消息
                            if (formId && 'the formId is a mock one' !== formId) {
                                apiService.sendMiniWxTemplateMsg({
                                    openId: app.globalData.openId,
                                    resId: that.data.resId,
                                    formId,
                                    consumerId: that.data.consumerId
                                });
                            }
                            setTimeout(() => {
                                util.go('/pages/order/order-detail/order-detail', {
                                    type: 'blank',
                                    data: {
                                        resId: that.data.resId,
                                        consumerId: that.data.consumerId,
                                        tableCode: that.data.tableCode,
                                        tableName: that.data.tableName,
                                        status: 5
                                    }
                                });
                            }, 2000)
                        },
                        function () {
                            util.showToast('会员卡支付失败');
                        }
                    );
                } else {
                    that.setData({codeText: ''});
                    util.showToast(res.message);
                }
            });
        }
    }
});




