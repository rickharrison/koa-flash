#koa-flash

Flash messages for your [koa](https://github.com/koajs/koa) application.

[![Build Status](https://travis-ci.org/rickharrison/koa-flash.svg?branch=master)](https://travis-ci.org/rickharrison/koa-flash)

## Installation

```js
$ npm install koa-flash
```

koa-flash also depends on [koa-session](https://github.com/koajs/session). You must add koa-session as a middleware prior to adding koa-flash as seen in the example:

## Example

```js
import Koa from 'koa';
import Router from 'koa-router';
import session from 'koa-session';
import flash from 'koa-flash';

const app = new Koa();
const router = new Router();

app.keys = [ 'foo' ];
app.use(session());
app.use(flash());

router.post('/', function(ctx) {
  ctx.flash = { error: 'This is a flash error message.' };
});

router.get('/', function(ctx) {
  ctx.body = ctx.flash.error || 'No flash data.';
});

app.listen(3000);
```

## Semantics

Flash data when set will be saved to the user's session for exactly one more request. You can save any javascript object into `ctx.flash` (Object, Number, String, etc.). A common use case is to save an error message from a `POST` request when redirecting to a `GET` request to display the form again.

## Options

Flash data is saved into `ctx.session['koa-flash']` by default. You can change this by passing in a `key` option.

```js
app.use(flash({ key: 'foo' }));
```

Also, you can set `defaultValue` instead of `{}`.

```js
app.use(flash({ defaultValue: 'bar' }));
```

## License

MIT
