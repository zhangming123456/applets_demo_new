var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {},
    onLoad: function (options) {
        var that = this;
        that.setData({
            isWaimai: options.isWaimai
        });
    },
    onShow() {
        this.loadAddressList();
    },
    loadAddressList: function () {//查询会员收货地址
        var that = this;
        var addressData = [];
        var url = app.globalData.serverAddress + 'microcode/loadAddressList';
        var data = {openId: app.globalData.openId};
        appUtil.httpRequest(url, data, function (rsp) {
            console.log(rsp);
            if (rsp.returnStatus) {
                rsp.value.forEach(function (val, key) {
                    addressData.push(val);
                });
                that.setData({
                    addressData: addressData
                });
                addressData.forEach(function (val, key) {
                    if (val.defaultAddress) {
                        that.setData({
                            defaultAddress: val
                        });
                    }
                });
                if (addressData.length > 0) {
                    if (!that.data.defaultAddress.defaultAddress) {//如果没有默认地址，就默认第一个为默认地址
                        that.data.defaultAddress.defaultAddress = true;
                        that.setData({
                            defaultAddress: addressData[0]
                        });
                    }
                }
            } else {
                wx.showToast({
                    title: rsp.message,
                    duration: 2000
                });
            }
        });
    },
    changAddress: function (e) {
        var that = this;
        var addressId = e.currentTarget.dataset.id;
        that.data.addressData.forEach(function (val, key) {
            if (val.id == addressId) {
                var url = app.globalData.serverAddress + 'microcode/setDefaultAddress';
                var data = {openId: app.globalData.openId, addressId: addressId};
                appUtil.httpRequest(url, data, function (rsp) {
                    if (rsp.returnStatus) {
                        // console.log(rsp);
                        val.defaultAddress = true;
                        // console.log(val);
                        that.setData({
                            defaultAddress: val,
                        });
                        that.loadAddressList();
                    } else {
                        wx.showToast({
                            title: rsp.message,
                            duration: 2000
                        });
                    }
                });
            }
        });
    },
    modify: function (e) {
        var that = this;
        var address = e.currentTarget.dataset.modify;
        util.go('/pages/vkahui/address-edit/address-edit', {
            type: 'blank',
            data: {
                address: address.address,
                name: address.name,
                mobile: address.mobile,
                id: address.id,
                sex: address.sex,
                longitude: address.longitude,
                latitude: address.latitude,
                gaiAddress: 1,
                isWaimai: that.data.isWaimai
            }
        });
    },
    toWaimai: function (e) {
        var that = this;
        that.changAddress(e);
        util.go(-1);
    }
})