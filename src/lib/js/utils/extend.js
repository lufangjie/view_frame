'use strict';

import _ from 'lodash';

let extend = function (protoProps, staticProps) {
    let parent = this;
    let child;

    // 新对象的构造函数可以是你自己在'extend'声明的【constructor】属性
    // 也可以是默认的单纯的父类的构造函数
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    // 如果有静态属性，添加到构造函数中
    _.extend(child, parent, staticProps);

    // 将父类的原型链继承过来，但是不调用父类的构造函数
    let Surrogate = function () {
        this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // 向子类添加原型属性（实例属性）
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    child.__super__ = parent.prototype;
    child.prototype.klass = child;

    return child;
};

export default extend;