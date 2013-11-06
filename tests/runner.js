"use strict";

require.config({
    shim: {
       'RubberDuck': {
           requires: [ 'jquery' ],
           exports: 'RubberDuck'
       }
    },

    paths: {
        'QUnit': 'libs/qunit',
        'jquery': 'libs/jquery',
        'RubberDuck': '../src/rubberduck'
    }

});

// require the unit tests.
require(
    ['jquery', 'RubberDuck'],
    function(jquery, RubberDuck) {
        //run the tests in the desired order :)
        require(['basic'], function(basic) {
            QUnit.start();
            basic.run();
        });
    }
);
