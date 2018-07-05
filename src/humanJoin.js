const is = require('is_js');
const _ = require('lodash');

/**
 * The defined pre-processors.
 *
 * @protected
 * @type {Map<string, function>}
 */
const PRE_PROCS = {};

/**
 * The defined renderers.
 *
 * @protected
 * @type {Map<string, function>}
 */
const RENDERERS = {};

/**
 * The defined post-processors.
 *
 * @protected
 * @type {Map<string, function>}
 */
const POST_PROCS = {};

/**
 * The joiner class.
 */
class Joiner{
    /**
     * @param {Object} [joinConfig={}]
     */
    constructor(joinConfig = {}){
        if(is.not.object(joinConfig)) joinConfig = {};
        
        /**
         * @type {Object}
         */
        this._conf = _.assign({}, joinConfig);
    }
    
    /**
     * @param {string} name
     * @param {function} fn
     * @throws TypeRrror
     * @throws {RangeError}
     */
    static registerPreProcessor(name, fn){
        if(is.not.string(name) || is.empty(name)) throw new TypeError('name must be a single-line string of one or more letters, digits, or underscores');
        if(is.not.function(fn)) throw new TypeError('preprocessor must be a callback');
        if(is.not.undefined(PRE_PROCS[name])) throw new RangeError(`duplicate pre-processor '${name}'`);
        PRE_PROCS[name] = fn;
    }
    
    /**
     * @param {string} name
     * @param {function} fn
     * @throws TypeRrror
     * @throws {RangeError}
     */
    static registerRenderer(name, fn){
        if(is.not.string(name) || is.empty(name)) throw new TypeError('name must be a single-line string of one or more letters, digits, or underscores');
        if(is.not.function(fn)) throw new TypeError('renderer must be a callback');
        if(is.not.undefined(RENDERERS[name])) throw new RangeError(`duplicate renderer '${name}'`);
        if(is.not.undefined(this.prototype[name])) throw new RangeError(`name '${name}' is not available`);
        RENDERERS[name] = fn;
        this.prototype[name] = function(d, o = {}){
            if(is.not.object(o)) o = {};
            let uo = _.defaultsDeep({ renderer: { name }}, o);
            return this.join(d, uo);
        };
    }
    
    /**
     * @param {string} name
     * @param {function} fn
     * @throws TypeRrror
     * @throws {RangeError}
     */
    static registerPostProcessor(name, fn){
        if(is.not.string(name) || is.empty(name)) throw new TypeError('name must be a single-line string of one or more letters, digits, or underscores');
        if(is.not.function(fn)) throw new TypeError('preprocessor must be a callback');
        if(is.not.undefined(POST_PROCS[name])) throw new RangeError(`duplicate post-processor '${name}'`);
        POST_PROCS[name] = fn;
    }
    
    /**
     * @param {Array} data
     * @param {Object} [opts={}]
     * @returns {string}
     */
    join(data, opts){
        if(is.not.object(opts)) opts = {};
        const conf = _.defaultsDeep({}, opts, this._conf);
        
        // apply pre-processors to the data
        for(const pp of opts.preProcessors){
            // TO DO - add more tests and try/catch
            PRE_PROCS[pp.name](data, pp.opts);
        }
        
        // render the data
        let ans = RENDERERS[conf.renderer.name](data, conf.renderer.opts);
        
        // apply post-processors
        // TO DO
        
        // return the final result
        return ans;
    }
}

Joiner.registerRenderer('inline', function(data, opts){
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
});

const CHAR_MIRROR_MAP = {
    '!' : '¡',
    '?' : '¿',
    '(' : ')',
    ')' : '(',
    '{' : '}',
    '}' : '{',
    '[' : ']',
    ']' : '[',
    '<' : '>',
    '>' : '<'
};
function mirrorCharacter(c){
    if(is.not.string(c) && is.not.number(c)) return '';
    c = String(c); // force to string
    if(is.empty(c)) return '';
    if(c.length > 1) c = c.substring(0, 1); // truncate to a single character
    return is.string(CHAR_MIRROR_MAP[c]) ? CHAR_MIRROR_MAP[c] : c;
}
function mirrorString(s){
    if(is.not.string(s) && is.not.number(s)) return '';
    s = String(s); // force to string
    let ans = '';
    for(const c of s.split('').reverse()){
        ans += mirrorCharacter(c);
    }
    return ans;
}
Joiner.registerPreProcessor('quote', function(data, opts){
    if(is.not.array(data)) return;
    if(is.not.object(opts)) opts = {};
    if(is.not.string(opts.quoteWith) || is.empty(opts.quoteWith)) opts.quoteWith = "'";
    opts.mirror = opts.mirror ? true : false;
    for(let i = 0; i < data.length; i++){
        data[i] = `${opts.quoteWith}${data[i]}${opts.mirror ? mirrorString(opts.quoteWith) : opts.quoteWith}`;
    }
});

module.exports = new Joiner({
    renderer: { name: 'inline', opts: {} },
    preProcessors: {},
    postProcessors: {}
});