// src/components/HistoriqueClient.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Grid,
  CircularProgress, Button, Avatar, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tabs, Tab, Autocomplete,
  IconButton, Tooltip, alpha, MenuItem, Select, FormControl, InputLabel,
  LinearProgress, Fab, TablePagination, InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Euro as EuroIcon,
  AttachMoney as AttachMoneyIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  ReceiptLong as ReceiptLongIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
  Description as DescriptionIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalance as AccountBalanceIcon,
  PhoneAndroid as PhoneAndroidIcon
} from '@mui/icons-material';

const HistoriqueClient = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(searchParams.get('client_id'));
  const [client, setClient] = useState(null);
  const [ventes, setVentes] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openPaiementDialog, setOpenPaiementDialog] = useState(false);
  const [selectedVenteForPaiement, setSelectedVenteForPaiement] = useState(null);
  const [formPaiement, setFormPaiement] = useState({
    montant: '',
    mode_paiement: 'especes',
    reference: '',
    notes: ''
  });
  const [allClients, setAllClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalCount, setTotalCount] = useState(0);
  const [apiPagination, setApiPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  });

  // Couleurs de l'entreprise
  const darkCyan = '#003C3F';
  const vividOrange = '#DA4A0E';

  const formatNumber = (number) => {
    const num = parseFloat(number) || 0;
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Calculer le nombre de jours de retard
  const calculerJoursRetard = (dateEcheance) => {
    if (!dateEcheance) return 0;
    const aujourdhui = new Date();
    const echeance = new Date(dateEcheance);
    const diffTime = aujourdhui - echeance;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Charger la liste des clients au démarrage
  useEffect(() => {
    if (!clientId) {
      fetchAllClients();
    }
  }, []);

  // Charger l'historique du client si clientId est présent
  useEffect(() => {
    if (clientId) {
      fetchHistorique();
    }
  }, [clientId]);

  const fetchAllClients = async () => {
    try {
      setLoadingClients(true);
      const response = await AxiosInstance.get('clients/');
      setAllClients(response.data);
      setLoadingClients(false);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du chargement des clients', 
        severity: 'error' 
      });
      setLoadingClients(false);
    }
  };

  const fetchHistorique = async (pageNumber = 1, pageSize = 10) => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`historique-client/?client_id=${clientId}&page=${pageNumber}&page_size=${pageSize}`);
      
      console.log('Réponse API:', response.data);
      
      // Gérer les erreurs de l'API
      if (response.data.error) {
        setSnackbar({ 
          open: true, 
          message: response.data.error, 
          severity: 'error' 
        });
        setLoading(false);
        return;
      }
      
      // Gérer différents formats de réponse
      if (response.data.results) {
        // Format paginé Django REST Framework standard
        setVentes(response.data.results);
        setClient(response.data.client);
        setStatistiques(response.data.statistiques);
        setTotalCount(response.data.count || 0);
      } else if (response.data.ventes) {
        // Format personnalisé
        setClient(response.data.client);
        setVentes(response.data.ventes || []);
        setStatistiques(response.data.statistiques || null);
        setTotalCount(response.data.count || response.data.ventes?.length || 0);
        
        // Mettre à jour la pagination si fournie
        if (response.data.page && response.data.total_pages) {
          setApiPagination({
            page: response.data.page,
            pageSize: response.data.page_size || pageSize,
            totalPages: response.data.total_pages,
            totalItems: response.data.count || response.data.ventes?.length || 0
          });
        }
      } else if (response.data.client && Array.isArray(response.data)) {
        // Format alternatif
        const data = response.data;
        setClient(data.client);
        setVentes(data.ventes || []);
        setStatistiques(data.statistiques || null);
        setTotalCount(data.ventes?.length || 0);
      } else {
        console.error('Format de réponse inattendu:', response.data);
        setSnackbar({
          open: true,
          message: 'Format de données inattendu',
          severity: 'warning'
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur détaillée chargement historique:', error);
      console.error('URL appelée:', `historique-client/?client_id=${clientId}`);
      console.error('Réponse erreur:', error.response?.data);
      
      let errorMessage = `Erreur lors du chargement de l'historique: ${error.message}`;
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
      setLoading(false);
    }
  };

  const handleClientSelect = (client) => {
    if (client) {
      setClientId(client.id);
      // Reset pagination
      setPage(0);
      setApiPagination({
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0
      });
      // Mettre à jour l'URL avec le client_id
      navigate(`/historique-client?client_id=${client.id}`);
    }
  };

  const handleOpenPaiementDialog = (vente) => {
    setSelectedVenteForPaiement(vente);
    const montantRestant = vente.montant_total - (vente.montant_paye || 0);
    setFormPaiement({
      montant: montantRestant > 0 ? montantRestant.toString() : '',
      mode_paiement: 'especes',
      reference: '',
      notes: ''
    });
    setOpenPaiementDialog(true);
  };

  const handleEnregistrerPaiement = async () => {
    if (!selectedVenteForPaiement) return;
    
    setSubmitting(true);
    
    try {
      const response = await AxiosInstance.post(
        `ventes/${selectedVenteForPaiement.id}/enregistrer_paiement/`,
        formPaiement
      );
      
      // Mettre à jour les données
      fetchHistorique();
      setOpenPaiementDialog(false);
      setSelectedVenteForPaiement(null);
      
      // Afficher un message de succès
      setSnackbar({ 
        open: true, 
        message: 'Paiement enregistré avec succès', 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('Erreur paiement:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.montant?.[0] || 
                          error.response?.data?.message ||
                          error.message ||
                          'Erreur lors de l\'enregistrement du paiement';
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePDF = (vente) => {
    // Logique pour générer PDF
    console.log('Générer PDF pour la vente:', vente);
    setSnackbar({
      open: true,
      message: 'Fonctionnalité PDF à implémenter',
      severity: 'info'
    });
  };

  const handleViewDetails = (vente) => {
    // Naviguer vers les détails de la vente
    navigate(`/ventes/${vente.id}`);
  };

  // Calculer les statistiques à partir des données de l'API ou des ventes
  const calculateStats = () => {
    if (statistiques) {
      return {
        total_achats: statistiques.total_achats || 0,
        total_paye: statistiques.total_paye || 0,
        solde_restant: statistiques.solde_restant || 0,
        nombre_ventes: statistiques.nombre_ventes || 0,
        ventes_en_retard: statistiques.ventes_en_retard || 0,
        ventes_payees: ventes.filter(v => v.statut_paiement === 'paye').length,
        ventes_impayees: ventes.filter(v => v.statut_paiement === 'non_paye').length,
        ventes_partiel: ventes.filter(v => v.statut_paiement === 'partiel').length,
        taux_paiement: statistiques.total_achats > 0 ? 
          (statistiques.total_paye / statistiques.total_achats) * 100 : 0
      };
    }

    // Fallback si les statistiques ne sont pas fournies
    const stats = {
      total_achats: ventes.reduce((sum, v) => sum + parseFloat(v.montant_total || 0), 0),
      total_paye: ventes.reduce((sum, v) => sum + parseFloat(v.montant_paye || 0), 0),
      solde_restant: ventes.reduce((sum, v) => sum + parseFloat((v.montant_total || 0) - (v.montant_paye || 0)), 0),
      nombre_ventes: ventes.length,
      ventes_en_retard: ventes.filter(v => {
        const joursRetard = calculerJoursRetard(v.date_echeance);
        return joursRetard > 0 && v.statut_paiement !== 'paye';
      }).length,
      ventes_payees: ventes.filter(v => v.statut_paiement === 'paye').length,
      ventes_impayees: ventes.filter(v => v.statut_paiement === 'non_paye').length,
      ventes_partiel: ventes.filter(v => v.statut_paiement === 'partiel').length
    };

    stats.taux_paiement = stats.total_achats > 0 ? 
      (stats.total_paye / stats.total_achats) * 100 : 0;

    return stats;
  };

  const stats = calculateStats();

  // Composant de carte de statistique
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${alpha(darkCyan, 0.1)} 0%, ${alpha(vividOrange, 0.05)} 100%)`,
      border: `1px solid ${alpha(darkCyan, 0.2)}`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(darkCyan, 0.15)}`,
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ color: darkCyan }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: darkCyan, mb: 0.5 }}>
          {typeof value === 'number' && (title.includes('Achat') || title.includes('Payé') || title.includes('Solde')) ? 
            `${formatNumber(value)} €` : value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={title.includes('Taux') ? stats.taux_paiement : 
                   title.includes('Payé') ? (stats.ventes_payees / stats.nombre_ventes * 100) || 0 : 
                   title.includes('Solde') ? Math.min(100, (stats.solde_restant / Math.max(stats.total_achats, 1)) * 100) || 0 : 30} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: alpha(darkCyan, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: color === 'primary' ? darkCyan : vividOrange,
                borderRadius: 3
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Filtrer les ventes selon l'onglet actif et les filtres
  const getFilteredVentes = () => {
    let filtered = ventes;

    // Appliquer le filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(vente =>
        (vente.numero_vente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vente.id.toString() || '').includes(searchTerm)
      );
    }

    // Appliquer le filtre de statut
    if (filterStatut) {
      filtered = filtered.filter(vente => vente.statut_paiement === filterStatut);
    }

    // Appliquer le filtre de l'onglet actif
    switch (activeTab) {
      case 1: // Ventes impayées
        filtered = filtered.filter(vente => vente.statut_paiement !== 'paye');
        break;
      case 2: // Ventes en retard
        filtered = filtered.filter(vente => {
          const joursRetard = calculerJoursRetard(vente.date_echeance);
          return joursRetard > 0 && vente.statut_paiement !== 'paye';
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredVentes = getFilteredVentes();

  // Pagination côté client pour le filtrage local
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const paginatedVentes = filteredVentes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Pagination côté serveur
  const handleServerPageChange = (event, newPage) => {
    const pageNumber = newPage + 1; // Convertir MUI (0-based) en API (1-based)
    fetchHistorique(pageNumber, rowsPerPage);
    setPage(newPage);
  };

  const getStatutPaiementColor = (statut) => {
    switch (statut) {
      case 'paye': return 'success';
      case 'partiel': return 'warning';
      case 'non_paye': return 'error';
      default: return 'default';
    }
  };

  const getStatutPaiementLabel = (statut) => {
    switch (statut) {
      case 'paye': return 'Payé';
      case 'partiel': return 'Partiel';
      case 'non_paye': return 'Non payé';
      default: return statut || 'Inconnu';
    }
  };

  const getPourcentagePaye = (vente) => {
    const total = parseFloat(vente.montant_total) || 0;
    const paye = parseFloat(vente.montant_paye) || 0;
    return total > 0 ? (paye / total) * 100 : 0;
  };

  const getModePaiementIcon = (mode) => {
    switch (mode) {
      case 'especes': return <LocalAtmIcon />;
      case 'carte_bancaire': return <CreditCardIcon />;
      case 'cheque': return <DescriptionIcon />;
      case 'virement': return <AccountBalanceIcon />;
      case 'mobile_money': return <PhoneAndroidIcon />;
      default: return <PaidIcon />;
    }
  };

  // Fonction pour debugger l'API
  const debugAPI = async () => {
    console.log('Test API avec client_id:', clientId);
    try {
      const response = await AxiosInstance.get(`historique-client/?client_id=${clientId}`);
      console.log('Structure réponse API:', response.data);
      console.log('Client:', response.data.client);
      console.log('Statistiques:', response.data.statistiques);
      console.log('Ventes:', response.data.ventes || response.data.results);
      console.log('Count:', response.data.count);
    } catch (error) {
      console.error('Debug erreur:', error);
    }
  };

  // Écran de sélection du client
  if (!clientId) {
    return (
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${darkCyan} 0%, ${vividOrange} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Historique Client
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
              Sélectionnez un client pour consulter son historique
            </Typography>
          </Box>
          <Tooltip title="Actualiser">
            <IconButton 
              onClick={fetchAllClients}
              sx={{ 
                bgcolor: alpha(darkCyan, 0.1),
                color: darkCyan,
                '&:hover': { bgcolor: alpha(darkCyan, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Card sx={{ 
          borderRadius: 3, 
          p: 3, 
          border: `1px solid ${alpha(darkCyan, 0.1)}`,
          backgroundColor: (theme) => theme.palette.background.paper
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: darkCyan, fontWeight: 600, mb: 3 }}>
            Rechercher un client
          </Typography>
          <Autocomplete
            options={allClients}
            getOptionLabel={(option) => `${option.nom} - ${option.telephone}`}
            loading={loadingClients}
            onChange={(event, value) => handleClientSelect(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rechercher par nom ou téléphone"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: darkCyan }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: darkCyan,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: vividOrange,
                    }
                  }
                }}
              />
            )}
          />
          
          {allClients.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: darkCyan, fontWeight: 600, mb: 2 }}>
                Liste des clients récents
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      backgroundColor: alpha(darkCyan, 0.04),
                      '& th': { 
                        fontWeight: 'bold', 
                        color: darkCyan,
                        borderBottom: `2px solid ${alpha(darkCyan, 0.2)}`
                      }
                    }}>
                      <TableCell>Nom</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allClients.slice(0, 10).map((clientItem) => (
                      <TableRow 
                        key={clientItem.id} 
                        hover
                        sx={{ 
                          '&:hover': {
                            backgroundColor: alpha(darkCyan, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: clientItem.type_client === 'professionnel' ? vividOrange : darkCyan,
                              width: 40,
                              height: 40,
                              fontWeight: 'bold'
                            }}>
                              {clientItem.nom?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="600" color={darkCyan}>
                              {clientItem.nom}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textPrimary">
                            {clientItem.telephone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textPrimary">
                            {clientItem.email || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={clientItem.type_client === 'professionnel' ? 'Pro' : 'Part'}
                            size="small"
                            sx={{
                              backgroundColor: clientItem.type_client === 'professionnel' ? 
                                alpha(vividOrange, 0.1) : alpha(darkCyan, 0.1),
                              color: clientItem.type_client === 'professionnel' ? vividOrange : darkCyan,
                              fontWeight: 600,
                              border: `1px solid ${clientItem.type_client === 'professionnel' ? 
                                alpha(vividOrange, 0.3) : alpha(darkCyan, 0.3)}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleClientSelect(clientItem)}
                            startIcon={<HistoryIcon />}
                            sx={{
                              borderColor: darkCyan,
                              color: darkCyan,
                              '&:hover': {
                                borderColor: vividOrange,
                                backgroundColor: alpha(vividOrange, 0.04)
                              }
                            }}
                          >
                            Voir historique
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Card>
      </Box>
    );
  }

  // Écran de chargement
  if (loading && ventes.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: darkCyan }} />
        <Typography variant="h6" color="textSecondary">
          Chargement en cours...
        </Typography>
      </Box>
    );
  }

  // Écran principal de l'historique
  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      backgroundColor: (theme) => theme.palette.background.default
    }}>
      {/* En-tête avec bouton retour */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Changer de client">
            <IconButton 
              onClick={() => {
                setClientId(null);
                setClient(null);
                setVentes([]);
                setStatistiques(null);
                setPage(0);
                navigate('/historique-client');
              }}
              sx={{ 
                bgcolor: alpha(darkCyan, 0.1),
                color: darkCyan,
                '&:hover': { bgcolor: alpha(darkCyan, 0.2) }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${darkCyan} 0%, ${vividOrange} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Historique Client
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
              {client?.nom || 'Informations du client'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Actualiser">
            <IconButton 
              onClick={fetchHistorique}
              sx={{ 
                bgcolor: alpha(darkCyan, 0.1),
                color: darkCyan,
                '&:hover': { bgcolor: alpha(darkCyan, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Debug API" onClick={debugAPI}>
            <IconButton 
              sx={{ 
                bgcolor: alpha('#9c27b0', 0.1),
                color: '#9c27b0',
                '&:hover': { bgcolor: alpha('#9c27b0', 0.2) }
              }}
            >
              <WarningIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Générer rapport">
            <Fab 
              size="medium"
              sx={{
                background: `linear-gradient(135deg, ${darkCyan} 0%, ${vividOrange} 100%)`,
                boxShadow: `0 4px 20px ${alpha(darkCyan, 0.3)}`,
                color: 'white',
                '&:hover': {
                  boxShadow: `0 8px 30px ${alpha(darkCyan, 0.4)}`,
                  background: `linear-gradient(135deg, #002429 0%, #C93A0A 100%)`
                }
              }}
            >
              <PrintIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>

      {/* En-tête client */}
      {client && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          border: `1px solid ${alpha(darkCyan, 0.1)}`,
          backgroundColor: (theme) => theme.palette.background.paper,
          background: `linear-gradient(135deg, ${alpha(darkCyan, 0.05)} 0%, ${alpha(vividOrange, 0.02)} 100%)`
        }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar sx={{ 
                  bgcolor: client?.type_client === 'professionnel' ? vividOrange : darkCyan,
                  width: 80,
                  height: 80,
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  border: `3px solid ${alpha(darkCyan, 0.2)}`,
                  boxShadow: `0 4px 12px ${alpha(darkCyan, 0.2)}`
                }}>
                  {client?.nom?.charAt(0) || <PersonIcon fontSize="large" />}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: darkCyan }}>
                  {client?.nom}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PhoneIcon fontSize="small" sx={{ color: darkCyan }} />
                      <Typography variant="body2" color="textPrimary" fontWeight="500">
                        {client?.telephone || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <EmailIcon fontSize="small" sx={{ color: darkCyan }} />
                      <Typography variant="body2" color="textPrimary" fontWeight="500">
                        {client?.email || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HomeIcon fontSize="small" sx={{ color: darkCyan }} />
                      <Typography variant="body2" color="textPrimary" fontWeight="500">
                        {client?.adresse || 'Non renseigné'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Chip 
                  label={client?.type_client === 'professionnel' ? 'Professionnel' : 'Particulier'} 
                  sx={{ 
                    fontSize: '0.9rem', 
                    px: 2,
                    py: 1,
                    backgroundColor: client?.type_client === 'professionnel' ? 
                      alpha(vividOrange, 0.1) : alpha(darkCyan, 0.1),
                    color: client?.type_client === 'professionnel' ? vividOrange : darkCyan,
                    fontWeight: 600,
                    border: `2px solid ${client?.type_client === 'professionnel' ? 
                      alpha(vividOrange, 0.3) : alpha(darkCyan, 0.3)}`
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ReceiptIcon sx={{ fontSize: 28 }} />}
            title="Total Achat"
            value={stats.total_achats}
            subtitle={`${stats.nombre_ventes} vente(s) trouvée(s)`}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PaidIcon sx={{ fontSize: 28 }} />}
            title="Total Payé"
            value={stats.total_paye}
            subtitle={`${stats.ventes_payees} Ventes Payées`}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<WalletIcon sx={{ fontSize: 28, color: stats.solde_restant > 0 ? 'warning.main' : 'success.main' }} />}
            title="Solde Restant"
            value={stats.solde_restant}
            subtitle={`${stats.ventes_impayees + stats.ventes_partiel} Ventes Impayées`}
            color={stats.solde_restant > 0 ? 'warning' : 'success'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: `linear-gradient(135deg, ${alpha(vividOrange, 0.1)} 0%, ${alpha(darkCyan, 0.05)} 100%)`,
            border: `1px solid ${alpha(vividOrange, 0.2)}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': { 
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(vividOrange, 0.15)}`,
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600 }}>
                  Taux de Paiement
                </Typography>
                <PaidIcon sx={{ color: vividOrange, fontSize: 20 }} />
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: vividOrange, mb: 0.5 }}>
                {stats.taux_paiement.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Progression moyenne
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.taux_paiement}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: alpha(vividOrange, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: vividOrange,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Card sx={{ 
        mb: 3, 
        p: 3, 
        borderRadius: 3, 
        border: `1px solid ${alpha(darkCyan, 0.1)}`,
        backgroundColor: (theme) => theme.palette.background.paper
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par numéro de vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: darkCyan }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: darkCyan,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: vividOrange,
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkCyan }}>Statut de paiement</InputLabel>
              <Select
                value={filterStatut}
                label="Statut de paiement"
                onChange={(e) => setFilterStatut(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(darkCyan, 0.5),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkCyan,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: vividOrange,
                  }
                }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="paye">Payé</MenuItem>
                <MenuItem value="partiel">Partiel</MenuItem>
                <MenuItem value="non_paye">Non payé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              {filteredVentes.length} vente(s) trouvée(s)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={filteredVentes.length > 0 ? Math.min(100, (filteredVentes.length / ventes.length) * 100) : 0} 
              sx={{ 
                mt: 1,
                height: 4, 
                borderRadius: 2,
                backgroundColor: alpha(darkCyan, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: vividOrange,
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterStatut('');
              }}
              sx={{ 
                height: '56px', 
                borderRadius: 2,
                borderColor: darkCyan,
                color: darkCyan,
                '&:hover': {
                  borderColor: vividOrange,
                  backgroundColor: alpha(vividOrange, 0.04)
                }
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        '& .MuiTab-root': {
          color: darkCyan,
          fontWeight: 500,
          '&.Mui-selected': {
            color: vividOrange,
            fontWeight: 600
          }
        }
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          TabIndicatorProps={{
            style: {
              backgroundColor: vividOrange,
              height: 3
            }
          }}
        >
          <Tab label="Toutes les ventes" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Ventes impayées" icon={<MoneyOffIcon />} iconPosition="start" />
          <Tab label="Ventes en retard" icon={<WarningIcon />} iconPosition="start" />
          <Tab label="Factures PDF" icon={<ReceiptLongIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tableau des ventes */}
      {activeTab < 3 && (
        <Card sx={{ 
          boxShadow: `0 4px 20px ${alpha(darkCyan, 0.1)}`, 
          borderRadius: 3, 
          overflow: 'hidden',
          border: `1px solid ${alpha(darkCyan, 0.1)}`,
          backgroundColor: (theme) => theme.palette.background.paper
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: alpha(darkCyan, 0.04),
                  '& th': { 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    color: darkCyan,
                    borderBottom: `2px solid ${alpha(darkCyan, 0.2)}`
                  }
                }}>
                  <TableCell>N° Vente</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Montant Total</TableCell>
                  <TableCell>Payé</TableCell>
                  <TableCell>Reste</TableCell>
                  <TableCell>Statut Paiement</TableCell>
                  <TableCell>Jours Retard</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedVentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          {searchTerm || filterStatut || activeTab > 0 ? 
                            'Aucune vente ne correspond aux filtres' : 
                            'Aucune vente trouvée pour ce client'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVentes.map((vente) => {
                    const pourcentagePaye = getPourcentagePaye(vente);
                    const statutLabel = getStatutPaiementLabel(vente.statut_paiement);
                    const statutColor = getStatutPaiementColor(vente.statut_paiement);
                    const joursRetard = calculerJoursRetard(vente.date_echeance);
                    const montantRestant = vente.montant_total - (vente.montant_paye || 0);
                    
                    return (
                      <TableRow 
                        key={vente.id} 
                        hover 
                        sx={{ 
                          '&:last-child td': { borderBottom: 0 },
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(darkCyan, 0.02),
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color={darkCyan}>
                            {vente.numero_vente || `Vente-${vente.id}`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="500" color="textPrimary">
                              {formatDate(vente.created_at)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(vente.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color={darkCyan}>
                            {formatNumber(vente.montant_total)} €
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="600">
                            {formatNumber(vente.montant_paye || 0)} €
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            color={montantRestant > 0 ? "warning.main" : "success.main"} 
                            fontWeight="600"
                          >
                            {formatNumber(montantRestant)} €
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={statutLabel}
                              color={statutColor}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                borderRadius: 1,
                                minWidth: 80
                              }}
                            />
                            {pourcentagePaye > 0 && pourcentagePaye < 100 && (
                              <Typography variant="caption" color="textSecondary">
                                ({pourcentagePaye.toFixed(0)}%)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {joursRetard > 0 && vente.statut_paiement !== 'paye' ? (
                            <Chip
                              label={`${joursRetard} jours`}
                              color="error"
                              size="small"
                              sx={{
                                fontWeight: 600,
                                borderRadius: 1
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Voir détails">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewDetails(vente)}
                                sx={{ 
                                  color: darkCyan,
                                  background: alpha(darkCyan, 0.1),
                                  '&:hover': { 
                                    background: alpha(darkCyan, 0.2),
                                    color: darkCyan
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {vente.statut_paiement !== 'paye' && (
                              <Tooltip title="Enregistrer paiement">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenPaiementDialog(vente)}
                                  sx={{ 
                                    color: vividOrange,
                                    background: alpha(vividOrange, 0.1),
                                    '&:hover': { 
                                      background: alpha(vividOrange, 0.2),
                                      color: vividOrange
                                    }
                                  }}
                                >
                                  <PaidIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Générer facture PDF">
                              <IconButton 
                                size="small"
                                onClick={() => handleGeneratePDF(vente)}
                                sx={{ 
                                  color: darkCyan,
                                  background: alpha(darkCyan, 0.1),
                                  '&:hover': { 
                                    background: alpha(darkCyan, 0.2),
                                    color: darkCyan
                                  }
                                }}
                              >
                                <ReceiptLongIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {filteredVentes.length > 0 && (
            <TablePagination
              component="div"
              count={filteredVentes.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} sur ${count}`
              }
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: darkCyan
                }
              }}
            />
          )}
        </Card>
      )}

      {/* Onglet Factures PDF */}
      {activeTab === 3 && (
        <Card sx={{ 
          p: 3, 
          borderRadius: 3,
          border: `1px solid ${alpha(darkCyan, 0.1)}`,
          backgroundColor: (theme) => theme.palette.background.paper
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: darkCyan, fontWeight: 600, mb: 3 }}>
            Factures PDF disponibles
          </Typography>
          {ventes.filter(v => v.facture).length === 0 ? (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(darkCyan, 0.05),
                border: `1px solid ${alpha(darkCyan, 0.2)}`
              }}
            >
              Aucune facture PDF générée pour ce client
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: alpha(darkCyan, 0.04),
                    '& th': { 
                      fontWeight: 'bold', 
                      color: darkCyan,
                      borderBottom: `2px solid ${alpha(darkCyan, 0.2)}`
                    }
                  }}>
                    <TableCell>Numéro Facture</TableCell>
                    <TableCell>Date Facture</TableCell>
                    <TableCell>Montant TTC</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventes
                    .filter(v => v.facture)
                    .map((vente) => (
                      <TableRow 
                        key={vente.id}
                        hover
                        sx={{ 
                          '&:hover': {
                            backgroundColor: alpha(darkCyan, 0.02)
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color={darkCyan}>
                            {vente.facture?.numero_facture}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {formatDate(vente.facture?.date_facture)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600" color={darkCyan}>
                            {formatNumber(parseFloat(vente.facture?.montant_ttc))} €
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={vente.facture?.envoye_email ? 'Envoyée' : 'Non envoyée'}
                            color={vente.facture?.envoye_email ? 'success' : 'default'}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: vente.facture?.envoye_email ? 
                                alpha('#4caf50', 0.1) : alpha(darkCyan, 0.1),
                              color: vente.facture?.envoye_email ? '#4caf50' : darkCyan,
                              border: `1px solid ${vente.facture?.envoye_email ? 
                                alpha('#4caf50', 0.3) : alpha(darkCyan, 0.3)}`
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleGeneratePDF(vente)}
                            sx={{
                              borderColor: darkCyan,
                              color: darkCyan,
                              '&:hover': {
                                borderColor: vividOrange,
                                backgroundColor: alpha(vividOrange, 0.04)
                              }
                            }}
                          >
                            Télécharger
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Dialog pour enregistrer un paiement */}
      <Dialog 
        open={openPaiementDialog} 
        onClose={() => setOpenPaiementDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            border: `1px solid ${alpha(darkCyan, 0.2)}`,
            backgroundColor: (theme) => theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${darkCyan} 0%, ${vividOrange} 100%)`,
          color: 'white',
          fontWeight: 'bold',
          borderBottom: `1px solid ${alpha(vividOrange, 0.3)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaidIcon />
            Enregistrer un paiement
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedVenteForPaiement && (
            <Box sx={{ pt: 2 }}>
              {/* Info vente */}
              <Card variant="outlined" sx={{ 
                mb: 3, 
                p: 2, 
                bgcolor: alpha(darkCyan, 0.05),
                border: `1px solid ${alpha(darkCyan, 0.2)}`,
                borderRadius: 2
              }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ color: darkCyan, fontWeight: 600 }}>
                  Informations de la vente
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong style={{ color: darkCyan }}>N° Vente:</strong> {selectedVenteForPaiement.numero_vente || `Vente-${selectedVenteForPaiement.id}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong style={{ color: darkCyan }}>Montant total:</strong> {formatNumber(selectedVenteForPaiement.montant_total)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong style={{ color: darkCyan }}>Déjà payé:</strong> {formatNumber(selectedVenteForPaiement.montant_paye || 0)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong style={{ color: darkCyan }}>Reste à payer:</strong> {formatNumber(selectedVenteForPaiement.montant_total - (selectedVenteForPaiement.montant_paye || 0))} €
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Formulaire paiement */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Montant à payer"
                    type="number"
                    value={formPaiement.montant}
                    onChange={(e) => setFormPaiement({...formPaiement, montant: e.target.value})}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EuroIcon sx={{ color: darkCyan }} />
                        </InputAdornment>
                      ),
                      inputProps: { 
                        min: 0.01,
                        max: selectedVenteForPaiement.montant_total - (selectedVenteForPaiement.montant_paye || 0),
                        step: 0.01
                      }
                    }}
                    helperText={`Maximum: ${formatNumber(selectedVenteForPaiement.montant_total - (selectedVenteForPaiement.montant_paye || 0))} €`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: darkCyan,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: vividOrange,
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: darkCyan }}>Mode de paiement</InputLabel>
                    <Select
                      value={formPaiement.mode_paiement}
                      label="Mode de paiement"
                      onChange={(e) => setFormPaiement({...formPaiement, mode_paiement: e.target.value})}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(darkCyan, 0.5),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkCyan,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: vividOrange,
                        }
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          {getModePaiementIcon(formPaiement.mode_paiement)}
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="especes">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalAtmIcon fontSize="small" />
                          Espèces
                        </Box>
                      </MenuItem>
                      <MenuItem value="carte_bancaire">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon fontSize="small" />
                          Carte bancaire
                        </Box>
                      </MenuItem>
                      <MenuItem value="cheque">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon fontSize="small" />
                          Chèque
                        </Box>
                      </MenuItem>
                      <MenuItem value="virement">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon fontSize="small" />
                          Virement
                        </Box>
                      </MenuItem>
                      <MenuItem value="mobile_money">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneAndroidIcon fontSize="small" />
                          Mobile Money
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Référence (numéro de chèque, virement...)"
                    value={formPaiement.reference}
                    onChange={(e) => setFormPaiement({...formPaiement, reference: e.target.value})}
                    placeholder="Ex: CHQ-001, VIR-2024-001"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: darkCyan,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: vividOrange,
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes (optionnel)"
                    multiline
                    rows={2}
                    value={formPaiement.notes}
                    onChange={(e) => setFormPaiement({...formPaiement, notes: e.target.value})}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: darkCyan,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: vividOrange,
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, borderTop: `1px solid ${alpha(darkCyan, 0.1)}` }}>
          <Button 
            onClick={() => setOpenPaiementDialog(false)}
            variant="outlined"
            disabled={submitting}
            sx={{ 
              borderRadius: 2,
              borderColor: darkCyan,
              color: darkCyan,
              '&:hover': {
                borderColor: vividOrange,
                backgroundColor: alpha(vividOrange, 0.04)
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleEnregistrerPaiement}
            variant="contained"
            disabled={!formPaiement.montant || parseFloat(formPaiement.montant) <= 0 || submitting}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${darkCyan} 0%, ${vividOrange} 100%)`,
              color: 'white',
              '&:disabled': {
                background: alpha(darkCyan, 0.3)
              }
            }}
            startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PaidIcon />}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
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
            maxWidth: 400,
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoriqueClient;