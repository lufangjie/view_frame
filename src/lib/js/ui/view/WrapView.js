'use strict';

import $ from 'jquery';
import Base from '@lib/js/ui/view/impl/View';

export default Base.extend({
    tagName: 'div',

    constructor: function () {
        Base.apply(this, arguments);

        this.el = this.context = this.el === null ? this.el : (this.el || document.createElement(this.tagName));
        this.$el = this.$context = (this.el && $(this.el)) || null;

        this.created();
    },

    render: function () {
        let result = Base.prototype.render.apply(this, arguments);
        $.data(this.el, 'view', this);
        return result;
    },

    destroy: function () {
        this.id && (delete window['$' + this.id]);
        return Base.prototype.destroy.apply(this, arguments);
    }
}, {klass: 'View'});