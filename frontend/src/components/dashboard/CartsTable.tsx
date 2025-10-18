import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, Tooltip, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Cart, deleteCart } from '../../api/cartApi';
import { useAuth } from '../../contexts/AuthContext';

// This is the helper component to render the colored status dot
const StatusIndicator = ({ status }: { status: string }) => {
  const colorMap: { [key: string]: string } = {
    Idle: 'warning.main',
    Shopping: 'success.main',
    Payment: 'info.main',
    Offline: 'error.main',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        component="span"
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: colorMap[status] || 'grey.500',
          mr: 1,
          boxShadow: `0 0 8px ${colorMap[status] || 'grey.500'}`,
        }}
      />
      {status}
    </Box>
  );
};

interface Props {
  carts: Cart[];
  onCartDeleted: () => void;
  // This is the fix: The function now correctly expects to receive the full Cart object.
  onViewLive: (cart: Cart) => void;
}

const CartsTable = ({ carts, onCartDeleted, onViewLive }: Props) => {
  const { user } = useAuth();
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);

  const handleDelete = async (id: string) => {
    if (!user?.token || !window.confirm('Are you sure you want to permanently delete this cart?')) {
      return;
    }
    try {
      await deleteCart(id, user.token);
      onCartDeleted();
    } catch (error) {
      console.error("Failed to delete cart:", error);
      alert('Failed to delete cart.');
    }
  };

  const openCredentialsModal = (cart: Cart) => setSelectedCart(cart);
  const closeCredentialsModal = () => setSelectedCart(null);

  if (carts.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No carts have been registered for this mall yet.</Typography>
      </Paper>
    );
  }

  // THE BUG IS REMOVED: The incorrect local "onViewLive" function is gone.

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Cart ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Battery</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell align="center">Live View</TableCell>
              <TableCell align="center">Credentials</TableCell>
              <TableCell align="right">Actions</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {carts.map((cart) => (
              <TableRow key={cart._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{cart.cartId}</TableCell>
                <TableCell>
                  <StatusIndicator status={cart.status} />
                </TableCell>
                <TableCell>{cart.battery}%</TableCell>
                <TableCell>{new Date(cart.lastSeen).toLocaleString()}</TableCell>
                 <TableCell align="center">
                <Tooltip title="Live View">
                  <IconButton onClick={() => onViewLive(cart)} color="primary">
                    <LiveTvIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => openCredentialsModal(cart)}
                  >
                    View
                  </Button>
                </TableCell>
                 <TableCell align="right">
                <Tooltip title="Delete Cart">
                  <IconButton onClick={() => handleDelete(cart._id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
              
          </TableBody>
        </Table>
      </TableContainer>

      {/* Credentials Dialog Popup */}
      <Dialog open={!!selectedCart} onClose={closeCredentialsModal} fullWidth maxWidth="sm">
        <DialogTitle>MQTT Credentials for <strong>{selectedCart?.cartId}</strong></DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Program these unique credentials into your physical ESP device.
          </DialogContentText>
          <Typography variant="overline">Username</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, userSelect: 'all' }}>
            <code>{selectedCart?.mqttUsername}</code>
          </Paper>
          <Typography variant="overline" sx={{ mt: 2 }}>Password</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, userSelect: 'all' }}>
            <code>{selectedCart?.mqttPassword}</code>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCredentialsModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CartsTable;