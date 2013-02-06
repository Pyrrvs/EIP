require('../test_helper.js').controller('users', module.exports);

var sinon  = require('sinon');

function ValidAttributes () {
    return {
        username: 'unit_test',
        password: 'toto',
        email: 'unit_test@agbuilder.eu',
        home: '/users/unit_test/'
    };
}

function InvalidAttributes () {
    return {
        username: '',
        password: '',
        email: '',
        home: ''
    };
}

exports['users controller'] = {

    'GET new': function (test) {
        test.get('/users/new', function () {
            test.success();
            test.render('new');
            test.render('form.' + app.set('view engine'));
            test.done();
        });
    },

    'GET index': function (test) {
        test.get('/users', function () {
            test.success();
            test.render('index');
            test.done();
        });
    },

    'GET edit': function (test) {
        var find = User.find;
        User.find = sinon.spy(function (id, callback) {
            callback(null, new User);
        });
        test.get('/users/42/edit', function () {
            test.ok(User.find.calledWith('42'));
            User.find = find;
            test.success();
            test.render('edit');
            test.done();
        });
    },

    'GET show': function (test) {
        var find = User.find;
        User.find = sinon.spy(function (id, callback) {
            callback(null, new User);
        });
        test.get('/users/42', function (req, res) {
            test.ok(User.find.calledWith('42'));
            User.find = find;
            test.success();
            test.render('show');
            test.done();
        });
    },

    'POST create': function (test) {
        var newUser = new ValidAttributes;
        newUser.password_confirm = newUser.password;

        sinon.spy(User, 'create');
        test.post('/users', {User: newUser}, function () {
            test.redirect('/users');
            test.flash('info');
            test.strictEqual(User.create.calledOnce, true);
            User.create.restore();
            test.done();
        });
    },

    'POST create fail': function (test) {
        var newUser = new ValidAttributes;
        newUser.password_confirm = "wrong password";

        sinon.spy(User, 'create');
        test.post('/users', {User: newUser}, function () {
            test.redirect('/users/new');
            test.flash('error');
            test.strictEqual(User.create.called, false);
            User.create.restore();
            test.done();
        });
    },

    'PUT update': function (test) {
        test.put('/users/1', {User: new ValidAttributes}, function () {
            test.redirect('/users/1');
            test.flash('info');
            test.done();
        });
    },

    'PUT update fail': function (test) {
        test.put('/users/1', {User: new InvalidAttributes}, function () {
            test.success();
            test.render('edit');
            test.flash('error');
            test.done();
        });
    },

    'DELETE destroy': function (test) {
        test.del('/users/1', function() {
            test.success();
            test.flash('info');
            test.done();
        });
    },

    'DELETE destroy fail': function (test) {
        test.del('/users/42', function() {
            test.redirect('/users');
            test.flash('error');
            test.done();
        });
    }
};

