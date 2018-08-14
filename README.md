# humanJoin.js
A JavaScript utility for joining lists in a human-friendly way.

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
