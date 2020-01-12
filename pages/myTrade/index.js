import {
    errDialog,
    loading
} from '../../utils/util'
import {
    constant
} from '../../utils/constant';
import {
    service
} from '../../service';
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '桔子明细'},
        constant: {},
        tablist: ['收入', '支出'],
        curTabIndex: 0,
        isShowNodata1: false,
        isShowNodata2: false,
        pageNo: 1,
        pageSize: 10,
        inputlist: []
    },
    switchTab: function(e) {
        var thisIndex = e.currentTarget.dataset.index;
        this.setData({
            curTabIndex: thisIndex
        });
        this.getData();
    },
    //下拉刷新
    onPullDownRefresh() {
        this.setData({
            pageNo: 1
        });
        service.pointDetails({
            inOrOut: this.data.curTabIndex == 0 ? 'IN' : 'OUT',
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        }).subscribe({
            next: res => {
                console.log('----------交易记录数据--------');
                console.log(res);
                if (this.data.curTabIndex == 0) {
                    if (res.length == 0) {
                        this.setData({
                            isShowNodata1: true
                        });
                    }
                } else {
                    if (res.length == 0) {
                        this.setData({
                            isShowNodata2: true
                        });
                    }
                }
                this.setData({
                    inputlist: res
                });
            },
            error: err => console.log(err),
            complete: () => {
                setTimeout(() => {
                    wx.stopPullDownRefresh()
                }, 1000);
            }
        });
    },
    //上拉加载
    onReachBottom() {
        let p = ++this.data.pageNo;
        console.log('page:' + p);
        let obj = {
            inOrOut: this.data.curTabIndex == 0 ? 'IN' : 'OUT',
            pageNo: p,
            pageSize: this.data.pageSize
        }

        service.pointDetails({
            inOrOut: this.data.curTabIndex == 0 ? 'IN' : 'OUT',
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        }).subscribe({
            next: res => {
                console.log('----------交易记录数据--------');
                console.log(res);
                this.setData({
                    inputlist: this.data.inputlist.concat(res)
                });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });

    },
    getData: function() {
        service.pointDetails({
            inOrOut: this.data.curTabIndex == 0 ? 'IN' : 'OUT',
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize
        }).subscribe({
            next: res => {
                console.log('----------交易记录数据--------');
                console.log(res);
                if (this.data.curTabIndex == 0) {
                    if (res.length == 0) {
                        this.setData({
                            isShowNodata1: true
                        });
                    }
                } else {
                    if (res.length == 0) {
                        this.setData({
                            isShowNodata2: true
                        });
                    }
                }
                this.setData({
                    inputlist: res
                });
            },
            // error: err => errDialog(err),
            complete: () => wx.hideLoading()
        });
    },
    onShow: function() {
        this.getData();
    },
    onLoad: function(options) {
        wx.hideShareMenu();
    }
})