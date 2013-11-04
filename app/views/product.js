define(function() {
    var v = {};

    v.el = 'body'; //jquery selector to append on template render

    v.render = function(id) {
        new RubberDuck.app.template(this).load('product')
            .done(function(tpl) {
                return tpl.render({
                    product_id: id
                });
        });
    }

    return v;
});
