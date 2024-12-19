import { 
    Container, 
    Paper, 
    Typography, 
    Grid, 
    TextField, 
    Button, 
    Box,
    Stepper,
    Step,
    StepLabel,
    Divider
  } from '@mui/material';
  import { useState } from 'react';
  import { useCart } from '../context/CartContext';
  import { useNavigate } from 'react-router-dom';
  
  const steps = ['Teslimat Bilgileri', 'Ödeme', 'Onay'];
  
  function Checkout({ setNotification }) {
    const [activeStep, setActiveStep] = useState(0);
    const { cart, setCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVC: ''
    });
  
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleNext = () => {
      if (activeStep === steps.length - 1) {
        // Siparişi tamamla
        setNotification({
          open: true,
          message: 'Siparişiniz başarıyla oluşturuldu!',
          severity: 'success'
        });
        setCart([]); // Sepeti temizle
        navigate('/'); // Ana sayfaya yönlendir
      } else {
        setActiveStep((prev) => prev + 1);
      }
    };
  
    const handleBack = () => {
      setActiveStep((prev) => prev - 1);
    };
  
    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ad"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Soyad"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="E-posta"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Telefon"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Adres"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Şehir"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          );
        case 1:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Kart Numarası"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Kart Üzerindeki İsim"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Son Kullanma Tarihi"
                  name="cardExpiry"
                  placeholder="AA/YY"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="CVC"
                  name="cardCVC"
                  value={formData.cardCVC}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          );
        case 2:
          return (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sipariş Özeti
              </Typography>
              {cart.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Typography>
                    {item.name} x {item.quantity} = {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">
                Toplam: {total.toLocaleString('tr-TR')} TL
              </Typography>
            </Box>
          );
        default:
          return 'Unknown step';
      }
    };
  
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
  
          {getStepContent(activeStep)}
  
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Geri
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'Siparişi Tamamla' : 'İleri'}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  export default Checkout;