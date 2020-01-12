import {
  service
} from '../../service';
import {
  constant
} from '../../utils/constant';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {showCapsule: 0,title: '桔 集'},
    logo: '',//门店logo
    storeName: '',//门店名称
    showFocus: true,//显示光标
    numArr: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    amount: '',
    dAmount: 0,
    maxAmount: 20000,
    seledAccount: false,
    showBalanceWrap: false,
    showSelectCard: false,
    cardList: [],
    selectCardId: '',
    paytype: 'recommend',
    recommend: '1',//默认选中储值支付 0则默认微信支付
    recommendStatus: '0',//默认开启储值推荐也就是可以到第二页 为'1'则不展示第二页直接支付
    discount: 0, //储值折扣
    url: '',
    qrcode:'',
    headImg:'',
    merchantId:'',
    storeId:'',
    storeName:'',
    type:'',
    accountFlag: false,
    balance: 0,
    givingMoney: 0,
    accountpaystatus: false,//余额支付等待中效果标记
    payUrl: 'https://juji.juniuo.com',
    conHeight:400,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var conHeight = app.globalData.screenHeight-app.globalData.barHeight-45;
    console.log("内容区高"+conHeight);
    this.setData({conHeight:conHeight})
    console.log(options);
    let that = this;
    new Promise(function (resolve, reject) {
      // wx.showLoading({
      //   title: '加载中',
      //   mask: true
      // })
      // that.setData({
      //   accountpaystatus: true
      // });
      console.log('Promise is ready!');
      if (options.q) {
        console.log(options.q);
        var link = decodeURIComponent(options.q);
        console.log(link);
        let arr = link.split('/qrm/');
        console.log(arr);//['https://juji-dev.juniuo.com','212345678.htm']
        if(arr[0]){
          that.setData({
            payUrl: arr[0]
          });
          wx.setStorageSync('payUrl', arr[0]);
        }else{
          that.setData({
            payUrl: that.data.payUrl
          });
        }
        let arr1 = arr[1].split('.htm');
        console.log(arr1);//['212345678']
        console.log('qrcode: ' + arr1[0]);
        that.setData({
          url: link,
          qrcode: arr1[0]
        });
        resolve();
      } else {
        wx.showModal({
          title: '警告',
          content: '该二维码用于系统测试，请勿支付',
        });
        // reject('options.q不存在');
        options.q = 'https://juji-dev.juniuo.com/qrm/212345678.htm';//测试用
        var link = decodeURIComponent(options.q);
        console.log(link);
        let arr = link.split('/qrm/');
        console.log(arr);//['https://juji-dev.juniuo.com','212345678.htm']
        if (arr[0]) {
          that.setData({
            payUrl: arr[0]
          });
          wx.setStorageSync('payUrl', arr[0]);
        } else {
          that.setData({
            payUrl: that.data.payUrl
          });
        }
        let arr1 = arr[1].split('.htm');
        console.log(arr1);//['212345678']
        console.log('qrcode: ' + arr1[0]);
        that.setData({
          url: link,
          qrcode: arr1[0]
        });
        resolve();
      }
    }).then(function () {
      return new Promise(function (resolve1, reject1) {
        
        wx.login({
          success: res => {
            console.log('code: ' + res.code);
            console.log(constant.APPID);
            resolve1(res.code);
          }
        })
      })
    }).then(function (code) {
      return new Promise(function (resolve2, reject2) {
        wx.request({
          url: that.data.payUrl+'/mini/login.json',
          method: 'POST',
          data: {
            appid: constant.APPID,
            code: code,
            qrcode: that.data.qrcode
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          success: (res) => {
            console.log('-----------桔集支付返回门店信息----------');
            console.log(res);

            if (res.data.errorCode == '0') {
              wx.setStorageSync('accessToken', res.data.data.accessToken);
              that.setData({
                headImg: res.data.data.headImg,
                merchantId: res.data.data.merchantId,
                recommend: res.data.data.recommend,
                recommendStatus: res.data.data.recommendStatus,
                storeId: res.data.data.storeId,
                storeName: res.data.data.storeName,
                type: res.data.data.type,
                paytype: res.data.data.recommend == '1' ? 'recommend' : 'thirdpay'
              })
              // that.getAccount();
              wx.request({
                url: that.data.payUrl + '/customer/user/getAccount.json',
                method: 'GET',
                data: {
                  merchantId: that.data.merchantId
                },
                header: {
                  'content-type': 'application/json',
                  'Access-Token': wx.getStorageSync('accessToken')
                },
                success: (res2) => {
                  console.log('---------用户余额----------');
                  console.log(res2);
                  if (res2.data.errorCode == "0") {
                    if (res2.data.data.balance > 0) { //当余额存在且大于0的情况

                      that.setData({
                        paytype: 'account',
                        accountFlag: true,
                        showBalanceWrap: true,
                        seledAccount: true,
                        balance: Number(res2.data.data.balance).toFixed(2)
                      });
                    } else {

                      that.setData({
                        accountFlag: false,
                        showBalanceWrap: false,
                        seledAccount: false
                      });
                    }
                    // wx.hideLoading();
                    // that.setData({
                    //   accountpaystatus: false
                    // });
                    resolve2();
                  }else{
                    reject2('查询余额失败，错误码:' + res2.data.errorCode + ' 返回错误: ' + res2.data.errorInfo);
                  }
                }
              });
              
            } else {
              reject2('登录失败，错误码:' + res.data.errorCode + ' 返回错误: ' + res.data.errorInfo);
            }
          }
        });

      })
    }).catch(function (err) {
      // wx.hideLoading();
      // that.setData({
      //   accountpaystatus: false
      // });
      wx.showModal({
        title: '错误',
        content: err,
      });
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setStorageSync('scene','1011');//测试用
    let scene = wx.getStorageSync('scene');
    if (scene == '1011' || scene == '1012' || scene == '1013') {//扫描二维码场景值
      return ;
    }else{
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  clickAccountPay:function() {
    if (this.data.seledAccount) {
      this.setData({
        seledAccount : false,
        paytype: 'recommend'
      });
    } else {
      this.setData({
        seledAccount : true,
        paytype : 'account'
      });
    }
  },
  getAccount: function() {
    let that = this;
    wx.request({
      url: that.data.payUrl +'/customer/user/getAccount.json',
      method: 'GET',
      data: {
        merchantId: that.data.merchantId
      },
      header: {
        'content-type': 'application/json',
        'Access-Token': wx.getStorageSync('accessToken')
      },
      success: (res) => {
        console.log('---------用户余额----------');
        console.log(res);
        if (res.data.errorCode == "0") {
          if (res.data.data.balance > 0) { //当余额存在且大于0的情况
            
            that.setData({
              paytype : 'account',
              accountFlag : true,
              showBalanceWrap : true,
              seledAccount : true,
              balance : Number(res.data.data.balance).toFixed(2)
            });
          } else {
            
            that.setData({
              accountFlag : false,
              showBalanceWrap : false,
              seledAccount : false
            });
          }
        }
      }
    });
  },
  toPay: function () {
    if (this.data.toPayStatus) {
      return;
    }
    this.setData({
      toPayStatus: true
    });
    console.log('this.paytype: ' + this.data.paytype);
    let orderObj = {};
    this.data.paytype ? orderObj.choosenType = this.data.paytype : orderObj;
    this.data.selectCardId ? orderObj.prepayRuleId = this.data.selectCardId : orderObj;
    this.data.givingMoney != undefined && this.data.givingMoney != null ? orderObj.givingMoney = this.data.givingMoney : orderObj;
    orderObj.orderPay = Number(this.data.dAmount);//订单消费的金额 用户在门店消费金额
    if (this.data.seledAccount) {//勾选了余额支付
      if (this.data.paytype === 'account') { //如果勾选了余额支付且选择微信支付后 支付类型是account 是组合支付
        console.log('微信组合支付');
        orderObj.pay = Number(this.data.amount);
        this.wxpay(orderObj);
      } else if (this.data.paytype === 'recommend') { //如果是储值支付
        console.log('微信储值支付');
        orderObj.pay = Number(this.data.selectCardPay);
        this.wxpay(orderObj);
      }
    } else {//没有勾选
      if (this.data.paytype === 'recommend') {
        console.log('微信储值支付');
        orderObj.pay = Number(this.data.selectCardPay);
        this.wxpay(orderObj);
      } else {
        console.log('微信支付');
        orderObj.pay = Number(this.data.dAmount);
        this.wxpay(orderObj);

      }
    }

    console.log(orderObj);
  },
  wxpay(orderObj) {
    let that = this;
    wx.request({
      url: that.data.payUrl +'/customer/order/miniPreOrder.json',
      method: 'POST',
      data: {
        choosenType: orderObj.choosenType,
        givingMoney: Number(orderObj.givingMoney),
        orderPay: Number(orderObj.orderPay),
        pay: Number(orderObj.pay),
        prepayRuleId: orderObj.prepayRuleId,
        storeId: that.data.storeId
      },
      header: {
        'content-type': 'application/json',
        'Access-Token': wx.getStorageSync('accessToken')
      },
      success: (res) => {
        console.log('---------使用微信支付返回数据----------');
        console.log(res);
        if (res.data.errorCode == "0") {
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success(res2) {
              console.log(res2);
              wx.redirectTo({
                url: '/pages/payresult/index?orderId=' + res.data.data.orderId,
              });
              that.setData({
                toPayStatus: false
              });
            },
            fail(res2) {
              console.log(res2);
              if (res2.errMsg == 'requestPayment:fail cancel') {
                wx.showToast({
                  title: '用户取消支付',
                  icon: 'none'
                });
                
              }
              that.setData({
                toPayStatus: false,//取消正在支付状态
                accountpaystatus: false//取消loading状态
              });

            }
          });
        } else {
          // this.$toast(res.data.errorInfo, 'center');
          wx.showModal({
            title: '提示',
            content: res.data.errorInfo,
          })
          that.setData({
            toPayStatus: false,//取消正在支付状态
            accountpaystatus: false//取消loading状态
          });
        }
      }
    });
    
  },
  changePaytype: function () {
    this.setData({
      paytype: 'recommend'
    });
  },
  changePaytype3: function () {
    console.log(this.data.seledAccount);
    if (this.data.seledAccount) {
      this.setData({
        paytype: 'account'
      });
    } else {
      this.setData({
        paytype: 'thirdpay'
      });
    }
    console.log(this.data.paytype);
  },

  keyTap: function (e) {
    console.log(e.currentTarget.dataset.num);
    if (this.data.amount == '请输入付款金额') {
      this.data.amount = '';
    }
    let keys = e.currentTarget.dataset.num,
      content = this.data.amount, //金额字符
      len = content.length; //金额字符长度
    switch (keys) {
      case ".":
        if (len < 8 && content.indexOf(".") == -1) {
          //如果字符串里有小数点了，则不能继续输入小数点，且控制最多可输入10个字符串
          if (len < 1) {
            //如果小数点是第一个输入，那么在字符串前面补上一个0，让其变成0.
            content = "0.";
          } else {
            //如果不是第一个输入小数点，那么直接在字符串里加上小数点
            content += ".";
          }
        }
        break;
      case "-": //如果点击删除键就删除字符串里的最后一个
        content = content.substr(0, content.length - 1);
        break;
      case 0:
        if (content.indexOf("0") != 0) { //如果第一位不是0 可以显示一个0 如果第二位是个小数点可以再显示一个0
          //判断小数点前的数字位数 如果超过5位 则接下来只能输入小数点
          let arr = content.split('.');
          console.log(arr);
          if (arr.length < 2) { //如果没有小数位的情况下
            if (arr[0].length < 5) { //小数点前的数字在5位以内
              let str = content; //开始输入的4位（包括4位）以内的数
              str += keys;
              if (Number(str) > this.data.maxAmount) { //此处判断例如30000、40000等超过20000的情况
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
                return;
              } else {
                content += keys;
              }
            } else {
              wx.showModal({
                title: '错误',
                content: '输入最大金额不能超过' + this.data.maxAmount
              });
            }
          } else { //如果有小数位
            if (arr[1] == "" || arr[1].length === 1) {
              content += keys;
            }
          }
        } else { //如果第一位是0
          if (content.indexOf(".") == 1) { //在是 '0.' 的情况 可以再输入一次0 '0.0'的情况不可以再输入0
            if (content.length == 2) {
              content += keys;
            } else if (content.length == 3) {
              if (content == '0.0') {
                wx.showModal({
                  title: '错误',
                  content: '输入金额不能为 0.00'
                });
              } else {
                content += keys;
              }
            }
          }
        }
        break;
      default:
        let index = content.indexOf("."); //小数点在字符串中的位置
        if (index == -1 || len - index != 3) {
          //判断第一位为0且没有小数点的情况
          if (content.indexOf("0") == 0 && index == -1) {
            content = keys.toString();
          } else {
            //判断小数点前的数字位数 如果超过5位 则接下来只能输入小数点
            let arr = content.split('.');
            console.log(arr);
            if (arr.length < 2) { //如果没有小数位的情况下
              if (arr[0].length < 5) { //小数点前的数字在5位以内
                let str = content; //开始输入的3位（包括3位）以内的数
                str += keys;
                if (Number(str) > this.data.maxAmount) {
                  wx.showModal({
                    title: '错误',
                    content: '输入最大金额不能超过' + this.data.maxAmount
                  });
                  return;
                } else {
                  content += keys;
                }
              } else {
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
              }
            } else { //如果有小数位
              let str = content;
              str += keys;
              if (Number(str) > this.data.maxAmount) {
                wx.showModal({
                  title: '错误',
                  content: '输入最大金额不能超过' + this.data.maxAmount
                });
                return;
              } else {
                content += keys;
              }
            }
          }

        }
        break;
    }
    this.setData({
      amount: content
    });
  },

  toResult() {
    if (this.data.amount != '' && this.data.amount != '请输入付款金额' && this.data.amount != 0 && this.data.storeId) {

      if (this.data.seledAccount) {//如果用户勾选了余额支付
        //此处判断余额付款和组合付款的情况 余额付款直接跳转到结果页面 组合支付还要到当前页的另一层
        if (Number(this.data.amount) > this.data.balance) {//如果输入金额比用户余额多
            console.log('如果输入金额比用户余额多');
          if (this.data.recommendStatus == '0' || !this.data.recommendStatus) {//显示储值支付
            this.getPayment(Number(this.data.amount).toFixed(2));
            this.setData({
              dAmount: Number(this.data.amount).toFixed(2),//保存一个接口传入需要用的amount
              amount: Number(Number(this.data.amount) - this.data.balance).toFixed(2),
              showBalanceWrap: false,
              showFocus: false,
              showSelectCard: true
            });
          } else if (this.data.recommendStatus == '1') {//只能微信支付 直接调用微信支付 不再显示中间推荐储值页
            //如果勾选了余额支付 在组合支付的情况下 无论储值支付是否开启 都直接微信支付
            this.setData({
              accountpaystatus: true//显示支付loading
            });
            let orderObj = {};
            orderObj.choosenType = 'account';
            orderObj.orderPay = Number(this.data.amount);
            orderObj.pay = Number(Number(this.data.amount) - this.data.balance).toFixed(2);
            orderObj.givingMoney = 0;
            this.wxpay(orderObj);
          }
        } else {//如果用户余额充足，可以执行余额支付
          this.setData({
            accountpaystatus: true//显示支付loading
          });
          let orderObj = {};
          this.data.paytype ? orderObj.choosenType = this.data.paytype : orderObj;
          orderObj.orderPay = Number(this.data.amount);
          orderObj.pay = Number(this.data.amount);
          this.accountPay(orderObj);
        }
      } else {
        console.log('如果没有勾选余额支付');
        //如果没有勾选余额支付
        this.setData({
          amount: Number(this.data.amount).toFixed(2),
          dAmount: Number(this.data.amount).toFixed(2)
        });
        console.log(this.data.dAmount);
        
        //判断是否优先储值支付
        if (this.data.recommendStatus == '0' || !this.data.recommendStatus){//显示储值支付
          this.getPayment(this.data.dAmount);
          this.setData({
            showBalanceWrap: false,
            showFocus: false,
            showSelectCard: true
          });
        } else if (this.data.recommendStatus == '1'){//只能微信支付 直接调用微信支付 不再显示中间推荐储值页
          this.setData({
            accountpaystatus: true//显示支付loading
          });
          let orderObj = {};
          orderObj.choosenType = 'thirdpay';
          orderObj.orderPay = Number(this.data.dAmount);
          orderObj.pay = Number(this.data.dAmount);
          orderObj.givingMoney = 0;
          this.wxpay(orderObj);
        }
        
      }
    }
  },
  // 余额支付
  accountPay(orderObj) {
    let that = this;
    wx.request({
      url: that.data.payUrl +'/customer/order/accountPay.json',
      method: 'POST',
      data: {
        storeId: that.data.storeId,
        orderPay: Number(orderObj.orderPay)
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Access-Token': wx.getStorageSync('accessToken')
      },
      success: (res) => {
        console.log('---------使用余额支付返回数据----------');
        console.log(res);
        that.setData({
          toPayStatus:false
        });
        if (res.data.errorCode == "0") {
          console.log('---------------余额支付成功----------------');
          wx.redirectTo({
            url: '/pages/payresult/index?orderId=' + res.data.data
          });
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.errorInfo,
          })
        }
      }
    });
  },
  getPayment(orderPay) {
    let that = this;
    wx.request({
      url: that.data.payUrl +'/customer/order/getPayment.json',
      method: 'GET',
      data: {
        storeId: that.data.storeId,
        orderPay: orderPay
      },
      header: {
        'content-type': 'application/json',
        'Access-Token': wx.getStorageSync('accessToken')
      },
      success: (res) => {
        console.log('-----------余额以及卡列表数据等----------');
        console.log(res);
        if (res.data.errorCode == "0") {
          //支付类型不再依赖于返回 如果 this.cardList长度>0则默认 recommend 没有选择余额时为 thirdpay
          that.setData({
            cardList: res.data.data.recommendCards
          });
          if (that.data.cardList.length > 0) {
            //$$('recommend').value 是否优先储值支付 1是储值 0是只有余额
            if (that.data.recommend == '1') {
              that.setData({
                paytype: 'recommend',
                selectCardId: res.data.data.recommendCards[0].prepayRuleId,
                selectCardPay: Number(res.data.data.recommendCards[0].pay).toFixed(2),
                givingMoney: res.data.data.recommendCards[0].givingMoney,
                discount: res.data.data.recommendCards[0].discount
              });
            } else {
              if (that.data.seledAccount) {//如果选择余额支付
                //组合支付情况
                that.setData({
                  paytype: 'account'
                })
              } else {
                that.setData({
                  paytype: 'thirdpay'
                })
              }
              that.setData({
                selectCardId: res.data.data.recommendCards[0].prepayRuleId,
                selectCardPay: Number(res.data.data.recommendCards[0].pay).toFixed(2),
                givingMoney: res.data.data.recommendCards[0].givingMoney,
                discount: res.data.data.recommendCards[0].discount
              })
            }
          } else {
            if (that.seledAccount) {//如果选择余额支付
              //组合支付情况
              that.setData({
                paytype: 'account'
              })
            } else {
              that.setData({
                paytype: 'thirdpay'
              })
            }
          }
          console.log('paytype: ' + that.data.paytype);
          console.log('accountFlag: ' + that.data.accountFlag);
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.errorCode,
          });
        }
      }
    });

  },

  changeSelectCard(event) {
    console.log(event.currentTarget.dataset.item);
    console.log(event.currentTarget.dataset.index);
    let item = event.currentTarget.dataset.item;
    let index = event.currentTarget.dataset.index;
    this.setData({
      paytype: 'recommend',
      selectCardId: item.prepayRuleId,
      selectCardPay: Number(item.pay).toFixed(2),
      givingMoney: item.givingMoney,
      discount: item.discount
    });
    // this.swiper.slideTo(index);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})