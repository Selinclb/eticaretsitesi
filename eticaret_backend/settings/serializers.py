from rest_framework import serializers
from .models import Contact, SocialMedia, PolicyandTerms

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['phone', 'email', 'location']

class SocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedia
        fields = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok']

class PolicyandTermsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyandTerms
        fields = ['privacy_policy', 'terms_of_service', 'return_policy']

