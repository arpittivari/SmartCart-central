import apiClient from './apiClient';

// --- Interfaces for Type Safety ---

// ... (keep the import apiClient line)

// This is the full Cart object we GET from the server
export interface Cart {
  _id: string;
  cartId: string;
  macAddress: string;
  mqttUsername: string;
  mqttPassword: string;
  firmwareVersion?: string;
  status: string;
  battery: number;
  lastSeen: string;
  // This is the critical new field for the Live View
  currentItems?: { 
    product_id: string;
    product_name: string;
    price: number 
  }[];
}
// This is the data we POST to the server to create a new cart
// It should only contain the fields we are actually sending.
export interface RegisterCartData {
  cartId: string;
  macAddress: string;
  firmwareVersion?: string;
}

// ... (The rest of the file: getCarts, registerCart, deleteCart functions are all correct)
// --- API Functions ---

/**
 * Fetches all carts associated with the authenticated admin.
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves to an array of Cart objects.
 */
export const getCarts = async (token: string): Promise<Cart[]> => {
  const response = await apiClient.get('/carts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Registers a new cart for the authenticated admin.
 * @param cartData The data for the new cart (cartId, macAddress).
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves to the newly created Cart object.
 */
export const registerCart = async (cartData: RegisterCartData, token: string): Promise<Cart> => {
  const response = await apiClient.post('/carts', cartData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
/**
 * Deletes a specific cart by its unique ID.
 * @param id The MongoDB _id of the cart to be deleted.
 * @param token The admin's authentication JWT.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteCart = async (id: string, token: string): Promise<void> => {
  await apiClient.delete(`/carts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};