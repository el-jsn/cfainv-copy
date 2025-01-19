import React, { useState, useCallback, memo, useEffect } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Menu,
  X,
  Upload,
  Hammer,
  CalendarClock,
  BrainCog,
  Calendar,
  LucideFileQuestion
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
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const drawerWidth = 280; // Increased drawer width for more breathing space

const NavItem = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.2, 2), // Increased padding for touch targets
  marginBottom: theme.spacing(0.5),
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shortest,
  }),
  fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',
  '&:hover': {
    backgroundColor: theme.palette.action.hover, // Keep the standard hover
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  ...(active && {
    backgroundColor: theme.palette.primary.light,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
    '& .MuiListItemText-primary': {
      fontWeight: theme.typography.fontWeightMedium,
    },
  }),
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
  }),
}));


const NavLink = memo(({ to, icon, label, onClick, active }) => {
  return (
    <NavItem component={RouterLink} to={to} onClick={onClick} active={active}>
      <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif'
        }}
      />
    </NavItem>
  );
});

const Sidebar = memo(({ open, onClose, quickAccessLinks, location }) => (
  <Drawer
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
    }}
    sx={{
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white
        backdropFilter: 'blur(5px)', // Add a light blur effect
        borderRadius: 2, // Rounded corners for the sidebar
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
      },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
      <IconButton onClick={onClose} aria-label="close menu">
        <X />
      </IconButton>
    </Box>
    <Box sx={{ overflow: 'auto', px: 1, py: 1 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ px: 1, mt: 1, mb: 0.5, fontWeight: 'bold', fontFamily: 'SF Pro Display, Helvetica Neue, sans-serif' }}>
        Quick Access
      </Typography>
      <Divider sx={{ my: 0.5 }} />
      <List>
        {quickAccessLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            icon={link.icon}
            label={link.label}
            onClick={onClose}
            active={location.pathname === link.to}
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
    backgroundColor: '#f5f5f5', // Light gray background for main content
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
    fontFamily: 'SF Pro Text, Helvetica Neue, sans-serif',

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
      handleDrawerToggle();
    }
    navigate(to);
  }, [isMobile, handleDrawerToggle, navigate]);


  const quickAccessLinks = React.useMemo(() => {
    const links = [
      { to: "/", icon: <Home />, label: "Home" },
      { to: "/thawing-cabinet", icon: <Calendar />, label: "Thawing Cabinet" },
      { to: "/how-to", icon: <LucideFileQuestion />, label: "How to Use" }

    ];

    if (user && user.isAdmin) {
      links.splice(1, 0,
        { to: "/update-upt", icon: <Upload />, label: "Update UPT" },
        { to: "/data/message/all", icon: <Hammer />, label: "Adjust Allocations" },
        { to: "/closure/plans", icon: <CalendarClock />, label: "Store Closures" },
        { to: "/instructions", icon: <BrainCog />, label: "Instructions Board" }
      );
    }

    return links;
  }, [user]);


  const shouldRenderMenu = location.pathname !== "/thawing-cabinet" && location.pathname !== "/login";

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
              zIndex: 1201,
              display: { sm: 'none' },
              bgcolor: 'background.paper',
              borderRadius: '50%',
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
            <Sidebar
              open={mobileOpen}
              onClose={handleDrawerToggle}
              quickAccessLinks={quickAccessLinks}
              location={location}
            />
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
              open
            >
              <Box sx={{ overflow: 'auto', px: 1, py: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ px: 1, mt: 1, mb: 0.5, fontWeight: 'bold', fontFamily: 'SF Pro Display, Helvetica Neue, sans-serif' }}>
                  Quick Access
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                <List>
                  {quickAccessLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                      onClick={() => handleNavigation(link.to)}
                      active={location.pathname === link.to}
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