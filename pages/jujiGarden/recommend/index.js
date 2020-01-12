import { jugardenService } from '../shared/service';
import { service } from '../../../service.js';
import { constant } from '../../../utils/constant';
import { errDialog, loading } from '../../../utils/util';
var app = getApp();
Page({
    data: {
        nvabarData: {showCapsule: 1,title: '商品推荐'},
        recommendlist: [],
        constant: constant,
        isShowNodata: false,
        curTabIndex: 1,
        productInfo: {}, //当前商品的信息
        shareBg: '../../../images/shareBg.png',
        erwmImg: '',
        headImg: '',
        isShowModal: true,
        isTransparnet: false,
        sceneId: '',
        scenepicid: '',
        userImg: '',
        userImgUrl: '',
        ifBottom: false,
        pageNo: 1,
        productId: '' //当前商品的id
    },
    onLoad: function(options) {
        new app.ToastPannel();
        wx.hideShareMenu();
        if (options.productid) {
            this.setData({ productId: options.productid });
        }
        this.getData(this.data.productId);
        this.getUserImg();
    },
    getData: function(productId) {
        jugardenService.shareList({
            providerId: wx.getStorageSync('providerId'),
            productId: productId, //如果从首页进入productId不为空
            pageNo: this.data.pageNo,
            pageSize: 10
        }).subscribe({
            next: res => {
                this.setData({ recommendlist: this.data.recommendlist.concat(res) });
                this.setData({
                    ifBottom: res.length < 10 ? true : false,
                    isShowNodata: this.data.recommendlist.length == 0
                })
            },
            error: err => errDialog(err),
            complete: () => wx.hideToast()
        })
    },
    onReachBottom: function() {
        if (this.data.ifBottom) { //已经到底部了
            return;
        } else {
            this.setData({ pageNo: this.data.pageNo + 1 });
            this.getData(this.data.productId);
        }
    },
    getUserImg: function() {
        service.userInfo({ openId: wx.getStorageSync('openid') }).subscribe({
            next: res => {
                this.setData({ userImgUrl: res.avatar });
            },
            complete: () => wx.hideToast()
        })
    },
    switchTab: function(e) {
        this.setData({ curTabIndex: e.currentTarget.dataset.index });
    },
    previewImage: function(event) {
        var src = event.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [src]
        })
    },
    onShareAppMessage: function(res) {
        if (res.from === 'button') {
            this.closeModal();
            return {
                title: JSON.parse(wx.getStorageSync('userinfo')).nickName + '分享给您一个心动商品，快来一起体验吧！',
                path: '/pages/login/index?pagetype=4&inner=1&pid=' + this.data.productId + '&storeid=&sceneid=' + this.data.sceneId + '&invitecode=' + wx.getStorageSync('inviteCode'),
                imageUrl: constant.basePicUrl + this.data.productInfo.picId + '/resize_360_360/mode_filt/format_jpg/quality_0'
            }
        }
    },
    //保存素材
    saveMaterial: function(e) {
        this.produceImg(e, 1)
    },
    //生成图文
    produceImg: function(e, type) {
        if (type == 1) {
            wx.showToast({ title: '正在保存图片', icon: 'loading', duration: 30000 });
        } else {
            wx.showToast({ title: '生成分享图片', icon: 'loading', duration: 30000 });
        }
        var productId = e.currentTarget.dataset.productid;
        this.setData({ productId: productId });
        var imageId = e.currentTarget.dataset.img;
        var sceneId = e.currentTarget.dataset.sceneid;
        var scenepicid = e.currentTarget.dataset.scenepicid;
        this.setData({ scenepicid: scenepicid });
        this.setData({ sceneId: sceneId });
        service.getItemInfo({
            productId: productId,
            storeId: ''
        }).subscribe({
            next: res => {
                this.setData({ productInfo: res.product });

                var ready = 0;

                //下载商品图片
                wx.downloadFile({
                    url: constant.basePicUrl + imageId + '/resize_750_420/mode_filt/format_jpg/quality_0',
                    success: (res) => {
                        if (res.statusCode === 200) {
                            ready++;
                            this.setData({ headImg: res.tempFilePath });
                            this.startDrawImg(ready, e, type);
                        } else {
                            wx.hideToast();
                        }
                    },
                    fail: (err) => {
                        wx.hideToast();
                        console.log('商品图片下载失败');
                    }
                });

                //下载用户头像
                wx.downloadFile({
                    url: this.data.userImgUrl,
                    success: (obj) => {
                        if (obj.statusCode === 200) {
                            ready++;
                            this.setData({ userImg: obj.tempFilePath });
                            this.startDrawImg(ready, e, type);
                        } else {
                            wx.hideToast();
                        }
                    },
                    fail: (err) => {
                        wx.hideToast();
                        console.log('头像下载失败');
                    }
                });

                //获取和下载小程序码
                if (scenepicid) {
                    this.setData({ sceneId: sceneId });

                    wx.downloadFile({
                        url: constant.basePicUrl + scenepicid + '/resize_200_200/mode_filt/format_jpg/quality_0',
                        success: (obj) => {
                            if (obj.statusCode === 200) {
                                ready++;
                                this.setData({ erwmImg: obj.tempFilePath });
                                this.startDrawImg(ready, e, type);
                            } else {
                                wx.hideToast();
                            }
                        }
                    });

                } else {
                    jugardenService.getQrCode({ productId: this.data.productId, path: 'pages/login/index' }).subscribe({
                        next: res => {
                            var sceneId = res.senceId;
                            var scenePicId = res.picId;
                            this.setData({ sceneId: sceneId });
                            console.log('scene222=' + this.data.sceneId);
                            console.log('scenePicId=' + scenePicId);
                            console.log(constant.basePicUrl + scenePicId + '/resize_200_200/mode_filt/format_jpg/quality_0');

                            wx.downloadFile({
                                url: constant.basePicUrl + scenePicId + '/resize_200_200/mode_filt/format_jpg/quality_0',
                                success: (obj) => {
                                    if (obj.statusCode === 200) {
                                        ready++;
                                        this.setData({ erwmImg: obj.tempFilePath });
                                        this.startDrawImg(ready, e, type);
                                    } else {
                                        wx.hideToast();
                                    }
                                }
                            });
                        },
                        error: err => {
                            errDialog(err);
                            wx.hideToast();
                        },
                        complete: () => wx.hideToast()
                    });
                }
            },
            error: err => {
                wx.hideToast();
                errDialog('获取商品信息失败');
            },
            complete: () => {}
        })
    },
    closeModal: function() {
        this.setData({ isShowModal: true, isTransparnet: false });
    },
    startDrawImg: function(ready, e, type) {
        console.log('ready====' + ready);
        if (ready == 3) {
            var info = this.data.productInfo;
            var point = info.point == null || info.point == 0 ? '' : info.point + '桔子';
            var price = info.price == null || info.price == 0 ? '' : Number(info.price / 100).toFixed(2) + '元';
            var link = (info.price != null && info.price != 0) && (info.point != null && info.point != 0) ? '+' : '';
            var price1 = point + link + price;
            var name = info.productName;
            var price2 = Number(info.originalPrice / 100).toFixed(2) + '元';
            var storeLen = info.productStores.length;
            this.drawImage(info.merchantName, name, '', price1, price2, storeLen, e, type);
        }
    },
    //参数依次是storeName,desc,现价,原价,门店数
    drawImage: function(merchant, name, desc, price1, price2, storeLen, e, type) {
        var size = { w: 260, h: 424 };
        var context = wx.createCanvasContext('myCanvas');
        context.drawImage(this.data.shareBg, 0, 0, size.w, size.h);
        context.drawImage("../../../images/logo.png", 20, 18, 20, 21);
        setText(context, "“桔”美好生活，集好店优惠", 52, 35, "#000", 15, 'left');
        context.drawImage(this.data.headImg, 10, 52, size.w - 20, 138);
        rectPath(context, 10, 190, size.w - 20, 134);
        setText(context, merchant, 20, 210, "#999", 10, 'left'); //商户名
        drawText(context, name, 20, 230, 50, 216); //商品名字
        setText(context, "适用" + storeLen + "家门店", size.w - 20, 210, "#999", 10, 'right'); //适用门店

        context.drawImage("../../../images/price.png", 20, 263, 30, 13);
        setText(context, price1, 55, 275, '#E83221', 14, 'left'); //价格
        setText(context, "原价:" + price2, size.w - 20, 275, '#999', 10, 'right'); //原价

        context.drawImage("../../../images/gou.png", 20, 293, 10, 10);
        setText(context, "可退款", 35, 302, '#999', 9, 'left');
        context.drawImage("../../../images/gou.png", 80, 293, 10, 10);
        setText(context, "可转赠", 95, 302, '#999', 9, 'left');

        rectPath(context, 0, 334, size.w, 88);
        context.drawImage('../../../images/erbg.png', 70, 387, 103, 18);
        setText(context, "长按识别小程序码", 77, 400, '#333', 11, 'left');

        context.save();
        context.beginPath();
        context.arc(35, 375, 25, 0, Math.PI * 2, false);
        context.clip();
        context.drawImage(this.data.userImg, 10, 350, 50, 50);
        context.restore();

        context.drawImage(this.data.erwmImg, size.w - 80, 342.5, 70, 70);
        var name = JSON.parse(wx.getStorageSync('userinfo')).nickName;
        var nickName = name.length > 8 ? name.substring(0, 8) + '...' : name;
        setText(context, nickName, 70, 360, "#333", 12, 'left');
        setText(context, nickName, 70, 360, "#333", 12, 'left');
        setText(context, "私藏好物，分享给你", 70, 379, '#666', 11, 'left');
        if (type == 1) {
            this.setData({ isTransparnet: true });
        } else {
            this.setData({ isShowModal: false });
        }
        context.draw(false, () => {
            console.log("绘图结束");
            if (type == 1) {
                setTimeout(() => {
                    this.savePic(e, type);
                }, 100)
            } else {
                wx.hideToast();
            }
        });
    },
    savePic: function(e, type) {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: function(res) {
                wx.getSetting({
                    success(rep) {
                        if (!rep.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success() {
                                    console.log(res.tempFilePath);
                                    that.saveAsPhoto(res.tempFilePath, e, type);
                                }
                            })
                        } else {
                            console.log(res.tempFilePath);
                            that.saveAsPhoto(res.tempFilePath, e, type);
                        }
                    },
                    fail() {
                        console.log("getSetting: fail");
                    }
                })
            },
            fail: function(res) {
                console.log(res);
            }
        });
        if (type == 1) {
            var desc = e.currentTarget.dataset.desc;
            wx.setClipboardData({
                data: desc,
                success: (res) => {

                }
            });
        }
    },
    saveAsPhoto: function(imgUrl, e, type) {
        wx.saveImageToPhotosAlbum({
            filePath: imgUrl,
            success: (res) => {
                this.closeModal();
                if (type != 1) {
                    wx.showToast({ title: "已保存至相册", icon: "success" });
                }
            },
            fail: function(res) {
                console.log(res);
            }
        });
        if (type == 1) {
            this.saveImages(e);
        }
    },
    /**保存图片**/
    saveImages: function(e) {
        var imageIds = e.currentTarget.dataset.imgs;
        var desc = e.currentTarget.dataset.desc;
        this.saveFile(imageIds, desc);
    },
    saveFile: function(imageIds, desc) {
        var imgIndex = 0;
        for (var i = 0; i < imageIds.length; i++) {
            var imgId = imageIds[i];
            wx.downloadFile({
                url: constant.basePicUrl + imageIds[i] + '/resize_0_0/mode_filt/format_jpg/quality_0',
                success: (res) => {
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res) => {
                            imgIndex++;
                            if (imgIndex == imageIds.length) {
                                this.showToast("图片已下载到微信相册，文案已复制到剪贴板")
                            }
                        },
                        fail: (res) => {
                            wx.hideToast();
                            console.log(res);
                        }
                    });
                }
            });
        }
    },
})

function setText(ctx, str, x, y, color, size, align) {
    ctx.setFontSize(size);
    ctx.setTextAlign(align);
    ctx.setFillStyle(color);
    ctx.fillText(str, x, y);
    ctx.stroke();
}

function rectPath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.setFillStyle('#ffffff');
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('#ffffff');
    ctx.fill();
    ctx.closePath();
}

function drawBar(ctx, x1, x2, y) {
    ctx.beginPath();
    ctx.setLineCap('round');
    ctx.setStrokeStyle('#FFDC00');
    ctx.setLineWidth(18);
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
}

//1、canvas对象，2、文本 3、距离左侧的距离 4、距离顶部的距离 5、6、文本的宽度
function drawText(ctx, str, left, top, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333');
    if (str.length > 36) {
        var str = str.substring(0, 36) + '...';
    }
    for (let i = 0; i < str.length; i++) {
        lineWidth += ctx.measureText(str[i]).width;
        if (lineWidth > canvasWidth) {
            ctx.fillText(str.substring(lastSubStrIndex, i), left, top); //绘制截取部分
            top += 16; //16为字体的高度
            lineWidth = 0;
            lastSubStrIndex = i;
            titleHeight += 30;
        }
        if (i == str.length - 1) { //绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex, i + 1), left, top);
        }
    }
    ctx.stroke();
    titleHeight = titleHeight + 10;
    return titleHeight
}