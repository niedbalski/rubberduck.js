define(function() {
    var c = {}

    c.views = [ 'test' ];
    c.name = 'test';

    c.routes = function() {
        return {
            '/test/{id:int}': this.showTestId
        }
    };

    c.init = function() {
        console.log('Initialized %s controller', this.name);
    }

    c.showTestId = function() {
        return this.getView('test').render(this.id);
    }

    return c;
});
