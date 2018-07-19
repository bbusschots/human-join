# humanJoin.js
A JavaScript utility for joining lists in a human-friendly way.

```
const hjn = require('@bartificer/human-join');

const peeps = ['Tom', 'Dick', 'Harry'];

console.log( hjn.join(test) ); // Tom, Dick & Harry
console.log( hjn.and.join(test) ); // Tom, Dick and Harry
console.log( hjn.oxAnd.join(test) ); // Tom, Dick, and Harry
console.log( hjn.or.join(test) ); // Tom, Dick or Harry
console.log( hjn.oxOr.join(test) ); // Tom, Dick, or Harry
console.log( hjn.q.join(test) ); // 'Tom', 'Dick' & 'Harry'
console.log( hjn.qq.join(test) ); // "Tom", "Dick" & "Harry"
console.log( hjn.oxAnd.q.join(test) ); // 'Tom', 'Dick', and 'Harry'
```
