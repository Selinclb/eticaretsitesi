# Generated by Django 5.1.2 on 2024-12-18 16:22

import django.db.models.deletion
import orders.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_number', models.CharField(default=orders.models.generate_order_number, max_length=50, unique=True, verbose_name='Sipariş Numarası')),
                ('status', models.CharField(choices=[('pending', 'Onay Bekliyor'), ('confirmed', 'Onaylandı'), ('shipped', 'Kargoya Verildi'), ('delivered', 'Teslim Edildi'), ('cancelled', 'İptal Edildi')], default='pending', max_length=20, verbose_name='Durum')),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Toplam Tutar')),
                ('shipping_address', models.TextField(verbose_name='Teslimat Adresi')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Oluşturulma Tarihi')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Güncellenme Tarihi')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Kullanıcı')),
            ],
            options={
                'verbose_name': 'Sipariş',
                'verbose_name_plural': 'Siparişler',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(verbose_name='Adet')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Birim Fiyat')),
                ('total', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Toplam')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order', verbose_name='Sipariş')),
                ('product', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='products.product', verbose_name='Ürün')),
            ],
            options={
                'verbose_name': 'Sipariş Ürünü',
                'verbose_name_plural': 'Sipariş Ürünleri',
            },
        ),
    ]