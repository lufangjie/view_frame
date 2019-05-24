'use strict';

import _ from 'lodash';
import extend from '@lib/js/utils/extend';
import Events from '@lib/js/event/Events';

let EndPoint = function() {};
EndPoint.prototype = {};

_.extend(EndPoint.prototype, Events);

EndPoint.extend = extend;

export default EndPoint;