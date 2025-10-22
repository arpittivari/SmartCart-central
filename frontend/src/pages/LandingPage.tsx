import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, AppBar, Toolbar, Link, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';
import InsightsIcon from '@mui/icons-material/Insights';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { keyframes } from '@mui/system';

// --- Animations for a futuristic feel ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  // Helper component for feature cards
  const FeatureCard = ({ icon, title, description }: { icon: React.ReactElement, title: string, description: string }) => (
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: `${fadeIn} 1s ease-out`,
        // We remove the hover effect for a static, professional look
      }}
    >
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {React.cloneElement(icon, { sx: { fontSize: 48 } })}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{description}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ color: 'text.primary', backgroundColor: 'background.default' }}>
      
      {/* --- Navigation Bar --- */}
      <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              SmartCart Central
            </Typography>
            <Button variant="outlined" color="primary" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
              Admin Sign In
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Hero Section --- */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '90vh',
        textAlign: 'center',
        p: 4,
        // Placeholder for the cinematic video/image you will generate
        // background: 'url(YOUR_CINEMATIC_VIDEO_URL) no-repeat center center',
        // backgroundSize: 'cover'
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2, animation: `${fadeIn} 0.5s ease-out` }}>
            The Future of Retail is Autonomous.
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, animation: `${fadeIn} 0.8s ease-out` }}>
            Our end-to-end platform leverages AI and real-time data to create a seamless, checkout-free shopping experience.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/register')} sx={{ animation: `${fadeIn} 1s ease-out` }}>
            Get Started Today
          </Button>
        </Container>
      </Box>

      {/* --- Features Section --- */}
      <Box sx={{ py: 10, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 6 }}>
            A Fully Integrated Ecosystem
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <FeatureCard 
                icon={<SmartToyIcon />}
                title="AI-Powered Recognition"
                description="On-cart AI identifies products as they are added, combined with weight sensors for 99.9% accuracy."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureCard 
                icon={<InsightsIcon />}
                title="Real-Time Fleet Management"
                description="Monitor your entire fleet's status, battery, and live shopping cart contents from a single, secure dashboard."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureCard 
                icon={<DnsIcon />}
                title="Multi-Tenant Architecture"
                description="Securely manage multiple mall locations, each with its own isolated data, products, and analytics."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FeatureCard 
                icon={<SecurityIcon />}
                title="End-to-End Security"
                description="Our 'claim-based' provisioning and unique credentials for every cart ensure your data is always protected."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* --- Security Section (To build trust) --- */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                Security is Not an Option.
                <br/>It's the Foundation.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                We built our platform to be secure from the ground up. We don't just protect your data; we give you the tools to control it.
              </Typography>
              <Box>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} /> Per-Device Unique Credentials
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} /> Secure Broker ACLs & Data Isolation
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} /> Encrypted Admin & Database Handshake
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              {/* Placeholder for your generated security image */}
              <Box 
                component="img" 
                src="/images/imgsheild.png" 
                sx={{ width: '100%', maxWidth: '300px', borderRadius: '50%' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- Professional Footer --- */}
      <Box component="footer" sx={{ py: 8, backgroundColor: 'background.paper', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Column 1: Brand */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>SmartCart Central</Typography>
              <Typography color="text.secondary">
                Empowering the future of autonomous retail technology.
              </Typography>
            </Grid>
            {/* Column 2: Platform */}
            <Grid item xs={6} md={2}>
              <Typography variant="overline" sx={{ fontWeight: 'bold' }}>Platform</Typography>
              <Link href="#" display="block" color="text.secondary" underline="hover">SmartCarts</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Analytics</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Provisioning</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Security</Link>
            </Grid>
            {/* Column 3: Company */}
            <Grid item xs={6} md={2}>
              <Typography variant="overline" sx={{ fontWeight: 'bold' }}>Company</Typography>
              <Link href="#" display="block" color="text.secondary" underline="hover">About Us</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Careers</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Contact Us</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Partners</Link>
            </Grid>
            {/* Column 4: Legal */}
            <Grid item xs={6} md={2}>
              <Typography variant="overline" sx={{ fontWeight: 'bold' }}>Legal</Typography>
              <Link href="#" display="block" color="text.secondary" underline="hover">Privacy Policy</Link>
              <Link href="#" display="block" color="text.secondary" underline="hover">Terms of Service</Link>
            </Grid>
            {/* Column 5: Sign Up */}
            <Grid item xs={6} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Grid>
          </Grid>
        <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} SmartCart Central. A project by Arpit Tiwari. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;