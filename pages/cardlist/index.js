import {
  constant
} from '../../utils/constant';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: '卡 包'},
    cardList: [],
    current: 0,
    payUrl: 'https://juji.juniuo.com',
    noCards: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },
  toRecord: function(e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/payrecord/index?merchantId=' + e.currentTarget.dataset.mid,
    })
  },
  toggleCard: function(e) { //切换卡片高度
    console.log(e);
    this.setData({
      current: e.currentTarget.dataset.index
    });
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
    // wx.setStorageSync('scene', '1011'); //测试用
    let scene = wx.getStorageSync('scene');
    if (scene == '1011' || scene == '1012' || scene == '1013') { //扫描二维码场景值
      if (wx.getStorageSync('accessToken')) {
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
        wx.request({
          url: this.data.payUrl + '/mini/mycard.json',
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'Access-Token': wx.getStorageSync('accessToken')
          },
          success: (res) => {
            console.log(res);
            if (res.data.errorCode == '0') {
              console.log(this.data.cardList)
              this.setData({
                cardList: res.data.data
              });
              if (res.data.data.length > 0) {
                this.setData({
                  noCards: false
                });
              } else {
                this.setData({
                  noCards: true
                });
              }
            } else {
              wx.showModal({
                title: '错误：' + res.data.errorCode,
                content: res.data.errorInfo,
              })
            }
          }
        })


      } else {
        wx.showModal({
          title: '',
          content: '未获取到accessToken',
        });
        this.setData({
          noCards: true
        });
      }

      // return;
    } else {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

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