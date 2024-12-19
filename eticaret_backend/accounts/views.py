from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import PasswordResetToken, EmailVerificationToken, TwoFactorCode
from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Gelen kayıt verisi:", request.data)  # Debug için
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer hataları:", serializer.errors)  # Debug için
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save(is_active=False)
            token = EmailVerificationToken.generate_token(user)
            token.send_verification_email()
            return Response({
                'message': 'Kayıt başarılı. Lütfen email adresinizi doğrulayın.'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Kayıt hatası:", str(e))  # Debug için
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                return Response({
                    'error': 'Geçersiz şifre'
                }, status=401)

            if not user.is_email_verified:
                return Response({
                    'error': 'Email adresinizi doğrulamanız gerekiyor.'
                }, status=401)

            if user.two_factor_enabled:
                # 2FA kodu oluştur ve gönder
                code = TwoFactorCode.generate_code(user)
                code.send_code_email()
                return Response({
                    'message': 'Doğrulama kodu email adresinize gönderildi.',
                    'requires_2fa': True,
                    'email': email
                })

            # 2FA aktif değilse normal giriş
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })

        except User.DoesNotExist:
            return Response({
                'error': 'Kullanıcı bulunamadı'
            }, status=404)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Başarıyla çıkış yapıldı'})
        except Exception:
            return Response({'error': 'Geçersiz token'}, 
                          status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        if not password:
            return Response({
                'error': 'Şifre gerekli'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(password):
            return Response({
                'error': 'Geçersiz şifre'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({
            'message': 'Hesabınız başarıyla silindi'
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'error': 'Mevcut şifre ve yeni şifre gereklidir'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if not user.check_password(current_password):
            return Response({
                'error': 'Mevcut şifre yanlış'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            validate_password(new_password, user)
            user.set_password(new_password)
            user.save()
            
            # Şifre değiştiğinde yeni token oluştur
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Şifreniz başarıyla güncellendi',
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            })
        except ValidationError as e:
            return Response({
                'error': list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = PasswordResetToken.generate_token(user)
                token.send_reset_email()
                return Response({
                    'message': 'Şifre sıfırlama linki email adresinize gönderildi.'
                })
            except User.DoesNotExist:
                # Güvenlik için aynı mesajı döndür
                return Response({
                    'message': 'Şifre sıfırlama linki email adresinize gönderildi.'
                })
        return Response(serializer.errors, status=400)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token_obj = PasswordResetToken.objects.get(
                    token=serializer.validated_data['token'],
                    is_used=False
                )
                
                if not token_obj.is_valid():
                    return Response({
                        'error': 'Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.'
                    }, status=400)

                user = token_obj.user
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                token_obj.is_used = True
                token_obj.save()
                
                return Response({
                    'message': 'Şifreniz başarıyla değiştirildi.'
                })
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'error': 'Geçersiz token.'
                }, status=400)
        return Response(serializer.errors, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class EmailVerificationView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            print("1. Gelen request data:", request.data)
            token = request.data.get('token')
            print("2. Alınan token:", token)

            if not token:
                return Response({
                    'error': 'Token gerekli'
                }, status=400)

            try:
                from uuid import UUID
                token_uuid = UUID(token)
                print(f"3. Token UUID dönüşümü: {token_uuid}")

                verification = EmailVerificationToken.objects.get(
                    token=token_uuid,
                    is_used=False
                )

                if not verification.is_valid():
                    return Response({
                        'error': 'Bu doğrulama linki geçersiz veya süresi dolmuş.'
                    }, status=400)

                user = verification.user
                user.is_email_verified = True
                user.is_active = True
                user.save()

                verification.is_used = True
                verification.save()

                # JWT token oluştur
                refresh = RefreshToken.for_user(user)

                return Response({
                    'message': 'Email adresiniz başarıyla doğrulandı.',
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })

            except ValueError:
                return Response({
                    'error': 'Geçersiz token formatı.'
                }, status=400)
            except EmailVerificationToken.DoesNotExist:
                return Response({
                    'error': 'Geçersiz veya kullanılmış token.'
                }, status=400)

        except Exception as e:
            print(f"HATA: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return Response({
                'error': 'Doğrulama işlemi sırasında bir hata oluştu.'
            }, status=500)

class Enable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.two_factor_enabled = True
        user.save()
        return Response({'message': 'İki faktörlü doğrulama aktifleştirildi.'})

class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.two_factor_enabled = False
        user.save()
        return Response({'message': 'İki faktörlü doğrulama devre dışı bırakıldı.'})

class Verify2FAView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        try:
            user = User.objects.get(email=email)
            verification = TwoFactorCode.objects.filter(
                user=user,
                code=code,
                is_used=False
            ).latest('created_at')

            if not verification.is_valid():
                return Response({
                    'error': 'Kod geçersiz veya süresi dolmuş.'
                }, status=400)

            verification.is_used = True
            verification.save()

            # JWT token oluştur
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })

        except (User.DoesNotExist, TwoFactorCode.DoesNotExist):
            return Response({
                'error': 'Geçersiz kod.'
            }, status=400)

class ResendVerificationEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email adresi gerekli'
            }, status=400)

        try:
            user = User.objects.get(email=email)
            
            if user.is_email_verified:
                return Response({
                    'error': 'Bu email adresi zaten doğrulanmış.'
                }, status=400)

            # Yeni token oluştur ve email gönder
            token = EmailVerificationToken.generate_token(user)
            token.send_verification_email()

            return Response({
                'message': 'Doğrulama emaili tekrar gönderildi.'
            })

        except User.DoesNotExist:
            return Response({
                'error': 'Bu email adresiyle kayıtlı kullanıcı bulunamadı.'
            }, status=404)