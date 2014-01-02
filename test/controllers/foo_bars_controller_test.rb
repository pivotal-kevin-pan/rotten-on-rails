require 'test_helper'

class FooBarsControllerTest < ActionController::TestCase
  test "should get baz" do
    get :baz
    assert_response :success
  end

  test "should get quux" do
    get :quux
    assert_response :success
  end

end
