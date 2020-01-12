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
var app = getApp();
Page({
  data: {
    nvabarData: {showCapsule: 1,title: '选择城市'},
    curCity: "",
    citylist: [],
    imageWidth: '200px',
    locationName:'',
    locationCode:'',
    locationPcode:'',
    // citylist: [],
    searching:false,
    searchValue:'',
    noRes:false,
    lowcitylist: [{
      "version": 0,
      "dateCreated": "2019-01-23 18:31:25",
      "lastUpdated": "2019-01-23 18:31:25",
      "deleted": 0,
      "locationCode": "150000",
      "locationName": "内蒙古自治区",
      "locationType": "PROVINCE",
      "parentLocationCode": "0",
      "parentLocation": null,
      "subList": [
        {
          "version": 0,
          "dateCreated": "2019-01-23 18:31:25",
          "lastUpdated": "2019-01-23 18:31:25",
          "deleted": 0,
          "locationCode": "152200",
          "locationName": "兴安盟",
          "locationType": "CITY",
          "parentLocationCode": "150000",
          "parentLocation": null,
          "subList": [
            {
              "version": 0,
              "dateCreated": "2019-01-23 18:31:25",
              "lastUpdated": "2019-01-23 18:31:25",
              "deleted": 0,
              "locationCode": "152202",
              "locationName": "阿尔山市",
              "locationType": "DISTRICT",
              "parentLocationCode": "152200",
              "parentLocation": null,
              "subList": null
            }
          ]
        }
      ]
    }],
    citylist: []
  },
  getCitylist: function() {
    service.getOpenedData().subscribe({
      next: res => {
        console.log(res);
        this.setData({
          citylist: res
        });
      },
      // error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
  },
  closeSearch: function(){
    this.setData({
      searching: false,
      noRes: false,
      searchValue: ''
    })
  },
  bindconfirm(e){
    let str = e.detail.value;
    if (str) {
      if (str.indexOf('兴') != -1 || str.indexOf('安') != -1 || str.indexOf('盟') != -1) {
        this.setData({
          searching: true,
          noRes: false
        })
      } else {
        this.setData({
          searching: true,
          noRes: true
        })
      }
    }
  },
  bindKeyInput(e){
    this.setData({
      searchValue: e.detail.value
    })
  },
  toSearch: function(e){
    console.log(this.data.searchValue)
    let str = this.data.searchValue;
    if (str){
      if (str.indexOf('兴') != -1 || str.indexOf('安') != -1 || str.indexOf('盟') != -1){
        this.setData({
          searching: true,
          noRes: false
        })
      }else{
        this.setData({
          searching: true,
          noRes: true
        })
      }
    }
    
  },
  selectCity: function(e) {
    var selectCityName = e.currentTarget.dataset['name'].replace('市', '');
    var selectPcode = e.currentTarget.dataset['pcode'];
    var selectCode = e.currentTarget.dataset['code'];
    wx.setStorageSync('selectCityName', selectCityName);
    wx.setStorageSync('selectPcode', selectPcode);
    wx.setStorageSync('selectCode', selectCode);
    wx.navigateBack({
      delta: 1
    });
  },
  onLoad: function(options) {
    wx.hideShareMenu();
    var imageWidth = (wx.getSystemInfoSync().windowWidth - 66) / 3;
    this.setData({
      imageWidth: imageWidth + 'px'
    });
    this.getCitylist();
    var obj = {
      latitude: wx.getStorageSync('curLatitude'),
      longitude: wx.getStorageSync('curLongitude')
    }
    // var obj = {
    //   latitude: 35.986896,
    //   longitude: 103.864746
    // }
    service.getCurrentLoc(obj).subscribe({
      next: res => {
        console.log(res);
        if (res.locationType != 'CITY') {
          if (res.parentLocation.locationType == 'CITY') {
            this.setData({
              locationName: res.parentLocation.locationName.replace('市', ''),
              locationPcode: res.parentLocation.parentLocation.locationCode,
              locationCode: res.parentLocation.locationCode
            });
          }
        }else{
          this.setData({
            locationName: res.locationName.replace('市', ''),
            locationCode: res.locationCode
          });
        }

      },
      // error: err => errDialog(err),
      complete: () => wx.hideToast()
    })
    // this.setData({'curCity':curCity});
  }
})