import { 
    Container, 
    Typography, 
    Paper, 
    Grid, 
    List, 
    ListItem, 
    ListItemText, 
    Chip, 
    Button,
    Divider,
    Box,
    CircularProgress,
    Card,
    CardContent
  } from '@mui/material';
  import { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import axios from 'axios';
  
  const statusColors = {
    'pending': 'warning',
    'confirmed': 'info',
    'shipped': 'primary',
    'delivered': 'success',
    'cancelled': 'error'
  };
  
  function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchOrderDetail = async () => {
        try {
          const response = await axios.get(`/api/orders/${id}/`);
          setOrder(response.data);
        } catch (err) {
          setError('Sipariş detayları yüklenirken bir hata oluştu.');
          console.error('Error fetching order details:', err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchOrderDetail();
    }, [id]);
  
    const handleCancelOrder = async () => {
      if (!window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
        return;
      }
  
      try {
        await axios.post(`/api/orders/${id}/cancel/`);
        // Sayfayı yenile
        const response = await axios.get(`/api/orders/${id}/`);
        setOrder(response.data);
      } catch (err) {
        alert('Sipariş iptal edilirken bir hata oluştu.');
        console.error('Error cancelling order:', err);
      }
    };
  
    if (loading) {
      return (
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      );
    }
  
    if (error || !order) {
      return (
        <Container sx={{ mt: 4 }}>
          <Typography color="error">{error || 'Sipariş bulunamadı.'}</Typography>
          <Button onClick={() => navigate('/siparisler')} sx={{ mt: 2 }}>
            Siparişlere Dön
          </Button>
        </Container>
      );
    }
  
    return (
      <Container sx={{ mt: 4 }}>
        <Button onClick={() => navigate('/siparisler')} sx={{ mb: 2 }}>
          ← Siparişlere Dön
        </Button>
  
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Sipariş #{order.order_number}
                </Typography>
                <Chip 
                  label={order.status_display}
                  color={statusColors[order.status]}
                />
              </Box>
  
              <Divider sx={{ my: 2 }} />
  
              <List>
                {order.items.map((item) => (
                  <ListItem key={item.id} alignItems="flex-start">
                    <Box
                      component="img"
                      src={item.product_image}
                      alt={item.product_name}
                      sx={{ width: 100, mr: 2 }}
                    />
                    <ListItemText
                      primary={item.product_name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {item.quantity} adet x {item.price.toLocaleString('tr-TR')} TL
                          </Typography>
                          <Typography component="span" variant="body2" sx={{ float: 'right' }}>
                            {item.total.toLocaleString('tr-TR')} TL
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
  
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sipariş Özeti
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Teslimat Adresi:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {order.shipping_address}
                </Typography>
                <Typography variant="h6">
                  Toplam: {order.total_amount.toLocaleString('tr-TR')} TL
                </Typography>
  
                {order.status === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleCancelOrder}
                  >
                    Siparişi İptal Et
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  export default OrderDetail;