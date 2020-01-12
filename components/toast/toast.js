let _compData = {
  '_toast_.isShow':false,
  '_toast_.txtTips':''
}

let toastPannel = {
  showToast: function(data) {
    let self = this;
    this.setData({ '_toast_.isShow': true, '_toast_.txtTips': data});
    setTimeout(() => {
      self.setData({ '_toast_.isShow': false})
    },1500)
  }
}

function ToastPannel() {
  let pages = getCurrentPages();
  let curPage = pages[pages.length - 1];
  this.__page = curPage;
  Object.assign(curPage, toastPannel);
  curPage.toastPannel = this;
  curPage.setData(_compData);
  return this;
}

module.exports = {
  ToastPannel
}