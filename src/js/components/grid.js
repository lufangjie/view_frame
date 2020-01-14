import _ from 'lodash';
import Base from '@lib/js/ui/view/WrapView';
import Elements from '@js/components/grid/elements';
import Table from '@js/components/grid/table';

let _createElement = function(item) {
    let element;
    switch (item.type) {
        case Elements.TYPE.TITLE:
            element = Elements.Title.new(item);
            break;
        case Elements.TYPE.LABEL:
            element = Elements.Label.new(item);
            break;
        case Elements.TYPE.INPUT:
            element = Elements.Input.new(item);
            break;
        case Elements.TYPE.SELECT:
            element = Elements.Select.new(item);
            break;
        case Elements.TYPE.BUTTON:
        case Elements.TYPE.SUBMIT:
            element = Elements.Button.new(item);
            break;
        default:
            break;
    }
    return element;
};

let Search = Base.extend({
    className: 'grid_search',
    template: '<div class="table_search_item_container"></div>',
    init: function(options) {
        this.itemList = options.itemList || [];
        this.wrapper = options.wrapper;
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        let $context = this.$context;
        let context = this.context;
        this.$context = this.$('.table_search_item_container');
        _.each(this.itemList, function(item) {
            item.wrapper = this.wrapper;
            this.addView(_createElement(item));
        }.bind(this));
        this.$context = $context;
        this.context = context;
    },

    getValues: function() {
        let data = [];
        _.each(this.subviews, function(view) {
            view.value && data.push(view.value());
        });
        return data;
    }

}, { klass: 'SearchView' });

let Tools = Base.extend({
    className: 'grid_tools',
    init: function(options) {
        this.itemList = options.itemList || [];
        this.wrapper = options.wrapper;
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        _.each(this.itemList, function(item) {
            item.wrapper = this.wrapper;
            this.addView(_createElement(item));
        }.bind(this));
    },

    getValues: function() {
        let data = [];
        _.each(this.subviews, function(view) {
            view.value && data.push(view.value());
        });
        return data;
    }
}, { klass: 'ToolView' });

let Grid = Base.extend({
    className: 'customize_table form-inline detach_box',
    // 默认的分页属性
    default_page: { enable: true, pageIndex: 1, pageSize: 15 },
    default_options: {
        title: '',
        dataSet: null,
        params: {}
    },
    init: function(options) {
        this.options = _.extend({}, this.default_options, options);
        this.id = (options.id ? (options.id + '_') : '') + 'grid_container';
        _.extend(this, _.pick(this.options || {}, ['classNames', 'params']));
        this.page = _.extend({}, this.default_page, this.options.page || {});
        Base.prototype.init.call(this, options);
        return this;
    },

    didRender: function() {
        this.renderTitle();
        this.renderSearch();
        this.renderTools();
        this.renderTable();
    },

    /**
     * 创建标题
     */
    renderTitle: function() {
        if (this.options.title) {
            this.title = _createElement({
                type: 'title',
                title: this.options.title,
                className: 'grid_title'
            });
            this.addView(this.title);
        }
    },

    /**
     * 创建Search区域
     */
    renderSearch: function() {
        if (!this.options.searches || this.options.searches.length < 1) {
            return;
        }
        this.search = Search.new({
            itemList: this.options.searches,
            wrapper: this
        });
        this.addView(this.search);
    },

    /**
     * 创建Tool区域
     */
    renderTools: function() {
        if (!this.options.tools || this.options.tools.length < 1) {
            return;
        }
        this.tool = Tools.new({
            itemList: this.options.tools,
            wrapper: this
        });
        this.addView(this.tool);
    },

    /**
     * 创建表格
     */
    renderTable: function() {
        let options = this.options;
        let params = _.extend({}, options.params, this.getSearchParams());
        this.table = Table.new({
            id: (options.id ? (options.id + '_') : '') + 'table_container',
            columns: options.columns,
            dataSet: options.dataSet,
            endPoint: options.endPoint,
            remoteMethod: options.remoteMethod,
            params: params,
            page: this.page,
            defaultValue: options.defaultValue || null,
            wrapper: this
        });
        this.addView(this.table);
    },

    /**
     * 获取当前所有选中的记录
     * @returns {*|Array}
     */
    getCheckedItemList: function() {
        return this.table.getCheckedItemList();
    },

    /**
     * 获取所有Search和Tool区域的查询条件
     */
    getSearchParams: function() {
        let searchParams = this.search ? this.search.getValues() : [];
        let toolParams = this.tool ? this.tool.getValues() : [];
        let paramsList = _.concat(searchParams, toolParams);
        let params = {};
        _.each(paramsList, function(param) {
            param.key && (params[param.key] = param.value);
        });
        return params;
    },

    /**
     * 获取当前Search和Tool区域的查询条件，重新生成表格
     */
    reload: function() {
        this.page = _.extend({}, this.default_page, this.options.page);
        this.table && this.table.destroy();
        this.pagination && this.pagination.destroy();
        this.table = null;
        this.pagination = null;
        this.renderTable();
    },

    /**
     * 刷新表格
     */
    refresh: function() {
        this.table && this.table.refresh();
    }

}, { klass: 'TableView' });

/**
 * 实例化Grid
 * let grid = Grid.new(options);
 ************************* options配置 ***********************
 *   属性名称       类型          说明
 *   id             String        Gird的ID
 *   title          String        设置grid的标题
 *   endPoint       String        对应的模块名称
 *   remoteMethod   String        请求的方法的名称
 *   params         Object        从服务端获取API时的参数
 *   searches       Array         grid检索区域配置信息
 *   tools          Array         grid工具栏区域配置信息
 *   columns        Array         grid数据行配置信息
 *   page           Object        grid的分页配置
 *                                           {
 *                                              pageEnable: Boolean 是否分页，默认值：true
 *                                              pageSize：int          每页显示记录数，默认值：10
 *                                              pageIndex：int         当前页数，默认值：1
 *                                            }
 *   dataSet        Array         表格的数据列表
 ************************* options配置 ***********************
 ************************* searches和tools配置 ***********************
 *   属性名称       类型                    说明                                                          对应的控件类型
 *   type           String                  控件类型，包括label，title，button，submit，select，input     所有
 *   id             String                  控件ID                                                        所有
 *   classNames     Array                   css样式的class名称                                            所有
 *   template       String                  自定义的模板，必须配置model属性一起使用                       title
 *   model          Object                  绑定到自定义模板内的数据模型                                  title
 *   placeholder    String                  文本框的placeholder属性                                       input
 *   text           String                  显示的文字                                                    button,submit
 *   optionsList    Array                   下拉框的option数据List                                        select
 *                                           <option value="obj.value">obj.text</option>
 *   currentValue   String                  下拉框当前选中的值                                            select
 *   remote         Object                  从服务端获取数据配置                                          select
 *                                               {
 *                                                   enable: boolean 是否从服务端获取数据
 *                                                   url: String     服务端url
 *                                                   data: Object    服务端请求的参数对象
 *                                               }
 *    onClick       Function(grid)          控件的click事件                                              button，submit
 *    onChange      Function(view, grid)    控件的change事件                                             input, select
 *    formatter     Function(optionsList)   格式化optionsList的函数                                      select
 ************************* searches和tools配置 ***********************
 ************************* columns配置 ***********************
 *       属性名称      类型                    说明
 *       type          String                  单元格的类型，包括check，radio，text，link，action
 *       text          String                  表头的标题栏显示的文字
 *       name          String                  获取数据时对应的Key
 *       classNames    Array                   css样式
 *       sort          Boolean                 点击表头时，是否可以根据当前列队表格进行排序，默认false
 *       onClick       Function(data, row)     自定义的点击事件
 *       onChecked     Function(data, row)     当前行是否选中的自定义函数，返回true时，当前行选中，false则不选中
 *       formatter     Function(value, row)    自定义的格式化值的函数
 *       items         Array                   type=action时显示的自定义操作对象
 *                                                  {
 *                                                      text: String 显示的名称
 *                                                      onClick：Function(data, row) 点击事件
 *                                                   }
 ************************* columns配置 ***********************
 *    var grid = Grid.new({
 *       title: '测试GridView',
 *       endPoint: 'system',
 *       remoteMethod: 'userList',
 *       searches: [
 *       {
 *       type: 'input', id: 'name', placeholder: '请输入名称', onChange: function (view, grid) {
 *                  console.log(view);
 *         console.log(view.value());
 *         console.log(grid);
 *       }
 *       },
 *       {
 *         type: 'select',
 *         id: 'my_category',
 *         remote: {url: '/xx/xx'},
 *         onChange: function (view, grid) {
 *           console.log(view.value());
 *         },
 *         formatter: function (list) {
 *           return list.map(function (item) {
 *               return {value: item.id, text: item.name};
 *           });
 *         }
 *       }
 *       ],
 *       tools: [
 *       {
 *        type: 'button',text: '按钮', classNames: ['float-left'], onClick: function (grid) {
 *          console.log(grid.getCheckedItemList());
 *        }
 *        },
 *       {
 *        type: 'button', text: '刷新', classNames: ['float-right'], onClick: function(grid){
 *          grid.refresh();
 *        }
 *           },
 *      {
 *        type: 'button', text: '重载', classNames: ['float-right'], onClick: function(grid){
 *          grid.reload();
 *        }
 *       },
 *       {
 *        type: 'input', id: 'role', classNames: ['float-right']
 *       }
 *       ],
 *       columns: [
 *        {type: 'check'},
 *        {type: 'text', text: '角色编码', name: 'code', sort: true},
 *        {type: 'text', text: '角色名称', name: 'name', sort: true},
 *        {type: 'action',
 *                  items: [
 *                {text: '编辑', onClick: function(model, row){
 *                   console.log(model);
 *                   console.log(row);
 *                }},
 *                {text: '详情', onClick: function(model, row){
 *                    console.log(model);
 *                    console.log(row);
 *                }}
 *                ]
 *         }
 *       ]
 *    });
 *
 */
export default Grid;