'use strict';

import _ from 'lodash';
import Events from '@lib/js/event/Events';
import EndPoint from '@lib/js/net/ws/EndPoint';

let WebSocketEndPoint = EndPoint.extend({
    constructor: function() {
        EndPoint.constructor.apply(this, arguments);

        let f = function(method) {
            return function() {
                // 确保当前endpoint对象有一个socket
                _.result(this.endpoint, 'socket');
                return Events[method].apply(this, arguments);
            };
        };

        for (let method in this.events) {
            let handler = this.events[method];
            let target = handler.target;
            target = (this[target] = (this[target] || {}));
            target.endpoint = this;
            _.extend(target, Events);
            let methods = ['on', 'once'];
            for (let i = 0, length = methods.length; i < length; i++) {
                let m = methods[i];
                this[handler.target][m] = f(m);
            }
        }
    },

    socket: function() {
        this.createSocket();
        return this.socket;
    },

    createSocket: function() {
        this.socket = new WebSocket(this.scalar.config.ws.base + this.url);
        this.socket.addEventListener('message', this.onMessage.bind(this));
        this.socket.addEventListener('open', this.onOpen.bind(this));
        this.socket.addEventListener('close', this.onClose.bind(this));
    },

    onOpen: function(event) {
        console.log('web socket open: ' + this.url, event);
        delete this._reconnectCount;
        this.timer && clearTimeout(this.timer);
        this.trigger('open', event, this);
    },

    onMessage: function(event) {
        let data = JSON.parse(event.data);
        let method = this.events[data.method];
        if(method) {
            let type = method.event;
            let handler = this[method.target];
            if(handler) {
                handler.trigger(type, { response: { data: data }, socket: event.target });
            }
        }
        this.trigger('message', event, this);
    },

    onClose: function(event) {
        console.log('web socket close: ' + this.url, event);
        if (typeof this._reconnectCount === 'undefined') {
            this._reconnectCount = 1;
        } else {
            this._reconnectCount++;
        }
        if (this._reconnectCount <= 5) {
            console.log('web socket reconnect:' + this.url);
            this.timer = setTimeout(function() {
                this.createSocket();
                this.trigger('reconnected', this.socket);
            }.bind(this), this.scalar.config.reconnectInterval);
        }
    }
});

export default WebSocketEndPoint;