var koa = require('koa')
  , session = require('koa-session')
  , flash = require('./')
  , request = require('supertest');

function App(opts) {
  var app = koa();

  app.keys = ['foo'];
  app.use(session());
  app.use(flash(opts));

  return app;
}

describe('koa flash', function () {
  it('should add a flash function', function (done) {
    var app = App();

    app.use(function *() {
      this.body = typeof this.flash;
    });

    request(app.listen())
    .get('/')
    .expect("function")
    .expect(200, done);
  });

  it('should require koa-session', function (done) {
    var app = koa();
    app.use(flash());

    request(app.listen())
    .get('/')
    .expect(500, done);
  });

  it('should set flash into session', function (done) {
    var app = App();

    app.use(function *() {
      this.flash('error', 'foo');

      this.body = this.session.flash['error'];
    });

    request(app.listen())
    .get('/')
    .expect(['foo'])
    .expect(200, done);
  });

  describe('when flash is set', function () {
    var agent;

    beforeEach(function (done) {
      var app = App();

      app.use(function *() {
        this.body = this.flash();

        if (this.method === 'POST') {
          this.flash('foo', 'bar');
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

    it('should remember flash messages for one request', function (done) {
      agent.get('/')
      .expect({ foo: ['bar'] })
      .expect(200, done);
    });

    it('should delete flash messages after one request', function (done) {
      agent.get('/')
      .expect({ foo: ['bar'] })
      .expect(200)
      .end(function(err) {
        setImmediate(function() {
          agent.get('/')
          .expect({})
          .expect(200, done);
        });
      });
    });
  });
});
