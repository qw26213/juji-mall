import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 0,title: '桔 集',isIndex:1},
        inviteCode: '',
        openId: '',
        showPageLoading: true,
        noPath: false,
        pageType: 0, //0为首页，1为商品详情页分享，2为桔园邀新分享，3为扫码分享，4为素材分享，5为拼团砍价分享, 6为秒杀分享
        pageData: {},
        pageFromCode: 1,//1为商品详情，2为邀新，默认1
        sharePersonOpenId:'',
        shareProductId:'',
        scene:''//扫码进入
    },
    onLoad: function(options) {
        console.log('---------授权页面----------');
        console.log(JSON.stringify(options));
        if (options.pagetype) {
            this.setData({ pageType: options.pagetype });
        }
        if (options.scene) {
          console.log("扫码进入");
          this.setData({scene:decodeURIComponent(options.scene)});
          this.setData({ pageType: 3 });
        }
        this.setData({ pageData: options });
        // 小程序码进来的话
        this.next();
    },
    next: function() {
        wx.getSetting({
            success: (res) => {
                console.log('userInfoStatus='+res.authSetting['scope.userInfo']);
                if (res.authSetting['scope.userInfo']) {
                    if(this.data.pageType==3){
                        this.getValueByscene(this.data.scene,1);
                    }else{
                        // 正常用户先登录再进行下一步;
                        this.preLogin1("",this.data.scene);
                    }
                } else {
                  this.setData({showPageLoading: false});
                  if(this.data.pageType==3){
                    this.getValueByscene(this.data.scene,2);
                  }
                }
            }
        });
    },
    // type=1是已经授权过
    getValueByscene: function(scene,type) {
        wx.request({
            url: constant.apiUrl + '/qr/getBySceneId.json?sceneId=' + scene,
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: (res) => {
                console.log("解析小程序码")
                console.log(JSON.stringify(res));
                if (res.data.data.productId == 'invitenew') {
                    this.setData({pageFromCode:2});
                } else {
                    this.setData({pageFromCode:1});
                }
                this.setData({
                    sharePersonOpenId: res.data.data.openId,
                    shareProductId:res.data.data.productId
                });
                if (type == 1) {
                    this.nextPage();
                }
            }
        });
    },
    // 已授权调
    preLogin1: function(inviteCode,scene) {
        var obj = {
            rawData: '',
            inviteCode: inviteCode,
            scene:scene
        };
        this.login(obj).then(() => {
            this.nextPage();
        });
    },
    // 未授权调
    preLogin2: function(rawData, inviteCode,scene) {
        var obj = {
            rawData: rawData,
            inviteCode: inviteCode,
            scene:scene
        };
        this.login(obj).then(() => {
            this.nextPage();
        });
    },
    nextPage:function(){
      console.log("走下一页");
      console.log('pageType===='+this.data.pageType);
      if(this.data.pageType==0){
        var referer = this.data.pageData.inner?1:4;
        wx.reLaunch({url: '/pages/index/index?referer='+referer});
      }
      if(this.data.pageType==1){
        var referer = this.data.pageData.inner?1:5;
        wx.reLaunch({url: '/pages/comDetail/index?referer='+referer+'&id='+this.data.pageData.pid+'&storeid='+this.data.pageData.storeid+'&invitecode='+this.data.pageData.invitecode});
      }
      if(this.data.pageType==2){
        wx.reLaunch({url: '/pages/jujiGarden/gardenIndex/index?openid=' + this.data.pageData.openid});
      }
      if(this.data.pageType==3){
       if(this.data.pageFromCode==1){
          //商品扫码 
          wx.reLaunch({url: '/pages/comDetail/index?referer=2&id=' + this.data.shareProductId + '&invitecode='+this.data.pageData.invitecode});
       }else{
          //邀新扫码
          wx.reLaunch({url: '/pages/jujiGarden/gardenIndex/index?openid=' + this.data.sharePersonOpenId});
       }
      }
      if(this.data.pageType==4){
        var referer = this.data.pageData.inner?1:5;
        wx.reLaunch({url: '/pages/comDetail/index?referer='+referer+'&id=' + this.data.pageData.pid + '&storeid=' + this.data.pageData.storeid + '&sceneid=' + this.data.pageData.sceneid});
      }
      if(this.data.pageType==5) {
        if(this.data.pageData.activityOrderId){
            if (this.data.pageData.type == 'BARGAIN') {
              wx.reLaunch({ url: '/pages/activities/bargainDetail/index?id='+this.data.pageData.pid+'&activityId=' + this.data.pageData.activityId + '&activityOrderId=' + this.data.pageData.activityOrderId+'&invitecode='+this.data.pageData.invitecode });
            } else {
              console.log('拼团分享进入');
              wx.reLaunch({ url: '/pages/activities/splicedDetail/index?id='+this.data.pageData.pid+'&activityId=' + this.data.pageData.activityId + '&activityOrderId=' + this.data.pageData.activityOrderId + '&progressId=' + this.data.pageData.progressId+'&invitecode='+this.data.pageData.invitecode});
            }
        }else{
            if (this.data.pageData.type == 'BARGAIN') {
                wx.reLaunch({
                    url: '/pages/activities/bargainDetail/index?id=' + this.data.pageData.pid + '&activityId=' + this.data.pageData.activityId+'&invitecode='+this.data.pageData.invitecode
                });
            } else { //拼团
                wx.reLaunch({
                    url: '/pages/activities/splicedDetail/index?id=' + this.data.pageData.pid + '&activityId=' + this.data.pageData.activityId+'&invitecode='+this.data.pageData.invitecode
                });
            }
        }
      }
      if(this.data.pageType==6){
            wx.reLaunch({
                url: '/pages/activities/secondDetail/index?id=' + this.data.pageData.pid + '&activityId=' + this.data.pageData.activityId + '&invitecode=' + this.data.pageData.invitecode
            });
        }
    },
    getUserInfo: function(e) {
        if (e.detail.userInfo) {
            wx.setStorageSync('rawData', e.detail.rawData);
            var rawData = e.detail.rawData;
            console.log('点击授权登录按钮');
            console.log('pageType===='+this.data.pageType);
            console.log(JSON.stringify(this.data.pageData));
            var invitecode = this.data.pageData.invitecode?this.data.pageData.invitecode:'';
            this.preLogin2(rawData, invitecode,this.data.scene);
        }
    },
    login: function(obj) {
        return new Promise(function(resolve1, reject1) {
            wx.login({
                success: res => {
                    console.log('code: ' + res.code);
                    console.log(constant.APPID);
                    resolve1(res.code);
                }
            });
        }).then(function(code) {
            return new Promise(function(resolve2, reject2) {
                console.log("登录请求inviteCode="+obj.inviteCode);
                console.log("登录请求scene="+obj.scene);
                wx.request({
                    url: constant.apiUrl + '/user/login.json',
                    method: 'GET',
                    data: {
                        code: code,
                        appId: constant.APPID,
                        isMock: false, //测试标记
                        inviteCode: obj.inviteCode,
                        rawData: obj.rawData,
                        sceneId: obj.scene
                    },
                    header: {
                        'content-type': 'application/json',
                    },
                    success: (res1) => {
                        console.log(res1);
                        if (res1.data.errorCode == '200') {
                            console.log('登录成功，拿到token');
                            wx.setStorageSync('token', res1.data.data.token);
                            wx.setStorageSync('openid', res1.data.data.openId);
                            wx.setStorageSync('inviteCode', res1.data.data.inviteCode);
                            wx.setStorageSync('userinfo', JSON.stringify(res1.data.data));
                            resolve2();
                        } else {
                            reject2('登录失败，错误码:' + res1.data.errorCode + ' 返回错误: ' + res1.data.errorInfo);
                        }
                    },
                    fail: (err) => {
                        reject2(err.errMsg);
                    }
                });
            });
        }).catch(function(err) {
            console.log(err);
            wx.showModal({
                title: '错误',
                content: err
            });
        });
    }
})