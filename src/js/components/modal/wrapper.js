import Builder from '@js/components/modal/builder';
import BootBox from 'bootbox';
import Alert from '@js/components/modal/alert';
import Const from '@js/components/modal/const';

export default {
    builder: function() {
        return new Builder();
    },
    confirming: false,
    /**
     * 确认框
     * @param options
     *  {
     *    title： String 确认框的标题
     *    message：String 确认框显示的信息
     *    size：String 确认框的大小，默认small
     *    confirm：function(result) 确认框的按钮事件，result: true：表示确认 false：表示取消
     *  }
     */
    confirm: function(options) {
        if (this.confirming) {
            return;
        }
        this.confirming = true;
        let _this = this;
        BootBox.confirm({
            title: options.title,
            message: options.message,
            size: options.size || 'small',
            buttons: {
                cancel: {
                    label: '取消',
                    className: 'btn-default'
                },
                confirm: {
                    label: '确定',
                    className: 'btn-danger'
                }
            },
            callback: function(result) {
                if (result) {
                    options.confirm && options.confirm();
                } else {
                    options.cancel && options.cancel();
                }
                _this.confirming = false;
            }
        });
    },

    /**
     * 提示框
     * @param options
     *  {
     *      message:    String,显示的信息
     *      type:       String,提示框类型，默认为Info类型
     *  }
     */
    alert: function(options) {
        if (_.isString(options)) {
            Alert.show({
                message: options,
                type: this.ALERT_TYPE.INFO
            });
        } else {
            Alert.show(options);
        }
    },

    // 模态框的大小
    SIZE: Const.SIZE,
    // 提示框的类型
    ALERT_TYPE: Const.ALERT_TYPE
};