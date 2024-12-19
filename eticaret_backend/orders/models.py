from django.db import models
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string

User = get_user_model()

def generate_order_number():
    return get_random_string(10).upper()

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Onay Bekliyor'),
        ('confirmed', 'Onaylandı'),
        ('shipped', 'Kargoya Verildi'),
        ('delivered', 'Teslim Edildi'),
        ('cancelled', 'İptal Edildi')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Kullanıcı")
    order_number = models.CharField(max_length=50, unique=True, default=generate_order_number, verbose_name="Sipariş Numarası")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Durum")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Toplam Tutar")
    shipping_address = models.TextField(verbose_name="Teslimat Adresi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")
    
    class Meta:
        verbose_name = "Sipariş"
        verbose_name_plural = "Siparişler"
        ordering = ['-created_at']

    def __str__(self):
        return f"Sipariş #{self.order_number}"
    
    def formatted_total_amount(self):
        return "{:,.2f}".format(self.total_amount).replace(",", ".")

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, verbose_name="Sipariş")
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, verbose_name="Ürün")
    quantity = models.PositiveIntegerField(verbose_name="Adet")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Birim Fiyat")
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Toplam")
    
    class Meta:
        verbose_name = "Sipariş Ürünü"
        verbose_name_plural = "Sipariş Ürünleri"

    def __str__(self):
        return f"{self.quantity}x {self.product.name if self.product else 'Silinmiş Ürün'}"

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.price
        super().save(*args, **kwargs)

    def formatted_price(self):
        return "{:,.2f}".format(self.price).replace(",", ".")

    def formatted_total(self):
        return "{:,.2f}".format(self.total).replace(",", ".")