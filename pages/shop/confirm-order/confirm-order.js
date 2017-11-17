const appUtil = require('../../../utils/appUtil.js'),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon'),
    utilPage = require('../../../utils/utilPage'),
    apiService = require('../../../utils/ApiService'),
    queryString = require('../../../utils/queryString'),
    app = getApp();
const appPage = {
    data: {
        text: '确认订单',
        isShow: false,//进入初始是否刷新数据
        isShareCurrentPage: false,//是否分享首页
        isOrderType: 0,//0：堂食 1：自助取餐 2：外卖 3餐后付款
        isSubmitOrder: true,//是否提交订单
        imageServer: app.globalData.serverAddressImg,//图片服务器地址
        orderType: 0,//0：堂食  1：外卖
        orderList: ['hall', 'takeaway'],//hall：堂食  takeaway：外卖,
        shopCarts: [],//购物车信息
        usersubarea: 0,
        usersubareaCon: 0,
        fancyboxActive: '',
        consumerData: '',
        amount: '',
        count: '',
        tableDtoList: {},//获取的桌台List信息
        hasConsumerId: false,//是否有订单
        hasTableCode: false,//是否带桌台
        note: "",//备注信息
        otherList: [],//其他费用（点餐页显示）
        totalPrice: 0,//总金额
        discountTotalPrice: 0,//折后总价
        offerPrice: 0,//已优惠金额
        discountPrice: 0,//折扣后价钱
        otherFees: {//其他费用（非点餐页显示）
            name: '',
            counts: 0,
            price: 0,
            totalPrice: 0
        },
        diningNumber: 1,//就餐人数
        userOrderInfo: {//桌台信息
            tableCode: '',
            name: '请选择桌台',
            consumerId: null,
            fNumber: 1,
            status: 0
        },
        //外卖
        loadDefault: null,
        DefaultAddress: false,
    },
    onLoad: function (options) {
        let _this = this,
            openId = app.globalData.openId,
            token = app.globalData.token,
            resId = options.resId,
            orderList = this.data.orderList,
            orderType = Number(options.orderType),
            shopCartsInfo = app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'],
            shopCart = shopCartsInfo.list,
            totalPrice = shopCartsInfo.totalPrice,
            offerPrice = shopCartsInfo.offerPrice,
            discountTotalPrice = shopCartsInfo.discountTotalPrice,
            otherList = shopCartsInfo.otherList,
            userOrderInfo = app.globalData.userOrderInfo || {};
        apiService.token = token;
        _this.setData({
            openId,
            token,
            resId,
            orderType,
            shopCart,
            shopCartsInfo,
            totalPrice,
            discountTotalPrice,
            offerPrice,
            otherList
        });
        /**
         * 设置就餐方式
         * @type {number}
         * @isOrderType {number} 0：堂食 1：外卖, 2：自助取餐 3:餐后付款
         */
        this.setOrderType(shopCartsInfo.info);
        let isOrderType = this.data.isOrderType;
        if (isOrderType == 1) {
            _this.setLoadDefaultAddress();
        } else if (isOrderType == 0 || isOrderType == 3) {
            // _this.setNavigationBarTitle('堂食 - ' + _this.data.text);
            //判断有桌子就显示桌子，没桌子就手动填入桌子号
            if (userOrderInfo.tableCode && userOrderInfo.tableCode.length > 0) {
                let diningNumber = userOrderInfo.fNumber || 1;
                userOrderInfo.name && userOrderInfo.name.length && (userOrderInfo.name = decodeURIComponent(userOrderInfo.name));
                _this.setData({
                    userOrderInfo,
                    diningNumber,
                    hasTableCode: true,
                    hasConsumerId: userOrderInfo.consumerId ? true : false
                });
            }
        }
        /**
         * 设置购物车数据
         */
        let memberCardDto = app.globalData.memberCardDtoObj[resId];
        this.setResDetail(() => {
            // 全局数据获取  购物车 购物车总价、总数
            _this.setData({
                consumerData: shopCartsInfo.list,
                amount: shopCartsInfo.amount,
                count: shopCartsInfo.counts,
                discount: utilCommon.isNumberOfNaN(memberCardDto.memberTypeDiscount) ? Number(memberCardDto.memberTypeDiscount) / 10 : 0,//优惠折扣
            });
        });
    },
    /**
     * 页面渲染完成
     */
    onReady: function () {
        this.setData({
            isShow: true
        });
    },
    /**
     * 页面显示
     * @param options 为页面跳转所带来的参数
     */
    onShow(options) {
        if (this.data.isShow && this.data.orderType == 1) {
            this.setLoadDefaultAddress();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};
// 方法类
const methods = {
    toString(str) {
        return str.toString(2);
    },
    tagChoose: function (e) {//做法选择
        var that = this
        var type = e.target.dataset.practies;
    },
    bindChange: function (e) {
        var that = this;
        that.setData({note: e.detail.value})
        //inputContent[e.currentTarget.id] = e.detail.value;
    },
    clearShopCart() {
        let resId = this.data.resId,
            orderList = this.data.orderList,
            orderType = this.data.orderType;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].list = [];
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].totalPrice = 0;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].counts = 0;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].amount = 0;
        app.setShopCartsStorage();
    },
    tableBox: function () {
        if (this.data.hasTableCode) {
            return;
        }
        let _this = this,
            resId = this.data.resId,
            tableCode = this.data.userOrderInfo.tableCode,
            tableDtoList = this.data.tableDtoList,
            obj = {
                isLoading: false,
                title: '选择桌台',
                data: {},
                footer: [],
                tableContent: 'table-content',
            };
        _this.setData({
            ShopOneData: obj
        });

        for (let i = 0; i < tableDtoList.length; i++) {
            tableDtoList[i].checked = false;
        }

        function setData(data) {
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].tableList.length; j++) {
                    let list = data[i].tableList;
                    if (list[j].tableCode === tableCode) {
                        data[i].checked = true;
                        return {
                            data,
                            index: i
                        };
                    }
                }
            }
        }

        if (tableCode && tableCode.length > 0) {
            let value = setData(tableDtoList);
            obj.data.list = value.data;
            obj.data.tableList = value.data[value.index].tableList;
            obj.data.index = value.index;
        } else {
            obj.data.list = tableDtoList;
            obj.data.list[0].checked = true;
            obj.data.tableList = tableDtoList[0].tableList;
            obj.data.index = 0;
        }
        obj.isLoading = true;
        _this.setData({
            ShopOneData: obj
        });
        _this.openModule('moduleActiveMe');
    },
    modulePopup(e) {
        // let active = e.target.dataset.active,
        //     _this = this;
        // if (!active)
        //     return;
        // if (active === 'close') {
        //     // 关闭弹窗
        //     _this.closeModule('moduleActiveMe');//规格弹框
        // } else if (active === 'buttonItem subarea') {
        //     _this.subarea(e);
        // } else if (active === 'buttonItem subareaItem') {
        //     _this.subareaItem(e);
        // }
    },
    subarea: function (e) {
        var that = this,
            tableDtoList = this.data.tableDtoList,
            ShopOneData = this.data.ShopOneData,
            index = e.currentTarget.dataset.index,
            value = e.currentTarget.dataset.value;
        for (let i = 0; i < tableDtoList.length; i++) {
            tableDtoList[i].checked = false;
        }
        ShopOneData.data.list = tableDtoList;
        ShopOneData.data.list[index].checked = true;
        ShopOneData.data.tableList = tableDtoList[index].tableList;
        ShopOneData.data.index = index;
        this.setData({
            ShopOneData
        })
    },
    subareaItem: function (e) {
        let userOrderInfo = this.data.userOrderInfo,
            ShopOneData = this.data.ShopOneData,
            index = e.currentTarget.dataset.index,
            tableDtoList = this.data.tableDtoList;
        let value = e.currentTarget.dataset.value;
        userOrderInfo.tableCode = value.tableCode;
        userOrderInfo.name = value.name;
        this.setData({
            ShopOneData, userOrderInfo
        });
        this.closeModule('moduleActiveMe');//规格弹框
    },
    /**
     * 设置人数
     * @param res
     */
    numberAdd: function (res) {
        let _this = this,
            number = Number(res.currentTarget.dataset.number) || 0;
        if (this.data.hasConsumerId) {
            return;
        }
        _this.data.diningNumber += number;
        if (_this.data.diningNumber <= 0) {
            _this.data.diningNumber = 1;
        }
        _this.updatePrice();
    },
    /**
     * 更新其他费用
     */
    updatePrice() {
        let _this = this,
            diningNumber = this.data.diningNumber,
            otherList = this.data.otherList,
            price = 0;
        _this.data.otherFees.counts = diningNumber;
        // 其他费用（非点餐页显示）
        if (this.data.orderType == 1) {
            diningNumber = 0;
        } else {
            _this.data.otherFees.totalPrice = util.money(_this.data.otherFees.price * _this.data.otherFees.counts) || 0;
        }
        let totalPrice = Number(_this.data.discountTotalPrice) + Number(_this.data.otherFees.totalPrice) + price;

        // 其他费用（点餐页显示）
        if (this.data.otherList && this.data.otherList.length > 0) {
            let otherListPrice = 0,
                len = this.data.otherList.length;
            for (let i = 0; i < len; i++) {
                otherListPrice += Number(this.data.otherList[i].price) || 0;
            }
            totalPrice += otherListPrice;
        }

        if (this.data.hasConsumerId) {
            totalPrice = Number(_this.data.discountTotalPrice);
        }
        this.setData({
            ['otherFees.counts']: diningNumber,
            diningNumber,
            totalPrice: util.money(totalPrice),
        });
    },
    /**
     * 获取座位信息
     */
    getTableDtoList() {
        let _this = this, resId = this.data.resId;
        apiService.findTableDtoList({resId: resId}, function (rsp) {
            if (rsp.returnStatus) {
                let tableDtoList = rsp.value;
                _this.setData({
                    tableDtoList
                })
            }
        });
    },
    /**
     * 确认订单
     * @param res
     */
    submitOrder: function (e) {
        if (!this.data.isSubmitOrder) {
            return;
        }
        let that = this,
            orderType = that.data.orderType,
            formId = e.detail.formId,
            consumerData = that.data.consumerData,
            consumerDataList = [],
            info = this.data.shopCartsInfo.info,
            data = {
                resId: that.data.resId,
                openId: that.data.openId,
            };
        for (let i = 0; i < consumerData.length; i++) {
            consumerDataList[i] = {};
            consumerDataList[i].foodCount = consumerData[i].info.counts;
            consumerDataList[i].foodCode = consumerData[i].foodCode;
            consumerDataList[i].isdiscount = consumerData[i].isdiscount;
            consumerDataList[i].ruleCode = consumerData[i].ruleCode;
            consumerDataList[i].foodType = consumerData[i].foodType;
            consumerDataList[i].practies = [];
            if (consumerData[i].practices && consumerData[i].practices.length > 0) {
                for (let j = 0; j < consumerData[i].practices.length; j++) {
                    if (consumerData[i].practices[j] && consumerData[i].practices[j].length > 0) {
                        consumerDataList[i].practies.push(consumerData[i].practices[j]);
                    }
                }
            }
            consumerDataList[i].foodPackages = [];
            if (consumerData[i].foodPackages && consumerData[i].foodPackages.length > 0) {
                consumerDataList[i].foodPackages = consumerData[i].foodPackages;
            }
        }
        data.orderFoodVosJson = JSON.stringify(consumerDataList);
        data.note = that.data.note;
        if (this.data.isOrderType === 0 || this.data.isOrderType === 3) {
            if (!orderType && !that.data.userOrderInfo.tableCode) {
                wx.showToast({
                    title: '请选择桌台',
                    icon: 'success',
                    duration: 2000
                });
                return;
            }
            data.type = 0;
            data.fNumber = that.data.diningNumber || 1;
            data.consumerId = that.data.userOrderInfo.consumerId;//消费者ID（可选，存在即为加菜）
            data.tableCode = that.data.userOrderInfo ? (that.data.userOrderInfo.tableCode || '') : '';
            if (this.data.isOrderType === 3) {
                apiService.checkHasWaitPayConsumer({
                    openId: app.globalData.openId,
                    tableCode: data.tableCode,
                    resId: that.data.resId,
                }, (rsp) => {
                    if (data.consumerId && rsp.code === '2001') {
                        wx.showModal({
                            content: '您的订单数据异常，请重新扫码点餐',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (rsp) {
                                util.go(-2);
                            }
                        });
                    } else if (rsp.code === '2000' || rsp.code === '2001') {
                        rsp.code === '2001' && (data.consumerId = '');
                        rsp.code === '2000' && (data.consumerId = rsp.value.consumerId || '');
                        commitOrder();
                    } else {
                        util.showToast(rsp.message);
                        setTimeout(function () {
                            util.go(-2);
                        }, 2000)
                    }
                });
            } else {
                commitOrder();
            }
        } else if (this.data.isOrderType === 1) {
            if (that.data.DefaultAddress) {
                data.type = 2;
                data.addressId = that.data.loadDefault.id;//配送地址Id
                data.distributionFee = this.data.otherFees.totalPrice;//配送费
                data.packingCharge = info.packingCharge;//打包费
            } else {
                that.openAddressModule();
                return;
            }
            commitOrder();
        } else if (this.data.isOrderType === 2) {
            data.type = 0;
            data.consumerId = that.data.userOrderInfo.consumerId;//消费者ID（可选，存在即为加菜）l
            commitOrder();
        }

        function commitOrder() {
            // 提交数据
            that.data.isSubmitOrder = false;
            apiService.commitOrder(data,
                (rsp) => {
                    that.data.isSubmitOrder = true;
                    let consumerId = rsp.value.id,
                        data = {
                            consumerId: consumerId,
                            resId: that.data.resId
                        };
                    that.clearShopCart();//清除购物车
                    // console.log(formId, '_________________________________________formId');
                    if (formId && 'the formId is a mock one' !== formId && 3 == that.data.isOrderType) {
                        /**
                         * 模板消息推送
                         */
                        apiService.sendMiniWxTemplateMsg({
                            resId: that.data.resId,
                            consumerId,
                            openId: app.globalData.openId,
                            formId
                        });
                    }

                    function redirctToUrl(text) {
                        return "/pages/order/" + text + "/" + text;
                    }

                    if (!orderType) {
                        data.tableCode = that.data.tableCode;
                    }
                    if (that.data.isOrderType == 3) {//餐后
                        util.go('/pages/order/order-detail/order-detail', {
                            type: 'blank',
                            data
                        });
                    } else {//餐前与外卖支付
                        util.go(redirctToUrl('order-pay'), {
                            type: 'blank',
                            data
                        });
                    }
                }, () => {
                    that.data.isSubmitOrder = true;
                })
        }
    },
    /**
     * 设置外卖默认地址
     */
    setLoadDefaultAddress() {
        let _this = this;
        apiService.loadDefaultAddress(
            {openId: app.globalData.openId},
            (rsp) => {
                //有默认地址
                _this.setData({
                    loadDefault: rsp.value,
                    DefaultAddress: true,
                });
            }, () => {
                //没有默认地址
                _this.openAddressModule();
                _this.setData({
                    DefaultAddress: false,
                });
            });
    },
    /**
     * 设置店铺信息
     * @param cb
     */
    setResDetail(cb) {
        let _this = this,
            info = this.data.shopCartsInfo.info,
            isOrderType = this.data.isOrderType,
            totalPrice = Number(this.data.totalPrice) || 0,
            fullFreeAmount = Number(info.fullFreeAmount) || 0,
            otherFees = {};
        if (isOrderType === 1) {
            this.data.diningNumber = 0;
            otherFees = {
                name: '免配送费',//配送费名字
                price: 0,//配送费价格
                totalPrice: 0,//配送费价格
            };
            if (Number(info.distributionCostType) === 1) {
                otherFees.name = '配送费';//配送费名字
                otherFees.totalPrice = util.money(Number(info.distributionFee) || 0);
                otherFees.price = util.money(Number(info.distributionFee) || 0);
            }
            let otherListPrice = Number(_this.data.otherList[0].price) || 0;
            if (fullFreeAmount && fullFreeAmount <= totalPrice - otherListPrice) {
                otherFees.name = '单笔满￥' + fullFreeAmount + '免配送费';//配送费名字
                otherFees.totalPrice = 0;
                otherFees.price = 0;
            }
        } else if (isOrderType === 2) {
            // 自助取餐
            otherFees = {};
        } else if (isOrderType === 0 || isOrderType === 3) {
            let serviceChange = Number(info.serviceChange) || 0;
            otherFees = {
                counts: 1,
                name: info.serviceChangeName,//茶位费名字
                price: serviceChange,//茶位费价格
                totalPrice: util.money(serviceChange)
            };
            if (this.data.hasConsumerId) {
                otherFees = {
                    counts: 1,
                    name: '加菜免茶位费',//茶位费名字
                    price: 0,//茶位费单价
                    totalPrice: 0//茶位费总价
                };
            }
            _this.getTableDtoList();//获取座位信息
        }
        _this.setData({otherFees});
        _this.updatePrice();//更新价钱
        cb && cb();
    },
    /**
     * 弹框提示是否有默认地址
     */
    openAddressModule() {
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '请设置配送地址',
            showCancel: false,
            confirmText: '添加地址',
            success: function (res) {
                if (res.confirm) {
                    that.goAddress()
                } else if (res.cancel) {

                }
            }
        });
    },
    /**
     * 新添加收货地址
     */
    goAddress() {
        util.go('/pages/vkahui/address-edit/address-edit', {
            data: {
                isWaimai: true
            }
        })
    }
};
// 事件类
const events = {
    bindAzmAddFood(e) {
        let _this = this;
        _this.plusFood(1, e);
    },
    bindAzmLessFood(e) {
        let _this = this;
        _this.plusFood(-1, e);
    },
    bindAzmClearShopCart() {
        let _this = this;
        _this.clearShopCart();
    },
    bindAzmPopupSubareaItemBtn(e) {
        let _this = this;
        _this.subareaItem(e);
    },
    bindAzmPopupSubareaBtn(e) {
        let _this = this;
        _this.subarea(e);
    },
    bindAzmCloseMask() {
        // 关闭弹窗
        let _this = this;
        _this.closeModule('moduleActiveMe');//规格弹框
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, utilPage));
