
Build Status: [![Build Status](https://travis-ci.org/niedbalski/rubberduck.js.png?branch=master)](https://travis-ci.org/niedbalski/rubberduck.js)

RubberDuck.js
=============

![](img/rubber.jpg?raw=true)

*RubberDuck.js* is a pretty minimal(minified 7KB) framework written to build simple
single page applications quickly.

*RubberDuck.js* core is on written top of other open-source javascript libraries
and some other hacks to make it works easily without the mess of other javascript
frameworks.

# Software dependencies

Currently rubberduck is distributed as a [Single minified file](../blob/master/releases).

The initial dependencies that are required by default are [RequireJS](https://github.com/jrburke/requirejs "RequireJS") and [jQuery](https://github.com/jquery/jquery)

Then the following is the list of dependencies:

* [jQuery JavaScript Library (tested with: v2.0.3) ](https://github.com/jquery/jquery 'jQuery')
* [jQuery routes plugin](https://github.com/thorsteinsson/jquery-routes 'jquery-routes')
* [jQuery models plugin](http://v3.javascriptmvc.com/jquery/dist/jquery.model.js 'jquery-model')
* [Handlebars js](https://github.com/wycats/handlebars.js/ 'HandlebarsJS')

If you want to do a quick hack using *RubberDuck.js* you can pass the *loadLibraries:true* option when you initialize your application, and the framework will try to load dependencies from the libs/ path inside your application directory.

If you aren't going to use the *loadLibraries* option , then is highly recommended to use
the following [RequireJS](https://github.com/jrburke/requirejs "RequireJS") sequence.

```javascript
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

            var app = new RubberDuck.app({
                path: 'app/',
                name: 'test',
                controllers: [ 'test' ],
                models: [ 'test' ]
            });

          //Rest of your application code

    }
);
```
