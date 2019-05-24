'use strict';

import _ from 'lodash';
import Request from '@lib/js/net/http/Request';

export default {
    ajax: function(uri, params) {
        let base = params.baseUrl || this.config.uri.base;
        params.url = base + (_.startsWith(uri, '/') ? uri : ('/' + uri));
        return new Request(params).execute();
    },

    post: function(uri, params) {
        params.contentType = params.contentType || 'application/json;charset=utf-8';
        params.type = 'post';
        params.data = JSON.stringify(params.data || {});
        let base = params.baseUrl || this.config.uri.base;
        params.url = base + (_.startsWith(uri, '/') ? uri : ('/' + uri));
        return new Request(params);
    },

    get: function(uri, params) {
        params.type = 'get';
        let base = params.baseUrl || this.config.uri.base;
        params.url = base + (_.startsWith(uri, '/') ? uri : ('/' + uri));
        return new Request(params);
    },

    json: function(uri, params) {
        params = params || {};
        params.url = uri;
        params.type = 'get';
        return new Request(params);
    }

};