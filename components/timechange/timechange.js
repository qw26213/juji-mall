var timer = null;
Component({
    properties: {
        dataFromParent: {
            type: String,
            value: "2000-01-01 00:00:00",
            observer: function(newVal, oldVal, changedPath) {

            }
        },
        curTime:{
            type: String,
            value: new Date().getTime(),
            observer: function(newVal, oldVal, changedPath) {

            }
        },
        customeClass: {
            type: String,
            value: "",
            observer: function(newVal, oldVal, changedPath) {

            }
        },
        radius: {
            type: String,
            value: "1",
            observer: function(newVal, oldVal, changedPath) {

            }
        }
    },
    data: {
        restHour: '00',
        restMinute: '00',
        restSecond: '00',
    },
    ready: function() {
        var expireTime = this.data.dataFromParent;
        let expireDate = expireTime.replace(/-/g, '/');
        this.timeChange(expireDate);
    },
    detached: function() {
      console.log("----------------------------------------组件回收----------------------------------------")
      clearInterval(timer);
    },
    methods: {
        timeChange: function(expireTime) {
            if (expireTime) {
                console.log(expireTime);
                var restTime = Number(new Date(expireTime).getTime()) - Number(this.data.curTime);
                this.formatTime(restTime);
                timer = setInterval(() => {
                    restTime = restTime - 1000;
                    this.formatTime(restTime);
                }, 1000);
            }
        },
        formatTime: function(time) {
            if (time < 1000 && time >= 0) {
                var hours = '00';
                var minutes = '00';
                var seconds = '00';
                // 首页倒计时
                if (this.data.customeClass == 'block') {
                    this.triggerEvent('action');
                } else {
                    clearInterval(timer);
                    this.triggerEvent('action');
                }
            } else if (time > 1000) {
                var hours = formatNum(parseInt(time / 1000 / 60 / 60));
                var minutes = formatNum(parseInt(time / 1000 / 60 - hours * 60));
                var seconds = formatNum(parseInt(time / 1000 - minutes * 60 - hours * 3600));
            } else {
                var hours = '00';
                var minutes = '00';
                var seconds = '00';
            }
            this.setData({
                restHour: hours,
                restMinute: minutes,
                restSecond: seconds
            });
        }
    }
})

function formatNum(number) {
    return number < 10 ? '0' + number : number;
}