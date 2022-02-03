from django.urls import path
from base.views import statistic_views as views


urlpatterns = [
    path('restaurant-orders/<int:pk>/', views.RestaurantOrdersStatusView.as_view()),
    path('district-orders/', views.DistrictStatisticView.as_view()),
    path('restaurant-register/', views.RestaurantResgiterationView.as_view()),
    path('driver-order-deliveries/', views.DriverOrderDeliveries.as_view()),
    path('restaurant-reserve-orders/<int:pk>/', views.RestaurantOrderReservationStatictisView.as_view()),
    path('restaurant-products/<int:pk>/', views.RestaurantsProductsView.as_view()),
    path('test-email/', views.test_email, name='test-email')
]
