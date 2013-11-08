//
// R framework a minimal mvc framework to
// solve common javascript problems
//
// @author: Jorge Niedbalski R. <jnr@niedbalski.org>
// @license: MIT
//


(define(function() {
    "use strict";

    var RubberDuck = {};

    RubberDuck.Exception = function(message) {
        this.message = message;
        console.debug('Raised exception: %s', this.message);
    },

    //@async
    RubberDuck.app = function(options) {
        $.extend(this, $.Deferred(), options || {});

        var self = this;

        // By default RD will not load libraries from application/libs,
        // if you want to enable this use loadLibraries: true
        // in your application settings
        if ( $.type(self.loadLibraries) === 'undefined' ) {
            self.loadLibraries = false;
        }

        requirejs.config(
            $.extend({}, {
                baseUrl: ( $.type(self.path) !== 'undefined') ? self.path : 'app/'
            }, (self.loadLibraries) ? self.getLibraries() : {}));

        self.requireLibraries().done(function() {
            self.loadApplication();
        }).fail(function(error) {
            return self.reject(self, error);
        });

        return this;
    };

    //@sync
    RubberDuck.app.prototype.cache = {};

    //@sync
    RubberDuck.app.prototype.getLibraries = function() {
        var self = this;
        return ( self.loadLibraries ) ?
            $.extend({}, {
                paths: {
                    'jquery.routes': 'lib/jquery.routes',
                    'jquery.model': 'lib/jquery.model.min',
                    'handlebars': 'lib/handlebars'
                },
                shim: {
                    'jquery.routes' : {
                        exports: 'jQuery.fn.routes'
                    },
                    'handlebars' : {
                        exports: 'Handlebars'
                    },
                    'model': {
                        exports: 'jQuery.fn.Model'
                    }
                }}) : {};
    };

    //@async
    RubberDuck.app.prototype.requireLibraries = function() {
        var self = this;
        return $.Deferred(function(deferred) {
            if ( !self.loadLibraries ) {
                return deferred.resolve();
            }

            require(["jquery.model",
                     "jquery.routes",
                     "handlebars"], function(models, routes, handlebars) {
                         return deferred.resolve(models, routes, handlebars);
                     }, function(e) {
                         return deferred.reject(e.message);
                     });

        }).promise();
    };

    //@async
    RubberDuck.app.prototype.loadApplication = function() {
        var self = this;
        var w = $.when(this.loadControllers(), this.loadModels());

        w.done(function(controllers, models) {
            return self.resolve(self, controllers, models);
        });

        w.fail(function(e) {
            return self.reject(self, e);
        });
    };

    //@async
    RubberDuck.app.prototype.loadModels = function() {
        var self = this;
        if ( self.hasModels() ) {
            return $.Deferred(function(deferred) {
                self.loadedModels = {};
                $.each(self.models, function(i, model) {
                    self.loadModel(model).done(function(model) {
                        self.loadedModels[model.name] = model;
                        if ( i === self.models.length - 1 ) {
                            return deferred.resolve(self.loadedModels);
                        }
                    }).fail(function(e) {
                        return deferred.reject(e);
                    });
                });
            });
        }
    };

    //@async
    RubberDuck.app.prototype.loadControllers = function() {
        var self = this;
        if ( self.hasControllers() ) {
            return $.Deferred(function(deferred) {
                self.loadedControllers = {};
                $.each(self.controllers, function(i, controller) {
                    self.loadController(controller).done(function(controller) {
                        self.loadedControllers[controller.name] = controller;
                        if ( i === self.controllers.length - 1 ) {
                            return deferred.resolve();
                        }
                    }).fail(function(e) {
                        return deferred.reject(e);
                    });
                }); //TODO: write a fallback
            });
        }
    };

    //@sync
    RubberDuck.app.prototype.isLoaded = function() {
        return ( $.type(this.loadedControllers) !== 'undefined' &&
                 Object.keys(this.loadedControllers).length > 0);
    };

    //@sync
    RubberDuck.app.prototype.run = function() {

        if (!this.isLoaded()) {
            console.warn('Cuuuuek, Load the application before invoke run method');
            return false;
        }

        $.each(this.loadedControllers, function(i, controller) {
            if ( $.isFunction(controller.init) ){
                controller.init();
            }

            if ( controller.hasViews() ) {
                $.each(controller.loaded, function(i, view) {
                    if ( $.isFunction(view.init) ) {
                        view.init();
                    }
                });
            }

            if ( controller.hasRoutes() ) {
                controller.loadRoutes();
            }

        });

        $.routes.load(location.hash);
    };

    //@sync
    RubberDuck.app.prototype.hasControllers = function() {
        return ( $.type(this.controllers) !== 'undefined' &&
                 this.controllers.length > 0);
    };

    //@sync
    RubberDuck.app.prototype.hasModels = function() {
        return ( $.type(this.models) !== 'undefined' &&
                 this.models.length > 0);
    };

    //@sync
    RubberDuck.app.prototype.getController = function(name) {
        return this.loadedController[name];
    };

    //@async
    RubberDuck.app.prototype.loadController = function(controller) {
        var self = this;

        return $.Deferred(function(deferred) {
            require(['controllers/' + controller], function(c) {
                controller = $.extend(c, new RubberDuck.app.controller(self));
                $.each(controller.views, function(i, view) {
                    controller.loadedViews = {};
                    controller.loadView(view).done(function(view) {
                        controller.loadedViews[controller.views[i]] = view;
                        if (i === controller.views.length - 1) {
                            return deferred.resolve(controller);
                        }
                    });
                });
            }, function(e) {
                return deferred.reject(e.message);
            });
        }).promise();
    };

    //@sync
    RubberDuck.app.prototype.getModel = function(name) {
        return ( $.type(this.loadedModels) !== 'undefined' &&
                 $.type(this.loadedModels[name]) !== 'undefined') ?
            this.loadedModels[name] : false;
    };

    //@async
    RubberDuck.app.prototype.loadModel = function(model) {
        var self = this;
        return $.Deferred(function(deferred) {
            require(['models/' + model ], function(m) {
                model = $.extend(m, new RubberDuck.app.model(self));
                self.loadedModels[m.name] = $.Model.extend(model.name, model);
                return deferred.resolve(self.loadedModels[m.name]);
            }, function(e) {
                return deferred.reject(e.message);
            });
        }).promise();
    };

    //@sync
    RubberDuck.app.model = function(app) {
        this.app = app;
        return this;
    };

    //@sync
    RubberDuck.app.controller = function(app) {
        this.app = app;
        return this;
    };

    //@async
    RubberDuck.app.controller.prototype.loadView = function(viewName) {
        var self = this;
        return $.Deferred(function(deferred) {
            require(['views/' + viewName], function(v) {
                deferred.resolve($.extend(v, new RubberDuck.app.view(self)));
            });
        }).promise();
    };

    //@sync
    RubberDuck.app.controller.prototype.getView = function(name) {
        return ( $.type(this.loadedViews) !== 'undefined' &&
            $.type(this.loadedViews[name]) !== 'undefined') ?
            this.loadedViews[name] : false;
    };

    //@sync
    RubberDuck.app.controller.prototype.hasRoutes = function() {
        var self = this;
        if ( $.type(self.routes) !== 'function' ) {
            return false;
        }
        var routes = self.routes();
        return ( $.type(routes) !== 'undefined' &&
                 Object.keys(routes).length > 0 );
    };

    //@sync
    RubberDuck.app.controller.prototype.hasViews = function() {
        return ( $.type(this.loadedViews) !== 'undefined' &&
                 this.loadedViews.length > 0 );
    };

    //@sync
    RubberDuck.app.controller.prototype.loadRoutes = function() {
        var self = this;
        if ( $.type(self.routes) !== 'function' ) {
            return false;
        }
        var routes = self.routes();
        Object.keys(routes).forEach(function(r) {
            $.routes.add(r, routes[r], self);
        });
    };

     //@sync
    RubberDuck.app.view = function(controller, options) {
        $.extend(this, options || {});
        this.controller = controller;
        return this;
    };

    //@sync
    RubberDuck.app.view.prototype.cache = {};

    //@sync
    RubberDuck.app.template = function(view, data) {

        if ( $.type(view) !== 'undefined' ) {
            this.view = view;
        }

        if ( $.type(data) !== 'undefined' ) {
            this.data = data;
            try {
                this.tpl = Handlebars.compile(this.data);
            } catch(e) {
                throw new RubberDuck.Exception('Error trying to compile template: ' +
                                               e.message);
            }
        }
        return this;
    };

    //@async
    RubberDuck.app.template.prototype.load = function(name) {
        var self = this;
        var templatePath = "";

        self.defaultTemplatePath = 'views/templates';

        return $.Deferred(function(deferred) {
            if ( $.type(self.view) === 'undefined' ) {
                templatePath = self.defaultTemplatePath;
            } else {
                if ( $.type(self.view.templatePath) !== 'undefined' ) {
                    templatePath = self.view.templatePath;
                } else if ( $.type(self.view.controller.app.path) !== 'undefined' ) {
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
                deferred.resolve(self);
            } else {
                console.debug('Loading template from url: ' + templatePath);
                $.get(templatePath).done(function(data) {
                    self.view.cache[templatePath] = Handlebars.compile(data);
                    self.tpl = self.view.cache[templatePath];
                    deferred.resolve(self);
                });
            }

        }).promise();
    };

    //@sync
    RubberDuck.app.template.prototype.render = function(data) {
        var rendered = this.tpl(data);
        if ( $.type(this.view) !== 'undefined' &&
             $.type(this.view.el) !== 'undefined' ) {
            return $(this.view.el).html(rendered);
        }

        return rendered;
    };

    return RubberDuck;

}));
