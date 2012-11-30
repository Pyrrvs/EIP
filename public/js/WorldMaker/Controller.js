define(["class"], function(Class) {

	var Controller = Class.extend({

		data : null,

		setUp : function(hook) {

			$.ajax(window.location.pathname + "/getWorld", { type : "GET", dataType : "json", success : function(data) {
				this.data = data;
				hook();
			}.bind(this), error : function(log) { console.log(log)}});
			return (this);
		},

		update : function(req) {

			$.ajax(window.location.pathname + "/putWorld", { type : "PUT", dataType : "json", data : JSON.stringify(this.data), success : function(data) {
				console.log("Update Ok");
			}});
		},

	    getLevel : function(req) {

	        return (this.data.levels);
	    },

	    createLevel : function(req) {

	    	if (req.level == "")
	    		return (null);
	    	for (var i in this.data.levels)
	    		if (this.data.levels[i].name == req.level)
	    			return (null);
	    	var level = { name : req.level, camera : { zoom : 1 }, entities : [] };
	        this.data.levels.push(level);
	        return (level);
	    },

	    deleteLevel : function(req) {

	        var name = req.name;
	        this.data.levels = _.reject(this.data.levels, function(elem, i, coll) {
	            return (elem.name == name);
	        });
	    },

	    createClass : function(req) {

	        this.data.classes.push(req.class)
	    },

	    deleteClass : function(req) {

	        var classes = req.classes;

	        this.data.classes = _.reject(this.data.classes, function(elem) {
	            return (_.find(classes, function(e) {
	                return (e == elem.name);
	            }));
	        });
	    },

	    deleteGroup : function(req) {

	        this.data.classes = _.reject(this.data.classes, function(elem) {
	            return (elem.group == req.group);
	        });
	    },

	    createEntity : function(req) {

	        var level = req.level;
	        for (var i in this.data.levels)
	            if (this.data.levels[i].name == level)
	                this.data.levels[i].entities.push(entity);
	        return ({
		        id : "defaultId" + this.data.id++,
		        model : null,
		        class : null,
		        position : { x : 0, y : 0 },
		        scale : 1,
		        rotation : 0,
	        });
	    },

	    deleteEntity : function(req) {

	        var entity = req.entity, level = req.level;
	        for (var i in this.data.levels)
	            if (this.data.levels[i].name == level)
	                this.data.levels[i].entities = _.reject(this.data.levels[i].entities, function(elem) {
	                    return (entity.id == elem.id);
	                });
	    },

	    updateEntity : function(req) {

	        var entity = JSON.parse(req.entity);
	        for (var i in this.data.levels)
	            for (var j in this.data.levels[i].entities)
	                if (this.data.levels[i].entities[j].id == entity.id)
	                    this.data.levels[i].entities[j] = entity;
	    },

	    getClass : function(req) {

	        return (this.data.classes);
	    },

	    getSprite : function(req) {

	        return (this.data.sprites);
	    },
	});

	return (function () { return new Controller });
});