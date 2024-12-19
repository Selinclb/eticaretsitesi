import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Chip,
  Rating,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function ProductCard({ product, setNotification }) {
  const { addToCart } = useCart();
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imageUrl = primaryImage?.image || '/placeholder.jpg';

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setNotification({
      open: true,
      message: `${product.name} sepete eklendi!`,
      severity: 'success'
    });
  };

  const calculateDiscount = () => {
    if (!product.is_on_sale || !product.price || !product.discounted_price) return 0;
    return Math.round(((product.price - product.discounted_price) / product.price) * 100);
  };

  return (
    <Card 
      component={Link}
      to={`/urun/${product.slug}`}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product.name}
          sx={{ 
            height: 200,
            objectFit: 'contain',
            bgcolor: 'background.paper'
          }}
        />
        {product.is_on_sale && (
          <Chip
            label={`%${calculateDiscount()} İndirim`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.6em'
          }}
        >
          {product.name}
        </Typography>

        {product.average_rating > 0 && (
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            sx={{ mb: 1 }}
          >
            <Rating 
              value={product.average_rating} 
              precision={0.5} 
              size="small" 
              readOnly 
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              ({product.review_count})
            </Typography>
          </Stack>
        )}

        <Box sx={{ mt: 'auto' }}>
          {product.is_on_sale ? (
            <Box>
              <Typography 
                variant="h6" 
                color="error" 
                component="span"
                sx={{ mr: 1 }}
              >
                {formatPrice(product.discounted_price)} TL
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                component="span"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatPrice(product.price)} TL
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="primary">
              {formatPrice(product.price)} TL
            </Typography>
          )}
        </Box>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          sx={{ 
            mt: 'auto',
            bgcolor: product.stock <= 0 ? 'grey.500' : 'primary.main',
            '&:hover': {
              bgcolor: product.stock <= 0 ? 'grey.600' : 'primary.dark'
            }
          }}
        >
          {product.stock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
        </Button>
      </Box>
    </Card>
  );
}

export default ProductCard;