var util = require('../utils/util.js');
var app = getApp();
//微信请求
function httpRequest(url, params, callBack) {
  if (!url) return;
  var init = util.initPay(params);
  var url = url + "?" + init;
  wx.request({
    url: url,
    //data: params,
    method: 'POST',
    success: function (res) {
      callBack(res.data);
    },
    fail: function () {
      console.log("网络连接失败，或服务器错误");
    }
  })
}

function httpGet(url, params, callBack) {
  if (!url) return;
  var init = util.initPay(params);
  var url = url + "?" + init;
  wx.request({
    url: url,
    //data: params,
    method: 'GET',
    success: function (res) {
      callBack(res.data);
    },
    fail: function () {
      console.log("网络连接失败，或服务器错误");
    }
  })
}

function httpFormRequest(url, params, callBack) {
  if (!url) return;
  // console.log(url);
  // console.log(params);
  var init = util.initPay(params);
  var url = url + "?" + init;
  wx.request({
    url: url,
    //data: params,
    method: 'POST',
    success: function (res) {
      callBack(res.data);
      // console.log('测试');
      // console.log(res);
    },
    fail: function () {
      console.log("网络连接失败，或服务器错误");
    }
  })
}
module.exports = {
  httpFormRequest: httpFormRequest,
  httpRequest: httpRequest,
  httpGet: httpGet
}
