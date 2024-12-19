from rest_framework import viewsets
from .models import Contact, SocialMedia, PolicyandTerms
from .serializers import ContactSerializer, SocialMediaSerializer, PolicyandTermsSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

class SocialMediaViewSet(viewsets.ModelViewSet):
    queryset = SocialMedia.objects.all()
    serializer_class = SocialMediaSerializer

class PolicyandTermsViewSet(viewsets.ModelViewSet):
    queryset = PolicyandTerms.objects.all()
    serializer_class = PolicyandTermsSerializer


