from django.core.management.base import BaseCommand
from products.models import Category, SubCategory, Product, ProductVariant
import random

class Command(BaseCommand):
    help = 'Daha fazla örnek ürün ekler'

    def handle(self, *args, **kwargs):
        # Mevcut kategori ve alt kategorileri al
        elektronik = Category.objects.get(slug='elektronik')
        
        # Alt kategorileri oluştur veya al
        laptop, _ = SubCategory.objects.get_or_create(
            category=elektronik,
            name="Laptop",
            slug="laptop"
        )
        telefon, _ = SubCategory.objects.get_or_create(
            category=elektronik,
            name="Telefon",
            slug="telefon"
        )
        tablet, _ = SubCategory.objects.get_or_create(
            category=elektronik,
            name="Tablet",
            slug="tablet"
        )
        kulaklik, _ = SubCategory.objects.get_or_create(
            category=elektronik,
            name="Kulaklık",
            slug="kulaklik"
        )

        # Laptop ürünleri
        laptops = [
            {
                'name': 'ASUS ROG Strix G15',
                'description': 'AMD Ryzen 9 5900HX, RTX 3070, 32GB RAM, 1TB SSD',
                'price': 49999.99,
                'specs': {
                    'işlemci': 'AMD Ryzen 9 5900HX',
                    'ekran_kartı': 'RTX 3070 8GB',
                    'ram': '32GB',
                    'depolama': '1TB SSD',
                    'ekran': '15.6" 165Hz',
                },
                'variants': [
                    {'type': 'ram', 'name': '16GB', 'price_adj': -2000},
                    {'type': 'ram', 'name': '32GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '512GB', 'price_adj': -1500},
                    {'type': 'storage', 'name': '1TB', 'price_adj': 0},
                ]
            },
            {
                'name': 'Lenovo Legion 5 Pro',
                'description': 'AMD Ryzen 7 5800H, RTX 3060, 16GB RAM, 512GB SSD',
                'price': 39999.99,
                'specs': {
                    'işlemci': 'AMD Ryzen 7 5800H',
                    'ekran_kartı': 'RTX 3060 6GB',
                    'ram': '16GB',
                    'depolama': '512GB SSD',
                    'ekran': '16" 165Hz',
                },
                'variants': [
                    {'type': 'ram', 'name': '16GB', 'price_adj': 0},
                    {'type': 'ram', 'name': '32GB', 'price_adj': 3000},
                    {'type': 'storage', 'name': '512GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '1TB', 'price_adj': 1500},
                ]
            },
        ]

        # Telefon ürünleri
        phones = [
            {
                'name': 'Samsung Galaxy S23 Ultra',
                'description': 'Snapdragon 8 Gen 2, 256GB, 12GB RAM',
                'price': 44999.99,
                'specs': {
                    'işlemci': 'Snapdragon 8 Gen 2',
                    'ram': '12GB',
                    'depolama': '256GB',
                    'ekran': '6.8" Dynamic AMOLED 2X',
                    'kamera': '200MP + 12MP + 10MP + 10MP',
                },
                'variants': [
                    {'type': 'storage', 'name': '256GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '512GB', 'price_adj': 5000},
                    {'type': 'color', 'name': 'Phantom Black', 'price_adj': 0},
                    {'type': 'color', 'name': 'Cream', 'price_adj': 0},
                ]
            },
            {
                'name': 'Google Pixel 7 Pro',
                'description': 'Google Tensor G2, 128GB, 12GB RAM',
                'price': 34999.99,
                'specs': {
                    'işlemci': 'Google Tensor G2',
                    'ram': '12GB',
                    'depolama': '128GB',
                    'ekran': '6.7" LTPO OLED',
                    'kamera': '50MP + 12MP + 48MP',
                },
                'variants': [
                    {'type': 'storage', 'name': '128GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '256GB', 'price_adj': 3000},
                    {'type': 'color', 'name': 'Obsidian', 'price_adj': 0},
                    {'type': 'color', 'name': 'Snow', 'price_adj': 0},
                ]
            },
        ]

        # Tablet ürünleri
        tablets = [
            {
                'name': 'iPad Pro 12.9',
                'description': 'M2 çip, 12.9" Liquid Retina XDR ekran',
                'price': 34999.99,
                'specs': {
                    'işlemci': 'Apple M2',
                    'ram': '8GB',
                    'depolama': '256GB',
                    'ekran': '12.9" Liquid Retina XDR',
                },
                'variants': [
                    {'type': 'storage', 'name': '256GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '512GB', 'price_adj': 7000},
                    {'type': 'color', 'name': 'Space Gray', 'price_adj': 0},
                    {'type': 'color', 'name': 'Silver', 'price_adj': 0},
                ]
            },
            {
                'name': 'Samsung Galaxy Tab S9 Ultra',
                'description': 'Snapdragon 8 Gen 2, 14.6" AMOLED ekran',
                'price': 39999.99,
                'specs': {
                    'işlemci': 'Snapdragon 8 Gen 2',
                    'ram': '12GB',
                    'depolama': '256GB',
                    'ekran': '14.6" AMOLED',
                },
                'variants': [
                    {'type': 'storage', 'name': '256GB', 'price_adj': 0},
                    {'type': 'storage', 'name': '512GB', 'price_adj': 5000},
                    {'type': 'color', 'name': 'Graphite', 'price_adj': 0},
                    {'type': 'color', 'name': 'Beige', 'price_adj': 0},
                ]
            },
        ]

        # Kulaklık ürünleri
        headphones = [
            {
                'name': 'Apple AirPods Pro 2',
                'description': 'Aktif Gürültü Engelleme, Adaptif Ses',
                'price': 7999.99,
                'specs': {
                    'tip': 'True Wireless',
                    'anc': 'Var',
                    'pil': '6 saat',
                    'şarj': 'USB-C',
                },
                'variants': [
                    {'type': 'color', 'name': 'White', 'price_adj': 0},
                ]
            },
            {
                'name': 'Sony WH-1000XM5',
                'description': 'Üstün Gürültü Engelleme, 30 saat pil ömrü',
                'price': 9999.99,
                'specs': {
                    'tip': 'Over-ear',
                    'anc': 'Var',
                    'pil': '30 saat',
                    'şarj': 'USB-C',
                },
                'variants': [
                    {'type': 'color', 'name': 'Black', 'price_adj': 0},
                    {'type': 'color', 'name': 'Silver', 'price_adj': 0},
                ]
            },
        ]

        def create_product(data, subcategory):
            product = Product.objects.create(
                category=elektronik,
                subcategory=subcategory,
                name=data['name'],
                description=data['description'],
                price=data['price'],
                specs=data['specs'],
                stock=random.randint(10, 50),
                status='active',
                is_featured=random.choice([True, False]),
                is_best_seller=random.choice([True, False]),
                is_on_sale=random.choice([True, False])
            )

            for variant in data['variants']:
                ProductVariant.objects.create(
                    product=product,
                    variant_type=variant['type'],
                    name=variant['name'],
                    price_adjustment=variant['price_adj'],
                    stock=random.randint(5, 20),
                    is_default=variant['price_adj'] == 0
                )

            self.stdout.write(self.style.SUCCESS(f'Ürün oluşturuldu: {product.name}'))

        # Ürünleri oluştur
        for laptop_data in laptops:
            create_product(laptop_data, laptop)

        for phone_data in phones:
            create_product(phone_data, telefon)

        for tablet_data in tablets:
            create_product(tablet_data, tablet)

        for headphone_data in headphones:
            create_product(headphone_data, kulaklik)

        self.stdout.write(self.style.SUCCESS('Tüm ürünler başarıyla oluşturuldu!'))