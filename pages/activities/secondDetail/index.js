var util = require('../../../utils/util.js');
import { service } from '../../../service';
import { activitiesService } from '../shared/service';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var NP = require('../../../utils/number-precision.js');
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '商品详情'},
        activityId:'',
        productId: '',
        showPics: [],
        commentList: [],
        productInfo: {},
        description: [],
        recommendList: [],
        store: {},
        commentCount: 0,
        recommendCount: 0,
        pointBalance: 0,
        note: [],
        activityStatus: '',
        despImgHeightValues: [],
        isShowData: false,
        storeInfo: {},
        resData: '',
        ruleInfo: {},
        productProgress: 0,
        remind: false,
        productSkus:[],
        defaultSku:{},
        ruleMaps:{},
        curSkuId:'',
        curSkuMajorId:'',
        isShowSelect:false,
        inviteCode:'',
        isBack: false,
        phone:''
    },
    onLoad: function(options) {
        wx.setNavigationBarTitle({ title: '商品详情' });
        var inviteCode = wx.getStorageSync('inviteCode');
        this.setData({
            productId: options.id,
            activityId: options.activityId,
            inviteCode: options.invitecode?options.invitecode:inviteCode
        });
        var phone = JSON.parse(wx.getStorageSync('userinfo')).phone;
        console.log(phone);
        this.setData({phone:phone});
        // 查询商品详情
        this.getData();
    },
    onHide: function() {
        this.setData({ isBack: true });
    },
    onShow: function() {
        this.setData({isShowSelect:false});
        if (this.data.isBack) {
            this.getData(); // 返回刷新
        }
    },
    collectFormIds: function(e) {
        service.collectFormIds({
            formId: e.detail.formId
        }).subscribe({
            next: res => {console.log(res)}
        });
    },
    onShareAppMessage: function(res) {
        var picId = this.data.resData.cover;
        var productName = this.data.resData.productName;
        var price = Number(this.data.resData.activityPrice / 100).toFixed(2);
        var shareTxt = this.data.productInfo.shareText;
        var shareImg = this.data.productInfo.shareImg;
        return {
            title: shareTxt?shareTxt:price + '元秒杀'+productName+'，手慢无！',
            path: '/pages/login/index?pagetype=6&pid='+this.data.productId+'&activityId=' + this.data.activityId + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl:constant.basePicUrl + (shareImg?shareImg:this.data.resData.cover) + '/resize_560_420/mode_fill'
        }
    },
    previewImage: function(e) {
        var arr = [];
        var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
        arr.push(url);
        wx.previewImage({urls: arr});
    },
    toMap: function(e) {
        wx.openLocation({
            latitude: this.data.store.lat,
            longitude: this.data.store.lng,
            name: this.data.store.name,
            address: this.data.store.address,
            scale: 15
        });
    },
    toMerchantsList: function() {
        wx.navigateTo({
            url: '/pages/merchantsCanUse/index?id=' + this.data.productId
        });
    },
    toComDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
        });
    },
    call: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.store.phone
        })
    },
    desImgLoad: function(e) {
        var arr = this.data.despImgHeightValues;
        arr.push(e.detail.height * 690 / e.detail.width);
        this.setData({
            despImgHeightValues: arr
        });
    },
    toIndex: function() {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    toCommentList: function() {
        wx.navigateTo({
            url: '/pages/commentList/index?id=' + this.data.productId
        });
    },
    getData: function() {
        activitiesService.activity({
            activityId: this.data.activityId,
            activityType: 'SEC_KILL'
        }).subscribe({
            next: res => {
                this.setData({showCom: true});
                var picsStrArr = res.cover.split(',');
                picsStrArr.forEach(function(item, index) {
                    picsStrArr[index] = constant.basePicUrl + item + '/resize_751_420/mode_fill';
                });
                this.setData({
                    commentList: res.product.commentList,
                    productInfo: res.product.product,
                    description: JSON.parse(res.product.product.description),
                    recommendList: res.product.recommendList,
                    store: res.product.store,
                    commentCount: res.product.commentCount,
                    recommendCount: res.product.recommendList.length,
                    note: JSON.parse(res.product.product.note),
                    showPics: picsStrArr,
                    isShowData: true,
                    remind: res.isRemind,
                    resData: res,
                    activityStatus:res.activityStatus,
                    ruleMaps:res.ruleMaps,
                    productSkus:res.product.product.productSkus,
                    curSkuId:res.product.product.defaultSku.skuId,
                    curSkuMajorId:res.product.product.defaultSku.id
                });
                this.setData({ 
                    productProgress: Math.round(100 - (res.balanceStock * 100) / res.activityStock)
                });
                var skuObj = this.data.ruleMaps[this.data.curSkuId];
                this.setData({ defaultSku:skuObj[0]});
                console.log("获取默认规格");
                console.log(this.data.defaultSku);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    toSecondKill: function() {
        if(Object.keys(this.data.productSkus).length>1){
            this.toggleSelect();
        }else{
            this.okSelect();
        }
    },
    toggleSelect:function(){
      this.setData({isShowSelect:!this.data.isShowSelect});
    },
    selectType:function(e){
        if(e.currentTarget.dataset.stock==0){return;}
        this.setData({curSkuId:e.currentTarget.dataset.skuid,curSkuMajorId:e.currentTarget.dataset.id});
        var skuObj = this.data.ruleMaps[this.data.curSkuId];
        this.setData({ defaultSku:skuObj[0]});
    },
    okSelect:function(){
        if(this.data.defaultSku.balanceStock==0){errDialog("此规格库存不足");return}
        wx.navigateTo({
            url: '/pages/payOrder/index?paytype=7&orderType=SEC_KILL&id=' + this.data.productId + '&activityId=' + this.data.activityId + '&splicedRuleId=' + this.data.defaultSku.secKillRuleId+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId+'&inviteCode='+this.data.inviteCode
        });
    },
    toRemainMe: function(e) {
        let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
        service.decodeUserPhone(data).subscribe({
            next: res => {
                this.bindPhone(res.phoneNumber);
                this.bindPhone(); //授权以后绑定手机号码
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    bindPhone:function (phone) {
        service.bindPhone({ phone: phone }).subscribe({
            next: res => {
                this.remainUser()
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    remainUser:function(){
        activitiesService.remind({
            activityId: this.data.activityId
        }).subscribe({
            next: res => {
                this.setData({ remind: true })
                wx.showToast({title: "提醒成功",icon: "success"});
            },
            error: err => {
                wx.showToast({ title: err });
            },
            complete: () => wx.hideToast()
        });
    }
});

function getObjById(arr,id){
  for(var i=0;i<arr.length;i++){
    if(arr[i].skuId == id){
      return arr[i];
    }
  }
}
