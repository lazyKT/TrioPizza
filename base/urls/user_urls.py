from django.urls import path
from base.views import user_views as views


urlpatterns = [
    path('', views.UserList.as_view()),
    path('login/', views.MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('addresses/', views.ShippingAddressList.as_view(), name="user-saved-addresses"),
    path('drivers/status', views.get_all_driver_status, name='get-driver-status'),
    path('drivers/status/update', views.update_driver_status, name='update-driver-status'),
    path('drivers/status/save', views.create_new_driver_record, name='get-driver-status'),
    path('drivers/status/available', views.get_all_avaialble_drivers, name='create-new-driver'),
    path('drivers/status/<int:pk>/', views.get_driver_status_by_id, name='create-new-driver'),
    path('<int:pk>/addresses/', views.get_user_saved_addresses, name='user-saved-addresses'),
    path('<int:pk>/', views.UserDetails.as_view(), name='user'),
]
