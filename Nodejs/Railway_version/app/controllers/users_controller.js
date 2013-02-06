load('application');

before(loadUser, {only: ['show', 'edit', 'update', 'destroy']});
before(checkCreationParams, {only : 'create'});
before(use('checkSession'), {only: ['edit', 'update', 'destroy']})

action('new', function () {
    this.title = 'New user';
    this.user = new User;
    render();
});

action(function create() {
    var new_user = {
        username : req.body.User.username,
        password : req.body.User.password,
        email : req.body.User.email,
        home : '/users/' + req.body.User.username + '/'
    };

    User.create(new_user, function (err, user) {
        if (err) {
            flash('error', 'User can not be created');
            render('new', {
                user: user,
                title: 'New user'
            });
        } else {
            flash('info', 'User created');
            redirect(path_to.users());
        }
    });
});

action(function index() {
    this.title = 'Users index';
    User.all(function (err, users) {
        render({
            users: users
        });
    });
});

action(function show() {
    this.title = 'User show';
    render();
});

action(function edit() {
    this.title = 'User edit';
    render();
});

action(function update() {
    this.user.updateAttributes(req.body.User, function (err) {
        if (!err) {
            flash('info', 'User updated');
            redirect(path_to.user(this.user));
        } else {
            flash('error', 'User can not be updated');
            this.title = 'Edit user details';
            render('edit');
        }
    }.bind(this));
});

action(function destroy() {
    this.user.destroy(function (error) {
        if (error) {
            flash('error', 'Can not destroy user');
        } else {
            flash('info', 'User successfully removed');
        }
        send("'" + path_to.users() + "'");
    });
});

function loadUser() {
    User.find(params.id, function (err, user) {
        if (err || !user) {
            flash('error', 'User doesn\'t exist');
            redirect(path_to.users());
        } else {
            this.user = user;
            next();
        }
    }.bind(this));
}

function checkCreationParams() {
    if (req.body.User.password != req.body.User.password_confirm) {
        flash('error', 'Passwords don\'t match');
        redirect(path_to.new_user());
    } else {
        next();
    }
}
