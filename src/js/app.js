'use strict';

import Application from '@lib/js/ui/core/Application';
import Scalar from '@js/scalar/Scalar';
import Router from '@js/plugin/router';
import MainView from '@js/views/main';

export default Application.extend({
    run: function(options) {
        this.router = Router.initRouter();
        Application.prototype.run.apply(this, arguments);
    },

    didLaunch: function() {
        this.scalar = Scalar.init(this.config.scalar);
        this.initWebSocket();
        this.showMain();
    },

    handleEvent: function(event) {
        switch (event.type) {
            case 'hashchange':
                // TODO
                break;
            default:
                break;
        }
        return Application.prototype.handleEvent.apply(this, arguments);
    },

    initWebSocket: function() {
        // this.listenTo(Scalar.system.menu, Scalar.system.events.notifySystem.event, this.socketHandler);
        // Scalar.system.switchNotifications({
        //     reExecAfterReconnection: true,
        //     enable: [
        //         { name: 'notifySystem', version: '1.0' }
        //     ]
        // }).execute().then(function() {
        //     console.log('system websocket notifications enabled');
        //     console.log(arguments);
        // });
        Scalar.system.login({
            data: {
                account: 'admin',
                password: '123'
            }
        }).execute().then(function(response) {
            console.log(response.result);
        });
    },

    showMain: function() {
        this.main = MainView.new();
        this.window.addView(this.main);
    },

    socketHandler: function(result) {
        console.log('=========');
        console.log(result.response.data);
    }

});