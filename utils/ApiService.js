let config = require('./config');
import {HttpRequest} from './httpRequest';

const $http = new HttpRequest();
module.exports = {
    url: config.host,
    token: null,
    api: {
        /**
         * 获取openid  API
         */
        getOpenId: {
            path: '/microcode/getOpenId',
            query: {}
        },
        /**
         * 获取会员拉列表  API
         */
        getMemberCardList: {
            path: '/microcode/getMemberCardList',
            query: {}
        },
        /**
         * 二维码获取列表
         */
        getQRcodeTable: {
            path: '/qrtable/getQRcodeTable',
            query: {}
        },
        /**
         * 新增用户会员列表
         */
        checkIsFirstUse: {
            path: '/microcode/checkIsFirstUse',
            query: {}
        },
        /**
         * 获取是否绑定手机号
         */
        checkBindMobile: {
            path: '/microcode/checkBindMobile',
            query: {}
        },
        checkMemberBindMobile: {
            path: '/microcode/checkMemberBindMobile',
            query: {}
        },
        /**
         * 获取菜品列表
         */
        getFoodList: {
            path: '/food/getFoodList',
            query: {}
        },
        /**
         * 获取菜品tab分类
         */
        findFoodCatalogList: {
            path: '/foodCatalog/findFoodCatalogList  ',
            query: {}
        },
        /**
         * 获取规格列表
         */
        getFoodRuleList: {
            path: '/foodRule/getFoodRuleList',
            query: {}
        },
        /**
         * 获取套餐子菜列表
         */
        findFoodPackage: {
            path: '/foodPackage/findFoodPackage',
            query: {}
        },
        /**
         * 获取口味列表
         */
        getFoodPracticesList: {
            path: '/foodPractices/getFoodPracticesList',
            query: {}
        },
        /**
         * 获取点餐店铺列表
         */
        getResDetail: {
            path: '/microcode/getResDetail',
            query: {}
        },
        /**
         * 绑定手机
         */
        bindWechatUser: {
            path: '/microcode/bindWechatUser',
            query: {}
        },
        /**
         * 获取收货地址
         */
        loadDefaultAddress: {
            path: '/microcode/loadDefaultAddress',
            query: {}
        },
        /**
         * 获取店铺首页信息
         */
        getMainInfo: {
            path: '/microcode/getMainInfo',
            query: {}
        },
        /**
         * 获取店铺banner
         */
        getCommonBannerList: {
            path: '/banner/getCommonBannerList ',
            query: {}
        },
        /**
         * 获取桌位列表
         */
        findTableDtoList: {
            path: '/table/findTableDtoList',
            query: {}
        },
        /**
         * 提交订单
         */
        commitOrder: {
            path: '/microcode/commitOrder',
            query: {}
        },
        /**
         * 获取订单详情
         */
        getOrderDetail: {
            path: '/microcode/getOrderDetail',
            query: {}
        },
        /**
         * 检查是否存在未结账的消费者
         */
        checkHasWaitPayConsumer: {
            path: '/microcode/checkHasWaitPayConsumer',
            query: {}
        },
        /**
         * 验证会员卡支付验证码
         */
        checkSmsCodeByOpenId: {
            path: '/sms/checkSmsCodeByOpenId',
            query: {}
        },
        /**
         * 会员卡支付
         */
        memberCardPay: {
            path: '/microcode/memberCardPay',
            query: {}
        },
        /**
         * 获取验证码
         */
        getSmsCode: {
            path: '/sms/getSmsCode',
            query: {}
        },
        /**
         * 支付获取验证码
         */
        getSmsCodeByConn: {
            path: '/sms/getSmsCodeByConn',
            query: {}
        },
        /**
         * 获取订单列表
         */
        getOrderList: {
            path: '/microcode/getOrderList',
            query: {}
        },
        /**
         * 微信支付
         */
        finishPay: {
            path: '/microcode/finishPay',
            query: {}
        },
        /**
         * 微信支付接口
         */
        wxPayForH5: {
            path: '/wxpay/wxPayForH5',
            query: {}
        },
        /**
         * 修改收货地址
         */
        updateConsigneeAddress: {
            path: '/consigneeAddress/updateConsigneeAddress',
            query: {}
        },
        /**
         * 新增地址
         */
        addAddress: {
            path: '/microcode/addAddress',
            query: {}
        },
        /**
         * 设置默认地址
         */
        setDefaultAddress: {
            path: '/microcode/setDefaultAddress',
            query: {}
        },
        /**
         * 买单叫号
         */
        callAttendant: {
            path: '/microcode/callAttendant',
            query: {}
        },
        /**
         * 消息模板通知
         */
        sendMiniWxTemplateMsg: {
            path: '/wechatTemplateMsg/sendTemplateMsgForMini',
            query: {},
            templateIds: {
                OrderPaySuccess: 'TF3BoYwKtKDEuwhNt5tkcRmRs9DcdM5-8mIu72xYvUc'
            }
        },
    },
    getToken() {
        const app = getApp();
        if (this.token && this.token.length > 0) {
            return this.token;
        } else {
            return app.getToken();
        }
    },
    /**
     * 添加会员卡
     * @param data
     * @param cb
     * @returns {*}
     */
    checkIsFirstUse(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.checkIsFirstUse.path;
        data.token = this.getToken();
        data.sex = data.sex || 0;
        data.nikeName = data.nikeName || '微信用戶';
        // console.log('checkIsFirstUse接口调用', data, url);
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    checkBindMobile(data, cb, reject) {
        var isReturnStatus = true;
        const url = this.url + this.api.checkBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    checkMemberBindMobile(data, cb, reject) {
        var isReturnStatus = true;
        const url = this.url + this.api.checkMemberBindMobile.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 检查是否存在未结账的消费者
     */
    checkHasWaitPayConsumer(data, cb, reject) {
        var isReturnStatus = true;
        const url = this.url + this.api.checkHasWaitPayConsumer.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 验证会员卡支付验证码
     */
    checkSmsCodeByOpenId(data, cb, reject) {
        var isReturnStatus = true;
        const url = this.url + this.api.checkSmsCodeByOpenId.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取openid
     * @param data
     * @param cb
     */
    getOpenId(data, cb, isReturnStatus, reject) {
        const url = `${this.url}${this.api.getOpenId.path}`;
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取会员拉列表
     * @param data
     * @param cb
     */
    getMemberCardList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getMemberCardList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 查询二维码
     * @param data
     * @param cb
     * @returns {*}
     */
    getQRcodeTable(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getQRcodeTable.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取菜品列表
     * @param data
     * @param cb
     * @returns {*}
     */
    getFoodList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取菜品tab分类
     * @param data
     * @param cb
     * @returns {*}
     */
    findFoodCatalogList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findFoodCatalogList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取规格列表
     */
    getFoodRuleList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodRuleList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取套餐子菜列表
     */
    findFoodPackage(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findFoodPackage.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            if (res.value) {
                res.value = JSON.parse(res.value);
            }
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取口味与做法列表
     */
    getFoodPracticesList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getFoodPracticesList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取点餐店铺列表
     */
    getResDetail(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getResDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取点餐店铺列表
     */
    bindWechatUser(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.bindWechatUser.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取收货地址
     */
    loadDefaultAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.loadDefaultAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取店铺首页信息
     */
    getMainInfo(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getMainInfo.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取店铺banner
     */
    getCommonBannerList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getCommonBannerList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取桌位列表
     */
    findTableDtoList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.findTableDtoList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 提交订单
     */
    commitOrder(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.commitOrder.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取订单详情
     */
    getOrderDetail(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getOrderDetail.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 会员卡支付
     */
    memberCardPay(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.memberCardPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取验证码
     */
    getSmsCode(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getSmsCode.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 支付获取验证码
     */
    getSmsCodeByConn(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getSmsCodeByConn.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 获取订单列表
     */
    getOrderList(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.getOrderList.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 微信支付
     */
    finishPay(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.finishPay.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 微信支付接口
     */
    wxPayForH5(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.wxPayForH5.path;
        data.token = this.getToken();
        const http = $http.get(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 修改收货地址
     */
    updateConsigneeAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.updateConsigneeAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 新增地址
     */
    addAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.addAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 设置默认地址
     */
    setDefaultAddress(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.setDefaultAddress.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 买单叫号
     */
    callAttendant(data, cb, isReturnStatus, reject) {
        const url = this.url + this.api.callAttendant.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {

            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
    /**
     * 消息模板通知
     */
    sendMiniWxTemplateMsg(data, cb, reject) {
        let isReturnStatus = true;
        const url = this.url + this.api.sendMiniWxTemplateMsg.path;
        data.token = this.getToken();
        const http = $http.post(url, data, (res) => {
            cb && cb(res);
        }, isReturnStatus, reject);
        return http;
    },
};