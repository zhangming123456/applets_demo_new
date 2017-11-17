var appUtil = require('../../../utils/appUtil.js');
const apiService = require('../../../utils/ApiService');
const utilCommon = require('../../../utils/utilCommon');
var app = getApp();
Page({
    data: {
        wxInfo: {},
        meInfo: {},
        memberCardCount: 0,
        shouye: true,
        dingdan: false,
        wo: true,
        isBindMobile: false
    },
    onLoad: function (options) {
        var that = this,
            wxInfo = app.globalData.userInfo;
        that.setData({wxInfo});
    },
    onShow() {
        let that = this;
        app.checkBindMobile({openId: app.globalData.openId}, (res) => {
            if (res.returnStatus) {
                that.setData({isBindMobile: true});
            } else {
                that.setData({isBindMobile: false});
            }
        });
        apiService.getMemberCardList({openId: app.globalData.openId}, function (rsp) {
            if (rsp.returnStatus && rsp.value) {
                that.setData({memberCardCount: rsp.value.length});
            } else {
                that.setData({memberCardCount: 0});
            }
        });
    }
});