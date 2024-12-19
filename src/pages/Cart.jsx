import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Button,
  Box,
  Paper,
  Grid,
  ButtonGroup,
  Divider,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  DialogContentText 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useCart } from '../context/CartContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const total = cart.reduce((sum, item) => {
    const price = item.is_on_sale ? item.discounted_price : item.price;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleClearCart = () => {
    clearCart();
    setOpenDialog(false);
    setNotification({
      open: true,
      message: 'Sepetiniz temizlendi',
      severity: 'success'
    });
  };

  if (cart.length === 0) {
    return (
      <Container>
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Sepetiniz boş
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Alışverişe başlamak için ürünleri incelemeye başlayabilirsiniz.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/')}
          >
            Alışverişe Başla
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee'
            }}>
              <Typography variant="h6">
                Sepetim ({cart.length} Ürün)
              </Typography>
              {cart.length > 0 && (
                <Button
                  startIcon={<DeleteSweepIcon />}
                  color="error"
                  onClick={() => setOpenDialog(true)}
                >
                  Sepeti Temizle
                </Button>
              )}
            </Box>
            <List>
              {cart.map((item) => {
                const primaryImage = item.images?.find(img => img.is_primary) || item.images?.[0];
                const imageUrl = primaryImage?.image || '/placeholder.jpg';
                const currentPrice = item.is_on_sale ? item.discounted_price : item.price;

                return (
                  <ListItem
                    key={item.id}
                    sx={{ 
                      borderBottom: '1px solid #eee',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <Box 
                      component="img"
                      src={imageUrl}
                      alt={item.name}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'contain',
                        borderRadius: 1,
                        mr: 2,
                        bgcolor: 'background.paper'
                      }}
                    />
                    
                    <ListItemText
                      primary={
                        <RouterLink
                          to={`/urun/${item.slug}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:hover': {
                              color: 'primary.main',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {item.name}
                        </RouterLink>
                      }
                      secondary={
                        <Box>
                          {item.is_on_sale ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                component="span" 
                                color="error.main"
                              >
                                {item.discounted_price.toLocaleString('tr-TR')} TL
                              </Typography>
                              <Typography 
                                component="span" 
                                sx={{ 
                                  textDecoration: 'line-through',
                                  color: 'text.secondary',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {item.price.toLocaleString('tr-TR')} TL
                              </Typography>
                            </Box>
                          ) : (
                            `${item.price.toLocaleString('tr-TR')} TL`
                          )}
                        </Box>
                      }
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ButtonGroup size="small">
                        <Button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <RemoveIcon fontSize="small" />
                        </Button>
                        <Button disabled>
                          {item.quantity}
                        </Button>
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </ButtonGroup>

                      <Typography variant="body1" sx={{ minWidth: 100, textAlign: 'right' }}>
                        {(currentPrice * item.quantity).toLocaleString('tr-TR')} TL
                      </Typography>

                      <IconButton 
                        edge="end" 
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sipariş Özeti
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Ürün Sayısı:</Typography>
              <Typography>{totalItems} adet</Typography>
            </Box>
            
            {cart.some(item => item.is_on_sale) && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Toplam İndirim:</Typography>
                <Typography color="error.main">
                  {cart.reduce((sum, item) => {
                    if (item.is_on_sale) {
                      return sum + ((item.price - item.discounted_price) * item.quantity);
                    }
                    return sum;
                  }, 0).toLocaleString('tr-TR')} TL
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Toplam:</Typography>
              <Typography variant="h6" color="primary">
                {total.toLocaleString('tr-TR')} TL
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              size="large"
              onClick={() => navigate('/checkout')}
      >
              Siparişi Tamamla
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Sepeti Temizle
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sepetinizdeki tüm ürünleri silmek istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            color="primary"
          >
            İptal
          </Button>
          <Button 
            onClick={handleClearCart}
            color="error"
            variant="contained"
            startIcon={<DeleteSweepIcon />}
          >
            Sepeti Temizle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Cart;