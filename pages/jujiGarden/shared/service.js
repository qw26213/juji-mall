import { constant } from '../../../utils/constant';
import { http } from '../../../utils/http';
let jugardenService = {};
let API = constant.apiUrl;

//桔园分销角色
jugardenService.getDistributorRole = () => {
  let url = API + '/distributor/getDistributorRole.json';
  return http.get(url);
}

// 桔园首页
jugardenService.getGardenHomeInfor = () => {
  let url = API + '/distributor/index.json';
  return http.get(url);
}

// 我的收入
jugardenService.getIncomeInfor = (data) => {
  let url = API + '/distributor/income.json';
  return http.get(url, data);
}

// 我的收入订单详情
jugardenService.getIncomeOrder = (data) => {
  let url = API + '/distributor/incomeOrder.json';
  return http.get(url, data);
}

// 我的收入订单摘要列表
jugardenService.getIncomeOrderDigests = (data) => {
  let url = API + '/distributor/incomeOrderDigests.json';
  return http.get(url, data);
}

// 加入分销，即加入桔园成为桔民
jugardenService.joinDistributor = (data) => {
  let url = API + '/distributor/join.json';
  return http.get(url, data);
}

// 提现明细详情
jugardenService.getSettlementDetail = (data) => {
  let url = API + '/distributor/transferDetail.json';
  return http.get(url, data);
}

// 提现摘要列表
jugardenService.getSettlementList = (data) => {
  let url = API + '/distributor/transferDigests.json';
  return http.get(url, data);
}

// 提现页面卡片数据
jugardenService.transferIndex = () => {
  let url = API + '/distributor/transferIndex.json';
  return http.get(url);
}

// 登陆
jugardenService.logIn = (data) => {
  let url = API + '/user/login.json';
  console.log(url);
  return http.get(url, data);
}

// 我的素材
jugardenService.shareList = (data) => {
  let url = API + '/distributor/shareList.json';
  return http.get(url, data);
}

// 绑定微信号和姓名
jugardenService.bindWechatInfor = (data) => {
  let url = API + '/distributor/bindWechatId.json';
  return http.get(url, data);
}

// 我的用户
jugardenService.personListInfor = (data) => {
  let url = API + '/distributor/persons.json';
  return http.get(url, data);
}

// 获取小程序码
jugardenService.getQrCode = (data) => {
  let url = API + '/qr/getDistributorProduct.json';
  return http.get(url, data);
}

module.exports = {
  jugardenService: jugardenService
}