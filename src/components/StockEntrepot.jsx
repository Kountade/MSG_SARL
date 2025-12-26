// src/components/StockEntrepot.jsx (notez le nom SINGULIER)
import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState } from 'react'
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
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  TablePagination,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warehouse as WarehouseIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SyncAlt as SyncAltIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Euro as EuroIcon
} from '@mui/icons-material'

const StockEntrepot = () => {  // Notez le nom SINGULIER
  const [stocks, setStocks] = useState([])
  const [entrepots, setEntrepots] = useState([])
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEntrepot, setFilterEntrepot] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedStock, setSelectedStock] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState('table') // 'table' ou 'card'
  const theme = useTheme()

  // Formulaire stock
  const [formData, setFormData] = useState({
    entrepot: '',
    produit: '',
    quantite: '',
    quantite_reservee: 0,
    stock_alerte: 5,
    emplacement: ''
  })

  // Validation des erreurs
  const [errors, setErrors] = useState({})

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Début du chargement des données StockEntrepot...')
      
      // Récupérer les stocks
      const stocksResponse = await AxiosInstance.get('stock-entrepot/')
      console.log('✅ Stocks chargés:', stocksResponse.data.length)
      setStocks(stocksResponse.data)

      // Récupérer les entrepôts actifs
      const entrepotsResponse = await AxiosInstance.get('entrepots/')
      const entrepotsActifs = entrepotsResponse.data.filter(e => e.actif)
      console.log('✅ Entrepôts actifs chargés:', entrepotsActifs.length)
      setEntrepots(entrepotsActifs)

      // Récupérer les produits
      const produitsResponse = await AxiosInstance.get('produits/')
      console.log('✅ Produits chargés:', produitsResponse.data.length)
      setProduits(produitsResponse.data)

      setLoading(false)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données StockEntrepot:', error)
      console.error('❌ Détails erreur:', error.response?.data)
      
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du chargement des données. Veuillez vérifier votre connexion.', 
        severity: 'error' 
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.entrepot) {
      newErrors.entrepot = 'L\'entrepôt est obligatoire'
    }
    
    if (!formData.produit) {
      newErrors.produit = 'Le produit est obligatoire'
    }
    
    if (formData.quantite === '' || isNaN(formData.quantite)) {
      newErrors.quantite = 'La quantité est obligatoire et doit être un nombre'
    } else if (parseInt(formData.quantite) < 0) {
      newErrors.quantite = 'La quantité ne peut pas être négative'
    }
    
    if (formData.stock_alerte && (isNaN(formData.stock_alerte) || parseInt(formData.stock_alerte) < 1)) {
      newErrors.stock_alerte = 'Le seuil d\'alerte doit être supérieur à 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Ouvrir le dialog pour ajouter/modifier un stock
  const handleOpenDialog = (stock = null) => {
    setErrors({})
    
    if (stock) {
      setFormData({
        entrepot: stock.entrepot,
        produit: stock.produit,
        quantite: stock.quantite,
        quantite_reservee: stock.quantite_reservee || 0,
        stock_alerte: stock.stock_alerte || 5,
        emplacement: stock.emplacement || ''
      })
      setSelectedStock(stock)
    } else {
      setFormData({
        entrepot: '',
        produit: '',
        quantite: '',
        quantite_reservee: 0,
        stock_alerte: 5,
        emplacement: ''
      })
      setSelectedStock(null)
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedStock(null)
    setErrors({})
  }

  // Ouvrir le dialog de suppression
  const handleOpenDeleteDialog = (stock) => {
    setSelectedStock(stock)
    setOpenDeleteDialog(true)
  }

  // Fermer le dialog de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedStock(null)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Soumettre le formulaire (création ou modification)
  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Veuillez corriger les erreurs dans le formulaire', 
        severity: 'error' 
      })
      return
    }

    try {
      const submitData = {
        ...formData,
        quantite: parseInt(formData.quantite),
        quantite_reservee: parseInt(formData.quantite_reservee) || 0,
        stock_alerte: parseInt(formData.stock_alerte) || 5,
        emplacement: formData.emplacement || null
      }

      if (selectedStock) {
        // Modification
        await AxiosInstance.put(`stock-entrepot/${selectedStock.id}/`, submitData)
        setSnackbar({ 
          open: true, 
          message: 'Stock modifié avec succès', 
          severity: 'success' 
        })
      } else {
        // Création
        await AxiosInstance.post('stock-entrepot/', submitData)
        setSnackbar({ 
          open: true, 
          message: 'Stock créé avec succès', 
          severity: 'success' 
        })
      }

      fetchData()
      handleCloseDialog()
    } catch (error) {
      console.error('❌ Erreur:', error.response?.data || error.message)
      
      let errorMessage = 'Erreur lors de l\'opération'
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).flat().join(', ')
        } else {
          errorMessage = error.response.data
        }
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      })
    }
  }

  // Supprimer un stock
  const handleDelete = async () => {
    if (!selectedStock) return

    try {
      await AxiosInstance.delete(`stock-entrepot/${selectedStock.id}/`)
      setSnackbar({ 
        open: true, 
        message: 'Stock supprimé avec succès', 
        severity: 'success' 
      })
      fetchData()
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('❌ Erreur:', error)
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors de la suppression', 
        severity: 'error' 
      })
    }
  }

  // Ajuster le stock (entrée/sortie)
  const handleAdjustStock = async (stockId, type, quantite) => {
    const stock = stocks.find(s => s.id === stockId)
    if (!stock) return

    const quantiteNum = parseInt(quantite)
    if (isNaN(quantiteNum) || quantiteNum <= 0) {
      setSnackbar({ 
        open: true, 
        message: 'Quantité invalide', 
        severity: 'error' 
      })
      return
    }

    try {
      let newQuantite = stock.quantite
      if (type === 'entree') {
        newQuantite += quantiteNum
      } else if (type === 'sortie') {
        newQuantite = Math.max(0, newQuantite - quantiteNum)
      }

      await AxiosInstance.patch(`stock-entrepot/${stockId}/`, { 
        quantite: newQuantite 
      })
      
      setSnackbar({ 
        open: true, 
        message: `Stock ${type === 'entree' ? 'augmenté' : 'diminué'} avec succès`, 
        severity: 'success' 
      })
      fetchData()
    } catch (error) {
      console.error('❌ Erreur:', error)
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors de l\'ajustement du stock', 
        severity: 'error' 
      })
    }
  }

  // Filtrer les stocks
  const getFilteredStocks = () => {
    let filtered = stocks
    
    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.produit_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.produit_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.entrepot_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.emplacement?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtrer par entrepôt
    if (filterEntrepot) {
      filtered = filtered.filter(stock => stock.entrepot == filterEntrepot)
    }
    
    // Filtrer par statut selon l'onglet
    if (selectedTab === 1) { // Stocks faibles
      filtered = filtered.filter(stock => stock.stock_faible && !stock.en_rupture)
    } else if (selectedTab === 2) { // Ruptures
      filtered = filtered.filter(stock => stock.en_rupture)
    } else if (selectedTab === 3) { // Réservés
      filtered = filtered.filter(stock => stock.quantite_reservee > 0)
    }
    
    // Filtrer par statut sélectionné
    if (filterStatut === 'faible') {
      filtered = filtered.filter(stock => stock.stock_faible && !stock.en_rupture)
    } else if (filterStatut === 'rupture') {
      filtered = filtered.filter(stock => stock.en_rupture)
    } else if (filterStatut === 'normal') {
      filtered = filtered.filter(stock => !stock.stock_faible && !stock.en_rupture)
    } else if (filterStatut === 'reserve') {
      filtered = filtered.filter(stock => stock.quantite_reservee > 0)
    }
    
    return filtered
  }

  const filteredStocks = getFilteredStocks()

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Données paginées
  const paginatedStocks = filteredStocks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Statistiques
  const stats = {
    total: stocks.length,
    faible: stocks.filter(s => s.stock_faible && !s.en_rupture).length,
    rupture: stocks.filter(s => s.en_rupture).length,
    reserve: stocks.filter(s => s.quantite_reservee > 0).length,
    quantite_totale: stocks.reduce((sum, s) => sum + (s.quantite || 0), 0),
    quantite_reservee: stocks.reduce((sum, s) => sum + (s.quantite_reservee || 0), 0),
    quantite_disponible: stocks.reduce((sum, s) => sum + ((s.quantite || 0) - (s.quantite_reservee || 0)), 0),
    valeur_totale: stocks.reduce((sum, s) => {
      const produit = produits.find(p => p.id === s.produit)
      return sum + ((s.quantite || 0) * (produit?.prix_achat || 0))
    }, 0)
  }

  // Obtenir la couleur selon le statut du stock
  const getStockColor = (stock) => {
    if (stock.en_rupture) return 'error'
    if (stock.stock_faible) return 'warning'
    return 'success'
  }

  // Obtenir l'icône selon le statut
  const getStockIcon = (stock) => {
    if (stock.en_rupture) return <CancelIcon />
    if (stock.stock_faible) return <WarningIcon />
    return <CheckCircleIcon />
  }

  // Obtenir le libellé du statut
  const getStockLabel = (stock) => {
    if (stock.en_rupture) return 'Rupture'
    if (stock.stock_faible) return 'Stock faible'
    return 'Normal'
  }

  // Calculer le pourcentage d'utilisation du stock
  const getStockPercentage = (stock) => {
    if (!stock.stock_alerte || stock.stock_alerte === 0) return 0
    const pourcentage = (stock.quantite_disponible / stock.stock_alerte) * 100
    return Math.min(100, pourcentage)
  }

  // Composant de barre de progression
  const StockProgressBar = ({ stock }) => {
    const percentage = getStockPercentage(stock)
    const color = getStockColor(stock)
    
    return (
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="textSecondary">
            {stock.quantite_disponible} / {stock.stock_alerte}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {Math.round(percentage)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: alpha(theme.palette[color].main, 0.1)
          }}
        />
      </Box>
    )
  }

  // Avatar pour l'entrepôt
  const EntrepotAvatar = ({ nom }) => (
    <Avatar sx={{ 
      bgcolor: theme.palette.primary.main,
      width: 40,
      height: 40,
      fontSize: '1rem',
      fontWeight: 'bold'
    }}>
      {nom ? nom.charAt(0).toUpperCase() : 'E'}
    </Avatar>
  )

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
          Chargement des stocks...
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Veuillez patienter pendant le chargement des données
        </Typography>
      </Box>
    )
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
            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textFillColor: 'transparent'
          }}>
            Gestion des Stocks par Entrepôt
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Suivez et gérez les stocks de vos produits dans chaque entrepôt
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
                checked={viewMode === 'card'}
                onChange={(e) => setViewMode(e.target.checked ? 'card' : 'table')}
                color="primary"
              />
            }
            label={viewMode === 'card' ? 'Vue cartes' : 'Vue tableau'}
          />
          
          <Tooltip title="Ajouter un nouveau stock">
            <Fab 
              color="primary" 
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                boxShadow: '0 3px 15px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Box>

      {/* Onglets */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => {
            setSelectedTab(newValue)
            setPage(0)
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 64 }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <InventoryIcon />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold">
                    Tous les stocks
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.total} produits
                  </Typography>
                </Box>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <WarningIcon color="warning" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    Stocks faibles
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.faible} alertes
                  </Typography>
                </Box>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CancelIcon color="error" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    Ruptures
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.rupture} produits
                  </Typography>
                </Box>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <SyncAltIcon color="info" />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="bold" color="info.main">
                    Réservés
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.reserve} produits
                  </Typography>
                </Box>
              </Box>
            }
          />
        </Tabs>
      </Card>

      {/* Cartes de statistiques */}
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
                    STOCK TOTAL
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stats.quantite_totale}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    unités en stock
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}>
                  <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    DISPONIBLE
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.quantite_disponible}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    unités disponibles
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
            bgcolor: alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    RÉSERVÉ
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {stats.quantite_reservee}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    unités réservées
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                }}>
                  <SyncAltIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                    VALEUR TOTALE
                  </Typography>
                  <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {stats.valeur_totale.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    valeur du stock
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.secondary.main, 0.1)
                }}>
                  <EuroIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de filtres */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par produit, code, entrepôt..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(0)
              }}
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
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrer par entrepôt</InputLabel>
              <Select
                value={filterEntrepot}
                label="Filtrer par entrepôt"
                onChange={(e) => {
                  setFilterEntrepot(e.target.value)
                  setPage(0)
                }}
              >
                <MenuItem value="">Tous les entrepôts</MenuItem>
                {entrepots.map((entrepot) => (
                  <MenuItem key={entrepot.id} value={entrepot.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarehouseIcon fontSize="small" />
                      {entrepot.nom}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('')
                  setFilterEntrepot('')
                  setFilterStatut('')
                  setSelectedTab(0)
                  setPage(0)
                }}
                sx={{ flex: 1 }}
              >
                Réinitialiser
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Affichage selon le mode */}
      {viewMode === 'card' ? (
        // Vue Cartes
        <Grid container spacing={3}>
          {paginatedStocks.map((stock) => {
            const stockColor = getStockColor(stock)
            const stockIcon = getStockIcon(stock)
            const stockLabel = getStockLabel(stock)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={stock.id}>
                <Card sx={{ 
                  height: '100%',
                  border: `2px solid ${theme.palette[stockColor].main}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                    transform: 'translateY(-6px)'
                  }
                }}>
                  <CardContent>
                    {/* En-tête */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      mb: 2 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <EntrepotAvatar nom={stock.entrepot_nom} />
                        <Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                            {stock.entrepot_nom}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Entrepôt
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={stockIcon}
                        label={stockLabel}
                        color={stockColor}
                        size="small"
                        sx={{ fontWeight: 'bold', ml: 1 }}
                      />
                    </Box>

                    {/* Informations produit */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {stock.produit_nom}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Code: {stock.produit_code}
                      </Typography>
                      {stock.emplacement && (
                        <Typography variant="body2" color="textSecondary">
                          📍 {stock.emplacement}
                        </Typography>
                      )}
                    </Box>

                    {/* Statistiques stock */}
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                              {stock.quantite}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                              {stock.quantite_reservee || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Réservé
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold"
                              color={
                                stock.quantite_disponible <= 0 ? 'error' :
                                stock.quantite_disponible <= stock.stock_alerte ? 'warning' : 'success'
                              }
                            >
                              {stock.quantite_disponible}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Disponible
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Barre de progression */}
                    <Box sx={{ mb: 2 }}>
                      <StockProgressBar stock={stock} />
                    </Box>

                    {/* Seuil d'alerte */}
                    <Typography variant="caption" color="textSecondary">
                      Alerte: {stock.stock_alerte} unités
                    </Typography>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Ajouter du stock">
                          <IconButton 
                            size="small"
                            color="success"
                            onClick={() => {
                              const quantite = prompt('Quantité à ajouter:', '1')
                              if (quantite) {
                                handleAdjustStock(stock.id, 'entree', quantite)
                              }
                            }}
                            sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                            }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Retirer du stock">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => {
                              const quantite = prompt('Quantité à retirer:', '1')
                              if (quantite) {
                                handleAdjustStock(stock.id, 'sortie', quantite)
                              }
                            }}
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                            }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(stock)}
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
                            onClick={() => handleOpenDeleteDialog(stock)}
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
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        // Vue Tableau
        <>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 2, mb: 2 }}>
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
                    <TableCell>PRODUIT</TableCell>
                    <TableCell>STATUT</TableCell>
                    <TableCell align="center">STOCK TOTAL</TableCell>
                    <TableCell align="center">RÉSERVÉ</TableCell>
                    <TableCell align="center">DISPONIBLE</TableCell>
                    <TableCell>NIVEAU</TableCell>
                    <TableCell>EMPLACEMENT</TableCell>
                    <TableCell align="center">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            {searchTerm || filterEntrepot || selectedTab > 0 
                              ? 'Aucun stock trouvé' 
                              : 'Aucun stock enregistré'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {!searchTerm && !filterEntrepot && selectedTab === 0 
                              ? 'Commencez par créer votre premier stock' 
                              : 'Essayez de modifier vos critères de recherche'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStocks.map((stock) => {
                      const stockColor = getStockColor(stock)
                      const stockIcon = getStockIcon(stock)
                      const stockLabel = getStockLabel(stock)
                      
                      return (
                        <TableRow 
                          key={stock.id} 
                          hover 
                          sx={{ 
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.02)
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <EntrepotAvatar nom={stock.entrepot_nom} />
                              <Typography variant="body2" fontWeight="600">
                                {stock.entrepot_nom}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {stock.produit_nom}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Code: {stock.produit_code}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              icon={stockIcon}
                              label={stockLabel}
                              color={stockColor}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          
                          <TableCell align="center">
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {stock.quantite}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Typography variant="body1" fontWeight="bold" color="warning.main">
                              {stock.quantite_reservee || 0}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={
                                stock.quantite_disponible <= 0 ? 'error' :
                                stock.quantite_disponible <= stock.stock_alerte ? 'warning' : 'success'
                              }
                            >
                              {stock.quantite_disponible}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ width: 120 }}>
                              <StockProgressBar stock={stock} />
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {stock.emplacement || 'Non spécifié'}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Ajouter du stock">
                                <IconButton 
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    const quantite = prompt('Quantité à ajouter:', '1')
                                    if (quantite) {
                                      handleAdjustStock(stock.id, 'entree', quantite)
                                    }
                                  }}
                                >
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Retirer du stock">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const quantite = prompt('Quantité à retirer:', '1')
                                    if (quantite) {
                                      handleAdjustStock(stock.id, 'sortie', quantite)
                                    }
                                  }}
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Modifier">
                                <IconButton 
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(stock)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
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
              component="div"
              count={filteredStocks.length}
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

      {/* Message si aucun stock */}
      {filteredStocks.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="textSecondary">
            Aucun stock trouvé
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {searchTerm || filterEntrepot || selectedTab > 0 
              ? 'Aucun stock ne correspond à vos critères de recherche' 
              : 'Commencez par créer votre premier stock'}
          </Typography>
          {!searchTerm && !filterEntrepot && selectedTab === 0 && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
              }}
            >
              Créer un stock
            </Button>
          )}
        </Box>
      )}

      {/* Dialog pour ajouter/modifier un stock */}
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
            <InventoryIcon />
            {selectedStock ? 'Modifier le stock' : 'Nouveau stock'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.entrepot}>
                <InputLabel>Entrepôt *</InputLabel>
                <Select
                  name="entrepot"
                  value={formData.entrepot}
                  label="Entrepôt *"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Sélectionner un entrepôt</MenuItem>
                  {entrepots.map((entrepot) => (
                    <MenuItem key={entrepot.id} value={entrepot.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarehouseIcon fontSize="small" />
                        {entrepot.nom}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.entrepot && (
                  <Typography variant="caption" color="error">
                    {errors.entrepot}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.produit}>
                <InputLabel>Produit *</InputLabel>
                <Select
                  name="produit"
                  value={formData.produit}
                  label="Produit *"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Sélectionner un produit</MenuItem>
                  {produits.map((produit) => (
                    <MenuItem key={produit.id} value={produit.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StoreIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2">{produit.nom}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Code: {produit.code}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.produit && (
                  <Typography variant="caption" color="error">
                    {errors.produit}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantité totale *"
                name="quantite"
                type="number"
                value={formData.quantite}
                onChange={handleInputChange}
                error={!!errors.quantite}
                helperText={errors.quantite}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantité réservée"
                name="quantite_reservee"
                type="number"
                value={formData.quantite_reservee}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                helperText="Pour les ventes en cours"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Seuil d'alerte"
                name="stock_alerte"
                type="number"
                value={formData.stock_alerte}
                onChange={handleInputChange}
                error={!!errors.stock_alerte}
                helperText={errors.stock_alerte || "Alerte quand le stock descend en dessous"}
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emplacement (optionnel)"
                name="emplacement"
                value={formData.emplacement}
                onChange={handleInputChange}
                placeholder="Ex: Rayon A, Étagère 3, Zone Réception, etc."
                helperText="Permet de localiser facilement le produit dans l'entrepôt"
              />
            </Grid>
            
            {selectedStock && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom color="textSecondary">
                    Informations actuelles
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">
                        Quantité disponible:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedStock.quantite_disponible} unités
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">
                        Seuil d'alerte:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedStock.stock_alerte} unités
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="textSecondary">
                        Statut:
                      </Typography>
                      <Chip
                        label={getStockLabel(selectedStock)}
                        color={getStockColor(selectedStock)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            )}
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
            disabled={!formData.entrepot || !formData.produit || formData.quantite === ''}
            sx={{ 
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {selectedStock ? 'Modifier le stock' : 'Créer le stock'}
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
            Êtes-vous sûr de vouloir supprimer ce stock ? 
          </Typography>

          {selectedStock && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Entrepôt:</strong> {selectedStock.entrepot_nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Produit:</strong> {selectedStock.produit_nom} ({selectedStock.produit_code})
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Quantité totale:</strong> {selectedStock.quantite} unités
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Quantité disponible:</strong> {selectedStock.quantite_disponible} unités
              </Typography>
              {selectedStock.quantite_disponible > 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  ⚠️ Ce stock contient encore {selectedStock.quantite_disponible} unité(s) disponible(s)
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
  )
}

export default StockEntrepot  // Notez le nom SINGULIER