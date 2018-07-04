QUnit.module('inline renderer', function(){
    QUnit.test('default behaviour', function(a){
        a.expect(11);
        
        // make sure the function exists
        a.ok(is.function(humanJoin.inline), 'humanJoin.inline is a function');
        
        // Check that various types of data return the expected values
        a.strictEqual(humanJoin.inline(), String(undefined), 'undefined as data handled correctly');
        a.strictEqual(humanJoin.inline({}), String({}), 'plain object as data handled correctly');
        let obj = new Date();
        a.strictEqual(humanJoin.inline(obj), String(obj), 'prototyped object as data handled correctly');
        a.strictEqual(humanJoin.inline('boogers'), 'boogers', 'string as data handled correctly');
        a.strictEqual(humanJoin.inline(42), '42', 'number as data handled correctly');
        let fn = function(){};
        a.strictEqual(humanJoin.inline(fn), String(fn), 'function reference as data handled correctly');
        a.strictEqual(humanJoin.inline([]), '', 'empty array handled correctly');
        a.strictEqual(humanJoin.inline(['boogers']), 'boogers', 'single element array handled correctly');
        a.strictEqual(humanJoin.inline(['boogers', 'snot']), 'boogers & snot', 'two element array handled correctly');
        a.strictEqual(humanJoin.inline(['boogers', 'snot', 'bogies']), 'boogers, snot & bogies', 'three element array handled correctly');
    });
});