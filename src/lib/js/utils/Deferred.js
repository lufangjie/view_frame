'use strict';

import extend from '@lib/js/utils/extend';

let Deferred = function () {
    this.thens = [];
    this.catches = [];
};

Deferred.prototype = {
    newPromise: function (then) {
        return new Promise(then);
    },

    execute: function (then) {
        let promise = this.promise = this.newPromise(then);
        let i = 0, length = this.thens.length;
        for (; i < length; i++) {
            promise = promise.then(this.thens[i]);
        }
        for (i = 0, length = this.catches.length; i < length; i++) {
            promise = promise.catch(this.catches[i]);
        }
        this.thens = [];
        this.catches = [];
        return promise;
    },

    then: function (callback) {
        this.thens.push(callback);
        return this;
    },
    catch: function (callback) {
        this.catches.push(callback);
        return this;
    }
};

Deferred.accept = function (value) {
    return new Deferred(Promise.accept(value));
};

Deferred.reject = function (value) {
    return new Deferred(Promise.reject(value));
};

Deferred.extend = extend;

export default Deferred;