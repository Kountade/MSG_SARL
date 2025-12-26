// src/components/RapportPaiements.jsx
import React, { useState, useEffect } from 'react';
import AxiosInstance from './AxiosInstance';
import {
  Box, Card, CardContent, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Chip, Button, Divider, TextField,
  FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tabs, Tab,
  IconButton, Tooltip, alpha
} from '@mui/material';
import {
  Paid as PaidIcon,
  MoneyOff as MoneyOffIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon,
  Euro as EuroIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const RapportPaiements = () => {
  const [loading, setLoading] = useState(true);
  const [rapportData, setRapportData] = useState(null);
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    mode_paiement: ''
  });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchRapport();
  }, []);

  const fetchRapport = async () => {
    try {
      let url = 'rapport-paiements/recouvrements/';
      const params = new URLSearchParams();
      
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.mode_paiement) params.append('mode_paiement', filters.mode_paiement);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await AxiosInstance.get(url);
      setRapportData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement des rapport:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchRapport();
  };

  const handleResetFilters = () => {
    setFilters({
      date_debut: '',
      date_fin: '',
      mode_paiement: ''
    });
    setLoading(true);
    fetchRapport();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Titre et boutons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Rapports de Paiements
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Analyse des recouvrements et des impayés
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Actualiser les données">
            <IconButton onClick={fetchRapport}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Exporter
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Imprimer
          </Button>
        </Box>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtres
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date de début"
              InputLabelProps={{ shrink: true }}
              value={filters.date_debut}
              onChange={(e) => handleFilterChange('date_debut', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date de fin"
              InputLabelProps={{ shrink: true }}
              value={filters.date_fin}
              onChange={(e) => handleFilterChange('date_fin', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Mode de paiement</InputLabel>
              <Select
                value={filters.mode_paiement}
                label="Mode de paiement"
                onChange={(e) => handleFilterChange('mode_paiement', e.target.value)}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="especes">Espèces</MenuItem>
                <MenuItem value="carte_bancaire">Carte bancaire</MenuItem>
                <MenuItem value="cheque">Chèque</MenuItem>
                <MenuItem value="virement">Virement</MenuItem>
                <MenuItem value="mobile_money">Mobile Money</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<FilterIcon />}
              >
                Appliquer
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: alpha('#4caf50', 0.1),
                  color: 'success.main'
                }}>
                  <PaidIcon />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Total Paiements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {parseFloat(rapportData.total_paiements || 0).toFixed(2)} €
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {rapportData.nombre_paiements || 0} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: alpha('#f44336', 0.1),
                  color: 'error.main'
                }}>
                  <MoneyOffIcon />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Montant Impayé
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {parseFloat(rapportData.impayes?.total || 0).toFixed(2)} €
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {rapportData.impayes?.nombre_ventes || 0} ventes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: alpha('#2196f3', 0.1),
                  color: 'primary.main'
                }}>
                  <TrendingUpIcon />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Taux de Recouvrement
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {rapportData.total_paiements && rapportData.impayes?.total 
                  ? ((rapportData.total_paiements / (rapportData.total_paiements + rapportData.impayes.total)) * 100).toFixed(1)
                  : 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Efficacité de recouvrement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: alpha('#ff9800', 0.1),
                  color: 'warning.main'
                }}>
                  <AccountBalanceIcon />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Moyenne par Transaction
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {rapportData.nombre_paiements > 0 
                  ? (rapportData.total_paiements / rapportData.nombre_paiements).toFixed(2)
                  : 0} €
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Par transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<BarChartIcon />} label="Par mode de paiement" />
          <Tab icon={<TimelineIcon />} label="Évolution quotidienne" />
          <Tab icon={<PieChartIcon />} label="Détails des impayés" />
        </Tabs>
      </Box>

      {/* Contenu des tabs */}
      {activeTab === 0 && (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Répartition par mode de paiement
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mode de paiement</TableCell>
                  <TableCell align="right">Nombre de transactions</TableCell>
                  <TableCell align="right">Montant total (€)</TableCell>
                  <TableCell align="right">Pourcentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rapportData.par_mode_paiement?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.mode_paiement === 'especes' && '💰'}
                        {item.mode_paiement === 'carte_bancaire' && '💳'}
                        {item.mode_paiement === 'cheque' && '📝'}
                        {item.mode_paiement === 'virement' && '🏦'}
                        {item.mode_paiement === 'mobile_money' && '📱'}
                        {item.mode_paiement === 'especes' ? 'Espèces' :
                         item.mode_paiement === 'carte_bancaire' ? 'Carte bancaire' :
                         item.mode_paiement === 'cheque' ? 'Chèque' :
                         item.mode_paiement === 'virement' ? 'Virement' :
                         item.mode_paiement === 'mobile_money' ? 'Mobile Money' : item.mode_paiement}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{parseFloat(item.total).toFixed(2)} €</TableCell>
                    <TableCell align="right">
                      {rapportData.total_paiements > 0 ? ((item.total / rapportData.total_paiements) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {activeTab === 1 && (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Évolution quotidienne des paiements
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Nombre de transactions</TableCell>
                  <TableCell align="right">Montant total (€)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rapportData.par_jour?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(item['date_paiement__date']).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{parseFloat(item.total).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {activeTab === 2 && (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Détail des ventes impayées
          </Typography>
          {rapportData.impayes?.ventes && rapportData.impayes.ventes.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Numéro Vente</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Montant Total</TableCell>
                    <TableCell>Montant Payé</TableCell>
                    <TableCell>Reste à Payer</TableCell>
                    <TableCell>Date Échéance</TableCell>
                    <TableCell>Jours Retard</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rapportData.impayes.ventes.map((vente) => (
                    <TableRow key={vente.id} hover>
                      <TableCell>{vente.numero_vente}</TableCell>
                      <TableCell>{vente.client_nom || 'Aucun'}</TableCell>
                      <TableCell>{parseFloat(vente.montant_total).toFixed(2)} €</TableCell>
                      <TableCell>{parseFloat(vente.montant_paye).toFixed(2)} €</TableCell>
                      <TableCell>
                        <Chip 
                          label={parseFloat(vente.montant_restant).toFixed(2) + ' €'} 
                          color="error" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {vente.date_echeance ? new Date(vente.date_echeance).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell>
                        {vente.jours_retard > 0 ? (
                          <Chip 
                            label={`${vente.jours_retard} jours`} 
                            color="error" 
                            size="small" 
                            variant="outlined"
                          />
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">
              Aucune vente impayée à afficher
            </Alert>
          )}
        </Card>
      )}
    </Box>
  );
};

export default RapportPaiements;