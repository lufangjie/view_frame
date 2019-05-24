'use strict';

import _ from 'lodash';

// Events定义为一个单例的对象，方便mix到其他需要自定义事件的对象中
let Events = {
    // 绑定一个或多个事件
    on: function (name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
            return this;
        }
        // this._events以key-value形式保存当前对象的所有事件
        // key：事件名称
        // value: 数组，该事件名称下的所有事 件处理器对象 { callback：事件的处理函数，context：外部传入的上下文对象， ctx：外部传入的上下文对象或当前的对象 }
        this._events || (this._events = {});
        let events = this._events[name] || (this._events[name] = []);
        events.push({callback: callback, context: context, ctx: context || this});
        return this;
    },

    // 绑定一个只执行一次的事件，在第一次调用callback函数后，该事件将被移除
    once: function (name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) {
            return this;
        }
        let _this = this;
        let once = _.once(function () {
            _this.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },

    // 删除一个或多个事件
    off: function (name, callback, context) {
        let retain, events, names;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
            return this;
        }
        // 没有输入参数时，移除所有的事件
        if (!name && !callback && !context) {
            this._events = undefined;
            return this;
        }
        // name为空时，移除所有事件
        names = name ? [name] : _.keys(this._events);
        for (let i = 0, length = names.length; i < length; i++) {
            name = names[i];
            // 获取当前事件名称下的所有事件列表
            if (events = this._events[name]) {
                // 清空当前事件名称下的所有事件
                this._events[name] = retain = [];
                // callback或context为null时，删除当前事件
                // 否则删除有对应callback或context的事件
                if (callback || context) {
                    for (let j = 0, eLength = events.length; j < eLength; j++) {
                        let ev = events[j];
                        // 如果参数中的callback或context和事件处理器保存的callback或context对象不一致，保留事件
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback)
                            || (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) {
                    // 将当前的事件名称从_events中删除
                    delete this._events[name];
                }
            }
        }
        return this;
    },

    // 执行一个或多个事件
    trigger: function (name) {
        if (!this._events) {
            return this;
        }
        let args = Array.prototype.slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) {
            return this;
        }
        let events = this._events[name];
        if (events) {
            triggerEvents(events, args);
        }
        return this;
    },

    /**
     * 删除事件的监听
     * @param obj 指定的监听的对象
     * @param name  事件名称
     * @param callback
     * @returns {Events}
     */
    stopListening: function (obj, name, callback) {
        let listeningTo = this._listeningTo;
        if (!listeningTo) {
            return this;
        }
        let remove = !name && !callback;
        if (!callback && typeof name === 'object') {
            callback = this;
        }
        // obj不为空时，只删除obj，否则删除所有被监听的对象
        if (obj) {
            (listeningTo = {})[obj._listenId] = obj;
        }
        for (let id in listeningTo) {
            // 移除被监听的对象所绑定的事件
            obj = listeningTo[id];
            obj.off(name, callback, this);
            if (remove || _.isEmpty(obj._events)) {
                delete this._listeningTo[id];
            }
        }
        return this;
    }
};


// 分割事件名称的正则表达式
let eventSplitter = /\s+/;

/**
 * 辅助on/once/off/trigger完成事件的添加、删除、派发
 * 通过递归调用来实现批量添加事件
 *
 * @param obj 当前作用域
 * @param action 函数名称 【on/once/off/trigger】
 * @param name 多个事件
 *         name的类型为Object时,key对应事件名称，value对应回调函数
 *                  {
     *                      actionName1: callback1,
     *                      actionName2: callback2
     *                      .....
     *                  }
 *         name的类型为字符串时，事件名称以空格隔开
 *                  "actionName1 actionName2"
 * @param rest 其他参数数组
 */
let eventsApi = function (obj, action, name, rest) {
    if (!name) {
        return true;
    }
    if (typeof name === 'object') {
        for (let key in name) {
            // TODO 只遍历obj本身的属性，不考虑原型链上的属性
            if (name.hasOwnProperty(key)) {
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
        }
        return false;
    }
    if (eventSplitter.test(name)) {
        let names = name.split(eventSplitter);
        for (let i = 0, length = names.length; i < length; i++) {
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }
    return true;
};

/**
 * 执行当前事件名称绑定的事件函数
 * @param events 事件函数列表
 * @param args 参数
 */
let triggerEvents = function (events, args) {
    let length = events.length, event, i = -1, a1 = args[0], a2 = args[1], a3 = args[2];
    // 由于call的性能要优于apply，所以在参数个数在3个或3个以下时（通常函数的参数个数也很少会超过3个），使用call调用事件函数
    switch (args.length) {
        case 0:
            while (++i < length) (event = events[i]).callback.call(event.ctx);
            return;
        case 1:
            while (++i < length) (event = events[i]).callback.call(event.ctx, a1);
            return;
        case 2:
            while (++i < length) (event = events[i]).callback.call(event.ctx, a1, a2);
            return;
        case 3:
            while (++i < length) (event = events[i]).callback.call(event.ctx, a1, a2, a3);
            return;
        default:
            while (++i < length) (event = events[i]).callback.apply(event.ctx, args);
            return;
    }
};

// 添加【Events.listenTo】、【Events.listenToOnce】方法
let listenMethods = {listenTo: 'on', listenToOnce: 'once'};

// 让当前的对象监听另一个对象，实现On/Once方法的控制反转
_.each(listenMethods, function (implementation, method) {
    Events[method] = function (obj, name, callback) {
        let listeningTo = this._listeningTo || (this._listeningTo = {});
        // 给被监听的对象设置一个唯一的标识，方便移除监听时获取该对象
        // 并将这个监听的对象保存到当前对象的_listeningTo中
        let id = obj._listenId || (obj._listenId = _.uniqueId('listen_'));
        listeningTo[id] = obj;
        if (!callback && typeof name === 'object') {
            callback = this;
        }
        // 调用被监听的对象的On或Once方法，给被监听的对象添加一个新的事件
        obj[implementation](name, callback, this);
        return this;
    };
});

// 别名
Events.bind = Events.on;
Events.unbind = Events.off;

export default Events;
