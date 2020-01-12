import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        nvabarData: { showCapsule: 1, title: '商品详情' },
        productId: '',
        activityId: '',
        showPics: [],
        productInfo: {},
        store: {},
        commentCount: 0,
        recommendCount: 0,
        pointBalance: 0,
        note: [],
        despImgHeightValues: [],
        isShowData: false,
        isHiddenClose: false,
        activityOrderId: '',
        activityElseOrderid:'',
        resData: '',
        progressId: '',
        self: '',
        showCom: false,
        portraitUrl: '/images/unkonw-icon.png',
        productOrderInfo: {},
        orderStatus: '',
        isInitiator: 1,
        isShowSelect:false,
        productSkus:[],
        ruleMaps:{},
        defaultSku:{},
        inviteCode:'',
        curSkuId:'',
        curSkuMajorId:'',
        btnType:'',
        isBack: false
    },
    onLoad: function(options) {
        if (options.shared) {
            this.setData({ shared: options.shared });
        }
        var inviteCode = wx.getStorageSync('inviteCode');
        this.setData({
            productId: options.id,
            activityId: options.activityId,
            activityOrderId: options.activityOrderId ? options.activityOrderId : '',
            progressId: options.progressId ? options.progressId : '',
            inviteCode: options.invitecode?options.invitecode:inviteCode
        });
        // 查询商品详情
        this.getData();
    },
    onHide: function() {
        this.setData({ isBack: true });
    },
    onShow: function() {
        this.setData({showCom:false});
        if (this.data.isBack) {
            this.getData(); // 返回刷新
        }
    },
    onShareAppMessage: function(res) {
        var nickName = JSON.parse(wx.getStorageSync('userinfo')).nickName;
        var activityId = this.data.activityId;
        var gender = JSON.parse(wx.getStorageSync('userinfo')).gender == 1 ? '他' : '她';
        var activityOrderId = this.data.activityOrderId;
        var picId = this.data.resData.cover;
        var productName = this.data.resData.productName;
        var price = Number(this.data.resData.activityPrice / 100).toFixed(2);
        var oprice = Number(this.data.resData.originalPrice / 100).toFixed(2);
        if (res.target.dataset.type == '1') {
            return {
                title: '嗨！便宜一起拼￥' + price + '【' + productName + '】',
                path: '/pages/login/index?pagetype=5&type=SPLICED&pid=' + this.data.productId + '&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
            }
        }else{
            var shareTxt = this.data.productInfo.shareText;
            var shareImg = this.data.productInfo.shareImg;
            return {
                title: shareTxt?shareTxt:nickName + '分享给您一个心动商品，快来一起体验吧！',
                path: '/pages/login/index?pagetype=5&type=SPLICED&pid=' + this.data.productId + '&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + (shareImg?shareImg:picId) + '/resize_560_420/mode_fill'
            }
        }
    },
    onStartKanjia:function(e) {
        console.log(e.detail);
        if (e.detail) {
            this.setData({
                activityOrderId: e.detail.activityOrderId
            })
        }
    },
    collectFormIds: function(e) {
        service.collectFormIds({
            formId: e.detail.formId
        }).subscribe({
            next: res => {console.log(res)}
        });
    },
    gohomepage: function() {
        wx.switchTab({ url: '/pages/index/index' });
    },
    getData: function() {
        activitiesService.activity({
            activityType: 'SPLICED',
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
            progressId: this.data.progressId
        }).subscribe({
            next: res => {
                // console.log(JSON.stringify(res));
                this.setData({ showCom: true });
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill';
                });
                this.setData({
                    productInfo: res.product.product,
                    store: res.product.store,
                    showPics: picsStrArr,
                    isShowData: true,
                    productOrderInfo: res.orderDigest,
                    resData: res,
                    isInitiator: res.orderDigest ? res.orderDigest.isInitiator : 1, //是否为发起者 (判断进入是自己还是他人)
                    orderStatus: res.orderDigest ? res.orderDigest.activityOrderStatus : '', //订单状态
                    orderStock: res.stock,
                    activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
                    self: (!res.orderDigest) || (res.orderDigest && res.orderDigest.isInitiator),
                    productSkus: res.product.product.productSkus,
                    defaultSku: res.product.product.defaultSku,
                    ruleMaps:res.ruleMaps,
                    curSkuId:res.product.product.defaultSku.skuId,
                    curSkuMajorId:res.product.product.defaultSku.id
                });
                if (res.product.product.note) {
                    this.setData({ note: JSON.parse(res.product.product.note) })
                }
                // 是否有其他参团者的活动
                if (res.otherDigests) {
                    res.otherDigests.forEach(function(item) {
                        let picArr = [];
                        item.progresses.forEach(function(list) {
                            picArr.push(list.avatar);
                        })
                        item.resNum = (2 - picArr.length) ? (2 - picArr.length) : 0;
                        for (let i = 0; i < item.resNum; i++) {
                            picArr.push('');
                        }
                        item.picArr = picArr;
                    })
                }
                // 正在参团的人
                if (res.orderDigest && res.orderDigest.progresses) {
                    let resNum = 2 - res.orderDigest.progresses.length;
                    for (let j = 0; j < resNum; j++) {
                        res.orderDigest.progresses.push({});
                    }
                    this.setData({
                        resNum: resNum
                    })
                }
                this.setData({
                    headPortraitList:res.orderDigest&&res.orderDigest.progresses ? res.orderDigest.progresses : [],
                    pintuanListInfor:res.otherDigests //其他正在参团的小伙伴
                })
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    toMyOrderList:function() {
        wx.navigateTo({url: '/pages/orderlist/index?index=2&status=PAID'});
    },
    toOrderDetail: function() {
        wx.navigateTo({
            url: '/pages/orderDetail/index?id=' + this.data.productOrderInfo.orderId + '&storeid=' + this.data.store.id
        });
    },
    toggleSelect: function() {
        this.setData({ isShowSelect: !this.data.isShowSelect });
    },
    selectType: function(e) {
        if(e.currentTarget.dataset.stock>0){
            this.setData({ curSkuId: e.currentTarget.dataset.skuid, curSkuMajorId: e.currentTarget.dataset.id });
            var skuObj = getObjById(this.data.productSkus,this.data.curSkuId);
            this.setData({defaultSku:skuObj});
        }
    },
    okSelect: function() {
        if(this.data.defaultSku.stock==0){errDialog("此规格库存不足");return}
        var productid = this.data.productId;
        var activityid = this.data.activityId;
        this.setData({ isShowSelect: false });
        var splicedRuleId = this.data.ruleMaps[this.data.curSkuId][0].splicedRuleId;
        console.log(splicedRuleId);
        if (this.data.btnType == 'join') {
            var activityorderid = this.data.resData.orderDigest.activityOrderId;
            console.log("去参团");
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + splicedRuleId + '&skuId=' + this.data.curSkuId + '&smId=' + this.data.curSkuMajorId+'&inviteCode='+this.data.inviteCode
            });
        } else if(this.data.btnType=='joinElse'){
            var activityorderid = this.data.activityElseOrderid;
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&activityOrderId=' + activityorderid + '&splicedRuleId=' + splicedRuleId + '&skuId=' + this.data.curSkuId + '&smId=' + this.data.curSkuMajorId + '&inviteCode=' + this.data.inviteCode
            });
        } else {
            console.log("去开团");
            wx.navigateTo({
                url: '/pages/payOrder/index?paytype=5&orderType=SPLICED&id=' + productid + '&activityId=' + activityid + '&splicedRuleId=' + splicedRuleId + '&skuId=' + this.data.curSkuId + '&smId=' + this.data.curSkuMajorId+'&inviteCode='+this.data.inviteCode
            });
        }
    },
    joinElseCollage:function(e){
        this.setData({ btnType: 'joinElse' });
        var activityorderid = e.currentTarget.dataset.activityorderid;
        this.setData({activityElseOrderid:activityorderid});
        if (Object.keys(this.data.productSkus).length > 1) {
            this.toggleSelect();
        } else {
            this.okSelect();
        }
    },
    /****  参团 ****/
    joinCollage:function() {
        this.setData({ btnType: 'join' });
        if (Object.keys(this.data.productSkus).length > 1) {
            this.toggleSelect();
        } else {
            this.okSelect();
        }
    },
    /****  开团 ****/
    createCollage:function(e) {
        this.setData({ btnType: 'create' });
        console.log("规格数量="+Object.keys(this.data.productSkus).length);
        if (Object.keys(this.data.productSkus).length > 1) {
            this.toggleSelect();
        } else {
            this.okSelect();
        }
    }
});

function getObjById(arr,id){
  for(var i=0;i<arr.length;i++){
    if(arr[i].skuId == id){
      return arr[i];
    }
  }
}