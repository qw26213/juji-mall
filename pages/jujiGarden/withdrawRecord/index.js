import { errDialog, loading } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();

Page({
  data: {
    nvabarData: {showCapsule: 1,title: '提现明细'},
    recordlist: [],
    totalSettlementAmount: 0,
    pageNo: 1,
    pageSize: 10,
    isShowNodata: false,
    failSettlementAmount: 0,
    processingSettlementAmount: 0,
    successSettlementAmount: 0,
    ifBottom: true,//返回空数组的话，已经到底部，返回不请求
  },

  onLoad: function() {
    let self = this;
    getSettlementList.call(self);//get提现摘要列表
    getCardData.call(self);
  },

  // 到详情页面
  toPage: function (e) {
    console.log(e.currentTarget.dataset.transferid);
    wx.navigateTo({
      url: `/pages/jujiGarden/withdrawDetail/index?transferId=` + e.currentTarget.dataset.transferid 
    });
  },

  //上拉加载更多
  scrolltolower: function () {
    let self = this;
    console.log(this.data.pageNo)
    if (this.data.ifBottom) {
      return;
    }
    this.setData({
      pageNo: this.data.pageNo + 1
    })
    getSettlementList.call(self);//get提现摘要列表
  },

});

// 提现摘要列表
function getSettlementList(){
  let self = this;
  let data = {
    pageNo: this.data.pageNo,
    pageSize: this.data.pageSize
  }
  jugardenService.getSettlementList(data).subscribe({
    next: res => {
      if (res) {
        console.log(res);
        res.forEach(function(item){
          switch (item.status) {
            // case 'PENDING':
            //   item.statusText = '待分账'; break;
            // case 'REFUNDING':
            //   item.statusText = '退款中'; break;
            // case 'REFUNDED':
            //   item.statusText = '已退款'; break;
            // case 'ACCEPTED':
            //   item.statusText = '受理成功'; break;
            case 'PROCESSING':
              item.statusText = '处理中'; break;
            // case 'FINISHED':
            //   item.statusText = '处理完成'; break;
            case 'CLOSED':
              item.statusText = '失败'; break;
            case 'SUCCESS':
              item.statusText = '成功'; break;
            // case 'UNFREEZE':
            //   item.statusText = '释放冻结资金'; break;
            // case 'ADJUST':
            //   item.statusText = '分账失败'; break;
            // case 'RETURNED':
            //   item.statusText = '已转回分账方';  
          }
        })
        self.setData({
          recordlist: res ? this.data.recordlist.concat(res) : [],
          ifBottom: res.length == 0 ? true : false
        });
        self.setData({isShowNodata:this.data.recordlist.length==0});
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}


// 卡面数据
function getCardData(){
  let self = this;
  jugardenService.transferIndex().subscribe({
    next: res => {
      if (res) {
        console.log(res);
        let totalSettlementAmount = 0;
        totalSettlementAmount = res.failSettlementAmount + res.processingSettlementAmount + res.successSettlementAmount;
        self.setData({
          failSettlementAmount: res.failSettlementAmount,
          processingSettlementAmount: res.processingSettlementAmount,
          successSettlementAmount: res.successSettlementAmount,
          totalSettlementAmount: totalSettlementAmount
        })
      }
    },
    error: err => errDialog(err),
    complete: () => wx.hideToast()
  })
}


