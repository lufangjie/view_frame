import _ from 'lodash';
import Events from '@lib/js/event/Events';
import Base from '@lib/js/ui/view/WrapView';
import Const from '@js/components/modal/const';

let Alert = Base.extend({
    DESTROY: 'destroy',
    template: '<button type="button" class="close">&times;</button><%= data.message %>',
    className: 'alert',
    classNames: [],
    init: function(options) {
        let type = options.type || Const.ALERT_TYPE.INFO;
        this.classNames.push('alert-' + type);
        this.model = {
            message: options.message || ''
        };
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        this.$('button.close').on('click', function() {
            this.destroy();
        }.bind(this));
        // 5s后自动关闭
        this.timer = setTimeout(function(){
            this.destroy();
        }.bind(this), 5000)
    },

    willDestroy: function() {
        this.timer && clearTimeout(this.timer);
        this.timer && (this.timer = null);
        this.trigger(this.DESTROY, this);
    }
});

export default _.extend({
    // 最多显示的alert个数
    MAX_ALERT_SIZE: 5,
    // 第一个alert距离顶部的距离
    TOP: 110,
    // 每个alert之间的建个
    INTERVAL: 100,
    // 保存当前显示的alert的数组
    list: [],

    // init: function() {
    //
    // },

    show: function(options) {
        let alert = Alert.new(options || {});
        // 如果当前已经显示了最大个数的alert，则移除第一个
        if (this.list.length === this.MAX_ALERT_SIZE) {
            let first = this.list[0];
            first.destroy();
        }
        alert.css('top', this._calculateTop(this.list.length));
        this.list.push(alert);
        window.Application.window.addView(alert);
        this.listenTo(alert, alert.DESTROY, this.remove);
    },

    remove: function(alert) {
        this.stopListening(alert);
        _.remove(this.list, function(view) {
            return view === alert;
        });
        _.each(this.list, function(view, index) {
            view.css('top', this._calculateTop(index));
        }.bind(this));
    },

    _calculateTop: function(index){
        return index * this.INTERVAL + this.TOP;
    }

}, Events);