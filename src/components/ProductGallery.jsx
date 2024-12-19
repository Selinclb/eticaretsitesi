import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardMedia, 
  ImageList, 
  ImageListItem,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ProductGallery({ images = [], productName }) {
  const [selectedImage, setSelectedImage] = useState(
    images.find(img => img.is_primary)?.image || images[0]?.image || '/placeholder.jpg'
  );
  const [openZoom, setOpenZoom] = useState(false);

  if (images.length === 0) {
    return (
      <Card elevation={0}>
        <CardMedia
          component="img"
          image="/placeholder.jpg"
          alt={productName}
          sx={{ 
            width: '100%',
            height: '500px',
            objectFit: 'contain',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        />
      </Card>
    );
  }

  return (
    <Box>
      {/* Ana resim */}
      <Card 
        elevation={0} 
        sx={{ mb: 2, cursor: 'zoom-in' }}
        onClick={() => setOpenZoom(true)}
      >
        <CardMedia
          component="img"
          image={selectedImage}
          alt={productName}
          sx={{ 
            width: '100%',
            height: '500px',
            objectFit: 'contain',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        />
      </Card>

      {/* Zoom Dialog */}
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
            src={selectedImage}
            alt={productName}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Thumbnail'ler */}
      {images.length > 1 && (
        <ImageList 
          sx={{ 
            width: '100%', 
            height: 100,
            display: 'flex',
            overflowX: 'auto',
            m: 0,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: '4px',
            },
          }} 
          cols={images.length}
          rowHeight={100}
          gap={8}
        >
          {images.map((img, index) => (
            <ImageListItem 
              key={index}
              sx={{ 
                width: 100,
                minWidth: 100,
                cursor: 'pointer',
                border: selectedImage === img.image ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 1,
                overflow: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => setSelectedImage(img.image)}
            >
              <img
                src={img.image}
                alt={`${productName} - ${index + 1}`}
                loading="lazy"
                style={{ 
                  height: '100%',
                  width: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'white'
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
}

export default ProductGallery;