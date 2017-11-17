const app = getApp(),
    queryString = require('../../../utils/queryString'),
    util = require('../../../utils/util'),
    regExpUtil = require('../../../utils/RegExpUtil'),
    utilCommon = require('../../../utils/utilCommon'),
    apiService = require('../../../utils/ApiService');
import {utilPage_getQRcodeTable} from '../../../utils/utilPage';

const appPage = {
    data: {
        resId: '',
        JumpUrl: ''
    },
    onLoad: function (options) {
        this.data.resId = options.resId;
        new app.ToastPannel();
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};
const methods = {
    /**
     * 扫一扫
     */
    bindScanCode() {
        let _this = this;
        wx.scanCode({
            success: (data) => {
                let QR_codeTable = _this.utilPage_getQRcodeTable(data.result, this.data.resId);
                QR_codeTable.then(
                    (res) => {
                        if (res.status) {
                            apiService.checkHasWaitPayConsumer({
                                openId: app.globalData.openId,
                                tableCode: res.value.tableCode,
                                resId: this.data.resId,
                            }, (rsp) => {
                                if (rsp.code === '2000') {
                                    util.go('/pages/order/order-detail/order-detail', {
                                        type: 'blank',
                                        data: {
                                            tableCode: res.value.tableCode,
                                            resId: this.data.resId,
                                            consumerId: rsp.value.consumerId
                                        }
                                    });
                                } else if (rsp.code === '2001') {
                                    util.go('/pages/shop/order/order', {
                                        type: 'blank',
                                        data: {
                                            orderType: 0,
                                            resId: _this.data.resId,
                                            tableCode: res.value.tableCode,
                                            tableName: res.value.tableName
                                        }
                                    })
                                } else {
                                    util.showToast(rsp.message)
                                }
                            });
                        } else {
                            _this.showToast(res.message);
                        }
                    },
                    (res) => {
                        _this.showToast(res.message);
                    })
            }
        })
    },
    /**
     * 返回
     */
    bindGoBack() {
        util.go(-1);
    }
};
const events = {};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, {
    utilPage_getQRcodeTable,//获取二维码桌台
}));