import React, { useState, useEffect, useCallback } from 'react';
import { 
    Typography, 
    Box, 
    CircularProgress, 
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Paper,
    Snackbar,
    IconButton
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMallProducts, uploadProducts, deleteProduct, Product, Category } from '../api/productApi';

// A helper component for our notification popups
const SnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProductsPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' });

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMallProducts();
            setCategories(data.categories);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load product data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

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
            setSnackbar({ open: true, message: response.message, severity: 'success' });
            fetchProducts(); // Refresh list after upload
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Error processing file.';
            setSnackbar({ open: true, message: `Upload failed: ${errorMessage}`, severity: 'error' });
        }
    };
    
    const handleDelete = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const response = await deleteProduct(productId);
            setSnackbar({ open: true, message: response.message, severity: 'success' });
            fetchProducts();
        } catch (err: any) {
            setSnackbar({ open: true, message: 'Deletion failed.', severity: 'error' });
        }
    }

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Product Inventory
            </Typography>

            {/* --- 👇 THIS IS THE NEW UPLOAD SECTION 👇 --- */}
            <Paper sx={{ p: 2, mb: 4 }}>
                 <Typography variant="h6" gutterBottom>Manage Products</Typography>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                    Upload Products (JSON)
                    <input type="file" hidden accept=".json" onChange={handleFileUpload} />
                </Button>
                 <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                    Upload a JSON file with an array of products. Each product should have id, name, category, and price.
                </Typography>
            </Paper>
            {/* --- 👆 END OF UPLOAD SECTION 👆 --- */}

            {categories.length === 0 ? (
                <Alert severity="info">No products found for this mall. Use the button above to upload a product list.</Alert>
            ) : (
                categories.map((category: Category) => (
                    <Accordion key={category.name} defaultExpanded sx={{ backgroundImage: 'none', my: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{category.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List disablePadding>
                                {category.products.map((product: Product, index: number) => (
                                    <React.Fragment key={product._id}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(product._id)}>
                                                    <DeleteIcon color="secondary" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText 
                                                primary={product.name} 
                                                secondary={`ID: ${product.id}`}
                                            />
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                ₹{product.price.toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                        {index < category.products.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
            
            {/* This is the notification component */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <SnackbarAlert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
                    {snackbar.message}
                </SnackbarAlert>
            </Snackbar>
        </Box>
    );
};

export default ProductsPage;