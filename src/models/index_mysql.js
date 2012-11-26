var kNode = require('../../util/kNode.js')

module.exports = kNode.Model.extend({

    db : null,

    ctor : function() {

        this.super();
        this.db = require('./model_mysql.js');
    },
});