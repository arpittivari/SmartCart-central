import React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import { 
    Box, AppBar as MuiAppBar, Toolbar, Typography, Drawer as MuiDrawer, List, 
    ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, 
    CssBaseline, Avatar, Menu, MenuItem, Badge
} from '@mui/material';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

// --- Styled components for smooth animations (No changes needed here) ---
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Cart Management', icon: <ShoppingCartIcon />, path: '/carts' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Products', icon: <InventoryIcon />, path: '/products' },
];

// --- The Main Component ---
const AppLayout = () => {
  const [open, setOpen] = React.useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for the user profile menu
  const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // State for the notification menu
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = React.useState(0); // Example count

  // Handlers for the profile menu
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(profileAnchorEl ? null : event.currentTarget);
  };
  const handleProfileClose = () => setProfileAnchorEl(null);
  
  // Handlers for the notification menu
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    setNotificationCount(0); // Clear badge on open
  };
  const handleNotificationClose = () => setNotificationAnchorEl(null);
  
  const handleLogout = () => {
    logout();
    handleProfileClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ marginRight: 5, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SmartCart Central
          </Typography>
          
          {/* Notification Icon */}
          <IconButton size="large" color="inherit" onClick={handleNotificationClick} sx={{ mr: 1 }}>
            <Badge badgeContent={notificationCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile Avatar */}
          <div>
            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
              <Avatar alt={user?.mallId} src={`http://localhost:5000${user?.imageUrl}?${new Date().getTime()}`} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* --- Menus --- */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      >
        <MenuItem disabled>No new notifications</MenuItem>
      </Menu>
      
      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
        sx={{ mt: '45px' }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileClose(); }}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" color="secondary" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <List>
            {navItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }} component={RouterLink} to={item.path}>
                <ListItemButton selected={location.pathname === item.path} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}>
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
            <List>
                <Divider />
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton onClick={handleLogout} sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)'} }}>
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'secondary.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, color: 'secondary.main' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;