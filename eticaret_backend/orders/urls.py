from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register('', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/', OrderViewSet.as_view({'get': 'list'}), name='order-list'),
   
]