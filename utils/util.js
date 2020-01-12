var barcode = require('./barcode');
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/*获取当前页url*/
const getCurrentPageUrl = () => {
    var pages = getCurrentPages() //获取加载的页面
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = currentPage.route //当前页面url
    return url
}

/*获取当前页带参数的url*/
const getCurrentPageUrlWithArgs = () => {
    var pages = getCurrentPages() //获取加载的页面
    var currentPage = pages[pages.length - 1] //获取当前页面的对象
    var url = currentPage.route //当前页面url
    var options = currentPage.options //如果要获取url中所带的参数可以查看options

    //拼接url的参数
    var urlWithArgs = url + '?'
    for (var key in options) {
        var value = options[key]
        urlWithArgs += key + '=' + value + '&'
    }
    urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

    return urlWithArgs
}

//设置标题
function setTitle() {
    wx.getStorage({
        key: constant.STORE_INFO,
        success: (res) => {
            wx.setNavigationBarTitle({
                title: JSON.parse(res.data).storeName
            });
        }
    });
}

function loading() {
    wx.showToast({
        title: '加载中',
        icon: 'loading',
        mask: true
    });
}

function errDialog(content) {
    wx.hideToast();
    wx.showModal({
        title: '温馨提示',
        content: `${content}`,
        showCancel: false,
        success: function(res) {}
    });
}

// 弹框提示
function showAlert(content) {
  wx.showModal({
    title: '温馨提示',
    content: `${content}`,
    showCancel: false,
    confirmText: '确定',
    confirmColor: '#333'
  });
}

function checkMobile(sMobile) {
    if (!(/^1[3|4|5|8|7][0-9]\d{8}$/.test(sMobile))) {
        return false;
    } else {
        return true;
    }
}
/**获取路径参数**/
function getUrlParma(url, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = url.substr(url.indexOf("\?") + 1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

// 根据时间戳格式化日期
function formatDate(stortime) {
    var time = new Date(stortime);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    return y+'-'+(m<9?'0'+m:m)+'-'+(d<9?'0'+d:d);
}


function delBlank(value) {
    return String(value).replace(/(^\s*)|(\s*$)/g, "");
}

function convert_length(length) {    return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);}
function barc(id, code, width, height) {    barcode.code128(wx.createCanvasContext(id), code, convert_length(width), convert_length(height))}


module.exports = {
    getCurrentPageUrl: getCurrentPageUrl,
    getCurrentPageUrlWithArgs: getCurrentPageUrlWithArgs,
    formatTime: formatTime,
    loading:loading,
    errDialog:errDialog,
    getUrlParma:getUrlParma,
    checkMobile:checkMobile,
    barcode: barc,
    delBlank:delBlank,
    showAlert: showAlert,
    formatDate:formatDate
}