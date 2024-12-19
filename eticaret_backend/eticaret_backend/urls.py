from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from products.views import CategoryViewSet, SubCategoryViewSet, ProductViewSet, SliderViewSet
from settings.views import ContactViewSet, SocialMediaViewSet, PolicyandTermsViewSet
# API router'ı oluştur
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategories')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'sliders', SliderViewSet, basename='sliders')  



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', include(router.urls)),
        path('auth/', include('accounts.urls')),
        path('orders/', include('orders.urls')),   
        path('settings/', include('settings.urls')),
    ])),
    path('tinymce/', include('tinymce.urls')),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)