import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Container,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { debounce } from 'lodash';
import { productService } from '../services/api';

function Header({ user, onLogout }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const debouncedSearch = debounce(async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await productService.search(query);
      setSearchResults(response.data.slice(0, 5));
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/arama?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'white',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1, gap: 2 }}>
          {/* Logo ve Başlık */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              gap: 1,
              mr: { md: 4 }
            }}
          >
            <img 
              src="/icon.png" 
              alt="Logo" 
              style={{ 
                width: '60px', 
                height: '60px',
                objectFit: 'contain'
              }} 
            />
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 500,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                lineHeight: 1.2
              }}
            >
              Teknoloji<br />Mağazası
            </Typography>
          </Box>

          {/* Güncellenmiş arama alanı */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'block' },
              mx: 2,
              position: 'relative'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: isSearching && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: (theme) => alpha(theme.palette.common.black, 0.04),
                  borderRadius: '20px',
                  '& fieldset': { border: 'none' },
                }
              }}
            />

            {/* Anlık arama sonuçları */}
            {searchResults.length > 0 && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflow: 'auto',
                  boxShadow: 3
                }}
              >
                {searchResults.map((product) => (
                  <MenuItem
                    key={product.id}
                    component={Link}
                    to={`/urun/${product.slug}`}
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1
                    }}
                  >
                    <img
                      src={product.primary_image_url}
                      alt={product.name}
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                    <Box>
                      <Typography variant="body2">{product.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {product.price} TL
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
                
                {/* Tüm sonuçları göster butonu */}
                <MenuItem
                  onClick={handleSearchSubmit}
                  sx={{
                    justifyContent: 'center',
                    color: 'primary.main',
                    borderTop: 1,
                    borderColor: 'divider'
                  }}
                >
                  Tüm sonuçları göster
                </MenuItem>
              </Paper>
            )}
          </Box>

          {/* Mobil Menü Butonu */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>

          {/* Masaüstü Menü */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>

            <IconButton color="inherit" component={Link} to="/sepet">
              <Badge badgeContent={cartItemCount} color="error">
                <CartIcon sx={{ color: 'text.primary' }} />
              </Badge>
            </IconButton>

            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={handleProfileMenuOpen}
                  startIcon={
                    <Avatar
                      sx={{ 
                        width: 32, 
                        height: 32,
                        backgroundColor: 'primary.main'
                      }}
                    >
                      {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                  }
                  sx={{ 
                    ml: 1,
                    textTransform: 'none',
                    color: 'text.primary'
                  }}
                >
                  {user.username}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 180,
                      borderRadius: 2,
                      boxShadow: theme.shadows[3]
                    }
                  }}
                >
                  <MenuItem component={Link} to="/profil">Profilim</MenuItem>
                  <MenuItem component={Link} to="/siparislerim">Siparişlerim</MenuItem>
                  <MenuItem onClick={onLogout}>Çıkış Yap</MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                onClick={() => navigate('/giris')}
                sx={{
                  ml: 2,
                  borderRadius: '10px',
                  textTransform: 'none',
                  px: 3
                }}
              >
                Giriş Yap
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobil Menü */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '100%',
            mt: 1.5,
            '& .MuiList-root': {
              py: 2
            }
          }
        }}
      >
        <MenuItem component={Link} to="/sepet">
          <CartIcon sx={{ mr: 2 }} /> Sepetim
        </MenuItem>
        
        {user ? (
          <>
            <MenuItem component={Link} to="/profil">
              <PersonIcon sx={{ mr: 2 }} /> Profilim
            </MenuItem>
            <MenuItem component={Link} to="/siparislerim">
              Siparişlerim
            </MenuItem>
            <MenuItem onClick={onLogout}>Çıkış Yap</MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => navigate('/giris')}>
            <PersonIcon sx={{ mr: 2 }} /> Giriş Yap
          </MenuItem>
        )}

        {/* Mevcut mobil menü öğelerinin en üstüne eklenecek */}
        <MenuItem sx={{ px: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e);
                handleMobileMenuClose();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Header;