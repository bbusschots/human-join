QUnit.module('inline renderer', function(){
    QUnit.test('default behaviour', function(a){
        a.expect(3);
        
        // make sure the function exists
        a.ok(is.function(humanJoin.join), 'humanJoin.inline is a function');
        
        // Check that various types of data return the expected values
        a.strictEqual(humanJoin.join(), String(undefined), 'undefined as data handled correctly');
        a.strictEqual(humanJoin.join({}), String({}), 'plain object as data handled correctly');
        //let obj = new Date();
        //a.strictEqual(humanJoin.join(obj), String(obj), 'prototyped object as data handled correctly');
        //a.strictEqual(humanJoin.join('boogers'), 'boogers', 'string as data handled correctly');
        //a.strictEqual(humanJoin.join(42), '42', 'number as data handled correctly');
        //let fn = function(){};
        //a.strictEqual(humanJoin.join(fn), String(fn), 'function reference as data handled correctly');
        //a.strictEqual(humanJoin.join([]), '', 'empty array handled correctly');
        //a.strictEqual(humanJoin.join(['boogers']), 'boogers', 'single element array handled correctly');
        //a.strictEqual(humanJoin.join(['boogers', 'snot']), 'boogers & snot', 'two element array handled correctly');
        //a.strictEqual(humanJoin.join(['boogers', 'snot', 'bogies']), 'boogers, snot & bogies', 'three element array handled correctly');
    });
});