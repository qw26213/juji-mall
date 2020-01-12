Component({
    properties: {
        resData: {
            type: Object,
            value: {}
        },
        productId: {
            type: String,
            value: ''
        },
        activityId: {
            type: String,
            value: ''
        },
        note: {
            type: Array,
            value: ''
        }
    },
    data: {
        despImgHeightValues: [],
        description: {},
        store: {}
    },
    ready: function() {
        var resData = this.data.resData;
        this.setData({
            description: JSON.parse(resData.product.product.description),
            store: resData.product.store
        })
    },
    methods: {
        previewImage: function(e) {
            var arr = [];
            var url = constant.basePicUrl + e.currentTarget.dataset.url + '/resize_0_0/mode_fill';
            arr.push(url);
            wx.previewImage({
                urls: arr // 需要预览的图片http链接列表
            })
        },
        toMap: function(e) {
            wx.openLocation({
                latitude: this.data.store.lat,
                longitude: this.data.store.lng,
                name: this.data.store.name,
                address: this.data.store.address,
                scale: 15
            });
        },
        callPhone: function() {
            wx.makePhoneCall({
                phoneNumber: '4000011139',
            });
        },
        toMerchantsList: function() {
            wx.navigateTo({
                url: '/pages/merchantsCanUse/index?id=' + this.data.productId
            });
        },
        toComDetail: function(e) {
            var id = e.currentTarget.dataset.id;
            var storeid = e.currentTarget.dataset.storeid;
            wx.navigateTo({
                url: '/pages/comDetail/index?id=' + id + '&storeid=' + storeid
            });
        },
        call: function() {
            wx.makePhoneCall({
                phoneNumber: this.data.store.phone
            })
        },
        desImgLoad: function(event) {
            var arr = this.data.despImgHeightValues;
            arr.push(event.detail.height * 690 / event.detail.width);
            this.setData({
                despImgHeightValues: arr
            });
        },
        toCommentList: function() {
            wx.navigateTo({
                url: '/pages/commentList/index?id=' + this.data.productId
            });
        }
    }
})

function getObjById(arr, id) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].skuId == id) {
            return arr[i];
        }
    }
}