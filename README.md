# humanJoin.js
A JavaScript utility for joining lists in a human-friendly way.

This module is packaged as both a universal module, i.e, a
[UMD](https://github.com/umdjs/umd) (`dist/index.js`) and an ES6 module
(`dist/index.es.js`), so it can be imported in multiple different ways.

By default the module is published as `humanJoiner`, but you may find
it more convenient to use the shorter name `hjn`. These instructions
will show how to import to both names, but the examples will all use
the shorter alternative name.

## Install & Import

### NodeJS

Install:

```
npm install --save '@bartificer/human-join'
```

Import:

```
// import with long name
const humanJoiner = require('@bartificer/human-join');

// or, import with short name
const hjn = require('@bartificer/human-join');
```

### ES6 Module

```
// import with long name
import * as humanJoiner from './dist/index.es.js'

// or, import with short name
import * as hjn from './dist/index.es.js'
```

### Browser (from CDN)

```
<!-- Import module, always imported as humanJoiner -->
<script type="text/javascript" src="">https://cdn.jsdelivr.net/npm/@bartificer/human-join/dist/index.js</script>
<!-- optionally add shorter name -->
<script type="text/javascript">
var hjn = humanJoiner;
</script>
```

## Usage

```
const hjn = require('@bartificer/human-join');

const peeps = ['Tom', 'Dick', 'Harry'];

// join like humans do by default
console.log( hjn.join(peeps) ); // Tom, Dick & Harry
console.log( hjn.j(peeps) ); // Tom, Dick & Harry

// join with various conjunctions
console.log( hjn.and.join(peeps) ); // Tom, Dick and Harry
console.log( hjn.oxAnd.join(peeps) ); // Tom, Dick, and Harry
console.log( hjn.or.join(peeps) ); // Tom, Dick or Harry
console.log( hjn.oxOr.join(peeps) ); // Tom, Dick, or Harry

// quote each value
console.log( hjn.singleQuote.join(peeps) ); // 'Tom', 'Dick' & 'Harry'
console.log( hjn.q.join(peeps) ); // 'Tom', 'Dick' & 'Harry'
console.log( hjn.doubleQuote.join(peeps) ); // "Tom", "Dick" & "Harry"
console.log( hjn.qq.join(peeps) ); // "Tom", "Dick" & "Harry"

// wrap the joined string in various brackets
console.log( hjn.bracket.join(peeps) ); // (Tom, Dick & Harry)
console.log( hjn.b.join(peeps) ); // (Tom, Dick & Harry)
console.log( hjn.squareBracket.join(peeps) ); // [Tom, Dick & Harry]
console.log( hjn.sb.join(peeps) ); // [Tom, Dick & Harry]
console.log( hjn.curlyBracket.join(peeps) ); // {Tom, Dick & Harry}
console.log( hjn.cb.join(peeps) ); // {Tom, Dick & Harry}
console.log( hjn.angleBracket.join(peeps) ); // <Tom, Dick & Harry>
console.log( hjn.ab.join(peeps) ); // <Tom, Dick & Harry>

// putting it all together
console.log( hjn.oxAnd.q.b.join(peeps) ); // ('Tom', 'Dick', and 'Harry')
```
