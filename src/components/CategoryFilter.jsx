import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';

function CategoryFilter({ categories = [], selectedCategory, selectedSubCategory, onSelectCategory }) {
  const navigate = useNavigate();

  console.log('CategoryFilter Props:', { categories, selectedCategory, selectedSubCategory });

  if (!categories || categories.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Kategoriler yükleniyor...
        </Typography>
      </Box>
    );
  }

  const handleCategoryClick = (category) => {
    console.log('Kategori tıklandı:', category);
    onSelectCategory(category.id);
    navigate(`/kategori/${category.slug}`);
  };

  const handleSubCategoryClick = (category, subCategory, event) => {
    event.stopPropagation();
    console.log('Alt kategori tıklandı:', category, subCategory);
    onSelectCategory(category.id, subCategory.id);
    navigate(`/kategori/${category.slug}/${subCategory.slug}`);
  };

  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      {categories.map((category) => (
        <Accordion 
          key={category.id}
          expanded={selectedCategory === category.id}
          onChange={() => handleCategoryClick(category)}
          sx={{
            '&.Mui-expanded': {
              margin: 0,
            },
            '& .MuiAccordionSummary-root': {
              minHeight: 48,
            }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: selectedCategory === category.id ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <Typography>{category.name}</Typography>
          </AccordionSummary>
          
          {category.subcategories && category.subcategories.length > 0 && (
            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {category.subcategories.map((subCategory) => (
                  <ListItem 
                    key={subCategory.id} 
                    disablePadding
                    selected={selectedSubCategory === subCategory.id}
                  >
                    <ListItemButton 
                      onClick={(event) => handleSubCategoryClick(category, subCategory, event)}
                      sx={{
                        pl: 4,
                        backgroundColor: selectedSubCategory === subCategory.id 
                          ? 'action.selected' 
                          : 'inherit'
                      }}
                    >
                      <ListItemText primary={subCategory.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          )}
        </Accordion>
      ))}
    </Box>
  );
}

export default CategoryFilter;