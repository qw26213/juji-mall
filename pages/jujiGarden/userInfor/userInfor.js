// pages/jujiGarden/userInfor/userInfor.js
import { errDialog, loading, showAlert } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 1,title: '我的桔民'},
    userHeadUrl: '/images/pinglunuser.png',
    userListInfor: ['',''],
    role: '',
    pageNo: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let self = this;
    this.setData({
      role: options.role ? options.role : ''
    })
    getPersonListInfor.call(self);//get我的用户信息列表
  },
})

//  获取用户信息列表
function getPersonListInfor(){
  let self = this;
  let data = {
    role: self.data.role,
    pageNo: self.data.pageNo,
    pageSize: self.data.pageSize
  }
  jugardenService.personListInfor(data).subscribe({
    next: res => {
      if (res) {
        self.setData({
          userListInfor: res
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })

}