const Koa = require('koa');
const session = require('koa-session');
const request = require('supertest');

const flash = require('./index.js');


function App(opts) {
  const app = new Koa();

  app.keys = ['foo'];
  app.use(session(app));
  app.use(flash(opts));

  return app;
}

describe('koa flash', function () {
  it('should add a flash property', function (done) {
    const app = App();

    app.use(function (ctx, next) {
      ctx.body = ctx.flash;
      next();
    });

    request(app.listen())
    .get('/')
    .expect({})
    .expect(200, done);
  });

  it('should require koa-session', function (done) {
    const app = new Koa();
    app.use(flash());

    request(app.listen())
    .get('/')
    .expect(403, done);
  });

  it('should set flash into session', function (done) {
    const app = App();

    app.use(function (ctx, next) {
      ctx.flash = 'foo';
      ctx.body = ctx.session['koa-flash'];
    });

    request(app.listen())
    .get('/')
    .expect('foo')
    .expect(200, done);
  });

  it('should set flash into opts.key', function (done) {
    const app = App({ key: 'foo' });

    app.use(function (ctx, next) {
      ctx.flash = 'bar';
      ctx.body = ctx.session.foo;
    });

    request(app.listen())
    .get('/')
    .expect('bar')
    .expect(200, done);
  });

  it('defaultValue for flash', function (done) {
    const app = App({ defaultValue: 'bar' });

    app.use(function (ctx, next) {
      ctx.body = ctx.flash;
    });

    request(app.listen())
    .get('/')
    .expect('bar')
    .expect(200, done);
  });

  describe('when flash is set', function () {
    let agent = null;

    beforeEach(function (done) {
      const app = App();

      app.use(function (ctx, next) {
        if (ctx.path == '/redirect') {
          return ctx.redirect('back');
        }

        ctx.body = ctx.flash;

        if (ctx.method === 'POST') {
          ctx.flash = { foo: 'bar' };
        }
      });

      agent = request.agent(app.listen());

      agent.post('/')
      .end(function (err) {
        if (err) return done(err);

        setImmediate(function () {
          done();
        });
      });
    });

    function expectFlash(done) {
      agent.get('/')
      .expect({ foo: 'bar' })
      .expect(200, done);
    }

    function expectFlashDeleted(done) {
      agent.get('/')
      .expect({ foo: 'bar' })
      .expect(200)
      .end(function(err) {
        setImmediate(function() {
          agent.get('/')
          .expect({})
          .expect(200, done);
        });
      });
    }

    it('should remember flash messages for one request', expectFlash);

    it('should delete flash messages after one request', expectFlashDeleted);

    describe('and app redirects a request', function () {

      beforeEach(function (done) {
        agent.get('/redirect').expect(302, function(err) {
          setImmediate(function() {
            agent.get('/redirect').expect(302, done);
          });
        });
      });

      it('should remember flash messages across redirects', expectFlash);

      it('should delete flash messages after redirect is resolved', expectFlashDeleted);

    });
  });
});
