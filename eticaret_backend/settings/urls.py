from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, SocialMediaViewSet, PolicyandTermsViewSet


router = DefaultRouter()
router.register(r'contact', ContactViewSet, basename='contact')
router.register(r'social-media', SocialMediaViewSet, basename='social-media')
router.register(r'policies', PolicyandTermsViewSet, basename='policies')


urlpatterns = router.urls