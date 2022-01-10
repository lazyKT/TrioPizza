from django.urls import path
from base.views import restaurant_views as views


urlpatterns = [
    path('', views.RestaurantList.as_view()),
    path('<int:pk>/', views.RestaurantDetails.as_view())
]
