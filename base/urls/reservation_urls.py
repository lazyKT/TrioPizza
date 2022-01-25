from django.urls import path
from base.views import reservation_views as views


urlpatterns = [
    path('', views.ReservationList.as_view()),
    path('users/<int:pk>/', views.get_users_reservation, name='users-reservations'),
    path('restaurant/day/<int:pk>', views.get_reservations_by_day, name='reservations-by-day'),
    path('restaurant/<int:pk>', views.get_reservations_by_timeslot, name='reservations-timeslots'),
    path('<int:pk>/', views.ReservationDetails.as_view()),
]
