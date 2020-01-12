var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
import { constant } from '../../utils/constant';
import { service } from '../../service';
import { errDialog, loading } from '../../utils/util';
var app = getApp();
Page({
    data: {
        nvabarData: {isIndex:1,showCapsule: 0,title: '桔 集'},
        locationPcode: '',
        locationCode: '',
        locationName: '',
        businessList: [],
        topValue:28,
        autoplay: true,
        slideShowList: [],
        pointProductList: [],
        newProductList:[],
        secondList:[],
        curSecondEndTime:'2019-05-10 00:00:00',
        recommendPage: [],
        sortIndex: 1,
        pageNo: 1,
        pageSize: 5,
        sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
        providerId: '1',
        isShowNewerGet: false,
        pointBalance: 0,
        imageWidth: '200rpx',
        sortField: 'IDX',
        pullUpFlag: true,
        showPageLoading: true, //首页加载过程中标记 当最后一层的pageComment返回之后设置为false
        citylist: [],
        isFirstShow: true,
        isLoadedBalance: true,
        locationStatus: true, //定位状态
        showJcModal:false,
        joinInfo:{phone:'17316191089',wechat:'juji1031'}
    },
    showJoinModal:function(){
        this.setData({showJcModal:!this.data.showJcModal});
    },
    dialtoUs:function(){
        wx.makePhoneCall({
          phoneNumber: this.data.joinInfo.phone
        });
    },
    copyUs:function(){
        wx.setClipboardData({
          data: this.data.joinInfo.wechat,
          success: (res) => {
            wx.showToast({title: '复制成功'});
          }
        });
    },
    toPath: function(e) {
        var targetUrl = e.currentTarget.dataset['page'];
        if(e.currentTarget.dataset.tit){
            var tit = e.currentTarget.dataset.tit;
            console.log('elementName='+tit);
            wx.reportAnalytics('home_ue', {ue: tit});
        }
        wx.navigateTo({ url: targetUrl })
    },
    isNewer: function() {
        service.isNewer().subscribe({
            next: res2 => {
                console.log(res2)
                if (res2) {
                    this.setData({
                        isShowNewerGet: true
                    });
                    service.newerGet().subscribe({
                        next: res3 => {
                            console.log(res3);
                            this.currentPoint();
                        }
                    });
                }
            },
            error: err => console.log(err)
        });
    },
    onLoad: function(options) {
        console.log(options);
        wx.setNavigationBarTitle({ title: '桔 集' });
        wx.showShareMenu({ withShareTicket: true });

        if(app.globalData.barHeight!=20){
            this.setData({topValue:app.globalData.barHeight+8})
        }
        console.log('--------------index-onLoad-------------');
        if(options.referer){
            var referer = options.referer;
            var source = '';
            if(referer==0){source='正常进入'}
            if(referer==1){source='分享链接'}
            if(referer==2){source='回到首页按钮'}
            if(referer==3){source='支付结果'}
            if(referer==4){source='外链'}
            wx.reportAnalytics('home_referer', {ue: source});
        }
        //成功登陆之后 查询新用户见面礼
        this.isNewer();
        this.getJoinInfo();
        //获取热门城市
        var imageWidth = (wx.getSystemInfoSync().windowWidth - 66) / 3;
        this.setData({
            imageWidth: imageWidth + 'px'
        });
        service.getOpenedData().subscribe({
            next: res => {
                console.log('--------------新版开通的热门城市--------------');
                console.log(res);
                this.setData({
                    citylist: res
                });
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })

        console.log('---------用户位置--------');
        var that = this;
        new Promise(function(resolve3, reject3) {
            wx.getLocation({
                type: 'wgs84',
                success: function(res) { //res是经纬度
                    console.log(res);
                    that.setData({
                        locationStatus: true
                    });
                    wx.setStorageSync('curLatitude', res.latitude);
                    wx.setStorageSync('curLongitude', res.longitude);
                    resolve3(res);
                },
                fail: function(err) {
                    console.log('---------位置调用失败或是被拒绝--------');
                    console.log(err);
                    that.setData({
                        locationStatus: false
                    });
                    reject3('您没有授权获取您的地理位置，无法获取附近的优惠信息，您可以在小程序设置界面（「右上角」 - 「关于」 - 「右上角」 - 「设置」）中设置对该小程序的授权状态，并在授权之后重启小程序。');
                }
            })
        }).then(function(res) {
            return new Promise(function(resolve4, reject4) {
                //获取用户当前城市信息
                service.getCurrentLoc({
                    latitude: res.latitude,
                    longitude: res.longitude
                }).subscribe({
                    next: res1 => { //res1是定位位置的省市区县
                        console.log(res1);

                        wx.setStorageSync('locationName', res1.parentLocation.locationName.replace('市', ''));
                        wx.setStorageSync('locationCode', res1.parentLocation.locationCode);
                        wx.setStorageSync('locationPcode', res1.parentLocation.parentLocation.locationCode);

                        if (res1.locationType != 'CITY') { //查出是区县 DISTRICT
                            if (res1.parentLocation.locationType == 'CITY') { //查出是城市
                                var oldcitycode = wx.getStorageSync('locationCode');
                                console.log(oldcitycode);
                                console.log(res1.parentLocation.locationCode);
                                if (!oldcitycode) { //如果不存在定位的城市 是第一次获取位置，不询问 根据定位查询代理商信息

                                    that.setData({
                                        locationName: res1.parentLocation.locationName.replace('市', ''),
                                        locationPcode: res1.parentLocation.parentLocation.locationCode,
                                        locationCode: res1.parentLocation.locationCode
                                    });
                                    //根据定位查询代理商信息
                                    resolve4(1); //1是定位获取代理商 2是区号获取代理商
                                } else { //存在定位的城市

                                    var oldselectCode = wx.getStorageSync('selectCode');

                                    if (oldselectCode) { //判断selectCityCode存在
                                        if (oldselectCode == wx.getStorageSync('locationCode')) { //如果相同 选择与定位的一样
                                            that.setData({
                                                locationName: res1.parentLocation.locationName.replace('市', ''),
                                                locationPcode: res1.parentLocation.parentLocation.locationCode,
                                                locationCode: res1.parentLocation.locationCode
                                            });
                                            resolve4(1);
                                        } else { //如果不等 选择了其他城市

                                            that.setData({
                                                locationName: wx.getStorageSync('selectCityName'),
                                                locationPcode: wx.getStorageSync('selectPcode'),
                                                locationCode: wx.getStorageSync('selectCode')
                                            });

                                            console.log('不切换定位名称 继续使用用户选择的外地城市');
                                            var obj = {
                                                provinceCode: that.data.locationPcode,
                                                cityCode: that.data.locationCode,
                                                areaCode: '',
                                            };
                                            //选择省市县确认服务商信息
                                            service.getSelectHotCity(obj).subscribe({
                                                next: res => {
                                                    console.log('--------选择省市县确认服务商信息---------');
                                                    console.log(res);
                                                    wx.setStorageSync('providerId', res.id ? res.id : '');
                                                    that.setData({
                                                        providerId: res.id,
                                                        pageNo: 1
                                                    });
                                                    console.log('--------选择省市县确认服务商信息后重新加载首页数据---------');
                                                    that.getIndexData();
                                                    var obj = {
                                                        providerId: res.id,
                                                        sortField: 'IDX',
                                                        sortOrder: 'ASC',
                                                        pageNo: that.data.pageNo,
                                                        pageSize: that.data.pageSize,
                                                        longitude: wx.getStorageSync('curLongitude'),
                                                        latitude: wx.getStorageSync('curLatitude')
                                                    };
                                                    that.getRecommendPage(obj);
                                                },
                                                error: err => console.log(err)
                                            });

                                            wx.showModal({
                                                title: '提示',
                                                content: '是否切换到' + res1.parentLocation.locationName + '?',
                                                success: function(res2) { //res3是确认框返回的结果 是确认 还是取消

                                                    if (res2.confirm) {
                                                        wx.setStorageSync('selectCityName', res1.parentLocation.locationName.replace('市', ''));
                                                        wx.setStorageSync('selectCode', res1.parentLocation.locationCode);
                                                        wx.setStorageSync('selectPcode', res1.parentLocation.parentLocation.locationCode);
                                                        //如果是 切换到当前定位城市 通过selectPcode selectCode等查询代理商数据
                                                        that.setData({
                                                            showPageLoading: true,
                                                            locationName: res1.parentLocation.locationName.replace('市', ''),
                                                            locationPcode: res1.parentLocation.parentLocation.locationCode,
                                                            locationCode: res1.parentLocation.locationCode
                                                        });
                                                        resolve4(1);
                                                    }
                                                }
                                            });

                                        }

                                    } else { //如果不存在 用户没有选择异地城市 直接根据定位查询代理商信息
                                        that.setData({
                                            locationName: res1.parentLocation.locationName.replace('市', ''),
                                            locationPcode: res1.parentLocation.parentLocation.locationCode,
                                            locationCode: res1.parentLocation.locationCode
                                        });
                                        resolve4(1);
                                    }
                                }
                            } else { //不是城市
                                //暂时不处理
                            }
                        } else { //查出是城市
                            //暂时不处理
                        }
                    },
                    error: err => reject4(err)
                });
            });
        }).then(function(result) {
            console.log('-----查询代理商信息-----');
            console.log(result);
            return new Promise(function(resolve5, reject5) {
                if (result == 1) {
                    console.log('根据定位查询代理商信息');

                    var obj = {
                        latitude: wx.getStorageSync('curLatitude'),
                        longitude: wx.getStorageSync('curLongitude')
                    }
                    //获取服务商信息 并加载首页数据
                    service.getSelectProviderByLoc(obj).subscribe({
                        next: res => {
                            console.log('----------服务商信息---------');
                            console.log(res);
                            wx.setStorageSync('providerId', res.id ? res.id : '');
                            if (res.id) { //如果存在服务商
                                that.setData({
                                    providerId: res.id
                                });
                                that.getIndexData();
                                //根据位置查询附近精选
                                var obj1 = {
                                    providerId: res.id,
                                    sortField: 'IDX',
                                    sortOrder: 'ASC',
                                    pageNo: that.data.pageNo,
                                    pageSize: that.data.pageSize,
                                    longitude: wx.getStorageSync('curLongitude'),
                                    latitude: wx.getStorageSync('curLatitude')
                                };
                                that.getRecommendPage(obj1);
                            } else { //如果不存在服务商 显示当前地区暂未开通
                                // wx.showModal({
                                //   title: '错误',
                                //   content: '当前位置不存在服务商'
                                // });
                                that.setData({
                                    providerId: '',
                                    showPageLoading: false
                                });
                            }
                        }
                    });
                } else if (result == 2) {
                    console.log('不切换定位名称 继续使用用户选择的外地城市');
                    var obj = {
                        provinceCode: that.data.locationPcode,
                        cityCode: that.data.locationCode,
                        areaCode: '',
                    };
                    //选择省市县确认服务商信息
                    service.getSelectHotCity(obj).subscribe({
                        next: res => {
                            console.log('--------选择省市县确认服务商信息---------');
                            console.log(res);
                            wx.setStorageSync('providerId', res.id ? res.id : '');
                            that.setData({
                                pageNo: 1
                            });
                            console.log('--------选择省市县确认服务商信息后重新加载首页数据---------');
                            if (res.id) {
                                that.setData({
                                    providerId: res.id
                                });
                                that.getIndexData();
                                var obj = {
                                    providerId: res.id,
                                    sortField: 'IDX',
                                    sortOrder: 'ASC',
                                    pageNo: that.data.pageNo,
                                    pageSize: that.data.pageSize,
                                    longitude: wx.getStorageSync('curLongitude'),
                                    latitude: wx.getStorageSync('curLatitude')
                                };
                                that.getRecommendPage(obj);
                            } else {
                                that.setData({
                                    providerId: '',
                                    showPageLoading: false
                                });
                            }

                        },
                        error: err => console.log(err)
                    });
                }
            })
        }).catch(function(err) {
            console.log(err);
            that.setData({
                showPageLoading: false
            });
            wx.showModal({
                title: '错误',
                content: err
            });
        });
    },
    onShow: function() {
        setTimeout(() => {
            this.setData({
                showPageLoading: false
            });
        }, 5000);
        // this.currentPoint();
        if (wx.getStorageSync('isLeaderAlert') == 1) {
            console.log("成为了桔长");
            this.setData({ pageNo: 1 });
            var obj = {
                providerId: wx.getStorageSync('providerId'),
                sortField: 'IDX',
                sortOrder: 'ASC',
                pageNo: this.data.pageNo,
                pageSize: this.data.pageSize,
                longitude: wx.getStorageSync('curLongitude'),
                latitude: wx.getStorageSync('curLatitude')
            };
            this.getRecommendPage(obj);
            wx.removeStorageSync('isLeaderAlert');
        }
        if (wx.getStorageSync('selectCode')) { //存在 说明用户选过异地城市
            if (wx.getStorageSync('locationCode') != wx.getStorageSync('selectCode')) {
                //如果城市更换了 需要通过用户选择的城市编号code重新加载页面
                console.log('用户使用自选城市111：' + wx.getStorageSync('selectCityName'));
                console.log('selectCode: ' + wx.getStorageSync('selectCode'));
                console.log('selectPcode: ' + wx.getStorageSync('selectPcode'));
                console.log('selectCityName: ' + wx.getStorageSync('selectCityName'));
                //此处应该判断用户有没有再次更换城市 如果没有更换城市不再次查询
                // wx.setStorageSync('locationCode', wx.getStorageSync('selectCode'));
                if (this.data.locationCode == wx.getStorageSync('selectCode')) {
                    console.log('没有查询且返回了');
                    return;
                } else {
                    this.setData({
                        showPageLoading: true,
                        sortIndex: 1,
                        pageNo: 1,
                        pullUpFlag: true,
                        sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
                        locationCode: wx.getStorageSync('selectCode'),
                        locationPcode: wx.getStorageSync('selectPcode'),
                        locationName: wx.getStorageSync('selectCityName')
                    });
                    console.log('------------pullUpFlag-------------');
                    console.log(this.data.pullUpFlag);
                    if (this.data.isFirstShow) {
                        this.setData({
                            isFirstShow: false
                        })
                        return;
                    }
                    this.getDataByCity(); //获取所选城市的服务商Id
                }
            } else {
                console.log('用户使用定位城市：' + this.data.locationName);
                if (this.data.isFirstShow) {
                    this.setData({
                        isFirstShow: false
                    })
                    return;
                }
                console.log('用户使用定位城市并向下');
                //如果没有更换城市 有两种情况 一种是由其他城市切回所在城市 一种是由其他页面回退到本页面
                if (this.data.locationCode == wx.getStorageSync('selectCode')) {
                    console.log('没有查询且返回了');
                    return;
                } else {
                    this.setData({
                        showPageLoading: true,
                        locationCode: wx.getStorageSync('locationCode'),
                        locationPcode: wx.getStorageSync('locationPcode'),
                        locationName: wx.getStorageSync('locationName')
                    });
                    var curLatitude = wx.getStorageSync('curLatitude'),
                        curLongitude = wx.getStorageSync('curLongitude');
                    if (curLatitude && curLongitude) { //已经定位了并且有经纬度的情况
                        var obj = {
                            latitude: curLatitude,
                            longitude: curLongitude
                        }
                        //获取用户当地服务商信息
                        this.getProviderId();
                    } else { //如果一开始没有获取到经纬度
                        console.log('一开始没有获取到经纬度');
                        //判断是否有获取定位的权限
                        wx.getSetting({
                            success: (res) => {
                                console.log('是否具有定位权限：' + res.authSetting['scope.userLocation']);
                                if (res.authSetting['scope.userLocation']) { //如果已经授权
                                    wx.getLocation({
                                        type: 'wgs84',
                                        success: function(res) {
                                            wx.setStorageSync('curLatitude', res.latitude);
                                            wx.setStorageSync('curLongitude', res.longitude);
                                            console.log('--------位置调用成功--------');

                                            //获取用户当前城市信息
                                            service.getCurrentLoc({
                                                latitude: res.latitude,
                                                longitude: res.longitude
                                            }).subscribe({
                                                next: res => {
                                                    console.log('---------获取用户当前城市信息-------');
                                                    console.log(res);
                                                    wx.setStorageSync('locationName', res.parentLocation.locationName.replace('市', ''));
                                                    wx.setStorageSync('locationCode', res.parentLocation.locationCode);
                                                    wx.setStorageSync('locationPcode', res.parentLocation.parentLocation.locationCode);
                                                    this.setData({
                                                        locationName: res.parentLocation.locationName.replace('市', ''),
                                                        locationCode: res.parentLocation.locationCode,
                                                        locationPcode: res.parentLocation.parentLocation.locationCode
                                                    });
                                                }
                                            });
                                            this.getIndexData();
                                            //根据位置查询附近精选
                                            var obj = {
                                                providerId: this.data.providerId,
                                                sortField: 'IDX',
                                                sortOrder: 'ASC',
                                                pageNo: this.data.pageNo,
                                                pageSize: this.data.pageSize,
                                                longitude: wx.getStorageSync('curLongitude'),
                                                latitude: wx.getStorageSync('curLatitude')
                                            };
                                            this.getRecommendPage(obj);
                                        }
                                    });
                                    clearInterval(that.userLocationInterval);
                                }
                            }
                        });
                    }
                }
            }
        } else {
            //不存在 定位获取
            if (this.data.isFirstShow) {
                this.setData({
                    isFirstShow: false
                })
            }
            this.setData({
                showPageLoading: false
            });
            return;
        }
    },
    getProviderId: function() {
        var curLatitude = wx.getStorageSync('curLatitude');
        var curLongitude = wx.getStorageSync('curLongitude');
        var obj = {
            latitude: curLatitude,
            longitude: curLongitude
        }
        service.getSelectProviderByLoc(obj).subscribe({
            next: res1 => {
                console.log('----------服务商信息---------');
                console.log(res1);
                if (res1.id) { //如果存在服务商
                    wx.setStorageSync('providerId', res1.id ? res1.id : '');
                    this.setData({
                        providerId: res1.id,
                        pageNo: 1,
                        pullUpFlag: true
                    });
                    this.getIndexData();
                    //根据位置查询附近精选
                    var obj = {
                        providerId: this.data.providerId,
                        sortField: 'IDX',
                        sortOrder: 'ASC',
                        pageNo: this.data.pageNo,
                        pageSize: this.data.pageSize,
                        longitude: curLongitude,
                        latitude: curLatitude,
                    };
                    this.getRecommendPage(obj);
                } else { //如果不存在服务商
                    this.setData({
                        showPageLoading: false,
                        providerId: '',
                        pageNo: 1
                    });
                }
            }
        });
    },
    currentPoint: function() {
        //桔子球 查询用户当前桔子数
        service.currentPoint().subscribe({
            next: res3 => {
                console.log(res3);
                this.setData({
                    pointBalance: res3.pointBalance,
                });
            }
        });
    },
    share: function(obj) {
        service.share(obj).subscribe({
            next: res => {
                console.log('---------分享接口返回--------');
                console.log(res);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
    //关闭新用户见面礼
    closeGetNewer: function() {
        this.setData({
            isShowNewerGet: false
        });
    },
    //领取桔集见面礼
    getNewer: function() {
        this.setData({
            isShowNewerGet: false
        });

        service.newerGet().subscribe({
            next: res => {
                console.log(res);
                wx.showToast({
                    title: '领取成功！',
                    icon: 'none'
                });
                this.currentPoint();
            },
            error: err => wx.showToast({
                title: err,
                icon: 'none'
            })
        });
    },
    //点击banner
    onTapBanner: function(e) {
        var link = e.currentTarget.dataset.link;
        if (link == '/juzihl/index' && this.data.pointProductList.length == 0) {
            return;
        }
        wx.reportAnalytics('home_ue', {ue: e.currentTarget.dataset.tit});
        wx.navigateTo({
            url: '/pages' + link
        });
    },
    //跳转到商品详情
    toComDetail: function(e) {
        wx.reportAnalytics('home_ue', {ue: '商品详情'});
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        console.log(id);
        wx.navigateTo({
            url: '/pages/comDetail/index?share=0&referer=0&id=' + id + '&storeid=' + storeid
        });
    },
    // 分享
    toComDetailAndShare: function(e) {
        wx.reportAnalytics('home_ue', {ue: '首页推广'});
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        wx.navigateTo({
            url: '/pages/comDetail/index?share=1&referer=0&id=' + id + '&storeid=' + storeid
        });
    },
    //上拉加载
    onReachBottom:function() {
        //判断是否还可以上拉
        if (this.data.pullUpFlag && this.data.providerId) {
            let that = this;
            let p = ++this.data.pageNo;
            console.log('page:' + p);
            let obj = {
                providerId: that.data.providerId,
                sortField: that.data.sortField,
                sortOrder: that.data.sortArray[Number(that.data.sortIndex) - 1],
                pageNo: p,
                pageSize: that.data.pageSize,
                longitude: wx.getStorageSync('curLongitude'),
                latitude: wx.getStorageSync('curLatitude')
            };

            service.getRecommendPage(obj).subscribe({
                next: res => {
                    console.log(res);
                    this.setData({
                        recommendPage: this.data.recommendPage.concat(res.list)
                    });
                    console.log(res.countPage);
                    console.log(this.data.pageNo);
                    if (res.countPage <= this.data.pageNo) {
                        this.setData({
                            pullUpFlag: false
                        });
                    }
                },
                error: err => console.log(err),
                complete: () => wx.hideToast()
            });
        } else {
            return;
        }

    },
    //下拉刷新
    onPullDownRefresh:function() {
        let that = this;
        this.setData({
            pullUpFlag: true,
            sortField: 'IDX',
            sortIndex: 1,
            pageNo: 1,
            sortArray: ['ASC', 'ASC', 'ASC', 'DESC']
        });
        this.currentPoint();
        if (this.data.providerId) {
            this.getIndexData();
            //根据位置查询附近精选
            var obj = {
                providerId: that.data.providerId,
                sortField: 'IDX',
                sortOrder: 'ASC',
                pageNo: that.data.pageNo,
                pageSize: that.data.pageSize,
                longitude: wx.getStorageSync('curLongitude'),
                latitude: wx.getStorageSync('curLatitude')
            };
            service.getRecommendPage(obj).subscribe({
                next: res => {
                    console.log(res);
                    this.setData({
                        recommendPage: res.list
                    });
                },
                error: err => console.log(err),
                complete: () => {
                    setTimeout(() => {
                        wx.stopPullDownRefresh()
                    }, 1000);
                }
            });
        } else {
            wx.stopPullDownRefresh();
        }
    },
    //根据服务商id（providerId）获取首页轮播图地址和桔子换礼的推荐
    getIndexData: function() {
        service.getIndexData({
            providerId: this.data.providerId,
            longitude: wx.getStorageSync('curLongitude'),
            latitude: wx.getStorageSync('curLatitude')
        }).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    slideShowList: res.slideShowList,
                    pointProductList: res.pointProductList
                });
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        });
        this.getNewProductList();
        this.getSecondList(); //获取秒杀活动列表
    },
    //获取所有商品，以分页列表形式展示
    getRecommendPage: function(obj) {
        console.log(obj);
        service.getRecommendPage(obj).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    showPageLoading: false,
                    recommendPage: res.list
                });
            },
            error: err => {
                console.log(err);
                this.setData({
                    showPageLoading: false
                });
            },
            complete: () => wx.hideToast()
        });
    },
    //当前城市没有数据时 点击了其他热门城市
    selectCity: function(e) {
        this.setData({
            showPageLoading: true
        });
        console.log('点击了下面的其他城市');
        var selectCityName = e.currentTarget.dataset['name'].replace('市', '');
        var selectPcode = e.currentTarget.dataset['pcode'];
        var selectCode = e.currentTarget.dataset['code'];
        wx.setStorageSync('selectCityName', selectCityName);
        wx.setStorageSync('selectPcode', selectPcode);
        wx.setStorageSync('selectCode', selectCode);
        this.setData({
            sortIndex: 1,
            pageNo: 1,
            pullUpFlag: true,
            sortArray: ['ASC', 'ASC', 'ASC', 'DESC'],
            locationCode: wx.getStorageSync('selectCode'),
            locationPcode: wx.getStorageSync('selectPcode'),
            locationName: wx.getStorageSync('selectCityName')
        });
        this.currentPoint();
        this.getDataByCity(); //首页数据已经更新
    },
    /**
     * 用户点击右上角分享或页面中的分享
     */
    onShareAppMessage: function(res) {
        var obj = {
            type: 'SHARE_PROGRAM',
            sharePath: '/pages/index/index'
        };
        this.share(obj);
        return {
            title: '桔集：聚集优质好店，体验美好生活！',
            imageUrl: '/images/shareImg.png',
            path: '/pages/login/index?inner=1&invitecode=' + wx.getStorageSync('inviteCode')
        }
    },
    //已知省市代码，获取该地点的服务商信息，然后更新首页数据
    getDataByCity: function() {
        var that = this;
        var obj = {
            provinceCode: this.data.locationPcode,
            cityCode: this.data.locationCode,
            areaCode: '',
        };
        console.log(JSON.stringify(obj));
        //选择省市县确认服务商信息
        service.getSelectHotCity(obj).subscribe({
            next: res => {
                console.log('--------选择省市县确认服务商信息---------');
                console.log(res);
                that.setData({
                    providerId: res.id,
                    pageNo: 1
                });
                wx.setStorageSync('providerId', res.id ? res.id : '');
                console.log('--------选择省市县确认服务商信息后重新加载首页数据---------');
                that.getIndexData();
                var obj = {
                    providerId: res.id,
                    sortField: 'IDX',
                    sortOrder: 'ASC',
                    pageNo: that.data.pageNo,
                    pageSize: that.data.pageSize,
                    longitude: wx.getStorageSync('curLongitude'),
                    latitude: wx.getStorageSync('curLatitude')
                };
                that.getRecommendPage(obj);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        });
    },
    callPhone: function() {
        wx.makePhoneCall({
            phoneNumber: '4000011139'
        });
    },
    toNextDetail: function(e) {
        var type = e.currentTarget.dataset.type;
        var id = e.currentTarget.dataset.id;
        var storeid = e.currentTarget.dataset.storeid;
        var actId = e.currentTarget.dataset.actid;
        wx.reportAnalytics('home_ue', {ue: e.currentTarget.dataset.tit});
        if (type == 'SPLICED') {
            wx.navigateTo({
                url: '/pages/activities/splicedDetail/index?id=' + id + '&activityId=' + actId
            });
        } else if (type == "BARGAIN") {
            wx.navigateTo({
                url: '/pages/activities/bargainDetail/index?id=' + id + '&activityId=' + actId
            });
        } else if (type == "SEC_KILL") {
            wx.navigateTo({
                url: '/pages/activities/secondDetail/index?id=' + id + '&activityId=' + actId
            });
        } else {
            wx.navigateTo({
                url: '/pages/comDetail/index?share=0&referer=0&id=' + id + '&storeid=' + storeid
            });
        }
    },
    getNewProductList: function() {
        var obj = {
            providerId: this.data.providerId,
            subject:"新品抢鲜",
            sortField: 'IDX',
            sortOrder: 'ASC',
            pageNo: 1,
            pageSize: 5,
            longitude: wx.getStorageSync('curLongitude'),
            latitude: wx.getStorageSync('curLatitude')
        };

        service.getRecommendPage(obj).subscribe({
            next: res => {
                console.log(res);
                this.setData({
                    newProductList: res.list
                });
            },
            error: err => {},
            complete: () => wx.hideToast()
        });
    },
    getSecondList:function(){
        this.setData({secondList:[]});
        this.getSecondListByStatus('STARTED');
        this.getSecondListByStatus('READY');
    },
    getSecondListByStatus: function(status) {
        let data = {
            providerId: this.data.providerId,
            activityType: 'SEC_KILL',
            activityStatus: status,
            pageNo: 1,
            pageSize: 10
        }
        service.activityList(data).subscribe({
            next: res => {
                if (res) {
                    this.setData({
                        secondList: res.concat(this.data.secondList)
                    });
                }
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    getJoinInfo: function(scene,type) {
        wx.request({
            url: 'https://juji.juniuo.com/data/wxappData.php',
            method: 'GET',
            header: { 'content-type': 'application/json' },
            success: (res) => {
                this.setData({
                    joinInfo: res.data.data.contact,
                });
                if (type == 1) {
                    this.nextPage();
                }
            }
        });
    },
})