QUnit.module('inline renderer', function(){
    QUnit.test('default behaviour', function(a){
        a.expect(11);
        
        // make sure the function exists
        a.ok(is.function(humanJoiner.join), 'humanJoiner.join is a function');
        
        // Check that various types of data return the expected values
        a.strictEqual(humanJoiner.join(), String(undefined), 'undefined as data handled correctly');
        a.strictEqual(humanJoiner.join({}), String({}), 'plain object as data handled correctly');
        let obj = new Date();
        a.strictEqual(humanJoiner.join(obj), String(obj), 'prototyped object as data handled correctly');
        a.strictEqual(humanJoiner.join('boogers'), 'boogers', 'string as data handled correctly');
        a.strictEqual(humanJoiner.join(42), '42', 'number as data handled correctly');
        let fn = function(){};
        a.strictEqual(humanJoiner.join(fn), String(_.cloneDeep(fn)), 'function reference as data handled correctly');
        a.strictEqual(humanJoiner.join([]), '', 'empty array handled correctly');
        a.strictEqual(humanJoiner.join(['boogers']), 'boogers', 'single element array handled correctly');
        a.strictEqual(humanJoiner.join(['boogers', 'snot']), 'boogers & snot', 'two element array handled correctly');
        a.strictEqual(humanJoiner.join(['boogers', 'snot', 'bogies']), 'boogers, snot & bogies', 'three element array handled correctly');
    });
    
    QUnit.test('.j() shortcut', function(a){
        a.expect(2);
        a.ok(is.function(humanJoiner.j), 'shortcut function exists');
        a.strictEqual(humanJoiner.j(['boogers', 'snot', 'bogies']), 'boogers, snot & bogies', 'produces expected output');
    });
});