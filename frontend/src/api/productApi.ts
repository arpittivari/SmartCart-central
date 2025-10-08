import apiClient from './apiClient';

export interface Product {
    _id: string;
    id: string;   
    name: string;
    category: string;
    price: number;
}

export interface Category {
    name: string;
    products: Product[];
}

interface UploadResponse {
    message: string;
    insertedCount: number;
    failedCount: number;
    errors?: string[];
}

// Correct helper function to get the token from localStorage
const getToken = (): string | null => {
  const storedUser = localStorage.getItem('smartcartUser');
  if (storedUser) {
      return JSON.parse(storedUser).token;
  }
  return null;
}

// --- API Calls ---

export const getMallProducts = async (): Promise<{ categories: Category[] }> => {
    const token = getToken(); // Use the helper function
    if (!token) throw new Error('No authentication token found.');
    const response = await apiClient.get('/products', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const uploadProducts = async (productsToUpload: Partial<Product>[]): Promise<UploadResponse> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');
    
    const response = await apiClient.post(`/products/upload`, { products: productsToUpload }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteProduct = async (productId: string): Promise<{ message: string }> => {
    const token = getToken();
    if (!token) throw new Error('No authentication token found.');

    const response = await apiClient.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};