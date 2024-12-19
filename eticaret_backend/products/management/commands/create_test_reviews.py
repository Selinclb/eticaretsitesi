from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product, Review
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Her ürün için 5 adet test değerlendirmesi oluşturur'

    def handle(self, *args, **kwargs):
        # Test yorumları 
        sample_comments = [
            "Harika bir ürün, kesinlikle tavsiye ederim!",
            "Fiyat/performans açısından çok iyi.",
            "Beklentilerimi karşıladı, memnun kaldım.",
            "Kaliteli ve şık bir ürün.",
            "İhtiyacımı tam olarak karşıladı."
        ]

        sample_pros = [
            "Kaliteli malzeme",
            "Hızlı kargo",
            "Kullanımı kolay",
            "Şık tasarım",
            "Dayanıklı"
        ]

        sample_cons = [
            "Fiyatı biraz yüksek",
            "Renk seçenekleri az",
            "Kurulumu biraz zor",
            "Kutu içeriği yetersiz",
            "Garanti süresi kısa"
        ]

        # Test kullanıcısı
        test_users = []
        for i in range(5):
            user, created = User.objects.get_or_create(
                email=f'test_user_{i+1}@example.com',
                defaults={
                    'first_name': f'Test{i+1}',
                    'last_name': 'User',
                    'is_active': True,
                    'is_email_verified': True
                }
            )
            if created:
                user.set_password('test123')
                user.save()
            test_users.append(user)

        # Her ürün için 5 değerlendirme olacak
        products = Product.objects.all()
        for product in products:
            existing_reviews = Review.objects.filter(product=product).count()
            if existing_reviews >= 5:
                self.stdout.write(
                    self.style.WARNING(
                        f'"{product.name}" için zaten {existing_reviews} değerlendirme var, atlanıyor.'
                    )
                )
                continue

            for i in range(5):
                review = Review.objects.create(
                    product=product,
                    user=test_users[i],
                    rating=random.randint(4, 5),  # Puan derecesi
                    comment=sample_comments[i],
                    pros=sample_pros[i],
                    cons=sample_cons[i],
                    is_verified_purchase=True,
                    is_approved=True,
                    created_at=timezone.now() - timezone.timedelta(days=random.randint(1, 30))
                )

            self.stdout.write(
                self.style.SUCCESS(
                    f'"{product.name}" için 5 test değerlendirmesi oluşturuldu.'
                )
            )

        self.stdout.write(self.style.SUCCESS('Tüm test değerlendirmeleri başarıyla oluşturuldu!'))