import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Divider,
  Badge,
  Grid
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon
} from '@mui/icons-material'

const AuditLog = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedLog, setSelectedLog] = useState(null)
  const [openDetails, setOpenDetails] = useState(false)
  const theme = useTheme()

  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    modele: '',
    dateDebut: '',
    dateFin: ''
  })

  // Options pour les filtres
  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    { value: 'creation', label: 'Création', color: 'success' },
    { value: 'modification', label: 'Modification', color: 'info' },
    { value: 'suppression', label: 'Suppression', color: 'error' },
    { value: 'vente', label: 'Vente', color: 'primary' },
    { value: 'mouvement_stock', label: 'Mouvement de stock', color: 'warning' },
    { value: 'connexion', label: 'Connexion', color: 'success' },
    { value: 'deconnexion', label: 'Déconnexion', color: 'secondary' }
  ]

  const modeleOptions = [
    { value: '', label: 'Tous les modèles' },
    { value: 'User', label: 'Utilisateur' },
    { value: 'Produit', label: 'Produit' },
    { value: 'Vente', label: 'Vente' },
    { value: 'Client', label: 'Client' },
    { value: 'Categorie', label: 'Catégorie' },
    { value: 'Fournisseur', label: 'Fournisseur' },
    { value: 'MouvementStock', label: 'Mouvement de Stock' }
  ]

  // Composant de carte de statistique amélioré
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary', trend }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
              color: 'white',
              borderRadius: 3,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  // Récupérer les logs d'audit
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = {}
      
      if (filters.search) params.search = filters.search
      if (filters.action) params.action = filters.action
      if (filters.modele) params.modele = filters.modele
      if (filters.dateDebut) params.date_debut = filters.dateDebut
      if (filters.dateFin) params.date_fin = filters.dateFin

      const response = await AxiosInstance.get('audit-logs/', { params })
      setLogs(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Appliquer les filtres
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyFilters = () => {
    setPage(0)
    fetchLogs()
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      action: '',
      modele: '',
      dateDebut: '',
      dateFin: ''
    })
    setPage(0)
    fetchLogs()
  }

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Ouvrir les détails d'un log
  const handleOpenDetails = (log) => {
    setSelectedLog(log)
    setOpenDetails(true)
  }

  const handleCloseDetails = () => {
    setOpenDetails(false)
    setSelectedLog(null)
  }

  // Obtenir les informations de l'action
  const getActionInfo = (action) => {
    return actionOptions.find(option => option.value === action) || actionOptions[0]
  }

  // Formater les détails JSON pour l'affichage
  const formatDetails = (details) => {
    if (!details) return 'Aucun détail'
    
    try {
      // Si c'est déjà une string, essayer de la parser
      if (typeof details === 'string') {
        try {
          const parsed = JSON.parse(details)
          return JSON.stringify(parsed, null, 2)
        } catch {
          return details
        }
      }
      
      // Si c'est un objet, le formater
      if (typeof details === 'object') {
        return JSON.stringify(details, null, 2)
      }
      
      return String(details)
    } catch (error) {
      console.error('Erreur de formatage des détails:', error)
      return 'Erreur d\'affichage des détails'
    }
  }

  // Extraire un résumé des détails pour l'affichage dans le tableau
  const getDetailsSummary = (details) => {
    if (!details) return 'Aucun détail'
    
    try {
      let detailsObj = details
      
      // Si c'est une string, essayer de parser
      if (typeof details === 'string') {
        try {
          detailsObj = JSON.parse(details)
        } catch {
          return details.length > 50 ? details.substring(0, 50) + '...' : details
        }
      }
      
      // Si c'est un objet, créer un résumé
      if (typeof detailsObj === 'object') {
        const entries = Object.entries(detailsObj)
        if (entries.length === 0) return 'Aucun détail'
        
        // Prendre les 2 premières propriétés pour le résumé
        const summary = entries.slice(0, 2).map(([key, value]) => {
          return `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
        }).join(', ')
        
        return entries.length > 2 ? summary + '...' : summary
      }
      
      return String(detailsObj)
    } catch (error) {
      return 'Détails non disponibles'
    }
  }

  // Statistiques
  const stats = {
    total: logs.length,
    aujourdhui: logs.filter(log => {
      const today = new Date().toDateString()
      const logDate = new Date(log.created_at).toDateString()
      return today === logDate
    }).length,
    creations: logs.filter(log => log.action === 'creation').length,
    modifications: logs.filter(log => log.action === 'modification').length,
    suppressions: logs.filter(log => log.action === 'suppression').length
  }

  // Avatar pour les logs
  const LogAvatar = ({ log }) => {
    const actionInfo = getActionInfo(log.action)
    return (
      <Avatar
        sx={{
          bgcolor: theme.palette[actionInfo.color || 'primary'].main,
          width: 40,
          height: 40
        }}
      >
        <SecurityIcon sx={{ fontSize: 20 }} />
      </Avatar>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Journal d'Audit
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Surveillance complète des activités du système
          </Typography>
        </Box>
        <Tooltip title="Actualiser les logs">
          <IconButton 
            onClick={fetchLogs} 
            color="primary"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<HistoryIcon sx={{ fontSize: 28 }} />}
            title="TOTAL LOGS"
            value={stats.total}
            subtitle="Événements enregistrés"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CalendarIcon sx={{ fontSize: 28 }} />}
            title="AUJOURD'HUI"
            value={stats.aujourdhui}
            subtitle="Événements du jour"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
            title="CRÉATIONS"
            value={stats.creations}
            subtitle="Nouveaux éléments"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<SecurityIcon sx={{ fontSize: 28 }} />}
            title="SUPPRESSIONS"
            value={stats.suppressions}
            subtitle="Éléments supprimés"
            color="error"
          />
        </Grid>
      </Grid>

      {/* Filtres améliorés */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtres de Recherche
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Rechercher dans les logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type d'action</InputLabel>
              <Select
                value={filters.action}
                label="Type d'action"
                onChange={(e) => handleFilterChange('action', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {actionOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.color && (
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: theme.palette[option.color].main
                          }}
                        />
                      )}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Modèle</InputLabel>
              <Select
                value={filters.modele}
                label="Modèle"
                onChange={(e) => handleFilterChange('modele', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {modeleOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Date début"
              type="date"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Date fin"
              type="date"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Appliquer
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={resetFilters}
            sx={{ borderRadius: 2 }}
          >
            Réinitialiser les filtres
          </Button>
        </Box>
      </Card>

      {/* Tableau des logs amélioré */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '& th': { 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem',
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }}>
                <TableCell>ÉVÉNEMENT</TableCell>
                <TableCell>UTILISATEUR</TableCell>
                <TableCell>ACTION</TableCell>
                <TableCell>MODÈLE</TableCell>
                <TableCell>OBJET</TableCell>
                <TableCell>DÉTAILS</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={60} />
                      <Typography variant="h6" color="textSecondary">
                        Chargement des logs d'audit...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {filters.search || filters.action || filters.modele || filters.dateDebut || filters.dateFin
                          ? 'Aucun log ne correspond aux critères de recherche'
                          : 'Aucun log d\'audit enregistré'
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!filters.search && !filters.action && !filters.modele && !filters.dateDebut && !filters.dateFin && 
                          'Les activités du système apparaîtront ici'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => {
                  const actionInfo = getActionInfo(log.action)
                  return (
                    <TableRow 
                      key={log.id} 
                      hover 
                      sx={{ 
                        '&:last-child td': { borderBottom: 0 },
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LogAvatar log={log} />
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {new Date(log.created_at).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500">
                            {log.user_email || 'Système'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={actionInfo.label}
                          color={actionInfo.color || 'primary'}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {log.modele}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.objet_id || 'N/A'}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={getDetailsSummary(log.details)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {getDetailsSummary(log.details)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Voir les détails complets">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDetails(log)}
                            sx={{ 
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count}`
          }
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </Card>

      {/* Dialog de détails amélioré */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Détails du Log d'Audit
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              {/* En-tête avec informations principales */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      ID du Log
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedLog.id}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Date et Heure
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {new Date(selectedLog.created_at).toLocaleString('fr-FR')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Utilisateur
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedLog.user_email || 'Système'}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Modèle
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedLog.modele}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Informations d'action */}
              <Card sx={{ mb: 3, p: 2, background: alpha(theme.palette.primary.main, 0.04) }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Type d'Action
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={getActionInfo(selectedLog.action).label}
                        color={getActionInfo(selectedLog.action).color || 'primary'}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      ID de l'Objet
                    </Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ mt: 1 }}>
                      {selectedLog.objet_id || 'Non spécifié'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Détails complets */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Détails Complets
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    backgroundColor: 'grey.50',
                    maxHeight: 400,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    borderRadius: 2
                  }}
                >
                  <pre style={{ margin: 0 }}>
                    {formatDetails(selectedLog.details)}
                  </pre>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AuditLog