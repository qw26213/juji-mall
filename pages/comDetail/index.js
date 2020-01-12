var util = require('../../utils/util.js');
import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util';
var app = getApp();

Page({
  data: {
    nvabarData: {showCapsule: 1,title: '商品详情'},
    productId: '',
    storeId: '',
    showPics: [],
    commentList: [],
    productInfo: {},
    productSkus:[],
    defaultSku:'',
    curSkuId:'',
    curSkuMajorId:'',
    description:[],
    recommendList: [],
    store: {},
    commentCount: 0,
    recommendCount: 0,
    pointBalance: 0,
    note:[],
    despImgHeightValues:[],
    isShowData:false,
    isShowCanvas:false,
    isHiddenClose:false,
    isShowModal:true,
    windowWidth: 345,
    windowHeight: 430,
    shareBg: '/images/shareBg.png',
    headImg: '',
    erwmImg: '',
    userImg:'',
    sceneId:'',
    invitecode:'',
    isShowNewerGet: false,
    isShowProfit:true,
    userImgUrl:'/images/shareBg.png',
    nickName:'',
    share:0,//首页分享按钮进入值为1
    promo:0,//首页推广按钮进入值为1
    showMoreXuZhi: false,//购买须知折叠显示
    showJoinClub: true,//显示“戳一下加入福利群”模态窗口
    showJcModal: false,//显示“去回复”模态窗口
    showJztgModal: false,//显示“桔长推广”模态窗口
    distributorRole:'',//桔长还是桔园身份
    welfareGroup: {},//“戳一下加入福利群”数据对象
    isShowSelect:false
  },
  onLoad: function(options) {
    if (options.share) {
      this.setData({share: options.share});
    }
    if (options.promo) {
      this.setData({promo: options.promo});
    }
    wx.setNavigationBarTitle({title: '商品详情'});
    console.log(JSON.stringify(options));
    if(options.storeid){
      this.setData({storeId: options.storeid});
    }
    if(options.sceneid){
      this.setData({sceneId: options.sceneid});
    }
    if(options.invitecode){
      this.setData({invitecode: options.invitecode});
    }
    if(options.id){
      this.setData({productId: options.id});
      // 查询商品详情
      this.getItemInfo();
    }else{
      errDialog('获取商品内容失败，请重试');
    }
    //查询用户橘子
    this.getPointBalance();
    //查询新用户见面礼
    this.getNewGift();
    if(options.referer){
        var referer = options.referer;
        var source = '';
        if(referer==0){source='商品列表'}
        if(referer==1){source='分享链接'}
        if(referer==2){source='小程序码'}
        if(referer==3){source='支付结果'}
        if(referer==4){source='同店推荐'}
        if(referer==5){source='外链'}
        console.log('sourceName='+source);
        wx.reportAnalytics('detail_referer', {ue: source});
    }
  },
  openJztgShare: function(){
    this.setData({
      showJztgModal: false
    })
    this.showShare();
  },
  openJztgModal: function(){
    wx.reportAnalytics('detail_ue', {ue: '成为桔长'});
    if(this.data.distributorRole=='MEMBER'){
      this.setData({
        showJztgModal: true
      });
    }else{
      this.showShare();
    }
  },
  closeJztgModal: function(){
    this.setData({
      showJztgModal: false
    })
  },
  showJcModal: function(){
    wx.reportAnalytics('detail_ue', {ue: '加群'});
    console.log("showJcModal");
    this.setData({
      showJcModal: true
    })
  },
  closeJcModal: function(){
    this.setData({
      showJcModal: false
    })
  },
  getNewGift:function(){
    service.isNewer().subscribe({
      next: res2 => {
        console.log(res2);
        this.setData({
          isShowNewerGet: res2
        });
        if (res2) {
          service.newerGet().subscribe({
            next: res3 => {
              console.log(res3);
              this.getPointBalance();
            }
          });
        }
      },
      error: err => console.log(err)
    });
  },
  toggoleXuzhi: function(){
    this.setData({
      showMoreXuZhi: !this.data.showMoreXuZhi
    })
  },
  previewImage: function (e) {
    var arr = [];
    var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
    arr.push(url);
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表
    })
  },
  //关闭新用户见面礼
  closeGetNewer: function () {
    this.setData({
      isShowNewerGet: false
    });
  },
  toMap: function(){
    wx.reportAnalytics('detail_ue', {ue: '门店地址'});
    if (this.data.store && this.data.store.lat && this.data.store.lng){
      wx.navigateTo({url: '/pages/map/index?lat=' + this.data.store.lat + '&lng=' + this.data.store.lng});
    }
  },
  toBuy:function(){
    console.log('下单前sceneId='+this.data.sceneId);
    wx.showLoading({title: '提交中...'})
    service.getProQrCode({ productId:this.data.productId,path: 'pages/login/index'}).subscribe({
        next: res => { 
            var sceneId = res.senceId;
            this.setData({sceneId:sceneId});
            console.log('接口生成sceneId='+this.data.sceneId);
            this.buyProduct();  
        },
        error: err => {
            errDialog(err);
        },
        complete: () => wx.hideLoading()
    });
  },
  buyProduct:function(){
      var point = this.data.productInfo.point==null?0:this.data.productInfo.point;
      var price = this.data.productInfo.price==null?0:this.data.productInfo.price;
      var type = this.data.productInfo.type;
      if(type=='PRODUCT'&&point>0&&price>0){
        if(price>0&&this.data.pointBalance>=point){
          this.toggleSelect();
        }else{
          this.toGetPoint();
        }
      }
      if(type=='PRODUCT'&&point==0&&price>0){
        this.toggleSelect();
      }
      if(type=='POINT'){
        this.toggleSelect();
      }
      if(this.data.pointBalance<point||!this.data.pointBalance){
        this.toGetPoint();
      }
  },

  okSelect:function(){
      if(this.data.defaultSku.stock==0){errDialog("此规格库存不足");return}
      var point = this.data.productInfo.point==null?0:this.data.productInfo.point;
      var price = this.data.productInfo.price==null?0:this.data.productInfo.price;
      var type = this.data.productInfo.type;
      if(type=='PRODUCT'&&point>0&&price>0){
        if(price>0&&this.data.pointBalance>=point){
          this.toCreateOrder();
        }else{
          this.toGetPoint();
        }
      }
      if(type=='PRODUCT'&&point==0&&price>0){
        this.toCreateOrderByRmb();
      }
      if(type=='POINT'){
        this.toCreateOrderByPoint();
      }
      if(this.data.pointBalance<point||!this.data.pointBalance){
        this.toGetPoint();
      }
  },

  toPro:function(e){
    this.showShare();
  },
  callPhone: function () {
    wx.makePhoneCall({
      phoneNumber: '4000011139'
    });
  },
  //收集formid做推送
  collectFormIds:function(e){
    console.log(e.detail);
    service.collectFormIds({
      formId: e.detail.formId
    }).subscribe({
      next: res => {
        console.log(res)
      }
    });
  },
  toMerchantsList:function(){
    wx.reportAnalytics('detail_ue', {ue: '适用门店'});
    wx.navigateTo({
      url: '/pages/merchantsCanUse/index?id=' + this.data.productId
    });
  },
  toCreateOrder: function() { //桔子和人民币组合订单
    console.log("组合订单跳转前sceneId="+this.data.sceneId);
    wx.reportAnalytics('detail_ue', {ue: '下单'});
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=1&id='+this.data.productId+'&storeid='+this.data.storeId+'&sceneid='+this.data.sceneId+'&inviteCode='+this.data.invitecode+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId
    });
  },
  toCreateOrderByPoint: function() { //只用桔子下单
    console.log("桔子单跳转前sceneId="+this.data.sceneId);
    wx.reportAnalytics('detail_ue', {ue: '下单'});
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=2&id='+this.data.productId+'&storeid='+this.data.storeId+'&sceneid='+this.data.sceneId+'&inviteCode='+this.data.invitecode+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId
    });
  },
  toCreateOrderByRmb: function () { //人民币优惠购买
    console.log("人民币单跳转前sceneId="+this.data.sceneId);
    wx.reportAnalytics('detail_ue', {ue: '下单'});
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=3&id='+this.data.productId+'&storeid='+this.data.storeId+'&sceneid='+this.data.sceneId+'&inviteCode='+this.data.invitecode+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId
    });
  },
  toCreateOrderByOriPrice: function () { //原价购买
    console.log("跳转前sceneId="+this.data.sceneId);
    wx.reportAnalytics('detail_ue', {ue: '下单'});
    wx.navigateTo({
      url: '/pages/payOrder/index?paytype=4&id='+this.data.productId+'&storeid='+this.data.storeId+'&sceneid='+this.data.sceneId+'&inviteCode='+this.data.invitecode+'&skuId='+this.data.curSkuId+'&smId='+this.data.curSkuMajorId
    });
  },
  toGetPoint: function() { //跳转到任务页面赚桔子
    wx.switchTab({
      url: '../juzi/index'
    });
  },
  getPointBalance: function() {
    service.getPointBalance().subscribe({
      next: res => {
        console.log('--------查询桔子余额-------');
        console.log(res);
        this.setData({
          pointBalance: res
        });
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toComDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var storeid = e.currentTarget.dataset.storeid;
    console.log(id);
    wx.navigateTo({
      url: '/pages/comDetail/index?referer=4&id=' + id + '&storeid=' + storeid
    });
  },
  onShow: function() {
    this.setData({isShowSelect:false});
  },
  call: function() {
    wx.reportAnalytics('detail_ue', {ue: '拨打电话'});
    wx.makePhoneCall({
      phoneNumber: this.data.store.phone // 仅为示例，并非真实的电话号码
    })
  },
  getItemInfo: function() {
    let that = this;
    service.getItemInfo({
      productId: this.data.productId,
      storeId: this.data.storeId,
      sceneId:this.data.sceneId
    }).subscribe({
      next: res => {
        console.log(res);
        var picsStrArr = res.product.picIds.split(',');
        new Promise(function(resolve,reject){
          let str = JSON.parse(res.product.note);
          resolve(str);
        }).then(function(result){
          that.setData({
            commentList: res.commentList,
            productInfo: res.product,
            description: JSON.parse(res.product.description),
            recommendList: res.recommendList,
            store: res.store,
            commentCount: res.commentCount,
            recommendCount: res.recommendList.length,
            note: result,
            showJoinClub: res.welfareGroup?true: false,
            distributorRole: res.distributorRole,
            welfareGroup: res.welfareGroup,
            showPics: picsStrArr,
            isShowData: true,
            productSkus:res.product.productSkus,
            defaultSku:res.product.defaultSku,
            curSkuId:res.product.defaultSku.skuId,
            curSkuMajorId:res.product.defaultSku.id
          });
          if(that.data.share==1){
            that.showShare();
          }
        }).catch(function(err){
          that.setData({
            commentList: res.commentList,
            productInfo: res.product,
            description: JSON.parse(res.product.description),
            recommendList: res.recommendList,
            store: res.store,
            commentCount: res.commentCount,
            recommendCount: res.recommendList.length,
            showJoinClub: res.welfareGroup ? true : false,
            distributorRole: res.distributorRole,
            welfareGroup: res.welfareGroup,
            showPics: picsStrArr,
            isShowData: true,
            productSkus:res.product.productSkus,
            defaultSku:res.product.defaultSku,
            curSkuId:res.product.defaultSku.skuId,
            curSkuMajorId:res.product.defaultSku.id
          });
          if(that.data.share==1){
            that.showShare();
          }
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  desImgLoad: function (event){
    console.log(event.detail);
    var arr = this.data.despImgHeightValues;
    arr.push(event.detail.height * 690 / event.detail.width);
    this.setData({
      despImgHeightValues: arr
    });
  },
  gohomepage: function() {
    wx.reportAnalytics('detail_ue', {ue: '回首页'});
    wx.reLaunch({
      url: '/pages/index/index?referer=2'
    });
  },
  selectType:function(e){
    if(e.currentTarget.dataset.stock>0){
      this.setData({curSkuId:e.currentTarget.dataset.skuid,curSkuMajorId:e.currentTarget.dataset.id});
      this.setData({defaultSku:getObjById(this.data.productSkus,this.data.curSkuId)});
    }
  },
  toCommentList: function() {
    wx.navigateTo({
      url: '/pages/commentList/index?id=' + this.data.productId
    });
  },
  toShareCard: function() {
    wx.navigateTo({
      url: '/pages/shareCard/index?merchantId=' + this.data.merchantId
    });
  },
  share: function (){
    var obj = {
      type:'SHARE_PRODUCT',
      sharePath: '/pages/index/index'
    };
    service.share(obj).subscribe({
      next: res=>{
        console.log('---------分享返回--------');
        console.log(res);
      },
      error: err => console.log(err),
      complete: () =>{}
    })
  },
  /**
   * 用户点击右上角分享或页面中的分享
   */
  onShareAppMessage: function(res) {
    wx.reportAnalytics('detail_ue', {ue: '发送好友'});
    this.share();
    this.setData({ isShowModal: true,isShowProfit:false });
    var that = this;
    setTimeout(()=>{
      that.setData({isShowProfit:true});
    },200);
    var info = this.data.productInfo;
    var point = info.point==null||info.point==0?'':info.point+'桔子';
    var price = info.price==null||info.price==0?'':Number(info.price/100).toFixed(2)+'元';
    var link = (info.price!=null&&info.price!=0)&&(info.point!=null&&info.point!=0)?'+':'';
    var price1 = point + link + price;
    var shareTxt = info.shareText;
    var shareImg = info.shareImg;
    return {
      title: shareTxt?shareTxt:price1+','+this.data.productInfo.productName,
      path: '/pages/login/index?pagetype=1&inner=1&pid=' + that.data.productId+'&storeid='+that.data.storeId+'&invitecode='+wx.getStorageSync('inviteCode'),
      imageUrl: constant.basePicUrl + (shareImg?shareImg:this.data.productInfo.picId) + '/resize_560_420/mode_fill'
    }
  },
  showShareModal:function(){
    wx.reportAnalytics('detail_ue', {ue: '保存推广图片'});
    console.log('生成分享图片');
    console.log(constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70');
    service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
        next: res => {
            this.setData({
                nickName: res.nickName,
                userImgUrl: res.avatar
            });
            wx.showLoading({title: '生成分享图片'});
            wx.downloadFile({
              url: constant.basePicUrl + this.data.productInfo.picId +'/resize_750_420/mode_filt/format_jpg/quality_70',
              success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({headImg:res.tempFilePath});
                    console.log(this.data.userImgUrl);
                    wx.downloadFile({
                      url: this.data.userImgUrl,
                      success: (obj) => {
                        if (obj.statusCode === 200) {
                          this.setData({userImg:obj.tempFilePath});
                          this.getQrCode();
                        }else{
                          wx.hideLoading();
                        }
                      },
                      fail:(err)=>{
                          console.log('头像下载失败');
                      }
                    });
                }else{
                  wx.hideLoading();
                }
              }
            });
        },
        // error: err => errDialog(err),
        complete: () => {}
    })
  },
  saveShareImage:function(){
    this.showShareModal();
  },
  toggleSelect:function(){
    if(this.data.productSkus.length>1){
      this.setData({isShowSelect:!this.data.isShowSelect});
    }else{
      console.log("下单页面");
      this.okSelect();
    }
  },
  // 点击分享
  showShare:function(){
    this.setData({isShowModal:false});
    this.setData({isShowCanvas:true});
  },
  closeModal:function(){
      this.setData({isShowModal:true});
  },
  getQrCode: function() {
      service.getQrCode({ productId:this.data.productId,path: 'pages/login/index'}).subscribe({
          next: res => {
            var picId = res;
            wx.downloadFile({
              url: constant.basePicUrl + picId +'/resize_200_200/mode_filt/format_jpg/quality_0',
              success: (res1) => {
                if (res1.statusCode === 200) {
                    this.setData({erwmImg:res1.tempFilePath});
                    var info = this.data.productInfo;
                    var point = info.point==null||info.point==0?'':info.point+'桔子';
                    var price = info.price==null||info.price==0?'':Number(info.price/100).toFixed(2)+'元';
                    var link = (info.price!=null&&info.price!=0)&&(info.point!=null&&info.point!=0)?'+':'';
                    var price1 = point + link + price;
                    var name = info.productName;
                    var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
                    var storeLen = info.productStores.length;
                    this.setData({isShowCanvas:false});
                    this.drawImage(info.merchantName,name,'',price1,price2,storeLen);//参数依次是storeName,desc,现价,原价,门店数
                    this.setData({isShowModal:false});
                }else{
                  wx.hideLoading();
                }
              }
            });
          },
          error: err => {
            errDialog(err);
            wx.hideLoading();
          },
          complete: () => wx.hideToast()
      });
  },
  drawImage: function(merchant,name,desc,price1,price2,storeLen) {
      var size = {w:260,h:424};
      var context = wx.createCanvasContext('myCanvas');
      context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
      context.drawImage("../../images/logo.png", 20, 18, 20, 21);
      setText(context,"“桔”美好生活，集好店优惠", 52, 35,"#000",15,'left');
      context.drawImage(this.data.headImg, 10, 52, size.w - 20,138);
      rectPath(context, 10, 190, size.w-20, 134);
      setText(context,merchant, 20, 210,"#999",10,'left');//商户名
      drawText(context,name,20,230,50,216);//商品名字
      setText(context,"适用"+storeLen+"家门店", size.w - 20, 210,"#999",10,'right');//适用门店

      context.drawImage("../../images/price.png", 20, 263, 30,13);
      setText(context,price1, 55, 275,'#E83221',14,'left');//价格
      setText(context,"原价:" + price2, size.w - 20, 275,'#999',10,'right');//原价

      context.drawImage("../../images/gou.png", 20, 293, 10,10);
      setText(context,"可退款", 35, 302,'#999',9,'left');
      context.drawImage("../../images/gou.png", 80, 293, 10,10);
      setText(context,"可转赠", 95, 302,'#999',9,'left');

      rectPath(context, 0, 334, size.w, 88);
      context.drawImage('../../images/erbg.png', 70, 387, 103, 18);
      setText(context,"长按识别小程序码", 77, 400,'#333',11,'left');

      context.save();
      context.beginPath();
      context.arc(35, 375, 25, 0, Math.PI * 2, false);
      context.clip();
      context.drawImage(this.data.userImg, 10, 350, 50, 50);
      context.restore();

      context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
      var name = this.data.nickName;
      var nickName = name.length>8?name.substring(0,8)+'...':name;
      setText(context,nickName, 70, 360,"#333",12,'left');
      setText(context,"私藏好物，分享给你", 70, 379,'#666',11,'left');
      context.draw(true,()=>{
        wx.hideLoading();
        this.savePic();
      });
  },
  savePic: function(e) {
      var that = this;
      wx.canvasToTempFilePath({
          canvasId: 'myCanvas',
          success: function(res) {
              wx.getSetting({
                  success(rep) {
                      if (!rep.authSetting['scope.writePhotosAlbum']) {
                          wx.authorize({
                              scope: 'scope.writePhotosAlbum',
                              success() {
                                  that.saveAsPhoto(res.tempFilePath);
                              },
                              fail() {
                                  wx.openSetting({
                                      success: function() {
                                          console.log("openSetting: success");
                                      },
                                      fail: function() {
                                          console.log("openSetting: fail");
                                      }
                                  });
                              }
                          })
                      } else {
                          that.saveAsPhoto(res.tempFilePath);
                      }
                  },
                  fail() {
                      console.log("getSetting: fail");
                  }
              })
          },
          fail: function(res) {
              console.log(res);
          }
      });
  },
  saveAsPhoto: function(imgUrl) {
      wx.saveImageToPhotosAlbum({
          filePath: imgUrl,
          success: (res) => {
            this.share();//分享获得桔子
            wx.showToast({
                title: "已保存至相册",
                icon: "success"
            });
          },
          fail: function(res) {
              console.log(res);
          }
      })
  }
});

function setText(ctx,str,x,y,color,size,align){
    ctx.setFontSize(size);
    ctx.setTextAlign(align);
    ctx.setFillStyle(color);
    ctx.fillText(str, x, y);
    ctx.stroke();
}

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#ffffff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('#ffffff');
    ctx.fill();
    ctx.closePath();
}

function drawBar(ctx,x1,x2,y){
    ctx.beginPath();
    ctx.setLineCap('round');
    ctx.setStrokeStyle('#FFDC00');
    ctx.setLineWidth(18);
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
}

//1、canvas对象，2、文本 3、距离左侧的距离 4、距离顶部的距离 5、6、文本的宽度
function drawText(ctx, str, left, top, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333');
    if(str.length>36){
      var str = str.substring(0,36)+'...';
    }
    for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
            ctx.fillText(str.substring(lastSubStrIndex, i), left, top); //绘制截取部分
            top += 16; //16为字体的高度
            lineWidth = 0;
            lastSubStrIndex = i;
            titleHeight += 30;
        }
        if (i == str.length - 1) { //绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), left, top);
        }
    }
    ctx.stroke();
    titleHeight = titleHeight + 10;
    return titleHeight
}

function getObjById(arr,id){
  for(var i=0;i<arr.length;i++){
    if(arr[i].skuId == id){
      return arr[i];
    }
  }
}