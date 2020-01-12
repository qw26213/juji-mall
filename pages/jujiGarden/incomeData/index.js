import { jugardenService } from '../shared/service'
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
      nvabarData: {showCapsule: 1,title: '我的收入'},
      tablist: [{ name: '本日', type: '1' }, { name: '本周', type: '2' }, { name: '本月', type: '3' }, { name: '累计', type: '4' }],
      statuslist: [{ name: '全部', status: '' }, { name: '管理佣金', status: 'DISTRIBUTOR_MANAGER_REBATE' }, { name: '购物返利', status: 'DISTRIBUTOR_SALES_REBATE' }],
      curTabIndex: 0,
      curActiveIndex:1,
      constant: constant,
      status:'',
      sortIndex: 0,
      incomelist:{},
      orderIncomelist: [],//订单列表
      curdate:"",//时间tips
      pageNo: 1,
      typeStatus: '',//管理佣金 还是购物返利 还是全部
      settlementSaleMoney: 0,//提现金额
      saleMoney: 0,//销售收入
      ifBottom: true,//返回空数组的话，已经到底部，返回不请求
    },

    onLoad: function(options) {
      wx.setNavigationBarTitle({ title: '我的收入' });
      this.getDataByType('',1);
    },

    tipAlert:function(e){
        var type = e.currentTarget.dataset.type;
        if(type==1){
            showModal('销售收入','你与已邀桔长推广的订单收入总额');
        }
        if(type==2){
            showModal('管理佣金','你邀请的桔长通过推广商品赚取到购物返利后，你可获得一部分管理佣金');
        }
        if(type==3){
            showModal('购物返利','通过向用户推广商品，被购买后你可获得购物返利');
        }
        if(type==4){
            showModal('提现金额','已消费的订单收入金额，可自动提现到微信零钱');
        }
        if(type==5){
            showModal('管理佣金','你邀请的桔长通过推广商品赚取到购物返利后，你可获得一部分管理佣金');
        }
        if(type==6){
            showModal('购物返利','通过向用户推广商品，被购买后你可获得购物返利');
        }
    },

    switchTab: function(e) {
      let thisIndex = e.currentTarget.dataset.index;
      this.setData({ 
        curTabIndex: thisIndex,
        orderIncomelist: [],
        pageNo: 1,
      });
      let type = e.currentTarget.dataset.type;
      this.getDataByType(this.data.status,type);
    },

    toggleLabel:function(e){
      let index = e.currentTarget.dataset.index;
      let type = e.currentTarget.dataset.status;
      console.log(e.currentTarget.dataset.status);
      this.setData({ 
        sortIndex: index,
        typeStatus: type,
        pageNo: 1,
        orderIncomelist: []
      });
      // this.getIncomeData(this.data.startDate, this.data.endDate);
      this.getDigestlist(this.data.status, this.data.startDate, this.data.endDate, this.data.typeStatus);
    },

    switchActive:function(e){
      let index = e.currentTarget.dataset.index;
      this.setData({ 
        curActiveIndex: index,
        pageNo: 1,
        status: e.currentTarget.dataset.status,
        orderIncomelist: []
      });
      // this.getIncomeData(this.data.startDate, this.data.endDate);
      this.getDigestlist(this.data.status, this.data.startDate, this.data.endDate, this.data.typeStatus);
    },

    getDataByType:function(status,type){
      let startDate = '';
      let endDate = '';
      if(type==1){//本日
          startDate = getNowDate()+' 00:00:00';
          endDate = getNowDate()+' 23:59:59';
          this.setData({curdate:getNowDate().replace(/-/g, ".")});
      }
      if(type==2){//本周
          startDate = getWeekFirstDay()+' 00:00:00';
          endDate = getWeekLastDay()+' 23:59:59';
          this.setData({curdate:getWeekFirstDay().replace(/-/g, ".")+"-"+getNowDate().replace(/-/g, ".")});
      }
      if(type==3){//本月
          startDate = getMonthFirstDay()+' 00:00:00';
          endDate = getMonthLastDay()+' 23:59:59';
          this.setData({curdate:getMonthFirstDay().replace(/-/g, ".")+"-"+getNowDate().replace(/-/g, ".")});
      }
      if(type==4){//累计
          startDate = '';
          this.setData({curdate:getNowDate()});
          endDate = '';
          this.setData({curdate:'至今'});
      }
      this.setData({
        startDate: startDate,
        endDate: endDate,
      })
      this.getIncomeData(startDate,endDate);
      this.getDigestlist(this.data.status,startDate,endDate,this.data.typeStatus);
    },

    //上拉加载更多
    scrolltolower: function () {
      console.log(this.data.pageNo)
      if (this.data.ifBottom) {
        return;
      }
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      this.getDigestlist(this.data.status, this.data.startDate, this.data.endDate, this.data.typeStatus);
    },

    // 我的收入
    getIncomeData: function (startDate,endDate){
        jugardenService.getIncomeInfor({
            startDate:startDate,
            endDate:endDate
        }).subscribe({
            next: res => {
              console.log(res);
              let settlementSaleMoney = 0;
              let saleMoney = 0;
              settlementSaleMoney = res.settlementManageRebate + res.settlementSaleRebate;
              saleMoney = res.manageRebate + res.saleRebate;
              console.log(saleMoney + ' ' + settlementSaleMoney);
              this.setData({ 
                incomeData: res,
                settlementSaleMoney: settlementSaleMoney,
                saleMoney: saleMoney
              });
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    // 我的收入订单摘要列表
    getDigestlist: function (status, startDate, endDate, type){
        jugardenService.getIncomeOrderDigests({
            status:status,
            startDate:startDate,
            endDate:endDate,
            type: type,
            pageNo: this.data.pageNo,
            pageSize: 10
        }).subscribe({
            next: res => {
              this.setData({ 
                orderIncomelist: this.data.orderIncomelist.concat(res),
                ifBottom: res.length == 0 ? true : false,
              });
              console.log(this.data.orderIncomelist);
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    toDetail:function(e){
      // let id = e.currentTarget.dataset.id;
      // wx.navigateTo({ url: '../orderDetail/orderDetail?orderNo='+id });
    },
});


// -----------------------methods------------------------

function getNowDate() {
    var d = new Date();
    var y = d.getFullYear()
    var m = d.getMonth() + 1;
    var d = d.getDate();
    return y+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d);
}

function getWeekFirstDay(){     
    var Nowdate=new Date();     
    var WeekFirstDay=new Date(Nowdate-(Nowdate.getDay()-1)*86400000);   
    var M=Number(WeekFirstDay.getMonth())+1;
    var D=WeekFirstDay.getDate();
    return WeekFirstDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);
}

function getWeekLastDay(){     
    var Nowdate=new Date();     
    var WeekFirstDay=new Date(Nowdate-(Nowdate.getDay()-1)*86400000);     
    var WeekLastDay=new Date((WeekFirstDay/1000+6*86400)*1000);     
    var M=Number(WeekLastDay.getMonth())+1     
    var D=WeekLastDay.getDate();
    return WeekLastDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);
}

function getMonthFirstDay(){     
    var Nowdate=new Date();     
    var MonthFirstDay=new Date(Nowdate.getFullYear(),Nowdate.getMonth(),1);     
    var M=Number(MonthFirstDay.getMonth())+1;
    var D=MonthFirstDay.getDate();
    return MonthFirstDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);     
}

function getMonthLastDay(){     
    var Nowdate=new Date();     
    var MonthNextFirstDay=new Date(Nowdate.getFullYear(),Nowdate.getMonth()+1,1);     
    var MonthLastDay=new Date(MonthNextFirstDay-86400000);     
    var M=Number(MonthLastDay.getMonth())+1;
    var D=MonthLastDay.getDate();   
    return MonthLastDay.getFullYear()+"-"+(M<10?'0'+M:M)+'-'+(D<10?'0'+D:D);     
}

function showModal(tit,str){
   wx.showModal({
      title: tit,
      showCancel: false,
      content: str,
      confirmColor:'#333333'
    });
}
