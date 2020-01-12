import { errDialog, loading } from '../../utils/util';
import { constant } from '../../utils/constant';
import { service } from '../../service';
Component({
    properties: {
        isShow: {
            type: Boolean,
            value: true
        }
    },
    data: {
        // isShow: false
    },
    methods: {
        closeModal: function() {
            this.setData({ isShow: true });
        },
        getPhoneNumber: function(e) {
            if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
                this.setData({ isShow: true });
                console.log('未授权');
            } else {
                this.setData({ isShow: true });
                console.log(e);
                console.log('同意授权');
                this.triggerEvent("action");
            }
        }
    }
})