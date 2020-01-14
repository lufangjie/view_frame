import Base from '@lib/js/ui/view/WrapView';
import Template from '@template/grid/pagination.htm';

const ENTER_KEY = 13;

let Li = Base.extend({
    template: '<span><%= data.text %></span>',
    clickable: true,
    init: function(options){
        options.template && (this.template = options.template);
        this.model = options.model || {};
        this.className = options.className;
        this.pageIndex = options.pageIndex;
        Base.prototype.init.call(this, options);
        return this
    },
    didRender: function () {
        let _this = this;
        this.$('span').on('click', function () {
            _this.clickable && _this.superview.trigger('click', _this.pageIndex, _this);
        });
    },

    enable: function(){
        this.removeClass('disabled');
        this.clickable = true;
    },
    disable: function(){
        this.addClass('disabled');
        this.clickable = false;
    }
});

export default Base.extend({
    className: 'page_box',
    template: Template,
    PAGE_INDEX_CHANGE: 'page_index_change',
    PAGE_SIZE_CHANGE: 'page_size_change',
    init: function (options) {
        options = options || {};
        this.totalCount = options.totalCount;
        this.pageCount = options.pageCount;
        this.pageIndex = options.pageIndex || 1;
        this.pageSize = options.pageSize || 15;
        this.model = {
            pageSize: this.pageSize,
            pageIndex: this.pageIndex
        };
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function () {
        this.createPage();
        this.display();
        let _this = this;
        this.$('#current_page')
            .on('change', function(){
                _this.goTo(this, this.value);
            })
            .on('keyup', function(event){
                if (event.keyCode === ENTER_KEY) {
                    _this.goTo(this, this.value);
                }
            });
        this.$('#page_size').val(this.pageSize);
        this.$('#page_size').on('change', function(){
            let pageSize = parseInt(this.value);
            _this.trigger(_this.PAGE_SIZE_CHANGE, pageSize);
        });
        this.listenTo(this, 'click', this.itemClick.bind(this));
    },

    createPage: function(){
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.pagination');
        this.first = Li.new({
            model: {
                text: '首页'
            },
            className: 'first',
            pageIndex: 1
        });
        this.prev = Li.new({
            model: {
                text: '上一页'
            },
            className: 'prev'
        });
        this.next = Li.new({
            model: {
                text: '下一页'
            },
            className: 'next'
        });
        this.last = Li.new({
            model: {
                text: '末页'
            },
            className: 'last',
            pageIndex: this.pageCount
        });

        this.page = Li.new({
            template: '第<input type="text" id="current_page" maxlength="3" />页，共<span class="page_count"><%= data.pageCount%></span>页',
            model: {
                pageCount: this.pageCount
            },
            className: 'page'
        });
        this.page.clickable = false;
        this.addView(this.first);
        this.addView(this.prev);
        this.addView(this.page);
        this.addView(this.next);
        this.addView(this.last);

        this.$context = $context;
        this.context = context;
    },

    display: function () {
        this.first.enable();
        this.prev.enable();
        this.next.enable();
        this.last.enable();
        if (this.pageIndex === 1) {
            this.first.disable();
            this.prev.disable();
        }
        if (this.pageIndex === this.pageCount) {
            this.last.disable();
            this.next.disable();
        }

        let from = (this.pageIndex - 1 ) * this.pageSize + 1;
        if(this.totalCount === 0) {
            from = 0;
        }
        let to = this.pageIndex * this.pageSize;
        if(to > this.totalCount) {
            to = this.totalCount;
        }
        this.$('#current_page').val(this.pageIndex);
        this.$('span.page_count').html(this.pageCount);
        this.$('span.total_count').html(this.totalCount);
        this.$('span.from').html(from);
        this.$('span.to').html(to);
    },

    itemClick: function (pageIndex, page) {
        if (!page) {
            return;
        }
        if (this.pageIndex === pageIndex) {
            return;
        }
        if (this.prev === page) {
            this.pageIndex = this.pageIndex - 1;
        } else if (this.next === page) {
            this.pageIndex = this.pageIndex + 1;
        } else {
            this.pageIndex = pageIndex;
        }
        this.display();
        this.trigger(this.PAGE_INDEX_CHANGE, this.pageIndex);
    },

    goTo: function(el, pageIndex){
        if(pageIndex === '' || pageIndex === undefined){
            return;
        }
        pageIndex = parseInt(pageIndex);
        if(!pageIndex){
            pageIndex = 1;
        }
        if(pageIndex > this.pageCount){
            pageIndex = this.pageCount;
            el.value = this.pageCount;
        }
        this.pageIndex = pageIndex;
        this.display();
        this.trigger(this.PAGE_INDEX_CHANGE, this.pageIndex);
    }

}, {klass: 'Pagination'});