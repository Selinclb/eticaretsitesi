from django.db import models
from tinymce.models import HTMLField

class Contact(models.Model):
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
   
    def __str__(self):
        return self.phone
    
    class Meta:
        verbose_name = 'İletişim Bilgileri'
        verbose_name_plural = 'İletişim Bilgileri'

class SocialMedia(models.Model):
    instagram = models.CharField(max_length=100, blank=True, null=True)
    facebook = models.CharField(max_length=100, blank=True, null=True)
    twitter = models.CharField(max_length=100, blank=True, null=True)
    linkedin = models.CharField(max_length=100, blank=True, null=True)
    youtube = models.CharField(max_length=100, blank=True, null=True)
    tiktok = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.instagram
    
    class Meta:
        verbose_name = 'Sosyal Medya'
        verbose_name_plural = 'Sosyal Medya'

class PolicyandTerms(models.Model):
    privacy_policy = HTMLField(blank=True, null=True, verbose_name='Gizlilik Politikası')
    terms_of_service = HTMLField(blank=True, null=True, verbose_name='Kullanım Şartları')
    return_policy = HTMLField(blank=True, null=True, verbose_name='İade Şartları')

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'Politika ve Şartlar'
        verbose_name_plural = 'Politika ve Şartlar'
