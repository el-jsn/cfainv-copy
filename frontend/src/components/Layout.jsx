import React, { useState, useCallback, memo, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Menu,
  X,
  Upload, // For Update UPT
  Hammer, // For Adjust Allocations
  CalendarClock, // For Store Closures
  HelpCircle, // For Allocations Instructions
  Calendar, // For Thawing Cabinet
} from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Divider, // Import Divider
} from "@mui/material";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;

const NavItem = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius, // Rounded corners for list items
  marginBottom: theme.spacing(0.5), // Add a little spacing between items
  '&:hover': {
    backgroundColor: theme.palette.action.hover, // Keep the standard hover
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main, // Change icon color on hover
    },
  },
  ...(active && {
    backgroundColor: theme.palette.primary.light, // Highlight for active item
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText, // Adjust active icon color
    },
    '& .MuiListItemText-primary': {
      fontWeight: theme.typography.fontWeightMedium, // Make active text bolder
    },
  }),
  transition: theme.transitions.create('background-color', { // Smooth transition
    duration: theme.transitions.duration.shortest,
  }),
}));

const NavLink = memo(({ to, icon, label, onClick, active }) => {
  return (
    <NavItem component={RouterLink} to={to} onClick={onClick} active={active}>
      <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon> {/* Adjust icon spacing */}
      <ListItemText primary={label} />
    </NavItem>
  );
});

const Sidebar = memo(({ open, onClose, quickAccessLinks, location }) => (
  <Drawer
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#f8f9fa', // Subtle background color
        borderRadius: 2, // Rounded corners for the sidebar
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
      <IconButton onClick={onClose} aria-label="close menu">
        <X />
      </IconButton>
    </Box>
    <Box sx={{ overflow: 'auto', px: 1, py: 1 }}> {/* Add padding to the content */}
      <Typography variant="subtitle1" gutterBottom sx={{ px: 1, mt: 1, fontWeight: 'bold' }}>
        Quick Access
      </Typography>
      <Divider sx={{ my: 0.5 }} /> {/* Subtle divider */}
      <List>
        {quickAccessLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            onClick={onClose} // Pass onClose here to close on navigation
            active={location.pathname === link.to} // Check if the route is active
          />
        ))}
      </List>
    </Box>
  </Drawer>
));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

const Layout = memo(({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prevState => !prevState);
  }, []);

  const handleNavigation = useCallback((to) => {
    if (isMobile) {
      handleDrawerToggle(); // Close the drawer only on mobile
    }
    navigate(to);
  }, [isMobile, handleDrawerToggle, navigate]);

  const quickAccessLinks = React.useMemo(() => {
    const links = [
      { to: "/", icon: <Home />, label: "Home" },
      { to: "/thawing-cabinet", icon: <Calendar />, label: "Thawing Cabinet" },
    ];

    if (user && user.isAdmin) {
      links.splice(1, 0,
        { to: "/update-upt", icon: <Upload />, label: "Update UPT" },
        { to: "/data/message/all", icon: <Hammer />, label: "Adjust Allocations" },
        { to: "/closure/plans", icon: <CalendarClock />, label: "Store Closures" },
        { to: "/instructions", icon: <HelpCircle />, label: "Allocations Instructions" }
      ); // Insert after Home
    }

    return links;
  }, [user]); // Depend on user to re-evaluate when user changes

  const shouldRenderMenu = location.pathname !== "/thawing-cabinet" && location.pathname !== "/login";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex' }}>
      {shouldRenderMenu && (
        <>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1201, // Ensure it's above the drawer
              display: { sm: 'none' }, // Hide on larger screens where the permanent drawer is visible
              bgcolor: 'background.paper',
              borderRadius: '50%', // Make the menu button round
              boxShadow: 1,
              '&:hover': {
                boxShadow: 2,
              },
            }}
            aria-label="open drawer"
          >
            <Menu />
          </IconButton>
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
            <Sidebar
              open={mobileOpen}
              onClose={handleDrawerToggle}
              quickAccessLinks={quickAccessLinks}
              location={location} // Pass the location to the Sidebar
            />
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open
            >
              <Box sx={{ overflow: 'auto', px: 1, py: 1 }}> {/* Add padding to the content */}
                <Typography variant="subtitle1" gutterBottom sx={{ px: 1, mt: 1, fontWeight: 'bold' }}>
                  Quick Access
                </Typography>
                <Divider sx={{ my: 0.5 }} /> {/* Subtle divider */}
                <List>
                  {quickAccessLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                      onClick={() => handleNavigation(link.to)} // Close and navigate conditionally
                      active={location.pathname === link.to} // Check if the route is active
                    />
                  ))}
                </List>
              </Box>
            </Drawer>
          </Box>
        </>
      )}
      <Main open={shouldRenderMenu ? mobileOpen : false}>
        {children}
      </Main>
    </Box>
  );
});

export default Layout;