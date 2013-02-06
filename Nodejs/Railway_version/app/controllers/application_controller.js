before('protect from forgery', function () {
    protectFromForgery('833e29c7eed6094c22eb739c5685ebdba5331f50');
});

publish('checkSession', checkSession);

function checkSession() {
    console.log('nique ta mere kraoz', session);
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
