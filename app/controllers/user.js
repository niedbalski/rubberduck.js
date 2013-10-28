define(function() {
    var c = {};

    c.views = [ 'user' ];
    c.name = 'user';
    c.peo = "testing";

    c.init = function() {
        console.log('Calling app from controller [%s]', this.app.name);
    }

    c.index = function() {
        c.getView('user').render();
    }

    return c;

});