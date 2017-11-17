const app = getApp(),
    config = require('../../utils/config'),
    util = require('../../utils/util'),
    utilCommon = require('../../utils/utilCommon'),
    ApiService = require('../../utils/ApiService');

const appPage = {
    data: {
        text: "Page init",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        imageServer: config.imageUrl,//图片服务器地址
        options: {},
        memberCardList: [],//会员卡列表

    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        let that = this;
        try {
            if (options) {
                Object.assign(that.data.options, options);
                console.warn(`初始化${that.data.text}`, options);
            } else {
                throw {message: '初始化options为空'};
            }
        } catch (e) {
            console.warn(e, options);
        }
        that.loadCb();
    },
    /**
     * 进入页面
     */
    onShow: function (options) {
        console.warn(`进入${this.data.text}`, options);
    },
    /**
     * 离开页面
     */
    onHide: function () {
        console.warn(`离开${this.data.text}`);
    },
    /**
     * 页面渲染完成
     */
    onReady: function () {
        this.data.isShow = true;
        console.warn(`渲染完成${this.data.text}`);
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getMemberCardList().then(() => {
            setTimeout(() => {
                wx.stopPullDownRefresh();
            }, 1000);
        });
    },
};
/**
 * 方法类
 */
const methods = {
    loadCb() {
        let _this = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    _this.data.openId = rsp.value.openId;
                    _this.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    _this.getMemberCardList();//加载会员卡列表
                } else {
                    console.warn('获取openid失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        )
    },
    getMemberCardList() {
        let _this = this;
        return new Promise((resolve, reject) => {
            ApiService.getMemberCardList(
                {
                    openId: _this.data.openId
                },
                (rsp) => {
                    if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        _this.setData({memberCardList: rsp.value});
                    } else {
                        // _this.showToast(rsp.message);
                    }
                },
                (err) => {
                    if (err.status) {

                    }
                    _this.setData({hasMoreData: true});
                    resolve();
                }
            )
        })
    }
};

const events = {
    dd() {

    }
};

Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));