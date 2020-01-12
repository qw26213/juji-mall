import { constant } from '../../../utils/constant';
import { http } from '../../../utils/http';
let activitiesService = {};
let api = constant.apiUrl;

// 活动商品详情
activitiesService.activity = (data) => {
  let url = api + '/activity/consumer/activity.json';
  return http.get(url, data);
}

// 活动列表
activitiesService.activityList = (data) => {
  let url = api + '/activity/consumer/activities.json';
  return http.get(url, data);
}

activitiesService.myOrder = (data) =>{
	let url = api + '/activity/consumer/orders.json';
	return http.get(url, data);
}
// 秒杀提醒
activitiesService.remind = (data) =>{
	let url = api + '/secKill/remind.json';
	return http.get(url, data);
}

// 砍价 /activity/consumer/bargain/doBargain.json
activitiesService.doBargain = (data) => {
  let url = api + '/activity/consumer/bargain/doBargain.json';
  return http.get(url, data);
}

// 发起砍价 /activity/consumer/bargain/initiate.json
activitiesService.initiateBargain = (data) => {
  let url = api + '/activity/consumer/bargain/initiate.json';
  return http.get(url, data);
}


module.exports = {
  activitiesService: activitiesService
}