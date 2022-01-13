from django.urls import path
from base.views import restaurant_views as views


urlpatterns = [
    path('', views.RestaurantList.as_view()),
    path('location/<int:pk>/', views.edit_restaurant_location, name='edit-restaurant-location'),
    path('<int:pk>/', views.RestaurantDetails.as_view()),
]
