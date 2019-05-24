'use strict';

import _ from 'lodash';
import Execute from '@js/scalar/Execute';
import WebSocketEndPoint from '@lib/js/net/ws/WebSocketEndPoint';
import WebSocketRequest from '@lib/js/net/ws/WebSocketRequest';

let System;
System = WebSocketEndPoint.extend({
    url: '/websocket',
    name: 'system',
    events: {
        notifySystem: {
            target: 'menu',
            event: 'menu_status'
        }
    },
    set: {
        notifications: function(options) {
            return new WebSocketRequest(_.extend(options || {}, {
                endpoint: System,
                method: 'switchNotifications',
                params: _.defaults(_.pick(options || {}, 'enable', 'disabled'))
            }));
        }
    }
});

let api = {
    login: function(params) {
        return this.post('user/login', params);
    },
    userList: function(params) {
        return this.post('/user/list_by_page', params);
    }
};

System = new System();

export default _.extend(System, Execute, {
    switchNotifications: System.set.notifications,
    login: api.login,
    userList: api.userList
});

