define(function() {
    var c = {}

    c.views = [ 'product' ];
    c.name = 'product';

    c.routes = function() {
        return {
            '/product/{id:int}': this.index
        }
    };

    c.init = function() {
        console.log('Initialized %s controller', this.name);
    }

    c.index = function() {
        this.getView('product').render(this.id);
    }

    return c;
});
