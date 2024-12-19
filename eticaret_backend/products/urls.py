""" from django.urls import path, include
from .views import CategoryViewSet, SubCategoryViewSet, ProductViewSet

urlpatterns = [
    path('categories/', CategoryViewSet.as_view({'get': 'list'})),
    path('categories/<slug:slug>/', CategoryViewSet.as_view({'get': 'retrieve'})),
    path('subcategories/', SubCategoryViewSet.as_view({'get': 'list'})),
    path('subcategories/<slug:slug>/', SubCategoryViewSet.as_view({'get': 'retrieve'})),
    path('products/', ProductViewSet.as_view({'get': 'list'})),
    path('products/<slug:slug>/', ProductViewSet.as_view({'get': 'retrieve'})),
    path('products/<slug:slug>/review/', ProductViewSet.as_view({'post': 'review'}), name='product-review'),
] """