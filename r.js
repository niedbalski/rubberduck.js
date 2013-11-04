//
// R framework a minimal mvc framework to
// solve common javascript problems
//
// @author: Jorge Niedbalski R. <jnr@niedbalski.org>
// @license: MIT
//

(function() {
    r = {};
    r.app = function(options) {
        $.extend(this, $.Deferred(), options || {});

        //by default load libraries from application/lib/, if
        // you want to include your own library versions use: loadLibraries: false
        // in your application configuration
        if ( typeof this.loadLibraries == 'undefined' )
            this.loadLibraries = true;

        requirejs.config(
            $.extend({}, {
                baseUrl: (typeof this.path != 'undefined') ? this.path : 'app/'
            }, this.getLibraries()));

        this.loadLibrariesAndControllers();
        return this;
    }

    r.app.prototype.getLibraries = function() {
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

    r.app.prototype.loadLibrariesAndControllers = function() {
        var self = this;
        return ( self.loadLibraries ) ?
            require(["jquery.routes", "handlebars"], function(routes, handlebars) {
                self.loadControllers();
            }, function(e) {
                return self.reject(e.message);
            }) : self.loadControllers();
    }

    r.app.prototype.loadControllers = function() {
        var self = this;
        self.loaded = {};
        $.each(self.controllers, function(i, controller) {
            self.loadController(controller).done(function(controller) {
                self.loaded[controller.name] = controller;
                if ( i == self.controllers.length - 1 )
                    return self.resolve(self);
            });
        });
    }

    r.app.prototype.isLoaded = function() {
        return ( typeof this.loaded != 'undefined' &&
                 Object.keys(this.loaded).length > 0)
    }

    r.app.prototype.run = function() {
        if ( ! this.isLoaded() ) {
            console.warn('Application is not loaded');
            return;
        }

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

    r.app.prototype.hasControllers = function() {
        return ( typeof this.controllers != 'undefined' &&
                 this.controllers.length > 0);
    }

    r.app.prototype.getController = function(name) {
        return this.loaded[name];
    }

    r.app.prototype.loadController = function(controller) {
        var self = this;

        return $.Deferred(function(d) {
            require(['controllers/' + controller], function(c) {
                controller = $.extend(c, new r.app.controller(self));
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

    r.app.controller = function(app) {
        this.app = app;
        return this;
    }

    r.app.controller.prototype.loadView = function(viewName) {
        var self = this;
        return $.Deferred(function(d) {
            require(['views/' + viewName], function(v) {
                d.resolve($.extend(v, new r.app.view(self)));
            });
        }).promise();
    }

    r.app.controller.prototype.getView = function(name) {
        return this.loaded[name];
    }

    r.app.controller.prototype.hasRoutes = function() {
        var self = this;
        var routes = self.routes();

        return ( typeof routes != 'undefined' &&
                 Object.keys(routes).length > 0);
    }

    r.app.controller.prototype.hasViews = function() {
        return ( typeof this.loaded != 'undefined' &&
                 this.loaded.length > 0 );
    }

    r.app.controller.prototype.loadRoutes = function() {
        var self = this;
        var routes = self.routes();
        Object.keys(routes).forEach(function(r) {
            $.routes.add(r, routes[r], self);
        });
    }

    r.app.view = function(controller, options) {
        $.extend(this, options || {});
        this.controller = controller;
        return this;
    }

    r.app.template = function(view, data) {
        if ( typeof view != 'undefined' )
            this.view = view;

        if ( typeof data != 'undefined' ) {
            this._data = data;
            this.tpl = Handlebars.compile(this._data);
        }

        return this;
    }

    r.app.template.prototype.load = function(name) {
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

            console.debug('Loading template ' + templatePath);
            $.get(templatePath, function(data) {
                self.tpl = Handlebars.compile(data);
                d.resolve(self);
            });

        }).promise();
    }

    r.app.template.prototype.render = function(data) {
        var rendered = this.tpl(data);
        return ( typeof this.view != 'undefined' && typeof this.view.el != 'undefined') ?
            $(this.view.el).html(rendered) : rendered;
    }

    return r;

})();
