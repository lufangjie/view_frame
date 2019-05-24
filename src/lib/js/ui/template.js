'use strict';

import _ from 'lodash';

let Lodash = function (template, options) {
    this.template = _.template(template, _.defaults(options || {}, {
        variable: 'data'
    }));
};

Lodash.prototype = {
    render: function (el) {
        let model = el.model;
        if (model && model.toJSON) {
            model = model.toJSON();
        }
        let compiled = this.template(model);
        if (el.$context) {
            el.context.innerHTML = compiled;
        } else {
            el.$el = el.$context = $(compiled);
            el.el = el.context = el.$el[0];
        }

        if (el.context && el.context.querySelector('i18n-t')) {
            // TODO 多语言切换
        }
    }
};

let Template = function (template, options) {
    this._impl = new Lodash(template, options);
};

Template.prototype = {
    render: function (el) {
        this._impl.render(el);
    }
};

export default Template;