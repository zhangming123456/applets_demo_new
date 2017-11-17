const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: "Page Takeaway",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        options: {},
        isShareCurrentPage: false,//是否分享首页
        isDeliveryAmount: false,//是否达到配送金额
        imageServer: config.imageUrl,//图片服务器地址
        shopInfo: {},//餐厅信息
        memberCardDto: {},//会员卡信息
        findFoodCatalogList: [],//菜品tab列表
        _findFoodCatalogList: {},//菜品tab列表
        foodList: [],//菜品列表
        foodListObj: {},
        _foodListObj: {},
        dishesTab: {
            index: 0,
            code: ''
        },//tabID
        isBindDishesTab: true,//是否点击了tab



        dishesTabListIndex: '',//tab列表ID
        totalPrice: 0,//总价
        discountTotalPrice: 0,//折后总价
        offerPrice: 0,//已优惠金额
        counts: 0,//总数
        amount: 0,//菜品数量
        shopCart: [],//购物车菜品列表
        shopCartToFoodList: {},//购物车菜品渲染列表
        otherList: [],//购物车其他费用列表
        otherPrice: {},//其他费用
        shopCartModule: '',//购物车模态框class
        ShopOneData: {},//规格弹框临时信息
        PackageData: {},//套餐弹框临时信息
        deliveryAmount: 0,//起送金额
        deliveryAmountDifference: 0,//起送金额差
        isPlusFood: true,
        foodListScrollTop: 0,//当前菜品列表滚动位置
        isScrollFoodList: false,//是否菜品列表滚动
        foodListTab: [],//菜品tab数量图标
        isConsumerId: 0,//是否有订单
    },
    /**
     * 页面初始化
     * @param options 为页面跳转所带来的参数
     */
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
    onShow: function (options) {
        console.warn(`${this.data.text}页面显示`);
        let that = this;
        this.bindAzmCloseMask();//初始化所以弹框
        if (this.data.isShow && app.globalData.isShow) {
            that.loadData();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
        this.setData({
            shopCartToFoodList: {},
            shopCart: []
        });
    }
};
/**
 * 方法类
 */
const methods = {
    loadCb() {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.openId = rsp.value.openId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取openid失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );
    },
    /**
     * 加载数据
     */
    loadData() {
        let that = this,
            options = that.data.options;
        if (!options.resId) util.go(-1);
        that.data.resId = options.resId;
        // 获取店铺信息
        const p1 = that.utilPage_getResDetail(options.resId)
            .then(
                () => {
                    let shopInfo = that.data.shopInfo;
                    that.utilPage_setNavigationBarTitle(`外卖-${shopInfo.resName}`);
                },
                (err) => {
                    if (err)
                        throw {
                            code: 4000,
                            message: '获取店铺信息失败'
                        };
                }
            ).catch(e => e);
        // 获取会员卡信息
        const p2 = that.utilPage_getMemberCardList(options.resId).then(
            () => {

            },
            (err) => {
                if (err)
                    throw {
                        code: 4000,
                        message: '获取会员卡信息失败'
                    };
            }).catch(e => e);
        //获取菜品列表
        const p3 = that.findFoodCatalogList({isTakeaway: 1})
            .then(
                () => {
                    that.getShopCart();//获取购物车
                },
                (err) => {
                    if (err)
                        throw {
                            code: 4000,
                            message: '获取菜品列表失败'
                        };
                }
            ).catch(e => e);
        const p = Promise.all([p1, p2, p3]);
        p.then(
            ([ResDetail, MemberCardList, FoodList]) => {
                if (ResDetail && 4000 == ResDetail.code) {
                    that.showToast(ResDetail.message + ',请重试');
                } else if (MemberCardList && 4000 == MemberCardList.code) {
                    that.showToast(MemberCardList.message + ',请重试');
                } else if (FoodList && 4000 == FoodList.code) {
                    that.showToast(FoodList.message + ',请重试');
                }
                that.setData({hasMoreData: true});
            }
        );
    },
    /**
     * 获取规格
     * @param foodCode
     * @param cb
     */
    getFoodRuleList(foodCode, cb) {
        let _this = this,
            memberType = this.data.memberCardDto.memberType;
        ApiService.getFoodRuleList(
            {
                resId: _this.data.resId,
                openId: app.globalData.openId,
                foodCode,
                memberType,
                config: {
                    isLoading: true
                }
            },
            (rsp) => {
                // for (var i = 0; i < rsp.value.length - 1; i++) {
                //     rsp.value[i].ruleCode = rsp.value[i].id;
                // }
                cb && cb(rsp.value);
            });
    },
    /**
     * 获取菜品列表
     */
    getFoodList(data, resolve, reject) {
        // data = {isEatin: 1};//堂食菜品
        // data = {isTakeaway: 1};//外卖菜品
        let that = this;
        data.resId = that.data.resId;
        data.openId = that.data.openId;
        if (that.data.foodListObj[data.foodCatalog] && that.data.foodListObj[data.foodCatalog].length > 0) {
            resolve && resolve();
        } else {
            ApiService.getFoodList(data,
                (rsp) => {
                    if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                        let foodList = rsp.value;
                        if (data.foodCatalog) {
                            that.setData({
                                [`foodListObj.${data.foodCatalog}`]: foodList
                            });
                        } else {
                            that.setData({foodList});
                        }
                    } else {
                    }
                },
                () => {
                    resolve && resolve();
                }
            );
        }
    },


    /**
     * 获取菜品tab分类
     */
    findFoodCatalogList(data) {
        let that = this,
            resId = that.data.resId,
            index = that.data.dishesTab.index;
        return new Promise((resolve, reject) => {
            // data.resId = that.data.resId;
            ApiService.findFoodCatalogList(Object.assign({resId}, data),
                (rsp) => {
                    if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                        let findFoodCatalogList = rsp.value;
                        that.bindDishesTab(null, rsp.value[index].catalogCode, index);
                        that.setData({
                            findFoodCatalogList
                        });
                        resolve();
                    } else {
                        reject();
                    }
                }
            );
        })
    },
    /**
     * 获取本地购物车
     */
    getShopCart() {
        let that = this,
            resId = that.data.resId,
            shopCarts = {};
        if (!app.globalData.shopCarts[resId]) {
            that.utilPage_setShopCartsStorage();
        }
        // console.log(app.globalData.shopCarts, 'pages/this.getSetting();', '购物车');
        shopCarts = app.globalData.shopCarts[resId]['takeawayCarts'];
        let shopCart = Object.assign(shopCarts.list) || [],
            shopCartToFoodList = {},
            deliveryAmount = Number(shopCarts.info.deliveryAmount) || 0,
            counts = shopCarts.counts,
            otherList = shopCarts.otherList,
            otherPrice = shopCarts.info,
            totalPrice = shopCarts.totalPrice;
        for (let i = 0; i < shopCart.length; i++) {
            shopCartToFoodList[shopCart[i].foodCode] = Object.assign(shopCarts.list[i]);
        }
        this.setData({otherPrice, shopCart, shopCartToFoodList, counts, otherList, totalPrice, deliveryAmount});
    },
    /**
     * 设置本地购物车
     */
    setShopCart() {
        let orderList = this.data.orderList,
            orderType = this.data.orderType;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].list = this.data.shopCart;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].totalPrice = this.data.totalPrice;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].discountTotalPrice = this.data.discountTotalPrice;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].offerPrice = this.data.offerPrice;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].counts = this.data.counts;
        app.globalData.shopCarts[this.data.resId][orderList[orderType] + 'Carts'].amount = this.data.amount;
        app.setShopCartsStorage();
    },
    /**
     * 购物车按钮
     */
    shopCartBtn() {
        if (this.data.shopCartModule && this.data.shopCartModule.length > 0) {
            this.closeModule("shopCartModule");
        } else {
            if (this.data.shopCart.length > 0) {
                this.setData({
                    shopCart: this.data.shopCart
                });
                this.openModule("shopCartModule");
            }
        }

    },
    /**
     * 非规格或单规格菜品添加购物车
     * @param num
     * @param e
     */
    plusFood(num, e) {
        if (!this.data.isPlusFood) {
            return;
        }
        let _this = this,
            shopCart = this.data.shopCart,
            foodList = this.data.foodList,
            shopCartToFoodList = this.data.shopCartToFoodList,
            index = e.currentTarget.dataset.index.split(','),
            datasetValue = e.currentTarget.dataset.value,
            value = util.extend(true, {}, foodList[index[0]].list[index[1]]),
            counts = 0,
            memberType = this.data.memberCardDto.memberType,
            price = value.price || 0,
            currentFoodIndex = -1,
            shopCartFlag = false;
        if (utilCommon.isNumberOfNaN(index[2])) {
            currentFoodIndex = Number(index[2]);
            shopCartFlag = true;
            //获取购物车中信息
            value = util.extend(true, {}, datasetValue);
            price = value.price || 0;
        } else {
            currentFoodIndex = _this.getShopCartIndex(value);
        }
        if (!shopCartToFoodList[value.foodCode] || util.isEmptyObject(shopCartToFoodList[value.foodCode])) {
            value.info = {
                counts: 0,
                amount: 0,
                totalPrice: 0,
                index: [index[0], index[1]]
            };
            shopCartToFoodList[value.foodCode] = value;
        } else {
            if (!utilCommon.isNumberOfNaN(index[2])) {
                value = shopCartToFoodList[value.foodCode] || {};
            }
        }
        counts = value.info.counts || 0;
        let amount = shopCartToFoodList[value.foodCode].info.amount || 0;
        if (num === 1) {
            counts++;
            amount++
        } else if (num === -1) {
            counts--;
            amount--
        }
        if (counts < 0) {
            counts = 0;
            amount = 0;
        }
        let returnData = {
            ['shopCartToFoodList.' + value.foodCode + '.info.counts']: counts
        };
        if (utilCommon.isNumberOfNaN(index[2])) {
            returnData['shopCartToFoodList.' + value.foodCode + '.info.amount'] = amount;
        }

        _this.setData(returnData);

        if (!shopCartFlag && foodList[index[0]].list[index[1]].foodRuleCount > 0) {
            if (foodList[index[0]].list[index[1]].rule) {
                getFoodRuleList(true);
            } else {
                _this.data.isPlusFood = false;
                _this.getFoodRuleList(value.foodCode, (res) => {
                    foodList[index[0]].list[index[1]].info = util.extend(true, {}, value.info);
                    value.info.ruleList = res;
                    foodList[index[0]].list[index[1]].info.ruleList = res;
                    if (res && res.length > 0) {
                        value.rule = util.extend(true, {}, res[0]);
                        value.ruleCode = res[0].ruleCode;
                        foodList[index[0]].list[index[1]].rule = util.extend(true, {}, res[0]);
                        foodList[index[0]].list[index[1]].ruleCode = res[0].ruleCode;
                    }
                    getFoodRuleList(true);
                })
            }
        } else {
            getFoodRuleList();
        }

        function getFoodRuleList(bol) {
            let countsFlag = false;
            _this.data.isPlusFood = true;
            if (bol && !utilCommon.isNumberOfNaN(index[2])) {
                foodList[index[0]].list[index[1]].price = Number(value.rule.memberPrice) || 0;
                price = foodList[index[0]].list[index[1]].price;
                if (memberType && memberType.length > 0) {
                    value.rule.foodRuleMemberPrice && value.rule.foodRuleMemberPrice.length === 1 && (value.rule.memberPrice = value.rule.foodRuleMemberPrice[0].memberPrice || 0);
                }
            }
            value.info.counts = Number(counts);//单品总数
            value.info.amount = Number(amount);//单品总数
            value.info.totalPrice = util.money(price * counts);//单品总价
            value.info.index = [index[0], index[1]];

            _this.data.foodList[index[0]].list[index[1]] = value;
            shopCartToFoodList[value.foodCode].info = value.info;
            if (currentFoodIndex === -1) {
                shopCart.push(value);
                currentFoodIndex = shopCart.length - 1
                // _this.updateData('shopCart[' + (shopCart.length - 1) + ']', value);
            } else {
                shopCart[currentFoodIndex] = value;
                // _this.setData({
                //     ['shopCart[' + currentFoodIndex + ']']: value
                // });
                // _this.updateData('shopCart[' + currentFoodIndex + '].info', value.info);
                // if (value.rule) {
                //     _this.updateData('shopCart[' + currentFoodIndex + '].rule', value.rule);
                //     _this.updateData('shopCart[' + currentFoodIndex + '].ruleCode', value.ruleCode);
                // }
                // if (value.practices) {
                //     _this.updateData('shopCart[' + currentFoodIndex + '].practices', value.practices);
                //     _this.updateData('shopCart[' + currentFoodIndex + '].practicesList', value.practicesList);
                // }
            }
            // if (countsFlag) {
            //     _this.setData({
            //         ['shopCartToFoodList.' + value.foodCode + '.info.amount']: amount
            //     });
            // } else {
            //     shopCartToFoodList[value.foodCode].info.amount = amount
            // }

            if (counts <= 0) {
                shopCart.splice(currentFoodIndex, 1);
                _this.setData({
                    shopCart
                });
                // resData.shopCart = shopCart;
            } else {
                if (utilCommon.isNumberOfNaN(index[2])) {
                    _this.setData({
                        ['shopCart[' + currentFoodIndex + ']']: value
                    });
                }
            }
            // _this.setData(resData);
            _this.updateShopCart();
        }
    },
    /**
     * 购物车菜品增减（待开发）
     * @param num
     * @param e
     */
    plusToFood(num, e) {
        let _this = this, resData = {},
            shopCart = this.data.shopCart,
            foodList = this.data.foodList,
            shopCartToFoodList = this.data.shopCartToFoodList,
            index = e.currentTarget.dataset.index.split(','),
            value = e.currentTarget.dataset.value,
            foodListValue = foodList[index[0]].list[index[1]],
            currentFoodIndex = this.getShopCartIndex(foodListValue);
        if (currentFoodIndex === -1) {
            value.info = {
                counts: 0,
                amount: 0,
                totalPrice: 0,
                index: index,
                discountPrice: 0,
                offerPrice: 0
            };
            shopCart.push(value);
            shopCartToFoodList[value.foodCode] = value;
            currentFoodIndex = shopCart.length - 1;
        }

        let counts = Number(shopCartToFoodList[value.foodCode].info.counts) || 0;
        if (num == 1) {
            counts++;
            foodList[index[0]].counts++
        } else if (num == -1) {
            if (counts > 0) {
                counts--;
                foodList[index[0]].counts--
            } else {
                counts = 0;
            }
        }
        this.updateData('shopCartToFoodList.' + value.foodCode + '.info.counts', counts);

        this.updateData('foodList[' + index[0] + '].counts', foodList[index[0]].counts);

        shopCart[currentFoodIndex].info.counts = counts;
    },
    /**
     * 规格菜品添加购物车
     * @param num
     * @param e
     */
    ruleToCarts(e) {
        let _this = this, resData = {},
            shopCart = this.data.shopCart,
            foodList = this.data.foodList,
            value = e.currentTarget.dataset.value,
            index = value.info.index,
            counts = foodList[index[0]].list[index[1]].info.counts || 0,
            price = value.price || 0,
            memberType = this.data.memberCardDto.memberType,
            shopCartToFoodList = this.data.shopCartToFoodList,
            str = 'foodList[' + index[0] + '].list[' + index[1] + '].info',
            currentFoodIndex = _this.getShopCartIndex(value);
        if (memberType && memberType.length > 0) {
            value.rule.foodRuleMemberPrice && value.rule.foodRuleMemberPrice.length === 1 && (value.rule.memberPrice = value.rule.foodRuleMemberPrice[0].memberPrice || 0);
        }
        if (currentFoodIndex === -1) {
            value.info.counts = 1;//数量
            value.price = Number(value.rule.memberPrice) || Number(value.price) || 0;
            value.info.totalPrice = util.money(value.price * (Number(value.info.counts) || 0));//单品总价
            value.info.index = index;
            shopCart.push(util.extend(true, {}, value));
            _this.setData({
                ['shopCart[' + (shopCart.length - 1) + ']']: util.extend(true, {}, value)
            });
        } else {
            let data = shopCart[currentFoodIndex],
                dataCounts = Number(data.info.counts) || 0,
                dataPrice = Number(data.price) || 0;
            shopCart[currentFoodIndex] = util.extend(true, {}, value);
            dataCounts++;
            shopCart[currentFoodIndex].info.counts = dataCounts;
            shopCart[currentFoodIndex].info.totalPrice = util.money(dataCounts * dataPrice);//单品总价
            _this.setData({
                ['shopCart[' + currentFoodIndex + ']']: shopCart[currentFoodIndex]
            });
            //更新规格菜的数量
            value.info.counts++;
        }
        let ruleCounts = 0;
        if (!shopCartToFoodList[value.foodCode] || util.isEmptyObject(shopCartToFoodList[value.foodCode])) {
            value.info = {
                counts: 1,
                totalPrice: 0,
                amount: 1,
                index: [index[0], index[1]]
            };
            ruleCounts = 1;
            shopCartToFoodList[value.foodCode] = util.extend(true, {}, value);
        } else {
            if (shopCartToFoodList[value.foodCode].info) {
                ruleCounts = shopCartToFoodList[value.foodCode].info.amount || 0;
            }
            ruleCounts++;
            shopCartToFoodList[value.foodCode] = util.extend(true, {}, value);
        }
        // foodList[index[0]].list[index[1]].info = util.extend(true, value.info);
        // resData[str] = util.extend(true, value.info);

        // resData.shopCart = shopCart;
        // _this.setData(resData);
        _this.setData({
            ['shopCartToFoodList.' + value.foodCode + '.info.amount']: ruleCounts
        });
        _this.updateShopCart();
    },
    /**
     * 获取购物车中菜品索引
     * @param code
     * @returns {number}
     */
    getShopCartIndexs(code, bol, value) {
        let index = -1,
            that = this,
            shopCart = this.data.shopCart,
            len = shopCart.length;
        for (let i = 0; i < len; i++) {
            if (shopCart[i] && shopCart[i].foodCode === code) {
                if (bol) {
                    let item = shopCart[i], flag = [false, false];
                    if (Number(item.foodRuleCount) === 0 && Number(item.foodPracticesCount) === 0) {
                        break;
                    }
                    //判断规格
                    if (Number(item.foodRuleCount) > 0) {
                        let ruleCode = value.rule.ruleCode;
                        if (ruleCode === item.ruleCode) {
                            flag[0] = true;
                        }
                    }
                    //判断口味与做法
                    let str = '', str1 = '',
                        practices = value.practices;
                    if (practices && practices.length > 0) {
                        for (let k = 0; k < practices.length; k++) {
                            str += practices[k] || '';
                        }
                    }
                    if (item.practices && item.practices.length > 0) {
                        for (let k = 0; k < item.practices.length; k++) {
                            str1 += item.practices[k] || '';
                        }
                    }
                    if (str1 === str) {
                        flag[1] = true;
                    }
                    if (flag[0] && flag[1]) {
                        return i;
                    }
                } else {
                    return i;
                }
            }
        }
        return index;
    },
    getShopCartIndex(value) {
        return this.data.shopCart.findIndex((n) => {
            if (value.foodCode === n.foodCode) {
                let flag = [0, 0, 0];
                if (value.ruleCode) {
                    flag[0] = value.ruleCode === n.ruleCode ? 1 : 0;
                } else {
                    flag[0] = 1;
                }
                if (value.practices) {
                    flag[1] = utilCommon.isEqualToString(value.practices, n.practices) ? 1 : 0;
                } else {
                    flag[1] = 1;
                }
                if (value.foodPackages) {
                    flag[2] = utilCommon.isEqualToString(value.foodPackages, n.foodPackages) ? 1 : 0;
                } else {
                    flag[2] = 1;
                }
                if (flag[0] + flag[1] + flag[2] === 3) {
                    return true;
                }
            }
        });
    },
    /**
     * 打开规格弹框事件
     * @param e
     */
    OpenRuleBtn(e) {
        let that = this,
            index = e.currentTarget.dataset.index.split(','),
            flagArr = [false, false],
            flagArr2 = [false, false],
            value = e.currentTarget.dataset.value,
            price = value.price || 0,
            counts = 0,
            foodList = this.data.foodList,
            foodListToValue = foodList[index[0]].list[index[1]],
            obj = {
                isLoading: false,
                title: value.name,
                data: value,
                footer: ['确定'],
                tableContent: 'table-rule',
            };
        if (value.info) {
            counts = value.info.counts || 0;
        }
        obj.data.rule = {};//规格
        obj.data.ruleCode = '';//规格
        obj.data.practices = [];//备注&&口味
        obj.data.practicesList = [];//备注&&口味
        obj.data.info = {
            totalPrice: util.money(counts * price),//总价
            practicesList: [],//备注&&口味
            ruleList: [],//规格
            counts: counts,
            index: index
        };
        this.setData({
            ShopOneData: obj
        });
        if (foodListToValue.info) {
            if (foodListToValue.info.ruleList && foodListToValue.info.ruleList.length > 0) {
                getFoodRuleList(foodListToValue.info.ruleList);
                flagArr2[0] = true;
            }
            if (foodListToValue.info.practicesList && foodListToValue.info.practicesList.length > 0) {
                getFoodPracticesList(foodListToValue.info.practicesList);
                flagArr2[1] = true;
            }
        }
        this.openModule('moduleActiveMe');
        if (flagArr2[0] && flagArr2[1]) {
            return;
        }
        that.getFoodRuleList(value.foodCode, (res) => {
            getFoodRuleList(res);
        });
        // 获取口味
        apiService.getFoodPracticesList(
            {
                resId: that.data.resId,
                openId: app.globalData.openId,
                foodCode: value.foodCode
            },
            (rsp) => {
                getFoodPracticesList(rsp.value);
            });

        function getFoodRuleList(data) {
            obj.data.info.ruleList = data;
            if (data && data.length > 0) {
                obj.data.rule = data[0];
                obj.data.ruleCode = data[0].ruleCode;
            }
            flagArr[0] = true;
            setData();
        }

        function getFoodPracticesList(data) {
            //口味
            obj.data.info.practicesList = data;
            obj.data.info.practicesLength = 0;
            if (data && data.length > 0) {
                for (let i = 0, len = data.length; i < len; i++) {
                    if (data[i].foodPracticesList && data[i].foodPracticesList.length > 0) {
                        obj.data.info.practicesLength++;
                        obj.data.practicesList[i] = data[i].foodPracticesList[0];
                        obj.data.practicesList[i].practicesCheckedId = data[i].foodPracticesList[0].id;
                        obj.data.practices[i] = data[i].foodPracticesList[0].practicesCode;
                    } else {
                        obj.data.practicesList[i] = {};
                        obj.data.practices[i] = '';
                    }
                }
            }
            flagArr[1] = true;
            setData();
        }

        function setData() {
            if (flagArr[0] && flagArr[1]) {
                let data = {},
                    str = 'foodList[' + index[0] + '].list[' + index[1] + ']';
                obj.isLoading = true;
                data[str] = obj.data;
                data.ShopOneData = obj;
                that.setData(data);
            }
        }
    },
    /**
     * 规格&做法btn
     * @param e
     * @param text
     */
    setShopOneData(e, text) {
        let that = this,
            index = null,
            ShopOneData = that.data.ShopOneData,
            value = e.currentTarget.dataset.value,
            flag = true;
        if (text === 'practices') {
            index = e.currentTarget.dataset.index.split(',');
            let list = ShopOneData.data.info[text + 'List'][index[0]].foodPracticesList;
            if (ShopOneData.data[text + 'List'][index[0]].practicesCheckedId === value.id) {
                flag = false
            }
            if (flag) {
                // ShopOneData.data.practicesCheckedId = value.id;
                ShopOneData.data[text + 'List'][index[0]] = value;
                ShopOneData.data[text + 'List'][index[0]].practicesCheckedId = value.id;
                ShopOneData.data[text][index[0]] = value.practicesCode;
            } else {
                ShopOneData.data.practicesCheckedId = '';
                ShopOneData.data[text + 'List'][index[0]] = {};
                ShopOneData.data[text][index[0]] = '';
            }
        } else if (text === 'rule') {
            index = e.currentTarget.dataset.index;
            ShopOneData.data[text] = value;
            ShopOneData.data[text + 'Code'] = value.ruleCode;
        }
        console.log(ShopOneData, 'ShopOneData');
        that.setData({
            ['ShopOneData.data']: ShopOneData.data
        });
    },
    /**
     * 套餐添加购物车
     * @param num
     * @param e
     */
    packageToCarts(e) {
        let _this = this, resData = {},
            shopCart = this.data.shopCart,
            foodList = this.data.foodList,
            value = e.currentTarget.dataset.value,
            index = value.info.index,
            counts = foodList[index[0]].list[index[1]].info.counts || 0,
            price = value.price || 0,
            memberType = this.data.memberCardDto.memberType,
            shopCartToFoodList = this.data.shopCartToFoodList,
            currentFoodIndex = _this.getShopCartIndex(value);
        if (memberType && memberType.length > 0) {
            value.rule.foodRuleMemberPrice && value.rule.foodRuleMemberPrice.length === 1 && (value.rule.memberPrice = value.rule.foodRuleMemberPrice[0].memberPrice || 0);
        }
        if (currentFoodIndex === -1) {
            value.info.counts = 1;//数量
            value.info.totalPrice = util.money(value.price * (Number(value.info.counts) || 0));//单品总价
            value.info.index = index;
            shopCart.push(util.extend(true, {}, value));
            _this.setData({
                ['shopCart[' + (shopCart.length - 1) + ']']: util.extend(true, {}, value)
            });
        } else {
            let data = shopCart[currentFoodIndex],
                dataCounts = Number(data.info.counts) || 0,
                dataPrice = Number(data.price) || 0;
            shopCart[currentFoodIndex] = util.extend(true, {}, value);
            dataCounts++;
            shopCart[currentFoodIndex].info.counts = dataCounts;
            shopCart[currentFoodIndex].info.totalPrice = util.money(dataCounts * dataPrice);//单品总价
            _this.setData({
                ['shopCart[' + currentFoodIndex + ']']: shopCart[currentFoodIndex]
            });
            //更新规格菜的数量
            value.info.counts++;
        }
        let ruleCounts = 0;
        if (!shopCartToFoodList[value.foodCode] || util.isEmptyObject(shopCartToFoodList[value.foodCode])) {
            value.info = {
                counts: 1,
                totalPrice: 0,
                amount: 1,
                index: [index[0], index[1]]
            };
            ruleCounts = 1;
            shopCartToFoodList[value.foodCode] = util.extend(true, {}, value);
        } else {
            if (shopCartToFoodList[value.foodCode].info) {
                ruleCounts = shopCartToFoodList[value.foodCode].info.amount || 0;
            }
            ruleCounts++;
            shopCartToFoodList[value.foodCode] = util.extend(true, {}, value);
        }
        _this.setData({
            ['shopCartToFoodList.' + value.foodCode + '.info.amount']: ruleCounts
        });
        _this.updateShopCart();
    },
    /**
     * 打开套餐弹框事件
     * @param e
     */
    openPackageBtn(e) {
        let that = this,
            index = e.currentTarget.dataset.index.split(','),
            flagArr = [false, false],
            flagArr2 = [false, false],
            value = e.currentTarget.dataset.value,
            price = value.price || 0,
            counts = 0,
            foodList = this.data.foodList,
            foodListToValue = foodList[index[0]].list[index[1]],
            obj = {
                isLoading: false,
                title: value.name,
                data: value,
                footer: ['确定'],
                tableContent: 'table-package',
            };
        if (value.info) {
            counts = value.info.counts || 0;
        }
        obj.data.rule = {};//规格
        obj.data.ruleCode = '';//规格
        obj.data.foodPackages = [];//套餐子菜
        obj.data.foodPackagesList = [];//套餐子菜
        obj.data.info = {
            totalPrice: util.money(counts * price),//总价
            foodPackagesList: [],//套餐子菜
            ruleList: [],//规格
            counts: counts,
            index: index
        };
        this.setData({
            PackageData: obj
        });
        if (foodListToValue.info) {
            if (foodListToValue.info.foodPackagesList && foodListToValue.info.foodPackagesList.length > 0) {
                getFoodPackagesList(foodListToValue.info.foodPackagesList);
                flagArr2[0] = true;
            }
            if (foodListToValue.info.ruleList && foodListToValue.info.ruleList.length > 0) {
                getFoodRuleList(foodListToValue.info.ruleList);
                flagArr2[1] = true;
            }
        }
        this.openModule('modulePackage');
        if (flagArr2[0] && flagArr2[1]) {
            return;
        }

        that.getFoodRuleList(value.foodCode, (res) => {
            getFoodRuleList(res);
        });

        function getFoodRuleList(data) {
            obj.data.info.ruleList = data;
            if (data && data.length > 0) {
                obj.data.rule = data[0];
                obj.data.ruleCode = data[0].ruleCode;
            }
            flagArr[0] = true;
            setData();
        }


        // 获取子菜
        apiService.findFoodPackage(
            {
                resId: that.data.resId,
                parentCode: value.foodCode
            },
            (rsp) => {
                getFoodPackagesList(rsp.value);
            });

        /**
         * 套餐子菜
         * @param data
         */
        function getFoodPackagesList(data) {
            obj.data.info.foodPackagesList = data;
            obj.data.info.foodPackagesLength = 0;
            if (data && data.length > 0) {
                for (let i = 0, len = data.length; i < len; i++) {
                    if (data[i].value && data[i].value.length > 0) {
                        obj.data.info.foodPackagesLength++;
                        obj.data.foodPackagesList[i] = data[i].value[0];
                        obj.data.foodPackagesList[i].checkedId = data[i].value[0].ruleCode + data[i].value[0].foodCode;
                        obj.data.foodPackages[i] = {
                            "foodCode": data[i].value[0].foodCode,
                            "ruleCode": data[i].value[0].ruleCode,
                            "foodCount": data[i].value[0].foodCount
                        };
                    } else {
                        obj.data.foodPackagesList[i] = {};
                        obj.data.foodPackages[i] = '';
                    }
                }
            }
            flagArr[1] = true;
            setData();
        }

        function setData() {
            if (flagArr[0] && flagArr[1]) {
                let data = {},
                    str = 'foodList[' + index[0] + '].list[' + index[1] + ']';
                obj.isLoading = true;
                data[str] = obj.data;
                data.PackageData = obj;
                that.setData(data);
            }
        }
    },
    /**
     * 设置套餐子菜
     * @param e
     * @param text
     */
    setPackageData(e) {
        let that = this,
            index = null,
            PackageData = that.data.PackageData,
            value = e.currentTarget.dataset.value,
            flag = true;
        index = e.currentTarget.dataset.index.split(',');
        let list = PackageData.data.info.foodPackagesList[index[0]].value;
        that.setData({
            ['PackageData.data.foodPackagesList[' + index[0] + ']']: value,
            ['PackageData.data.foodPackagesList[' + index[0] + '].checkedId']: value.ruleCode + value.foodCode,
            ['PackageData.data.foodPackages[' + index[0] + ']']: {
                "foodCode": value.foodCode,
                "ruleCode": value.ruleCode,
                "foodCount": value.foodCount
            }
        });
    },
    /**
     * 更新价钱并保存本地购物车
     * @param bol
     */
    updateShopCart(bol) {
        let _this = this,
            shopCart = this.data.shopCart,
            shopInfo = this.data.shopInfo,
            otherList = this.data.otherList,
            foodList = this.data.foodList,
            memberCardDto = this.data.memberCardDto,
            shopCartToFoodList = this.data.shopCartToFoodList,
            len = shopCart.length,
            totalPrice = 0,
            offerTotalPrice = 0,
            discountTotalPrice = 0,
            updateData = [],
            foodListTab = [];//菜品tab数量图标
        for (let j = 0; j < foodList.length; j++) {
            foodList[j].counts = 0;
            foodListTab[j] = 0;
        }
        for (let i = 0; i < len; i++) {
            // shopCartToFoodList[shopCart[i].foodCode] = util.extend(true, shopCart[i]);
            let item = shopCart[i],
                info = shopCart[i].info,
                discount = 0,
                discountPrice = 0,
                memberType,
                countsFlag = false,
                offerPrice = 0,
                foodListItem = foodList[info.index[0]].list[info.index[1]],
                price = Number(info.totalPrice) || 0;
            totalPrice += price;//总价计算
            shopCart[i].info.amount = shopCartToFoodList[item.foodCode].info.amount;//购物车单菜数量
            if (!bol) {
                if (shopCart[i].info.ruleList && shopCart[i].info.ruleList.length > 1) {
                    shopCart[i].isdiscount = shopCart[i].rule.status;//根据规格中状态转化会员等级
                }
                memberCardDto && memberCardDto.memberTypeDiscount && (discount = Number(memberCardDto.memberTypeDiscount / 100) || 1);

                if (discount && discount > 0 && Number(shopCart[i].isdiscount) === 1) {//会员折扣
                    discountPrice = price * discount;
                    offerPrice = price - discountPrice;
                    info.discountPrice = util.money(discountPrice);
                    info.offerPrice = offerPrice >= 0 ? util.money(offerPrice) : '0.00';
                } else if (Number(shopCart[i].isdiscount) === 2) {//会员等级
                    discountPrice = Number(item.rule.memberPrice * info.counts);
                    offerPrice = price - discountPrice;
                    info.discountPrice = util.money(discountPrice);
                    info.offerPrice = offerPrice >= 0 ? util.money(offerPrice) : '0.00';
                } else {//无会员
                    info.discountPrice = util.money(price);
                    info.offerPrice = util.money(0);
                }
                discountTotalPrice += Number(info.discountPrice);
                offerTotalPrice += Number(info.offerPrice);
            }

            //计算购物车分类下子菜的数量
            foodList[info.index[0]].counts += info.counts;
        }
        for (let j = 0; j < foodList.length; j++) {
            foodList[j].counts = foodList[j].counts;
            foodListTab[j] = foodList[j].counts;
        }
        this.data.offerPrice = util.money(offerTotalPrice);
        this.data.discountTotalPrice = util.money(discountTotalPrice);
        let otherListPrice = 0,
            deliveryAmountDifference = util.money(this.data.deliveryAmount - totalPrice);
        for (let i = 0; i < otherList.length; i++) {
            let price = Number(otherList[i].price) || 0;
            totalPrice += price;
            otherListPrice += price;
        }
        if (shopCart.length <= 0) {
            totalPrice = 0;
        }
        let isDeliveryAmount = true;
        if (this.data.orderType === 1 && Number(deliveryAmountDifference) > 0) {
            isDeliveryAmount = false;
            // deliveryAmountDifference = 0;
        }
        totalPrice = util.money(totalPrice);

        // shopCartToFoodList
        if (shopCart.length === 0) {
            _this.closeModule('shopCartModule');//关闭购物车
        }
        this.setData({
            totalPrice,
            isDeliveryAmount,
            deliveryAmountDifference,
            counts: shopCart.length,
            foodListTab
        });
        this.setShopCart();
    },
    /**
     * 清除购物车
     */
    clearShopCart() {
        if (this.data.shopCart.length === 0) {
            return;
        }
        let _this = this,
            resId = this.data.resId,
            orderList = this.data.orderList,
            orderType = this.data.orderType;
        wx.showModal({
            title: '提示',
            content: '是否清除购物车',
            success: function (res) {
                if (res.confirm) {
                    _this.data.shopCartToFoodList = {};
                    _this.data.shopCart = [];
                    app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].list = [];
                    app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].totalPrice = 0;
                    app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].counts = 0;
                    app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].amount = 0;
                    app.setShopCartsStorage();
                    _this.setData({
                        shopCart: [],
                        shopCartToFoodList: {}
                    });
                    _this.closeModule('shopCartModule');//关闭购物车
                    _this.getFoodList();
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },
    /**
     * 提交订单
     */
    submit() {
        let shopCart = this.data.shopCart,
            orderType = this.data.orderType,
            _this = this;
        if (!this.data.isShow) {
            return;
        }
        if (!utilCommon.isArray(shopCart) || shopCart.length == 0) {
            wx.showToast({
                title: '还没点餐,请点餐',
                icon: 'success',
                duration: 2000
            })
        } else if (!this.data.isDeliveryAmount) {
            wx.showToast({
                title: '还未达到起送金额',
                icon: 'success',
                duration: 2000
            })
        } else {
            let url = '/pages/shop/confirm-order/confirm-order';
            let typeText = null;
            if (_this.data.isConsumerId === 1) {
                typeText = 'blank';
            }
            util.go(url, {
                type: typeText,
                data: {
                    resId: _this.data.resId,
                    orderType
                }
            });
        }
    },
    updateData(str, data) {
        this.setData({
            [str]: data
        })
    }
};
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
    /**
     * 设置口味做法btn事件
     * @param e
     */
    bindAzmPopupPracticesBtn(e) {
        let _this = this;
        _this.setShopOneData(e, 'practices');
    },
    /**
     * 设置规格btn事件
     * @param e
     */
    bindAzmPopupRuleBtn(e) {
        let _this = this;
        _this.setShopOneData(e, 'rule');
    },
    /**
     * 设置套餐btn事件
     * @param e
     */
    bindAzmPopupPackageBtn(e) {
        let _this = this;
        _this.setPackageData(e);
    },
    /**
     * 弹窗提交
     * @param e
     */
    bindAzmModulePopupSubmit(e) {
        let _this = this,
            data = e.currentTarget.dataset.value;
        if (data.foodType == 2) {
            _this.packageToCarts(e);
        } else {
            _this.ruleToCarts(e);
        }
        _this.bindAzmCloseMask();
    },
    /**
     * 打开选套餐菜弹框
     * @param e
     */
    bindOpenPackageBtn(e) {
        let _this = this;
        _this.openPackageBtn(e);
    },
    /**
     * 打开选规格菜弹框
     * @param e
     */
    bindOpenRuleBtn(e) {
        let _this = this;
        _this.OpenRuleBtn(e);
    },
    /**
     * 关闭所有弹窗
     */
    bindAzmCloseMask(e) {
        let _this = this;
        _this.utilPage_closeModule('moduleActiveMe');//关闭规格弹框
        _this.utilPage_closeModule('modulePackage');//关闭套餐弹框
        _this.utilPage_closeModule('shopCartModule');//关闭购物车
    },
    bindAzmShopCartBtn(e) {
        let _this = this;
        _this.shopCartBtn();
    },
    bindAzmSubmit(e) {
        let _this = this;
        _this.submit();
    },


    /**
     * tap点击事件
     * @param e
     */
    bindDishesTab(e, code = null, index = 0) {
        if (!this.data.isBindDishesTab) {
            return;
        }
        this.data.isBindDishesTab = false;
        let that = this;
        if (e) {
            index = e.currentTarget.dataset.index;
            code = e.currentTarget.dataset.code
        }
        if (!code) return;
        that.getFoodList(
            {isTakeaway: 1, foodCatalog: code, index},
            () => {
                that.data.isBindDishesTab = true;
                if (code !== that.data.dishesTab.code) {
                    that.setData({
                        dishesTab: {code, index}
                    })
                }
            }
        );
    },
    bindPlusToShopCart(e) {
        let that = this,
            shopCart = that.data.shopCart,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            index = e.currentTarget.dataset.index,
            value = e.currentTarget.dataset.value,
            memberType = that.data.memberCardDto.memberType,
            isAdded = that.getShopCartIndex(value);

        if (-1 === isAdded) {
            value.info = {
                counts: 0,
                amount: 0,
                totalPrice: 0
            };
        }
    },
    bindCutToShopCart(e) {

    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));