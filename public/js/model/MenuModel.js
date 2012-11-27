define(['src/Model'], function(Model) {

	function MenuModel(core) {

		MenuModel.superclass.constructor.call(this, core);
		this.observers.push(this.core.menuView);
		this.entities = [
			{ name : 'Mario', group : 'Hero', profile : null, bodyType : 'Dynamic' },
			{ name : 'Plat1', group : 'Platforms', profile : null, bodyType : 'Static' },
			{ name : 'Plat2', group : 'Platforms', profile : null, bodyType : 'Static' },
			{ name : 'Plat3', group : 'Platforms', profile : null, bodyType : 'Static' },
			{ name : 'Soldier', group : 'Army', profile : null, bodyType : 'Dynamic' },
			{ name : 'Commander', group : 'Army', profile : null, bodyType : 'Dynamic' },
			{ name : 'General', group : 'Army', profile : null, bodyType : 'Dynamic' },
		];
		this.profiles = [
			{ name : 'DynamicBody', group : 'Army', bodyType : 'Dynamic' },
			{ name : 'StaticBody', group : 'Platforms', bodyType : 'Static' },
		];
		this.sprites = [
			"kGameEngine/../resource/ball.png",
			"kGameEngine/../resource/crate.jpg",
		];
		this.sendEntities();
		this.sendProfiles();
		this.sendSprites();
	}

	MenuModel.inherit(Model, {

		entities : null,

		getEntityIdxByName : function(entityName) {

			var entity;
			for (var i in this.entities) {
				entity = this.entities[i];
				if (entityName == entity.name)
					return (i);
			}
			return (-1);
		},

		deleteEntity : function(entityName) {

			var i = this.getEntityIdxByName(entityName);

			if (i == -1)
				return;
			var entity = this.entities[i];
			for (var j in this.observers)
				this.observers[j].deleteEntity(entity);
			delete this.entities[i];
		},

		deleteGroup : function(groupName) {

			for (var i in this.entities)
				if (groupName == this.entities[i].group)
					delete this.entities[i];
			for (var j in this.observers)
				this.observers[j].deleteGroup(groupName);
		},

		getEntityData : function(entityName) {

			var i = this.getEntityIdxByName(entityName);
			return (i == -1 ? null : this.entities[i]);
		},

		sendEntities : function() {

			var obs = this.observers;
			for (var i in this.entities)
				for (var x in obs)
					obs[x].newEntity(this.entities[i]);
		},

		sendProfiles : function() {

			var obs = this.observers;
			for (var i in this.profiles)
				for (var x in obs)
					obs[x].newProfile(this.profiles[i]);
		},

		sendSprites : function() {

			for (var i in this.sprites)
				for (var j in this.observers)
					this.observers[j].newSprite(this.sprites[i]);
		},
	});

	return (MenuModel);
});