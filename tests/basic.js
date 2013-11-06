define(function() {
    var run = function() {
        test("RubberDuck object properties", function() {
            var r = new RubberDuck.app();
            ok( typeof r === 'object', 'Passed!' );
        });
    }
    return {run: run};
});
