"use strict";

require.config({
    shim: {
        'jquery.routes': {
            deps: [ 'jquery' ]
        },

        'jquery.model': {
            deps: [ 'jquery' ]
        },

        'RubberDuck': {
            requires: [ 'jquery',
                        'jquery.routes',
                        'jquery.model',
                        'Hanblebars' ],

            exports: 'RubberDuck'
        },
    },

    paths: {
        'QUnit': 'libs/qunit',
        'jquery': 'libs/jquery',
        'jquery.model': 'libs/jquery.model',
        'jquery.routes': 'libs/jquery.routes',
        'Handlebars': 'libs/handlebars',
        'RubberDuck': '../src/rubberduck'
    }

});

// require the unit tests.
require(
    [ 'jquery',
      'jquery.model',
      'jquery.routes',
      'Handlebars',
      'RubberDuck' ],

    function(jquery, models, routes,
             Handlebars, RubberDuck) {
        window['RubberDuck'] = RubberDuck;
        //run the tests in the desired order :)
        require(['basic'], function(basic) {
            QUnit.start();
            basic.run();
        });
    }
);
