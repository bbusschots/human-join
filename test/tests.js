QUnit.module('inline renderer', function(){
    QUnit.test('default behaviour', function(a){
        a.expect(1);
        
        // make sure the function exists
        a.ok(is.function(humanJoin.inline), 'humanJoin.inline is a function');
        
    });
});