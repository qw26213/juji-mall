import { jugardenService } from '../shared/service.js'
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
Page({
  data: {
    nvabarData: {showCapsule: 1,title: '订单详情'},
    productUrl: '/images/newerGetBg.png',
    phone: '15210921650',
    orderInfo:{}
  },
  onLoad: function (options) {
    this.getData(options.id);
  },
  onTelClick:function() {
    let self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.phone
    })
  },
  getData:function(id){
      jugardenService.getIncomeOrder({orderNo:id}).subscribe({
          next: res => {
            this.setData({orderInfo:res});
          },
          error: err => errDialog(err),
          complete: () => wx.hideToast()
      })
  }
})