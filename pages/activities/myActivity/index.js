import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js';
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: ''},
        constant: constant,
        isShowNodata: false,
        orderlist: [],
        pageNo: 1,
        type: '',
        isFinall: false,
        amount: 0,
        restHour: '10',
        restMinute: '00',
        restSecond: '00',
        activityTxt: ''
    },
    onLoad: function(options) {
        wx.hideShareMenu();
        var title = options.type == 'SPLICED' ? '我的拼团' : '我的砍价';
        this.setData({nvabarData:{showCapsule: 1,title: title}})
        this.setData({ activityTxt: options.type == 'SPLICED' ? '拼团' : '砍价' });
        this.setData({ type: options.type });
        this.getData(options.type, 1)
    },
    toProjectDetail: function(e) {
        var activityId = e.currentTarget.dataset.activityid;
        var activityOrderId = e.currentTarget.dataset.activityorderid;
        var productId = e.currentTarget.dataset.productid;
        var id = e.currentTarget.dataset.id;
        var activityType = e.currentTarget.dataset.activitytype;
        if(activityType=="SPLICED")
            wx.navigateTo({ url: "../my-collage/index?id=" + productId + '&activityId=' + activityId + '&activityOrderId=' + activityOrderId });
        else
            wx.navigateTo({ url: "../bargainDetail/index?id=" + productId + '&activityId=' + activityId + '&activityOrderId=' + activityOrderId });
    },
    toOrderDetail: function(e) {
        var orderid = e.currentTarget.dataset.orderid;
        wx.navigateTo({ url: "/pages/orderDetail/index?id=" + orderid });
    },
    toPayOrder:function(e){
        var productId = e.currentTarget.dataset.productid;
        var aorderid = e.currentTarget.dataset.aorderid;
        var activityId = e.currentTarget.dataset.activityid;
        wx.navigateTo({ url: "/pages/payOrder/index?paytype=6&orderType=BARGAIN&id=" + productId +'&activityOrderId='+aorderid + '&activityId=' + activityId });
    },
    toPayorder1:function(e){
        var productid = e.currentTarget.dataset.pid;
        var activityid = e.currentTarget.dataset.id;
        var activityorderid = e.currentTarget.dataset.aoid;
        var spid = e.currentTarget.dataset.spid;
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + spid
        });
    },
    getData: function(type, pageNo) {
        var obj = {
            providerId: wx.getStorageSync('providerId'),
            activityType: type,
            pageNo: pageNo,
            pageSize: 10
        }
        activitiesService.myOrder(obj).subscribe({
            next: res => {
                if (res.length < 10) {
                    console.log("到底了");
                    this.setData({ isFinall: true });
                } else {
                    this.setData({ isFinall: false });
                }
                for(var i=0;i<res.length;i++){
                    res[i].productName = res[i].productName.length>30?res[i].productName.substring(0,30)+'...':res[i].productName
                }
                if (pageNo == 1) {
                    this.setData({ orderlist: res });
                } else {
                    this.setData({ orderlist: this.data.orderlist.concat(res) });
                }
                this.setData({ isShowNodata: this.data.orderlist.length == 0 });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    //下拉刷新
    onPullDownRefresh:function() {
        this.setData({ pageNo: 1 });
        this.getData(this.data.type, 1);
    },
    joinCollage:function(e) {
        var pid = e.currentTarget.dataset.pid;
        var activityid = e.currentTarget.dataset.id;
        var activityorderid = e.currentTarget.dataset.aoid;
        var spid = e.currentTarget.dataset.spid;
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + pid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + spid  
        });
    },
    //上拉加载
    onReachBottom:function() {
        if (this.data.isFinall) {
            return;
        }
        var pageNo = this.data.pageNo + 1;
        this.getData(this.data.type, pageNo);
    },
    onShareAppMessage:function(res) {
        var nickName = JSON.parse(wx.getStorageSync('userinfo')).nickName;
        var activityId = res.target.dataset.id;
        var gender = JSON.parse(wx.getStorageSync('userinfo')).gender==1?'他':'她';
        var activityOrderId = res.target.dataset.aoid;
        var picId = res.target.dataset.pic;
        var productName = res.target.dataset.productname;
        var price = res.target.dataset.price;
        if (this.data.type=='SPLICED') {
            return {
                title: '嗨！便宜一起拼￥' + price + '【' + productName + '】',
                path: '/pages/login/index?pagetype=5&type=SPLICED&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
            }
        }
        if (this.data.type === 'BARGAIN') {
            var oprice = res.target.dataset.oprice;
            return {
                title: nickName + '邀请你帮'+gender+'砍价，' + price + '元得原价'+oprice+'元的' + productName,
                path: '/pages/login/index?pagetype=5&type=BARGAIN&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
            }
        }
    },
});