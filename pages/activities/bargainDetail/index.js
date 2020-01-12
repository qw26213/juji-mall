import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
    data: {
        nvabarData: { showCapsule: 1, title: '商品详情' },
        productId: '',
        storeId: '',
        showPics: [],
        pointBalance: 0,
        note: [],
        isShowData: false,
        isHiddenClose: false,
        type: '',
        activityOrderId: '',
        activityId: '',
        resData: '',
        activityOrderId: '',
        progressId: '',
        self: '',
        showCom: false,
        showAlert1: false,
        showAlert2: false,
        status: 'init', //未开始 init，砍价中 ing，砍价失败 fail，砍价成功 success
        self: true, //是否活动发起者
        help: true, //是否已帮砍
        price1: 0,
        isShowSelect:false,
        productSkus:{},
        ruleMaps:{},
        defaultSku:{},
        ruleMaps:{},
        curSkuId:'',
        curSkuMajorId:'',
        inviteCode:'',
        isBack: false,
        buyType:'kan'
    },
    onLoad: function(options) {
        console.log('砍价活动详情');
        console.log(options);
        var inviteCode = wx.getStorageSync('inviteCode');
        this.setData({
            productId: options.id,
            activityId: options.activityId,
            activityOrderId: options.activityOrderId ? options.activityOrderId : '',
            progressId: options.progressId ? options.progressId : '',
            inviteCode: options.invitecode?options.invitecode:inviteCode
        });
        if (options.storeid) {
            this.setData({ storeId: options.storeid });
        }
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
    onStartKanjia:function() {
      this.setData({
          activityOrderId: this.data.activityOrderId
      })
    },
    toggleSelect: function() {
        this.setData({ isShowSelect: !this.data.isShowSelect });
    },
    selectType: function(e) {
        if(e.currentTarget.dataset.stock>0){
            this.setData({ curSkuId: e.currentTarget.dataset.skuid, curSkuMajorId: e.currentTarget.dataset.id });
            var skuObj = getObjById(this.data.productSkus,this.data.curSkuId);
            this.setData({ defaultSku:skuObj});
        }
    },
    collectFormIds: function(e) {
        console.log(e.detail);
        service.collectFormIds({
            formId: e.detail.formId
        }).subscribe({
            next: res => {
                console.log(res)
            }
        });
    },
    okSelect:function(e){
        if(this.data.defaultSku.stock==0){errDialog("此规格库存不足");return}
        this.setData({isShowSelect:false});
        if(this.data.buyType=='dir'){
           this.toPayOrder();
        }else{
           this.toKanjia(); 
        }
    },
    toPayOrder:function(){
        var productId = this.data.productId;
        var activityId = this.data.activityId;
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=3&id='+productId+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId + '&inviteCode=' + this.data.inviteCode,
        });
    },
    dirBuy:function(e){
        if(Object.keys(this.data.defaultSku).length>1){
            this.setData({buyType:'dir'});
            this.toggleSelect();
        }else{
            this.toPayOrder();
        }
    },
    onlyBuy:function(e) {
        var productId = this.data.productId;
        var activityOrderId = this.data.activityOrderId;
        var activityId = this.data.activityId;
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=6&orderType=BARGAIN&id='+productId+'&activityOrderId='+activityOrderId+'&activityId='+activityId+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId + '&inviteCode=' + this.data.inviteCode,
        });
    },
    // 发起砍价 
    startKanjia:function() {
        this.setData({showAlert2:false});
        if(Object.keys(this.data.defaultSku).length>1){
            this.toggleSelect();
            this.setData({buyType:'kan'});
        }else{
            this.toKanjia();
        }
    },
    toKanjia:function(){
        let data = {
            activityId: this.data.activityId,
            inviteCode:this.data.inviteCode,
            skuId:this.data.curSkuId
        };
        activitiesService.initiateBargain(data).subscribe({
            next: res => {
                if (res) {
                    this.setData({showAlert1: true,activityOrderId: res});
                    this.doBargain();
                }
            },
            error: err => {
                errDialog(err);
            },
            complete: () => wx.hideToast()
        })
    },
    helpKJ:function() {
        this.setData({showAlert2: true})
        this.doBargain();
    },
    closeAlert:function() {
        this.setData({showAlert1: false,showAlert2: false})
    },
    doBargain:function() {
        activitiesService.doBargain({ 
                inviteCode:this.data.inviteCode,
                activityOrderId: this.data.activityOrderId
            }).subscribe({
                next: res => {
                    this.setData({ price1: res });
                    this.getData();
                },
                error: err => errDialog(err),
                complete: () => wx.hideToast()
            });
    },
    lookOthers:function() {
        wx.navigateTo({
            url: '/pages/activities/project-list/index?sceneType=BARGAIN',
        });
    },
    getData: function() {
        activitiesService.activity({
            activityType: 'BARGAIN',
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId ? this.data.activityOrderId : '',
            progressId: this.data.progressId
        }).subscribe({
            next: res => {
                this.setData({ showCom: true });
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill';
                });
                if (res.orderDigest) {
                    res.yikan = NP.minus(res.originalPrice, res.orderDigest.currentSalesPrice);
                }
                this.setData({
                    productInfo: res.product.product,
                    store: res.product.store,
                    showPics: picsStrArr,
                    isShowData: true,
                    resData: res,
                    isInitiator: res.orderDigest ? res.orderDigest.isInitiator : 1, //是否为发起者 (判断进入是自己还是他人)
                    orderStatus: res.orderDigest ? res.orderDigest.activityOrderStatus : '', //订单状态
                    orderStock: res.stock,
                    activityOrderId: res.orderDigest ? res.orderDigest.activityOrderId : '',
                    self: (!res.orderDigest) || (res.orderDigest && res.orderDigest.isInitiator==1),
                    productSkus: res.product.product.productSkus,
                    defaultSku: res.product.product.defaultSku,
                    ruleMaps:res.ruleMaps,
                    curSkuId: res.product.product.defaultSku.skuId,
                    curSkuMajorId: res.product.product.defaultSku.id
                });
                if (res.product.product.note) {
                    this.setData({ note: JSON.parse(res.product.product.note) })
                }
                let status = 'init'
                if (res.orderDigest) {
                  switch (res.orderDigest.activityOrderStatus) {
                    case "IN_PROGRESS": status = 'ing';break;
                    case "WAIT_PAY": status = 'success';break;
                    case "FAIL": status = 'fail'
                  }
                }
                this.setData({status: status})
                if (res.orderDigest) {
                  this.setData({
                    help: !res.orderDigest.allowParticipate ? true : false,
                  })
                }
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    gohomepage: function() {
      wx.switchTab({url: '/pages/index/index'});
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
        if (res.target.dataset.type=='1') {
            this.closeAlert();
            return {
                title: nickName + '邀请你帮' + gender + '砍价，' + price + '元得原价' + oprice + '元的' + productName,
                path: '/pages/login/index?pagetype=5&type=BARGAIN&pid=' + this.data.productId + '&activityId=' + activityId + '&activityOrderId=' + activityOrderId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + picId + '/resize_560_420/mode_fill'
            }
        }else{
            var shareTxt = this.data.productInfo.shareText;
            var shareImg = this.data.productInfo.shareImg;
            return {
                title: shareTxt?shareTxt:nickName + '分享给您一个心动商品，快来一起体验吧！',
                path: '/pages/login/index?pagetype=5&type=BARGAIN&pid=' + this.data.productId + '&activityId=' + activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + (shareImg?shareImg:picId) + '/resize_560_420/mode_fill'
            }
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