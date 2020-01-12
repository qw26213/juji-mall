// components/confirmBox/confirmBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowConfirmModal:{
      type: Boolean,
      value: true
    },
    confirmBoxTitle:{
      type:String,
      value:''
    },
    confirmBoxContent: {
      type: String,
      value: ''
    },
    showCloseWinBtn:{
      type: Boolean,
      value: true
    },
    btnTitle:{
      type: String,
      value: '确定'
    },
    modalTapClose:{
      type: Boolean,
      value: true
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeConfirmModal:function(){
      this.setData({
        isShowConfirmModal: true
      });
    },
    closeByTapModal:function(){
      if (this.data.modalTapClose){
        this.setData({
          isShowConfirmModal: true
        });
      }
    },
    tapWin:function(){
      console.log('点击了窗口边缘');
    },
    doConfirmBtn:function(){
      console.log('点击了确认按钮');
      this.triggerEvent('clickConfirmBtn');
    }
  }
})
