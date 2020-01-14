import _ from 'lodash';
import Base from '@lib/js/ui/view/WrapView';
import Scalar from '@js/scalar/Scalar';
import Pagination from '@js/components/grid/pagination';
import TableTemplate from '@template/grid/table.htm';

// 表格第一列（checkbox列）的最小狂宽度
const CHECKBOX_CELL_WIDTH = 40;

/**
 * 表格头部行
 */
let Head = Base.extend({
    tagName: 'tr',
    SELECT: 'select',
    SORT: 'sort',
    init: function(options) {
        this.options = options || {};
        Base.prototype.init.call(this, options);
        return this;
    },
    didRender: function() {
        let _this = this;
        _.each(this.options.columns, function(cell, index) {
            let $th = _this.createItem(cell, index);
            _this.$el.append($th);
            $th.on('click', '.sortable', function() {
                let field = $(this).data('field-name');
                let sort = $(this).data('sort') || 'asc';
                _this.trigger(_this.SORT, field, sort);
                $(this).data('sort', sort === 'asc' ? 'desc' : 'asc');
            });
        });
    },

    /**
     * 创建头部的单个单元格
     * @param cell 单元格配置信息
     * @param index 单元格的索引位置
     * @returns {*|jQuery|HTMLElement}
     */
    createItem: function(cell, index) {
        let _this = this;
        let type = cell.type;
        let style = 'border-bottom: none;text-align: ' + (cell.align || 'left');
        style = cell.width ? (style + ';width:' + cell.width + 'px') : style;
        let $th = $('<th data-index="' + index + '" style="' + style + '"></th>');
        let item;
        switch (type) {
            case 'check':
                $th.css('text-align', 'center');
                $th.css('width', CHECKBOX_CELL_WIDTH);
                item = $('<input type="checkbox" />');
                item.on('click', function() {
                    let checked = $(this).prop('checked');
                    _this.trigger(_this.SELECT, checked);
                });
                break;
            case 'radio':
                $th.addClass('text-center');
                $th.css('text-align', 'center');
                $th.css('width', CHECKBOX_CELL_WIDTH);
                item = '<input type="checkbox" disabled="disabled" />';
                break;
            case 'action':
                $th.addClass('text-center');
                item = '<a href="javascript:void(0)" class="icon iconfont icon-icon02 column-config">' + (cell.text || '操作') + '</a>';
                break;
            case 'link':
            case 'text':
                let className = 'icon iconfont';
                cell.sort && (className += ' icon-angle-down sortable');
                item = $('<a data-field-name="' + cell.name + '" class="' + className + '" href="javascript:void(0)">' + cell.text + '</a>');
                break;
            default:
                break;
        }
        $th.append(item);
        (cell.hide === true) && $th.addClass('hide');
        return $th;
    },

    /**
     * 设置checkbox状态
     * @param flag true：选中 false：不选中
     */
    setCheckStatus: function(flag) {
        this.$('input[type="checkbox"]').prop('checked', flag);
    },

    /**
     * 移除所有列的排序信息
     */
    removeSortInfo: function() {
        this.$('th a').removeData('sort');
    }
});

/**
 * 表格数据行
 */
let Row = Base.extend({
    tagName: 'tr',
    isSelected: false,
    SINGLE_CHECKED: 'single_select',
    init: function(options) {
        this.data = options.data;
        this.columns = options.columns;
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        _.each(this.columns, function(cell, index) {
            this.$el.append(this.createItem(cell, index));
            // 是否选中当前行
            if (cell.onChecked && _.isFunction(cell.onChecked)) {
                this.checkedItem(!!cell.onChecked(this.data, this));
            }
        }.bind(this));
    },

    /**
     * 创建数据行的单个单元格
     * @param cell 单元格配置信息
     * @param index 单元格的索引位置
     * @returns {*|jQuery|HTMLElement}
     */
    createItem: function(cell, index) {
        let _this = this;
        let type = cell.type;
        let style = cell.style || '';
        style += ';text-align:' + (cell.align || 'left');
        style = cell.width ? (style + ';width:' + cell.width + 'px') : style;
        let $td = $('<td class="table-col-' + index + '" style="' + style + '"></td>');
        let item = '';
        switch (type) {
            case 'check':
            case 'radio':
                $td.css('text-align', 'center');
                $td.css('width', CHECKBOX_CELL_WIDTH);
                item = $('<input type="checkbox" />');
                item.on('click', function() {
                    _this.isSelected = $(this).prop('checked');
                    (type === 'radio') && _this.trigger(_this.SINGLE_CHECKED, _this);
                });
                $td.append(item);
                break;
            case 'link':
                let displayValue = _.get(_this.data, cell.name);
                if (cell.formatter && _.isFunction(cell.formatter)) {
                    displayValue = cell.formatter(displayValue, this);
                }
                item = $('<a>' + displayValue + '</a>');
                item.on('click', function() {
                    cell.onClick && cell.onClick(_this.data, _this);
                });
                $td.append(item);
                break;
            case 'action':
                $td.addClass('text-center');
                _.each(cell.items, function(action) {
                    let text = action.text || '';
                    if(action.formatter && _.isFunction(action.formatter)) {
                        text = action.formatter(_this.data, _this);
                    }
                    item = $('<a>' + text + '</a>');
                    item.on('click', function() {
                        action.onClick && action.onClick(_this.data, _this);
                    });
                    $td.append(item);
                });
                break;
            case 'text':
                let value = _.get(_this.data, cell.name);
                if (cell.formatter && _.isFunction(cell.formatter)) {
                    value = cell.formatter(value, _this);
                }
                item = value;
                $td.append(item);
                break;
            default:
                break;
        }
        (cell.hide === true) && $td.addClass('hide');
        return $td;
    },

    /**
     * 选中或不选中当前行
     * @param flag true：选中 false：不选中
     */
    checkedItem: function(flag) {
        this.$('input[type="checkbox"]').prop('checked', flag);
        this.isSelected = flag;
    }
});

export default Base.extend({
    className: 'grid_list table_box',
    RENDER: 'render',
    template: TableTemplate,
    init: function(options) {
        this.options = options || {};
        _.extend(this, _.pick(this.options, ['id', 'classNames', 'dataSet', 'wrapper', 'columns', 'endPoint', 'remoteMethod',  'params', 'page']));
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        this.singleCheckedItem = null;
        this.createHead();
        this.loadData(this.pageRender.bind(this));
    },

    /**
     * 加载后台数据
     * @param pageHandler 获取后端数据后的自定义处理
     */
    loadData: function(pageHandler) {
        if (this.endPoint && this.remoteMethod) {
            let params = this.params || {};
            if (this.page.enable) {
                params.pageIndex = this.page.pageIndex;
                params.pageSize = this.page.pageSize;
            }
            Scalar[this.endPoint][this.remoteMethod]({
                data: params
            }).execute().then(function(response) {
                this.dataSet = response.result.data || [];
                pageHandler && pageHandler(response.result.page || {});
                this.createBody();
            }.bind(this));
        } else {
            this.createBody();
        }
    },

    /**
     * 创建表格的Head部分
     */
    createHead: function() {
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.table_body thead');
        this.head = Head.new({
            columns: this.columns
        });
        this.addView(this.head);
        this.$context = $context;
        this.context = context;
        this.listenTo(this.head, this.head.SORT, this.sortRow);
    },

    /**
     * 创建表格的Body部分
     */
    createBody: function() {
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.table_body tbody');
        this.rowList = [];
        _.each(this.dataSet, function(data) {
            let row = Row.new({
                data: data,
                columns: this.columns
            });
            this.addView(row);
            this.rowList.push(row);

            row.listenTo(this.head, this.head.SELECT, row.checkedItem.bind(row));
            this.listenTo(row, row.SINGLE_CHECKED, this.setSingleCheckItem);
        }.bind(this));
        this.$context = $context;
        this.context = context;

        this.resize();
        this.calculateBodyHeight();
    },

    resize: function() {
        let _this = this;
        this.head.$el.on('mousedown', 'th', function(event) {
            if (event.offsetX > this.offsetWidth - 10) {
                _this.resizeObj = {
                    dom: this,
                    oldWidth: $(this).width(),
                    oldX: event.clientX
                };
            }
        });
        this.head.$el.on('mousemove', 'th', function(event) {
            if (event.offsetX > this.offsetWidth - 10) {
                this.style.cursor = 'col-resize';
            } else {
                this.style.cursor = 'default';
            }
            if (_this.resizeObj && _this.resizeObj.dom) {
                let newWidth = _this.resizeObj.oldWidth + (event.clientX - _this.resizeObj.oldX);
                if (newWidth > 10) {
                    let elm = $(_this.resizeObj.dom);
                    let colIndex = elm.data('index');
                    let bodyCols = _this.$el.find('td.table-col-' + colIndex);
                    elm.width(newWidth);
                    elm.css('min-width', newWidth);
                    elm.css('max-width', newWidth);
                    bodyCols.width(newWidth);
                    bodyCols.css('min-width', newWidth);
                    bodyCols.css('max-width', newWidth);
                }
            }
        });
        window.Application.window.$el.on('mouseup', function() {
            _this.resizeObj && delete _this.resizeObj;
        });
    },

    calculateBodyHeight: function() {
        let grid = this.superview;
        let title = grid.title;
        let search = grid.search;
        let tool = grid.tool;
        let titleHeight = 0, searchHeight = 0, toolHeight = 0, paginationHeight = 0;
        if(title) {
            titleHeight = title.el.clientHeight;
        }
        if(search) {
            searchHeight = search.el.clientHeight;
        }
        if(tool) {
            toolHeight = tool.el.clientHeight;
        }
        let tableHeadHeight = this.head.el.clientHeight;
        if(this.pagination){
            paginationHeight = this.pagination.el.clientHeight;
        }
        let total = titleHeight + searchHeight + toolHeight + tableHeadHeight + paginationHeight;
        let tableBodyHeight = grid.el.clientHeight - total;
        this.$('tbody').height(tableBodyHeight);
    },

    /**
     * 表格checkbox类型为radio时，有且只能选中一条记录
     * @param row 被选中的行
     */
    setSingleCheckItem: function(row) {
        if (this.singleCheckedItem === row) {
            return;
        }
        this.singleCheckedItem && this.singleCheckedItem.checkedItem(false);
        this.singleCheckedItem = row;
    },

    /**
     * 创建表格的分页控件
     * @param pageInfo 分页信息，包含当前页数（pageIndex），每页显示记录数（pageSize），总页数（pageCount），总记录数（totalCount）
     */
    pageRender: function(pageInfo) {
        if (this.page.enable) {
            this.pagination = Pagination.new(pageInfo);
            this.addView(this.pagination);
            this.listenTo(this.pagination, this.pagination.PAGE_INDEX_CHANGE, this.pageIndexChange);
            this.listenTo(this.pagination, this.pagination.PAGE_SIZE_CHANGE, this.pageSizeChange);
        }
    },

    /**
     * 当前页数改变时，重新创建表格
     * @param pageIndex 当前显示的页数
     */
    pageIndexChange: function(pageIndex) {
        if (this.page.pageIndex === pageIndex) {
            return;
        }
        this.page.pageIndex = pageIndex;
        this.refresh();
    },

    /**
     * 每页显示记录数改变时，重新创建表格
     * @param pageSize 当前的每页显示记录数
     */
    pageSizeChange: function(pageSize) {
        this.destroyPagination();
        this.page.pageIndex = 1;
        this.page.pageSize = pageSize;
        this.refresh(this.pageRender.bind(this));
    },

    /**
     * 重新创建表格
     * @param pageHandler 创建表格后的自定义处理
     */
    refresh: function(pageHandler) {
        _.each(this.rowList, function(view) {
            view.destroy();
        });
        this.rowList.length = 0;
        this.head.setCheckStatus(false);
        this.head.removeSortInfo();
        this.singleCheckedItem = null;
        this.loadData(pageHandler);
    },

    /**
     * 获取当前所有选中的行数
     * @returns {Array}
     */
    getCheckedItemList: function() {
        return _.filter(this.rowList, function(row) {
            return row.isSelected === true;
        });
    },

    /**
     * 表格排序
     * @param field 排序的字段名称
     * @param sort 排序规则
     */
    sortRow: function(field, sort) {
        _.each(this.rowList, function(view) {
            view.destroy();
        });
        this.rowList.length = 0;
        this.head.setCheckStatus(false);
        this.singleCheckedItem = null;
        this.dataSet = _.orderBy(this.dataSet, [field], [sort]);
        this.createBody();
    },

    /**
     * 销毁分页
     */
    destroyPagination: function() {
        this.pagination && this.pagination.destroy();
        this.pagination = null;
    }
});