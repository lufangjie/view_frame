import _ from 'lodash';
import Base from '@lib/js/ui/view/WrapView';
import Scalar from '@js/scalar/Scalar';
import Elements from '@js/components/modal/elements';
import ModalTemplate from '@template/modal/modal.htm';

export default Base.extend({
    template: ModalTemplate,
    classNames: ['modal', 'fade', 'in'],
    init: function(options) {
        this.id = options.id;
        this.options = options || {};
        this.model = {
            id: this.id,
            title: this.options.title
        };
        this.data = [];
        this.classNames = _.concat(this.classNames, options.classNames || []);
        this._resize(options.size.toLowerCase());
        this.options.dataSet && !_.isEmpty(this.options.dataSet) && this.data.push(this.options.dataSet);
        Base.prototype.init.call(this, options);
        return this;
    },

    _resize: function(size) {
        switch (size) {
            case 'large':
                this.model.size = 'modal-lg';
                this.classNames.push('bs-example-modal-lg');
                break;
            case 'small':
                this.model.size = 'modal-sm';
                this.classNames.push('bs-example-modal-sm');
                break;
            case 'huge':
                this.model.size = 'modal-hg';
                break;
            case 'full':
                this.model.size = 'modal-fl';
                break;
            default:
                break;
        }
    },

    didRender: function() {
        let _this = this;
        this.attr('role', 'dialog');
        this.$el.on('hidden.bs.modal', function() {
            _this.destroy();
        });
        if (this.options.apis.length > 0) {
            Promise.all(_.map(this.options.apis, function(apiConfig) {
                return Scalar.getRequest(apiConfig.endPoint, apiConfig.remoteMethod)(...apiConfig.params).execute();
            })).then(function(valueList) {
                _this.data = _.concat(_this.data, valueList);
                _this.show();
            });
        } else {
            _this.show();
        }
    },

    _renderBody: function() {
        if (!this.options.bodyView) {
            return;
        }
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.modal-body');
        let options = this.options.bodyOptions || {};
        options.data = this.data;
        this.body = this.options.bodyView.new(options);
        this.addView(this.body);
        this.$context = $context;
        this.context = context;
    },

    _renderFoot: function() {
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.modal-footer');
        let _this = this;
        _.each(this.options.footers, function(footer) {
            let button = Elements.Button.new({
                config: footer.config,
                cb: footer.cb,
                modal: _this
            });
            this.addView(button);
        }.bind(this));
        this.$context = $context;
        this.context = context;
    },

    willDestroy: function() {
        this.$el.remove();
        window.Application.window.trigger('close_modal');
    },

    getBody: function() {
        return this.body;
    },

    getBodyData: function() {
        let customizeData = this.body.getFormData && this.body.getFormData() || {};
        let formData = {};
        let elements = this.body.$('input[type="text"],input[type="password"],input[type="hidden"],input[type="radio"]:checked,select,textarea');
        let checkBoxes = this.body.$('input[type="checkbox"]');
        _.each(elements, function(ele) {
            let key = ele.id || ele.name;
            key && (formData[key] = ele.value);
        });
        _.each(checkBoxes, function(ele) {
            let key = ele.id || ele.name;
            let value;
            if ($(ele).prop('checked')) {
                value = 1;
            } else {
                value = 0;
            }
            key && (formData[key] = value);
        });
        return _.extend({}, formData, customizeData);
    },

    show: function() {
        this._renderBody();
        this._renderFoot();
        this.$el.modal({ backdrop: 'static', keyboard: false });
        window.Application.window.trigger('show_modal');
    },

    close: function() {
        this.$el.modal('hide');
    }
}, { klass: 'ModalView' });