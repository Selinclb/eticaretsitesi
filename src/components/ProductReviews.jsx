import { 
    Box, 
    Typography, 
    Rating, 
    Button, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Avatar,
    Grid,
    Chip
  } from '@mui/material';
  import { useState } from 'react';
  import { useAuth } from '../context/AuthContext';
  import axiosInstance from '../services/axiosConfig';
  
  function ProductReviews({ product, setNotification }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [pros, setPros] = useState('');
    const [cons, setCons] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const response = await axiosInstance.post(
          `/products/${product.slug}/review/`,
          {
            rating,
            comment,
            pros,
            cons
          }
        );
  
        setNotification({
          open: true,
          message: 'Değerlendirmeniz başarıyla gönderildi. Onay sonrası yayınlanacaktır.',
          severity: 'success'
        });
  
        setOpen(false);
        setRating(0);
        setComment('');
        setPros('');
        setCons('');
      } catch (error) {
        setNotification({
          open: true,
          message: error.response?.data?.error || 'Değerlendirme gönderilirken bir hata oluştu.',
          severity: 'error'
        });
      }
    };
  
    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Değerlendirmeler ({product.review_count})
          </Typography>
          {user && (
            <Button 
              variant="contained" 
              onClick={() => setOpen(true)}
            >
              Değerlendirme Yap
            </Button>
          )}
        </Box>
  
        {product.average_rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Rating value={product.average_rating} precision={0.5} readOnly />
            <Typography variant="h6" sx={{ ml: 1 }}>
              {product.average_rating.toFixed(1)}
            </Typography>
          </Box>
        )}
  
        <Grid container spacing={2}>
          {product.reviews?.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 1 }}>{review.user[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{review.user}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.created_at_formatted}
                    </Typography>
                  </Box>
                  {review.is_verified_purchase && (
                    <Chip 
                      label="Doğrulanmış Alışveriş" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
                
                <Rating value={review.rating} readOnly size="small" />
                
                <Typography sx={{ my: 1 }}>{review.comment}</Typography>
                
                {review.pros && (
                  <Box sx={{ mb: 1 }}>
                    <Typography color="success.main" variant="subtitle2">
                      Artıları:
                    </Typography>
                    <Typography variant="body2">{review.pros}</Typography>
                  </Box>
                )}
                
                {review.cons && (
                  <Box>
                    <Typography color="error.main" variant="subtitle2">
                      Eksileri:
                    </Typography>
                    <Typography variant="body2">{review.cons}</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
  
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Ürünü Değerlendir</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography component="legend">Puanınız</Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  size="large"
                  sx={{ ml: 2 }}
                />
              </Box>
  
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Yorumunuz"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
  
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Artıları (Opsiyonel)"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                sx={{ mb: 2 }}
              />
  
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Eksileri (Opsiyonel)"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>İptal</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!rating || !comment}
            >
              Gönder
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  export default ProductReviews;