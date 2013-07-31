AGB::Application.routes.draw do
  
  root to: 'application#index', via: :get

  get "session" => "session#show"
  post "session" => "session#create"
  delete "session" => "session#destroy"

  resources :users, except: [ :new, :index ]
  resources :projects, except: [ :new, :index ] do
    get "worldmaker" => "worldmaker#index"
    get "worldmaker/world" => "worldmaker#world"
    put "worldmaker/world" => "worldmaker#update"
  end
  resources :resources
  resources :projects_comments
  resources :client_views, only: [:show]

  # constraints id: '[a-zA-Z0-9\_\-]+' do
  #   get ":id/edit" => "users#edit", as: 'edit_user'
  #   resources :users, except: [ :new, :index ], constraints: {user_id: '[a-zA-Z0-9\_\-]+'}, path: '/' do
  #     resources :projects, except: [ :index ], constraints: {project_id: '.[a-zA-Z0-9\_\-]+'}, path: '/' do
  #       get "worldmaker" => "worldmaker#index"
  #       get "worldmaker/world" => "worldmaker#world"
  #       put "worldmaker/world" => "worldmaker#update"
  #       resources :resources
  #       resources :project_comments
  #     end
  #   end
  # end

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
