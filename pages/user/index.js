import { errDialog, loading } from '../../utils/util';
import { service } from '../../service';
import { constant } from '../../utils/constant';
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 0,title: '我 的',isIndex:1},
        nickName: '***',
        avatar: '',
        phoneNum: '',
        bindPhone: "",
        conHeight:400,
        topValue:0
    },
    toJuzi: function() {
        wx.switchTab({ url: '../juzi/index' });
    },
    toPage: function(e) {
        var page = e.currentTarget.dataset.page;
        console.log(page);
        wx.navigateTo({ url: page });
    },
    onLoad: function() {
        wx.getSystemInfo({
          success: (res) => {
            var conHeight = res.windowHeight-app.globalData.barHeight-45;
            this.setData({conHeight:conHeight})
          }
        });      
        this.getInfo();
    },
    getInfo: function() {
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    nickName: res.nickName,
                    phoneNum: res.phone,
                    avatar: res.avatar
                });
            },
            complete: () => wx.hideToast()
        })
    },
    bindPhone: function() {
        var bindPhone = this.data.bindPhone;
        service.bindPhone({ phone: bindPhone }).subscribe({
            next: res => {
                wx.showToast({
                    title: "绑定成功",
                    icon: "success"
                });
                this.setData({ phoneNum: this.data.bindPhone });
            },
            error: err => { console.log(err) },
            complete: () => wx.hideToast()
        })
    },
    getUserPhoneNumber: function(e) {
        var errMsg = e.detail.errMsg;
        if (errMsg = 'getPhoneNumber:ok') {
            let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
            service.decodeUserPhone(data).subscribe({
                next: res => {
                    this.setData({ bindPhone: res.phoneNumber });
                    this.bindPhone();
                },
                error: err => { console.log(err) },
                complete: () => wx.hideToast()
            })
        }
    },
    callPhone: function() {
        wx.makePhoneCall({
            phoneNumber: '4000011139',
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.getInfo();
    }
});