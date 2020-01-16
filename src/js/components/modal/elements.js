import _ from 'lodash';
import Base from '@lib/js/ui/view/WrapView';

let Button = Base.extend({
    tabName: 'button',
    template: '<%= data.text %>',
    classNames: ['btn', 'btn-sm', 'btn-default'],
    init: function (options) {
        this.options = options;
        let config = this.options.config || {};
        this.model = {
            text: config.text
        };
        this.type = config.type || 'button';
        this.classNames = _.concat(this.classNames, config.classNames || []);
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function () {
        this.attr('type', this.type);
        let options = this.options;
        this.$el.on('click', function () {
            options.cb && options.cb(options.modal);
        }.bind(this));
    }
});

export default {
    Button: Button
};