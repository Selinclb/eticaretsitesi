import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusColors = {
  'pending': 'warning',
  'confirmed': 'info',
  'shipped': 'primary',
  'delivered': 'success',
  'cancelled': 'error'
};

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - her istekte token ekleyecej
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/orders/');
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          setOrders(response.data.results);
        } else {
          throw new Error('Geçersiz veri formatı');
        }
      } catch (err) {
        setError('Siparişler yüklenirken bir hata oluştu.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Siparişlerim
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Henüz hiç siparişiniz bulunmuyor.</Typography>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Alışverişe Başla
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sipariş No</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>
                  {parseFloat(order.total_amount).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} TL
                </TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    {order.formatted_total_amount} TL
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status_display}
                      color={statusColors[order.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/siparisler/${order.id}`}
                      size="small"
                      variant="outlined"
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default Orders;