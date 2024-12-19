import { 
  Grid, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  TextField,
  Breadcrumbs,
  Dialog,
  DialogContent,
  Link,
  Chip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ProductReviews from '../components/ProductReviews';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StarIcon from '@mui/icons-material/Star';
import DOMPurify from 'dompurify';
import ProductGallery from '../components/ProductGallery';

function ProductDetail({ setNotification }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const [openZoom, setOpenZoom] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const response = await productService.getBySlug(slug);
        console.log('Product Data:', response.data);
        console.log('Product Images:', response.data.images);
        setProduct(response.data);

        if (response.data.category?.slug) {
          const relatedResponse = await productService.getByCategorySlug(response.data.category.slug);
          const filtered = relatedResponse.data
            .filter(p => p.slug !== slug)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Ürün detay hatası:', err);
        setError('Ürün detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [slug]);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setNotification({
      open: true,
      message: `${quantity} adet ${product.name} sepete eklendi!`,
      severity: 'success'
    });
    setQuantity(1); // Miktar seçimini sıfırlar
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Güvenli HTML render fonksiyonu
  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!product) return <Typography>Ürün bulunamadı</Typography>;

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const imageUrl = primaryImage?.image || '/placeholder.jpg';

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          href="/" 
          color="inherit"
          underline="hover"
          sx={{ 
            '&:hover': { color: 'primary.main' },
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Ana Sayfa
        </Link>
        
        {product?.category && (
          <Link 
            href={`/kategori/${product.category.slug}`}
            color="inherit"
            underline="hover"
            sx={{ 
              '&:hover': { color: 'primary.main' }
            }}
          >
            {product.category.name}
          </Link>
        )}
        
        {product?.subcategory && (
          <Link 
            href={`/kategori/${product.category.slug}/${product.subcategory.slug}`}
            color="inherit"
            underline="hover"
            sx={{ 
              '&:hover': { color: 'primary.main' }
            }}
          >
            {product.subcategory.name}
          </Link>
        )}
        
        <Typography color="text.secondary">
          {product.name}
        </Typography>
      </Breadcrumbs>
      <Paper elevation={0} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ProductGallery 
              images={product.images} 
              productName={product.name}
            />

            <Dialog
              open={openZoom}
              onClose={() => setOpenZoom(false)}
              maxWidth="lg"
              fullWidth
            >
              <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                  onClick={() => setOpenZoom(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'white',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '90vh',
                    objectFit: 'contain'
                  }}
                />
              </DialogContent>
            </Dialog>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>

              {/* Stok ve Kargo Durumu */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  icon={product.stock > 0 ? <CheckCircleIcon /> : <ErrorIcon />}
                  label={product.stock > 0 ? 'Stokta' : 'Stokta Yok'}
                  color={product.stock > 0 ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
                {product.stock > 0 && (
                  <Chip
                    icon={<LocalShippingIcon />}
                    label="Hızlı Kargo"
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <Chip
                    label={`Son ${product.stock} Ürün`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>

              {/* Fiyat Gösterimi */}
              <Box sx={{ mb: 2 }}>
                {product.is_on_sale ? (
                  <Box>
                    <Typography 
                      variant="h5" 
                      color="error" 
                      component="span"
                      sx={{ mr: 2 }}
                    >
                      {formatPrice(product.discounted_price)} TL
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      component="span"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatPrice(product.price)} TL
                    </Typography>
                    <Chip
                      label={`%${Math.round(((product.price - product.discounted_price) / product.price) * 100)} İndirim`}
                      color="error"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                ) : (
                  <Typography variant="h5" color="primary">
                    {formatPrice(product.price)} TL
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Miktar Seçimi */}
              {product.stock > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 2 
                }}>
                  <IconButton 
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    size="small"
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>

                  <TextField
                    value={quantity}
                    onChange={handleQuantityChange}
                    type="number"
                    inputProps={{ 
                      min: 1, 
                      max: product.stock,
                      style: { textAlign: 'center' }
                    }}
                    sx={{ 
                      width: '70px',
                      '& input': { 
                        padding: '8px',
                        textAlign: 'center'
                      },
                      // Ok butonlarını gizle
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0
                      },
                      '& input[type=number]': {
                        '-moz-appearance': 'textfield'
                      }
                    }}

                  />

                  <IconButton 
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    size="small"
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                sx={{ 
                  bgcolor: product.stock <= 0 ? 'grey.500' : 'primary.main',
                  '&:hover': {
                    bgcolor: product.stock <= 0 ? 'grey.600' : 'primary.dark'
                  }
                }}
              >
                {product.stock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ mt: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: '64px'
            }
          }}
        >
          <Tab 
            icon={<DescriptionIcon />} 
            label="Ürün Açıklaması" 
            iconPosition="start"
          />
          <Tab 
            icon={<ListAltIcon />} 
            label="Teknik Özellikler" 
            iconPosition="start"
          />
          <Tab 
            icon={<StarIcon />} 
            label="Değerlendirmeler" 
            iconPosition="start"
          />
        </Tabs>

        {/* Ürün Açıklaması */}
        <TabPanel value={activeTab} index={0}>
          <Box 
            sx={{ p: 3 }}
            dangerouslySetInnerHTML={createMarkup(product.description)}
            className="product-description"
          />
        </TabPanel>

        {/* Teknik Özellikler */}
        <TabPanel value={activeTab} index={1}>
          {product.specs && Object.keys(product.specs).length > 0 ? (
            <TableContainer sx={{ p: 3 }}>
              <Table>
                <TableBody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <TableRow key={key} sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                    }}>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          width: '40%',
                          fontWeight: 'bold',
                          color: 'text.secondary'
                        }}
                      >
                        {key}
                      </TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Bu ürün için teknik özellik girilmemiş.
            </Typography>
          )}
        </TabPanel>

        {/* Değerlendirmeler */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <ProductReviews 
              product={product} 
              setNotification={setNotification} 
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Benzer Ürünler Bölümü */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Benzer Ürünler
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((relatedProduct) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                <ProductCard 
                  product={relatedProduct} 
                  setNotification={setNotification}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

    </Box>
  );
}

// TabPanel bileşeni
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export default ProductDetail;