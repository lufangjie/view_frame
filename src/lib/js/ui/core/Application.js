'use strict';

import $ from 'jquery';
import _ from 'lodash';
import extend from '@lib/js/utils/extend';
import Backbone from '@lib/js/ui/backbone';
import Events from '@lib/js/event/Events';
import Window from '@lib/js/ui/view/Window';

let Application = function() {
    this.window.render();
    this.$el = $(this.el);
    this.didCreate && this.didCreate();
};

Application.prototype = {
    el: window.document.documentElement,
    window: new Window(),

    /*
     * Application被创建并注册为窗口documentElement的包装器
     * Window视图已经被创建
     */
    didCreate: function() {

    },

    /*
     * Application的入口
     * @param {Object} [options={}] 任意的options.
     */
    run: function(options) {
        options = options || {};
        this.router = options.router || this.router;
        this.config = options.config;
        window.addEventListener('hashchange', this);
        this.didLaunch && this.didLaunch(options);
        this.listenRouter();
    },

    listenRouter: function() {
        this.router && this.listenTo(this.router, 'route', this.handleRoute);
        Backbone.history.start(/*{ pushState: true }*/);
    },

    /*
     * Application被创建,执行，并且开始监听window事件
     * @param {Object} options  run / launch的options
     */
    didLaunch: function(/* options */) {

    },

    /*
     * 响应window绑定的事件
     */
    handleEvent: function(event) {

    },

    /**
     * 路由切换
     * @param route 路由名称
     * @param params 路由内包含的参数
     */
    handleRoute: function(route, params) {
        if (this[route] && _.isFunction(this[route])) {
            this[route].apply(this, arguments);
        } else if (_.isFunction(route)) {
            route.apply(this, arguments);
        } else {
            params = params || [];
            params = params.filter(function(param) {
                return param !== null;
            });

            route.view().then(function(view) {
                // TODO 加载画面js
            }.bind(this));
        }
    }
};

_.extend(Application.prototype, Events);

['addClass',
    'removeClass',
    'hasClass',
    'toggleClass',
    'css'].forEach(function(method) {
    Application.prototype[method] = function() {
        let result = this.$el && this.$el[method].apply(this.$el, arguments);
        return _.isUndefined(result) ? this : result;
    };
});

Application._extend = extend;
Application.extend = function() {
    let klass = Application._extend.apply(Application, arguments);
    window.Application = new klass();
    return window.Application;
};

export default Application;