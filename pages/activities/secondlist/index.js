var util = require('../../../utils/util.js');
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js'

Page({
    data: {
        nvabarData: {showCapsule: 1,title: '限时秒杀'},
        providerId: '',
        productList1: [],
        productList2: [],
        isShowNodata: false,
        curIndex:1,
        pageNo1: 1,
        pageNo2: 1,
        ifBottom: false,
        curActivityStatus:'STARTED',
        isBack:false
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '限时秒杀' });
        this.setData({providerId: wx.getStorageSync('providerId')});
        this.getActivityList('STARTED');
        this.getActivityList('READY');
    },
    onHide: function() {
        this.setData({
            productList1: [],
            productList2: [],
            isShowNodata: false,
            pageNo1: 1,
            pageNo2: 1,
            ifBottom: false,
            isBack: true
        });
    },
    getData:function(){
        this.getActivityList('STARTED');
        this.getActivityList('READY');
    },
    onShow: function() {
        this.setData({curIndex: 1});
        if (this.data.isBack) {
            this.getActivityList('STARTED');
            this.getActivityList('READY');
        }
    },
    onReachBottom: function() {
        if(this.data.curActivityStatus=='STARTED'){
            if (this.data.ifBottom1) { //已经到底部了
                return;
            } else {
                this.setData({
                    pageNo1: this.data.pageNo1 + 1
                })
                this.getActivityList('STARTED');
            }
        }else{
            if (this.data.ifBottom2) { //已经到底部了
                return;
            } else {
                this.setData({
                    pageNo1: this.data.pageNo2 + 1
                })
                this.getActivityList('READY');
            }
        }
    },
    activeTab:function(e){
        var index = e.currentTarget.dataset.index;
        this.setData({curIndex:index});
        if(index==1){
            this.setData({ isShowNodata: this.data.productList1.length == 0 });
        }else{
            this.setData({ isShowNodata: this.data.productList2.length == 0 });
        }
    },
    getActivityList: function(status) {
        let data = {
            providerId: this.data.providerId,
            activityType: 'SEC_KILL',
            activityStatus: status,
            pageNo: status=='STARTED'?this.data.pageNo1:this.data.pageNo2,
            pageSize: 10
        }
        activitiesService.activityList(data).subscribe({
            next: res => {
                if (res) {
                    console.log(res);
                    if(status=='STARTED'){
                        for(var i=0;i<res.length;i++){
                            res[i].progressNum = Math.round(100 - res[i].balanceStock*100/res[i].activityStock);
                        }
                        this.setData({
                            productList1: this.data.productList1.concat(res),
                            ifBottom1: res.length < 10 ? true : false
                        });
                        this.setData({ isShowNodata: this.data.productList1.length == 0 });
                    }else{
                        this.setData({
                            productList2: this.data.productList2.concat(res),
                            ifBottom2: res.length < 10 ? true : false
                        });
                    }
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toDetail: function(e) {
        var pid = e.currentTarget.dataset.productid;
        var activityid = e.currentTarget.dataset.activityid;
        wx.navigateTo({
            url: '/pages/activities/secondDetail/index?id=' + pid + '&activityId=' + activityid
        });
    }
});