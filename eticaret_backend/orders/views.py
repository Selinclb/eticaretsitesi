from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # Sepetteki ürünleri siparişe dönüştür
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Sipariş ürünlerini ekle
        items_data = request.data.get('items', [])
        for item_data in items_data:
            item_data['order'] = order.id
            item_serializer = OrderItemSerializer(data=item_data)
            item_serializer.is_valid(raise_exception=True)
            item_serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'pending':
            order.status = 'cancelled'
            order.save()
            return Response({'status': 'Sipariş iptal edildi'})
        return Response(
            {'error': 'Bu sipariş iptal edilemez'},
            status=status.HTTP_400_BAD_REQUEST
        )