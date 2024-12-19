from django.db import models
from django.utils.text import slugify
from django.utils.safestring import mark_safe
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.utils.html import mark_safe
from tinymce.models import HTMLField
import unicodedata

User = get_user_model()

def tr_slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
    return slugify(text)


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Kategori Adı")
    slug = models.SlugField(max_length=250, unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = tr_slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"

class SubCategory(models.Model):
    category = models.ForeignKey(Category, related_name='subcategories', on_delete=models.CASCADE, verbose_name="Kategori")
    name = models.CharField(max_length=100, verbose_name="Alt Kategori Adı")
    slug = models.SlugField(max_length=250, unique=True)
    image = models.ImageField(upload_to='subcategories/', verbose_name='Görsel', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = tr_slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    class Meta:
        verbose_name = "Alt Kategori"
        verbose_name_plural = "Alt Kategoriler"

class Product(models.Model):
    STATUS_CHOICES = [('active','Aktif'),('inactive','Pasif')]
    category = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name="Kategori")
    subcategory = models.ForeignKey('SubCategory', on_delete=models.CASCADE, verbose_name="Alt Kategori")
    name = models.CharField(max_length=200, verbose_name="Ürün Adı")
    slug = models.SlugField(unique=True, default='', verbose_name="URL")
    description = HTMLField(verbose_name="Açıklama")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Fiyat")
    specs = models.JSONField(default=dict, blank=True, null=True, verbose_name="Özellikler")
    stock = models.IntegerField(default=0, verbose_name="Stok")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active', verbose_name="Durum")
    is_best_seller = models.BooleanField(default=False, verbose_name="Çok Satan")
    is_featured = models.BooleanField(default=False, verbose_name="Öne Çıkan")
    is_on_sale = models.BooleanField(default=False, verbose_name="İndirimde")
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="İndirimli Fiyat")
    created_at = models.DateTimeField(auto_now_add=True,verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True,verbose_name="Güncellenme Tarihi")
    
    class Meta:
        verbose_name = "Ürün"
        verbose_name_plural = "Ürünler"
        ordering = ['-created_at']


    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Slug oluşturma
        if not self.slug:
            self.slug = tr_slugify(self.name)
            original_slug = self.slug
            counter = 1
            while Product.objects.filter(slug=self.slug).exists():
                self.slug = f'{original_slug}-{counter}'
                counter += 1
    
        # İndirimli fiyat kontrolleri
        if self.discounted_price and self.discounted_price >= self.price:
            self.discounted_price = None
            self.is_on_sale = False
        elif self.discounted_price:
            self.is_on_sale = True
        else:
            self.is_on_sale = False
    
        super().save(*args, **kwargs)

    def image_tag(self):
        # İlk olarak primary image'i kontrol et
        primary_image = self.images.filter(is_primary=True).first()
        # Eğer primary image yoksa, herhangi bir image'i al
        if not primary_image:
            primary_image = self.images.first()
        
        if primary_image:
            return mark_safe(f'<img src="{primary_image.image.url}" width="100" />')
        return mark_safe('<img src="/static/admin/img/no-image.png" width="100" />')

    image_tag.short_description = 'Resim'
    image_tag.allow_tags = True

    def formatted_price(self):
        return "{:,.2f}".format(self.price).replace(",", ".")
    
    def formatted_discounted_price(self):
        return "{:,.2f}".format(self.discounted_price).replace(",", ".")
    
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', verbose_name="Ürün Resmi")
    is_primary = models.BooleanField(default=False, verbose_name="Ana Resim")
    order = models.IntegerField(default=0, verbose_name="Sıralama")

    class Meta:
        verbose_name = "Ürün Resmi"
        verbose_name_plural = "Ürün Resimleri"
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - {'Ana Resim' if self.is_primary else 'Diğer Resim'}"

    def image_tag(self):
        if self.image:
            return mark_safe(f'<img src="{self.image.url}" width="100" />')
        return ""
    image_tag.short_description = 'Önizleme'

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Aynı ürünün diğer resimlerinin primary özelliğini kaldır
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)
        
class ProductVariant(models.Model):
    VARIANT_TYPES = [('color','Renk'),('storage', 'Depolama'), ('size', 'Boyut')]
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE, verbose_name="Ürün")
    variant_type = models.CharField(max_length=20, choices=VARIANT_TYPES, verbose_name="Özellik Tipi")
    name = models.CharField(max_length=100, verbose_name="Özellik Değeri")
    sku = models.CharField(max_length=100, blank=True, null=True, verbose_name="Stok Kodu")
    stock = models.IntegerField(default=0, verbose_name="Stok")
    price_adjustment = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name="Fiyat Farkı"
    )
    is_default = models.BooleanField(default=False, verbose_name="Varsayılan Seçenek")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ürün Varyantı"
        verbose_name_plural = "Ürün Varyantları"
        unique_together = ['product', 'variant_type', 'name']
        ordering = ['variant_type', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.get_variant_type_display()}: {self.name}"

    def save(self, *args, **kwargs):
        if self.is_default:
            # Aynı ürün ve varyant tipi için diğer varsayılan seçenekleri kaldır
            ProductVariant.objects.filter(
                product=self.product,
                variant_type=self.variant_type,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE, verbose_name="Ürün")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Kullanıcı")
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Puan"
    )
    comment = models.TextField(verbose_name="Yorum")
    pros = models.TextField(blank=True, null=True, verbose_name="Artıları")
    cons = models.TextField(blank=True, null=True, verbose_name="Eksileri")
    is_verified_purchase = models.BooleanField(default=False, verbose_name="Doğrulanmış Alışveriş")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")
    is_approved = models.BooleanField(default=False, verbose_name="Onaylı")

    class Meta:
        verbose_name = "Ürün Yorumu"
        verbose_name_plural = "Ürün Yorumları"
        ordering = ['-created_at']
        unique_together = ['product', 'user']

    def __str__(self):
        return f"{self.product.name} - {self.user.username} - {self.rating}★"
    

class Slider(models.Model):
    title = models.CharField(max_length=200, verbose_name='Başlık',blank=True,null=True)
    description = models.TextField(blank=True, null=True, verbose_name='Açıklama')
    image = models.ImageField(upload_to='sliders/', verbose_name='Görsel')
    url = models.CharField(max_length=200, verbose_name='Yönlendirme URL')
    button_text = models.CharField(max_length=50, default='İncele', verbose_name='Buton Metni')
    order = models.IntegerField(default=0, verbose_name='Sıralama')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')

    class Meta:
        ordering = ['order']
        verbose_name = 'Tanıtım Resmi'
        verbose_name_plural = 'Tanıtım Resimleri'

    def __str__(self):
        return self.title or 'Slider' #title boş girip Slider döndürüyoruz 

   