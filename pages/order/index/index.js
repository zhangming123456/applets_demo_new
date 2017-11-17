const appUtil = require('../../../utils/appUtil.js'),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService'),
    app = getApp();
Page({
    data: {
        isShow: false,
        module: '',
        serverAddressImg: app.globalData.serverAddressImg,
        isFirst: true,
        isHide: false,
        orderList: [],
        shouye: true,
        dingdan: true,
        wo: false,
        hasMoreData: false,
        pageNum: 1,
        pageSize: 10,
        shopInfoList: {},//店铺信息列表
        statusStr: {
            3: '待支付',
            5: '已支付',
            4: '待支付',
            8: '已取消',
            11: '已接单',
            12: '已拒单'
        },
        statusBtn: {
            3: [
                // {
                //     class: 'azm-btn-red',
                //     name: '去支付',
                //     jumpType: 'pay',
                //     type: 100
                // },
                {
                    class: '',
                    name: '去加菜',
                    jumpType: 'addDish',
                    type: 0
                }
            ],
            11: [
                {
                    class: '',
                    name: '再来一单',
                    jumpType: 'addDish',
                    type: 100
                }
            ]
        }
    },
    onLoad: function (options) {
        var that = this;
        that.loadData();
    },
    onShow: function () {
        var that = this;
        if (!that.data.isHide) return;
        that.loadData();
    },
    onReady: function () {
        // 页面渲染完成
        this.setData({
            isShow: true
        })
    },
    onHide: function () {
        var that = this;
        that.setData({isHide: true});
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.data.pageNum = 1;
        this.loadData(function () {
            wx.stopPullDownRefresh();
        });
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (!that.data.hasMoreData) {
            that.data.pageNum++;
            that.loadData();
        }
    },
    loadData: function (cb) {
        var that = this;
        ApiService.getOrderList({
            "openId": app.globalData.openId,
            "pageNum": that.data.pageNum,
            "pageSize": that.data.pageSize
        }, function (rsp) {
            if (rsp.value.length < that.data.pageSize) {
                that.setData({hasMoreData: true})
            } else {
                that.setData({hasMoreData: false})
            }
            var orderList = rsp.value;
            var consumerStatus;
            orderList.forEach(function (val, key) {
                val.amount = val.amount.toFixed(2);
                that.data.shopInfoList[val.resId] = {
                    orderType: val.consumerType,
                    resId: val.resId
                }
            });
            // 循环获取订单列表中店铺信息
            // let item = that.data.shopInfoList;
            // for (let k in item) {
            //     if (item[k].flag) {
            //         getOrderType(item[k]);
            //     } else {
            //         ApiService.getResDetail({resId: item[k].resId}, (res) => {
            //             that.data.shopInfoList[res.value.resId] = res.value;
            //             that.data.shopInfoList[res.value.resId].flag = true;
            //             getOrderType(item[k]);
            //         })
            //     }
            // }
            if (that.data.pageNum == 1) {
                that.setData({orderList: orderList});
            } else {
                that.setData({orderList: that.data.orderList.concat(orderList)});
            }
            cb && cb();
        }, cb);

        /**
         * 设置店铺就餐模式
         * @param val
         */
        function getOrderType(val) {
            if (val.orderType == 2) {
                that.data.shopInfoList[val.resId].isOrderType = 1
            } else {
                that.data.shopInfoList[val.resId].isOrderType = this.getOrderType(that.data.shopInfoList[val.resId].restaurantBusinessRules).isOrderType;
            }
            that.setData({
                ['shopInfoList.' + val.resId]: that.data.shopInfoList[val.resId]
            });
        }
    },
    jumpBtn(e) {
        var type = e.currentTarget.dataset.type;
        this[type](e);
    },
    //去支付
    pay: function (e) {
        var value = e.currentTarget.dataset.value;
        util.go('/pages/order/order-pay/order-pay', {
            data: {
                resId: value.resId,
                consumerId: value.consumerId
            }
        });
    },
    //加菜
    addDish: function (e) {
        var value = e.currentTarget.dataset.value,
            orderType = 0;
        if (Number(value.consumerType) === 2) {
            orderType = 1;
        }
        util.go('/pages/shop/order/order', {
            data: {
                resId: value.resId,
                orderType,
                consumerId: value.consumerId,
                tableCode: value.tableCode,
                tableName: value.Title,
                fNumber: value.fNumber
            }
        });
    },
    /**
     * 跳转订单详情
     * @param e
     */
    goOrderDetail(e) {
        let value = e.currentTarget.dataset.value;
        util.go('/pages/order/order-detail/order-detail', {
            data: {
                resId: value.resId,
                consumerId: value.consumerId,
                tableCode: value.tableCode,
                tableName: value.tableName
            }
        })
    }
});