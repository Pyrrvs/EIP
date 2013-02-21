FactoryGirl.define do
	factory :user do
		sequence(:name)			{ |n| "Test#{n}" }
		password 				"toto42"
		password_confirmation	{ "#{password}" }
		email					{ "#{name}@agb.com".downcase }
	end

	factory :project do
		association				:user
		sequence(:name)			{ |n| "Proj#{n}" }
		description				{ "Project #{name} description" }
		nb_stars				0
		privacy					"public"
	end
end