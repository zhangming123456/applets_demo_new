const app = getApp(),
    appUtil = require('../../utils/appUtil.js'),
    util = require('../../utils/util.js'),
    utilCommon = require('../../utils/utilCommon'),
    apiService = require('../../utils/ApiService'),
    queryString = require('../../utils/queryString'),
    shopUrl = '/pages/shop/order/order';
Page({
    data: {
        hasMoreData: false,
        isShow: false,
        module: '',
        shouye: false,
        dingdan: false,
        wo: false,
        vkahuiData: []
    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast

        let _this = this;
        _this.setData(options);
        _this.login();
    },
    onShow: function (options) {
        console.log('进入init界面');
        if (!this.data.hasHide) return;
        this.setData({hasHide: false});
        if (app.globalData.isBindPhone) {
            this.setData({
                module: 'module'
            });
        }
        this.login();
    },
    onHide: function () {
        console.log('离开init界面');
        this.setData({hasHide: true});
    },
    onReady: function () {
        // 页面渲染完成
        this.setData({
            isShow: true
        })
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadCardList(function () {
            wx.stopPullDownRefresh();
        });
    },
    /**
     * 分享页面
     */
    onShareAppMessage: function () {
        let _this = this;
        return {
            title: 'V卡汇',
            path: '/pages/init/init',
            success: function (res) {
                _this.showToast('分享成功');
            },
            fail: function (res) {
                _this.showToast('分享失败');
            }
        }
    },
    login() {
        let _this = this,
            rid = _this.data.q,
            flag = false;
        if (rid && rid.length > 0) {
            flag = true;
        }

        /**
         * 登入
         */
        app.getLoginRequestPromise().then((res) => {
            let openId = app.globalData.openId;
            if (!openId) {
                console.log('init登入openId', openId);
                app.requestLogin().then(function () {
                    setUserInfo();
                }, function () {
                    console.log('code', res);
                });
            } else {
                setUserInfo();
            }
        });

        function setUserInfo() {
            _this.loadCardList();//加载会员卡列表
            let QRcodeTable = _this.getQRcodeTable(rid, true);
            if (!flag) {
                return;
            }
            _this.data.q = null;
            QRcodeTable.then((res) => {
                if (res.status) {
                    _this.initiaLogin(res.value);
                } else {
                    _this.showToast(res.message);
                }
            }, (rsp) => {
                _this.showToast(rsp.message);
            })
        }
    },
    initiaLogin(options) {
        let _this = this,
            data = {
                openId: app.globalData.openId,
                resId: options.resId
            };
        let userInfo = app.globalData.userInfo;
        if (userInfo && !utilCommon.isEmptyObject(userInfo)) {
            Object.assign(data, {
                nikeName: app.globalData.userInfo.nickName,
                sex: app.globalData.userInfo.gender,
                headImgUrl: app.globalData.userInfo.avatarUrl,
            })
        }
        if (!options.resId || options.resId.length === 0) return;
        app.checkIsFirstUse(data, function (rsp) {
            if (rsp.code == 2000 || rsp.code == 4003) {
                wx.showModal({
                    title: '温馨提示',
                    content: '您是首次登陆，如果您已经注册过商家会员，请绑定手机号，系统将自动匹配您的信息。',
                    cancelText: '直接使用',
                    confirmText: '绑定手机',
                    confirmColor: '#f74b7b',
                    success: function (res) {
                        if (res.confirm) {
                            _this.phone(options);
                        } else if (res.cancel) {
                            go();
                        }
                    }
                });
            } else if (rsp.code == 4000) {
                go();
            } else {
                util.showToast(rsp.message);
            }

            function go() {
                if (options.resId && options.type == 0) {
                    util.go(shopUrl, {
                        data: {
                            resId: options.resId,
                            tableCode: options.tableCode,
                            tableName: options.tableName,
                            orderType: 0
                        }
                    });
                } else if (options.resId && options.type == 1) {
                    let url = '/pages/shop/home/home';
                    util.go(url, {
                        data: {
                            resId: options.resId
                        }
                    });
                }
            }
        });
    },
    /**
     * 加载会员拉列表
     */
    loadCardList: function (cb) {
        let that = this;

        function setMemberCardList(value) {
            var vkahuiData = value;
            //折扣百分比转化
            vkahuiData.forEach(function (val, key) {
                //百分比
                if (val.memberTypeDiscount == undefined || val.memberTypeDiscount == 0 || val.memberTypeDiscount == null) {
                    vkahuiData[key].memberTypeDiscount = 0;
                } else {
                    vkahuiData[key].memberTypeDiscount = val.memberTypeDiscount / 10;
                }
                vkahuiData[key].memberBalance = parseFloat(vkahuiData[key].memberBalance).toFixed(2);
                //店铺Logo
                val.resLogo = app.globalData.serverAddressImg + val.resLogo;
                const ctx = wx.createCanvasContext(vkahuiData[key].resId);
                var i = 0;
                while (i < 375) {
                    ctx.arc(6 + i, 5, 3, 0, 2 * Math.PI);
                    ctx.setFillStyle('#ffffff');
                    ctx.fill();
                    i += 14;
                }
                ctx.draw();
                if (val.resId == that.data.resId) {
                    val.tableCode = app.globalData.tableCode;
                    val.tableName = app.globalData.tableName;
                }
            });
            that.setData({
                vkahuiData
            });
        };
        apiService.getMemberCardList(
            {
                openId: app.globalData.openId
            },
            (rsp) => {
                for (let i = 0; i < rsp.value; i++) {
                    let memberCardDto = rsp.value[i];
                    memberCardDto.memberTypeDiscount = util.moneyToFloat(memberCardDto.memberTypeDiscount);
                    memberCardDto.memberBalance = util.moneyToFloat(memberCardDto.memberBalance);
                    memberCardDto.memberIntegral = util.moneyToFloat(memberCardDto.memberIntegral);
                    app.globalData.memberCardDtoObj[rsp.value[i][that.data.resId]] = memberCardDto;
                }
                setMemberCardList(rsp.value);
                cb && cb();
                that.setData({
                    hasMoreData: true
                })
            },
            () => {
                that.setData({
                    vkahuiData: []
                });
                cb && cb();
                that.setData({
                    hasMoreData: true
                })
            })
    },
    tab: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        if (id == "dingdan") {
            that.setData({
                shouye: true,
                dingdan: true,
                wo: false
            });
            wx.redirectTo({
                url: '/pages/order/index/index',
            });
        } else if (id == "wo") {
            that.setData({
                shouye: true,
                dingdan: false,
                wo: true
            });
            wx.redirectTo({
                url: '/pages/vkahui/me/me',
            });
        }
    },
    /**
     * 提示绑定手机部分
     * @param res
     */
    module: function (res) {
        var that = this;
        // console.log(res);
        that.setData({
            module: 'moduleActive'
        });
    },
    close: function (res) {
        //点击直接使用，跳转到点餐业
        var that = this;
        var options = that.data;
        // that.uploadWechatUser(options);
        that.loadCardList();
        that.setData({
            module: ''
        });
        if (that.data.resId) {
            wx.navigateTo({
                url: shopUrl + "?resId=" + options.resId + "&tableCode=" + options.tableCode + "&tableName=" + options.tableName,
                success(res) {

                }
            })
        }
    },
    phone: function (data) {
        var that = this, url;
        if (data.resId && data.resId.length > 0) {
            var shopHomeUrl = '/pages/shop/home/home',
                stringify = queryString.stringify({
                    resId: data.resId
                });
            url = encodeURIComponent(shopHomeUrl + "?" + stringify);
            if (data.tableCode && data.tableCode.length > 0) {
                stringify = queryString.stringify({
                    resId: data.resId,
                    tableCode: data.tableCode,
                    tableName: data.tableName
                });
                url = encodeURIComponent(shopUrl + "?" + stringify);
            }
        }
        util.go('/pages/vkahui/phone-add/phone-add', {
            data: {
                resId: data.resId,
                tableCode: data.tableCode,
                tableName: data.tableName,
                jumpUrl: url
            }
        });
        that.setData({
            module: ''
        });
    },
});