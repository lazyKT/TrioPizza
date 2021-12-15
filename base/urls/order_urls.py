from django.urls import path
from base.views import order_views as views


urlpatterns = [

    path('', views.OrderList.as_view(), name='orders'),
    path('<str:pk>/', views.OrderDetails.as_view(), name='user-order'),
    # path('', views.getOrders, name='orders'),
    # path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/', views.getMyOrders, name='myorders'),

    path('<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),

    path('<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
]
