const config = require('./utils/config'),
    utilPage = require('./utils/utilPage'),
    authorize = require('./utils/authorize');
import {ToastPannel} from './template/toast/toast';//加载toast模板
App({
    globalData: {
        isShow: false,
        openId: null,
        token: null,
        userInfo: {},
        loginRequestPromise: null,//登入请求
        shopCarts: {},//本地购物车
        memberCardDtos: {},//会员卡信息
        resDetailDtos: {},//店铺信息
    },
    utilPage,
    ToastPannel,
    /**
     * 生命周期函数--监听小程序初始化
     * @param options
     */
    onLaunch: function () {
        console.warn('版本号：' + config.version);
    },
    /**
     * 生命周期函数--监听小程序显示
     * @param options
     */
    onShow: function (options) {
        let that = this;
        this.globalData.isShow = true;
        console.log(options, '______________App_options_____________');
        console.log(this.globalData, '___________App_isCurrentApp_________');
        if (!that.globalData.openId) {
            try {
                console.log(this.globalData.loginRequestPromise, '进入_____________________________________loginRequestPromise');
                that.setLoginRequestPromise();
                that.getShopCartsStorage();
            } catch (err) {
                console.warn('App onShow方法报错', err);
            }
        }
    },
    /**
     * 生命周期函数--监听小程序隐藏
     * @param options
     */
    onHide: function (options) {
        this.globalData.isShow = false;
        // console.warn('监听小程序隐藏', options);
    },
    /**
     * 错误监听函数
     * @param msg
     */
    onError: function (msg) {
        // console.warn('错误监听函数', msg);
    },
    getShopCartsStorage() {
        let that = this;
        try {
            let shopCartsStorage = wx.getStorageSync('shopCarts'),
                serverAddress = wx.getStorageSync('serverAddress'),
                time = wx.getStorageSync('shopCartsTimeStamp'),
                flag1 = shopCartsStorage && serverAddress && serverAddress === config.host,
                flag2 = +new Date() - time <= (60 * 1000);
            if (true) {
                // that.globalData.shopCarts = JSON.parse(shopCartsStorage);
                that.globalData.shopCarts = {};
            } else {
                wx.setStorageSync('serverAddress', config.host);
                that.setShopCartsStorage();
            }
        } catch (err) {
            console.warn('App getShopCartsStorage方法报错', err);
        }
    },
    setShopCartsStorage() {
        let _this = this;
        wx.setStorageSync('shopCartsTimeStamp', new Date().getTime());
        wx.setStorageSync('shopCarts', JSON.stringify(_this.globalData.shopCarts));
    },


    setLoginRequestPromise() {
        let _this = this;
        let loginRequestPromise = new Promise(function (resolve, reject) {
            _this.getOpenIdLogin().then(
                (rsp) => {
                    if (2000 == rsp.code) {
                        /**
                         * 获取用户信息
                         */
                        _this.getUserInfo(() => {
                            resolve(rsp);
                        });
                    } else {
                        reject()
                    }
                },
                () => {
                    reject()
                });
        });
        _this.globalData.loginRequestPromise = loginRequestPromise;
        return loginRequestPromise;
    },
    getLoginRequestPromise() {
        return this.globalData.loginRequestPromise;
    },
    getToken() {
        console.log('获取的token：', this.globalData.token);
        return this.globalData.token;
    },
    /**
     * 获取用户信息
     * @param cb
     */
    getUserInfo(resolve) {
        let _this = this;
        wx.checkSession({
            success: function (rsp) {
                getUserInfo()
            },
            fail: function (rsp) {
                //登录态过期
                wx.login({
                    success() {
                        getUserInfo();
                    }
                })
            }
        });

        function getUserInfo() {
            wx.getUserInfo({
                success: function (rsp) {
                    _this.globalData.userInfo = rsp.userInfo;
                    resolve();
                },
                fail(rsp) {
                    if ('userInfo' !== wx.getStorageSync('isOpenAuthorizeUserInfo')) {
                        authorize.userInfo(true)
                            .then(
                                getUserInfo,
                                () => {
                                    wx.showModal({
                                        title: '温馨提示',
                                        content: '请打开微信用户权限，避免获取用户信息失败导致应用操作问题',
                                        confirmText: '不再提醒',
                                        cancelText: '知道了',
                                        cancelColor: '#f74b7b',
                                        success: function (rsp) {
                                            if (rsp.confirm) {
                                                wx.setStorageSync('isOpenAuthorizeUserInfo', 'userInfo');
                                            } else if (rsp.cancel) {

                                            }
                                            resolve();
                                        }
                                    });
                                });
                    } else {
                        resolve();
                    }
                }
            })
        }
    },
    /**
     * 请求登入
     * @param cb
     */
    getOpenIdLogin() {
        let _this = this;
        return new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    console.log('保存code', res);
                    const apiService = require('./utils/ApiService');
                    wx.setStorageSync('code', res.code);
                    let openId = wx.getStorageSync('openId');
                    apiService.getOpenId(
                        {
                            jsCode: res.code,
                            openId
                        },
                        (rsp) => {
                            console.warn('获取openId', rsp.value.openId);
                            _this.globalData.openId = rsp.value.openId;
                            _this.globalData.token = rsp.value.token;
                            wx.setStorageSync('openId', rsp.value.openId);
                            wx.setStorageSync('token', rsp.value.token);
                            resolve(rsp);
                        },
                        () => {
                            reject()
                        });
                },
                fail() {
                    reject();
                }
            });
        });
    }
});