import _ from 'lodash';
import Modal from '@js/components/modal/modal';

let Builder = function() {
    this.viewOptions = {
        classNames: [],
        size: '',
        bodyView: null,
        dataSet: {},
        apis: [],
        footers: []
    };
};

Builder.prototype = {
    id: function(id) {
        this.viewOptions.id = id || ('modal-' + new Date().getTime());
        return this;
    },

    title: function(title) {
        this.viewOptions.title = title;
        return this;
    },

    className: function(className) {
        this.viewOptions.classNames.push(className);
        return this;
    },

    size: function(size) {
        size && (this.viewOptions.size = size);
        return this;
    },

    body: function(bodyView) {
        this.viewOptions.bodyView = bodyView;
        return this;
    },

    button: function(config, cb) {
        this.viewOptions.footers.push({
            config: config,
            cb: cb
        });
        return this;
    },

    data: function(data) {
        this.viewOptions.dataSet = data;
        return this;
    },

    api: function(options) {
        this.viewOptions.apis.push(options);
        return this;
    },
    bodyOptions: function(options) {
        this.viewOptions.bodyOptions = options;
        return this;
    },

    closeButton: function() {
        let config, cb;
        let arg1 = arguments[0];
        if (arguments.length < 1) {
            config = { text: '关闭' };
            cb = function(wrapper) {
                wrapper.close();
            };
        } else if (_.isFunction(arg1)) {
            config = { text: '关闭' };
            cb = arg1;
        } else if (_.isString(arg1)) {
            config = { text: arg1 };
            cb = arguments[1];
        } else if (_.isObjectLike(arg1)) {
            config = arg1;
            cb = arguments[1];
        }
        this.viewOptions.footers.push({
            config: config,
            cb: cb
        });
        return this;
    },

    show: function() {
        this.modal = Modal.new(this.viewOptions);
        this.modal.render();
    },

    close: function() {
        this.modal.close();
        this.modal = null;
    }
};

export default Builder;