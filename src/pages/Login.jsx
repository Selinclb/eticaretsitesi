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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions 
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

function Login({ setNotification }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      email: '',
      password: ''
  });
  
  // Şifremi Unuttum modal state'i
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [show2FADialog, setShow2FADialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempEmail, setTempEmail] = useState('');

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
      try {
          const response = await authService.login(formData);
          
          if (response.requires_2fa) {
              setTempEmail(response.email);
              setShow2FADialog(true);
              setNotification({
                  open: true,
                  message: 'Doğrulama kodu email adresinize gönderildi.',
                  severity: 'info'
              });
          } else {
              setNotification({
                  open: true,
                  message: 'Başarıyla giriş yapıldı!',
                  severity: 'success'
              });
              navigate('/');
          }
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Giriş yapılamadı',
              severity: 'error'
          });
      } finally {
          setLoading(false);
      }
  };

  // Şifre sıfırlama isteği
  const handleResetPassword = async () => {
      setResetLoading(true);
      try {
          await authService.requestPasswordReset(resetEmail);
          setNotification({
              open: true,
              message: 'Şifre sıfırlama linki email adresinize gönderildi.',
              severity: 'success'
          });
          setResetModalOpen(false);
          setResetEmail('');
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Bir hata oluştu',
              severity: 'error'
          });
      } finally {
          setResetLoading(false);
      }
  };

  const handle2FAVerification = async () => {
      setLoading(true);
      try {
          await authService.verify2FA(tempEmail, verificationCode);
          setShow2FADialog(false);
          setNotification({
              open: true,
              message: 'Başarıyla giriş yapıldı!',
              severity: 'success'
          });
          navigate('/');
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Doğrulama başarısız',
              severity: 'error'
          });
      } finally {
          setLoading(false);
      }
  };

  return (
      <Container component="main" maxWidth="xs">
          <Box sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
          }}>
              <Paper elevation={3} sx={{ p: 4, mt: 4, width: '100%' }}>
                  <Typography variant="h5" align="center" gutterBottom>
                      Giriş Yap
                  </Typography>
                  
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                      <TextField
                          required
                          fullWidth
                          label="E-posta"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          margin="normal"
                          autoComplete="email"
                          autoFocus
                      />
                      
                      <TextField
                          required
                          fullWidth
                          label="Şifre"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          margin="normal"
                          autoComplete="current-password"
                      />
                      
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
                              'Giriş Yap'
                          )}
                      </Button>
                      
                      <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <Link
                              component="button"
                              variant="body2"
                              onClick={() => setResetModalOpen(true)}
                          >
                              Şifremi Unuttum
                          </Link>
                      </Box>
                      
                      <Divider sx={{ my: 2 }}>veya</Divider>
                      
                      <Box sx={{ textAlign: 'center' }}>
                          <Link 
                              component="button"
                              variant="body2"
                              onClick={() => navigate('/kayit')}
                          >
                              Hesabınız yok mu? Kayıt olun
                          </Link>
                      </Box>
                  </Box>
              </Paper>
          </Box>

          {/* Şifremi Unuttum Modal */}
          <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)}>
              <DialogTitle>Şifre Sıfırlama</DialogTitle>
              <DialogContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                      E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                  </Typography>
                  <TextField
                      autoFocus
                      margin="dense"
                      label="E-posta"
                      type="email"
                      fullWidth
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setResetModalOpen(false)}>
                      İptal
                  </Button>
                  <Button 
                      onClick={handleResetPassword} 
                      disabled={resetLoading}
                      variant="contained"
                  >
                      {resetLoading ? (
                          <CircularProgress size={24} />
                      ) : (
                          'Gönder'
                      )}
                  </Button>
              </DialogActions>
          </Dialog>

          {/* 2FA Dialog */}
          <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)}>
              <DialogTitle>İki Faktörlü Doğrulama</DialogTitle>
              <DialogContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                      Email adresinize gönderilen 6 haneli kodu girin.
                  </Typography>
                  <TextField
                      autoFocus
                      margin="dense"
                      label="Doğrulama Kodu"
                      type="text"
                      fullWidth
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      inputProps={{ maxLength: 6 }}
                  />
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setShow2FADialog(false)}>
                      İptal
                  </Button>
                  <Button 
                      onClick={handle2FAVerification} 
                      variant="contained"
                      disabled={verificationCode.length !== 6 || loading}
                  >
                      {loading ? <CircularProgress size={24} /> : 'Doğrula'}
                  </Button>
              </DialogActions>
          </Dialog>
      </Container>
  );
}

export default Login;