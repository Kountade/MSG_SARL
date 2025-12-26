// src/components/HistoriqueClient.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Grid,
  CircularProgress, Button, Divider, Avatar, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tabs, Tab, Autocomplete,
  IconButton, Tooltip, alpha, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  Timeline as TimelineIcon,
  Percent as PercentIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarTodayIcon,
  Euro as EuroIcon,
  AttachMoney as AttachMoneyIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  ReceiptLong as ReceiptLongIcon
} from '@mui/icons-material';

const HistoriqueClient = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(searchParams.get('client_id'));
  const [client, setClient] = useState(null);
  const [ventes, setVentes] = useState([]);
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
  const [selectedClient, setSelectedClient] = useState(null);

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
      setLoadingClients(false);
    }
  };

  const fetchHistorique = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`historique-client/?client_id=${clientId}`);
      setClient(response.data.client);
      setVentes(response.data.ventes || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setLoading(false);
    }
  };

  const handleClientSelect = (client) => {
    if (client) {
      setSelectedClient(client);
      setClientId(client.id);
      // Mettre à jour l'URL avec le client_id
      navigate(`/historique-client?client_id=${client.id}`);
    }
  };

  const handleOpenPaiementDialog = (vente) => {
    setSelectedVenteForPaiement(vente);
    setFormPaiement({
      montant: vente.montant_restant || '',
      mode_paiement: 'especes',
      reference: '',
      notes: ''
    });
    setOpenPaiementDialog(true);
  };

  const handleEnregistrerPaiement = async () => {
    if (!selectedVenteForPaiement) return;
    
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
      alert('Paiement enregistré avec succès');
      
    } catch (error) {
      console.error('Erreur paiement:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.montant?.[0] || 
                          'Erreur lors de l\'enregistrement du paiement';
      alert(errorMessage);
    }
  };

  const handleGeneratePDF = (vente) => {
    // Logique pour générer PDF (à implémenter)
    console.log('Générer PDF pour la vente:', vente);
  };

  const handleViewDetails = (vente) => {
    // Naviguer vers les détails de la vente
    navigate(`/ventes/${vente.id}`);
  };

  // Calculer les totaux
  const stats = {
    total_achats: ventes.reduce((sum, v) => sum + parseFloat(v.montant_total || 0), 0),
    total_paye: ventes.reduce((sum, v) => sum + parseFloat(v.montant_paye || 0), 0),
    solde_restant: ventes.reduce((sum, v) => sum + parseFloat(v.montant_restant || 0), 0),
    nombre_ventes: ventes.length,
    ventes_payees: ventes.filter(v => v.statut_paiement === 'paye').length,
    ventes_impayees: ventes.filter(v => v.statut_paiement === 'non_paye').length,
    ventes_partiel: ventes.filter(v => v.statut_paiement === 'partiel').length,
    ventes_en_retard: ventes.filter(v => v.jours_retard > 0).length
  };

  // Filtrer les ventes selon l'onglet actif et les filtres
  const getFilteredVentes = () => {
    let filtered = ventes;

    // Appliquer le filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(vente =>
        vente.numero_vente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vente.statut_paiement_display?.toLowerCase().includes(searchTerm.toLowerCase())
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
        filtered = filtered.filter(vente => vente.jours_retard > 0);
        break;
      case 3: // Ventes confirmées
        filtered = filtered.filter(vente => vente.statut === 'confirmee');
        break;
      default:
        break;
    }

    return filtered;
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const getStatutPaiementColor = (statut) => {
    switch (statut) {
      case 'paye': return 'success';
      case 'partiel': return 'warning';
      case 'non_paye': return 'error';
      case 'retard': return 'error';
      default: return 'default';
    }
  };

  const getStatutPaiementLabel = (statut) => {
    switch (statut) {
      case 'paye': return 'Payé';
      case 'partiel': return 'Partiel';
      case 'non_paye': return 'Non payé';
      case 'retard': return 'En retard';
      default: return statut;
    }
  };

  // Écran de sélection du client
  if (!clientId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Historique Client
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Sélectionnez un client pour consulter son historique
        </Typography>
        
        <Card sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
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
                  endAdornment: (
                    <>
                      {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          
          {allClients.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Liste des clients récents
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allClients.slice(0, 10).map((clientItem) => (
                      <TableRow key={clientItem.id} hover>
                        <TableCell>{clientItem.nom}</TableCell>
                        <TableCell>{clientItem.telephone}</TableCell>
                        <TableCell>{clientItem.email || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={clientItem.type_client === 'professionnel' ? 'Pro' : 'Part'}
                            size="small"
                            color={clientItem.type_client === 'professionnel' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleClientSelect(clientItem)}
                            startIcon={<HistoryIcon />}
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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Écran principal de l'historique
  return (
    <Box sx={{ p: 3 }}>
      {/* Bouton retour */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          setClientId(null);
          setClient(null);
          setVentes([]);
          navigate('/historique-client');
        }}
        sx={{ mb: 2 }}
      >
        Changer de client
      </Button>

      {/* En-tête client */}
      <Card sx={{ mb: 3, borderRadius: 2, bgcolor: alpha('#2196f3', 0.05) }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main', width: 70, height: 70 }}>
                {client?.nom?.charAt(0) || <PersonIcon fontSize="large" />}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {client?.nom}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client?.telephone || 'Non renseigné'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client?.email || 'Non renseigné'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <HomeIcon fontSize="small" color="action" />
                    <Typography variant="body2">{client?.adresse || 'Non renseigné'}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Chip 
                label={client?.type_client === 'professionnel' ? 'Professionnel' : 'Particulier'} 
                color={client?.type_client === 'professionnel' ? 'primary' : 'default'}
                icon={client?.type_client === 'professionnel' ? <BusinessIcon /> : <PersonIcon />}
                sx={{ fontSize: '0.9rem', px: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">
                Total Achat
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {formatNumber(stats.total_achats)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">
                Total Payé
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatNumber(stats.total_paye)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">
                Solde Restant
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: stats.solde_restant > 0 ? 'warning.main' : 'success.main' }}>
                {formatNumber(stats.solde_restant)} €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" variant="body2">
                Nombre de Ventes
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {stats.nombre_ventes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par numéro de vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Statut de paiement</InputLabel>
              <Select
                value={filterStatut}
                label="Statut de paiement"
                onChange={(e) => setFilterStatut(e.target.value)}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="paye">Payé</MenuItem>
                <MenuItem value="partiel">Partiel</MenuItem>
                <MenuItem value="non_paye">Non payé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterStatut('');
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Toutes les ventes" />
          <Tab label="Ventes impayées" />
          <Tab label="Ventes en retard" />
          <Tab label="Factures PDF" />
        </Tabs>
      </Box>

      {/* Tableau des ventes */}
      {activeTab < 3 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Vente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payé</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reste</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut Paiement</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jours Retard</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredVentes().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {ventes.length === 0 ? 'Aucune vente trouvée pour ce client' : 'Aucune vente ne correspond aux filtres'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredVentes().map((vente) => (
                  <TableRow key={vente.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {vente.numero_vente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {formatNumber(parseFloat(vente.montant_total))} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="600">
                        {formatNumber(parseFloat(vente.montant_paye))} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={vente.montant_restant > 0 ? "warning.main" : "success.main"} 
                        fontWeight="600"
                      >
                        {formatNumber(parseFloat(vente.montant_restant))} €
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getStatutPaiementLabel(vente.statut_paiement)}
                          color={getStatutPaiementColor(vente.statut_paiement)}
                          size="small"
                          icon={
                            vente.statut_paiement === 'paye' ? <PaidIcon /> :
                            vente.statut_paiement === 'partiel' ? <AttachMoneyIcon /> :
                            <MoneyOffIcon />
                          }
                        />
                        {vente.pourcentage_paye > 0 && vente.pourcentage_paye < 100 && (
                          <Typography variant="caption" color="textSecondary">
                            ({vente.pourcentage_paye?.toFixed(0)}%)
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {vente.jours_retard > 0 ? (
                        <Chip
                          label={`${vente.jours_retard} jours`}
                          color="error"
                          size="small"
                          icon={<AccessTimeIcon />}
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir détails">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewDetails(vente)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {vente.statut_paiement !== 'paye' && (
                          <Tooltip title="Enregistrer paiement">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleOpenPaiementDialog(vente)}
                            >
                              <PaidIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Générer facture PDF">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleGeneratePDF(vente)}
                          >
                            <ReceiptLongIcon />
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
      )}

      {/* Onglet Factures PDF */}
      {activeTab === 3 && (
        <Card sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Factures PDF disponibles
          </Typography>
          {ventes.filter(v => v.facture).length === 0 ? (
            <Alert severity="info">
              Aucune facture PDF générée pour ce client
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Numéro Facture</TableCell>
                    <TableCell>Date Facture</TableCell>
                    <TableCell>Montant TTC</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventes
                    .filter(v => v.facture)
                    .map((vente) => (
                      <TableRow key={vente.id}>
                        <TableCell>{vente.facture?.numero_facture}</TableCell>
                        <TableCell>
                          {new Date(vente.facture?.date_facture).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {formatNumber(parseFloat(vente.facture?.montant_ttc))} €
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={vente.facture?.envoye_email ? 'Envoyée' : 'Non envoyée'}
                            color={vente.facture?.envoye_email ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleGeneratePDF(vente)}
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
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaidIcon color="primary" />
            Enregistrer un paiement
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVenteForPaiement && (
            <Box sx={{ pt: 2 }}>
              {/* Info vente */}
              <Card variant="outlined" sx={{ mb: 3, p: 2, bgcolor: alpha('#2196f3', 0.05) }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Informations de la vente
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>N° Vente:</strong> {selectedVenteForPaiement.numero_vente}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Montant total:</strong> {formatNumber(selectedVenteForPaiement.montant_total)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Déjà payé:</strong> {formatNumber(selectedVenteForPaiement.montant_paye)} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Reste à payer:</strong> {formatNumber(selectedVenteForPaiement.montant_restant)} €
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
                      startAdornment: <EuroIcon color="action" />,
                      inputProps: { 
                        min: 0.01,
                        max: parseFloat(selectedVenteForPaiement.montant_restant),
                        step: 0.01
                      }
                    }}
                    helperText={`Maximum: ${formatNumber(selectedVenteForPaiement.montant_restant)} €`}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Mode de paiement</InputLabel>
                    <Select
                      value={formPaiement.mode_paiement}
                      label="Mode de paiement"
                      onChange={(e) => setFormPaiement({...formPaiement, mode_paiement: e.target.value})}
                    >
                      <MenuItem value="especes">Espèces</MenuItem>
                      <MenuItem value="carte_bancaire">Carte bancaire</MenuItem>
                      <MenuItem value="cheque">Chèque</MenuItem>
                      <MenuItem value="virement">Virement</MenuItem>
                      <MenuItem value="mobile_money">Mobile Money</MenuItem>
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
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenPaiementDialog(false)}
            color="inherit"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleEnregistrerPaiement}
            variant="contained"
            color="success"
            disabled={!formPaiement.montant || parseFloat(formPaiement.montant) <= 0}
            startIcon={<PaidIcon />}
          >
            Enregistrer le paiement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoriqueClient;