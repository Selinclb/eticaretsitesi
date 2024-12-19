from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductImage, ProductVariant, Review, Slider
from django.db import models

class SubCategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url)
        return None

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'subcategories']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductVariantSerializer(serializers.ModelSerializer):
    variant_type_display = serializers.CharField(source='get_variant_type_display', read_only=True)
    final_price = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'variant_type', 'variant_type_display', 
            'name', 'sku', 'stock', 'price_adjustment', 
            'is_default', 'final_price'
        ]

    def get_final_price(self, obj):
        base_price = obj.product.price
        return float(base_price) + float(obj.price_adjustment)

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_id', 'rating', 
            'comment', 'pros', 'cons', 
            'is_verified_purchase', 'created_at',
            'created_at_formatted'
        ]
        read_only_fields = ['user', 'is_verified_purchase']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime("%d.%m.%Y %H:%M")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    primary_image_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    variant_types = serializers.SerializerMethodField()
    specs = serializers.JSONField(required=False)
    discount_percentage = serializers.SerializerMethodField()


    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'category', 'subcategory', 'specs', 'stock',
            'status', 'is_best_seller', 'is_featured', 
            'discounted_price','is_on_sale', 'created_at', 'updated_at',
            'images', 'primary_image_url', 'variants',
            'reviews', 'average_rating', 'review_count',
            'variant_types', 'discount_percentage'
        ]

    def get_primary_image_url(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None

    def get_reviews(self, obj):
        # Sadece onaylanmış yorumları getir
        reviews = obj.reviews.filter(is_approved=True)
        return ReviewSerializer(reviews, many=True, context=self.context).data

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(is_approved=True)
        if reviews.exists():
            return round(reviews.aggregate(avg=models.Avg('rating'))['avg'], 1)
        return None

    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()

    def get_variant_types(self, obj):
        try:
            variant_types = obj.variants.values_list('variant_type', flat=True).distinct()
            variant_types_dict = dict(ProductVariant.VARIANT_TYPES)
            
            return [
                {
                    'type': v_type,
                    'display_name': variant_types_dict.get(v_type, v_type),  # Güvenli bir şekilde almak için
                    'values': list(obj.variants.filter(variant_type=v_type).values(
                    'id', 'name', 'price_adjustment', 'is_default'
                ))
            }
            for v_type in variant_types
            ]
        except Exception as e:
            print(f"Variant types error: {str(e)}")  # Hata ayıklama içim
            return [] 

    def get_discount_percentage(self, obj):
        if obj.is_on_sale and obj.discounted_price:
            discount = ((obj.price - obj.discounted_price) / obj.price) * 100
            return round(discount)
        return None

class ProductDetailSerializer(ProductSerializer):
    """Ürün detay sayfası için genişletilmiş serializer"""
    related_products = serializers.SerializerMethodField()

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['related_products']

    def get_related_products(self, obj):
        # Aynı kategorideki benzer ürünleri getir
        related = Product.objects.filter(
            category=obj.category,
            status='active'
        ).exclude(
            id=obj.id
        )[:4]
        return ProductSerializer(related, many=True, context=self.context).data
    
class SliderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = ['id', 'title', 'description', 'image_url', 'url', 'button_text']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None