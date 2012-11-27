define(['src/Controller', 'util/underscore'], function(Controller, _) {

	function MenuController(core) {

		MenuController.superclass.constructor.call(this, core);
		this.view = this.core.menuView;
		this.model = this.core.menuModel;

//		this.clickEntity('Mario');
	}

	MenuController.inherit(Controller, {

		view : null,
		currentEntity : "",
		currentGroup : "",

		clickCreateGroup : function(group) {

			if (group != "" && this.view.groupExists(group) == -1)
				this.view.createGroup(group);
		},

		clickDeleteGroup : function() {

			if (this.currentGroup != "") {
				this.model.deleteGroup(this.currentGroup);
				this.currentGroup = "";
			}
		},

		clickEntity : function(entity) {

			this.currentEntity = entity;
			this.view.showEntity(this.model.getEntityData(entity));
		},

		clickDeleteGroup : function(group) {

			this.model.deleteGroup(group);
		},

		clickDeleteEntity : function(entity) {

			this.model.deleteEntity(entity);
		},
	});

	return (MenuController);
});