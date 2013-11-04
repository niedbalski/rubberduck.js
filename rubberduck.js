//
// R framework a minimal mvc framework to
// solve common javascript problems
//
// @author: Jorge Niedbalski R. <jnr@niedbalski.org>
// @license: MIT
//

(function() {
    RubberDuck = {};
    RubberDuck.app = function(options) {
        $.extend(this, $.Deferred(), options || {});

        // By default RD will not load libraries from application/libs,
        // if you want to enable this use loadLibraries: true
        // in your application settings
        if ( typeof this.loadLibraries == 'undefined' )
            this.loadLibraries = false;

        requirejs.config(
            $.extend({}, {
                baseUrl: (typeof this.path != 'undefined') ? this.path : 'app/'
            }, this.getLibraries()));

        this.loadLibrariesAndControllers();
        return this;
    }

    RubberDuck.app.prototype.cache = {};
    RubberDuck.app.prototype.getLibraries = function() {
        var self = this;
        return ( self.loadLibraries ) ?
            $.extend({}, {
                paths: {
                    'jquery.routes': 'lib/jquery.routes',
                    'handlebars': 'lib/handlebars'
                },
                shim: {
                    'jquery.routes' : {
                        exports: 'jQuery.fn.routes'
                    },
                    'handlebars' : {
                        exports: 'Handlebars'
                    }
                }}) : {};
    }

    RubberDuck.app.prototype.loadLibrariesAndControllers = function() {
        var self = this;
        return ( self.loadLibraries ) ?
            require(["jquery.routes", "handlebars"], function(routes, handlebars) {
                self.loadControllers();
            }, function(e) {
                console.log(e);
                return self.reject(e.message);
            }) : self.loadControllers();
    }

    RubberDuck.app.prototype.loadControllers = function() {
        var self = this;
        self.loaded = {};
        $.each(self.controllers, function(i, controller) {
            self.loadController(controller).done(function(controller) {
                self.loaded[controller.name] = controller;
                if ( i == self.controllers.length - 1 )
                    return self.resolve(self);
            }).fail(function(e) {
                return self.reject(e);
            });
        });
    }

    RubberDuck.app.prototype.isLoaded = function() {
        return ( typeof this.loaded != 'undefined' &&
                 Object.keys(this.loaded).length > 0)
    }

    RubberDuck.app.prototype.run = function() {
        if (!this.isLoaded())
            return console.warn('Cueek, load the application before invoke run!');

        $.each(this.loaded, function(i, controller) {
            if ( $.isFunction(controller.init) )
                controller.init();

            if ( controller.hasViews() ) {
                $.each(controller.loaded, function(i, view) {
                    if ( $.isFunction(view.init) )
                        view.init();
                });
            }

            if ( controller.hasRoutes() )
                controller.loadRoutes();
        });

        $.routes.load(location.hash);
    }

    RubberDuck.app.prototype.hasControllers = function() {
        return ( typeof this.controllers != 'undefined' &&
                 this.controllers.length > 0);
    }

    RubberDuck.app.prototype.getController = function(name) {
        return this.loaded[name];
    }

    RubberDuck.app.prototype.loadController = function(controller) {
        var self = this;

        return $.Deferred(function(d) {
            require(['controllers/' + controller], function(c) {
                controller = $.extend(c, new RubberDuck.app.controller(self));
                $.each(controller.views, function(i, view) {
                    controller.loaded = {};
                    controller.loadView(view).done(function(view) {
                        controller.loaded[controller.views[i]] = view;
                        if (i == controller.views.length - 1)
                            return d.resolve(controller);
                    });
                });
            });

        }).promise();
    }

    RubberDuck.app.controller = function(app) {
        this.app = app;
        return this;
    }

    RubberDuck.app.controller.prototype.loadView = function(viewName) {
        var self = this;
        return $.Deferred(function(d) {
            require(['views/' + viewName], function(v) {
                d.resolve($.extend(v, new RubberDuck.app.view(self)));
            });
        }).promise();
    }

    RubberDuck.app.controller.prototype.getView = function(name) {
        return this.loaded[name];
    }

    RubberDuck.app.controller.prototype.hasRoutes = function() {
        var self = this;
        var routes = self.routes();
        return ( typeof routes != 'undefined' &&
                 Object.keys(routes).length > 0);
    }

    RubberDuck.app.controller.prototype.hasViews = function() {
        return ( typeof this.loaded != 'undefined' &&
                 this.loaded.length > 0 );
    }

    RubberDuck.app.controller.prototype.loadRoutes = function() {
        var self = this;
        var routes = self.routes();
        Object.keys(routes).forEach(function(r) {
            $.routes.add(r, routes[r], self);
        });
    }

    RubberDuck.app.view = function(controller, options) {
        $.extend(this, options || {});
        this.controller = controller;
        return this;
    }

    RubberDuck.app.view.prototype.cache = {};
    RubberDuck.app.template = function(view, data) {
        if ( typeof view != 'undefined' )
            this.view = view;

        if ( typeof data != 'undefined' ) {
            this._data = data;
            this.tpl = Handlebars.compile(this._data);
        }
        return this;
    }

    RubberDuck.app.template.prototype.load = function(name) {
        var self = this;
        self.defaultTemplatePath = 'views/templates';

        return $.Deferred(function(d) {
            if ( typeof self.view == 'undefined' ) {
                templatePath = self.defaultTemplatePath;
            } else {
                if ( typeof self.view.templatePath != 'undefined' ) {
                    templatePath = self.view.templatePath;
                } else if ( typeof self.view.controller.app.path != 'undefined' ) {
                        templatePath = self.view.controller.app.path + 'views/templates';
                } else {
                    console.warn('Not defined template path, using default location %s',
                                 self.defaultTemplatePath);
                    templatePath = self.defaultTemplatePath;
                }
            }

            templatePath = templatePath + '/' + name + '.html';

            if(self.view.cache.hasOwnProperty(templatePath)) {
                console.debug('Loading template from cache: ' + templatePath);
                self.tpl = self.view.cache[templatePath];
                d.resolve(self);
            } else {
                console.debug('Loading template from url: ' + templatePath);
                $.get(templatePath).done(function(data) {
                    self.view.cache[templatePath] = Handlebars.compile(data);
                    self.tpl = self.view.cache[templatePath];
                    d.resolve(self);
                });
            }

        }).promise();
    }

    RubberDuck.app.template.prototype.render = function(data) {
        var rendered = this.tpl(data);
        return ( typeof this.view != 'undefined' && typeof this.view.el != 'undefined') ?
            $(this.view.el).html(rendered) : rendered;
    }

    //ready to rock and cuek
    return RubberDuck;
})();
