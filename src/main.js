'use strict';

import './assets/style/viewport.less';
import Application from '@js/app';
import Base from '@js/config/base';

let Main = function(){
    $(function(){
        let config = Base.extend();
        Application.run({
            config: config
        });
    })
};
new Main();