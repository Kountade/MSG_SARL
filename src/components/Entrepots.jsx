// src/components/Entrepots.jsx
import AxiosInstance from './AxiosInstance';
import { React, useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TablePagination,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warehouse as WarehouseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Euro as EuroIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const Entrepots = () => {
  const [entrepots, setEntrepots] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntrepot, setSelectedEntrepot] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const theme = useTheme();

  // Formulaire entrepôt
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    responsable: '',
    actif: true,
    capacite_max: '',
    description: ''
  });

  // Validation des erreurs
  const [errors, setErrors] = useState({});

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Début du chargement des données...');
      
      // Récupérer les entrepôts
      const entrepotsResponse = await AxiosInstance.get('entrepots/');
      console.log('✅ Entrepôts chargés:', entrepotsResponse.data.length);
      setEntrepots(entrepotsResponse.data);

      // Récupérer les utilisateurs (admin seulement)
      const usersResponse = await AxiosInstance.get('users/');
      const adminUsers = usersResponse.data.filter(user => user.role === 'admin');
      console.log('✅ Utilisateurs admin chargés:', adminUsers.length);
      setUsers(adminUsers);

      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du chargement des données. Veuillez vérifier votre connexion.', 
        severity: 'error' 
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est obligatoire';
    }
    
    if (formData.telephone && !/^[0-9+\-\s]{10,15}$/.test(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }
    
    if (formData.capacite_max && isNaN(formData.capacite_max)) {
      newErrors.capacite_max = 'La capacité doit être un nombre';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ouvrir le dialog pour ajouter/modifier un entrepôt
  const handleOpenDialog = (entrepot = null) => {
    setErrors({});
    
    if (entrepot) {
      setFormData({
        nom: entrepot.nom || '',
        adresse: entrepot.adresse || '',
        telephone: entrepot.telephone || '',
        responsable: entrepot.responsable || '',
        actif: entrepot.actif !== undefined ? entrepot.actif : true,
        capacite_max: entrepot.capacite_max || '',
        description: entrepot.description || ''
      });
      setSelectedEntrepot(entrepot);
    } else {
      setFormData({
        nom: '',
        adresse: '',
        telephone: '',
        responsable: '',
        actif: true,
        capacite_max: '',
        description: ''
      });
      setSelectedEntrepot(null);
    }
    setOpenDialog(true);
  };

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEntrepot(null);
    setErrors({});
  };

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Veuillez corriger les erreurs dans le formulaire', 
        severity: 'error' 
      });
      return;
    }

    try {
      const submitData = {
        ...formData,
        responsable: formData.responsable || null,
        capacite_max: formData.capacite_max || null,
        description: formData.description || null
      };

      if (selectedEntrepot) {
        // Modification
        await AxiosInstance.put(`entrepots/${selectedEntrepot.id}/`, submitData);
        setSnackbar({ 
          open: true, 
          message: 'Entrepôt modifié avec succès', 
          severity: 'success' 
        });
      } else {
        // Création
        await AxiosInstance.post('entrepots/', submitData);
        setSnackbar({ 
          open: true, 
          message: 'Entrepôt créé avec succès', 
          severity: 'success' 
        });
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Erreur:', error.response?.data || error.message);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Erreur lors de l\'opération', 
        severity: 'error' 
      });
    }
  };

  // Ouvrir/fermer le dialog de suppression
  const handleOpenDeleteDialog = (entrepot) => {
    setSelectedEntrepot(entrepot);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEntrepot(null);
  };

  // Supprimer un entrepôt
  const handleDelete = async () => {
    if (!selectedEntrepot) return;

    try {
      await AxiosInstance.delete(`entrepots/${selectedEntrepot.id}/`);
      setSnackbar({ 
        open: true, 
        message: 'Entrepôt supprimé avec succès', 
        severity: 'success' 
      });
      fetchData();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('❌ Erreur:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors de la suppression', 
        severity: 'error' 
      });
    }
  };

  // Filtrer les entrepôts
  const filteredEntrepots = entrepots.filter(entrepot => {
    const matchesSearch = 
      entrepot.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrepot.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entrepot.responsable_email && entrepot.responsable_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entrepot.telephone && entrepot.telephone.includes(searchTerm));

    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && entrepot.actif) || 
      (filterActive === 'inactive' && !entrepot.actif);

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Données paginées
  const paginatedEntrepots = filteredEntrepots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Statistiques
  const stats = {
    total: entrepots.length,
    actifs: entrepots.filter(e => e.actif).length,
    inactifs: entrepots.filter(e => !e.actif).length,
    stock_total: entrepots.reduce((sum, e) => sum + parseFloat(e.stock_total_valeur || 0), 0),
    capacite_totale: entrepots.reduce((sum, e) => sum + parseFloat(e.capacite_max || 0), 0)
  };

  // Avatar pour les responsables
  const ResponsableAvatar = ({ email }) => (
    <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
      {email ? email.charAt(0).toUpperCase() : '?'}
    </Avatar>
  );

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'medium' }}>
          Chargement des entrepôts...
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Veuillez patienter pendant le chargement des données
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* En-tête */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textFillColor: 'transparent'
          }}>
            Gestion des Entrepôts
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez vos sites de stockage et leurs stocks
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Actualiser les données">
            <IconButton 
              onClick={fetchData} 
              color="primary"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'table'}
                onChange={(e) => setViewMode(e.target.checked ? 'table' : 'grid')}
                color="primary"
              />
            }
            label={viewMode === 'table' ? 'Vue tableau' : 'Vue grille'}
          />
          
          <Tooltip title="Ajouter un nouvel entrepôt">
            <Fab 
              color="primary" 
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 15px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>

      {/* Cartes de statistiques améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    TOTAL ENTREPÔTS
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Sites de stockage
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}>
                  <WarehouseIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: alpha(theme.palette.success.main, 0.05),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    ENTREPÔTS ACTIFS
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.actifs}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.total > 0 ? `${Math.round((stats.actifs / stats.total) * 100)}%` : '0%'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.1)
                }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    ENTREPÔTS INACTIFS
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {stats.inactifs}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.total > 0 ? `${Math.round((stats.inactifs / stats.total) * 100)}%` : '0%'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }}>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    VALEUR DU STOCK
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.stock_total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Valeur totale
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }}>
                  <EuroIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de contrôle avec recherche et filtres */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par nom, adresse, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant={filterActive === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterActive('all')}
                startIcon={<BusinessIcon />}
              >
                Tous ({stats.total})
              </Button>
              <Button
                variant={filterActive === 'active' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setFilterActive('active')}
                startIcon={<CheckCircleIcon />}
              >
                Actifs ({stats.actifs})
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setFilterActive('inactive')}
                startIcon={<CancelIcon />}
              >
                Inactifs ({stats.inactifs})
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Affichage selon le mode (grid ou table) */}
      {viewMode === 'grid' ? (
        <>
          {/* Vue Grille */}
          <Grid container spacing={3}>
            {paginatedEntrepots.map((entrepot) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={entrepot.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${entrepot.actif ? theme.palette.success.main : theme.palette.error.main}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                    transform: 'translateY(-6px)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* En-tête */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <WarehouseIcon 
                          color="primary" 
                          sx={{ fontSize: 32 }} 
                        />
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 'bold',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {entrepot.nom}
                        </Typography>
                      </Box>
                      <Chip
                        label={entrepot.actif ? 'ACTIF' : 'INACTIF'}
                        color={entrepot.actif ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold', ml: 1 }}
                      />
                    </Box>

                    {/* Informations */}
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            <LocationIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Adresse"
                          secondary={
                            <Typography variant="body2" color="textSecondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {entrepot.adresse || 'Non spécifiée'}
                            </Typography>
                          }
                        />
                      </ListItem>

                      {entrepot.telephone && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                              <PhoneIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Téléphone"
                            secondary={entrepot.telephone}
                          />
                        </ListItem>
                      )}

                      {entrepot.responsable_email && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <ResponsableAvatar email={entrepot.responsable_email} />
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Responsable"
                            secondary={
                              <Typography variant="body2" color="textSecondary">
                                {entrepot.responsable_email}
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}

                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Produits"
                          secondary={`${entrepot.produits_count || 0} produits`}
                        />
                      </ListItem>

                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.light', width: 32, height: 32 }}>
                            <EuroIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Valeur"
                          secondary={`${parseFloat(entrepot.stock_total_valeur || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
                        />
                      </ListItem>
                    </List>

                    {/* Date de création */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="textSecondary">
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Créé le {formatDate(entrepot.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Tooltip title="Voir les détails">
                        <IconButton 
                          size="small"
                          color="info"
                          sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(entrepot)}
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Supprimer">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(entrepot)}
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          {/* Vue Tableau */}
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    '& th': { 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}>
                    <TableCell>ENTREPÔT</TableCell>
                    <TableCell>ADRESSE</TableCell>
                    <TableCell>CONTACT</TableCell>
                    <TableCell>RESPONSABLE</TableCell>
                    <TableCell>PRODUITS</TableCell>
                    <TableCell>VALEUR</TableCell>
                    <TableCell>STATUT</TableCell>
                    <TableCell align="center">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEntrepots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <WarehouseIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            {searchTerm || filterActive !== 'all' ? 'Aucun entrepôt trouvé' : 'Aucun entrepôt enregistré'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {!searchTerm && filterActive === 'all' ? 'Commencez par créer votre premier entrepôt' : 'Essayez de modifier vos critères de recherche'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEntrepots.map((entrepot) => (
                      <TableRow 
                        key={entrepot.id} 
                        hover 
                        sx={{ 
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                              {entrepot.nom ? entrepot.nom.charAt(0).toUpperCase() : 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {entrepot.nom}
                              </Typography>
                              {entrepot.capacite_max && (
                                <Typography variant="caption" color="textSecondary">
                                  Cap: {entrepot.capacite_max}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title={entrepot.adresse}>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {entrepot.adresse}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell>
                          {entrepot.telephone ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {entrepot.telephone}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                              Non renseigné
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {entrepot.responsable_email ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {entrepot.responsable_email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                              Non assigné
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={`${entrepot.produits_count || 0} produits`}
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" color="warning.main">
                            {parseFloat(entrepot.stock_total_valeur || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={entrepot.actif ? 'ACTIF' : 'INACTIF'}
                            color={entrepot.actif ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(entrepot)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleOpenDeleteDialog(entrepot)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredEntrepots.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Card>
        </>
      )}

      {/* Message si aucun entrepôt */}
      {filteredEntrepots.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <WarehouseIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="textSecondary">
            Aucun entrepôt trouvé
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {searchTerm || filterActive !== 'all' 
              ? 'Aucun entrepôt ne correspond à vos critères de recherche' 
              : 'Commencez par créer votre premier entrepôt'}
          </Typography>
          {!searchTerm && filterActive === 'all' && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }}
            >
              Créer un entrepôt
            </Button>
          )}
        </Box>
      )}

      {/* Dialog pour ajouter/modifier un entrepôt */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarehouseIcon />
            {selectedEntrepot ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'entrepôt *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                error={!!errors.nom}
                helperText={errors.nom}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WarehouseIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                error={!!errors.telephone}
                helperText={errors.telephone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse *"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                error={!!errors.adresse}
                helperText={errors.adresse}
                multiline
                rows={2}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Responsable</InputLabel>
                <Select
                  name="responsable"
                  value={formData.responsable}
                  label="Responsable"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Aucun responsable</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <span>{user.email}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacité maximale"
                name="capacite_max"
                value={formData.capacite_max}
                onChange={handleInputChange}
                error={!!errors.capacite_max}
                helperText={errors.capacite_max}
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">unités</InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Description de l'entrepôt, notes supplémentaires..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {formData.actif ? (
                      <>
                        <CheckCircleIcon color="success" />
                        <Typography>Entrepôt actif</Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon color="error" />
                        <Typography>Entrepôt inactif</Typography>
                      </>
                    )}
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.nom.trim() || !formData.adresse.trim()}
            sx={{ 
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {selectedEntrepot ? 'Modifier l\'entrepôt' : 'Créer l\'entrepôt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              margin: '0 auto 20px'
            }}
          >
            <DeleteIcon sx={{ fontSize: 40, color: 'error.main' }} />
          </Box>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Confirmer la suppression
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Êtes-vous sûr de vouloir supprimer l'entrepôt <strong>"{selectedEntrepot?.nom}"</strong> ? 
          </Typography>

          {selectedEntrepot && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Nom:</strong> {selectedEntrepot.nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Adresse:</strong> {selectedEntrepot.adresse}
              </Typography>
              {selectedEntrepot.telephone && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Téléphone:</strong> {selectedEntrepot.telephone}
                </Typography>
              )}
              {selectedEntrepot.produits_count > 0 && (
                <Typography variant="body2" color="error">
                  <strong>Attention:</strong> Cet entrepôt contient {selectedEntrepot.produits_count} produit(s). 
                  La suppression entraînera la perte de ces données.
                </Typography>
              )}
            </Card>
          )}
          
          <Typography variant="body2" color="error" sx={{ fontStyle: 'italic' }}>
            ⚠️ Cette action est irréversible.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 2, 
              minWidth: 120,
              background: 'linear-gradient(45deg, #FF5252 30%, #FF867F 90%)',
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: 400
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Entrepots;