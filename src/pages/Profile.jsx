import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile({ setNotification }) {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  // Profil formu state'i
  const [formData, setFormData] = useState({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      address_title: user?.address_title || '',
      address: user?.address || '',
      city: user?.city || '',
      district: user?.district || '',
      postal_code: user?.postal_code || ''
  });

  // Şifre değiştirme formu state'i
  const [passwordData, setPasswordData] = useState({
      current_password: '',
      new_password: ''
  });

  // Hesap silme için şifre state'i
  const [deletePassword, setDeletePassword] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);

  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value
      });
  };

  const handlePasswordChange = (e) => {
      setPasswordData({
          ...passwordData,
          [e.target.name]: e.target.value
      });
  };

  const handleProfileUpdate = async () => {
      setLoading(true);
      try {
          await updateProfile(formData);
          setNotification({
              open: true,
              message: 'Profil başarıyla güncellendi',
              severity: 'success'
          });
          setIsEditing(false);
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Profil güncellenirken bir hata oluştu',
              severity: 'error'
          });
      } finally {
          setLoading(false);
      }
  };

  const handlePasswordUpdate = async () => {
      try {
          await changePassword(passwordData);
          setNotification({
              open: true,
              message: 'Şifreniz başarıyla güncellendi',
              severity: 'success'
          });
          setShowPasswordDialog(false);
          setPasswordData({ current_password: '', new_password: '' });
          await logout();
          navigate('/giris');
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Şifre güncellenirken bir hata oluştu',
              severity: 'error'
          });
      }
  };

  const handleDeleteAccount = async () => {
      try {
          await deleteAccount(deletePassword);
          setNotification({
              open: true,
              message: 'Hesabınız başarıyla silindi',
              severity: 'success'
          });
          navigate('/giris');
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Hesap silinirken bir hata oluştu',
              severity: 'error'
          });
      }
  };

  const handleToggle2FA = async () => {
      try {
          if (twoFactorEnabled) {
              await authService.disable2FA();
              setNotification({
                  open: true,
                  message: 'İki faktörlü doğrulama devre dışı bırakıldı',
                  severity: 'success'
              });
          } else {
              await authService.enable2FA();
              setNotification({
                  open: true,
                  message: 'İki faktörlü doğrulama aktifleştirildi',
                  severity: 'success'
              });
          }
          setTwoFactorEnabled(!twoFactorEnabled);
      } catch (error) {
          setNotification({
              open: true,
              message: error.response?.data?.error || 'Bir hata oluştu',
              severity: 'error'
          });
      }
  };

  return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                  Profil Bilgileri
              </Typography>

              <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                      <TextField
                          fullWidth
                          label="Ad"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField
                          fullWidth
                          label="Soyad"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          fullWidth
                          label="E-posta"
                          value={user?.email}
                          disabled
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          fullWidth
                          label="Telefon"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          fullWidth
                          label="Adres Başlığı"
                          name="address_title"
                          value={formData.address_title}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <TextField
                          fullWidth
                          label="Adres"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          multiline
                          rows={3}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField
                          fullWidth
                          label="Şehir"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField
                          fullWidth
                          label="İlçe"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <TextField
                          fullWidth
                          label="Posta Kodu"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          disabled={!isEditing}
                      />
                  </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  {isEditing ? (
                      <>
                          <Button 
                              variant="contained" 
                              onClick={handleProfileUpdate}
                              disabled={loading}
                          >
                              {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                          </Button>
                          <Button 
                              variant="outlined" 
                              onClick={() => setIsEditing(false)}
                              disabled={loading}
                          >
                              İptal
                          </Button>
                      </>
                  ) : (
                      <Button 
                          variant="contained" 
                          onClick={() => setIsEditing(true)}
                      >
                          Düzenle
                      </Button>
                  )}
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                      variant="outlined" 
                      onClick={() => setShowPasswordDialog(true)}
                  >
                      Şifre Değiştir
                  </Button>
                  <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => setShowDeleteDialog(true)}
                  >
                      Hesabı Sil
                  </Button>
              </Box>

              <FormControlLabel
                  control={
                      <Switch
                          checked={twoFactorEnabled}
                          onChange={handleToggle2FA}
                          color="primary"
                      />
                  }
                  label="İki Faktörlü Doğrulama"
              />

              {/* Şifre Değiştirme Dialog'u */}
              <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
                  <DialogTitle>Şifre Değiştir</DialogTitle>
                  <DialogContent>
                      <TextField
                          fullWidth
                          margin="dense"
                          label="Mevcut Şifre"
                          type="password"
                          name="current_password"
                          value={passwordData.current_password}
                          onChange={handlePasswordChange}
                      />
                      <TextField
                          fullWidth
                          margin="dense"
                          label="Yeni Şifre"
                          type="password"
                          name="new_password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setShowPasswordDialog(false)}>
                          İptal
                      </Button>
                      <Button onClick={handlePasswordUpdate} variant="contained">
                          Değiştir
                      </Button>
                  </DialogActions>
              </Dialog>

              {/* Hesap Silme Dialog'u */}
              <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                  <DialogTitle>Hesabı Sil</DialogTitle>
                  <DialogContent>
                      <Typography gutterBottom>
                          Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                      </Typography>
                      <TextField
                          fullWidth
                          margin="dense"
                          label="Şifrenizi girin"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setShowDeleteDialog(false)}>
                          İptal
                      </Button>
                      <Button onClick={handleDeleteAccount} color="error">
                          Hesabı Sil
                      </Button>
                  </DialogActions>
              </Dialog>
          </Paper>
      </Container>
  );
}

export default Profile;