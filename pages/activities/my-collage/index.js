import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var timer = null;

Page({
    data: {
        nvabarData: {showCapsule: 1,title: '项目详情'},
        portraitUrl: '/images/unkonw-icon.png',
        headPortraitList: ['', ''], //拼团中 参团的头像
        productOrderInfo:{},
        activityId: '',
        activityOrderId: '',
        productInfo: {}, //商品详情
        orderId: '',
        store: {}, //
        activityStatus: '',
        progressId: '',
        storeId: '',
        isTimeOpen:false,
        productId: ''
    },
    onLoad: function(options) {
        console.log('进入项目详情')
        console.log(options)
        wx.setNavigationBarTitle({ title: '项目详情' });
        this.setData({
            progressId: options.progressId ? options.progressId : '',
            activityId: options.activityId ? options.activityId : '',
            activityOrderId: options.activityOrderId ? options.activityOrderId : ''
        })
        this.getItemInfo(); //调取详情页接口
    },
    toOrderDetail: function() {
        wx.navigateTo({
            url: '/pages/orderDetail/index?id=' + this.data.productOrderInfo.orderId + '&storeid=' + this.data.storeId
        });
    },
    toPayorder:function(e){
        var productid = e.currentTarget.dataset.productid;
        var activityid = e.currentTarget.dataset.activityid;
        var activityorderid = e.currentTarget.dataset.activityorderid;
        console.log("去参团");
        console.log(productid);
        console.log(activityid);
        console.log("activityorderid="+activityorderid);
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + this.data.productOrderInfo.rules[0].splicedRuleId
        });
    },
    onShareAppMessage: function() {
        var price = Number(this.data.productInfo.activityPrice/100).toFixed(2);
        return {
            title: '嗨！便宜一起拼￥' + price + '【' + this.data.productInfo.productName + '】',
            path: '/pages/login/index?pagetype=5&type=SPLICED&activityId=' + this.data.activityId + '&activityOrderId=' + this.data.activityOrderId + '&progressId=' + this.data.progressId,
            imageUrl: constant.basePicUrl + this.data.productInfo.cover + '/resize_560_420/mode_fill',
        }
    },
    callPhone:function(e) {
        let phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        });
    },
    onUnload:function(){
        clearTimeout(timer);
        this.setData({isTimeOpen:false});
    },
    onHide:function(){
        clearTimeout(timer);
        this.setData({isTimeOpen:false});
    },
    toMerchantsList: function() {
        wx.navigateTo({
            url: '/pages/merchantsCanUse/index?id=' + this.data.productId
        });
    },
    getItemInfo: function() {
        if(this.data.isTimeOpen&&this.data.productOrderInfo.participateCount==1&&this.data.activityStatus=="IN_PROGRESS"){
            clearTimeout(timer);
        }
        let data = {
            progressId: this.data.progressId,
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId,
            activityType: 'SPLICED'
        }
        activitiesService.activity(data).subscribe({
            next: res => {
                if (res) {
                    console.log(res);
                    /** 参团的人 **/
                    if (res.orderDigest && res.orderDigest.progresses&&res.orderDigest.progresses.length != 0) {
                        let resNum = 2 - res.orderDigest.progresses.length;
                        for (let i = 0; i < resNum; i++) {
                            res.orderDigest.progresses.push({});
                        }
                    }
                    this.setData({
                        productInfo: res,
                        productOrderInfo: res.orderDigest,
                        store: res.product.store,
                        storeId: res.product.store.id,
                        headPortraitList: res.orderDigest&&res.orderDigest.progresses?res.orderDigest.progresses:[],
                        productId: res.orderDigest ? res.orderDigest.productId : '',
                        activityStatus: res.orderDigest ? res.orderDigest.activityOrderStatus : '',
                        activityOrderId:res.orderDigest ? res.orderDigest.activityOrderId : ''
                    });
                    if(this.data.productOrderInfo.participateCount==2&&this.data.activityStatus=="IN_PROGRESS"){
                        timer = setTimeout(()=>{
                            this.getItemInfo();
                            this.setData({isTimeOpen:true});
                        },3000);
                    }
                }
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    }
})