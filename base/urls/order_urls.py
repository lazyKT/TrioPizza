from django.urls import path
from base.views import order_views as views


urlpatterns = [

    path('', views.OrderList.as_view(), name='orders'),
    # path('', views.getOrders, name='orders'),
    # path('add/', views.addOrderItems, name='orders-add'),
    path('myorders/<str:pk>', views.get_user_orders, name='myorders'), # get users orders by users id
    path('deliveries/<str:pk>', views.get_orders_by_driver, name='my-deliveries'),
    path('driver-stats/<str:pk>', views.get_driver_order_stats, name='driver-order-stats'),
    path('assign-driver/', views.assign_driver_to_order, name='driver-assignment'),
    path('<str:pk>/', views.OrderDetails.as_view(), name='user-order'),
    path('<str:pk>/deliver/', views.updateOrderToDelivered, name='order-delivered'),
    path('<str:pk>/pay/', views.updateOrderToPaid, name='pay'),
    path('<str:pk>/cancel/', views.cancel_order, name='pay'),
]
