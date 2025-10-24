import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Box, Alert, CircularProgress, Paper, Button, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Tooltip, Chip
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { getMallProducts, uploadProducts, deleteProduct, Product, Category } from '../api/productApi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { alpha, useTheme } from '@mui/material/styles';

const AlertSnackbar = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Helper component to show stock status
const StockStatus = ({ quantity }: { quantity: number }) => {
    if (quantity > 50) {
        return <Chip label="In Stock" color="success" variant="outlined" size="small" />;
    }
    if (quantity > 0) {
        return <Chip label="Low Stock" color="warning" variant="outlined" size="small" />;
    }
    return <Chip label="Out of Stock" color="error" variant="filled" size="small" />;
};

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const theme = useTheme();
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchProducts = useCallback(async () => {
        if (!user?.token) return;
        setIsLoading(true);
        try {
            const data = await getMallProducts();
            // Flatten the categories into a single, sortable product list
            const allProducts = data.categories.flatMap(category => 
                category.products.map(product => ({ ...product, category: category.name }))
            );
            setProducts(allProducts);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load product data.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const fileContent = await file.text();
            const productsToUpload: Partial<Product>[] = JSON.parse(fileContent);
            const response = await uploadProducts(productsToUpload);
            showNotification(response.message, 'success');
            fetchProducts();
        } catch (err: any) {
            showNotification(`Upload failed: ${err.message || 'Error processing file.'}`, 'error');
        }
    };

    const handleDelete = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await deleteProduct(productId);
            showNotification(response.message, 'success');
            fetchProducts();
        } catch (err: any) {
            showNotification('Deletion failed.', 'error');
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Product Inventory
            </Typography>

            <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Manage Inventory</Typography>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                    Upload New Stock (JSON)
                    <input type="file" hidden accept=".json" onChange={handleFileUpload} />
                </Button>
                {/* Add a link to the new sample file */}
                <Button variant="outlined" sx={{ ml: 2 }} href="/sample-products-v2.json" download>
                    Download Template
                </Button>
            </Paper>

            {isLoading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader aria-label="product inventory table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Weight/Size</TableCell>
                                    <TableCell align="center">Quantity Left</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((product) => {
                                        const isLowStock = (product.quantity || 0) <= 10;
                                        return (
                                            <TableRow 
                                                hover 
                                                key={product._id}
                                                // This is the "Reorder" highlight
                                                sx={{ 
                                                    backgroundColor: isLowStock ? alpha(theme.palette.error.main, 0.1) : 'inherit'
                                                }}
                                            >
                                                <TableCell>{product.productId}</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{product.name}</TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                                <TableCell>{product.weight || 'N/A'}</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                                    {product.quantity}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <StockStatus quantity={product.quantity || 0} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Delete Product">
                                                        <IconButton onClick={() => handleDelete(product._id)} color="secondary">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={products.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            )}

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <AlertSnackbar onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
                    {snackbar.message}
                </AlertSnackbar>
            </Snackbar>
        </Box>
    );
};

export default ProductsPage;