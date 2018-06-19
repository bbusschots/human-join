const is = require('is_js');

const humanJoin = {
    /**
     * Join the elements of a list on a single line.
     *
     * The function is designed to render an array of primitive values. If
     * anything else is passed the returned value will be the result of
     * calling JavaScript's `String()` function on the value. The same
     * goes for non-primitive values within arrays.
     *
     * @param {Array|object} data - the data to join.
     * @param {object} [opts={}] - options.
     * @param {string} [opts.separator=', '] - the separator to use between list elemnts.
     * @param {string} [opts.conjunction=' & '] - the conjunction to use before the last item in the list.
     * @return {string}
     */
    inline: function(data, opts){
        if(is.not.array(data)) return String(data);
        if(is.not.object(opts)) opts = {};
        
        // get a list of list parts
        let parts = [];
        if(is.array(data)){
            parts = [...data];
        }else{
            for(const k of Object.keys(data)){
                parts.push(`${k}=${String(data[k])}`);
            }
        }
        
        // if the list is empty, return an empty string
        if(parts.length === 0) return '';
        
        // if there is exactly one element, return it
        if(parts.length === 1) return String(parts[0]);
        
        // there are multiple parts, so join them and return
        if(is.not.string(opts.separator)) opts.separator = ', ';
        if(is.not.string(opts.conjunction)) opts.conjunction = ' & ';
        let ans = String(parts[0]);
        for(let i = 1; i < parts.length; i++){
            ans += `${i + 1 === parts.length ? opts.conjunction : opts.separator}${parts[i]}`;
        }
        return ans;
    }
};
//humanJoin.amp = humanJoin.ampersand;

module.exports = humanJoin;