require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  setup do
    @user = users(:one)
    @update = {
      name: "Moreau",
      password: "toto42",
      email: "moreau@agb.com"
    }
  end

  test "should create user" do
    @update.password_digest = BCrypt::Password.create(@update.password)
    assert_difference('User.count') do
      post :create, user: @update
    end

    assert_redirected_to user_path(assigns(:user))
  end

  # test "should show user" do
  #   get :show, id: @user
  #   assert_response :success
  # end

  # test "should get edit" do
  #   get :edit, id: @user
  #   assert_response :success
  # end

  # test "should update user" do
  #   put :update, id: @user, user: { email: @user.email, name: @user.name, password: @user.password }
  #   assert_redirected_to user_path(assigns(:user))
  # end

  # test "should destroy user" do
  #   assert_difference('User.count', -1) do
  #     delete :destroy, id: @user
  #   end

  #   assert_redirected_to users_path
  # end
end
