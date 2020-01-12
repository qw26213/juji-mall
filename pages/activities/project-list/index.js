// pages/activities/project-list/index.js
var util = require('../../../utils/util.js');
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
import { activitiesService } from '../shared/service.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: ''},
    sceneType: 'SPLICED',//查看进入的是什么场景类型  BARGAIN  SPLICED
    productList: [],
    isShowNodata: false,
    pageNo: 1,
    providerId: '',
    ifBottom: false,
    isLeft:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    var title = options.sceneType == 'SPLICED' ? '特价拼团' : '超值砍价';
    this.setData({nvabarData:{showCapsule: 1,title: title}})
    this.setData({
      sceneType: options.sceneType,
      providerId: wx.getStorageSync('providerId'),
    })
    console.log(this.data.providerId);
    console.log(wx.getStorageSync('providerId'));
    getActivityList.call(self);//获取活动列表
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.ifBottom){//已经到底部了
      console.log('加载over');
      return;
    }else{
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      getActivityList.call(this); //获取砍价列表信息
    }
  },

  /**
   * 跳转我的砍价或者我的拼团页面
   */
  toMyActivity: function(e){
    if(!this.data.isLeft){
      this.setData({isLeft:true});return;
    }
    wx.navigateTo({
      url: '/pages/activities/myActivity/index?type=' + e.currentTarget.dataset.type
    });
  },

  /**
   * 到项目详情
   */
  checkProductDetail: function(e){
    console.log(e.currentTarget.dataset.productid);
    // wx.navigateTo({
    //   url: '/pages/activities/project-detail/index?type=' + this.data.sceneType + '&id=' + e.currentTarget.dataset.productid + '&activityId=' + e.currentTarget.dataset.activityid
    // });

    if(this.data.sceneType=="SPLICED"){
      wx.navigateTo({
        url: '/pages/activities/splicedDetail/index?id=' + e.currentTarget.dataset.productid + '&activityId=' + e.currentTarget.dataset.activityid
      });
    }else{
      wx.navigateTo({
        url: '/pages/activities/bargainDetail/index?id=' + e.currentTarget.dataset.productid + '&activityId=' + e.currentTarget.dataset.activityid
      });
    }

  },
})

//获取活动列表信息
function getActivityList(){
  let self = this;
  let data = { 
    providerId: self.data.providerId,
    activityType: self.data.sceneType,
    pageNo: self.data.pageNo,
    pageSize: 10
  }
  activitiesService.activityList(data).subscribe({
    next: res => {
      if(res){
        console.log(res);
        self.setData({
          productList: self.data.productList.concat(res),
          ifBottom: res.length == 0 ? true : false
        })
        this.setData({ isShowNodata: this.data.productList.length == 0 });
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}