# Generated by Django 5.1.2 on 2024-12-18 18:32

import tinymce.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Slider',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='Başlık')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Açıklama')),
                ('image', models.ImageField(upload_to='sliders/', verbose_name='Görsel')),
                ('url', models.CharField(max_length=200, verbose_name='Yönlendirme URL')),
                ('button_text', models.CharField(default='İncele', max_length=50, verbose_name='Buton Metni')),
                ('order', models.IntegerField(default=0, verbose_name='Sıralama')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktif')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Slider Resmi',
                'verbose_name_plural': 'Slider Resimleri',
                'ordering': ['order', '-created_at'],
            },
        ),
        migrations.AlterField(
            model_name='product',
            name='description',
            field=tinymce.models.HTMLField(verbose_name='Açıklama'),
        ),
    ]
