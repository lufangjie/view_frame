'use strict';

import _ from 'lodash';
import Backbone from '@lib/js/ui/backbone';
import Paths from '@js/config/paths';

export default {
    initRouter: function () {
        let routes = {};
        _.forEach(Paths, function(path, key){
            let routeName = key;
            if (path) {
                let routeKey = '';
                if (routeName.split('/').length === 2) {
                    // 路由地址包含自定义目录的类型
                    routeKey = routeName.split('/')[0] + '/:type';
                } else {
                    routeKey = routeName;
                }
                routes[routeKey] = {
                    view: (function (_path) {
                        return function () {
                            return new Promise(function (resolve) {
                                resolve(_path);
                            });
                        }
                    })(path)
                };
            }
        });

        return new (Backbone.Router.extend({
            routes: routes
        }));
    }
};