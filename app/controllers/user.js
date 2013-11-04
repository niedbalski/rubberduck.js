define(function() {
    var c = {}

    c.views = [ 'user' ];
    c.name = 'user';
    c.routes = function() {
        return {
            '/user/{id:int}': this.showUserId,
            '/user/ids/{id:int}': this.showUserId
        }
    };

    c.init = function() {
        console.log('Initialized %s controller', this.name);
    }

    c.showUserId = function() {
        this.getView('user').render(this.id);
    }

    return c;
});
