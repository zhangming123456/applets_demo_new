const util = require('./util'),
    utilCommon = require('./utilCommon'),
    queryString = require('./queryString'),
    apiService = require('./ApiService');
let app = getApp();
const failToast = (that, text) => {
    if (that.showToast) {
        that.showToast(text);
    } else {
        util.failToast(text);
    }
};

const showToast = (that, text) => {
    if (that.showToast) {
        that.showToast(text);
    } else {
        util.showToast(text);
    }
};
module.exports = {
    /**
     * 转发分享事件
     * @param options
     * @returns {{title: string, path: string, success: success, fail: fail}}
     */
    onShareAppMessage(options) {
        let that = this,
            route = util.CurrentPages(),
            resId = this.data.resId,
            orderType = this.data.orderType,
            shopInfo = this.data.shopInfo,
            resName = shopInfo ? '欢迎光临' + shopInfo.resName : '欢迎使用V卡汇小程序',
            imageUrl = shopInfo ? this.data.imageServer + shopInfo.resLogo : null,
            path = '/' + route,
            data = {resId, orderType, jumpMode: 1};//jumpMode跳转模式  0：无模式 1：分享 2：加菜 。。。
        if (!this.data.isShareCurrentPage) {
            path = '/pages/shop/home/home'
        }
        return {
            title: resName,
            path: path + '?' + queryString.stringify(data),
            success: function (res) {
                showToast(that, '分享成功')
            },
            fail: function (res) {
                failToast(that, '分享失败')
            }
        }
    },

    /**
     * 图片加载失败事件
     * @param e
     */
    imageError(e) {
        console.log(e)
    },


    /**
     * 设置并并保存本地购物车信息
     */
    utilPage_setShopCartsStorage() {
        let resId = this.data.resId,
            shopCartsStorage = app.globalData.shopCarts,
            shopInfo = this.data.shopInfo,
            shopCarts = {
                hallCarts: {
                    totalPrice: 0,
                    amount: 0,
                    counts: 0,
                    list: [],
                    otherList: [],
                    info: {},
                    unsetOrders: {}
                },
                takeawayCarts: {
                    totalPrice: 0,
                    amount: 0,
                    counts: 0,
                    list: [],
                    otherList: [],
                    info: {}
                }
            };
        // console.log(shopCartsStorage, 'shopCartsStorage');
        if (!shopInfo) {
            this.getResDetail(function (res) {
                shopInfo = res.value;
                setShopCartsInfo();
            });
        } else {
            setShopCartsInfo()
        }

        function setShopCartsInfo() {
            if (shopInfo.restaurantBusinessRules && shopInfo.restaurantBusinessRules.status) {
                let hallInfo = shopInfo.restaurantBusinessRules;
                shopCarts.hallCarts.info = hallInfo;
                hallInfo.name = hallInfo.serviceChangeName;
                hallInfo.price = hallInfo.serviceChange;
                hallInfo.counts = 1;
            }
            if (shopInfo.takeoutBusinessRules && shopInfo.takeoutBusinessRules.status) {
                let takeawayInfo = shopInfo.takeoutBusinessRules,
                    distributionFee = takeawayInfo.distributionFee || 0, //配送费
                    packingCharge = Number(takeawayInfo.packingCharge) || 0;//打包费
                shopCarts.takeawayCarts.info = takeawayInfo;
                takeawayInfo.name = '配送费';
                takeawayInfo.price = distributionFee;
                shopCarts.takeawayCarts.otherList.push({
                    name: '打包费',
                    price: util.money(packingCharge),
                    counts: 1
                })
            }
            if (!!shopCartsStorage && utilCommon.isString(shopCartsStorage)) {
                shopCartsStorage = JSON.parse(shopCartsStorage);
            }
            if (!shopCartsStorage || !shopCartsStorage[resId]) {
                shopCartsStorage[resId] = shopCarts;
            }
            shopCartsStorage[resId].hallCarts.otherList = shopCarts.hallCarts.otherList;
            shopCartsStorage[resId].hallCarts.info = shopCarts.hallCarts.info;
            shopCartsStorage[resId].hallCarts.unsetOrders = shopCarts.hallCarts.unsetOrders;
            if (!utilCommon.isArray(shopCartsStorage[resId].hallCarts.list)) {
                shopCartsStorage[resId].hallCarts.list = shopCarts.hallCarts.list;
            }
            shopCartsStorage[resId].takeawayCarts.otherList = shopCarts.takeawayCarts.otherList;
            shopCartsStorage[resId].takeawayCarts.info = shopCarts.takeawayCarts.info;
            if (!utilCommon.isArray(shopCartsStorage[resId].takeawayCarts.list)) {
                shopCartsStorage[resId].takeawayCarts.list = shopCarts.takeawayCarts.list;
            }
            app.globalData.shopCarts = shopCartsStorage;
            app.setShopCartsStorage();
        }
    },
    /**
     * 获取会员卡信息
     */
    utilPage_getMemberCardList(resId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!resId) {
                reject();
                return;
            }

            let openId = app.globalData.openId;
            if (!utilCommon.isObject(that.data.memberCardDto)) {
                that.data.memberCardDto = {};
            }
            try {
                let memberCardDto = app.globalData.memberCardDtos[resId];
                if (memberCardDto && memberCardDto.resId === resId) {
                    that.data.memberCardDto && Object.assign(that.data.memberCardDto, memberCardDto);
                    resolve();
                    return;
                }
                apiService.getMemberCardList(
                    {resId, openId},
                    (rsp) => {
                        if (2000 == rsp.code && rsp.value && rsp.value.length > 0 && rsp.value[0].resId === resId) {
                            memberCardDto = rsp.value[0];
                            app.globalData.memberCardDtos[resId] = memberCardDto;
                            that.data.memberCardDto && Object.assign(that.data.memberCardDto, memberCardDto);
                        }
                    },
                    (err) => {
                        if (2000 == err.code && err.value && err.value.length > 0 && err.value[0].resId === resId)
                            resolve();
                        else
                            reject();
                    }
                );
            } catch (e) {
                console.warn('utilPage_getMemberCardList调用失败');
                reject();
            }
        })
    },
    /**
     * 获取店铺信息
     */
    utilPage_getResDetail(resId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!resId) {
                reject(true);
                return;
            }
            if (!utilCommon.isObject(that.data.shopInfo)) {
                that.data.shopInfo = {};
            }

            let shopInfo = that.data.shopInfo;
            try {
                let resDetailDto = app.globalData.resDetailDtos[resId];
                if (resDetailDto && resDetailDto.resId === resId) {
                    shopInfo && Object.assign(shopInfo, resDetailDto);
                    that.setData({shopInfo});
                    resolve();
                    return;
                }
                apiService.getResDetail(
                    {resId},
                    (rsp) => {
                        if (2000 == rsp.code && rsp.value && rsp.value.resId === resId) {
                            resDetailDto = rsp.value;
                            app.globalData.resDetailDtos[resId] = resDetailDto;
                            shopInfo && Object.assign(shopInfo, resDetailDto);
                            that.setData({shopInfo});
                        }
                    },
                    (err) => {
                        if (2000 == err.code && err.value && err.value.resId === resId)
                            resolve();
                        else
                            reject();
                    }
                );
            } catch (e) {
                console.warn('utilPage_getResDetail调用失败');
                reject();
            }
        })
    },
    /**
     * 设置导航栏信息
     * @param txt
     */
    utilPage_setNavigationBarTitle(txt) {
        wx.setNavigationBarTitle({
            title: txt
        })
    },
    /**
     * 拨打电话
     * @param e
     */
    utilPage_makePhoneCall(e) {
        let phone = e.target.dataset.phone || e.currentTarget.dataset.phone || '';
        if (!phone) return;
        wx.makePhoneCall({
            phoneNumber: phone,
            success() {

            },
            fail() {

            }
        })
    },
    /**
     * 打开module-popup弹框
     * @param str
     */
    utilPage_openModule(str) {
        let data = {
            isMask: true,
            isTemplate: true
        };
        data[str] = str;
        this.setData(data);
    },
    /**
     * 关闭module-popup弹框
     * @param str
     * @param animated
     */
    utilPage_closeModule(str, animated) {
        let that = this;
        let data = {
            isMask: false,
            isTemplate: false,
        };
        if (animated) {
            setTimeout(() => {
                data = {
                    isMask: false,
                    animated: false
                };
                that.setData(data);
            });
        }
        data[str] = '';
        this.setData(data);
    },
    /**
     * 获取二维码桌台
     * @param qrCode
     * @param resId
     * @param bol
     * @returns {Promise}
     */
    utilPage_isQRcode(qrCode, resId, bol) {
        if (utilCommon.isBoolean(resId)) {
            bol = resId;
            resId = null;
        }
        let promise = new Promise(function (resolve, reject) {
            let data = {
                value: {},
                status: false,
                message: '扫码失败'
            };
            if (qrCode) {
                let rid = queryString.parse(qrCode);
                if (rid && rid.id && rid.id.length > 0) {
                    let id = rid.id;
                    apiService.getQRcodeTable({id}, (res) => {
                        try {
                            if (!res.value) {
                                throw {message: '无效的二维码'}
                            }
                            data.value = {
                                id,
                                type: res.value.type,
                                resId: res.value.resId,
                                tableCode: res.value.tableCode,
                                tableName: res.value.tableName,
                            };
                            data.status = true;
                            data.message = '扫码成功';
                            if (!res.value.resId) {
                                data.status = false;
                                data.message = '无效的二维码';
                            }
                            if (resId) {
                                if (resId !== res.value.resId) {
                                    data.status = false;
                                    data.message = '非当前店铺二维码'
                                }
                            }
                            if (!bol) {
                                if (0 !== Number(res.value.type) && res.value.resId) {
                                    data.status = false;
                                    data.message = '非店铺二维码';
                                    if (!res.value.tableCode) {
                                        data.message = '无效的桌台二维码';
                                    }
                                }
                            }
                            resolve(data);
                        } catch (err) {
                            data.status = false;
                            data.message = err.message;
                            reject(data);
                            console.log('getQRcodeTable报错', err);
                        }
                    });
                } else {
                    reject(data);
                }
            } else {
                reject(data);
            }
        });
        return promise;
    },
    /**
     * 设置店铺就餐模式
     * @param info
     */
    utilPage_setOrderType(info) {
        let data = {//默认堂食
            isOrderType: 0,
            text: '堂食'
        };
        if (this.data.orderType == 1) {
            data.isOrderType = 1;//外卖
            data.text = '外卖';
        } else if (info) {
            data = this.getOrderType(info)
        }
        this.setNavigationBarTitle(data.text + ' - ' + this.data.text);
        this.setData({isOrderType: data.isOrderType});
    },
    /**
     * 获取店铺就餐模式
     * @param info
     * @returns {{isOrderType: number, text: string}}
     */
    utilPage_getOrderType(info) {
        let data = {
            isOrderType: 0,
            text: '堂食'
        };
        if (info.payType == 1) {
            data.isOrderType = 3;//餐后付款
            data.text = '餐后付款';
        } else {
            if (info.dinnerType == 1) {
                data.isOrderType = 2;//自助取餐
                data.text = '自助取餐';
            }
        }
        return data;
    },
    /**
     * 根据二维码获取ID
     * @param q
     */
    utilPage_getQrcodeRid(q) {
        try {
            if (q && q.length > 0) {
                q = decodeURIComponent(q);
                return queryString.parse(q).id;
            } else {
                return;
            }
        } catch (e) {
            console.error(e, '根据二维码获取ID报错');
        }
    },
    utilPage_getQRcodeTable(rid) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            let data = {
                type: null,
                resId: null,
                tableName: null,
                tableCode: null,
                status: 0
            };
            if (!rid) {
                reject(data);
                return;
            }
            apiService.getQRcodeTable(
                {id: rid},
                (rsp) => {
                    try {
                        if (!rsp.value || utilCommon.isEmptyObject(rsp.value)) {
                            data.message = '无效的二维码';
                            failToast(_this, data.message);
                            reject(data);
                            return;
                        }
                        data.resId = rsp.value.resId;
                        data.type = rsp.value.type;
                        if (!data.resId) {
                            data.message = '扫描二维码不正确';
                            failToast(_this, data.message);
                            reject(data);
                            return;
                        } else {
                            data.status = 1;
                        }
                        data.tableCode = rsp.value.tableCode;
                        if (!!data.tableCode) {
                            data.status = 2;
                        }
                        data.tableName = rsp.value.tableName;
                        resolve(data)
                    } catch (err) {
                        data.status = 0;
                        console.error('rid获取resId与tableCode', err, data);
                        reject(data);
                    }
                },
                () => {
                    reject(data);
                }
            )
        })
    },
    failToast() {

    }
};