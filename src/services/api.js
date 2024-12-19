import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const categoryService = {
  getAll: () => axiosInstance.get('/categories/'),
  getBySlug: (slug) => axiosInstance.get(`/categories/${slug}/`)
};

export const productService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await axiosInstance.get(`/products/${queryString ? `?${queryString}` : ''}`);
  },
  getBySlug: (slug) => axiosInstance.get(`/products/${slug}/`),
  getByCategorySlug: (categorySlug, params = {}) => {
    params.category = categorySlug;
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/products/?${queryString}`);
  },
  getBySubCategorySlug: (categorySlug, subCategorySlug, params = {}) => {
    params.subcategory = subCategorySlug;
    const queryString = new URLSearchParams(params).toString();
    return axiosInstance.get(`/products/?${queryString}`);
  },
  getRelatedProducts: (categoryId, productId) => 
    axiosInstance.get(`/products/?category=${categoryId}&exclude=${productId}&limit=4`),
  search: async (query) => {
    return await axiosInstance.get(`/products/?search=${encodeURIComponent(query)}`);
  },
};

// Hata yakalama interceptor'ı
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;