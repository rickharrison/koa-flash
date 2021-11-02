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
