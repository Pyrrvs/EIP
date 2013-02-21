require 'spec_helper'

describe "Sessions" do
	it 'should create a session when a valid user log in', js: true do
		user = FactoryGirl.create(:user)
		visit root_path
		within("#sign-in") do
			fill_in "name", with: user.name
			fill_in "password", with: user.password
			click_button "Sign In"
		end
	end

	it 'should not create a session when a invalid user log in', js: true do
		visit root_path
		within("#sign-in") do
			fill_in "name", with: 'nosuchuser'
			fill_in "password", with: 'wrongpassword'
			click_button "Sign In"
		end
		find("#profile").should_not have_content('Welcome ')
		find("#profile").find("span").should_not have_content('nosuchuser')
	end

	it 'should destroy a session when a logged user log out', js: true do
		user = FactoryGirl.create(:user)
		visit root_path
		within("#sign-in") do
			fill_in "name", with: user.name
			fill_in "password", with: user.password
			click_button "Sign In"
		end
		within("#profile") do
			click_link "Sign out"
		end
	end

	it 'should not destroy a session when the user does not have any session' do
	end
end
