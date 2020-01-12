import { constant } from '../../utils/constant';
import { http } from '../../utils/http';
let componentService = {};
let API = constant.apiUrl;

// 活动商品详情 /activity/consumer/activity.json
componentService.activity = (data) => {
  let url = API + '/activity/consumer/activity.json';
  return http.get(url, data);
}

// 砍价 /activity/consumer/bargain/doBargain.json
componentService.doBargain = (data) => {
  let url = API + '/activity/consumer/bargain/doBargain.json';
  return http.get(url, data);
}

// 发起砍价 /activity/consumer/bargain/initiate.json
componentService.initiateBargain = (data) => {
  let url = API + '/activity/consumer/bargain/initiate.json';
  return http.get(url, data);
}


module.exports = {
  componentService: componentService
}