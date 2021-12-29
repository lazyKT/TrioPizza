from django.urls import path
from base.views import reservation_views as views


urlpatterns = [
    path('', views.ReservationList.as_view()),
    path('<int:pk>/', views.ReservationDetails.as_view()),
    path('users/<int:pk>/', views.get_users_reservation, name='users-reservations')
]
