from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
import logging
import traceback
from .models import Category, SubCategory, Product, Review, Slider
from .serializers import (
    CategorySerializer, 
    SubCategorySerializer, 
    ProductSerializer, 
    ProductDetailSerializer,
    ReviewSerializer,
    SliderSerializer
)

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def subcategories(self, request, slug=None):
        """Kategoriye ait alt kategorileri getir"""
        category = self.get_object()
        subcategories = category.subcategories.all()
        serializer = SubCategorySerializer(subcategories, many=True)
        return Response(serializer.data)

class SubCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = SubCategory.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category__slug=category)
        return queryset

class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(field_name='category__slug')
    subcategory = filters.CharFilter(field_name='subcategory__slug')
    
    class Meta:
        verbose_name = 'Ürün Filtre'
        verbose_name_plural = 'Ürün Filtreleri'
        model = Product
        fields = ['category', 'subcategory']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ProductFilter
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related(
            'category', 
            'subcategory'
        ).prefetch_related(
            'images',
            'variants',
            'reviews'
        ).filter(status='active')
        
        # Filtreleme parametreleri
        category = self.request.query_params.get('category', None)
        subcategory = self.request.query_params.get('subcategory', None)
        featured = self.request.query_params.get('featured', None)
        best_seller = self.request.query_params.get('best_seller', None)
        on_sale = self.request.query_params.get('on_sale', None)
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category__slug=category)
            
        if subcategory:
            queryset = queryset.filter(subcategory__slug=subcategory)
        
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
            
        if best_seller == 'true':
            queryset = queryset.filter(is_best_seller=True)
            
        if on_sale == 'true':
            queryset = queryset.filter(is_on_sale=True)
            
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset

    @action(detail=True, methods=['post'])
    def review(self, request, slug=None):
        """Ürüne yorum ekle"""
        product = self.get_object()
        
        # Kullanıcının daha önce yorum yapıp yapmadığını kontrol et
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response(
                {"error": "Bu ürün için zaten bir yorum yapmışsınız."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ReviewSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def variants(self, request, slug=None):
        """Ürünün varyantlarını getir"""
        product = self.get_object()
        variants = product.variants.all()
        return Response({
            'variant_types': dict(product.variants.model.VARIANT_TYPES),
            'variants': variants.values(
                'id', 'variant_type', 'name', 
                'sku', 'stock', 'price_adjustment', 
                'is_default'
            )
        })

    @action(detail=True, methods=['get'])
    def check_stock(self, request, slug=None):
        """Belirli bir varyant kombinasyonu için stok kontrolü"""
        product = self.get_object()
        variant_ids = request.query_params.getlist('variant_ids', [])
        
        try:
            variants = product.variants.filter(id__in=variant_ids)
            if not variants:
                return Response({"available": product.stock > 0, "stock": product.stock})
            
            # En düşük stoğu al
            min_stock = min(variant.stock for variant in variants)
            return Response({
                "available": min_stock > 0,
                "stock": min_stock
            })
        except Exception as e:
            logger.error(f"Stok kontrolünde hata: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Stok kontrolü yapılırken bir hata oluştu"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class SliderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SliderSerializer

    def get_queryset(self):
        return Slider.objects.filter(is_active=True).order_by('order')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context