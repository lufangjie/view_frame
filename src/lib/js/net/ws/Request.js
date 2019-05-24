'use strict';

import _ from 'lodash';
import Request from '@lib/js/net/Request';

let WebSocketRequest = Request.extend({
    constructor: function(options) {
        Request.apply(this, arguments);
        _.extend(this, _.pick(options || {}, _.keys(this.klass.options)));
        if (options.reExecAfterReconnection) {
            this.listenTo(this.endpoint, 'reconnected', function(socket) {
                console.log('websocket reconnected:' + this.endpoint.url + ' ' + this.method);
                this.socket = socket;
                this.execute();
            });
        }
    },

    execute: function() {
        if (!this.socket) {
            return Promise.reject('no socket');
        }
        return Request.prototype.execute.apply(this);
    },

    message: function() {
        return JSON.stringify(this.toJSON());
    },

    doExecute: function(resolve, reject) {
        this._resolve = resolve;
        this._reject = reject;

        switch (this.socket.readyState) {
            case WebSocket.CONNECTING:
                this.socket.addEventListener('open', this.didOpen.bind(this));
                break;
            case WebSocket.OPEN:
                this.send();
                break;
        }
    },

    send: function() {
        this.socket.addEventListener('message', this.didReceiveMessage.bind(this));
        this.socket.send(this.message());
    },

    didReceiveMessage: function(event) {
        this._resolve(event.data);
    },
    didOpen: function(event) {
        this.trigger(WebSocketRequest.OPENED, this, event);
        this.send();
    },

    toJSON: function() {
        return {};
    }
});

['opened'].forEach(function(event) {
    WebSocketRequest[event.toUpperCase()] = event;
});

WebSocketRequest.options = _.extend({
    socket: null,
    reExecAfterReconnection: false
}, Request.options);


export default WebSocketRequest;