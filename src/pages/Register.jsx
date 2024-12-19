import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Link,
  Divider,
  CircularProgress,
  Grid 
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register({ setNotification }) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      email: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (formData.password !== formData.password2) {
          setNotification({
              open: true,
              message: 'Şifreler eşleşmiyor!',
              severity: 'error'
          });
          setLoading(false);
          return;
      }

      try {
          console.log('Gönderilen veri:', formData);
          await register(formData);
          
          setNotification({
              open: true,
              message: 'Kayıt başarılı! Lütfen email adresinize gönderilen doğrulama linkine tıklayın.',
              severity: 'success'
          });
          navigate('/giris');
      } catch (error) {
          console.error('Register error details:', {
              response: error.response?.data,
              status: error.response?.status,
              error: error
          });
          
          let errorMessage = 'Kayıt olurken bir hata oluştu.';
          
          if (error.response?.data) {
              const errors = error.response.data.error || error.response.data;
              if (typeof errors === 'object') {
                  errorMessage = Object.entries(errors)
                      .map(([field, messages]) => {
                          if (Array.isArray(messages)) {
                              return `${field}: ${messages.join(', ')}`;
                          }
                          return `${field}: ${messages}`;
                      })
                      .join('\n');
              } else if (typeof errors === 'string') {
                  errorMessage = errors;
              }
          }

          setNotification({
              open: true,
              message: errorMessage,
              severity: 'error'
          });
      } finally {
          setLoading(false);
      }
  };

  return (
      <Container component="main" maxWidth="xs">
          <Box
              sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
              }}
          >
              <Paper elevation={3} sx={{ p: 4, mt: 4, width: '100%' }}>
                  <Typography variant="h5" align="center" gutterBottom>
                      Kayıt Ol
                  </Typography>
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                              <TextField
                                  required
                                  fullWidth
                                  label="Ad"
                                  name="first_name"
                                  value={formData.first_name}
                                  onChange={handleChange}
                                  autoFocus
                              />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <TextField
                                  required
                                  fullWidth
                                  label="Soyad"
                                  name="last_name"
                                  value={formData.last_name}
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
                                  autoComplete="email"
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                  required
                                  fullWidth
                                  label="Şifre"
                                  name="password"
                                  type="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  autoComplete="new-password"
                              />
                          </Grid>
                          <Grid item xs={12}>
                              <TextField
                                  required
                                  fullWidth
                                  label="Şifre (Tekrar)"
                                  name="password2"
                                  type="password"
                                  value={formData.password2}
                                  onChange={handleChange}
                                  autoComplete="new-password"
                              />
                          </Grid>
                      </Grid>

                      <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          sx={{ mt: 3, mb: 2 }}
                          disabled={loading}
                      >
                          {loading ? (
                              <CircularProgress size={24} sx={{ color: 'white' }} />
                          ) : (
                              'Kayıt Ol'
                          )}
                      </Button>
                      
                      <Divider sx={{ my: 2 }}>veya</Divider>
                      
                      <Box sx={{ textAlign: 'center' }}>
                          <Link 
                              component="button"
                              variant="body2"
                              onClick={() => navigate('/giris')}
                          >
                              Zaten hesabınız var mı? Giriş yapın
                          </Link>
                      </Box>
                  </Box>
              </Paper>
          </Box>
      </Container>
  );
}

export default Register;