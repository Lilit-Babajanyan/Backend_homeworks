### Question1

In the CommonJS version, if you had written exports = { add, subtract,
multiply } instead of individually attaching each function to exports , what
would happen when you `require()` that file from index.js ? Why?

### Answer

It won't work as expected.

In CommonJS, require() returns the value of module.exports. At the beginning, `exports` and `module.exports` point to the same object.

When we write:

exports.add = add;

we add a property to the original object. Therefore, `module.exports` also contains the `add` function.

When we write:

exports = { add, subtract, multiply };

we are assigning a new object to the `exports` variable and breaking its connection with `module.exports`.

After that, `module.exports` is still the original empty object. Since `require()` returns `module.exports`, the other file receives an empty object instead of the three functions.

### Question 2

Why does `utils/strings.js` in the CJS folder use `module.exports = ...` while `utils/math.js` uses `exports.xxx = ...`? Could you have written `math.js` using `module.exports` instead? What would change on the importing side?

### Answer

`math.js` uses `exports.xxx = ...` to add multiple functions to the exported object.

`strings.js` uses `module.exports = ...` because it has one main function. Instead of putting that function inside an object, we can export the function itself, which makes it easier to import and use directly.

Yes, we could write `math.js` using `module.exports` instead:
Nothing would change on the importing side because `math.js` would still export an object containing the functions.

### Question 3

In the ESM version, why is the exact file extension required on import
`./utils/math.js` , when the CJS version works fine with
require('./utils/math') ?

### Answer

Because ESM and CommonJS use different rules for finding modules (module-resolution systems).
With CommonJS, require() can resolve a path without the extension.
In case of CommonJS there is a module resolution algorithm that tries to find the module when we use require().

In case of ES Modules the file extension must be provided when using import with relative or absolute paths of the modules. ESM uses standard URL-style resolution for these paths, so Node.js expects the import to specify the actual file.
So CommonJS require() can automatically resolve the .js extension, while Node.js ESM import requires the file extension for relative imports.

### Question 4

Name one thing ES Modules can do that CommonJS cannot, and explain briefly
why the difference exists (hint: think about how each system loads files —
synchronously vs. not).

### Answer

There are two ways to load a module:

CommonJS:

const data = require('./data');

ESM:

import data from './data.js';

The important difference is that require() is synchronous, while ESM's module system is designed to handle asynchronous loading. That means that ES Modules support Top-Level await.

For example, an ES module can use:

const data = await getData();

await means that the module can wait for an asynchronous operation to finish.

CommonJS uses require():

const data = require('./data');

require() works synchronously. It loads the module and returns its exports without waiting for asynchronous operations inside the module.

require() only supports loading ECMAScript modules that meet the following requirements:

1.The module is fully synchronous (contains no top-level await); and
2.One of these conditions are met:
3.The file has a .mjs extension.
4.The file has a .js extension, and the closest package.json contains "type": "module"
5.The file has a .js extension, the closest package.json does not contain "type": "commonjs", and the module contains ES module syntax.

If the ES Module being loaded meets the requirements, require() can load it and return the module namespace object (A module namespace object is an object that describes all exports from a module. It is a static object that is created when the module is evaluated.). In this case it is similar to dynamic import() but is run synchronously and returns the name space object directly.
