before('protect from forgery', function () {
  protectFromForgery('63a5453317e041b63cf64628b56836ef48bcdd01');
});

publish('checkSession', checkSession);

function checkSession() {
	console.log('nique ta mere moreau', session);
    if (!session.passport.user) {
        req.session.redirect = req.path;
        redirect('/users');
    } else {
        User.find(session.passport.user, function (err, user) {
            if (user && user.email === 'my.email@somehost.tld') {
                req.user = user;
                next();
            } else {
                flash('error', 'You have no permission to access this area');
                redirect('/');
            }
        });
    }
}
