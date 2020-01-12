import {service} from '../../service';
import { errDialog, loading } from '../../utils/util'
var app = getApp();
Page({
  data: {
    nvabarData: {showCapsule: 0,title: '',isIndex:1},
    showjuzigz: false,
    currentPointObj: {},
    canSignIn: true,
    avatar: '',
    isDisabled:false,
    conHeight:400
  },
  onLoad: function(options) {
    wx.getSystemInfo({
      success: (res) => {
        var conHeight = res.windowHeight-app.globalData.barHeight-45;
        this.setData({conHeight:conHeight})
      }
    });
    wx.hideShareMenu();
    this.getInfo();
    this.currentPoint();
  },
  showDesModal:function(e){
    let des = '';
    switch (e.currentTarget.dataset.mt){
      case '1':des = '今日赚取的桔子数量';break;
      case '2':des = '今日小程序内分享的次数';break;
      case '3':des = '今日完成的赚桔子任务';break;
    }
    wx.showModal({
      title: '',
      content: des,
      showCancel:false
    })
  },
  toIndex: function () {
    wx.switchTab({ url: '../index/index' });
  },
  toMyOrder: function () {
    wx.navigateTo({ url: '/pages/orderlist/index?index=3&status=CONSUME'});
  },
  getInfo: function () {
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
      next: res => {
        this.setData({
          avatar: res.avatar
        });
      },
      // error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  toMyTrade: function(){
    wx.navigateTo({
      url: '/pages/myTrade/index'
    });
  },
  signIn:function(e){
    if(this.data.isDisabled){return}
    service.collectFormIds({
      formId:e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
    this.setData({isDisabled:true});
    service.signIn().subscribe({
      next: res => {
        console.log(res);
        if(res){
          this.setData({
            canSignIn: false
          });
          wx.showToast({
            title: '签到成功！',
            icon: 'none'
          });
          this.currentPoint();
        }
      },
      error: err => {
        this.setData({isDisabled:false});
        errDialog(err);
      },
      complete:()=>{
        this.setData({isDisabled:false});
      }
    });
  },
  currentPoint: function () {
    service.currentPoint().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          currentPointObj:res,
          canSignIn: res.canSignIn
        });
      },
    });
  },
  toggleModal: function() {
      this.setData({
        showjuzigz: !this.data.showjuzigz
      });
  },
  onPullDownRefresh: function() {
    this.getInfo();
    service.currentPoint().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          currentPointObj: res,
          canSignIn: res.canSignIn
        });
      },
      error: err => console.log(err),
      complete: () => {
        setTimeout(() => {
          wx.stopPullDownRefresh()
        }, 1000);
      }
    });
  },
  share: function (obj) {
    service.share(obj).subscribe({
      next: res => {
        console.log('---------分享接口返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  onShareAppMessage: function () {
    var obj = {
      type:'SHARE_PROGRAM',
      sharePath: '/pages/index/index'
    };
    this.share(obj);
    return {
      title: JSON.parse(wx.getStorageSync('userinfo')).nickName +'给您分享了桔集小程序，一起享受好店优惠吧！',
      path: '/pages/login/index?invitecode=' + wx.getStorageSync('inviteCode'),
      imageUrl: '/images/shareImg.png'
    }
  }
})