import { errDialog, loading,barcode,formatDate} from '../../utils/util';
import { service} from '../../service';
import { constant} from '../../utils/constant';
var app = getApp();
var timer = null;
Page({
  data: {
    nvabarData: {
        showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
        title: '订单详情', //导航栏 中间的标题
    },
    orderId:'',
    orderInfo: {},
    amount: 0,
    preOrderStr:'',
    constant: constant,
    voucherInfo:{},
    vouchers:[],
    validEndDate:'',
    isTimeOpen:false,
    storeInfo:{},
    productType:''
  },
  onLoad: function(options) {
    clearInterval(timer);
    wx.setNavigationBarTitle({title: '订单详情'});
    wx.hideShareMenu();
    this.getData(options.id);
    this.setData({orderId: options.id});
  },
  toComment: function(e) {
    var id = e.currentTarget.dataset['id'];
    var pid = e.currentTarget.dataset['pid'];
    wx.navigateTo({url: "/pages/comment/index?id="+id+"&pid=" + pid});
  },
  reFund:function(){
    wx.showModal({
      title: '订单号已复制',
      content: '请联系客服进行退款',
      cancelText:'关闭',
      confirmText:'联系客服',
      success:(res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '../user/index'
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  getData: function(orderId) {
    service.orderInfo({orderId: orderId,lng:wx.getStorageSync('curLongitude'),lat:wx.getStorageSync('curLatitude')}).subscribe({
      next: res => {
        this.setData({orderInfo: res});
        this.setData({preOrderStr:res.preOrderStr});
        this.setData({storeInfo:res.orderItemList.length>0?res.orderItemList[0]:{}});
        if(res.status=='PAID'){
          if(!this.data.isTimeOpen&&res.vouchers.length>0){
            console.log("获取核销码信息")
            this.getListVoucher(res.vouchers[0].voucherCode);
          }
        }
        this.setData({vouchers:res.vouchers});
        if(res.status=='CONSUME'||res.status=='FINISH'){
          console.log('已完成的订单');
          clearInterval(timer);
          this.setData({isTimeOpen:false});
          console.log('关闭定时器');
          console.log(timer);
          if(!this.data.isTimeOpen&&res.vouchers.length>0){
            this.getListVoucher(res.vouchers[0].voucherCode);
          }
        }
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  copyBtn: function (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.str,
      success: (res) => {
        wx.showToast({title: '复制成功'});
      }
    });
  },
  toMap: function(e){
    console.log(e);
    if (e.currentTarget.dataset.lat && e.currentTarget.dataset.lng){
      wx.navigateTo({
        url: '/pages/map/index?lat=' + e.currentTarget.dataset.lat + '&lng=' + e.currentTarget.dataset.lng,
      });
    }
  },
  toMerchantsList:function(){
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.storeInfo.productId
    });
  },
  callPhone: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel
    });
  },
  onUnload:function(){
    clearInterval(timer);
    this.setData({isTimeOpen:false});
  },
  onHide:function(){
    clearInterval(timer);
    this.setData({isTimeOpen:false});
  },
  getListVoucher:function(code){
    var obj = {
      code:code,
      openId:wx.getStorageSync('openid')
    }
    service.listVouchers(obj).subscribe({
      next: res => {
        this.setData({voucherInfo: res[0]});
        console.log(res[0].validEndDate);
        this.setData({validEndDate:res[0].validEndDate.substring(0,10)});
        if(this.data.orderInfo.status=='PAID'&&this.data.voucherInfo.validDays>=0){
          barcode('barcode', this.data.orderInfo.vouchers[0].voucherCode, 664, 136);
          timer = setInterval(()=>{
            this.setData({isTimeOpen:true});
            this.getData(this.data.orderId);
          },2000);
        }
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toPay: function() {
    var payInfo = JSON.parse(this.data.preOrderStr);
    var that = this;
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success(res2) {
        that.getData(that.data.orderId);
      },
      fail(res2) {
        if (res2.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: '用户取消支付',
            icon: 'none'
          });
        }
      }
    });
  }
});


