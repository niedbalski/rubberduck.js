// R framework a minimal mvc framework to
// solve common javascript problems
//
// @author: Jorge Niedbalski R. <jnr@niedbalski.org>
// @license: MIT

(function() {
    r = {};
    r.app = (function() {
        function app(options) {
            var self = this;                
            $.extend(this, $.Deferred(), options || {});

            requirejs.config({
                baseUrl: (typeof options.path != "undefined" ) ? 
                    options.path : "/"
            });

            console.debug('Loading \"%s\" application', this.name);

            $.when(this.loadControllers()).done(function() {
                return self.resolve(self);
            }).fail(function(e) {
                return self.reject(self, e);
            });
        }


        app.prototype.connect = function(route, cb) {
            $.routes.add(route, cb);
        }

        app.prototype.run = function() {
            console.debug('Initializing \"%s\" application', this.name);

            $.each(this.loadedControllers, function(i, controller) {
                console.debug('Initializing \"%s\" controller', controller.name);
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

            $.routes.load(location.hash);
        }
            
        app.prototype.getControllersPath = function() {
            var prefix = 'controllers/';
            return $.map(this.controllers, function(controller) {
                return prefix + controller;
            });
        }
        app.prototype.loadedControllers = {};
        app.prototype.getController = function(name) {
            return this.loadedControllers[name];
        }

        app.prototype.hasControllers = function() {
            return ( typeof this.controllers != 'undefined' &&
                     this.controllers.length > 0);
        }

        app.prototype.extendControllerAndRegister = function(controller) {
            $.extend(controller, new app.controller(self));
            return controller;
        }

        app.prototype.loadControllers = function() {
            var dfd = $.Deferred(),
            self = this;

            if ( ! this.hasControllers() ) 
                return dfd.reject('No controllers for application');

            console.debug('Loading \"%s\" controllers', this.name);
            require(this.getControllersPath(), function() {

                $.each(arguments, function(i, controller) {
                    var controller = self.extendControllerAndRegister(
                        controller);                
                    console.debug('Loading \"%s\" controller', controller.name);
                    w = $.when(controller.loadViews());
                    w.done(function(views) {
                        self.loadedControllers[controller.name] = controller;
                        console.debug('Loaded %s controller', controller.name);
                    });
                    w.fail(function(e) {
                        
                    });
                });

                return dfd.resolve(this.controllers);

            }, function(e) { dfd.reject(e); } );

            return dfd;
        }
        return app;
    })();

    r.app.controller = (function() {

        function controller(app) {
            this.app = app;
            $.extend(this, $.Deferred());
        }

        controller.prototype.getViewsPath = function() {
            var prefix = 'views/';
            return $.map(this.views, function(view) {
                return prefix + view;
            });
        }
        
        controller.prototype.hasViews = function() {
            return ( typeof this.views != 'undefined' &&
                     this.views.length > 0 );
        }

        controller.prototype.extendViewAndRegister = function(view) {
            $.extend(view, new this.view(self));           
            return controller;
        }

        controller.prototype.loadedViews = {};
        controller.prototype.getView = function(name) {
            return this.loadedViews[name];
        }

        controller.prototype.loadViews = function() {
            var dfd = $.Deferred();
            var self = this;

            if ( ! this.hasViews() ) {
                console.warn('No defined views for controller %s', 
                             this.name);
            } else {
                console.debug('Loading \"%s\" views', this.name);
                var i = 0;
                require(this.getViewsPath(), function(view) {
                    var view = self.extendViewAndRegister(view);
                    self.loadedViews[self.views[i++]] = view;
                }, function(e) { dfd.reject(e); });
                
                console.log(self.loadedViews);

                console.debug('caca');

                return dfd.resolve(self.loadedViews);
            }
        }

        return controller;

    })();

    r.app.controller.prototype.view = (function() {
        function view(controller) {
            this.controller = controller;
        }
        return view;
    })();

})();