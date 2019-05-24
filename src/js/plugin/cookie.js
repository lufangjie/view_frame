'use strict';

import Cookie from 'js-cookie';

let _get = function(name){
    return Cookie.get(name) || '';
};

let _set = function(name, value){
    Cookie.set(name, value);
};

let _remove = function(name){
    Cookie.remove(name);
};

export default {
    ACCOUNT : 'ocn_dump_account',
    PASSWORD : 'ocn_dump_password',
    REMEMBER :  'ocn_dmp_remember',
    TOKEN : 'ocn_dump_token',

    getToken: function(){
        return _get(this.TOKEN);
    },

    setToken: function(token){
        _set(this.TOKEN, token);
    },

    get: function(name){
        return _get(name);
    },

    set: function(name, value){
        _set(name, value);
    },

    remove: function(name){
        _remove(name);
    }
};