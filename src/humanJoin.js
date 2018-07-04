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
        RENDERERS[name] = fn;
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
        // TO DO
        
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

module.exports = new Joiner({
    renderer: { name: 'inline', opts: {} },
    preProcessors: {},
    postProcessors: {}
});