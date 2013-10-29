define(function() {
    var c = {}

    c.views = [ 'user' ];
    c.name = 'user';
    c.routes = function() {
        return {
            '/user/{id:int}': this.index,
            '/user/ids/{id:int}': this.index
        }
    };

    c.init = function() {
        console.log('Initialized %s controller', this.name);
    }

    c.index = function() {
        this.getView('user').render(this.id);
    }

    return c;
});
