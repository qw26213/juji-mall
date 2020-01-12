import {constant} from 'utils/constant';
import {http} from 'utils/http';
let service = {};
let api = constant.apiUrl;
let jujipay = constant.jujipayUrl;

// -------------------------------------橘子商城部分接口------------------------------------------

service.getAuthCode = (data) => {
  let apiUrl = api + '/user/getAuthCode.json';//描述:获取验证码
  return http.get(apiUrl, data);
}
service.bindPhone = (data) => {
  let apiUrl = api + '/user/bindPhone.json';//描述:绑定手机号 注册 参数手机号 和 验证码
  return http.get(apiUrl, data);
}
service.getIndexData = (data) => {
  let apiUrl = api + '/index.json';//首页轮播图和桔子换礼2个
  return http.get(apiUrl, data);
}

service.getRecommendPage = (data) => {
  let apiUrl = api + '/index/recommendPage.json';//描述:首页精选推荐 sortField排序分为：IDX,PRICE,DISTANCE,SOLDNUM,CHEAP； sortOrder顺序：ASC，DESC；type商品类型：PRODUCT POINT；
  return http.get(apiUrl, data);
}

service.getHotData = (data) => {
  let apiUrl = api + '/loc/hot.json';//描述:查询热门开通城市
  return http.get(apiUrl, data);
}

service.getOpenedData = (data) => {
  let apiUrl = api + '/loc/opened.json';//描述:查询(新版)热门开通城市
  return http.get(apiUrl, data);
}

service.getCurrentLoc = (data) => {
  let apiUrl = api + '/loc/currentLoc.json';//描述:当前城市 参数经纬度
  return http.get(apiUrl, data);
}

service.getSelectHotCity = (data) => {
  let apiUrl = api + '/selectHotCity.json';//描述:选择省市县确认服务商信息 （根据上面开通城市 ）
  return http.get(apiUrl, data);
}

service.getSelectProviderByLoc = (data) => {
  let apiUrl = api + '/selectProviderByLoc.json';//描述:通过用户位置获取服务商信息
  return http.get(apiUrl, data);
}

service.getItemInfo = (data) => {
  let apiUrl = api + '/product/item.json';//描述:项目详情
  return http.get(apiUrl, data);
}

service.getPointBalance = (data) => {
  let apiUrl = api + '/point/pointBalance.json';//描述:查询桔子余额
  return http.get(apiUrl, data);
}
// -------------------------------------------comment-----------------------------------

service.commentPage = (data) => {
  let apiUrl = api + '/product/commentPage.json';//描述:获取商品所有评价
  return http.get(apiUrl, data);
}

// -------------------------------------------order-----------------------------------

//订单列表
service.orderlist = (data) => {
  let apiUrl = api + '/order/orderList.json';
  return http.get(apiUrl, data);
}
//订单详情
service.orderInfo = (data) => {
  let apiUrl = api + '/order/info.json';
  return http.get(apiUrl, data);
}
//手机号解密
service.decodeUserPhone = (data) => {
  let apiUrl = api + '/user/decodeUserPhone.json';
  return http.get(apiUrl, data);
}
//订单评论
service.commentOrder = (data) => {
  let apiUrl = api + '/product/comment.json';
  return http.post(apiUrl, data);
}
//我的评论
service.myComment = (data) => {
  let apiUrl = api + '/user/commentPage.json';
  return http.get(apiUrl, data);
}
//订单退款
service.refund = (data) => {
  let apiUrl = api + '/order/refund.json';
  return http.get(apiUrl, data);
}
//查询核销码数据
service.listVouchers = (data) => {
  let apiUrl = api + '/voucher/listVouchers.json';
  return http.get(apiUrl, data);
}

service.getPre = (data) => {
  let apiUrl = api + '/order/pre.json';//描述:下单前数据校验
  return http.get(apiUrl, data);
}

service.saveOrder = (data) => {
  let apiUrl = api + '/order/saveOrder.json';//描述:下单接口
  return http.post(apiUrl, data);
}

service.applyStoreList = (data) => {
  let apiUrl = api + '/product/applyStoreList.json';//描述:商品适用门店列表
  return http.get(apiUrl, data);
}
// -------------------------------------------juzi-----------------------------------

service.currentPoint = (data) => {
  let apiUrl = api + '/point/currentPoint.json';//描述:下单接口
  return http.get(apiUrl, data);
}
service.signIn = (data) => {
  let apiUrl = api + '/point/signIn.json';//描述:用户签到
  return http.get(apiUrl, data);
}

service.pointDetails = (data) => {
  let apiUrl = api + '/point/pointDetails.json';//查询桔子明细
  return http.get(apiUrl, data);
}

service.isNewer = (data) => {
  let apiUrl = api + '/point/isNewer.json';//是否可以新用户见面礼
  return http.get(apiUrl, data);
}

service.newerGet = (data) => {
  let apiUrl = api + '/point/newerGet.json';//领取新用户见面礼
  return http.get(apiUrl, data);
}
service.share = (data) => {
  let apiUrl = api + '/point/share.json';//用户分享
  return http.get(apiUrl, data);
}  
// --------------------------------------------usr-----------------------------------
/*获取会员信息*/
service.userInfo = (data) => {
  let apiUrl = api + '/user/userInfo.json';
  return http.get(apiUrl, data);
}

//采集小程序用户点击按钮事件的formId
service.collectFormIds = (data) => {
  let apiUrl = api + '/user/collectFormIds.json';
  return http.get(apiUrl, data);
}

/*会员注册*/
service.regist = () => {
  let apiUrl = api + '/usr/regist.json';
  return http.post(apiUrl);
}

/*生成小程序码*/
service.getQrCode = (data) => {
  let apiUrl = api + '/qr/getByProductId.json';
  return http.get(apiUrl,data);
}

service.getComIdByscence = (data) => {
  let apiUrl = api +'/qr/getBySceneId.json';
  return http.get(apiUrl,data);
}

// 获取sceneID
service.getProQrCode = (data) => {
  let url = api + '/qr/getDistributorProduct.json';
  return http.get(url, data);
}

// 拼团支付
service.splicedPayment = (data) => {
  let url = api + '/activity/consumer/spliced/payment.json';
  return http.get(url, data);
}

// 砍价支付
service.bargainPayment = (data) => {
  let url = api + '/activity/consumer/bargain/payment.json';
  return http.get(url, data);
}

service.activity = (data) => {
  let url = api + '/activity/consumer/activity.json';
  return http.get(url, data);
}

// 秒杀支付
service.secKillPay = (data) => {
  let url = api + '/secKill/pay.json';
  return http.get(url, data);
}

// 活动列表
service.activityList = (data) => {
  let url = api + '/activity/consumer/activities.json';
  return http.get(url, data);
}


module.exports = {
  service: service
}