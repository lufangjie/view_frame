'use strict';

import _ from 'lodash';
import extend from '@lib/js/utils/extend';
import Events from '@lib/js/event/Events';

let _View = function (options) {
    this.options = options || {};
};

_View.prototype = {
    init: function (options) {
        !this.options && this.klass.options &&
        _.extend(this, _.pick(this.options = (options || {}), this.klass.options));
        return this;
    }
};

_View.extend = function (o, _static) {
    let subclass = extend.apply(this, arguments);

    subclass.new = function (options) {
        return new subclass(options).init(options);
    };

    subclass.prototype.klass = subclass;
    subclass.extend = _View.extend;
    return subclass;
};

_.extend(_View.prototype, Events);

export default _View;