import {service} from '../../service';
Page({
  data: {
    nvabarData: {showCapsule: 1,title: '适用门店'},
    merchantsList: []
  },
  onLoad: function(options) {
    wx.setNavigationBarTitle({title: '适用门店'});
    wx.hideShareMenu();
    this.applyStoreList(options.id);
  },
  applyStoreList: function(id) {
    service.applyStoreList({
      productId: id
    }).subscribe({
      next: res => {
        console.log('------适用门店列表------');
        console.log(res);
        this.setData({
          merchantsList:res
        })
      },
      error: err => console.log(err),
      complete: () => wx.hideToast()
    })
  },
  toMap: function(e){
    wx.openLocation({
        latitude: e.currentTarget.dataset.lat,
        longitude: e.currentTarget.dataset.lng,
        name: e.currentTarget.dataset.name,
        address: e.currentTarget.dataset.address,
        scale: 15
    });
  },
  callPhone:function(e){
    console.log(e.currentTarget.dataset.phone);
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  }
})