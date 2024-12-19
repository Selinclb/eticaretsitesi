import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import ProductSlider from '../components/ProductSlider';
import { categoryService, productService } from '../services/api';
import axiosInstance from '../services/axiosConfig';

function Home({ setNotification }) {
  const { categorySlug, subCategorySlug } = useParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sliderItems, setSliderItems] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  // Öne çıkan ürünleri getir
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getAll({ 
          is_featured: true,
          limit: 5 
        });
        const slides = response.data.map(product => ({
          title: product.name,
          description: product.description?.substring(0, 100) + '...',
          image: product.primary_image_url,
          price: product.is_on_sale ? product.discounted_price : product.price,
          link: `/urun/${product.slug}`,
          buttonText: 'Ürünü İncele'
        }));
        setFeaturedProducts(slides);
      } catch (error) {
        console.error('Öne çıkan ürünler yüklenirken hata:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoryService.getAll();
        console.log('Gelen kategoriler:', data);
        setCategories(data);
        
        if (categorySlug) {
          const category = data.find(cat => cat.slug === categorySlug);
          if (category) {
            console.log('Seçilen kategori:', category); 
            setSelectedCategory(category.id);
            
            if (subCategorySlug && category.subcategories) {
              const subCategory = category.subcategories.find(
                sub => sub.slug === subCategorySlug
              );
              if (subCategory) {
                setSelectedSubCategory(subCategory.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Kategori hatası:', error);
        setError('Kategoriler yüklenirken hata oluştu');
      }
    };

    fetchCategories();
  }, [categorySlug, subCategorySlug]);

  // Ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        
        if (searchQuery) {
          // Arama parametresi varsa, arama endpoint'ini kullan
          response = await productService.search(searchQuery);
        } else if (selectedCategory && selectedSubCategory) {
          const category = categories.find(c => c.id === selectedCategory);
          const subcategory = category?.subcategories?.find(
            s => s.id === selectedSubCategory
          );
          response = await productService.getBySubCategorySlug(
            category?.slug,
            subcategory?.slug
          );
        } else if (selectedCategory) {
          const category = categories.find(c => c.id === selectedCategory);
          response = await productService.getByCategorySlug(category?.slug);
        } else {
          response = await productService.getAll();
        }
        
        setProducts(response.data);
      } catch (error) {
        console.error('Ürün hatası:', error);
        setError('Ürünler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubCategory, categories, searchQuery]);

  // Slider verilerini getir
  useEffect(() => {
    const fetchSliderItems = async () => {
      try {
        const response = await axiosInstance.get('/sliders/');
        console.log('Slider response:', response.data);
        setSliderItems(response.data);
      } catch (error) {
        console.error('Slider verileri yüklenirken hata:', error);
      }
    };

    fetchSliderItems();
  }, []);

  // Alt kategorileri hazırla
  useEffect(() => {
    if (categories.length > 0) {
      const subCats = categories.flatMap(cat => 
        cat.subcategories.map(sub => ({
          ...sub,
          category_slug: cat.slug
        }))
      );
      setAllSubCategories(subCats);
    }
  }, [categories]);

  // Kategori seçimi
  const handleCategorySelect = (categoryId, subCategoryId = null) => {
    console.log('Kategori seçildi:', categoryId, subCategoryId); // Kontrol için log
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
  };

  // Arama filtrelemesi
  const filteredProducts = products;

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ProductSlider slides={sliderItems} />

      {/* Ana içerik */}
      <Grid container spacing={3}>
        {!searchQuery && (
          <Grid item xs={12} md={3}>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSelectCategory={handleCategorySelect}
            />
          </Grid>
        )}
        
        <Grid item xs={12} md={searchQuery ? 12 : 9}>
          {searchQuery && (
            <Typography variant="h6" sx={{ mb: 3 }}>
              "{searchQuery}" için arama sonuçları
            </Typography>
          )}

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px' 
            }}>
              <CircularProgress />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 4,
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 1
            }}>
              <Typography variant="h6">
                Ürün bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Farklı bir kategori seçmeyi veya arama kriterlerini değiştirmeyi deneyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard 
                    product={product} 
                    setNotification={setNotification}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;