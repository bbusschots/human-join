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
 * Cast plugin options value to an object.
 *
 * @param {*} val
 * @return {Object} The structure of the returned object depends on `val`'s
 * type as follows:
 * * `undefined` or `null`: `{ enabled: false }`
 * * `boolean`: returned as `{ enabled: val }`
 * * `string`, `number` or `Array`: returned as `{ arg: val }`
 * * `object` (except for arrays): returned un-changed
 * * all other values: { enabled: true }
 */
function pluginOptsToObject(val){
    if(is.undefined(val) || is.null(val)) return { enabled: false };
    if(is.boolean(val)) return { enabled: val };
    if(is.number(val) || is.string(val) || is.array(val)) return { arg: val };
    if(is.object(val)) return val;
    return { enabled: true };
}

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
     * Test if a given value is a valid plugin name. I.e., can it be used as a
     * name for a renderer, pre-processor, or post-processor?
     *
     * To be valid a value must be a string at least one character long
     * consisting of only letters, digits, and underscores and not starting
     * with a digit.
     *
     * @param {*} val
     * @return {boolean}
     */
    static isPluginName(val){
        if(is.not.string(val) || is.empty(val)) return false;
        return val.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ? true : false;
    }
    
    /**
     * Test if a given value is a valid plugin name, and if not, throw a Type
     * Error.
     *
     * @param {val}
     * @return {boolean} always returns `true`.
     * @throws {TypeError}
     * @see {@link Joiner.isPluginName}
     */
    static assertPluginName(val){
        if(!this.isPluginName(val)) throw new TypeError('plugin name must be a string at least one character long consisting of only letters, digits, and underscores, and not starting with a digit.');
        return true;
    }
    
    /**
     * Test if a given name is available to register a plugin with. Invalid
     * names will always return false.
     *
     * @param {string} name
     *@return {boolean}
     * @see {@link Joiner.isPluginName}
     */
    static isAvailableName(name){
        if(!this.isPluginName(name)) return false;
        return is.undefined(this[name]) ? true : false;
    }
    
    /**
     * Test if a given name is available to register a plugin with, and thorw
     * a Range Error if it's not. Invalid names will result in Type Errors.
     *
     * @param {string} name
     * @return {boolean} Always returns `true`.
     * @throws {TypeError}
     * @throws {RangeError}
     * @see {@link Joiner.assertPluginName}
     * @see {@link Joiner.isAvailableName}
     */
    static assertAvailableName(name){
        this.assertPluginName(name);
        if(!this.isAvailableName(name)) throw new RangeError(`the name '${name}' is not available, another plugin or core function/ property is already using it.`);
        return true;
    }
    
    /**
     * Register a pre-processor plugin.
     *
     * @param {string} name
     * @param {function} fn
     * @throws {TypeError}
     * @throws {RangeError}
     */
    static registerPreProcessor(name, fn){
        this.assertAvailableName(name);
        if(is.not.function(fn)) throw new TypeError('preprocessor must be a callback');
        PRE_PROCS[name] = fn;
        this.prototype[name] = function(o){
            const newConf = _.cloneDeep(this._conf);
            if(is.not.object(newConf[name])) newConf[name] = { enabled: false };
            _.merge(newConf[name], pluginOptsToObject(o));
            return new Joiner(newConf);
        };
    }
    
    /**
     * Register a renderer.
     *
     * @param {string} name
     * @param {function} fn
     * @throws TypeRrror
     * @throws {RangeError}
     */
    static registerRenderer(name, fn){
        this.assertAvailableName(name);
        if(is.not.function(fn)) throw new TypeError('renderer must be a callback');
        RENDERERS[name] = fn;
        this.prototype[name] = function(d, o){
            this._conf.renderer = name;
            if(is.not.object(this._conf[name])) this._conf[name] = {};
            return this.join(d, pluginOptsToObject(o));
        };
    }
    
    /**
     * Register a post-processor.
     * 
     * @param {string} name
     * @param {function} fn
     * @throws TypeRrror
     * @throws {RangeError}
     */
    static registerPostProcessor(name, fn){
        this.assertAvailableName(name);
        POST_PROCS[name] = fn;
        this.prototype[name] = function(o){
            const newConf = _.cloneDeep(this._conf);
            if(is.not.object(newConf[name])) newConf[name] = { enabled: false };
            _.merge(newConf[name], pluginOptsToObject(o));
            return new Joiner(newConf);
        };
    }
    
    /**
     * Register a config shortcut.
     *
     * @param {string} name
     * @param {Object} config
     * @throws {TypeError}
     * @throws {RangeError}
     */
    static registerConfigShortcut(name, config){
        this.assertAvailableName(name);
        Object.defineProperty(this.prototype, name, {get: function(){
            return new Joiner(_.merge({}, this._conf, config));
        }});
    }
    
    /**
     * The name of the active renderer.
     */
    get renderer(){
        return this._conf.renderer;
    }
    
    /**
     * @param {Array} data
     * @param {Object} [opts={}]
     * @returns {string}
     * @throws {Error}
     */
    join(data, opts){
        if(is.not.object(opts)) opts = {};
        const conf = _.defaultsDeep({}, opts, this._conf);
        data = _.cloneDeep(data);
        
        // apply all active pre-processors to the data
        for(const ppn of Object.keys(PRE_PROCS)){
            try{
                if(conf[ppn] && conf[ppn].enabled){
                    PRE_PROCS[ppn](data, conf[ppn]);
                }
            }catch(err){
                throw new Error(`failed to execute pre-processor '${ppn}' with error: ${err.message}`);
            }
        }
        
        // render the data
        let ans = '';
        try{
            ans = RENDERERS[conf.renderer](data, conf[conf.renderer]);
        }catch(err){
            throw new Error(`failed to execute renderer '${conf.renderer}' with error: ${err.message}`);
        }
        
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
Joiner.registerConfigShortcut('or', { renderer: 'inline', inline: { conjunction: ' or ' } });
Joiner.registerConfigShortcut('oxOr', { renderer: 'inline', inline: { conjunction: ', or ' } });
Joiner.registerConfigShortcut('and', { renderer: 'inline', inline: { conjunction: ' and ' } });
Joiner.registerConfigShortcut('oxAnd', { renderer: 'inline', inline: { conjunction: ', and ' } });


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
Joiner.registerConfigShortcut('q', {quote: {enabled: true, quoteWith: "'", mirror: false}});
Joiner.registerConfigShortcut('qq', {quote: {enabled: true, quoteWith: '"', mirror: false}});

module.exports = new Joiner({ renderer: 'inline' });