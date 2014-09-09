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
        //Get the user by id and display it
        this.app.getModel('user').findOne({
            user_id: this.id
        }, function(user){
            return this.getView('user').render(user.id);
        });
    }

    return c;
});
