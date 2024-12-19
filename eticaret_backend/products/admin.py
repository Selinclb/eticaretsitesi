from django import forms
from django.contrib import admin
from .models import Category, SubCategory, Product, ProductImage, ProductVariant, Review, Slider
from bs4 import BeautifulSoup 

class SpecsWidget(forms.Textarea):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs['rows'] = 10
        self.attrs['placeholder'] = """Her satıra bir özellik yazın (Özellik: Değer formatında)
Örnek:
İşlemci: Intel Core i5
RAM: 8 GB
Depolama: 512 GB SSD
Ekran: 15.6 inç
İşletim Sistemi: Windows 11"""

class ProductAdminForm(forms.ModelForm):
    specs_text = forms.CharField(
        widget=SpecsWidget,
        required=False,
        label="Özellikler",
        help_text="Her satıra 'Özellik: Değer' formatında yazın"
    )

    class Meta:
        model = Product
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk and self.instance.specs:
            try:
                if isinstance(self.instance.specs, dict):
                    specs_text = '\n'.join(f"{key}: {value}" for key, value in self.instance.specs.items())
                    self.initial['specs_text'] = specs_text
                elif isinstance(self.instance.specs, str):
                    # HTML içeriğini temizle ve düz metin formatına çevir
                    soup = BeautifulSoup(self.instance.specs, 'html.parser')
                    specs_text = soup.get_text('\n', strip=True)
                    self.initial['specs_text'] = specs_text
            except:
                self.initial['specs_text'] = ''

    def clean_specs_text(self):
        specs_text = self.cleaned_data.get('specs_text', '')
        specs_dict = {}
        
        if isinstance(specs_text, str):
            # HTML içeriğini temizler
            if '<p>' in specs_text or '<br>' in specs_text:
                soup = BeautifulSoup(specs_text, 'html.parser')
                specs_text = soup.get_text('\n', strip=True)
            
            # Her satırı işle
            for line in specs_text.split('\n'):
                line = line.strip()
                if line and ':' in line or '\t' in line:
                    # Tab veya iki nokta üst üste ile ayrılmış değerleri işle. JSON formatı için
                    if '\t' in line:
                        key, value = line.split('\t', 1)
                    else:
                        key, value = line.split(':', 1)
                    
                    key = key.strip()
                    value = value.strip()
                    
                    if key and value:  # Boş key veya value'ları atla
                        # HTML entities'i decode et
                        from html import unescape
                        value = unescape(value)
                        specs_dict[key] = value
        
        return specs_dict

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.specs = self.cleaned_data.get('specs_text', {})
        if commit:
            instance.save()
        return instance

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
    fields = ['image', 'is_primary', 'order', 'image_tag']
    readonly_fields = ['image_tag']

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['variant_type', 'name', 'sku', 'stock', 'price_adjustment', 'is_default']

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ['user', 'rating', 'comment', 'pros', 'cons', 'created_at']
    can_delete = False
    fields = ['user', 'rating', 'comment', 'pros', 'cons', 'is_verified_purchase', 'is_approved', 'created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']
    readonly_fields = ['slug']

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    list_filter = ['category']
    search_fields = ['name', 'category__name']
    readonly_fields = ['slug']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    inlines = [ProductImageInline, ProductVariantInline]
    list_display = ['name', 'image_tag', 'price', 'stock', 'status']
    list_filter = ['category', 'subcategory', 'status', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    
    fields = [
        'name',
        'slug',
        'description',
        'category',
        'subcategory',
        'price',
        'stock',
        'specs_text',
        'status',
        'is_best_seller',
        'is_featured',
        'is_on_sale',
        'discounted_price',
        'created_at',
        'updated_at'
    ]

    def save_model(self, request, obj, form, change):
        if not obj.specs:
            obj.specs = {}
            
        # İndirim kontrolü
        if obj.is_on_sale and not obj.discounted_price:
            obj.discounted_price = obj.price * 0.8  # %20 varsayılan indirim
        elif not obj.is_on_sale:
            obj.discounted_price = None
            
        super().save_model(request, obj, form, change)
        
        # İlk yüklenen resmi ana resim olarak ayarla
        if not change:  # Yeni ürün oluşturuluyorsa
            images = obj.images.all()
            if images.exists() and not images.filter(is_primary=True).exists():
                first_image = images.first()
                first_image.is_primary = True
                first_image.save()

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_verified_purchase', 
                   'is_approved', 'created_at']
    list_filter = ['is_approved', 'is_verified_purchase', 'rating']
    search_fields = ['product__name', 'user__username', 'comment']
    actions = ['approve_reviews', 'unapprove_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Seçili yorumları onayla"

    def unapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    unapprove_reviews.short_description = "Seçili yorumların onayını kaldır"


@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'description']
    ordering = ['order']