from django.contrib import admin
from .models import Contact, SocialMedia, PolicyandTerms

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('phone', 'email', 'location')

@admin.register(SocialMedia)
class SocialMediaAdmin(admin.ModelAdmin):
    list_display = ('instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok')

@admin.register(PolicyandTerms)
class PolicyandTermsAdmin(admin.ModelAdmin):
    list_display = ('privacy_policy', 'terms_of_service', 'return_policy')




