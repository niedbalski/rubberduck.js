define(function() {
    var v = {};

    v.el = '#test'; //jquery selector to append on template render

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
