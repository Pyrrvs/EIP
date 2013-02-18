FactoryGirl.define do
	factory :user do
		sequence(:name)			{ |n| "Test#{n}" }
		password 				"toto42"
		password_confirmation	{ "#{password}" }
		email					{ "#{name}@agb.com".downcase }
	end
end