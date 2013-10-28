var Application = {};

Application.init = function(options) {
    var options = options || {};
    $.extend(this, options);

    this.load_controllers();
}

Application.loadControllers = function() {
    $.each(this.controllers, function(i, controller) {
        console.log(controller.name , ' loaded');
    });
}

Application.connect = function(route, controller) {
    console.log('Connecting ' + route + ' with ' + controller.name);
}


var app = Application({
    controllers: [ 'History' , 'Menu' ],
    path: '/app/'
});

app.connect('#history', HistoryController);
app.connect('#menu', MenuController);

app.init(function() {
    console.log('Application is ready to rock and roll');
    this.getHistoryController().showStatusMessages();
});

