import { errDialog, loading, showAlert } from '../../../utils/util'
import { service } from '../../../service';
import { constant } from '../../../utils/constant';
import { jugardenService } from '../shared/service.js'
var app = getApp();
var timeVal;

Page({
    data: {
        nvabarData: {showCapsule: 0,title: '桔 园',isIndex:1},
        topValue:0,
        juminNumList: [], //队员人数
        hadNumber: 0,
        storeId: '',
        openId: '', //邀请者id
        role: '', //桔园角色
        isAuthed: false, //是否实名认证
        todaySaleRebate: 0, //今日销售收入
        todaySettlementAmount: 0, //今日提现 
        totalSettlementAmount: 0, //累计提现
        invitedLeaderCount: 0,
        invitedMemberCount: 0,
        wechatId: '', //微信号码
        name: '', //姓名
        phone: '',
        applyLeader: false, //是否申请桔长
        switchFun: false,
        minInvitedMemberCount: 0, //邀请几个人就可以成为桔长
        bindPhoneNumber: false, //是否绑定手机号码 是true 不是false
        isDisabled:false,//按钮是否禁用
        conHeight:400
    },
    onLoad: function(options) {
        wx.getSystemInfo({
          success: (res) => {
            var conHeight = res.windowHeight-app.globalData.barHeight-45;
            this.setData({conHeight:conHeight})
          }
        });
        if (options.openid) {
            console.log('分享点进来');
            this.setData({
                openId: options.openid,
                switchFun: true
            });
            this.getUserInfor();
        } else {
            this.getUserInfor(); //用户信息，是否绑定手机号码
        }
    },
    onShow: function() {
        let self = this;
        if (wx.getStorageSync('token')) { //token存在
            getGardenInfor.call(self); //get首页信息,获取分销角色
        } else { //token不存在 登陆
            return;
        }
    },

    /**申请成为桔长  **/
    apply: function(e) {
        let self = this;
        if (this.data.bindPhoneNumber) { //已经绑定手机号码  
            this.setData({
                applyLeader: true,
                parentId: this.data.openId
            });
            wx.setStorageSync('isLeaderAlert',1);
            let data = {
                parentId: this.data.openId,
                applyLeader: this.data.applyLeader
            }
            joinDistributor.call(self, data); //加入桔园
        }
    },

    /**   跳转页面  ***/
    toPage: function(e) {
        let role = e.currentTarget.dataset.role ? e.currentTarget.dataset.role : '';
        let page = role ? e.currentTarget.dataset.page + '?role=' + role : e.currentTarget.dataset.page;
        wx.navigateTo({ url: page });
    },

    /*** 用户分享  ***/
    onShareAppMessage: function() {
        return {
            title: '我在桔集免费吃喝玩乐还能赚钱，邀你组队一起赚钱！',
            path: 'pages/login/index?pagetype=2&openid=' + wx.getStorageSync('openid') + '&invitecode=' + wx.getStorageSync('inviteCode'),
            imageUrl: '/images/banner-invent.png'
        }
    },

    dataChange(e) {
        console.log(e.currentTarget.dataset.type);
        if (e.currentTarget.dataset.type == 'wechatid') {
            this.setData({
                wechatId: e.detail.value, //微信号码
            })
        } else {
            this.setData({
                name: e.detail.value, //姓名
            })
        }
    },

    // 绑定微信号及姓名
    submitUserInfor() {
        console.log('按钮是否禁用='+this.data.isDisabled);
        let data = {
            wechatId: this.data.wechatId,
            name: this.data.name
        }
        let self = this;
        if (this.data.wechatId == '') {
            showAlert('请填写您的微信账号');return;
        }
        if (this.data.name == '') {
            showAlert('请填写您的实名认证姓名');return;
        }
        if(this.data.isDisabled){
            return;
        }
        this.setData({isDisabled:true})
        wx.showToast({ title: '提交中', icon: 'loading', duration: 30000 });
        jugardenService.bindWechatInfor(data).subscribe({
            next: res => {
                if (res) {
                    wx.hideToast();
                    this.setData({
                        role: res.role,
                        switchFun: false,
                        todaySaleRebate: res.todaySaleRebate ? res.todaySaleRebate : 0,
                        todaySettlementAmount: res.todaySettlementAmount ? res.todaySettlementAmount : 0,
                        totalSettlementAmount: res.totalSettlementAmount ? res.totalSettlementAmount : 0,
                        invitedLeaderCount: res.invitedLeaderCount ? res.invitedLeaderCount : 0,
                        invitedMemberCount: res.invitedMemberCount ? res.invitedMemberCount : 0,
                        isAuthed: res.hasReceiver == true ? true : false,
                        applyLeader: res.applyLeader,
                    })
                }
            },
            error: err => {
                this.setData({isDisabled:false});
                wx.hideToast();
                errDialog(err);
            },
            complete: () => {
                wx.hideToast();
                this.setData({isDisabled:false});
            }
        });
    },

    // 获取用户信息 
    getUserInfor: function() {
        let self = this;
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({
                    phone: res.phone,
                    bindPhoneNumber: res.phone ? true : false
                });
                getGardenInfor.call(self); //get用户信息身份
                console.log(this.data.bindPhoneNumber);
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },

    // 授权手机号码
    getUserPhoneNumber: function(e) {
        let self = this;
        let data = { encryptData: e.detail.encryptedData, iv: e.detail.iv }
        service.decodeUserPhone(data).subscribe({
            next: res => {
                this.setData({
                    phone: res.phoneNumber,
                });
                console.log(this.data.phone);
                bindPhone.call(self); //授权以后绑定手机号码
            },
            error: err => console.log(err),
            complete: () => wx.hideToast()
        })
    },
});

// 绑定手机号码
function bindPhone() {
    let self = this;
    let data = { phone: this.data.phone }
    service.bindPhone(data).subscribe({
        next: res => {
            wx.showToast({
                title: "绑定成功",
                icon: "success",
            });
            this.setData({
                bindPhoneNumber: true,
                applyLeader: true,
            })
            console.log('绑定手机号');
            let data = {
                parentId: this.data.openId,
                applyLeader: this.data.applyLeader
            }
            joinDistributor.call(self, data); //加入桔园
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 首页信息获取 
function getGardenInfor() {
    let self = this;
    jugardenService.getGardenHomeInfor().subscribe({
        next: res => {
            if (res) {
                console.log(res);
                console.log('进入查询用户信息拉');
                if (res.role == 'MEMBER') { // 1、邀请进来的是桔民 return 2、邀请进来的是其他的 加入桔园 applyLeader=false;
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                } else if (res.role == 'UNDEFINED' && this.data.switchFun) {
                    self.setData({ applyLeader: false })
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: this.data.applyLeader
                    }
                    joinDistributor.call(self, data);
                } else if ((res.role == 'LEADER' || res.role == 'MEMBER') && this.data.switchFun) { //邀请者是桔长或者桔民
                    let data = {
                        parentId: this.data.openId,
                        applyLeader: res.applyLeader
                    }
                    joinDistributor.call(self, data);
                }
                if (res.role == 'LEADER' && res.hasReceiver) { //动态设置title背景色 是桔长并已经认证
                    wx.setNavigationBarColor({
                        frontColor: '#000000', // 必写项
                        backgroundColor: '#FFDC00', // 必写项
                    })
                }
                this.setData({
                    role: res.role,
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    todaySaleRebate: res.todaySaleRebate ? res.todaySaleRebate : 0,
                    todaySettlementAmount: res.todaySettlementAmount ? res.todaySettlementAmount : 0,
                    totalSettlementAmount: res.totalSettlementAmount ? res.totalSettlementAmount : 0,
                    invitedLeaderCount: res.invitedLeaderCount ? res.invitedLeaderCount : 0,
                    invitedMemberCount: res.invitedMemberCount ? res.invitedMemberCount : 0,
                    isAuthed: res.hasReceiver == true ? true : false,
                    applyLeader: res.applyLeader,
                    minInvitedMemberCount: res.minInvitedMemberCount
                })
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}

// 加入分销 成为桔民
function joinDistributor(data) {
    let self = this;
    jugardenService.joinDistributor(data).subscribe({
        next: res => {
            if (res) {
                if (res.role == 'MEMBER' || res.role == 'UNDEFINED') { //桔民
                    this.data.juminNumList = [];
                    this.data.hadNumber = parseInt(res.invitedLeaderCount) + parseInt(res.invitedMemberCount);
                    if (this.data.hadNumber > 0) {
                        for (let i = 0; i < this.data.hadNumber; i++) {
                            let list = 'yes';
                            this.data.juminNumList.push(list);
                        }
                        for (let j = 0; j < (res.minInvitedMemberCount - parseInt(this.data.hadNumber)); j++) {
                            this.data.juminNumList.push('');
                        }
                    } else {
                        for (let j = 0; j < res.minInvitedMemberCount; j++) {
                            this.data.juminNumList.push('');
                        }
                    }
                }
                this.setData({
                    role: res.role,
                    juminNumList: this.data.juminNumList,
                    hadNumber: this.data.hadNumber,
                    applyLeader: res.applyLeader,
                    isAuthed: res.hasReceiver == true ? true : false,
                    minInvitedMemberCount: res.minInvitedMemberCount
                })
            }
        },
        error: err => console.log(err),
        complete: () => wx.hideToast()
    })
}