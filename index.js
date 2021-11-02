/**
 * Initialize flash middleware with `options`
 *
 * - `key` session property name (default: koa-flash)
 * - `defaultValue` default value for this.flash (default: {})
 *
 * @param {Object} options
 * @return {async function}
 * @api public
 */

function koaFlashMiddleware(options = {}) {
  const opt = { key: 'koa-flash', defaultValue: {}, ...options };

  return async function koaFlash(ctx, next) {
    if (ctx.session == undefined) ctx.throw(403, 'Session middleware required (e.g. koa-session)');

    // flash data from previous request?
    const data = ctx.session[opt.key] || opt.defaultValue;
    delete ctx.session[opt.key]; // don't leave it hanging around

    // set up 'flash' setter/getter on ctx object
    Object.defineProperty(ctx, 'flash', {
      enumerable: true,
      set: function(val) { ctx.session[opt.key] = val; },
      get: function()    { return data; },
    });

    await next();

    // enable flash messages to propagate across redirects
    if (ctx.status == 302 && !ctx.session[opt.key]) {
      ctx.session[opt.key] = data;
    }
  };
}

module.exports = koaFlashMiddleware;
