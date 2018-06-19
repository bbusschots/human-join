const is = require('is_js');

const humanJoin = {
    ampersand: function(){
        return 'this & that';
    }
};
humanJoin.amp = humanJoin.ampersand;

module.exports = humanJoin;