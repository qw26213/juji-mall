import { errDialog, loading, delBlank } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '发表评价'},
        pinglist1: ['', '', '', '', ''],
        pinglist2:[],
        orderId: '',
        constant:constant,
        content: '',
        productInfo:{},
        imglist: [],
        pics: [],
        lastPage:"",
        productId:'',
        isDisbaled: false,
        score:5,
    },
    clickPing1:function(e){
        var index = e.currentTarget.dataset['index'];
        var pingLen = index+1;
        this.setData({pinglist1:this.initArr(pingLen),pinglist2:this.initArr(5-pingLen)});
        this.setData({score:pingLen});
    },
    clickPing2:function(e){
        var index = e.currentTarget.dataset['index'];
        var pingLen = index+1+this.data.pinglist1.length;
        this.setData({pinglist1:this.initArr(pingLen),pinglist2:this.initArr(5-pingLen)});
        this.setData({score:pingLen});
    },
    initArr:function(len){
        var newArr = [];
        for(var i=0;i<len;i++){
            newArr.push('');
        }
        return newArr;
    },
    openActionSheet: function(e) {
        if (this.data.imglist.length >= 3) {
            this.showToast('最多只能上传三张图片');
            return;
        }
        wx.showActionSheet({
            itemList: ["从相册中选择", "拍照"],
            itemColor: "#333",
            success: (res) => {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        this.chooseWxImage("album");
                    } else if (res.tapIndex == 1) {
                        this.chooseWxImage("camera");
                    }
                }
            }
        });
    },
    dataChange: function(e) {
        this.data.content = e.detail.value;
    },
    getProductInfo: function() {
        service.getItemInfo({
          productId: this.data.productId
        }).subscribe({
          next: res => {
            console.log(res);
            this.setData({
              productInfo: res.product
            });
          },
          error: err => console.log(err),
          complete: () => wx.hideToast()
        })
    },
    submit: function() {
        if (delBlank(this.data.content) == "") {
            this.showToast("你还没填写任何评论呢~");return;
        }
        this.setData({ "isDisbaled": true });
        service.commentOrder({
            content: this.data.content,
            imgIds: this.data.pics.join(','),
            productId:this.data.productId,
            orderId: this.data.orderId,
            score:this.data.score
        }).subscribe({
            next: res => {
                this.showToast("评论成功！");
                setTimeout(() => {
                    console.log(this.data.lastPage);
                    if(this.data.lastPage=="trade"){
                        wx.navigateBack({ delta: 1 });
                    }else{
                        wx.navigateBack({ delta: 2 });
                    }
                }, 1800)
            },
            error: err => {
                this.setData({ "isDisbaled": false });
                this.showToast(err);
            },
            complete: () => wx.hideToast()
        })
    },
    chooseWxImage: function(type) {
        var number = 3 - this.data.imglist.length;//最多上传三张图片
        wx.chooseImage({
            count: number,
            sizeType: ["original", "compressed"],
            sourceType: [type],
            success: (res) => {
                var len1 = this.data.imglist.length;
                var len2 = res.tempFilePaths.length;
                for(var i in res.tempFilePaths){
                    this.upLoadImg(res.tempFilePaths[i],len1,len2);
                }
            }
        })
    },
    upLoadImg: function(url,len1,len2) {
        wx.showLoading({ title: '正在上传',mask:true});
        wx.uploadFile({
            url: constant.uploadUrl + '/upload/image.json',
            filePath: url,
            name: 'multipartFile',
            header: {
                'Content-Type': 'multipart/form-data',
                'Access-Token': wx.getStorageSync('token')
            },
            formData: {},
            success: (res) => {
                var resData = JSON.parse(res.data);
                if (resData.errorCode == '0') {
                    var thisImglist = this.data.imglist;
                    thisImglist.push(url);
                    var pics = this.data.pics;
                    pics.push(resData.data);
                    this.setData({ pics: pics, imglist: thisImglist });
                    if(this.data.imglist.length==len1+len2){
                        wx.hideLoading();
                    }
                } else {
                    this.showToast("上传图片失败")
                }
            },
            fail: (res) => {
                this.showToast("上传图片失败")
            },
            complete: () => {
                console.log("上传图片ok")
            }
        })
    },
    preReadImg: function(e) {
        var src = e.currentTarget.dataset.src; //获取data-src
        wx.previewImage({
            current: src,
            urls: [src]
        })
    },
    delThisImg: function(e) {
        var thisIndex = e.currentTarget.dataset['index'];
        var thisImglist = this.data.imglist;
        thisImglist.splice(thisIndex, 1);
        var pics = this.data.pics;
        pics.splice(thisIndex, 1);
        this.setData({ imglist: thisImglist, pics: pics });
    },
    onLoad: function(options) {
        new app.ToastPannel();
        wx.hideShareMenu();
        this.setData({productId:options.pid });
        this.setData({ orderId: options.id});
        console.log(this.data.orderId);
        this.getProductInfo();
        if(options.page=='trade'){
            this.setData({lastPage:'trade'})
        }
    }
})