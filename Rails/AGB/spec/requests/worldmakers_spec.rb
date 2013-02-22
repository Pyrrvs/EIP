require 'spec_helper'

describe "Worldmaker", js: true do
	it 'should load the worldmaker when accessing a valid project' do
		user = FactoryGirl.create(:user)
		project = FactoryGirl.create(:project, user: user)
		visit user_project_path(user, project)
		click_link "World Maker"
		current_path.should == user_project_worldmaker_path(user, project)
		page.should have_selector("#worldmaker")
	end

	it 'should save the project when clicking the save button', js: true do
		user = FactoryGirl.create(:user)
		project = FactoryGirl.create(:project, user: user)
		visit user_project_worldmaker_path(user, project)
		page.should have_selector("#worldmaker")
		click_button "save"
		find("#save").should have_content("successfully saved !")
	end

	# it 'should render not found when accessing a invalid project' do
	# 	user = FactoryGirl.attributes_for(:user)
	# 	project = FactoryGirl.attributes_for(:project, user: user)
	# 	visit user_project_worldmaker_path(user[:name], project[:name])
	# 	page.should have_content('Internal server error')
	# end
end
