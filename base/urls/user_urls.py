from django.urls import path
from base.views import user_views as views


urlpatterns = [
    path('', views.UserList.as_view()),
    path('login/', views.MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('addresses/', views.ShippingAddressList.as_view(), name="user-saved-addresses"),
    path('<int:pk>/addresses/', views.get_user_saved_addresses, name='user-saved-addresses'),
    path('<int:pk>/', views.UserDetails.as_view(), name='user'),
]
