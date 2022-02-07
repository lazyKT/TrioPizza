from django.urls import path
from base.views import support_views as views


urlpatterns = [
    path('', views.SupportListView.as_view())
]
