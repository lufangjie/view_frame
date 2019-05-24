'use strict';

import $ from 'jquery';
import View from '@lib/js/ui/view/WrapView';

export default View.extend({
    el: document.body,
    id: 'window',
    didCreate: function(){
        this.window = this;
    },

    didRender: function() {
        window['$' + this.id] = $.data(document.querySelector('#' + this.id), 'view');
    }
});