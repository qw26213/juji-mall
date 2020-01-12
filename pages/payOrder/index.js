import { service } from '../../service';
import { constant } from '../../utils/constant';
import { errDialog, loading } from '../../utils/util'
var app = getApp();

Page({
    data: {
        nvabarData: { showCapsule: 1, title: '订单确认' },
        productId: '',
        storeId: '',
        store: {},
        productInfo: {},
        point: 0,
        count: 1,
        price: 0,
        paytype: 1,
        sceneId: "",
        inviteCode: '',
        skuId: '',
        skuMajorId: '',
        pointBalance: 0,
        alreadyPay: false,
        showProduct: false,
        activityId: '', //拼团或者砍价的活动id
        activityOrderId: '', //拼团或者砍价活动订单id
        type: '', //场景类型
        kanjiaData: '',
        splicedRuleId: '',
        orderBizType: 'NORMAL',
        defaultSku: {},
        activityData: {},
        ruleMaps: {}
    },
    onLoad: function(options) {
        console.log("确认订单页面");
        console.log(options);
        if (options.orderType) {
            this.setData({ orderBizType: options.orderType });
        }
        wx.hideShareMenu();
        if (options.id && options.paytype) {
            this.setData({
                productId: options.id ? options.id : '',
                storeId: options.storeid ? options.storeid : '',
                paytype: options.paytype,
                sceneId: options.sceneid ? options.sceneid : '',
                inviteCode: options.inviteCode ? options.inviteCode : ''
            });
        }
        if (options.type) {
            this.setData({ type: options.type });
        }
        if (options.skuId) {
            this.setData({ skuId: options.skuId, skuMajorId: options.smId });
        }
        this.setData({
            activityOrderId: options.activityOrderId ? options.activityOrderId : ''
        })
        if (options.activityId) {
            this.setData({
                activityId: options.activityId,
                splicedRuleId: options.splicedRuleId ? options.splicedRuleId : ''
            })
            this.getActivityInfo();
        } else {
            this.getItemInfo();
        }
        //查询用户橘子
        this.getPointBalance();
    },
    //收集formid做推送
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
    getPointBalance: function() {
        service.getPointBalance().subscribe({
            next: res => {
                this.setData({pointBalance: res});
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    getActivityInfo: function() {
        console.log("活动详情");
        service.activity({
            activityId: this.data.activityId,
            activityOrderId: this.data.activityOrderId,
            activityType: this.data.orderBizType,
            progressId: ''
        }).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    productInfo: res.product.product,
                    store: res.product.store,
                    price: res.activityPrice,
                    showProduct: true,
                    kanjiaData: res,
                    ruleMaps: res.ruleMaps
                });
                console.log(this.data.ruleMaps);
                console.log(this.data.skuId);
                console.log(this.data.ruleMaps[this.data.skuId]);
                this.setData({ activityData: this.data.ruleMaps[this.data.skuId][0]});
                console.log(this.data.activityData);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    getItemInfo: function() {
        console.log("普通商品详情");
        service.getItemInfo({
            productId: this.data.productId,
            storeId: this.data.storeId
        }).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    productInfo: res.product,
                    store: res.store,
                    price: res.product.price,
                    point: res.product.point,
                    showProduct: true
                });
                this.setData({ defaultSku: getObjById(res.product.productSkus, this.data.skuId) })
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    delNumber: function() {
        var thisNum = this.data.count - 1;
        if (thisNum <= 0) {return;}
        this.setData({count: thisNum});
    },
    addNumber: function() {
        var thisNum = this.data.count + 1;
        this.setData({count: thisNum});
    },
    toPay: function(e) {
        if (this.data.alreadyPay) { return; }
        if (this.data.paytype == 1 || this.data.paytype == 2 || this.data.paytype == 3) {
            this.toProductPay();
        }
        if (this.data.paytype == 5) {
            this.toActivityPay1();
        }
        if (this.data.paytype == 6) {
            this.toActivityPay2();
        }
        if (this.data.paytype == 7) {
            this.toActivityPay3();
        }
    },
    showAlert:function(msg){
        wx.showModal({title: '提示',content: msg});
        this.setData({alreadyPay: false});
    },
    errorAlert:function(msg){
        wx.showModal({title: '支付失败',content: msg});
        this.setData({alreadyPay: false});
    },
    cancelPay:function(){
        wx.showToast({title: '用户取消支付',icon: 'none'});
        wx.redirectTo({
            url: '/pages/orderlist/index?index=1&status=CREATED'
        });
        this.setData({ alreadyPay: false });
    },
    // 普通商品支付
    toProductPay: function() {
        service.getPre({productId: this.data.productId}).subscribe({
            next: res => {
                console.log('--------下单前数据校验-------');
                console.log(res);
                if (res.pointBalance < this.data.productInfo.point * this.data.count) {
                    this.showAlert('当前桔子余额不足，请多赚些桔子吧');
                }
                //判断条件 如果：过往已经购买的数量 + 要买的数量 > 限制购买的最大数量 处理：禁止下单
                if (res.totalAll + this.data.count <= this.data.productInfo.limitMaxNum) {
                    //判断条件 如果：今日已经购买的数量 + 要买的数量 > 今日限制购买的最大数量 处理：禁止下单
                    if (res.totalToday + this.data.count <= this.data.productInfo.limitPerDayNum) {
                        //判断条件 如果：要买的数量 > 每个订单限制购买的最大数量 处理：禁止下单
                        if (this.data.count <= this.data.productInfo.limitPerOrderNum) {
                            //创建订单
                            var info = this.data.defaultSku;
                            var point = info.point == null || info.point == 0 ? '0' : info.point;
                            var price = info.price == null || info.price == 0 ? '0' : info.price;
                            if (point == 0 && price > 0) {
                                var payTypeValue = 'WECHAT';
                            } else if (point > 0 && price == 0) {
                                var payTypeValue = 'POINT';
                            } else {
                                var payTypeValue = 'MIX';
                            }
                            var orderObj = {
                                itemRequests: [{
                                    sceneId: this.data.sceneId,
                                    inviteCode: this.data.inviteCode,
                                    merchantId: this.data.productInfo.merchantId,
                                    merchantName: this.data.productInfo.merchantName,
                                    num: this.data.count,
                                    originalPrice: this.data.productInfo.originalPrice,
                                    payAmount: price * this.data.count,
                                    payPoint: point * this.data.count,
                                    picId: this.data.productInfo.picId,
                                    point: point,
                                    price: price,
                                    productId: this.data.productInfo.productId,
                                    productName: this.data.productInfo.productName,
                                    skuId: this.data.skuId,
                                    skuMajorId: this.data.skuMajorId,
                                    type: this.data.productInfo.type
                                }],
                                openId: wx.getStorageSync('openid'),
                                originAmount: this.data.productInfo.originalPrice * this.data.count,
                                payAmount: price * this.data.count,
                                payPoint: point * this.data.count,
                                payType: payTypeValue,
                                providerId: this.data.productInfo.providerId,
                                providerName: this.data.productInfo.providerName,
                                orderBizType: this.data.orderBizType
                            };
                            service.saveOrder(orderObj).subscribe({
                                next: res1 => {
                                    console.log('--------创建订单返回1混合支付-------');
                                    console.log(res1);
                                    var payInfo = JSON.parse(res1.payInfo);
                                    wx.requestPayment({
                                        timeStamp: payInfo.timeStamp,
                                        nonceStr: payInfo.nonceStr,
                                        package: payInfo.package,
                                        signType: payInfo.signType,
                                        paySign: payInfo.paySign,
                                        success:(res2) => {
                                            wx.redirectTo({
                                                url: '/pages/orderDetail/index?id=' + res1.orderId,
                                            });
                                            this.setData({alreadyPay: false});
                                        },
                                        fail:(res2) => {
                                            if (res2.errMsg == 'requestPayment:fail cancel') {
                                                this.cancelPay();
                                            }
                                        }
                                    });
                                },
                                error: err => {
                                    this.errorAlert(err);
                                }
                            });
                        } else {
                            var number = this.data.productInfo.limitPerOrderNum;
                            var errMsg = '该商品每单最多可以购买' + number + '件';
                            this.showAlert(errMsg);
                        }
                    } else {
                        var number = this.data.productInfo.limitPerDayNum - res.totalToday;
                        var errMsg = number == 0 ? '超出购买限制' : '该商品今日还可以购买' + number + '件';
                        this.showAlert(errMsg);
                    }
                } else {
                    var number = this.data.productInfo.limitMaxNum - res.totalAll;
                    var errMsg = number == 0 ? '超出购买限制' : '该商品您最多还可以购买' + number + '件';
                    this.showAlert(errMsg);
                }
            },
            error: err => {
                this.showAlert(err);
            }
        })
    },
    // 拼团支付
    toActivityPay1: function() {
        if (this.data.orderBizType == 'SPLICED') {
            let data = {
                inviteCode: this.data.inviteCode,
                activityId: this.data.activityId,
                activityOrderId: this.data.activityOrderId,
                splicedRuleId: this.data.splicedRuleId
            };
            service.splicedPayment(data).subscribe({
                next: res => {
                    console.log(res);
                    var payInfo = JSON.parse(res.payInfo);
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp,
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: payInfo.signType,
                        paySign: payInfo.paySign,
                        success:(res1)=>{
                            wx.redirectTo({
                                url: '/pages/activities/my-collage/index?id=' + this.data.productId + '&activityId=' + this.data.activityId + '&progressId=' + res.progressId + '&activityOrderId=' + this.data.activityOrderId,
                            });
                        },
                        fail:(res)=> {
                            if (res.errMsg == 'requestPayment:fail cancel') {
                                this.cancelPay();
                            }
                        }
                    });
                },
                error: err => {
                    this.errorAlert(err);
                },
                complete: () => wx.hideToast()
            })
        }
    },
    // 砍价支付
    toActivityPay2: function() {
        let data = {
            inviteCode: this.data.inviteCode,
            activityOrderId: this.data.activityOrderId
        }
        service.bargainPayment(data).subscribe({
            next: res => {
                console.log(res);
                var payInfo = JSON.parse(res.payInfo);
                wx.requestPayment({
                    timeStamp: payInfo.timeStamp,
                    nonceStr: payInfo.nonceStr,
                    package: payInfo.package,
                    signType: payInfo.signType,
                    paySign: payInfo.paySign,
                    success:(res2) => {
                        wx.redirectTo({
                            url: '/pages/orderDetail/index?id=' + res.orderId,
                        });
                    },
                    fail:(res2) => {
                        if (res2.errMsg == 'requestPayment:fail cancel') {
                            this.cancelPay();
                        }
                    }
                });
            },
            error: err => {
                this.errorAlert(err);
            },
            complete: () => wx.hideToast()
        })
    },
    // 秒杀支付
    toActivityPay3: function() {
        service.secKillPay({
            inviteCode: this.data.inviteCode,
            productId: this.data.productId,
            activityId: this.data.activityId,
            skuId:this.data.skuId
        }).subscribe({
            next: res => {
                console.log(res);
                var payInfo = JSON.parse(res.payInfo);
                wx.requestPayment({
                    timeStamp: payInfo.timeStamp,
                    nonceStr: payInfo.nonceStr,
                    package: payInfo.package,
                    signType: payInfo.signType,
                    paySign: payInfo.paySign,
                    success:(obj) => {
                        wx.redirectTo({ url: '/pages/orderDetail/index?id=' + res.orderId });
                    },
                    fail:(obj) => {
                        if (obj.errMsg == 'requestPayment:fail cancel') {
                            this.cancelPay();
                        }
                    }
                });
            },
            error: err => {
                this.errorAlert(err);
            },
            complete: () => wx.hideToast()
        })
    }
});
function getObjById(arr,id){
  for(var i=0;i<arr.length;i++){
    if(arr[i].skuId == id){
      return arr[i];
    }
  }
}