import {
  constant
} from '../../utils/constant';
import {
  barcode
} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: '消费详情'},
    orderId: '',
    dataInfo: {},
    payUrl: 'https://juji.juniuo.com'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.id);
    if (options.id) {
      let payUrl = wx.getStorageSync('payUrl');
      if (payUrl) {
        this.setData({
          payUrl: payUrl
        });
      } else {
        this.setData({
          payUrl: constant.jujipayUrl
        });
      }
      this.setData({
        orderId: options.id
      });
      barcode('barcode', options.id, 664, 136);
      // barcode('barcode2', options.id, 664, 136);
      wx.request({
        url: this.data.payUrl + '/mini/getOrdersDetail.json',
        method: 'GET',
        data: {
          orderId: options.id
        },
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          console.log(res);
          if (res.data.errorCode == '0') {
            this.setData({
              dataInfo: res.data.data
            });

          } else {

          }
        }
      })
    } else {
      wx.showModal({
        title: '网络错误',
        content: '未能获取到订单id',
      });
      return;
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})