import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Icônes Material-UI (gardez les mêmes imports)
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import GroupIcon from '@mui/icons-material/Group';
import MovingIcon from '@mui/icons-material/Moving';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Import du logo
import logo from '../assets/logo.svg';

import AxiosInstance from './AxiosInstance';

const drawerWidth = 240;

// Définition des couleurs de l'entreprise
const COMPANY_COLORS = {
  darkCyan: '#003C3F',
  vividOrange: '#DA4A0E',
  black: '#000000',
  white: '#FFFFFF',
  lightCyan: '#E6F3F4',
  lightOrange: '#FFE8DE'
};

export default function Navbar(props) {
  const { content, mode, toggleColorMode } = props;
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  // State pour le menu utilisateur
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInitial, setUserInitial] = useState('');
  const [stocksFaibles, setStocksFaibles] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [ventesImpayeesCount, setVentesImpayeesCount] = useState(0);
  const [ventesRetardCount, setVentesRetardCount] = useState(0);

  // Récupérer les données utilisateur depuis localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('User');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getUserData();
  const userRole = user?.role || '';
  const userEmail = user?.email || '';
  const userName = user?.username || userEmail.split('@')[0];

  // Générer l'initiale de l'utilisateur
  useEffect(() => {
    if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
    }
  }, [userName]);

  // Charger les notifications (stocks faibles et ventes impayées)
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'vendeur') {
      fetchStocksFaibles();
      fetchVentesImpayeesCount();
      fetchVentesRetardCount();
    }
  }, [userRole]);

  const fetchStocksFaibles = async () => {
    try {
      const response = await AxiosInstance.get('/stocks-entrepot/?low_stock=true');
      const stocks = response.data || [];
      setStocksFaibles(stocks);
    } catch (error) {
      console.error('Erreur lors du chargement des stocks faibles:', error);
    }
  };

  const fetchVentesImpayeesCount = async () => {
    try {
      const response = await AxiosInstance.get('/ventes/ventes_impayees/');
      const ventes = response.data || [];
      setVentesImpayeesCount(ventes.length);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes impayées:', error);
    }
  };

  const fetchVentesRetardCount = async () => {
    try {
      const response = await AxiosInstance.get('/ventes/ventes_en_retard/');
      const ventes = response.data || [];
      setVentesRetardCount(ventes.length);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes en retard:', error);
    }
  };

  // Mettre à jour le compteur total de notifications
  useEffect(() => {
    const total = stocksFaibles.length + ventesImpayeesCount + ventesRetardCount;
    setNotificationCount(total);
  }, [stocksFaibles.length, ventesImpayeesCount, ventesRetardCount]);

  const isAdmin = () => userRole === 'admin';
  const isVendeur = () => userRole === 'vendeur';

  // Gestion du menu utilisateur
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClick = () => {
    navigate('/stocks-entrepot?low_stock=true');
  };

  const handleVentesImpayeesClick = () => {
    navigate('/ventes?statut_paiement=non_paye');
  };

  const handleVentesRetardClick = () => {
    navigate('/ventes?en_retard=true');
  };

  const logoutUser = () => {
    console.log('🚪 Déconnexion de l\'utilisateur...');
    handleMenuClose();
    
    AxiosInstance.post(`logoutall/`, {})
      .then(() => {
        console.log('✅ Déconnexion réussie');
        localStorage.removeItem('Token');
        localStorage.removeItem('User');
        navigate('/');
      })
      .catch((error) => {
        console.error('❌ Erreur de déconnexion:', error);
        localStorage.removeItem('Token');
        localStorage.removeItem('User');
        navigate('/');
      });
  };

  // Menu items (gardez les mêmes)
  const menuItems = [
    // Tableau de bord - Visible pour tous
    {
      id: 1,
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      visible: true,
      roles: ['admin', 'vendeur']
    },
    
    // Point de vente - Admin + Vendeur
    {
      id: 2,
      text: 'Point de Vente',
      icon: <ShoppingCartIcon />,
      path: '/point-de-vente',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur']
    },
    
    // Ventes - Admin + Vendeur
    {
      id: 3,
      text: 'Ventes',
      icon: <PointOfSaleIcon />,
      path: '/ventes',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur'],
      badge: ventesImpayeesCount > 0 || ventesRetardCount > 0
    },
    
    // Clients - Admin + Vendeur
    {
      id: 4,
      text: 'Clients',
      icon: <PeopleIcon />,
      path: '/clients',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur']
    },
    
    // Historique Client - Admin + Vendeur
    {
      id: 5,
      text: 'Historique Client',
      icon: <ReceiptLongIcon />,
      path: '/historique-client',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur']
    },
    
    // Produits - Admin seulement
    {
      id: 6,
      text: 'Produits',
      icon: <InventoryIcon />,
      path: '/produits',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Catégories - Admin seulement
    {
      id: 7,
      text: 'Catégories',
      icon: <CategoryIcon />,
      path: '/categories',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Fournisseurs - Admin seulement
    {
      id: 8,
      text: 'Fournisseurs',
      icon: <BusinessIcon />,
      path: '/fournisseurs',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // ENTREPÔTS - Admin seulement
    {
      id: 9,
      text: 'Entrepôts',
      icon: <WarehouseIcon />,
      path: '/entrepots',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Stocks par entrepôt - Admin + Vendeur
    {
      id: 10,
      text: 'Stocks',
      icon: <InventoryIcon />,
      path: '/stock-entrepot',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur'],
      badge: stocksFaibles.length > 0
    },
    
    // Mouvements de stock - Admin seulement
    {
      id: 11,
      text: 'Mouvements Stock',
      icon: <MovingIcon />,
      path: '/mouvements-stock',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // TRANSFERTS - Admin seulement
    {
      id: 12,
      text: 'Transferts',
      icon: <SwapHorizIcon />,
      path: '/transferts',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Rapports - Admin seulement
    {
      id: 13,
      text: 'Rapports',
      icon: <AssessmentIcon />,
      path: '/rapports',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Rapports Paiements - Admin seulement
    {
      id: 14,
      text: 'Rapports Paiements',
      icon: <PaidIcon />,
      path: '/rapport-paiements',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Statistiques - Admin + Vendeur
    {
      id: 15,
      text: 'Statistiques',
      icon: <TrendingUpIcon />,
      path: '/statistiques',
      visible: isAdmin() || isVendeur(),
      roles: ['admin', 'vendeur']
    },
    
    // Journal d'audit - Admin seulement
    {
      id: 16,
      text: 'Journal Audit',
      icon: <HistoryIcon />,
      path: '/audit',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Utilisateurs - Admin seulement
    {
      id: 17,
      text: 'Utilisateurs',
      icon: <GroupIcon />,
      path: '/utilisateurs',
      visible: isAdmin(),
      roles: ['admin']
    },
    
    // Paramètres - Admin seulement
    {
      id: 18,
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/parametres',
      visible: isAdmin(),
      roles: ['admin']
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: COMPANY_COLORS.darkCyan,
          background: `linear-gradient(135deg, ${COMPANY_COLORS.darkCyan} 0%, #005056 100%)`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          borderBottom: `2px solid ${COMPANY_COLORS.vividOrange}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px' }}>
          {/* Partie gauche avec logo et nom */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Logo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              '&:hover': { opacity: 0.9 }
            }}>
              {/* Logo image */}
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '8px',
                backgroundColor: COMPANY_COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: `2px solid ${COMPANY_COLORS.vividOrange}`
              }}>
                <img 
                  src={logo} 
                  alt="Logo de l'entreprise" 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              
              {/* Nom avec style corporate */}
              <Typography 
                variant="h5" 
                noWrap 
                component="div"
                sx={{ 
                  fontWeight: 900,
                  background: `linear-gradient(90deg, ${COMPANY_COLORS.white} 0%, ${COMPANY_COLORS.lightCyan} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '1px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: "'Montserrat', 'Roboto', sans-serif",
                  fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }}
              >
                 MGS SARL GESTION
              </Typography>
            </Box>
            
            {/* Badge rôle */}
            <Chip 
              label={userRole === 'admin' ? 'ADMIN' : 'VENDEUR'}
              size="small"
              sx={{ 
                height: 26, 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                backgroundColor: COMPANY_COLORS.vividOrange,
                color: COMPANY_COLORS.white,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                '& .MuiChip-label': {
                  px: 1.5
                }
              }}
            />
          </Box>

          {/* Partie droite avec contrôles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Bouton notifications global */}
            {(isAdmin() || isVendeur()) && notificationCount > 0 && (
              <Tooltip title="Notifications">
                <IconButton 
                  sx={{ 
                    color: COMPANY_COLORS.white,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '&:hover': { 
                      backgroundColor: COMPANY_COLORS.vividOrange,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease',
                    mr: 1
                  }} 
                  onClick={handleMenuOpen}
                  aria-label="Notifications"
                >
                  <Badge 
                    badgeContent={notificationCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: COMPANY_COLORS.vividOrange,
                        color: COMPANY_COLORS.white,
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    <WarningIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Menu notifications détaillé */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  width: 300,
                  borderRadius: '8px',
                  border: `1px solid ${COMPANY_COLORS.darkCyan}`,
                  overflow: 'hidden'
                },
              }}
            >
              <MenuItem disabled sx={{ 
                fontWeight: 'bold', 
                color: COMPANY_COLORS.white,
                backgroundColor: COMPANY_COLORS.darkCyan,
                py: 1.5
              }}>
                🔔 Notifications
              </MenuItem>
              
              {stocksFaibles.length > 0 && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/stocks-entrepot?low_stock=true'); }}
                  sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Badge badgeContent={stocksFaibles.length} color="error">
                      <WarningIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Stocks faibles" 
                    secondary={`${stocksFaibles.length} produit(s) concerné(s)`}
                  />
                </MenuItem>
              )}
              
              {ventesImpayeesCount > 0 && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/ventes?statut_paiement=non_paye'); }}
                  sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Badge badgeContent={ventesImpayeesCount} color="error">
                      <MoneyOffIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ventes impayées" 
                    secondary={`${ventesImpayeesCount} vente(s) impayée(s)`}
                  />
                </MenuItem>
              )}
              
              {ventesRetardCount > 0 && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/ventes?en_retard=true'); }}
                  sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <Badge badgeContent={ventesRetardCount} color="error">
                      <AccessTimeIcon />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary="Ventes en retard" 
                    secondary={`${ventesRetardCount} vente(s) en retard`}
                  />
                </MenuItem>
              )}
            </Menu>

            {/* Bouton changement de thème */}
            <Tooltip title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              <IconButton 
                sx={{ 
                  ml: 1, 
                  color: COMPANY_COLORS.white,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  '&:hover': { 
                    backgroundColor: COMPANY_COLORS.vividOrange,
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }} 
                onClick={toggleColorMode}
                aria-label="Changer le thème"
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Avatar et menu utilisateur */}
            <Tooltip title={`${userName} - ${userRole === 'admin' ? 'Administrateur' : 'Vendeur'}`}>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  p: 0, 
                  ml: 1.5,
                  '&:hover': { 
                    transform: 'scale(1.05)'
                  },
                  transition: 'transform 0.2s ease'
                }}
                aria-label="Menu utilisateur"
              >
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: COMPANY_COLORS.vividOrange,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: `2px solid ${COMPANY_COLORS.white}`,
                    boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Menu utilisateur */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  overflow: 'visible',
                  mt: 1.5,
                  width: 300,
                  borderRadius: '12px',
                  border: `1px solid ${COMPANY_COLORS.darkCyan}`,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* En-tête du menu */}
              <MenuItem disabled sx={{ 
                py: 2.5, 
                backgroundColor: COMPANY_COLORS.darkCyan,
                color: COMPANY_COLORS.white
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      bgcolor: COMPANY_COLORS.vividOrange,
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      border: `2px solid ${COMPANY_COLORS.white}`
                    }}
                  >
                    {userInitial}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="inherit">
                      {userName}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {userEmail}
                    </Typography>
                    <Chip 
                      label={userRole === 'admin' ? 'Administrateur' : 'Vendeur'}
                      size="small"
                      sx={{ 
                        mt: 0.5, 
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        backgroundColor: COMPANY_COLORS.vividOrange,
                        color: COMPANY_COLORS.white
                      }}
                    />
                  </Box>
                </Box>
              </MenuItem>
              
              <Divider />

              {/* Option de profil */}
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Mon profil
              </MenuItem>

              {/* Option dashboard */}
              <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                Tableau de bord
              </MenuItem>

              {/* Option paramètres (admin seulement) */}
              {isAdmin() && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/parametres'); }}
                  sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Paramètres système
                </MenuItem>
              )}

              <Divider />

              {/* Déconnexion */}
              <MenuItem 
                onClick={logoutUser}
                sx={{ 
                  py: 1.5,
                  color: COMPANY_COLORS.vividOrange,
                  '&:hover': { 
                    backgroundColor: 'rgba(218, 74, 14, 0.1)'
                  }
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: COMPANY_COLORS.vividOrange }} />
                </ListItemIcon>
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: COMPANY_COLORS.white,
            borderRight: `2px solid ${COMPANY_COLORS.darkCyan}`,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
          },
        }}
      >
        <Toolbar sx={{ minHeight: '70px' }} />
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          {/* Header de la sidebar */}
          <Box sx={{ 
            p: 2.5, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            borderBottom: `2px solid ${COMPANY_COLORS.lightCyan}`,
            backgroundColor: COMPANY_COLORS.darkCyan,
            color: COMPANY_COLORS.white
          }}>
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '6px',
              backgroundColor: COMPANY_COLORS.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700,
                color: COMPANY_COLORS.white,
                fontSize: '0.9rem'
              }}
            >
              MGS SARL
            </Typography>
          </Box>
          
          <List sx={{ p: 1.5 }}>
            {menuItems
              .filter(item => item.visible)
              .map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton 
                    component={Link} 
                    to={item.path}
                    selected={item.path === path}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: COMPANY_COLORS.darkCyan,
                        color: COMPANY_COLORS.white,
                        '& .MuiListItemIcon-root': {
                          color: COMPANY_COLORS.white,
                        },
                        '&:hover': {
                          backgroundColor: COMPANY_COLORS.darkCyan,
                          opacity: 0.95
                        },
                        borderLeft: `4px solid ${COMPANY_COLORS.vividOrange}`,
                      },
                      '&:hover': {
                        backgroundColor: COMPANY_COLORS.lightCyan,
                      },
                      borderRadius: '8px',
                      mx: 0.5,
                      py: 1.25,
                      pl: 2,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: item.path === path ? COMPANY_COLORS.white : COMPANY_COLORS.darkCyan,
                        minWidth: 40
                      }}
                    >
                      {item.badge ? (
                        <Badge 
                          badgeContent={
                            item.text === 'Stocks' ? stocksFaibles.length :
                            item.text === 'Ventes' ? (ventesImpayeesCount + ventesRetardCount) :
                            0
                          } 
                          color="error" 
                          size="small"
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: COMPANY_COLORS.vividOrange,
                              color: COMPANY_COLORS.white,
                              fontWeight: 'bold'
                            }
                          }}
                        >
                          {item.icon}
                        </Badge>
                      ) : item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: item.path === path ? '600' : '500'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
        
        {/* Section alertes */}
        {(isAdmin() || isVendeur()) && notificationCount > 0 && (
          <Box sx={{ 
            p: 2, 
            borderTop: `2px solid ${COMPANY_COLORS.lightCyan}`, 
            bgcolor: COMPANY_COLORS.lightOrange,
            borderLeft: `4px solid ${COMPANY_COLORS.vividOrange}`,
            margin: 1.5,
            borderRadius: '8px'
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                color: COMPANY_COLORS.darkCyan,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <WarningIcon fontSize="small" sx={{ color: COMPANY_COLORS.vividOrange }} />
              Alertes système
            </Typography>
            
            {stocksFaibles.length > 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  cursor: 'pointer',
                  color: COMPANY_COLORS.darkCyan,
                  mb: 1,
                  fontWeight: '500',
                  '&:hover': { 
                    color: COMPANY_COLORS.vividOrange,
                    textDecoration: 'underline'
                  }
                }}
                onClick={handleNotificationsClick}
              >
                ⚠️ {stocksFaibles.length} stock(s) faible(s)
              </Typography>
            )}
            
            {ventesImpayeesCount > 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  cursor: 'pointer',
                  color: COMPANY_COLORS.darkCyan,
                  mb: 1,
                  fontWeight: '500',
                  '&:hover': { 
                    color: COMPANY_COLORS.vividOrange,
                    textDecoration: 'underline'
                  }
                }}
                onClick={handleVentesImpayeesClick}
              >
                💰 {ventesImpayeesCount} vente(s) impayée(s)
              </Typography>
            )}
            
            {ventesRetardCount > 0 && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  cursor: 'pointer',
                  color: COMPANY_COLORS.darkCyan,
                  mb: 1,
                  fontWeight: '500',
                  '&:hover': { 
                    color: COMPANY_COLORS.vividOrange,
                    textDecoration: 'underline'
                  }
                }}
                onClick={handleVentesRetardClick}
              >
                ⏰ {ventesRetardCount} vente(s) en retard
              </Typography>
            )}
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 1.5,
                cursor: 'pointer',
                color: COMPANY_COLORS.vividOrange,
                fontWeight: 'bold',
                textAlign: 'center',
                '&:hover': { 
                  opacity: 0.8
                }
              }}
              onClick={() => navigate('/dashboard')}
            >
              → Voir le tableau de bord
            </Typography>
          </Box>
        )}
        
        {/* Footer avec version */}
        <Box sx={{ 
          p: 2, 
          borderTop: `2px solid ${COMPANY_COLORS.lightCyan}`,
          backgroundColor: COMPANY_COLORS.darkCyan,
          color: COMPANY_COLORS.white
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ fontSize: '0.75rem', opacity: 0.8 }}
            >
              v2.1.0
            </Typography>
            <Chip 
              label="2025 EDITION"
              size="small"
              sx={{ 
                fontSize: '0.65rem', 
                height: 20,
                fontWeight: 'bold',
                backgroundColor: COMPANY_COLORS.vividOrange,
                color: COMPANY_COLORS.white
              }}
            />
          </Box>
          <Typography 
            variant="caption" 
            align="center"
            sx={{ 
              display: 'block', 
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          >
            {userRole === 'admin' ? 'Mode Administration' : 'Mode Vendeur'}
          </Typography>
          <Typography 
            variant="caption" 
            align="center"
            sx={{ 
              display: 'block', 
              fontSize: '0.65rem',
              mt: 0.5,
              opacity: 0.8
            }}
          >
            © 2025 ADVERTISING COMPANY
          </Typography>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: mode === 'dark' ? '#121212' : '#f5f7fa', 
          minHeight: '100vh' 
        }}
      >
        <Toolbar sx={{ minHeight: '70px' }} />
        {content}
      </Box>
    </Box>
  );
}