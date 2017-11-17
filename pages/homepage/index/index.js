//index.js
//获取应用实例
var app = getApp()
Page({
  data: {},
  onLoad: function (options) {
    var resId=options.resid;
    //  console.log(resId);
    var that=this;
     //距离的计算（两个经纬度之间的距离
    wx.getLocation({
      type: 'wgs84', 
      success: function(res){
          // console.log(res);
          var lat=res.latitude;
          var lng=res.longitude;
          that.setData({
            lat:lat,
            lng:lng
          });  
          //查询店铺详细信息
          wx.request({
              url: app.globalData.serverAddress+'loadResDetailData.view',
              data: {
                  resId:resId,
                  openId:app.globalData.openId,
                  lat:that.data.lat,
                  lng:that.data.lng
              },
              method: 'POST',
              success: function(res){
                // console.log('获取店铺详细信息');
                // console.log(res.data.data.distance);
                //把店铺详细信息添加到全局中去
                app.globalData.fandian=res.data.data;
                var resDetailData=res.data.data;
                // console.log(resDetailData);
                //获取所有优惠券
                if(res.data.data.coupon.length>0){
                  var coupon=resDetailData.coupon[0];
                  // console.log(coupon);
                  wx.request({
                    url: app.globalData.serverAddress+'getCouPon.view',//领取优惠券
                    data: {
                      openId:app.globalData.openId,
                      couponId:coupon.id
                    },
                    method: 'POST',
                    success: function(res){
                      // console.log('优惠券');
                      // console.log(res);
                    },
                    fail: function() {
                      console.log('失败了');
                    }
                  })
                  // console.log(resDetailData);
                };
                //homepage页面的banner部分
                var str=app.globalData.serverAddressImg;
                var img=str+resDetailData.banners[0].imagePath;
                //设置imagePath的路径为img
                resDetailData.banners[0].imagePath=img;
                  //把banner加入到gloablData中
                app.globalData.banner=img;
                //从全局拿店铺公告resMemberNotice
                var resMemberNotice = app.globalData.resMemberNotice;
                //把商家介绍添加到globalData中，
                app.globalData.intro=resDetailData.restaurant.intro;
                //resDetailData注入页面
                that.setData({
                    resDetailData: resDetailData,
                    resMemberNotice: resMemberNotice,
                    distance:res.data.data.distance
                });
                // console.log(resMemberNotice);
              },
              fail:function(){
                console.log('失败了');
              }
          })  
      },
      fail:function(){
        console.log('失败了');
      }
    });
  },
  
})
