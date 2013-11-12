Build Status: [![Build Status](https://travis-ci.org/niedbalski/rubberduck.js.png?branch=master)](https://travis-ci.org/niedbalski/rubberduck.js)

RubberDuck.js
=============

![](img/rubber.jpg?raw=true)

*RubberDuck.js* is a pretty minimal(minified 7KB) framework written to build simple
single page applications quickly.

*RubberDuck.js* core uses other open-source javascript libraries (Check `dependencies`)

# Hello world with *RubberDuck.js*

Here we are showing how to create a simple 'Hello World' application
using *RubberDuck.js* Framework. You can also take a look to the [Examples](../master/examples) directory.

## Creating your application

First you will need to create an `app/` directory to store your application
skeleton.

```javascript

require(
    [ 'jquery',
      'jquery.model',
      'jquery.routes',
      'Handlebars',
      'RubberDuck' ],
      

    function(...) {

            //After loading the dependencies, create a new application
            var app = new RubberDuck.app({
                path: 'app/',
                name: 'test',
                controllers: [ 'test' ],
                models: [ 'test' ]
            });

           app.done(function(app) {
               //Application is ready !
               app.run();
           });
           
           app.fail(function(app, error) {
                $('body').append(error);
           });
           
    }
);

```
### Defining the `test` controller

You must create a `test.js` file inside `app/controllers/` directory following the
[Requirejs module definition](http://requirejs.org/docs/api.html#funcmodule).

```javascript

define(function() {
    var c = {}
    
    //name is a mandatory attribute, don't forget this.
    c.name = 'test';
    c.views = [ 'test' ];

    //routes must be a function returning a dict of 
    //(route, function). See https://github.com/thorsteinsson/jquery-routes/blob/master/jquery.routes.js
    //for other supported parameters.
    c.routes = function() {
        return {
            '/hello/{name:string}': this.helloWorld
        }
    };

    //Init method is called when you execute ``app.run``
    c.init = function() {
        console.log('Initialized %s controller', this.name);
    }

    //Hello world function will be called then /hello/name is called
    c.helloWorld = function() {
        return this.getView('test').render(this.name);
    }

    return c;
});
```

### Defining the `test` view

You must create a `test.js` file inside the `app/views` directory.

```javascript
define(function() {
    var v = {};

    v.el = '#test'; //jquery selector to append on template render
    
    //The render function uses a ```RubberDuck.app.template```
    v.render = function(test_id) {
        new RubberDuck.app.template(this).load('test')
            .done(function(tpl) {
                return tpl.render({
                    test_id: test_id
                });
        });
    }

    return v;
});
```

### Defining the `test` template

You must create a `test.js` file inside the `app/views/templates` directory. 
This template file uses the [Handlebars expressions](http://handlebarsjs.com/expressions.html)

```html
<h1> Hello {{ name }}</h1>
```


### Defining a `test` model.

You must create a `test.js` file inside the `app/models/` directory.
This mode file uses the [jQuery model layer](http://bitovi.com/blog/2010/10/jquery-model-a-jquery-model-layer.html) filter
and routines specification.

```javascript
define(function() {
   var m = {};

   m.attributes = {
       birthday : 'date'
   };

   m.name = 'test';
   return m;
});
```

# Development rules

1. A [jshint](../master/.jshint) configuration is used to ensure code mets the 'strict' standard. 
2. A [Travis build](https://travis-ci.org/niedbalski/rubberduck.js) is already configured to run the tests. Before to do a pull request, be sure to run ``grunt tests`` and check if all
the tests are passing OK.

# Software dependencies

Currently *RubberDuck.js* is distributed as a [Single minified file](../master/releases).

The initial dependencies that are required by default are [RequireJS](https://github.com/jrburke/requirejs "RequireJS") and [jQuery](https://github.com/jquery/jquery)

List of dependencies:

* [jQuery JavaScript Library (tested with: v2.0.3) ](https://github.com/jquery/jquery 'jQuery')
* [jQuery routes plugin](https://github.com/thorsteinsson/jquery-routes 'jquery-routes')
* [jQuery models plugin](http://v3.javascriptmvc.com/jquery/dist/jquery.model.js 'jquery-model')
* [Handlebars js](https://github.com/wycats/handlebars.js/ 'HandlebarsJS')

If you want to do a quick hack using *RubberDuck.js* you can pass the *loadLibraries:true* 
option when you initialize your application, and the framework will try to load dependencies 
from the libs/ path inside your application directory.

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
