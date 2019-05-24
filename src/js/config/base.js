'use strict';

import extend from '@lib/js/utils/extend';

// 开发环境
const DEV_IP = 'localhost';
const DEV_PORT = '9011';
const DEV_SOCKET_PORT = '9011';
// 生产环境
const PRO_IP = 'wx.gisocn.com';
const PRO_PORT = '58080';
const PRO_SOCKET_PORT = '9011';

let config = {
    debug: true,
    // 后端API的IP和端口
    scalar: {
        ip: PRODUCTION === false ? DEV_IP : PRO_IP,
        port: PRODUCTION === false ? DEV_PORT : PRO_PORT,
        wsPort: PRODUCTION === false ? DEV_SOCKET_PORT : PRO_SOCKET_PORT,
        reconnectCount: 100,
        reconnectInterval: 1000
    }
};

let Base = function () {};

Base.extend = function () {
    let sub = extend.apply(this, arguments);
    sub = new sub();
    return _.extend(sub, _.merge(sub, config));
};

export default Base;