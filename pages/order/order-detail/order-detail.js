var appUtil = require('../../../utils/appUtil.js');
var util = require('../../../utils/util.js');
const apiService = require('../../../utils/ApiService'),
    queryString = require('../../../utils/queryString'),
    utilCommon = require('../../../utils/utilCommon'),
    app = getApp();

const ORDER_JSON = {
    "orderFoodList": [],
    "orderCreateTime": "",
    "name": "",
    "orderStatus": "",
    "id": ""
};

const appPage = {
    data: {
        module: '',
        isOrderType: 0,//0：堂食 1：自助取餐 2：外卖 3餐后付款
        serverAddressImg: app.globalData.serverAddressImg,
        progressBar: [
            {
                name: '待支付',
                status: true
            },
            {
                name: '订单完成',
                status: false
            }
        ],//进度条
        orderStatus: {
            name: '待支付',
            iconName: 'icon-time'
        },
        foodBtnList: [],
        countdownTime: null
    },
    onLoad: function (options) {
        var that = this;
        options.status = 1;
        that.setData(options);
        if (options.resId && options.resId.length > 0) {
            // 获取店铺信息
            apiService.getResDetail({resId: that.data.resId}, function (rsp) {
                that.setData({res: rsp.value});
                that.loadData();
            });
        }
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
        this.loadData(function () {
            wx.stopPullDownRefresh();
        });
    }
};
const methods = {
    loadData(cb) {
        var that = this;
        apiService.getOrderDetail({resId: that.data.resId, consumerId: that.data.consumerId}, function (rsp) {
            let orderDetailData = rsp.value, orderList = [];
            // orderDetailData.status = that.data.status || orderDetailData.status;
            orderDetailData.mealNumber = orderDetailData.consumerNo.substring(orderDetailData.consumerNo.length - 5);
            orderDetailData.totalPrice = util.money(orderDetailData.totalPrice);//总价
            orderDetailData.discountPrice = util.money(orderDetailData.discountPrice);//折扣
            orderDetailData.actualPrice = util.money(orderDetailData.actualPrice);//实付
            if (orderDetailData.orderJson && utilCommon.isString(orderDetailData.orderJson)) {
                orderDetailData.orderJson = JSON.parse(orderDetailData.orderJson);
                // if (!orderDetailData.orderJson.id) {
                //     setOrderJson();
                // }
            } else {
                // setOrderJson();
            }

            function setOrderJson() {
                let orderJson = {};
                util.extend(true, orderJson, ORDER_JSON);
                orderJson.createTime = orderDetailData.createTime;
                orderJson.orderStatus = orderDetailData.status;
                orderJson.name = '系统';
                orderJson.orderFoodList = orderDetailData.orderFoodDtoList;
                orderDetailData.orderJson = [];
                orderDetailData.orderJson.push(orderJson);
            }

            that.setProgressBar(orderDetailData);
            that.setData({orderDetailData, status: orderDetailData.status});
            cb && cb();
        });
    },
    /**
     * 设置精度条
     */
    setProgressBar(data) {
        if (!utilCommon.isNumberOfNaN(data.status)) {
            return;
        }
        let foodBtnList = [
                {
                    name: '再来一单',
                    color: 'red',
                    type: 2
                }
            ],
            res = this.data.res,
            isOrderType = 0;
        if (data.consumerType == 2) {
            isOrderType = 1;
        } else {
            isOrderType = this.getOrderType(res.restaurantBusinessRules).isOrderType;
        }

        if (isOrderType === 3) {
            foodBtnList = [];
        }

        let progressBar = this.data.progressBar,
            orderStatus = this.data.orderStatus;
        switch (data.status) {
            case 1:
                orderStatus = {
                    name: '待支付',
                    iconName: 'icon-time'
                };
                foodBtnList = [];
                if (isOrderType == 3) {
                    foodBtnList.push({
                        name: '买单',
                        color: 'red',
                        type: 3
                    });
                } else {
                    foodBtnList.push({
                        name: '去支付',
                        color: 'red',
                        type: 0
                    });
                }
                if (data.consumerType == 0 && !data.dinnerType) {
                    foodBtnList.push({
                        name: '加菜',
                        color: 'white',
                        type: 1
                    })
                }
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 2:
                orderStatus = {
                    name: '待支付',
                    iconName: 'icon-time'
                };
                foodBtnList = [];
                if (isOrderType == 3) {
                    foodBtnList.push({
                        name: '买单',
                        color: 'red',
                        type: 3
                    });
                } else {
                    foodBtnList.push({
                        name: '买单',
                        color: 'red',
                        type: 0
                    });
                }
                if (data.consumerType == 0 && !data.dinnerType) {
                    foodBtnList.push({
                        name: '加菜',
                        color: 'white',
                        type: 1
                    })
                }
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 3:
                orderStatus = {
                    name: '已支付',
                    iconName: 'icon-yiwancheng'
                };
                // if (Number(data.consumerType) === 1 || Number(data.consumerType) === 2) {
                //     orderStatusName = '等待接单';
                // }
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: true
                    }
                ];
                break;
            case 4:
                orderStatus = {
                    name: '已取消',
                    iconName: 'icon-roundclose'
                };
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 5:
                foodBtnList = [];
                orderStatus = {
                    name: '待支付',
                    iconName: 'icon-roundclose'
                };
                progressBar = [
                    {
                        name: '待支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: false
                    }
                ];
                break;
            case 11:
                orderStatus = {
                    name: '已接单',
                    iconName: 'icon-roundcheck'
                };
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: true
                    }
                ];
                break;
            case 12:
                orderStatus = {
                    name: '已拒单',
                    iconName: 'icon-roundclose'
                };
                progressBar = [
                    {
                        name: '已支付',
                        status: true
                    },
                    {
                        name: '订单完成',
                        status: true
                    }
                ];
                break;
        }

        if (isOrderType === 3) {
            progressBar[0].name = '用餐中';
        }

        this.setData({
            progressBar, orderStatus, foodBtnList, isOrderType
        });
    },
    goPay(e) {
        let type = e.currentTarget.dataset.type,
            that = this,
            orderDetailData = this.data.orderDetailData;
        switch (type) {
            case 0:
                util.go('/pages/order/order-pay/order-pay', {
                    data: {
                        resId: that.data.resId,
                        consumerId: that.data.consumerId
                    }
                });
                break;
            case 1:
                that.data.countdownTime && that.data.countdownTime.clear();
                util.go('/pages/shop/order/order', {
                    type: 'blank',
                    data: {
                        resId: that.data.resId,
                        consumerId: orderDetailData.consumerId,
                        tableCode: orderDetailData.tableCode,
                        fNumber: orderDetailData.fNumber || 1,
                        tableName: orderDetailData.title
                    }
                });
                break;
            case 2:
                let orderType = 0;
                if (orderDetailData.consumerType == 2) {
                    orderType = 1;
                }
                util.go('/pages/shop/order/order', {
                    data: {
                        resId: that.data.resId,
                        orderType
                    }
                });
                break;
            case 3://买单
                if (!!that.data.clock) {
                    wx.showModal({
                        title: '温馨提示',
                        content: '呼叫买单服务已成功,请' + that.data.clock + '后重试',
                        showCancel: false,
                        confirmText: '知道了',
                        success: function (rsp) {

                        }
                    });
                    return;
                }
                that.data.countdownTime && that.data.countdownTime.clear();
                let total_micro_second = 5 * 60 * 1000;
                that.data.countdownTime = new util.Countdown(total_micro_second, 'mm:ss');
                that.data.countdownTime.countdown(that, 'clock');
                apiService.callAttendant({
                    consumerId: orderDetailData.consumerId,
                    resId: that.data.resId
                }, function (res) {
                    if (res.code === '2000') {
                        wx.showModal({
                            title: '温馨提示',
                            content: '呼叫买单服务成功',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (rsp) {

                            }
                        });
                    } else {
                        failShowModal();
                    }
                }, failShowModal);

            function failShowModal() {
                that.data.countdownTime && that.data.countdownTime.clear();
                that.setData({
                    clock: null
                });
                wx.showModal({
                    title: '温馨提示',
                    content: '呼叫买单服务失败',
                    showCancel: false,
                    confirmText: '知道了',
                    success: function (rsp) {

                    }
                });
            }
        }
    },
    openModuleMeal: function () {
        this.setData({
            moduleMeal: 'moduleMeal'
        });
    },
    closeModuleMeal: function () {
        var that = this;
        that.setData({
            moduleMeal: ''
        });
    }
};
Page(Object.assign(appPage, methods));