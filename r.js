// R framework a minimal mvc framework to
// solve common javascript problems
//
// @author: Jorge Niedbalski R. <jnr@niedbalski.org>
// @license: MIT
(function() {
    r = {};
    r.app = function(options) {
        $.extend(this, $.Deferred(), options || {});
        var self = this;

        requirejs.config({
            baseUrl: (typeof options.path != "undefined" ) ?
                options.path : "/"
        });

        var w = $.when(this.loadControllers());
        w.done(function(controllers) {
            r.app.controllers = controllers;
            self.resolve(self);
        });

        w.fail(function(e) {
            self.reject(self, e);
        });

        return this;
    }

    r.app.prototype.loaded = {};
    r.app.prototype.run = function() {
        console.debug('Initializing \"%s\" application', this.name);

        $.each(this.loaded, function(index, controller) {
            if ( $.isFunction(controller.init) )
                controller.init();

            if ( controller.hasViews() ) {
                $.each(controller.views, function(i, view) {
                    if ( $.isFunction(view.init) )
                        view.init();
                });
            }
            console.debug('Initialized %s controller', controller.name);
        });

        console.debug('Application %s ready', this.name);

        $.routes.load(location.hash);
    }

    r.app.prototype.route = function(route, cb) {
        $.routes.add(route, cb);
    }

    r.app.prototype.hasControllers = function() {
        return ( typeof this.controllers != 'undefined' &&
                 this.controllers.length > 0);
    }

    r.app.prototype._extendController = function(controller) {
        $.extend(controller, new r.app.controller(this));
        return controller;
    }

    r.app.prototype.getControllers = function() {
        var prefix = 'controllers/';
        return $.map(this.controllers, function(controller) {
            return prefix + controller;
        });
    }

    r.app.prototype.getController = function(name) { return this.loaded[name]; }

    r.app.prototype.loadControllers = function() {
        var dfd = new $.Deferred();
        var self = this;

        if(!this.hasControllers())
            return this.reject('no defined controllers');

        require(this.getControllers(), function() {
            var controllers = arguments || [];
            $.each(arguments,  function(index, controller) {
                var controller = self._extendController(controller);

                controller.loadViews().done(function() {
                    self.loaded[controller.name] = controller;
                }).fail(function() {
                    return dfd.reject();
                });
            });
            return dfd.resolve();
        }, function(error) { return dfd.reject(error); });

        return dfd;
    }

    r.app.controller = function(app) {
        this.app = app;
        return this;
    }

    r.app.controller.prototype.hasViews = function() {
        return ( typeof this.views != 'undefined' &&
                 this.views.length > 0 );
    }

    r.app.controller.prototype._extendView = function(view) {
        $.extend(view, new this.app.view(this));
        return view;
    }

    r.app.controller.prototype.getViews = function() {
        var prefix = 'views/';
        return $.map(this.views, function(view) {
            return prefix + view;
        });
    }

    r.app.controller.prototype.loadedViews = {};
    r.app.controller.prototype.getView = function(name) { return this.loadedViews[name]; }
    r.app.controller.prototype.loadViews = function() {
        var dfd = new $.Deferred();
        var self = this;

        console.debug('Loading views for %s controller', this.name);

        if ( ! this.hasViews() ) {
            console.warn('Not defined views for controller %s', this.name);
        } else {
            require(this.getViews(), function() {
                var views = arguments || [];
                $.each(views, function(index, view) {
                    var view = self._extendView(view);
                    self.loadedViews[self.views[index]] = view;
                });
                return dfd.resolve();
            }, function(error) { return dfd.reject(error); });

        }
        return dfd;
    }


    r.app.prototype.view = function(controller) {
        this.controller = controller;
        return this;
    }

    return r;

})();
