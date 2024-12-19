from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price','formatted_price','total','formatted_total']

    def get_product_image(self, obj):
        if obj.product and obj.product.images.filter(is_primary=True).exists():
            return obj.product.images.filter(is_primary=True).first().image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'status_display', 'total_amount', 'formatted_total_amount',
                 'shipping_address', 'created_at', 'items']