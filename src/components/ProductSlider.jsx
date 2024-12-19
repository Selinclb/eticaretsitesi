import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

function ProductSlider({ slides = [] }) {
  if (slides.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade" // Fade efekti ekledik
        speed={1000} // Geçiş hızını artırdık
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true, // Dinamik bullet'lar
          renderBullet: function (index, className) {
            return `<span class="${className}" style="width: 10px; height: 10px;"></span>`;
          },
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            <Box
              component={Link}
              to={slide.url}
              sx={{
                display: 'block',
                position: 'relative',
                width: '100%',
                height: { xs: '400px', sm: '500px', md: '300px' }, // Yüksekliği artırdık
                overflow: 'hidden',
                backgroundColor: '#fff', 
              }}
            >
              <img
                src={slide.image_url}
                alt={slide.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: '0.9', // Resme hafif opaklık ekledik
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%)', // Gradyani değiştirdik
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center', // Merkeze aldık
                  alignItems: 'flex-start', // Sola hizaladık
                  padding: { xs: 4, sm: 8, md: 12 }, // Padding'i artırdık
                }}
              >
                <Box
                  sx={{
                    maxWidth: '600px',
                    width: '100%',
                  }}
                >
                  {slide.title && (
                    <Typography
                      variant="h2" // Başlık boyutunu büyüttük
                      sx={{
                        color: 'white',
                        mb: 3,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {slide.title}
                    </Typography>
                  )}
                  {slide.description && (
                    <Typography
                      variant="h5"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 4,
                        fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                        fontWeight: 400,
                        lineHeight: 1.6,
                        maxWidth: '500px',
                      }}
                    >
                      {slide.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

export default ProductSlider;