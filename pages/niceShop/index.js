var util = require('../../utils/util.js');
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
import { service } from '../../service.js';

Page({
    data: {
        nvabarData: {showCapsule: 1,title: '好店礼券'},
        providerId:'',
        productList: [],
        isShowNodata: false,
        pageNo: 1,
        ifBottom: false
    },
    onLoad: function(options) {
        this.setData({providerId: wx.getStorageSync('providerId')});
        this.getData(); //获取活动列表
    },
    onReachBottom: function() {
        if (this.data.ifBottom) { //已经到底部了
            return;
        } else {
            this.setData({
                pageNo: this.data.pageNo + 1
            })
            this.getData();
        }
    },
    getData: function(status) {
        var obj = {
            providerId: this.data.providerId,
            subject:"好店礼券",
            sortField: 'IDX',
            sortOrder: 'ASC',
            pageNo: this.data.pageNo,
            pageSize: 10,
            longitude: wx.getStorageSync('curLongitude'),
            latitude: wx.getStorageSync('curLatitude')
        };
        service.getRecommendPage(obj).subscribe({
            next: res => {
                this.setData({
                    productList: this.data.productList.concat(res.list),
                    isShowNodata: this.data.pageNo==1 && res.list.length==0
                });
            },
            error: err => {},
            complete: () => wx.hideToast()
        });
    },
    toNextDetail: function(e) {
        var type = e.currentTarget.dataset.type;
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        var actId = e.currentTarget.dataset.actid;
        if (type == 'SPLICED') {
            wx.navigateTo({
                url: '/pages/activities/splicedDetail/index?id=' + id + '&activityId=' + actId
            });
        } else if (type == "BARGAIN") {
            wx.navigateTo({
                url: '/pages/activities/bargainDetail/index?id=' + id + '&activityId=' + actId
            });
        } else if (type == "SEC_KILL") {
            wx.navigateTo({
                url: '/pages/activities/secondDetail/index?id=' + id + '&activityId=' + actId
            });
        } else {
            wx.navigateTo({
                url: '/pages/comDetail/index?share=0&id=' + id + '&storeid=' + storeid
            });
        }
    },
    //跳转到商品详情
    toComDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=0&id=' + id + '&storeid=' + storeid
        });
    },
    // 分享
    toComDetailAndShare: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=1&id=' + id + '&storeid=' + storeid
        });
    },
});