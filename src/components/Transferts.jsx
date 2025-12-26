// src/components/Transferts.jsx
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
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  LinearProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SwapHoriz as SwapHorizIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  LocalShipping as LocalShippingIcon,
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const Transferts = () => {
  const theme = useTheme();
  const [transferts, setTransferts] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info'
  });
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Données sélectionnées
  const [selectedTransfert, setSelectedTransfert] = useState(null);
  
  // Formulaire
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    entrepot_source: '',
    entrepot_destination: '',
    motif: '',
    priorite: 'normal'
  });
  const [lignesTransfert, setLignesTransfert] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Chargement des transferts...');
      
      const [transfertsRes, entrepotsRes, produitsRes] = await Promise.all([
        AxiosInstance.get('transferts/'),
        AxiosInstance.get('entrepots/?actif=true'),
        AxiosInstance.get('produits/')
      ]);
      
      console.log('✅ Transferts chargés:', transfertsRes.data.length);
      console.log('✅ Entrepôts chargés:', entrepotsRes.data.length);
      console.log('✅ Produits chargés:', produitsRes.data.length);
      
      setTransferts(transfertsRes.data);
      setEntrepots(entrepotsRes.data);
      setProduits(produitsRes.data);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des données',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.entrepot_source) {
      newErrors.entrepot_source = 'L\'entrepôt source est obligatoire';
    }
    
    if (!formData.entrepot_destination) {
      newErrors.entrepot_destination = 'L\'entrepôt destination est obligatoire';
    }
    
    if (formData.entrepot_source === formData.entrepot_destination) {
      newErrors.entrepot_destination = 'Les entrepôts doivent être différents';
    }
    
    if (!formData.motif?.trim()) {
      newErrors.motif = 'Le motif est obligatoire';
    }
    
    if (lignesTransfert.length === 0) {
      newErrors.lignes = 'Ajoutez au moins un produit';
    }
    
    lignesTransfert.forEach((ligne, index) => {
      if (!ligne.produit) {
        newErrors[`produit_${index}`] = 'Sélectionnez un produit';
      }
      if (!ligne.quantite || ligne.quantite <= 0) {
        newErrors[`quantite_${index}`] = 'Quantité invalide';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion du formulaire
  const handleOpenDialog = (transfert = null) => {
    setActiveStep(0);
    setErrors({});
    
    if (transfert) {
      setFormData({
        entrepot_source: transfert.entrepot_source,
        entrepot_destination: transfert.entrepot_destination,
        motif: transfert.motif || '',
        priorite: transfert.priorite || 'normal'
      });
      setSelectedTransfert(transfert);
      setLignesTransfert(transfert.lignes_transfert || []);
    } else {
      setFormData({
        entrepot_source: '',
        entrepot_destination: '',
        motif: '',
        priorite: 'normal'
      });
      setSelectedTransfert(null);
      setLignesTransfert([]);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransfert(null);
    setActiveStep(0);
    setSubmitting(false);
    setErrors({});
  };

  // Navigation étapes
  const handleNext = () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
    }
    if (activeStep === 1) {
      if (!validateStep2()) return;
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.entrepot_source) {
      newErrors.entrepot_source = 'L\'entrepôt source est obligatoire';
    }
    
    if (!formData.entrepot_destination) {
      newErrors.entrepot_destination = 'L\'entrepôt destination est obligatoire';
    }
    
    if (formData.entrepot_source === formData.entrepot_destination) {
      newErrors.entrepot_destination = 'Les entrepôts doivent être différents';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs',
        severity: 'warning'
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (lignesTransfert.length === 0) {
      setSnackbar({
        open: true,
        message: 'Ajoutez au moins un produit',
        severity: 'warning'
      });
      return false;
    }
    
    const newErrors = {};
    lignesTransfert.forEach((ligne, index) => {
      if (!ligne.produit) {
        newErrors[`produit_${index}`] = 'Sélectionnez un produit';
      }
      if (!ligne.quantite || ligne.quantite <= 0) {
        newErrors[`quantite_${index}`] = 'Quantité invalide';
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs dans les produits',
        severity: 'warning'
      });
      return false;
    }
    
    return true;
  };

  // Gestion des lignes
  const handleAddLigne = () => {
    setLignesTransfert([...lignesTransfert, { produit: '', quantite: 1 }]);
  };

  const handleRemoveLigne = (index) => {
    const newLignes = [...lignesTransfert];
    newLignes.splice(index, 1);
    setLignesTransfert(newLignes);
    
    // Supprimer les erreurs associées
    const newErrors = { ...errors };
    delete newErrors[`produit_${index}`];
    delete newErrors[`quantite_${index}`];
    setErrors(newErrors);
  };

  const handleUpdateLigne = (index, field, value) => {
    const newLignes = [...lignesTransfert];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setLignesTransfert(newLignes);
    
    // Effacer l'erreur du champ modifié
    if (errors[`${field}_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${field}_${index}`];
      setErrors(newErrors);
    }
  };

  // Soumission
  const handleSubmitTransfert = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs dans le formulaire',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        entrepot_source: formData.entrepot_source,
        entrepot_destination: formData.entrepot_destination,
        motif: formData.motif,
        priorite: formData.priorite,
        lignes_transfert: lignesTransfert.map(ligne => ({
          produit: ligne.produit,
          quantite: parseInt(ligne.quantite)
        }))
      };

      if (selectedTransfert) {
        await AxiosInstance.put(`transferts/${selectedTransfert.id}/`, data);
        setSnackbar({
          open: true,
          message: 'Transfert modifié avec succès',
          severity: 'success'
        });
      } else {
        await AxiosInstance.post('transferts/', data);
        setSnackbar({
          open: true,
          message: 'Transfert créé avec succès',
          severity: 'success'
        });
      }

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Erreur de soumission:', error.response?.data || error);
      
      let errorMessage = 'Erreur lors de l\'opération';
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          errorMessage = Array.isArray(error.response.data.non_field_errors) 
            ? error.response.data.non_field_errors.join(', ') 
            : error.response.data.non_field_errors;
        } else if (error.response.data.lignes_transfert) {
          errorMessage = 'Erreur dans les produits: ' + (
            Array.isArray(error.response.data.lignes_transfert) 
              ? error.response.data.lignes_transfert.join(', ') 
              : error.response.data.lignes_transfert
          );
        } else {
          const messages = [];
          for (const key in error.response.data) {
            if (Array.isArray(error.response.data[key])) {
              messages.push(...error.response.data[key]);
            } else {
              messages.push(error.response.data[key]);
            }
          }
          errorMessage = messages.join(', ');
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Actions
  const handleConfirmTransfert = async () => {
    if (!selectedTransfert) return;
    
    try {
      await AxiosInstance.post(`transferts/${selectedTransfert.id}/confirmer/`);
      setSnackbar({
        open: true,
        message: 'Transfert confirmé avec succès',
        severity: 'success'
      });
      fetchData();
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error('❌ Erreur de confirmation:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Erreur lors de la confirmation',
        severity: 'error'
      });
    }
  };

  const handleCancelTransfert = async (transfertId) => {
    try {
      await AxiosInstance.post(`transferts/${transfertId}/annuler/`);
      setSnackbar({
        open: true,
        message: 'Transfert annulé avec succès',
        severity: 'success'
      });
      fetchData();
    } catch (error) {
      console.error('❌ Erreur d\'annulation:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Erreur lors de l\'annulation',
        severity: 'error'
      });
    }
  };

  const handleDeleteTransfert = async () => {
    if (!selectedTransfert) return;
    
    try {
      await AxiosInstance.delete(`transferts/${selectedTransfert.id}/`);
      setSnackbar({
        open: true,
        message: 'Transfert supprimé avec succès',
        severity: 'success'
      });
      fetchData();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('❌ Erreur de suppression:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Erreur lors de la suppression',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (transfert) => {
    setSelectedTransfert(transfert);
    setOpenDetailsDialog(true);
  };

  // Utilitaires
  const getStatutColor = (statut) => {
    switch(statut) {
      case 'confirme': return 'success';
      case 'annule': return 'error';
      default: return 'warning';
    }
  };

  const getStatutIcon = (statut) => {
    switch(statut) {
      case 'confirme': return <CheckCircleIcon />;
      case 'annule': return <CancelIcon />;
      default: return <PendingIcon />;
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'confirme': return 'CONFIRMÉ';
      case 'annule': return 'ANNULÉ';
      default: return 'BROUILLON';
    }
  };

  const getPrioriteColor = (priorite) => {
    switch(priorite) {
      case 'elevee': return 'error';
      case 'normal': return 'warning';
      case 'basse': return 'success';
      default: return 'default';
    }
  };

  const getPrioriteLabel = (priorite) => {
    switch(priorite) {
      case 'elevee': return 'ÉLEVÉE';
      case 'normal': return 'NORMALE';
      case 'basse': return 'BASSE';
      default: return 'NORMALE';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer la valeur totale d'un transfert
  const calculerValeurTransfert = (lignes) => {
    if (!lignes) return 0;
    return lignes.reduce((total, ligne) => {
      const produit = produits.find(p => p.id === ligne.produit);
      const prix = produit ? parseFloat(produit.prix_unitaire || 0) : 0;
      return total + (prix * (ligne.quantite || 0));
    }, 0);
  };

  // Statistiques
  const stats = {
    total: transferts.length,
    brouillon: transferts.filter(t => t.statut === 'brouillon').length,
    confirme: transferts.filter(t => t.statut === 'confirme').length,
    annule: transferts.filter(t => t.statut === 'annule').length,
    valeurTotale: transferts.reduce((sum, t) => sum + calculerValeurTransfert(t.lignes_transfert), 0),
    quantiteTotale: transferts.reduce((sum, t) => sum + (t.total_quantite || 0), 0)
  };

  // Filtrage
  const filteredTransferts = transferts.filter(transfert => {
    const matchesSearch = 
      (transfert.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transfert.motif?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transfert.entrepot_source_nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transfert.entrepot_destination_nom?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatut = !filterStatut || transfert.statut === filterStatut;
    
    return matchesSearch && matchesStatut;
  });

  // Pagination
  const paginatedTransferts = filteredTransferts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          Chargement des transferts...
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
            background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textFillColor: 'transparent'
          }}>
            Transferts d'Entrepôts
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez les mouvements de stocks entre vos sites
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          
          <Tooltip title="Nouveau transfert">
            <Fab 
              color="primary" 
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                boxShadow: '0 3px 15px rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                }
              }}
            >
              <LocalShippingIcon />
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
                    TOTAL TRANSFERTS
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Mouvements de stock
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}>
                  <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    TRANSFERTS BROUILLON
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.brouillon}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.total > 0 ? `${Math.round((stats.brouillon / stats.total) * 100)}%` : '0%'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }}>
                  <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                    TRANSFERTS CONFIRMÉS
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.confirme}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.total > 0 ? `${Math.round((stats.confirme / stats.total) * 100)}%` : '0%'}
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
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    VALEUR TOTALE
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {stats.valeurTotale.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Valeur transférée
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.1)
                }}>
                  <EuroIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
              placeholder="Rechercher par référence, motif, entrepôt..."
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
                variant={filterStatut === '' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatut('')}
                startIcon={<BusinessIcon />}
              >
                Tous ({stats.total})
              </Button>
              <Button
                variant={filterStatut === 'brouillon' ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setFilterStatut('brouillon')}
                startIcon={<PendingIcon />}
              >
                Brouillon ({stats.brouillon})
              </Button>
              <Button
                variant={filterStatut === 'confirme' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setFilterStatut('confirme')}
                startIcon={<CheckCircleIcon />}
              >
                Confirmés ({stats.confirme})
              </Button>
              <Button
                variant={filterStatut === 'annule' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setFilterStatut('annule')}
                startIcon={<CancelIcon />}
              >
                Annulés ({stats.annule})
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Affichage selon le mode */}
      {viewMode === 'grid' ? (
        <>
          {/* Vue Grille */}
          <Grid container spacing={3}>
            {paginatedTransferts.map((transfert) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={transfert.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${theme.palette[getStatutColor(transfert.statut)].main}`,
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
                        <LocalShippingIcon 
                          color="primary" 
                          sx={{ fontSize: 32 }} 
                        />
                        <Box>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {transfert.reference}
                          </Typography>
                          <Chip
                            label={getPrioriteLabel(transfert.priorite)}
                            size="small"
                            color={getPrioriteColor(transfert.priorite)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatutIcon(transfert.statut)}
                        label={getStatutLabel(transfert.statut)}
                        color={getStatutColor(transfert.statut)}
                        size="small"
                        sx={{ fontWeight: 'bold', ml: 1 }}
                      />
                    </Box>

                    {/* Informations entrepôts */}
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light', width: 32, height: 32 }}>
                            <WarehouseIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Source"
                          secondary={
                            <Typography variant="body2" color="textSecondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {transfert.entrepot_source_nom || 'Non spécifié'}
                            </Typography>
                          }
                        />
                      </ListItem>

                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                            <ArrowRightAltIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Destination"
                          secondary={
                            <Typography variant="body2" color="textSecondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {transfert.entrepot_destination_nom || 'Non spécifié'}
                            </Typography>
                          }
                        />
                      </ListItem>

                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                            <InventoryIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Produits"
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {transfert.lignes_transfert?.length || 0} produits
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {transfert.total_quantite || 0} unités
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>

                      {transfert.motif && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                              <DescriptionIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Motif"
                            secondary={
                              <Typography variant="body2" color="textSecondary" sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {transfert.motif}
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>

                    {/* Valeur et date */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" fontWeight="medium" color="info.main">
                            {calculerValeurTransfert(transfert.lignes_transfert).toLocaleString('fr-FR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })} €
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Valeur
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {formatDate(transfert.created_at)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Création
                          </Typography>
                        </Grid>
                      </Grid>
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
                          onClick={() => handleViewDetails(transfert)}
                          sx={{ 
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {transfert.statut === 'brouillon' && (
                          <>
                            <Tooltip title="Confirmer">
                              <IconButton 
                                size="small"
                                color="success"
                                onClick={() => {
                                  setSelectedTransfert(transfert);
                                  setOpenConfirmDialog(true);
                                }}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenDialog(transfert)}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Annuler">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleCancelTransfert(transfert.id)}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) }
                                }}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {(transfert.statut === 'brouillon' || transfert.statut === 'annule') && (
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                setSelectedTransfert(transfert);
                                setOpenDeleteDialog(true);
                              }}
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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
                    <TableCell>RÉFÉRENCE</TableCell>
                    <TableCell>ENTREPÔTS</TableCell>
                    <TableCell>PRODUITS</TableCell>
                    <TableCell>VALEUR</TableCell>
                    <TableCell>PRIORITÉ</TableCell>
                    <TableCell>STATUT</TableCell>
                    <TableCell>DATE</TableCell>
                    <TableCell align="center">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransferts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <LocalShippingIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            {searchTerm || filterStatut ? 'Aucun transfert trouvé' : 'Aucun transfert enregistré'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {!searchTerm && !filterStatut ? 'Commencez par créer votre premier transfert' : 'Essayez de modifier vos critères de recherche'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransferts.map((transfert) => (
                      <TableRow 
                        key={transfert.id} 
                        hover 
                        sx={{ 
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {transfert.reference}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {transfert.motif?.substring(0, 30) || 'Aucun motif'}
                              {transfert.motif?.length > 30 ? '...' : ''}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ minWidth: 200 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <WarehouseIcon fontSize="small" color="error" />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {transfert.entrepot_source_nom}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ArrowRightAltIcon fontSize="small" />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {transfert.entrepot_destination_nom}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {transfert.lignes_transfert?.length || 0} produit(s)
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Total: {transfert.total_quantite || 0} unités
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" color="info.main">
                            {calculerValeurTransfert(transfert.lignes_transfert).toLocaleString('fr-FR', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })} €
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={getPrioriteLabel(transfert.priorite)}
                            size="small"
                            color={getPrioriteColor(transfert.priorite)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            icon={getStatutIcon(transfert.statut)}
                            label={getStatutLabel(transfert.statut)}
                            color={getStatutColor(transfert.statut)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(transfert.created_at)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Voir les détails">
                              <IconButton 
                                size="small"
                                color="info"
                                onClick={() => handleViewDetails(transfert)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {transfert.statut === 'brouillon' && (
                              <>
                                <Tooltip title="Confirmer">
                                  <IconButton 
                                    size="small"
                                    color="success"
                                    onClick={() => {
                                      setSelectedTransfert(transfert);
                                      setOpenConfirmDialog(true);
                                    }}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Modifier">
                                  <IconButton 
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenDialog(transfert)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            
                            {(transfert.statut === 'brouillon' || transfert.statut === 'annule') && (
                              <Tooltip title="Supprimer">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedTransfert(transfert);
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
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
              count={filteredTransferts.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Card>
        </>
      )}

      {/* Message si aucun transfert */}
      {filteredTransferts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocalShippingIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="textSecondary">
            Aucun transfert trouvé
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {searchTerm || filterStatut 
              ? 'Aucun transfert ne correspond à vos critères de recherche' 
              : 'Commencez par créer votre premier transfert'}
          </Typography>
          {!searchTerm && !filterStatut && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
              }}
            >
              Créer un transfert
            </Button>
          )}
        </Box>
      )}

      {/* Dialog création/modification */}
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
            <LocalShippingIcon />
            {selectedTransfert ? 'Modifier le Transfert' : 'Nouveau Transfert'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {/* Étape 1 */}
            <Step>
              <StepLabel>Entrepôts et Priorité</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.entrepot_source}>
                      <InputLabel>Source *</InputLabel>
                      <Select
                        value={formData.entrepot_source}
                        label="Source *"
                        onChange={(e) => setFormData({...formData, entrepot_source: e.target.value})}
                      >
                        <MenuItem value="">Sélectionner</MenuItem>
                        {entrepots.map((entrepot) => (
                          <MenuItem key={entrepot.id} value={entrepot.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarehouseIcon fontSize="small" />
                              <span>{entrepot.nom}</span>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.entrepot_source && (
                        <Typography variant="caption" color="error">
                          {errors.entrepot_source}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.entrepot_destination}>
                      <InputLabel>Destination *</InputLabel>
                      <Select
                        value={formData.entrepot_destination}
                        label="Destination *"
                        onChange={(e) => setFormData({...formData, entrepot_destination: e.target.value})}
                      >
                        <MenuItem value="">Sélectionner</MenuItem>
                        {entrepots
                          .filter(e => e.id !== formData.entrepot_source)
                          .map((entrepot) => (
                            <MenuItem key={entrepot.id} value={entrepot.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarehouseIcon fontSize="small" />
                                <span>{entrepot.nom}</span>
                              </Box>
                            </MenuItem>
                          ))
                        }
                      </Select>
                      {errors.entrepot_destination && (
                        <Typography variant="caption" color="error">
                          {errors.entrepot_destination}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priorité</InputLabel>
                      <Select
                        value={formData.priorite}
                        label="Priorité"
                        onChange={(e) => setFormData({...formData, priorite: e.target.value})}
                      >
                        <MenuItem value="basse">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="BASSE" size="small" color="success" />
                            <span>Basse</span>
                          </Box>
                        </MenuItem>
                        <MenuItem value="normal">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="NORMALE" size="small" color="warning" />
                            <span>Normale</span>
                          </Box>
                        </MenuItem>
                        <MenuItem value="elevee">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="ÉLEVÉE" size="small" color="error" />
                            <span>Élevée</span>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleNext}>
                    Suivant
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Étape 2 */}
            <Step>
              <StepLabel>Produits</StepLabel>
              <StepContent>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Produits à transférer
                      </Typography>
                      <Button
                        startIcon={<AddCircleIcon />}
                        onClick={handleAddLigne}
                        variant="contained"
                        size="small"
                      >
                        Ajouter
                      </Button>
                    </Box>

                    {lignesTransfert.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="body1" color="textSecondary">
                          Aucun produit ajouté
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Cliquez sur "Ajouter" pour commencer
                        </Typography>
                      </Box>
                    ) : (
                      <List>
                        {lignesTransfert.map((ligne, index) => {
                          const produit = produits.find(p => p.id === ligne.produit);
                          return (
                            <Card key={index} sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider' }}>
                              <Grid container spacing={1} alignItems="center">
                                <Grid item xs={12} sm={5}>
                                  <FormControl fullWidth size="small" error={!!errors[`produit_${index}`]}>
                                    <InputLabel>Produit</InputLabel>
                                    <Select
                                      value={ligne.produit}
                                      label="Produit"
                                      onChange={(e) => handleUpdateLigne(index, 'produit', e.target.value)}
                                    >
                                      <MenuItem value="">Sélectionner</MenuItem>
                                      {produits.map((produit) => (
                                        <MenuItem key={produit.id} value={produit.id}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <span>{produit.nom}</span>
                                            <Chip 
                                              label={`${produit.stock || 0} dispo`} 
                                              size="small" 
                                              color="info" 
                                              variant="outlined"
                                            />
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {errors[`produit_${index}`] && (
                                      <Typography variant="caption" color="error">
                                        {errors[`produit_${index}`]}
                                      </Typography>
                                    )}
                                  </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Quantité"
                                    type="number"
                                    value={ligne.quantite}
                                    onChange={(e) => handleUpdateLigne(index, 'quantite', e.target.value)}
                                    inputProps={{ min: 1 }}
                                    error={!!errors[`quantite_${index}`]}
                                    helperText={errors[`quantite_${index}`]}
                                  />
                                </Grid>
                                
                                <Grid item xs={12} sm={3}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {produit && (
                                      <Chip
                                        label={`${(produit.prix_unitaire || 0) * ligne.quantite} €`}
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveLigne(index)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Card>
                          );
                        })}
                      </List>
                    )}
                    
                    {lignesTransfert.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" color="textSecondary">
                          Total: {lignesTransfert.reduce((sum, ligne) => sum + (parseInt(ligne.quantite) || 0), 0)} unités
                        </Typography>
                        {errors.lignes && (
                          <Typography variant="caption" color="error">
                            {errors.lignes}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
                    Suivant
                  </Button>
                  <Button onClick={handleBack}>
                    Retour
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Étape 3 */}
            <Step>
              <StepLabel>Finalisation</StepLabel>
              <StepContent>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Motif du transfert *"
                      name="motif"
                      value={formData.motif}
                      onChange={(e) => {
                        setFormData({...formData, motif: e.target.value});
                        if (errors.motif) {
                          setErrors({...errors, motif: ''});
                        }
                      }}
                      multiline
                      rows={3}
                      error={!!errors.motif}
                      helperText={errors.motif}
                      placeholder="Décrivez la raison de ce transfert..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Récapitulatif
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Source: {entrepots.find(e => e.id === formData.entrepot_source)?.nom || 'Non sélectionné'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Destination: {entrepots.find(e => e.id === formData.entrepot_destination)?.nom || 'Non sélectionné'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="textSecondary">
                            Produits: {lignesTransfert.length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Quantité totale: {lignesTransfert.reduce((sum, ligne) => sum + (parseInt(ligne.quantite) || 0), 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>

                <Box>
                  <Button
                    variant="contained"
                    onClick={handleSubmitTransfert}
                    disabled={submitting}
                    sx={{ mr: 1 }}
                  >
                    {submitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} color="inherit" />
                        Enregistrement...
                      </Box>
                    ) : (
                      selectedTransfert ? 'Modifier le transfert' : 'Créer le transfert'
                    )}
                  </Button>
                  <Button onClick={handleBack}>
                    Retour
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedTransfert && (
          <>
            <DialogTitle sx={{ 
              bgcolor: theme.palette[getStatutColor(selectedTransfert.statut)].main, 
              color: 'white',
              fontWeight: 'bold'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalShippingIcon />
                <span>Détails du Transfert</span>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label={getStatutLabel(selectedTransfert.statut)}
                  color="default"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Informations principales */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {selectedTransfert.reference}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <WarehouseIcon color="error" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Entrepôt Source
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedTransfert.entrepot_source_nom}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <WarehouseIcon color="success" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Entrepôt Destination
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedTransfert.entrepot_destination_nom}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon color="action" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Date de création
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(selectedTransfert.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon color="action" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Priorité
                              </Typography>
                              <Chip
                                label={getPrioriteLabel(selectedTransfert.priorite)}
                                size="small"
                                color={getPrioriteColor(selectedTransfert.priorite)}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {selectedTransfert.motif && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Motif:
                          </Typography>
                          <Typography variant="body1">
                            {selectedTransfert.motif}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Produits */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon />
                        Produits à transférer
                      </Typography>
                      
                      {selectedTransfert.lignes_transfert?.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                          Aucun produit dans ce transfert
                        </Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>PRODUIT</TableCell>
                                <TableCell>QUANTITÉ</TableCell>
                                <TableCell>PRIX UNITAIRE</TableCell>
                                <TableCell align="right">TOTAL</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedTransfert.lignes_transfert?.map((ligne, index) => {
                                const produit = produits.find(p => p.id === ligne.produit);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {produit ? produit.nom : 'Produit inconnu'}
                                    </TableCell>
                                    <TableCell>
                                      {ligne.quantite} unités
                                    </TableCell>
                                    <TableCell>
                                      {produit ? `${parseFloat(produit.prix_unitaire || 0).toLocaleString('fr-FR', { 
                                        minimumFractionDigits: 2, 
                                        maximumFractionDigits: 2 
                                      })} €` : 'N/A'}
                                    </TableCell>
                                    <TableCell align="right">
                                      {produit ? `${(produit.prix_unitaire * ligne.quantite).toLocaleString('fr-FR', { 
                                        minimumFractionDigits: 2, 
                                        maximumFractionDigits: 2 
                                      })} €` : 'N/A'}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell colSpan={3} align="right">
                                  <Typography variant="body1" fontWeight="bold">
                                    TOTAL
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body1" fontWeight="bold" color="primary">
                                    {calculerValeurTransfert(selectedTransfert.lignes_transfert).toLocaleString('fr-FR', { 
                                      minimumFractionDigits: 2, 
                                      maximumFractionDigits: 2 
                                    })} €
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpenDetailsDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog confirmation */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
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
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              margin: '0 auto 20px'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
          </Box>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Confirmer le Transfert
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Êtes-vous sûr de vouloir confirmer le transfert <strong>"{selectedTransfert?.reference}"</strong> ?
          </Typography>

          {selectedTransfert && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Source:</strong> {selectedTransfert.entrepot_source_nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Destination:</strong> {selectedTransfert.entrepot_destination_nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Produits:</strong> {selectedTransfert.lignes_transfert?.length || 0} produits
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Quantité totale:</strong> {selectedTransfert.total_quantite || 0} unités
              </Typography>
            </Card>
          )}
          
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
            Cette action déclenchera le mouvement des stocks entre les entrepôts.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            onClick={() => setOpenConfirmDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmTransfert}
            variant="contained"
            color="success"
            sx={{ 
              borderRadius: 2, 
              minWidth: 120,
              background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Supprimer le Transfert
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Êtes-vous sûr de vouloir supprimer le transfert <strong>"{selectedTransfert?.reference}"</strong> ?
          </Typography>

          {selectedTransfert && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Référence:</strong> {selectedTransfert.reference}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Statut:</strong> {getStatutLabel(selectedTransfert.statut)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Produits:</strong> {selectedTransfert.lignes_transfert?.length || 0} produits
              </Typography>
              {selectedTransfert.statut === 'confirme' && (
                <Typography variant="body2" color="error">
                  <strong>Attention:</strong> Ce transfert a été confirmé. La suppression pourrait affecter les stocks.
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
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteTransfert}
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

      {/* Snackbar */}
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

export default Transferts;