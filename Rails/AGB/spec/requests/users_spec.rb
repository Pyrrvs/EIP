require 'spec_helper'

describe "Users" do
	it 'should be register when signing up', js: true do
		user = FactoryGirl.attributes_for(:user)
		visit root_path
		click_link "Sign Up"
		within '#new_user' do
			fill_in "user_name", with: user[:name]
			fill_in "user_password", with: user[:password]
			fill_in "user_password_confirmation", with: user[:password_confirmation]
			fill_in "user_email", with: user[:email]
			click_button "Sign Up"
		end
		page.should have_content("Congratulations ! You have been added to AGB as #{user[:name]} !")
	end
end
