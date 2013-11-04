define(function() {
    var v = {};

    v.el = 'body'; //jquery selector to append on template render

    v.render = function(id) {
        new RubberDuck.app.template(this).load('user')
            .done(function(tpl) {
                return tpl.render({
                    user_id: id
                });
        });
    }

    return v;
});
