'use strict';

import _ from 'lodash';
import Base from '@lib/js/net/Request';
import AjaxAdapter from '@lib/js/net/http/adapter/AjaxAdapter';

let Request = Base.extend({
    constructor: function (options) {
        Base.apply(this, options);

        if (typeof options.execute === 'function') {
            options = arguments[1];
            this.adapter = arguments[0];
        } else if (typeof options === 'string') {
            options = {url: options};
        }

        _.extend(this, _.pick(options || {}, _.keys(this.klass.options)));

        this.adapter = this.adapter || new AjaxAdapter();
        this.adapter.init(this, options);
    },
    cancel: function () {
        this.adapter.cancel();
        this.handle = null;
        Base.prototype.cancel.call(this, arguments);
    },
    execute: function (options) {
        _.extend(this, _.pick(options || {}, _.keys(this.klass.options)));
        // TODO
        return Base.prototype.execute.call(this, arguments);
    },
    doFailed: function(responseJSON){
        console.error(responseJSON);
    },
    doExecute: function (resolve, reject) {
        return (this.handle = this.adapter.execute(this, resolve, reject));
    }
});

Request.options = _.extend({
    adapter: null,
    async: true,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8 ',
    data: {},
    dataType: 'json',
    type: 'POST',
    url: null,
    headers: {}
    // version: '1.0',
    // retryCount: 5,
    // retryInterval: 200
}, Base.options);

export default Request;