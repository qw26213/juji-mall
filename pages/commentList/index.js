import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({
  data: {
    nvabarData: {showCapsule: 1,title: '用户评价'},
    commentlist: [],
    pageNo: 1,
    pageSize: 10,
    productId: '',
    pullUpFlag: true
  },
  previewImage: function(e) {
    var arr = [];
    var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
    arr.push(url);
    wx.previewImage({
      urls: arr // 需要预览的图片http链接列表
    })
  },

  getComments: function(obj) {

  },

  toCommentDetail: function() {

  },

  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      pullUpFlag: true,
      pageNo: 1,
    });
    service.commentPage({
      productId: this.data.productId,
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize
    }).subscribe({
      next: res => {
        console.log('------所有评论-----');
        console.log(res);
        this.setData({
          commentlist: res.list
        });
      },
      error: err => console.log(err)
    })
  },

  //上拉加载
  onReachBottom() {
    if (this.data.pullUpFlag) {
      let p = ++this.data.pageNo;
      service.commentPage({
        productId: this.data.productId,
        pageNo: p,
        pageSize: this.data.pageSize
      }).subscribe({
        next: res => {
          console.log('------所有评论-----');
          console.log(res);
          this.setData({
            commentlist: this.data.commentlist.concat(res.list)
          });
          if (res.countPage <= this.data.pageNo) {
            this.setData({
              pullUpFlag: false
            });
          }
        },
        error: err => console.log(err)
      })
    }
  },
  commentPage: function(id) {
    service.commentPage({
      productId: this.data.productId,
      pageNo: this.data.pageNo,
      pageSize: this.data.pageSize
    }).subscribe({
      next: res => {
        console.log('------所有评论-----');
        console.log(res);
        this.setData({
          commentlist: res.list
        });
      },
      error: err => console.log(err)
    })
  },

  onLoad: function(options) {
    wx.hideShareMenu();
    console.log(options);
    if (options.id) {
      this.setData({
        productId: options.id
      });
      this.commentPage(options.id);
    } else {
      wx.showToast({
        title: '发生错误，未找到商品id',
        icon: 'none'
      })
      wx.navigateBack({
        delta: 1
      });
      return;
    }

  }
})