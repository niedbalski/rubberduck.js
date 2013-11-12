/* jshint -W004 */

define(function() {
    "use strict";

    var run = function() {

        asyncTest("RubberDuck correct app, async methods", function(){

            var app = new RubberDuck.app({
                path: 'app/',
                name: 'test',
                controllers: [ 'test' ],
                models: [ 'test' ]
            });

            app.done(function() {
                equal( $.type(app), 'object',
                       "App is correctly created" );
                ok( $.isEmptyObject(app.cache), "App cache is empty" );
                ok( $.isEmptyObject(app.getLibraries()),
                    "App libraries not required" );

                equal( app.isLoaded(), true, "App must be loaded" );

                //Todo: extend app.run coverage
                equal( app.run(), true, "App run method returns true" );

                equal( app.hasControllers(), true, "App has controllers returns true" );
                equal( app.hasModels(), true , "App has models returns true" );

                //model check
                ok( $.type(app.getModel('test')) === 'function', "App model exists" );
                equal( app.getModel('test').shortName, 'test',
                       "App model is correctly assigned" );

                //controller check
                ok( $.type(app.getController('test')) === 'object',
                    "App controller is correctly assigned" );
                equal( app.getController('test').name, 'test',
                       "Check if controller is correct");

                var controller = app.getController('test');
                deepEqual(controller.app, app, "Check if application is correctly assigned");
                ok( $.type(controller.getView('test')) === 'object',
                    "Check if controller has view" );

                var view = controller.getView('test');
                deepEqual(view.controller, controller,
                          "Check if controller is correctly assigned");

                equal( view.el, '#test', "Check if element is asigned on view" );
                ok( $.isEmptyObject(view.cache), "Check if cache is empty" );

                //test routes
                var route = $.routes.findRoute('/test/1');
                equal( $.type(route), 'object' , "Check if route exists");

                route.routeTo({
                    id: 1
                });
                //check if dispatching rendered a new h1 element
                ok( $("#test").has("h1"),
                    "Check to dispatch a route, then render a template" );
                start();
            });

        });

        test("RubberDuck correct app - not init, sync methods", function() {

            var app = new RubberDuck.app();
            equal( $.type(app), 'object', "App is correctly created" );
            ok( $.isEmptyObject(app.cache), "App cache is empty" );
            ok( $.isEmptyObject(app.getLibraries()), "App libraries not required" );

            equal( app.isLoaded(), false, "App is not loaded" );
            equal( app.run(), false, "App run returns false"  );
            equal( app.hasControllers(), false, "App no controllers assigned, so return false" );
            equal( app.hasModels(), false, "App no models assigned, then return false" );
            equal( app.getModel('foo'),  false, "App no models assigned, then return false" );
            equal( app.getController('foo'), false, "App no controller assigned then return false" );

            var model = new RubberDuck.app.model(app);
            equal( $.type(model), 'object', "New model creates an object" );
            deepEqual(model.app, app, "Model app is correct" );

            var controller = new RubberDuck.app.controller(app);
            equal( $.type(controller), 'object', "New controllers creates an object" );
            deepEqual(controller.app, app, "Controller app is correct" );
            equal( controller.getView('foo'), false, "No view on controller returns false" );
            equal( controller.hasRoutes(), false, "No routes on controller returns false" );
            equal( controller.hasViews(), false, "No views on controller returns false" );

            var view = new RubberDuck.app.view(controller);
            equal( $.type(view), 'object' );
            deepEqual( view.controller, controller );

            var template = new RubberDuck.app.template(view);
            equal( $.type(template), 'object', "New template creates an object" );
            deepEqual( template.view, view , "Template view is correct" );

            raises(function() {
                new RubberDuck.app.template(view, {});
            }, RubberDuck.Exception,
                   'RubberDuck.Exception must be raised with invalid template');

            var tpl = '<h1> {{ test }} </h1>';
            var template = new RubberDuck.app.template(view, tpl);
            equal( $.type(template), 'object' );
            deepEqual( template.view, view );
            equal( $.type(template.tpl), 'function' , "Template is a handlebars function" );

            var rendered = '<h1> testing </h1>';
            equal( template.render({
                test: 'testing'
            }), rendered, "Render a template is correct" );

        });
    };

    return {run: run};
});
