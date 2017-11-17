const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService'),
    Amap = require('../../../utils/amap');
// 默认数据
const SHOP_PAGES = {
    shopList: [
        {
            img: '/images/shop/eat.png',
            name: '堂食',
            url: '/pages/shop/order/order',
            orderType: 0
        },
        {
            img: '/images/shop/takeaway.png',
            name: '外卖',
            url: '/pages/shop/takeaway/takeaway',
            orderType: 1
        }
    ],
    topImages: [],
    topInfoList: [
        '暂无公告'
    ]
};
const appPage = {
    data: {
        text: "Page home",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        options: {},
        isShareCurrentPage: false,//是否分享首页
        isTableCode: false,//是否带桌台号
        imageServer: config.imageUrl,//图片服务器地址
        userInfo: null,//微信获取的用户信息
        qrcodeInfo: {},
        topImages: [],//banner图片列表
        shopInfo: {
            lat: 0,
            lng: 0,
            resId: '',
            resLogo: '',
            resName: '',
            resAddress: '',
            resPhone: '',
            resOperation: 0,
            resEndTime: '00:00',
            resStarTime: '00:00',
            resIntro: ''
        },
        specialServiceList: [],//提供服务
        topInfoList: [],
        shopList: [],//店铺就餐方式列表
        memberCardDto: {//会员卡信息
            memberTypeDiscount: 0,//折扣
            memberBalance: 0,//余额
            memberIntegral: 0,//积分
        },
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
    onReady: function () {
        // 页面渲染完成
        this.data.isShow = true;
    },
    onShow: function () {
        // 页面显示
        if (this.data.isShow && this.data.resId) {
            this.getMainInfo();
            this.getCommonBannerList();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getMainInfo().then(() => {
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
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.openId = rsp.value.openId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    ApiService.token = rsp.value.token;
                    that.judgeJumpMode();
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
            resId = that.data.resId;
        if (!resId || resId.length === 0) return;
        that.getMainInfo().then(
            () => {
                let isOrderType = that.utilPage_getOrderType(that.data.shopInfo.restaurantBusinessRules).isOrderType;
                if (that.data.isTableCode) {
                    if (isOrderType == 0) {
                        goOrderPage();
                    } else if (isOrderType == 3) {
                        ApiService.checkHasWaitPayConsumer(
                            {
                                openId: that.data.openId,
                                tableCode: that.data.qrcodeInfo.tableCode,
                                resId: resId,
                            },
                            (rsp) => {
                                if (2000 == rsp.code) {
                                    util.go('/pages/order/order-detail/order-detail', {
                                        data: {
                                            tableCode: that.data.qrcodeInfo.tableCode,
                                            resId: resId,
                                            consumerId: rsp.value.consumerId
                                        }
                                    });
                                } else if (2001 == rsp.code) {
                                    goOrderPage();
                                } else {
                                    util.showToast(rsp.message);
                                }
                            }
                        );
                    }
                }
            });
        that.getCommonBannerList();//获取banner图
        function goOrderPage() {
            util.go('/pages/shop/order/order',
                {
                    data: {
                        orderType: 0,
                        resId: that.data.resId,
                        tableCode: that.data.qrcodeInfo.tableCode,
                        tableName: that.data.qrcodeInfo.tableName
                    }
                }
            )
        }
    },
    /**
     * 判断跳转进入模式
     */
    judgeJumpMode() {
        let that = this,
            options = this.data.options;
        if (options.resId) {
            console.warn('分享&进店铺模式');
            that.data.resId = options.resId;
            that.data.isShow = false;
            that.checkIsFirstUse();
            that.loadData();
        } else if (options.q) {
            console.warn('扫码模式');
            that.data.isShow = false;
            let rid = that.utilPage_getQrcodeRid(options.q);
            that.utilPage_getQRcodeTable(rid).then(
                (rsp) => {
                    if (rsp.status > 0) {
                        that.data.qrcodeInfo = rsp.value;
                        that.data.resId = rsp.value.resId;
                        if (rsp.value.tableCode && rsp.value.tableCode.length > 0) {
                            that.data.isTableCode = true;
                        }
                        that.checkIsFirstUse();
                        that.loadData();
                    } else {
                        setTimeout(function () {
                            util.go('/pages/init/init', {
                                type: 'tab'
                            })
                        }, 1500)
                    }
                },
                (err) => {
                    setTimeout(function () {
                        util.go('/pages/init/init', {
                            type: 'tab'
                        })
                    }, 1500)
                })
        } else {
            util.go('/pages/init/init', {
                type: 'tab'
            })
        }
    },
    /**
     * 添加会员卡
     */
    checkIsFirstUse(cb) {
        let that = this,
            openId = that.data.openId,
            resId = that.data.resId,
            userInfo = that.data.userInfo;
        let data = {
            openId,
            resId
        };
        if (userInfo && !utilCommon.isEmptyObject(userInfo)) {
            Object.assign(data, {
                nikeName: userInfo.nickName,
                sex: userInfo.gender,
                headImgUrl: userInfo.avatarUrl,
            })
        }
        ApiService.checkIsFirstUse(data, cb);
    },
    /**
     * 获取店铺信息
     */
    getMainInfo() {
        let that = this, openId = this.data.openId, resId = this.data.resId;
        return new Promise((resolve, reject) => {
            ApiService.getMainInfo(
                {openId, resId},
                (rsp) => {
                    if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        let shopList = SHOP_PAGES.shopList,
                            resDetailDto = rsp.value.resDetailDto,//店铺信息
                            memberCardDto = rsp.value.memberCardDto,//会员卡信息
                            specialServiceList = rsp.value.specialServiceList;//店铺服务列表;
                        that.utilPage_setNavigationBarTitle(resDetailDto.resName);//设置导航栏信息
                        util.extend(shopList[0], resDetailDto.restaurantBusinessRules);//堂食
                        util.extend(shopList[1], resDetailDto.takeoutBusinessRules);//外卖
                        let topInfoList = this.data.topInfoList;
                        if (resDetailDto.notice) {
                            topInfoList = [];
                            topInfoList.push(resDetailDto.notice);
                        } else {
                            topInfoList.push('欢迎使用微信小程序点餐！！！');
                        }
                        that.setData({
                            shopInfo: resDetailDto,//店铺信息
                            specialServiceList,//店铺服务列表
                            shopList,//店铺点餐列表
                            memberCardDto,//会员卡信息
                            topInfoList
                        });

                        app.globalData.memberCardDtos[resId] = memberCardDto;
                        app.globalData.resDetailDtos[resId] = resDetailDto;
                        that.utilPage_setShopCartsStorage();
                    }
                },
                (err) => {
                    if (err.status) {

                    }
                    that.setData({hasMoreData: true});
                    resolve();
                }
            );
        })
    },
    /**
     * 获取banner图片列表
     */
    getCommonBannerList() {
        let _this = this,
            resId = this.data.resId;
        ApiService.getCommonBannerList(
            {resId},
            (res) => {
                let topImages = SHOP_PAGES.topImages.concat(res.value);
                _this.setData({
                    topImages
                })
            }
        );
    }
};
const events = {
    /**
     * 绑定扫码跳跳堂食点餐页功能
     * @param e
     */
    bindAzmScanCode(e) {
        let _this = this,
            dataset = e.currentTarget.dataset,
            type = dataset.type,
            value = dataset.value,
            url = dataset.url;
        let isOrderType = this.utilPage_getOrderType(value).isOrderType;
        if (0 == type && 3 === isOrderType) {
            util.go('/pages/shop/home_scanCode/home_scanCode', {
                data: {
                    resId: _this.data.resId
                }
            });
        } else {
            util.go(url, {
                data: {
                    resId: _this.data.resId
                }
            });
        }
    },
    /**
     * 打开微信内置地图功能
     */
    bindOpenMap() {
        let that = this,
            shopInfo = that.data.shopInfo,
            latitude = shopInfo.lat,
            longitude = shopInfo.lng,
            address = shopInfo.resAddress,
            name = shopInfo.resName;
        wx.openLocation({
            latitude,
            longitude,
            scale: 18,
            address,
            name
        })
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));