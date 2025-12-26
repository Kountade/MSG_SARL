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
  TablePagination,
  FormControlLabel,
  Switch
} from '@mui/material'
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Build as BuildIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  Warehouse as WarehouseIcon,
  TransferWithinAStation as TransferIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  SwapHoriz as TransferStockIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

const MouvementsStock = () => {
  const [mouvements, setMouvements] = useState([])
  const [produits, setProduits] = useState([])
  const [entrepots, setEntrepots] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterProduit, setFilterProduit] = useState('')
  const [filterEntrepot, setFilterEntrepot] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const theme = useTheme()

  // Formulaire mouvement de stock avec entrepôt
  const [formData, setFormData] = useState({
    produit: '',
    type_mouvement: 'entree',
    quantite: '',
    motif: '',
    prix_unitaire: '',
    entrepot: ''
  })

  // Récupérer les données
  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('mouvements-stock/'),
      AxiosInstance.get('produits/'),
      AxiosInstance.get('entrepots/')
    ])
    .then(([mouvementsRes, produitsRes, entrepotsRes]) => {
      setMouvements(mouvementsRes.data)
      setProduits(produitsRes.data)
      setEntrepots(entrepotsRes.data)
      setLoading(false)
    })
    .catch((err) => {
      console.error('Error fetching data:', err)
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' })
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  // Ouvrir le dialog pour ajouter un mouvement
  const handleOpenDialog = () => {
    setFormData({
      produit: '',
      type_mouvement: 'entree',
      quantite: '',
      motif: '',
      prix_unitaire: '',
      entrepot: ''
    })
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Si le produit change, mettre à jour le prix unitaire automatiquement
    if (name === 'produit' && value) {
      const produitSelectionne = produits.find(p => p.id == value)
      if (produitSelectionne) {
        const prix = formData.type_mouvement === 'entree' 
          ? produitSelectionne.prix_achat 
          : produitSelectionne.prix_vente
        setFormData(prev => ({
          ...prev,
          prix_unitaire: prix
        }))
      }
    }

    // Si le type de mouvement change, mettre à jour le prix unitaire
    if (name === 'type_mouvement' && formData.produit) {
      const produitSelectionne = produits.find(p => p.id == formData.produit)
      if (produitSelectionne) {
        const prix = value === 'entree' 
          ? produitSelectionne.prix_achat 
          : produitSelectionne.prix_vente
        setFormData(prev => ({
          ...prev,
          prix_unitaire: prix
        }))
      }
    }
  }

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (!formData.produit || !formData.quantite || !formData.motif.trim() || !formData.entrepot) {
      setSnackbar({ open: true, message: 'Tous les champs sont obligatoires', severity: 'error' })
      return
    }

    if (parseInt(formData.quantite) <= 0) {
      setSnackbar({ open: true, message: 'La quantité doit être positive', severity: 'error' })
      return
    }

    const submitData = {
      ...formData,
      quantite: parseInt(formData.quantite),
      prix_unitaire: formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : null
    }

    AxiosInstance.post('mouvements-stock/', submitData)
      .then(() => {
        setSnackbar({ open: true, message: 'Mouvement de stock enregistré avec succès', severity: 'success' })
        fetchData()
        handleCloseDialog()
      })
      .catch((err) => {
        console.error('Error adding mouvement:', err.response?.data || err)
        const errorMessage = err.response?.data?.message || 'Erreur lors de l\'enregistrement'
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      })
  }

  // Supprimer un mouvement
  const handleDeleteMouvement = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) {
      AxiosInstance.delete(`mouvements-stock/${id}/`)
        .then(() => {
          setSnackbar({ open: true, message: 'Mouvement supprimé avec succès', severity: 'success' })
          fetchData()
        })
        .catch((err) => {
          console.error('Error deleting mouvement:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
        })
    }
  }

  // Filtrer les mouvements
  const filteredMouvements = mouvements.filter(mouvement => {
    const matchesSearch = 
      mouvement.produit_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mouvement.motif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mouvement.entrepot_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mouvement.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !filterType || mouvement.type_mouvement === filterType
    const matchesProduit = !filterProduit || mouvement.produit == filterProduit
    const matchesEntrepot = !filterEntrepot || mouvement.entrepot == filterEntrepot
    
    return matchesSearch && matchesType && matchesProduit && matchesEntrepot
  })

  // Statistiques
  const stats = {
    total: mouvements.length,
    entrees: mouvements.filter(m => m.type_mouvement === 'entree').length,
    sorties: mouvements.filter(m => m.type_mouvement === 'sortie').length,
    ajustements: mouvements.filter(m => m.type_mouvement === 'ajustement').length,
    transferts: mouvements.filter(m => m.type_mouvement === 'transfert').length,
    quantite_entree: mouvements.filter(m => m.type_mouvement === 'entree')
      .reduce((sum, m) => sum + (m.quantite || 0), 0),
    quantite_sortie: mouvements.filter(m => m.type_mouvement === 'sortie')
      .reduce((sum, m) => sum + (m.quantite || 0), 0),
    valeur_entree: mouvements.filter(m => m.type_mouvement === 'entree' && m.prix_unitaire)
      .reduce((sum, m) => sum + ((m.quantite || 0) * parseFloat(m.prix_unitaire || 0)), 0),
    valeur_sortie: mouvements.filter(m => m.type_mouvement === 'sortie' && m.prix_unitaire)
      .reduce((sum, m) => sum + ((m.quantite || 0) * parseFloat(m.prix_unitaire || 0)), 0)
  }

  // Obtenir l'icône et la couleur selon le type de mouvement
  const getMouvementInfo = (type) => {
    switch (type) {
      case 'entree':
        return { 
          icon: <ArrowUpIcon />, 
          color: 'success', 
          label: 'Entrée',
          avatarColor: theme.palette.success.main
        }
      case 'sortie':
        return { 
          icon: <ArrowDownIcon />, 
          color: 'error', 
          label: 'Sortie',
          avatarColor: theme.palette.error.main
        }
      case 'ajustement':
        return { 
          icon: <BuildIcon />, 
          color: 'warning', 
          label: 'Ajustement',
          avatarColor: theme.palette.warning.main
        }
      case 'transfert':
        return { 
          icon: <TransferIcon />, 
          color: 'info', 
          label: 'Transfert',
          avatarColor: theme.palette.info.main
        }
      default:
        return { 
          icon: <InventoryIcon />, 
          color: 'default', 
          label: 'Inconnu',
          avatarColor: theme.palette.primary.main
        }
    }
  }

  // Avatar pour les mouvements
  const MouvementAvatar = ({ mouvement }) => {
    const info = getMouvementInfo(mouvement.type_mouvement)
    return (
      <Avatar sx={{ bgcolor: info.avatarColor, width: 40, height: 40 }}>
        {info.icon}
      </Avatar>
    )
  }

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Données paginées
  const paginatedMouvements = filteredMouvements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Chargement des mouvements de stock...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* En-tête avec titre et bouton d'ajout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mouvements de Stock
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez les entrées, sorties, ajustements et transferts de stock
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
          <Tooltip title="Nouveau mouvement de stock">
            <Fab 
              color="primary" 
              onClick={handleOpenDialog}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
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
          <StatsCard
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            title="TOTAL MOUVEMENTS"
            value={stats.total}
            subtitle="Opérations"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ArrowUpIcon sx={{ fontSize: 28 }} />}
            title="ENTRÉES"
            value={stats.entrees}
            subtitle="Réapprovisionnements"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ArrowDownIcon sx={{ fontSize: 28 }} />}
            title="SORTIES"
            value={stats.sorties}
            subtitle="Ventes & retraits"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TransferIcon sx={{ fontSize: 28 }} />}
            title="TRANSFERTS"
            value={stats.transferts}
            subtitle="Entre entrepôts"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Cartes de quantité */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    QUANTITÉ ENTRÉE
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {stats.quantite_entree}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Unités reçues
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    QUANTITÉ SORTIE
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {stats.quantite_sortie}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Unités sorties
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barres de recherche et filtres améliorés */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par produit, motif, entrepôt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="entree">Entrées</MenuItem>
                <MenuItem value="sortie">Sorties</MenuItem>
                <MenuItem value="ajustement">Ajustements</MenuItem>
                <MenuItem value="transfert">Transferts</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Produit</InputLabel>
              <Select
                value={filterProduit}
                label="Produit"
                onChange={(e) => setFilterProduit(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous</MenuItem>
                {produits.map((produit) => (
                  <MenuItem key={produit.id} value={produit.id}>
                    {produit.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Entrepôt</InputLabel>
              <Select
                value={filterEntrepot}
                label="Entrepôt"
                onChange={(e) => setFilterEntrepot(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous</MenuItem>
                {entrepots.map((entrepot) => (
                  <MenuItem key={entrepot.id} value={entrepot.id}>
                    {entrepot.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setFilterType('')
                setFilterProduit('')
                setFilterEntrepot('')
                setSearchTerm('')
              }}
              sx={{ height: '56px', borderRadius: 2 }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des mouvements amélioré */}
      <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                '& th': { 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem',
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  whiteSpace: 'nowrap'
                }
              }}>
                <TableCell width="60">TYPE</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>PRODUIT</TableCell>
                <TableCell>ENTREPÔT</TableCell>
                <TableCell align="center">QUANTITÉ</TableCell>
                <TableCell align="right">PRIX UNITAIRE</TableCell>
                <TableCell align="right">VALEUR</TableCell>
                <TableCell>MOTIF</TableCell>
                <TableCell>UTILISATEUR</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMouvements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {searchTerm || filterType || filterProduit || filterEntrepot ? 'Aucun mouvement trouvé' : 'Aucun mouvement enregistré'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!searchTerm && !filterType && !filterProduit && !filterEntrepot && 'Commencez par créer votre premier mouvement de stock'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMouvements.map((mouvement) => {
                  const mouvementInfo = getMouvementInfo(mouvement.type_mouvement)
                  const valeurTotale = mouvement.prix_unitaire ? (mouvement.quantite * parseFloat(mouvement.prix_unitaire)).toFixed(2) : null
                  
                  return (
                    <TableRow 
                      key={mouvement.id} 
                      hover 
                      sx={{ 
                        '&:last-child td': { borderBottom: 0 },
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title={mouvementInfo.label}>
                            <Avatar 
                              sx={{ 
                                bgcolor: mouvementInfo.avatarColor, 
                                width: 32, 
                                height: 32,
                                boxShadow: `0 2px 8px ${alpha(mouvementInfo.avatarColor, 0.3)}`
                              }}
                            >
                              {mouvementInfo.icon}
                            </Avatar>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {formatDate(mouvement.created_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {mouvement.produit_nom}
                          </Typography>
                          {mouvement.produit_code && (
                            <Typography variant="caption" color="textSecondary">
                              Code: {mouvement.produit_code}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarehouseIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {mouvement.entrepot_nom || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${mouvement.type_mouvement === 'entree' ? '+' : '-'}${mouvement.quantite}`}
                          color={mouvement.type_mouvement === 'entree' ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {mouvement.prix_unitaire ? (
                          <Typography variant="body2" fontWeight="600">
                            {parseFloat(mouvement.prix_unitaire).toFixed(2)} €
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary" fontStyle="italic">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {valeurTotale ? (
                          <Typography variant="body2" fontWeight="600" color="primary.main">
                            {valeurTotale} €
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary" fontStyle="italic">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={mouvement.motif}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 150, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {mouvement.motif}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {mouvement.created_by_email?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {mouvement.created_by_email?.split('@')[0] || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
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
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDeleteMouvement(mouvement.id)}
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
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
          count={filteredMouvements.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Dialog pour ajouter un mouvement amélioré */}
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Nouveau Mouvement de Stock
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Produit *</InputLabel>
                <Select
                  name="produit"
                  value={formData.produit}
                  label="Produit *"
                  onChange={handleInputChange}
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Sélectionner un produit</MenuItem>
                  {produits.map((produit) => (
                    <MenuItem key={produit.id} value={produit.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{produit.nom}</span>
                        <span style={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          Stock: {produit.stock_actuel}
                        </span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Entrepôt *</InputLabel>
                <Select
                  name="entrepot"
                  value={formData.entrepot}
                  label="Entrepôt *"
                  onChange={handleInputChange}
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Sélectionner un entrepôt</MenuItem>
                  {entrepots.filter(e => e.actif).map((entrepot) => (
                    <MenuItem key={entrepot.id} value={entrepot.id}>
                      {entrepot.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de mouvement *</InputLabel>
                <Select
                  name="type_mouvement"
                  value={formData.type_mouvement}
                  label="Type de mouvement *"
                  onChange={handleInputChange}
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="entree">Entrée en stock</MenuItem>
                  <MenuItem value="sortie">Sortie de stock</MenuItem>
                  <MenuItem value="ajustement">Ajustement</MenuItem>
                  <MenuItem value="transfert">Transfert entrepôt</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantité *"
                name="quantite"
                type="number"
                value={formData.quantite}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix unitaire (€)"
                name="prix_unitaire"
                type="number"
                value={formData.prix_unitaire}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Rempli automatiquement selon le type de mouvement"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EuroIcon color="action" />
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
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motif *"
                name="motif"
                multiline
                rows={3}
                value={formData.motif}
                onChange={handleInputChange}
                placeholder="Ex: Réapprovisionnement, Vente #123, Inventaire, Correction stock, Transfert entre entrepôts, etc."
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
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
            disabled={!formData.produit || !formData.quantite || !formData.motif.trim() || !formData.entrepot}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Enregistrer le mouvement
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

export default MouvementsStock