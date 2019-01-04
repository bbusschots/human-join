import is from 'is_js';
import _ from 'lodash';

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
 * The defined mappings between reversible characters and their reversed form.
 *
 * @protected
 * @type {Map<string, string>}
 */
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
     * The configured mappings between reversible characters and their reversed
     * form.
     *
     * @type {Map<string, string>}
     * @example
     * console.log( Joiner.characterMirrorMap['('] ); // )
     */
    static get characterMirrorMap(){
        return _.assign({}, CHAR_MIRROR_MAP);
    }
    
    /**
     * A utility function to cast a plugin options value to an object.
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
    static pluginOptsToObject(val){
        if(is.undefined(val) || is.null(val)) return { enabled: false };
        if(is.boolean(val)) return { enabled: val };
        if(is.number(val) || is.string(val) || is.array(val)) return { arg: val };
        if(is.object(val)) return val;
        return { enabled: true };
    }
    
    /**
     * A utility function to mirror a single character if possible. Any
     * character appearing in the character mirror map can be mirrored. Any
     * character that can't be mirrored will be returned un-altered.
     *
     * If an invalid type is passed the empty string is returned, and strings
     * longer than a single character will be truncated to a single character
     * (the original first character), and then mirrored.
     *
     * @param {string} c - The character to be mirrored.
     * @return {string}
     * @see {@link Joiner.characterMirrorMap}
     * @example
     * console.log( Joiner.mirrorCharacter('<') ); // >
     */
    static mirrorCharacter(c){
        if(is.not.string(c) && is.not.number(c)) return '';
        c = String(c); // force to string
        if(is.empty(c)) return '';
        if(c.length > 1) c = c.substring(0, 1); // truncate to a single character
        return is.string(CHAR_MIRROR_MAP[c]) ? CHAR_MIRROR_MAP[c] : c;
    }
    
    /**
     * A utility function to mirror a string if possible. The string will be
     * reversed, and any individual characters that can be mirrored will be
     * replaced with their mirrored version.
     *
     * @param {string} s - The string to mirror.
     * @return {string}
     * @see {@link Joiner.mirrorCharacter}
     * @example
     * console.log( Joiner.mirrorString('-<') ); // >-
     */
    static mirrorString(s){
        if(is.not.string(s) && is.not.number(s)) return '';
        s = String(s); // force to string
        let ans = '';
        for(const c of s.split('').reverse()){
            ans += this.mirrorCharacter(c);
        }
        return ans;
    }
    
    /**
     * Test if a given value is a valid plugin name. I.e., can it be used as a
     * name for a renderer, config shortcut, pre-processor, or post-processor?
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
            _.merge(newConf[name], this.constructor.pluginOptsToObject(o));
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
            return this.join(d, this.constructor.pluginOptsToObject(o));
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
            _.merge(newConf[name], this.constructor.pluginOptsToObject(o));
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
     *
     * @type {string}
     */
    get renderer(){
        return this._conf.renderer;
    }
    
    /**
     * A reference to the "Joiner" class.
     *
     * @type {Object}
     */
    get Joiner(){
        return this.constructor;
    }
    
    /**
     * @param {Array} data
     * @param {Object} [opts={}]
     * @returns {string}
     * @throws {Error}
     */
    join(data, opts){
        if(is.not.object(opts)) opts = {};
        
        // auto-enable any plugins mentioned in the passed options
        for(const p of Object.keys(opts)){
            opts[p] = this.constructor.pluginOptsToObject(opts[p]);
            if(is.undefined(opts[p].enabled)) opts[p].enabled = true;
        }
        
        // combine the passed opts with the config
        const conf = _.defaultsDeep({}, opts, this._conf);
        
        // clone the data (so it can be safely transformed without spooky action at a distance)
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
        for(const ppn of Object.keys(POST_PROCS)){
            try{
                if(conf[ppn] && conf[ppn].enabled){
                    ans = POST_PROCS[ppn](ans, conf[ppn]);
                }
            }catch(err){
                throw new Error(`failed to execute post-processor '${ppn}' with error: ${err.message}`);
            }
        }
        
        // return the final result
        return ans;
    }
    
    /**
     * An alias for the `.join()` function.
     *
     * @see {@link Joiner#join}
     */
    j(...args){ return this.join(...args); }
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
Joiner.registerConfigShortcut('oxfordOr', { renderer: 'inline', inline: { conjunction: ', or ' } });
Joiner.registerConfigShortcut('oxOr', { renderer: 'inline', inline: { conjunction: ', or ' } });
Joiner.registerConfigShortcut('ampersand', { renderer: 'inline', inline: { conjunction: ' & ' } });
Joiner.registerConfigShortcut('amp', { renderer: 'inline', inline: { conjunction: ' & ' } });
Joiner.registerConfigShortcut('and', { renderer: 'inline', inline: { conjunction: ' and ' } });
Joiner.registerConfigShortcut('oxfordAnd', { renderer: 'inline', inline: { conjunction: ', and ' } });
Joiner.registerConfigShortcut('oxAnd', { renderer: 'inline', inline: { conjunction: ', and ' } });

Joiner.registerPreProcessor('quote', function(data, opts){
    if(is.not.array(data)) return;
    if(is.not.object(opts)) opts = {};
    if(is.string(opts.arg)) opts.quoteWith = opts.arg;
    if(is.not.string(opts.quoteWith) || is.empty(opts.quoteWith)) opts.quoteWith = "'";
    if(is.undefined(opts.mirror)){
        opts.mirror = true;
    }else{
        opts.mirror = opts.mirror ? true : false;
    }
    for(let i = 0; i < data.length; i++){
        data[i] = `${opts.quoteWith}${data[i]}${opts.mirror ? Joiner.mirrorString(opts.quoteWith) : opts.quoteWith}`;
    }
});
Joiner.registerConfigShortcut('singleQuote', {quote: {enabled: true, quoteWith: "'", mirror: false}});
Joiner.registerConfigShortcut('q', {quote: {enabled: true, quoteWith: "'", mirror: false}});
Joiner.registerConfigShortcut('doubleQuote', {quote: {enabled: true, quoteWith: '"', mirror: false}});
Joiner.registerConfigShortcut('qq', {quote: {enabled: true, quoteWith: '"', mirror: false}});

Joiner.registerPostProcessor('wrap', function(str, opts){
    if(is.not.object(opts)) opts = {};
    let ans = String(str);
    if(is.string(opts.arg)) opts.wrapWith = opts.arg;
    if(is.not.string(opts.wrapWith) || is.empty(opts.wrapWith)) opts.wrapWith = "(";
    if(is.undefined(opts.mirror)){
        opts.mirror = true;
    }else{
        opts.mirror = opts.mirror ? true : false;
    }
    return `${opts.wrapWith}${ans}${opts.mirror ? Joiner.mirrorString(opts.wrapWith) : opts.wrapWith}`;
});
Joiner.registerConfigShortcut('bracket', {wrap: {enabled: true, wrapWith: '(', mirror: true}});
Joiner.registerConfigShortcut('b', {wrap: {enabled: true, wrapWith: '(', mirror: true}});
Joiner.registerConfigShortcut('rb', {wrap: {enabled: true, wrapWith: '(', mirror: true}});
Joiner.registerConfigShortcut('squareBracket', {wrap: {enabled: true, wrapWith: '[', mirror: true}});
Joiner.registerConfigShortcut('sb', {wrap: {enabled: true, wrapWith: '[', mirror: true}});
Joiner.registerConfigShortcut('angleBracket', {wrap: {enabled: true, wrapWith: '<', mirror: true}});
Joiner.registerConfigShortcut('ab', {wrap: {enabled: true, wrapWith: '<', mirror: true}});
Joiner.registerConfigShortcut('curlyBracket', {wrap: {enabled: true, wrapWith: '{', mirror: true}});
Joiner.registerConfigShortcut('squirlyBracket', {wrap: {enabled: true, wrapWith: '{', mirror: true}});
Joiner.registerConfigShortcut('cb', {wrap: {enabled: true, wrapWith: '{', mirror: true}});

const defaultJoiner = new Joiner({ renderer: 'inline' });
export default defaultJoiner;