import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
var app = getApp();
Page({
    data: {
        nvabarData: {
            showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
            title: '我的订单', //导航栏 中间的标题
        },
        tablist: [{ name: '全部', status: 'ALL' }, { name: '待付款', status: 'CREATED' }, { name: '待使用', status: 'PAID' }, { name: '待评价', status: 'CONSUME' }],
        curTabIndex: 0,
        constant: constant,
        isShowNodata: false,
        orderlist: [],
        pageNo:1,
        status:'',
        isFinall:false,
        amount: 0
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '我的订单' });
        wx.hideShareMenu();
        this.setData({ curTabIndex: options.index,status:options.status });
        this.getData(options.status);
    },
    toIndex:function(){
      wx.switchTab({ url: "/pages/index/index" });
    },
    toDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var status = e.currentTarget.dataset.status;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + id });
    },
    toComment: function(e) {
        var id = e.currentTarget.dataset['id'];
        var pid = e.currentTarget.dataset['pid'];
        wx.navigateTo({ url: "/pages/comment/index?id=" + id + "&pid=" + pid });
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        var thisStatus = e.currentTarget.dataset.status;
        if(thisStatus==this.data.status){return}
        this.setData({ curTabIndex: thisIndex, status: thisStatus });
        this.setData({ isFinall:false,pageNo: 1,orderlist:[] });
        this.getData(thisStatus);
    },
    getData: function(status) {
        var obj = {
            status: status,
            pageNo: this.data.pageNo,
            pageSize: 10
        }
        service.orderlist(obj).subscribe({
            next: res => {
                this.setData({ 
                    orderlist: this.data.orderlist.concat(res.content),
                    isFinall: res.content.length == 0 ? true : false
                });
                this.setData({ isShowNodata: this.data.orderlist.length == 0 });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    //下拉刷新
    onPullDownRefresh:function() {
        this.setData({ pageNo: 1 });
        this.getData(this.data.status);
    },

    //上拉加载
    onReachBottom:function() {
        if(this.data.isFinall){
            return;
        }
        this.setData({
            pageNo: this.data.pageNo + 1
        })
        this.getData(this.data.status);
    },

    toPay: function(e) {
      let that = this;
        var payInfo = JSON.parse(e.currentTarget.dataset['pre']);
        wx.requestPayment({
            timeStamp: payInfo.timeStamp,
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success(res2) {
                that.setData({ curTabIndex: 2 });
                that.getData('PAID');
                that.setData({ isFinall: false, pageNo: 1 });
                wx.navigateTo({ url: "/pages/orderDetail/index?id=" + e.currentTarget.dataset['id'] });
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