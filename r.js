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
        $.extend(this, options || {});
        var self = this;

        requirejs.config({
            baseUrl: (typeof options.path != "undefined" ) ?
                options.path : "app/"
        });

        return $.Deferred(function(d) {
            self.loaded = {};
            $.each(self.controllers, function(i, controller) {
                self._load(controller).done(function(controller) {
                    self.loaded[controller.name] = controller;
                    if ( i == self.controllers.length - 1 )
                        return d.resolve(self);
                });
            });
        }).promise();
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
                controller._loadRoutes();
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

    r.app.prototype._load = function(controller) {
        var self = this;

        return $.Deferred(function(d) {
            require(['controllers/' + controller], function(c) {
                controller = $.extend(c, new r.app.controller(self));
                $.each(controller.views, function(i, view) {
                    controller.loaded = {};
                    controller._load(view).done(function(view) {
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

    r.app.controller.prototype._load = function(viewName) {
        self = this;
        return $.Deferred(function(d) {
            require(['views/' + viewName], function(v) {
                d.resolve($.extend(v, new r.app.view(self));
            });
        }).promise();
    }

    r.app.controller.prototype.getView = function(name) {
        return this.loaded[name];
    }

    r.app.controller.prototype.hasRoutes = function() {
        routes = self.routes()
        return ( typeof routes != 'undefined' &&
                 Object.keys(routes).length > 0);
    }

    r.app.controller.prototype.hasViews = function() {
        return ( typeof this.loaded != 'undefined' &&
                 this.loaded.length > 0 );
    }

    r.app.controller.prototype._loadRoutes = function() {
        self = this;
        routes = self.routes();
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
