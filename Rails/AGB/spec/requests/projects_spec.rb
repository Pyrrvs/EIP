require 'spec_helper'

describe "Projects" do
	it "should create a new project and redirect to the project view" do
		user = FactoryGirl.create(:user)
		project = FactoryGirl.attributes_for(:project, user: user)
		visit user_path(user)
		within("#user-projects") do
			click_link "New Project"
		end
		current_path.should == new_user_project_path(user)
		fill_in "project_name", with: project[:name]
		fill_in "project_description", with: project[:description]
		fill_in "project_privacy", with: project[:privacy]
		click_button "Create Project"
		current_path.should == user_project_path(user.name, project[:name])
		page.should have_content(project[:name])
		page.should have_content(project[:description])
		page.should have_content(project[:privacy])

	end

	it "should list the user projects when visiting the user page" do
		user = FactoryGirl.create(:user)
		project1 = FactoryGirl.create(:project, user: user)
		project2 = FactoryGirl.create(:project, user: user)
		visit user_path(user)
		within("#user-projects") do
			page.should have_content("#{project1.name}")
			page.should have_content("#{project1.description}")
			page.should have_content("#{project1.privacy}")
			page.should have_content("#{project2.name}")
			page.should have_content("#{project2.description}")
			page.should have_content("#{project2.privacy}")
		end
	end

	it "should destroy all the associate projects when a user is destoyed" do
		user = FactoryGirl.create(:user)
		project1 = FactoryGirl.create(:project, user: user)
		project2 = FactoryGirl.create(:project, user: user)
		user.destroy()
		assert(Project.where('user_id=?', user.id).any? == true)
	end

	it 'should destroy a project when clicking on the destroy link', js: true do
		user = FactoryGirl.create(:user)
		project1 = FactoryGirl.create(:project, user: user)
		visit user_path(user)
		within("##{project1.name}") do
			click_link 'Destroy'
		end
	end
end
