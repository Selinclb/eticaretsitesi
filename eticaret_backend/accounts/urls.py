from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Kimlik doğrulama
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Token yenileme
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profil işlemleri
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('verify-email/', views.EmailVerificationView.as_view(), name='verify-email'),
    path('2fa/enable/', views.Enable2FAView.as_view(), name='enable-2fa'),
    path('2fa/disable/', views.Disable2FAView.as_view(), name='disable-2fa'),
    path('2fa/verify/', views.Verify2FAView.as_view(), name='verify-2fa'),
    path('resend-verification/', views.ResendVerificationEmailView.as_view(), name='resend-verification'),
]