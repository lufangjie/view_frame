import _ from 'lodash';
import Base from '@lib/js/ui/view/WrapView';
import Scalar from '@js/scalar/Scalar';

let TYPE = {
    LABEL: 'label',
    TITLE: 'title',
    BUTTON: 'button',
    SUBMIT: 'submit',
    SELECT: 'select',
    INPUT: 'input'
};

let Label = Base.extend({
    tagName: 'label',
    template: '<%= data.text %>',
    className: 'sr-label',
    init: function (options) {
        _.extend(this, _.pick(options, ['id', 'classNames']));
        this.model = {
            text: options.text
        };
        Base.prototype.init.call(this, options);
        return this;
    }
});

let Title = Base.extend({
    template: '<%= data.title %>',
    init: function (options) {
        this.model = {
            title: options.title || ''
        };
        _.extend(this, _.pick(options, ['id', 'className', 'classNames', 'template', 'model']));
        Base.prototype.init.call(this, options);
        return this;
    }
});

let Button = Base.extend({
    tagName: 'button',
    template: '<%= data.text %>',
    className: 'btn btn-sm btn-default',
    init: function (options) {
        this.options = options;
        _.extend(this, {type: 'button'}, _.pick(options, ['id','classNames', 'type', 'wrapper', 'onClick']));
        this.model = {
            text: options.text
        };
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function () {
        this.attr('type', this.type);
        this.$el.on('click', function () {
            this.onClick && this.onClick(this.wrapper);
        }.bind(this));
    }
});

let Select = Base.extend({
    tagName: 'select',
    className: 'form-control input-sm',
    init: function (options) {
        _.extend(this, {id: 'select-' + new Date().getTime()}, _.pick(options, ['id', 'classNames', 'optionsList', 'currentValue', 'formatter', 'onChange', 'wrapper']));
        this.remote = _.extend({enable: false, data: {}}, options.remote);
        Base.prototype.init.call(this, options);
        return this;
    },
    didRender: function () {
        if (this.remote.enable) {
            Scalar[this.remote.endPoint][this.remote.remoteMethod]({
                data: this.remote.data
            }).then(function (response) {
                this.optionsList = response.result.list || [];
                this.createOptions();
            }.bind(this));
        } else {
            this.createOptions();
        }
    },
    createOptions: function () {
        // 自定义的格式化结果函数
        this.formatter && (this.optionsList = this.formatter(this.optionsList));
        let options = '<option value="">=== 请选择 ===</option>';
        _.each(this.optionsList, function (optionItem) {
            let value = optionItem.value;
            options += '<option value="' + value + '">' + optionItem.text + '</option>';
        }.bind(this));
        this.$el.append(options);
        if (this.currentValue !== undefined) {
            this.$el.val(this.currentValue);
        }
        this.$el.on('change', function () {
            this.onChange && this.onChange(this, this.wrapper);
        }.bind(this));
    },
    value: function () {
        return {
            key: this.id,
            value: this.$el.val() || ''
        };
    }
});

let Input = Base.extend({
    tagName: 'input',
    className: 'form-control input-sm',
    init: function (options) {
        _.extend(this, {id: 'input-' + new Date().getTime()}, _.pick(options, ['id', 'classNames', 'onChange', 'wrapper']));
        let style = this.options.style;
        let placeholder = this.options.placeholder;
        this.attr('type', 'text');
        style && this.attr('style', style);
        placeholder && this.attr('placeholder', placeholder);
        Base.prototype.init.call(this, options);
        return this;
    },
    didRender: function () {
        if (this.onChange) {
            this.$el.on('change', function () {
                this.onChange(this, this.wrapper);
            }.bind(this))
        }
    },
    value: function () {
        return {
            key: this.id,
            value: this.$el.val() || ''
        }
    }
});

export default {
    TYPE: TYPE,
    Label: Label,
    Title: Title,
    Button: Button,
    Select: Select,
    Input: Input
};