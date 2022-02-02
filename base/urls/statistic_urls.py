from django.urls import path
from base.views import statistic_views as views


urlpatterns = [
    path('restaurant-orders/', views.RestaurantStatisticView.as_view()),
    path('district-orders/', views.DistrictStatisticView.as_view()),
    path('restaurant-register/', views.RestaurantResgiterationView.as_view()),
    path('driver-order-deliveries/', views.DriverOrderDeliveries.as_view())
]
