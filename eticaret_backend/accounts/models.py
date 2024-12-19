from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from django.core.mail import send_mail
import uuid
from datetime import timedelta
from django.utils import timezone
import random

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email adresi zorunludur')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    
    # Adres bilgileri kısmı
    address_title = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'

    def __str__(self):
        return self.email
    

class PasswordResetToken(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Password reset token for {self.user.email}"

    def is_valid(self):
        # Token 24 saat geçerli olsun
        return not self.is_used and self.created_at >= timezone.now() - timedelta(hours=24)

    @classmethod
    def generate_token(cls, user):
        # Varolan aktif tokenleri iptal et
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        # Yeni token oluştur
        return cls.objects.create(user=user)

    def send_reset_email(self):
        reset_url = f"{settings.FRONTEND_URL}/sifre-sifirlama/{self.token}"
        send_mail(
            'Şifre Sıfırlama',
            f'Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n\n{reset_url}\n\nBu link 24 saat geçerlidir.',
            settings.DEFAULT_FROM_EMAIL,
            [self.user.email],
            fail_silently=False,
        )

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Token 72 saat geçerli olsun
        return not self.is_used and self.created_at >= timezone.now() - timedelta(hours=72)

    @classmethod
    def generate_token(cls, user):
        # Varolan aktif tokenleri iptal et
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        # Yeni token oluştur
        return cls.objects.create(user=user)

    def send_verification_email(self):
        verify_url = f'http://localhost:5173/email-dogrulama/{self.token}'
        send_mail(
            'Email Doğrulama',
            f'Hesabınızı doğrulamak için aşağıdaki linke tıklayın:\n\n{verify_url}\n\nBu link 72 saat geçerlidir.',
            settings.DEFAULT_FROM_EMAIL,
            [self.user.email],
            fail_silently=False,
        )

class TwoFactorCode(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    code = models.CharField(max_length=6)  # 6 haneli kod
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"2FA code for {self.user.email}"

    def is_valid(self):
        # Kod 10 dakika geçerli olsun
        return not self.is_used and self.created_at >= timezone.now() - timedelta(minutes=10)

    @classmethod
    def generate_code(cls, user):
        # Varolan aktif kodları iptal et
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        # 6 haneli rastgele kod oluştur
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return cls.objects.create(user=user, code=code)

    def send_code_email(self):
        send_mail(
            'Giriş Doğrulama Kodu',
            f'Giriş doğrulama kodunuz: {self.code}\n\nBu kod 10 dakika geçerlidir.',
            settings.DEFAULT_FROM_EMAIL,
            [self.user.email],
            fail_silently=False,
        )


        

