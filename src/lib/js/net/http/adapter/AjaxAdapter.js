'use strict';

import $ from 'jquery';
import _ from 'lodash';
import extend from '@lib/js/utils/extend';

let AjaxAdapter = function () {};

AjaxAdapter.prototype = {
    ajax: $.ajax,
    parse: function (response) {
        return response;
    },
    init: function (request) {
        this.request = request;
    },
    success: function (success, data) {
        this.retryTimer = null;
        success(data);
    },
    fail: function (fail, options, xhr, errorType, error) {
        console.log('ajax fail:' + errorType + ' ' + error);
        // if (errorType === 'abort' && options.retryCount) {
        //     if (typeof options._retryCount === 'undefined') {
        //         options._retryCount = 1;
        //     } else {
        //         options._retryCount++;
        //     }
        //
        //     if (options._retryCount <= options.retryCount) {
        //         console.log('ajax retry:' + options._retryCount, options);
        //         this.retryTimer = setTimeout(this.ajax.bind(this, options), options.retryInterval);
        //         return;
        //     }
        // } else {
        //     clearTimeout(this.retryTimer);
        //     this.retryTimer = null;
        // }
        fail({
            message: error || errorType,
            status: xhr.status,
            xhr: xhr,
            request: this.request
        });
    },
    cancel: function () {
        this.retryTimer && clearTimeout(this.retryTimer);
        this.handle && this.handle.abort();
        this.handle = null;
    },
    complete: function(request, xhr){
        request.complete && request.complete(xhr, status);
    },
    execute: function (request, success, fail) {
        let options = _.pick(request, AjaxAdapter.options);
        _.each(options, function(value, key) {
            options[key] = _.result(request, key);
        });

        _.extend(options, {
            success: this.success.bind(this, success),
            error: this.fail.bind(this, fail, options),
            complete: this.complete.bind(this, request)
        });
        return (this.handle = this.ajax(options));
    }
};

AjaxAdapter.options = [
    'async',
    'contentType',
    'data',
    'dataType',
    'type',
    'url',
    'headers'
    // 'timeout',
    // 'retryCount',
    // 'retryInterval'
];

AjaxAdapter.extend = extend;

export default AjaxAdapter;