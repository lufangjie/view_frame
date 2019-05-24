'use strict';

import $ from 'jquery';
import _ from 'lodash';
import Template from '@lib/js/ui/template';
import Base from '@lib/js/ui/view/impl/_View';

let _defer = function (method) {
    return function () {
        let result = this.$el && this.$el[method].apply(this.$el, arguments);
        return _.isUndefined(result) ? this : result;
    };
};

let _static = {
    options: ['className', 'classNames', 'el', 'id', 'model', 'tagName', 'template']
};

/**
 * 用户界面抽象的DOM元素层次结构的可视化表示
 * <header>生命周期</header>
 * <ul>
 *      <li>didCreate</li>
 *      <li>didRender</li>
 *      .......
 *      <li>didDestroy</li>
 * </ul>
 */
let View = Base.extend({
    init: function (options) {
        options = options || {};
        this.classNames = this.classNames || options.classNames || [];
        this.classNames.push('view');

        options.classNames && (this.classNames = this.classNames.concat(options.classNames));
        options.className && this.classNames.push(options.className);

        Base.prototype.init.apply(this, arguments);
        return this;
    },

    $: function (selector, context) {
        context = context || this.context;
        return $(selector, context);
    },

    /**
     * 生命周期第一步
     * 创建视图（包括潜在的Dom元素）
     */
    created: function () {
        // TODO
        this.willCreate && this.willCreate();

        this.subviews = [];

        this.didCreate && this.didCreate();
    },

    /**
     * 生命周期第二步
     * 渲染视图 模板被绑定到数据模型
     * @return {View} this
     */
    render: function () {
        if (this._rendered || this._rendering) {
            return this;
        }

        this._rendering = true;

        this.willRender && this.willRender();

        if (typeof this.template === 'string') {
            this.template = new Template(this.template);
        }

        this.template && this.template.render(this);

        // TODO 国际化

        // 设置dom元素的id，样式等
        this._stylize();

        this.didRender && this.didRender();

        this._rendered = true;
        this._rendering = false;

        return this;
    },

    _stylize: function () {
        this.identify();
        this.classify();
    },

    identify: function () {
        this.el && this.id && (this.el.id = this.id);
    },

    classify: function () {
        if (this.el) {
            let className = (this.className || '') + ' ' + (this.classNames ? this.classNames.join(' ') : '');
            this.el.className = _.keys(className.split(/\s+/).reduce(function (memo, item) {
                memo[item] = item;
                return memo;
            }, {}))
                .join(' ')
                .trim();
        }
    },

    addClass: function (className) {
        this.classNames = this.classNames || [];
        this.classNames.push(className);
        this.$el && this.$el.addClass(className);
    },

    removeClass: function (className) {
        if (this.classNames && this.classNames.length) {
            let index = this.classNames.indexOf(className);
            if (index >= 0) {
                this.classNames.splice(index, 1);
            }
        }
        this.$el && this.$el.removeClass(className);
    },

    /**
     * 生命周期最后一步
     * 移除视图，销毁所有子视图？？？，删除绑定的事件,执行一般清理
     */
    destroy: function () {
        this.willDestroy && this.willDestroy();

        // TODO
        this.removeFromSuperview();
        this.subviews.map(function (view) {
            view.destroy();
        });
        this.$el && this.$el.off();
        this.el && $.removeData(this.el);
        this.$el = this.$context = this.context = this.el = null;
        this.off();
        this.stopListening();
        this.subviews = [];

        this.didDestroy && this.didDestroy();
    },

    /**
     * 重新渲染自己
     */
    invalidate: function () {
        this._rendered = false;
        this.render();
    },

    /**
     * 添加视图
     * @param view 需要添加的视图
     * @returns {View} this
     */
    addView: function (view) {
        return this._addView(view, this.doAddView);
    },

    /**
     * 替换视图
     * @param selector 需要被替换的Dom元素
     * @param view 需要替换的视图
     * @returns {View} this
     */
    replaceChild: function (selector, view) {
        return this._addView(view, this.doReplaceChild, selector);
    },

    _addView: function (view, strategy) {
        if (view) {
            !this._rendered && this.render();
            view.removeFromSuperview();
            view.superview = this;
            view.render();
            let args = Array.prototype.slice.call(arguments, 2);
            strategy.apply(this, [view].concat(args));
        }
        return this;
    },

    doAddView: function (view) {
        if (!view) {
            return;
        }
        !$.contains(this.context, view.el) && this.context !== view.el && this.$context.append(view.el);
        this.subviews.push(view);
    },

    doReplaceChild: function (view, selector) {
        if (!view) {
            return;
        }
        let $el = this.$(selector);
        if ($el && $el.length) {
            $el.replaceWith(view.el);
            this.subviews.push(view);
        }
    },

    /**
     * 移除一个子视图
     * @param   view 从当前视图中移除的子视图对象
     * @returns {View} this
     */
    removeView: function (view) {
        if (view && this.subviews.indexOf(view) !== -1) {
            view.$el.remove();
            this.subviews = this.subviews.filter(function (child) {
                return child !== view;
            });
            view.superview = null;
        }
        return this;
    },

    /**
     * 销毁一个子视图
     * @param   view 从当前视图中销毁的子视图对象
     * @returns {View} this
     */
    destroyView: function (view) {
        if (view && this.subviews.indexOf(view) !== -1) {
            view.destroy();
        }
        return this;
    },

    /**
     * 从当前视图的父视图删除自己
     * @returns {View} this
     */
    removeFromSuperview: function () {
        if (this.superview) {
            this.superview.removeView(this);
        }
        return this;
    },

    /**
     * 移除所有子视图
     * @returns {View} this
     */
    removeAllSubviews: function () {
        if (this.subviews !== null) {
            this.subviews.map(this.removeView.bind(this));
        }
        return this;
    },

    /**
     * 销毁所有子视图
     * @returns {View} this
     */
    destroyAllSubviews: function () {
        if (this.subviews !== null) {
            this.subviews.map(this.destroyView.bind(this));
        }
        return this;
    }

}, _static);


['hasClass', 'toggleClass', 'css', 'attr'].forEach(function (method) {
    View.prototype[method] = _defer(method);
});

export default View;