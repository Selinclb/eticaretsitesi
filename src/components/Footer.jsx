import { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Phone,
  Email,
  LocationOn
} from '@mui/icons-material';
import axiosInstance from '../services/axiosConfig';

function Footer() {
  const [contact, setContact] = useState(null);
  const [socialMedia, setSocialMedia] = useState(null);
  const [policies, setPolicies] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [contactRes, socialRes, policiesRes] = await Promise.all([
          axiosInstance.get('/settings/contact/'),
          axiosInstance.get('/settings/social-media/'),
          axiosInstance.get('/settings/policies/')
        ]);

        console.log('Contact Response:', contactRes);
        console.log('Social Media Response:', socialRes);
        console.log('Policies Response:', policiesRes);

        setContact(Array.isArray(contactRes.data) ? contactRes.data[0] : contactRes.data);
        setSocialMedia(Array.isArray(socialRes.data) ? socialRes.data[0] : socialRes.data);
        setPolicies(Array.isArray(policiesRes.data) ? policiesRes.data[0] : policiesRes.data);

      } catch (error) {
        console.error('Footer verileri yüklenirken hata:', error);
        if (error.response) {
          console.error('API Yanıt Detayı:', error.response.data);
          console.error('API Durum Kodu:', error.response.status);
        }
      }
    };

    fetchFooterData();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Kurumsal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Kurumsal
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="/hakkimizda" color="text.secondary" underline="hover">
                Hakkımızda
              </Link>
              <Link href="/iletisim" color="text.secondary" underline="hover">
                İletişim
              </Link>
            </Box>
          </Grid>

          {/* Müşteri Hizmetleri */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Müşteri Hizmetleri
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {policies && (
                <>
                  <Link href="/gizlilik-politikasi" color="text.secondary" underline="hover">
                    Gizlilik Politikası
                  </Link>
                  <Link href="/kullanim-sartlari" color="text.secondary" underline="hover">
                    Kullanım Şartları
                  </Link>
                  <Link href="/iade-sartlari" color="text.secondary" underline="hover">
                    İade Şartları
                  </Link>
                </>
              )}
            </Box>
          </Grid>

          {/* İletişim */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              İletişim
            </Typography>
            {contact && (
              <Box display="flex" flexDirection="column" gap={2}>
                {contact.phone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone color="primary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {contact.phone}
                    </Typography>
                  </Box>
                )}
                {contact.email && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email color="primary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {contact.email}
                    </Typography>
                  </Box>
                )}
                {contact.location && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn color="primary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {contact.location}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          {/* Sosyal Medya */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Bizi Takip Edin
            </Typography>
            {socialMedia && (
              <Box display="flex" gap={1}>
                {socialMedia.facebook && (
                  <IconButton
                    href={socialMedia.facebook}
                    target="_blank"
                    aria-label="Facebook"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: '#1877F2' }
                    }}
                  >
                    <Facebook />
                  </IconButton>
                )}
                {socialMedia.twitter && (
                  <IconButton
                    href={socialMedia.twitter}
                    target="_blank"
                    aria-label="Twitter"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: '#1DA1F2' }
                    }}
                  >
                    <Twitter />
                  </IconButton>
                )}
                {socialMedia.instagram && (
                  <IconButton
                    href={socialMedia.instagram}
                    target="_blank"
                    aria-label="Instagram"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: '#E4405F' }
                    }}
                  >
                    <Instagram />
                  </IconButton>
                )}
                {socialMedia.linkedin && (
                  <IconButton
                    href={socialMedia.linkedin}
                    target="_blank"
                    aria-label="LinkedIn"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: '#0A66C2' }
                    }}
                  >
                    <LinkedIn />
                  </IconButton>
                )}
                {socialMedia.youtube && (
                  <IconButton
                    href={socialMedia.youtube}
                    target="_blank"
                    aria-label="YouTube"
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: '#FF0000' }
                    }}
                  >
                    <YouTube />
                  </IconButton>
                )}
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Teknoloji Mağazası. Tüm hakları saklıdır.
          </Typography>
          <Box
            component="img"
            src="/payment-methods.png"
            alt="Ödeme Yöntemleri"
            sx={{
              height: 30,
              filter: 'grayscale(100%)',
              opacity: 0.7
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;