from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, SubCategory, Product, ProductVariant, ProductImage
from django.core.files import File
from django.conf import settings
import os
import random

class Command(BaseCommand):
    help = 'Örnek ürün verileri oluşturur'

    def handle(self, *args, **kwargs):
        # Kategoriler
        elektronik = Category.objects.create(
            name="Elektronik",
            slug="elektronik"
        )
        self.stdout.write(self.style.SUCCESS(f'Kategori oluşturuldu: {elektronik.name}'))

        # Alt kategoriler
        laptop = SubCategory.objects.create(
            category=elektronik,
            name="Laptop",
            slug="laptop"
        )
        telefon = SubCategory.objects.create(
            category=elektronik,
            name="Telefon",
            slug="telefon"
        )
        self.stdout.write(self.style.SUCCESS('Alt kategoriler oluşturuldu'))

        # Örnek laptop
        laptop_product = Product.objects.create(
            category=elektronik,
            subcategory=laptop,
            name="MacBook Pro 16 M2",
            description="""
            Apple M2 Pro çip
            16 inç Liquid Retina XDR ekran
            32GB RAM
            1TB SSD
            Space Gray
            """,
            price=84999.99,
            stock=50,
            specs={
                "işlemci": "Apple M2 Pro",
                "ram": "32GB",
                "depolama": "1TB SSD",
                "ekran": "16 inç Liquid Retina XDR",
                "işletim_sistemi": "macOS",
                "pil": "100W",
                "ağırlık": "2.15 kg"
            },
            status="active",
            is_featured=True,
            is_best_seller=True
        )

        # Laptop varyantları
        variants_data = [
            # RAM varyantları
            {"type": "ram", "name": "16GB", "price_adj": -5000, "is_default": False},
            {"type": "ram", "name": "32GB", "price_adj": 0, "is_default": True},
            {"type": "ram", "name": "64GB", "price_adj": 8000, "is_default": False},
            # Depolama varyantları
            {"type": "storage", "name": "512GB", "price_adj": -3000, "is_default": False},
            {"type": "storage", "name": "1TB", "price_adj": 0, "is_default": True},
            {"type": "storage", "name": "2TB", "price_adj": 6000, "is_default": False},
            # Renk varyantları
            {"type": "color", "name": "Space Gray", "price_adj": 0, "is_default": True},
            {"type": "color", "name": "Silver", "price_adj": 0, "is_default": False},
        ]

        for variant in variants_data:
            ProductVariant.objects.create(
                product=laptop_product,
                variant_type=variant["type"],
                name=variant["name"],
                price_adjustment=variant["price_adj"],
                is_default=variant["is_default"],
                stock=random.randint(5, 20)
            )

        self.stdout.write(self.style.SUCCESS(f'Ürün oluşturuldu: {laptop_product.name}'))

        # Örnek telefon
        phone_product = Product.objects.create(
            category=elektronik,
            subcategory=telefon,
            name="iPhone 15 Pro",
            description="""
            A17 Pro çip
            6.1 inç Super Retina XDR ekran
            256GB Depolama
            Titanyum tasarım
            48MP Ana kamera
            """,
            price=64999.99,
            stock=100,
            specs={
                "işlemci": "A17 Pro",
                "ram": "8GB",
                "depolama": "256GB",
                "ekran": "6.1 inç Super Retina XDR",
                "kamera": "48MP + 12MP + 12MP",
                "işletim_sistemi": "iOS 17",
                "batarya": "3200 mAh"
            },
            status="active",
            is_featured=True,
            is_on_sale=True
        )

        # Telefon varyantları
        phone_variants = [
            # Depolama varyantları
            {"type": "storage", "name": "128GB", "price_adj": -5000, "is_default": False},
            {"type": "storage", "name": "256GB", "price_adj": 0, "is_default": True},
            {"type": "storage", "name": "512GB", "price_adj": 7000, "is_default": False},
            {"type": "storage", "name": "1TB", "price_adj": 14000, "is_default": False},
            # Renk varyantları
            {"type": "color", "name": "Natural Titanium", "price_adj": 0, "is_default": True},
            {"type": "color", "name": "Blue Titanium", "price_adj": 0, "is_default": False},
            {"type": "color", "name": "White Titanium", "price_adj": 0, "is_default": False},
            {"type": "color", "name": "Black Titanium", "price_adj": 0, "is_default": False},
        ]

        for variant in phone_variants:
            ProductVariant.objects.create(
                product=phone_product,
                variant_type=variant["type"],
                name=variant["name"],
                price_adjustment=variant["price_adj"],
                is_default=variant["is_default"],
                stock=random.randint(10, 30)
            )

        self.stdout.write(self.style.SUCCESS(f'Ürün oluşturuldu: {phone_product.name}'))