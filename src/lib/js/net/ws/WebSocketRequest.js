'use strict';

import _ from 'lodash';
import Base from '@lib/js/net/ws/Request';
import Http from '@lib/js/net/http/Request';

let _id = 0;
let _object = {};

let WebSocketRequest = Base.extend({
    constructor: function(options) {
        Base.apply(this, arguments);
        this.socket = options.socket || _.result(this.endpoint, 'socket');
        this.createId();
    },
    parse: function(response) {
        try {
            return JSON.parse(response);
        } catch (e) {

        }
        return null;
    },

    createId: function() {
        this.id = ++_id;
    },

    result: function() {
        return this.response &&
            this.response.result &&
            ((this.response.result.length &&
                this.response.result[0]) || this.response.result);
    },

    error: function() {
        return this.response && this.response.error || null;
    },

    url: function() {
        return (this.baseUrl || this.endpoint.scalar.config.uri.base) + this.endpoint.url;
    },

    params: function() {
        return _object;
    },
    data: function() {
        return JSON.stringify(this.toJSON());
    },

    toJSON: function() {
        let params = _.result(this, 'params');
        params = _.isArray(params) ? params : [params];
        return {
            id: this.id,
            method: this.method,
            params: params,
            version: this.version
        };
    }
});

WebSocketRequest.options = _.extend({
    socket: null
}, _.clone(Http.options), {
    baseUrl: null,
    contentType: 'application/json',
    dataType: 'json',
    endpoint: null,
    method: '',
    params: [],
    type: 'POST',
    headers: {},
    version: '1.0',
    retryCount: 5,
    retryInterval: 200
});

export default WebSocketRequest;