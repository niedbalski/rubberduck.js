define(function() {
    var run = function() {
        test("RubberDuck application not initialized, sync methods", function() {

            var app = new RubberDuck.app();
            equal( $.type(app), 'object' );
            ok( $.isEmptyObject(app.cache) );
            ok( $.isEmptyObject(app.getLibraries()) );

            equal( app.isLoaded(), false );
            equal( app.run(), false );
            equal( app.hasControllers(), false );
            equal( app.hasModels(), false );
            equal( app.hasControllers(), false );
            equal( app.getModel('foo'),  false );

            var model = new RubberDuck.app.model(app);
            equal( $.type(model), 'object' );
            deepEqual(model.app, app);

            var controller = new RubberDuck.app.controller(app);
            equal( $.type(controller), 'object' );
            deepEqual(controller.app, app);
            equal( controller.getView('foo'), false );
            equal( controller.hasRoutes(), false );
            equal( controller.hasViews(), false );

            var view = new RubberDuck.app.view(controller);
            equal( $.type(view), 'object' );
            deepEqual( view.controller, controller );
            ok( $.isEmptyObject(view.cache) );

            var template = new RubberDuck.app.template(view);
            equal( $.type(template), 'object' );
            deepEqual( template.view, view );

            raises(function() {
                new RubberDuck.app.template(view, {})
            }, RubberDuck.Exception, 'RubberDuck.Exception must be raised with invalid template');
            var tpl = '<h1> {{ test }} </h1>';
            var template = new RubberDuck.app.template(view, tpl);
            equal( $.type(template), 'object' );
            deepEqual( template.view, view );
            equal( $.type(template.tpl), 'function' );

            var rendered = '<h1> testing </h1>';
            equal( template.render({ test: 'testing'}), rendered);

        });
    }
    return {run: run};
});
