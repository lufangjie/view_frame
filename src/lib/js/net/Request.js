'use strict';

import _ from 'lodash';
import Events from '@lib/js/event/Events';
import Deferred from '@lib/js/utils/Deferred';

let Request = Deferred.extend({
    constructor: function() {
        Deferred.apply(this, arguments);
        _.defaults(this, this.klass.options);
    },
    cancel: function() {
        this.trigger(Request.CANCELLED);
    },
    execute: function() {
        this.thens.unshift(this.didSucceed.bind(this));
        this.catches.unshift(this.didFailed.bind(this));
        return Deferred.prototype.execute.call(this, this.doExecute.bind(this));
    },
    parse: function(response) {
        if (this.parser) {
            if (typeof this.parser === 'function') {
                return this.parser(response);
            } else if (this.parser.parse) {
                return this.parser.parse(response);
            }
        }
        return response;
    },
    doExecute: function(resolve /*, reject */) {
        resolve(this);
    },
    didSucceed: function(response) {
        this.response = {
            result: this.parse(response)
        };
        if (this.response.result && this.response.result instanceof Error) {
            return this.didFailed(this.response.result);
        }
        this.trigger(Request.SUCCEEDED, this);
        return this.response;
    },
    didFailed: function(error) {
        if (error) {
            console.error(error);
            if (error.xhr && error.xhr.responseJSON) {
                this.doFailed && this.doFailed(error.xhr.responseJSON);
            }
        }
        this.trigger(Request.FAILED, error);

        if (error instanceof Error) {
            throw error;
        } else {
            throw new Request.Error(error);
        }
    }
});

['cancelled', 'failed', 'succeeded'].forEach(function(event) {
    Request[event.toUpperCase()] = event;
});

Request.Error = function(options) {
    Error.call(this);
    Error.captureStackTrace(this, Request.Error.prototype.constructor);

    this.name = 'Request.Error';
    this.message = typeof options === 'string' ? options :
        (options && options.message ? options.message : '');
    this.code = (options && (options.code || options.status)) || 0;
};

Request.Error.prototype = Object.create(Error.prototype);
Request.Error.prototype.constructor = Request.Error;

Request.options = {
    parser: null
};

_.extend(Request.prototype, Events);

export default Request;