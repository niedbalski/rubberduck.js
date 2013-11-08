"use strict";

require.config({
    shim: {
       'RubberDuck': {
           requires: [ 'Handlebars', 'jquery' ],
           exports: 'RubberDuck'
       }
    },

    paths: {
        'QUnit': 'libs/qunit',
        'jquery': 'libs/jquery',
        'Handlebars': 'libs/handlebars',
        'RubberDuck': '../src/rubberduck'
    }

});

// require the unit tests.
require(
    ['jquery', 'Handlebars', 'RubberDuck'],
    function(jquery, Handlebars, RubberDuck) {
        window['RubberDuck'] = RubberDuck;
        //run the tests in the desired order :)
        require(['basic'], function(basic) {
            QUnit.start();
            basic.run();
        });
    }
);
