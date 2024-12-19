import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Snackbar, Alert, ThemeProvider, createTheme, CssBaseline, TextField, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import authService from './services/authService';
import Footer from './components/Footer';
import { useCart } from './context/CartContext';
// Özel tema oluşturuyoruz
const theme = createTheme({
  palette: {
    primary: {
      main: '#4700cc', // Mor
      light: '#4700cc',
      dark: '#4700cc',
    },
    secondary: {
      main: '#FF6B6B', // Mercan rengi
      light: '#FF8E8E',
      dark: '#FF4848',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50', // Koyu lacivert
      secondary: '#7F8C8D', // Gri
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          /**/ 
        },
      },
    },
  },
});

const EmailVerification = ({ setNotification }) => {
  const { verifyEmail, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await verifyEmail(token);
        
        if (response.token && response.refresh) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('refreshToken', response.refresh);
          
          await checkAuth();
          
          setNotification({
            open: true,
            message: 'Email adresiniz başarıyla doğrulandı!',
            severity: 'success'
          });
          
          navigate('/');
        } else {
          throw new Error('Token bilgileri eksik');
        }
      } catch (error) {
        let errorMessage = 'Doğrulama başarısız oldu.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        setError(errorMessage);
        setNotification({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Geçersiz doğrulama linki');
      setLoading(false);
    }
  }, [token, verifyEmail, checkAuth, navigate, setNotification]);

  const handleResendEmail = async () => {
    try {
      await authService.resendVerificationEmail(email);
      setNotification({
        open: true,
        message: 'Yeni doğrulama emaili gönderildi!',
        severity: 'success'
      });
      setShowResendForm(false);
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.error || 'Bir hata oluştu',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        
        {!showResendForm ? (
          <Button 
            variant="outlined" 
            onClick={() => setShowResendForm(true)}
            sx={{ mt: 2, mr: 1 }}
          >
            Yeni Doğrulama Emaili İste
          </Button>
        ) : (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Email Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button 
              variant="contained"
              onClick={handleResendEmail}
              disabled={!email}
            >
              Gönder
            </Button>
          </Box>
        )}
        
        <Button 
          variant="contained" 
          onClick={() => navigate('/giris')}
          sx={{ mt: 2 }}
        >
          Giriş Sayfasına Dön
        </Button>
      </Box>
    );
  }

  return null;
};

function App() {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const HeaderWithAuth = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    
    return (
      <Header 
        user={user}
        onLogout={logout}
        cartItemCount={cart?.length || 0}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh'
            }}
          >
            <HeaderWithAuth />
            <Container sx={{ mt: 4, mb: 8, flex: 1 }}>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Home 
                      setNotification={setNotification} 
                    />
                  } 
                />
                <Route 
                  path="/kategori/:categorySlug" 
                  element={
                    <Home 
                      setNotification={setNotification} 
                    />
                  } 
                />
                <Route 
                  path="/kategori/:categorySlug/:subCategorySlug" 
                  element={
                    <Home 
                      setNotification={setNotification} 
                    />
                  } 
                />
                <Route path="/urun/:slug" element={<ProductDetail setNotification={setNotification} />} />
                <Route path="/sepet" element={<Cart setNotification={setNotification} />} />
                <Route path="/giris" element={<Login setNotification={setNotification} />} />
                <Route path="/kayit" element={<Register setNotification={setNotification} />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/profil" 
                  element={
                    <ProtectedRoute>
                      <Profile setNotification={setNotification} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/siparislerim" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/siparislerim/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout setNotification={setNotification} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/email-dogrulama/:token" 
                  element={<EmailVerification setNotification={setNotification} />} 
                />
                <Route path="/arama" element={<Home />} />
              </Routes>
            </Container>
            <Footer />
          </Box>

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          >
            <Alert 
              onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
              severity={notification.severity}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;