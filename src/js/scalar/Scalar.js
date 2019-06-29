'use strict';

import _ from 'lodash';
import EndPoint from '@lib/js/net/ws/EndPoint';
import System from '@js/scalar/System';

let Scalar = {
    init: function(config) {
        let base = '://' + (config.ip || 'localhost') + ':';
        _.defaults(config, {
            uri: {
                base: 'http' + base + (config.port || 8080)
            },
            ws: {
                base: 'ws' + base + (config.wsPort || 8080)
            }
        });
        this.config = config;
        this.system.config = config;
        return this;
    },

    getRequest: function(endPoint, remoteMethod) {
        let request = _.get(this, endPoint + '.' + remoteMethod);
        let context = _.get(this, endPoint);
        return request.bind(context);
    }
};

EndPoint.prototype.scalar = Scalar;
Scalar.system = System;

['get', 'post', 'ajax', 'json'].forEach(function(method) {
    Scalar[method.toUpperCase()] = method;
});

export default Scalar;