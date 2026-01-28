import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Paper,
  Divider,
  Tooltip,
  Fab,
  CircularProgress,
  alpha,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  PointOfSale as PointOfSaleIcon,
  ClearAll as ClearAllIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Warehouse as WarehouseIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  AllInclusive as AllInclusiveIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'

// Image par défaut si le produit n'a pas d'image
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=Produit+Sans+Image'

const PointDeVente = () => {
  // États principaux
  const [produits, setProduits] = useState([])
  const [clients, setClients] = useState([])
  const [entrepots, setEntrepots] = useState([])
  const [loading, setLoading] = useState(true)
  const [panier, setPanier] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEntrepot, setSelectedEntrepot] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [submitting, setSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [categories, setCategories] = useState([])
  
  // États pour l'édition rapide des quantités
  const [editingIndex, setEditingIndex] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [batchMode, setBatchMode] = useState(false)
  const [batchQuantity, setBatchQuantity] = useState(1)

  // Références pour le scroll
  const produitsContainerRef = useRef(null)
  const panierContainerRef = useRef(null)
  const quantityInputRef = useRef(null)

  // Formulaire vente
  const [formData, setFormData] = useState({
    client: '',
    remise: 0,
    mode_paiement: '',
    montant_paye: 0,
    date_echeance: '',
    notes: ''
  })

  // Couleurs de l'entreprise
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'
  const black = '#000000'

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true)
    try {
      const [produitsRes, clientsRes, entrepotsRes] = await Promise.all([
        AxiosInstance.get('produits/'),
        AxiosInstance.get('clients/'),
        AxiosInstance.get('entrepots/')
      ])
      
      setProduits(produitsRes.data)
      setClients(clientsRes.data)
      setEntrepots(entrepotsRes.data.filter(e => e.actif))
      
      // Extraire les catégories uniques des produits
      const categoriesUniques = extraireCategoriesDesProduits(produitsRes.data)
      setCategories(categoriesUniques)
      
      console.log("Catégories extraites:", categoriesUniques)
      
      // Sélectionner le premier entrepôt par défaut si disponible
      if (entrepotsRes.data.length > 0) {
        const entrepotsActifs = entrepotsRes.data.filter(e => e.actif)
        if (entrepotsActifs.length > 0) {
          setSelectedEntrepot(entrepotsActifs[0].id.toString())
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' })
      setLoading(false)
    }
  }

  // Fonction pour extraire les catégories des produits
  const extraireCategoriesDesProduits = (produitsData) => {
    const categoriesSet = new Set()
    
    produitsData.forEach(produit => {
      if (produit.categorie) {
        categoriesSet.add(produit.categorie)
      }
    })
    
    return Array.from(categoriesSet).map((categorie, index) => ({
      id: index + 1,
      nom: categorie,
      description: `Catégorie: ${categorie}`,
      nombre_produits: produitsData.filter(p => p.categorie === categorie).length
    }))
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Fonction pour vérifier le stock disponible
  const checkStockDisponible = async (produitId, entrepotId) => {
    try {
      const response = await AxiosInstance.get(`stock-disponible/?produit=${produitId}`)
      const stock = response.data?.stocks?.find(s => s.entrepot_id === parseInt(entrepotId))
      
      return {
        disponible: stock?.quantite_disponible || 0,
        total: stock?.quantite_totale || 0,
        reserve: stock?.quantite_reservee || 0
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error)
      return { disponible: 0, total: 0, reserve: 0 }
    }
  }

  // Ajouter un produit au panier avec quantité personnalisée
  const ajouterAuPanier = async (produit, quantite = 1) => {
    if (!selectedEntrepot) {
      setSnackbar({ open: true, message: 'Veuillez sélectionner un entrepôt', severity: 'warning' })
      return
    }

    // Vérifier le stock
    const stockInfo = await checkStockDisponible(produit.id, selectedEntrepot)
    
    if (stockInfo.disponible <= 0) {
      setSnackbar({ 
        open: true, 
        message: `Stock insuffisant pour ${produit.nom}`, 
        severity: 'error' 
      })
      return
    }

    if (quantite > stockInfo.disponible) {
      setSnackbar({ 
        open: true, 
        message: `Stock insuffisant: ${stockInfo.disponible} disponibles`, 
        severity: 'warning' 
      })
      return
    }

    const produitExistant = panier.find(item => 
      item.produit.id === produit.id && item.entrepot === selectedEntrepot
    )

    if (produitExistant) {
      const nouvelleQuantite = produitExistant.quantite + quantite
      if (nouvelleQuantite > stockInfo.disponible) {
        setSnackbar({ 
          open: true, 
          message: `Quantité maximale atteinte (${stockInfo.disponible} disponibles)`, 
          severity: 'warning' 
        })
        return
      }
      
      setPanier(panier.map(item =>
        item.produit.id === produit.id && item.entrepot === selectedEntrepot
          ? { ...item, quantite: nouvelleQuantite }
          : item
      ))
    } else {
      setPanier([...panier, {
        produit,
        entrepot: selectedEntrepot,
        quantite,
        prix_unitaire: produit.prix_vente
      }])
    }

    setSnackbar({ 
      open: true, 
      message: `${produit.nom} (${quantite}) ajouté au panier`, 
      severity: 'success' 
    })
  }

  // Mettre à jour la quantité d'un produit dans le panier
  const mettreAJourQuantite = async (index, nouvelleQuantite) => {
    if (nouvelleQuantite < 1) {
      retirerDuPanier(index)
      return
    }

    const item = panier[index]
    const stockInfo = await checkStockDisponible(item.produit.id, item.entrepot)
    
    if (nouvelleQuantite > stockInfo.disponible) {
      setSnackbar({ 
        open: true, 
        message: `Stock insuffisant: ${stockInfo.disponible} disponibles`, 
        severity: 'warning' 
      })
      return
    }

    const nouveauPanier = [...panier]
    nouveauPanier[index].quantite = nouvelleQuantite
    setPanier(nouveauPanier)
  }

  // Incrémenter la quantité d'un produit dans le panier
  const incrementerQuantite = async (index, pas = 1) => {
    const item = panier[index]
    await mettreAJourQuantite(index, item.quantite + pas)
  }

  // Décrémenter la quantité d'un produit dans le panier
  const decrementerQuantite = (index) => {
    const nouveauPanier = [...panier]
    if (nouveauPanier[index].quantite > 1) {
      nouveauPanier[index].quantite -= 1
      setPanier(nouveauPanier)
    }
  }

  // Activer le mode édition pour une quantité
  const activerEditionQuantite = (index) => {
    setEditingIndex(index)
    setEditQuantity(panier[index].quantite.toString())
    
    // Focus sur le champ après un court délai
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus()
        quantityInputRef.current.select()
      }
    }, 10)
  }

  // Sauvegarder l'édition de la quantité
  const sauvegarderEditionQuantite = async (index) => {
    const quantite = parseInt(editQuantity)
    if (isNaN(quantite) || quantite < 1) {
      setSnackbar({ 
        open: true, 
        message: 'Veuillez entrer une quantité valide', 
        severity: 'error' 
      })
      annulerEditionQuantite()
      return
    }
    
    await mettreAJourQuantite(index, quantite)
    setEditingIndex(null)
    setEditQuantity('')
  }

  // Annuler l'édition
  const annulerEditionQuantite = () => {
    setEditingIndex(null)
    setEditQuantity('')
  }

  // Retirer un produit du panier
  const retirerDuPanier = (index) => {
    const nouveauPanier = panier.filter((_, i) => i !== index)
    setPanier(nouveauPanier)
    setSnackbar({ open: true, message: 'Produit retiré du panier', severity: 'info' })
  }

  // Vider le panier
  const viderPanier = () => {
    setPanier([])
    setSnackbar({ open: true, message: 'Panier vidé', severity: 'info' })
  }

  // Gestionnaire d'événements pour la touche Entrée
  const handleKeyPress = (event, index) => {
    if (event.key === 'Enter') {
      sauvegarderEditionQuantite(index)
    } else if (event.key === 'Escape') {
      annulerEditionQuantite()
    }
  }

  // Calculer le total du panier
  const calculerTotalPanier = () => {
    return panier.reduce((total, item) => {
      return total + (item.quantite * parseFloat(item.prix_unitaire))
    }, 0)
  }

  // Formater les nombres
  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)
  }

  // Ouvrir le dialog de finalisation
  const handleOpenDialog = () => {
    if (panier.length === 0) {
      setSnackbar({ open: true, message: 'Le panier est vide', severity: 'warning' })
      return
    }
    setFormData({
      client: '',
      remise: 0,
      mode_paiement: '',
      montant_paye: 0,
      date_echeance: '',
      notes: ''
    })
    setActiveStep(0)
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setActiveStep(0)
    setSubmitting(false)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remise' || name === 'montant_paye' ? parseFloat(value) || 0 : value
    }))
  }

  // Valider l'étape client
  const validerEtapeClient = () => {
    setActiveStep(1)
  }

  // Soumettre la vente
  const handleSubmitVente = async () => {
    setSubmitting(true)

    const submitData = {
      client: formData.client || null,
      remise: parseFloat(formData.remise || 0),
      mode_paiement: formData.mode_paiement || null,
      montant_paye: parseFloat(formData.montant_paye || 0),
      date_echeance: formData.date_echeance || null,
      notes: formData.notes || '',
      lignes_vente: panier.map(item => ({
        produit: parseInt(item.produit.id),
        entrepot: parseInt(item.entrepot),
        quantite: parseInt(item.quantite),
        prix_unitaire: parseFloat(item.prix_unitaire)
      }))
    }

    try {
      const response = await AxiosInstance.post('ventes/', submitData)
      setSnackbar({ open: true, message: 'Vente effectuée avec succès', severity: 'success' })
      
      // Vider le panier
      setPanier([])
      handleCloseDialog()
      
      // Rafraîchir les stocks
      await fetchData()
    } catch (err) {
      console.error('Erreur création vente:', err)
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         'Erreur lors de la création de la vente'
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
    setFilterCategorie(newValue === 'all' ? '' : newValue)
  }

  // Obtenir les produits filtrés
  const filteredProduits = produits.filter(produit => {
    const matchesSearch = 
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (produit.description && produit.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategorie = selectedTab === 'all' || produit.categorie === selectedTab
    
    return matchesSearch && matchesCategorie
  })

  // Composant de carte produit amélioré
  const ProduitCard = ({ produit }) => {
    const quantiteDansPanier = panier
      .filter(item => item.produit.id === produit.id)
      .reduce((sum, item) => sum + item.quantite, 0)

    const imageUrl = produit.image || DEFAULT_IMAGE

    return (
      <Card sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        border: `1px solid ${alpha(darkCayn, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(darkCayn, 0.15)}`,
          borderColor: vividOrange
        }
      }}>
        <CardMedia
          component="img"
          height="160"
          image={imageUrl}
          alt={produit.nom}
          sx={{
            objectFit: 'cover',
            borderBottom: `1px solid ${alpha(darkCayn, 0.1)}`
          }}
          onError={(e) => {
            e.target.src = DEFAULT_IMAGE
          }}
        />

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ 
              backgroundColor: alpha(darkCayn, 0.1),
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}>
              {produit.code}
            </Typography>
            {produit.categorie && (
              <Chip 
                label={produit.categorie} 
                size="small" 
                icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                sx={{ 
                  fontSize: '0.7rem',
                  height: 24,
                  backgroundColor: alpha(vividOrange, 0.1),
                  color: vividOrange,
                  maxWidth: '120px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }}
              />
            )}
          </Box>

          <Typography variant="h6" component="div" sx={{ 
            fontWeight: 600,
            color: darkCayn,
            mb: 1,
            fontSize: '1rem',
            minHeight: '2.5em'
          }}>
            {produit.nom}
          </Typography>

          {produit.description && (
            <Typography variant="body2" color="textSecondary" sx={{ 
              mb: 2,
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.5em'
            }}>
              {produit.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold',
              color: darkCayn,
              textAlign: 'right'
            }}>
              {formatNumber(parseFloat(produit.prix_vente))} €
            </Typography>

            {quantiteDansPanier > 0 && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mt: 1,
                p: 1,
                backgroundColor: alpha(darkCayn, 0.05),
                borderRadius: 1
              }}>
                <Typography variant="caption" color="textSecondary">
                  Dans le panier:
                </Typography>
                <Badge 
                  badgeContent={quantiteDansPanier} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: vividOrange,
                      color: 'white'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => ajouterAuPanier(produit)}
            sx={{
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(vividOrange, 0.4)}`,
              }
            }}
          >
            Ajouter
          </Button>
        </CardActions>
      </Card>
    )
  }

  // Composant pour l'affichage/édition de la quantité dans le panier
  const QuantiteControl = ({ item, index }) => {
    if (editingIndex === index) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <TextField
            inputRef={quantityInputRef}
            size="small"
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, index)}
            inputProps={{ 
              min: 1,
              style: { 
                textAlign: 'center',
                width: 60,
                padding: '6px 8px'
              }
            }}
            sx={{ 
              '& .MuiInputBase-root': {
                height: 36
              }
            }}
          />
          <IconButton 
            size="small" 
            onClick={() => sauvegarderEditionQuantite(index)}
            sx={{ 
              border: `1px solid ${darkCayn}`,
              backgroundColor: alpha(darkCayn, 0.1),
              color: darkCayn,
              '&:hover': { 
                backgroundColor: alpha(darkCayn, 0.2)
              }
            }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={annulerEditionQuantite}
            sx={{ 
              border: `1px solid ${vividOrange}`,
              backgroundColor: alpha(vividOrange, 0.1),
              color: vividOrange,
              '&:hover': { 
                backgroundColor: alpha(vividOrange, 0.2)
              }
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <IconButton 
          size="small" 
          onClick={() => decrementerQuantite(index)}
          sx={{ 
            border: `1px solid ${alpha(darkCayn, 0.2)}`,
            '&:hover': { 
              borderColor: vividOrange,
              backgroundColor: alpha(vividOrange, 0.1)
            }
          }}
        >
          <RemoveIcon />
        </IconButton>
        
        <Tooltip title="Cliquez pour éditer la quantité">
          <Box 
            onClick={() => activerEditionQuantite(index)}
            sx={{ 
              minWidth: 40, 
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(darkCayn, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(darkCayn, 0.1)}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(darkCayn, 0.1),
                borderColor: vividOrange
              }
            }}
          >
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              color: darkCayn
            }}>
              {item.quantite}
            </Typography>
          </Box>
        </Tooltip>
        
        <IconButton 
          size="small" 
          onClick={() => incrementerQuantite(index)}
          sx={{ 
            border: `1px solid ${alpha(darkCayn, 0.2)}`,
            '&:hover': { 
              borderColor: vividOrange,
              backgroundColor: alpha(vividOrange, 0.1)
            }
          }}
        >
          <AddIcon />
        </IconButton>
        
        {/* Bouton pour incrémenter rapidement */}
        <Tooltip title="Ajouter 10">
          <IconButton 
            size="small"
            onClick={() => incrementerQuantite(index, 10)}
            sx={{ 
              border: `1px solid ${alpha(darkCayn, 0.2)}`,
              backgroundColor: alpha(darkCayn, 0.05),
              fontSize: '0.8rem',
              '&:hover': { 
                borderColor: vividOrange,
                backgroundColor: alpha(vividOrange, 0.1)
              }
            }}
          >
            +10
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: darkCayn }} />
        <Typography variant="h6" color="textSecondary">
          Chargement du point de vente...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* En-tête fixe */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexShrink: 0
      }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.8rem', md: '2.2rem' }
          }}>
            Point de Vente
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8, fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Interface de vente rapide et intuitive
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Actualiser les stocks">
            <IconButton 
              onClick={fetchData}
              sx={{ 
                bgcolor: alpha(darkCayn, 0.1),
                color: darkCayn,
                '&:hover': { bgcolor: alpha(darkCayn, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Contenu principal avec disposition fixe */}
      <Box sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 180px)',
        gap: 3,
        overflow: 'hidden'
      }}>
        {/* Colonne gauche - Produits (scrollable) */}
        <Box sx={{ 
          flex: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Barres de contrôle fixes */}
          <Box sx={{ 
            mb: 2,
            flexShrink: 0
          }}>
            <Card sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha(darkCayn, 0.1)}` }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: darkCayn }}>Entrepôt de vente</InputLabel>
                    <Select
                      value={selectedEntrepot}
                      label="Entrepôt de vente"
                      onChange={(e) => setSelectedEntrepot(e.target.value)}
                      sx={{ 
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkCayn,
                        }
                      }}
                    >
                      {entrepots.map((entrepot) => (
                        <MenuItem key={entrepot.id} value={entrepot.id.toString()}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarehouseIcon sx={{ fontSize: 16 }} />
                            {entrepot.nom}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: darkCayn }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: darkCayn,
                        },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: darkCayn }}>Catégorie</InputLabel>
                    <Select
                      value={filterCategorie}
                      label="Catégorie"
                      onChange={(e) => setFilterCategorie(e.target.value)}
                      sx={{ 
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkCayn,
                        }
                      }}
                    >
                      <MenuItem value="">Toutes les catégories</MenuItem>
                      {categories.map((categorie) => (
                        <MenuItem key={categorie.id} value={categorie.nom}>
                          {categorie.nom} ({categorie.nombre_produits || 0})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Onglets des catégories */}
              {categories.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTabs-indicator': {
                        backgroundColor: vividOrange,
                      },
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        minHeight: 36,
                        '&.Mui-selected': {
                          color: vividOrange,
                          fontWeight: 600,
                        }
                      }
                    }}
                  >
                    <Tab 
                      value="all" 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AllInclusiveIcon sx={{ fontSize: 16 }} />
                          Tous ({produits.length})
                        </Box>
                      } 
                    />
                    {categories.map((categorie) => (
                      <Tab 
                        key={categorie.id}
                        value={categorie.nom}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CategoryIcon sx={{ fontSize: 16 }} />
                            {categorie.nom} ({categorie.nombre_produits || 0})
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>
                </Box>
              )}
            </Card>
          </Box>

          {/* Zone des produits avec scroll */}
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            border: `1px solid ${alpha(darkCayn, 0.1)}`,
            borderRadius: 3,
            backgroundColor: alpha(darkCayn, 0.02)
          }}>
            <Box sx={{ 
              p: 2, 
              pb: 1, 
              borderBottom: `1px solid ${alpha(darkCayn, 0.1)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h5" sx={{ 
                color: darkCayn, 
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {selectedTab === 'all' 
                  ? `Tous les produits (${filteredProduits.length})`
                  : `${selectedTab} (${filteredProduits.length})`
                } {selectedEntrepot && `| Entrepôt: ${entrepots.find(e => e.id == selectedEntrepot)?.nom}`}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip 
                  label={`${produits.length} produits`}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(darkCayn, 0.1),
                    color: darkCayn,
                    fontWeight: 500
                  }}
                />
                <Chip 
                  label={`${categories.length} catégories`}
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(vividOrange, 0.1),
                    color: vividOrange,
                    fontWeight: 500
                  }}
                />
              </Box>
            </Box>

            <Box
              ref={produitsContainerRef}
              sx={{
                height: 'calc(100% - 60px)',
                overflowY: 'auto',
                p: 2
              }}
            >
              {filteredProduits.length === 0 ? (
                <Box sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  backgroundColor: alpha(darkCayn, 0.02),
                  border: `1px dashed ${alpha(darkCayn, 0.2)}`,
                  borderRadius: 2
                }}>
                  <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Aucun produit trouvé
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || selectedTab !== 'all' ? 
                      'Modifiez vos critères de recherche' : 
                      'Aucun produit disponible dans cet entrepôt'}
                  </Typography>
                </Box>
              ) : (
                <>
                  {selectedTab === 'all' && categories.length > 0 ? (
                    categories.map((categorie) => {
                      const produitsCategorie = filteredProduits.filter(p => p.categorie === categorie.nom)
                      
                      if (produitsCategorie.length === 0) return null
                      
                      return (
                        <Box key={categorie.id} sx={{ mb: 4 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 2,
                            p: 1,
                            borderBottom: `2px solid ${alpha(vividOrange, 0.3)}`
                          }}>
                            <CategoryIcon sx={{ color: vividOrange, fontSize: 24 }} />
                            <Typography variant="h6" sx={{ 
                              fontWeight: 'bold',
                              color: darkCayn,
                              flexGrow: 1
                            }}>
                              {categorie.nom}
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                ({produitsCategorie.length} produits)
                              </Typography>
                            </Typography>
                            {categorie.description && (
                              <Tooltip title={categorie.description}>
                                <IconButton size="small">
                                  <InfoIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          
                          <Grid container spacing={2}>
                            {produitsCategorie.map((produit) => (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
                                <ProduitCard produit={produit} />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )
                    })
                  ) : (
                    <Grid container spacing={2}>
                      {filteredProduits.map((produit) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
                          <ProduitCard produit={produit} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Colonne droite - Panier (fixe) */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 400,
          maxWidth: 450
        }}>
          <Card sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: `1px solid ${alpha(darkCayn, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(darkCayn, 0.1)}`
          }}>
            {/* En-tête du panier */}
            <Box sx={{ 
              p: 3, 
              borderBottom: `1px solid ${alpha(darkCayn, 0.1)}`,
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: darkCayn }}>
                  <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Panier
                </Typography>
                <Badge 
                  badgeContent={panier.length} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: vividOrange,
                      color: 'white',
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Contenu du panier avec scroll */}
            <Box
              ref={panierContainerRef}
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3
              }}
            >
              {panier.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: 'text.secondary'
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Votre panier est vide
                  </Typography>
                  <Typography variant="body2">
                    Ajoutez des produits pour commencer une vente
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {panier.map((item, index) => (
                    <Paper 
                      key={index} 
                      elevation={0}
                      sx={{ 
                        mb: 2, 
                        p: 2,
                        border: `1px solid ${alpha(darkCayn, 0.1)}`,
                        borderRadius: 2
                      }}
                    >
                      <ListItem sx={{ px: 0 }}>
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          <Avatar
                            variant="rounded"
                            src={item.produit.image || DEFAULT_IMAGE}
                            alt={item.produit.nom}
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: `1px solid ${alpha(darkCayn, 0.1)}`
                            }}
                          >
                            <ImageIcon />
                          </Avatar>
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="600" color={darkCayn}>
                            {item.produit.nom}
                          </Typography>
                          {item.produit.categorie && (
                            <Typography variant="caption" sx={{ 
                              display: 'block',
                              color: vividOrange,
                              fontWeight: 500
                            }}>
                              {item.produit.categorie}
                            </Typography>
                          )}
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                            {entrepots.find(e => e.id == item.entrepot)?.nom || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatNumber(parseFloat(item.prix_unitaire))} € / unité
                          </Typography>
                        </Box>
                        
                        <QuantiteControl item={item} index={index} />
                      </ListItem>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: darkCayn }}>
                          {formatNumber(item.quantite * parseFloat(item.prix_unitaire))} €
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => retirerDuPanier(index)}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha('#d32f2f', 0.1) 
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>

            {/* Total et actions (fixe en bas) */}
            {panier.length > 0 && (
              <Box sx={{ 
                p: 3, 
                borderTop: `1px solid ${alpha(darkCayn, 0.1)}`,
                flexShrink: 0
              }}>
                <Box sx={{ mb: 3 }}>
                  {formData.remise > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        Sous-total:
                      </Typography>
                      <Typography variant="body1" fontWeight="600" color={darkCayn}>
                        {formatNumber(calculerTotalPanier())} €
                      </Typography>
                    </Box>
                  )}
                  
                  {formData.remise > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        Remise:
                      </Typography>
                      <Typography variant="body1" color={vividOrange} fontWeight="600">
                        -{formatNumber(parseFloat(formData.remise))} €
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" color={darkCayn}>
                      {formData.remise > 0 ? 'Total après remise:' : 'Total:'}
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 'bold',
                      background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {formatNumber(calculerTotalPanier() - parseFloat(formData.remise || 0))} €
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ClearAllIcon />}
                      onClick={viderPanier}
                      sx={{ 
                        borderRadius: 2,
                        borderColor: alpha(darkCayn, 0.5),
                        color: darkCayn,
                        '&:hover': {
                          borderColor: vividOrange,
                          backgroundColor: alpha(vividOrange, 0.04)
                        }
                      }}
                    >
                      Vider
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PointOfSaleIcon />}
                      onClick={handleOpenDialog}
                      sx={{ 
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                        '&:hover': {
                          boxShadow: `0 8px 25px ${alpha(vividOrange, 0.3)}`,
                        }
                      }}
                    >
                      Finaliser
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialog de finalisation de vente */}
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
          background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
          color: 'white',
          fontWeight: 'bold'
        }}>
          Finaliser la vente
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Étape 1: Client et paiement */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Client et Paiement
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: darkCayn }}>Client (optionnel)</InputLabel>
                        <Select
                          name="client"
                          value={formData.client}
                          label="Client (optionnel)"
                          onChange={handleInputChange}
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: darkCayn,
                            }
                          }}
                        >
                          <MenuItem value="">Vente sans client</MenuItem>
                          {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              {client.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: darkCayn }}>Mode de paiement</InputLabel>
                        <Select
                          name="mode_paiement"
                          value={formData.mode_paiement}
                          label="Mode de paiement"
                          onChange={handleInputChange}
                          sx={{
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: darkCayn,
                            }
                          }}
                        >
                          <MenuItem value="">Sélectionner</MenuItem>
                          <MenuItem value="especes">Espèces</MenuItem>
                          <MenuItem value="carte_bancaire">Carte bancaire</MenuItem>
                          <MenuItem value="cheque">Chèque</MenuItem>
                          <MenuItem value="virement">Virement</MenuItem>
                          <MenuItem value="mobile_money">Mobile Money</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Montant payé (€)"
                        name="montant_paye"
                        type="number"
                        value={formData.montant_paye}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: darkCayn,
                            },
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Remise (€)"
                        name="remise"
                        type="number"
                        value={formData.remise}
                        onChange={handleInputChange}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: darkCayn,
                            },
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes (optionnel)"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        multiline
                        rows={2}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: darkCayn,
                            },
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={validerEtapeClient}
                      sx={{
                        background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                      }}
                    >
                      Continuer vers la validation
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Étape 2: Validation */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Validation de la vente
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Vérifiez les détails de votre vente avant de confirmer.
                  </Typography>
                  
                  <Card sx={{ mb: 3, p: 2, bgcolor: alpha(darkCayn, 0.05) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Récapitulatif des produits
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Produit</TableCell>
                            <TableCell>Catégorie</TableCell>
                            <TableCell align="right">Quantité</TableCell>
                            <TableCell align="right">Prix unitaire</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {panier.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar
                                    variant="rounded"
                                    src={item.produit.image || DEFAULT_IMAGE}
                                    alt={item.produit.nom}
                                    sx={{ width: 40, height: 40 }}
                                  >
                                    <ImageIcon />
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="500">
                                    {item.produit.nom}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={item.produit.categorie || 'Non catégorisé'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: alpha(vividOrange, 0.1),
                                    color: vividOrange
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">{item.quantite}</TableCell>
                              <TableCell align="right">
                                {formatNumber(parseFloat(item.prix_unitaire))} €
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatNumber(item.quantite * parseFloat(item.prix_unitaire))} €
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                  
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {formData.remise > 0 && (
                        <>
                          <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                              Sous-total:
                            </Typography>
                          </Grid>
                          <Grid item xs={6} textAlign="right">
                            <Typography variant="body1" fontWeight="600">
                              {formatNumber(calculerTotalPanier())} €
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body1" color="textSecondary">
                              Remise:
                            </Typography>
                          </Grid>
                          <Grid item xs={6} textAlign="right">
                            <Typography variant="body1" color={vividOrange} fontWeight="600">
                              -{formatNumber(parseFloat(formData.remise))} €
                            </Typography>
                          </Grid>
                        </>
                      )}
                      
                      <Grid item xs={6}>
                        <Typography variant="h6" color={darkCayn}>
                          {formData.remise > 0 ? 'Total après remise:' : 'Total:'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="h5" color={darkCayn} fontWeight="bold">
                          {formatNumber(calculerTotalPanier() - parseFloat(formData.remise || 0))} €
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      onClick={() => setActiveStep(0)} 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        borderColor: darkCayn,
                        color: darkCayn,
                        '&:hover': {
                          borderColor: vividOrange,
                          backgroundColor: alpha(vividOrange, 0.04)
                        }
                      }}
                    >
                      Retour
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSubmitVente}
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
                      sx={{ 
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${vividOrange} 0%, ${darkCayn} 100%)`,
                        '&:disabled': {
                          background: alpha(darkCayn, 0.3)
                        }
                      }}
                    >
                      {submitting ? 'Validation en cours...' : 'Confirmer la vente'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default PointDeVente