import {
  service
} from '../../service';
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    loginStatus: true
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {
      // var timer = setInterval(() => {
      //   if (wx.getStorageSync('accessToken')) {
      //     clearInterval(timer);
      //   }
      //   this.getMyInfo();
      // }, 50);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    catchModalTap: function() {
      console.log('拦截模态窗口触摸事件');
    },
    getMyInfo: function() {
      service.getMyInfo().subscribe({
        next: res => {
          if (res.name) {
            console.log('-------组件获取到了用户信息，用户是已注册状态-------');
            console.log(res);
            app.globalData.userInfo = res;
            this.setData({
              loginStatus: true
            });
          } else {
            console.log('-------组件没有获取到用户信息，用户是新注册状态-------');
            this.setData({
              loginStatus: false
            });
          }
        }
      })
    },
    getLoginInfo: function(e) {
      wx.showLoading({
        title: '授权中',
      });
      let that = this;
      var userInfo = e.detail.userInfo;
      console.log(userInfo)
      service.userUpdate({
        mobile: "",
        name: userInfo.nickName,
        img: userInfo.avatarUrl,
        sex: userInfo.gender,
        city: userInfo.city
      }).subscribe({
        next: res => {
          console.log('--------组件提示新用户注册成功--------');
          this.getMyInfo();
          wx.hideLoading();
        },
        error: err => errDialog(err),
        complete: () => wx.hideToast()
      })
    }
  }
})