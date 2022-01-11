from django.urls import path
from base.views import product_views as views

urlpatterns = [

    path('', views.ProductList.as_view(), name="products"),
    path('upload/', views.uploadImage, name="image-upload"),
    path('top/', views.getTopProducts, name='top-products'),
    path('restaurants/<int:restaurant_id>', views.get_products_by_restaurant, name='products-from-restaurant'),
    path('<str:pk>/reviews/', views.createProductReview, name="create-review"),
    path('<int:pk>/', views.ProductDetails.as_view(), name="products-details"),
]
