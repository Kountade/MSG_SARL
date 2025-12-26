import AxiosInstance from './AxiosInstance'
import React, { useEffect, useState } from 'react'
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
  Badge,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PhotoCamera as PhotoCameraIcon,
  DeleteForever as DeleteForeverIcon,
  ZoomIn as ZoomInIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Star as StarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'

const Produits = () => {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingProduit, setEditingProduit] = useState(null)
  const [produitToDelete, setProduitToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [filterFournisseur, setFilterFournisseur] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const theme = useTheme()

  // États pour la gestion des images
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [zoomImage, setZoomImage] = useState(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  // Formulaire produit
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    categorie: '',
    fournisseur: '',
    prix_achat: '',
    prix_vente: '',
    stock_alerte: 5
  })

  // Récupérer les données
  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('produits/'),
      AxiosInstance.get('categories/'),
      AxiosInstance.get('fournisseurs/')
    ])
    .then(([produitsRes, categoriesRes, fournisseursRes]) => {
      setProduits(produitsRes.data)
      setCategories(categoriesRes.data)
      setFournisseurs(fournisseursRes.data)
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

  // Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        setSnackbar({ open: true, message: 'Veuillez sélectionner une image (JPG, PNG, GIF)', severity: 'error' })
        return
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: "L'image ne doit pas dépasser 5MB", severity: 'error' })
        return
      }
      
      setSelectedImage(file)
      
      // Créer une preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Supprimer l'image
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Ouvrir le dialog pour ajouter/modifier
  const handleOpenDialog = (produit = null) => {
    if (produit) {
      setEditingProduit(produit)
      setFormData({
        code: produit.code || '',
        nom: produit.nom || '',
        description: produit.description || '',
        categorie: produit.categorie || '',
        fournisseur: produit.fournisseur || '',
        prix_achat: produit.prix_achat || '',
        prix_vente: produit.prix_vente || '',
        stock_alerte: produit.stock_alerte || 5
      })
      
      // Afficher l'image existante si disponible
      if (produit.image_url || produit.thumbnail_url) {
        setImagePreview(produit.thumbnail_url || produit.image_url)
      } else {
        setImagePreview(null)
      }
      setSelectedImage(null)
    } else {
      setEditingProduit(null)
      setFormData({
        code: '',
        nom: '',
        description: '',
        categorie: '',
        fournisseur: '',
        prix_achat: '',
        prix_vente: '',
        stock_alerte: 5
      })
      setImagePreview(null)
      setSelectedImage(null)
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduit(null)
    setImagePreview(null)
    setSelectedImage(null)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (produit) => {
    setProduitToDelete(produit)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setProduitToDelete(null)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Soumettre le formulaire avec image
  const handleSubmit = () => {
    if (!formData.code.trim() || !formData.nom.trim() || !formData.prix_achat || !formData.prix_vente) {
      setSnackbar({ open: true, message: 'Le code, nom, prix d\'achat et prix de vente sont obligatoires', severity: 'error' })
      return
    }

    if (parseFloat(formData.prix_vente) <= parseFloat(formData.prix_achat)) {
      setSnackbar({ open: true, message: 'Le prix de vente doit être supérieur au prix d\'achat', severity: 'error' })
      return
    }

    // Créer FormData pour gérer l'upload d'image
    const formDataToSend = new FormData()
    
    // Ajouter les champs texte
    formDataToSend.append('code', formData.code)
    formDataToSend.append('nom', formData.nom)
    formDataToSend.append('description', formData.description || '')
    if (formData.categorie) formDataToSend.append('categorie', formData.categorie)
    if (formData.fournisseur) formDataToSend.append('fournisseur', formData.fournisseur)
    formDataToSend.append('prix_achat', parseFloat(formData.prix_achat))
    formDataToSend.append('prix_vente', parseFloat(formData.prix_vente))
    formDataToSend.append('stock_alerte', parseInt(formData.stock_alerte))
    
    // Ajouter l'image si elle existe
    if (selectedImage) {
      formDataToSend.append('image', selectedImage)
    }

    setImageLoading(true)

    if (editingProduit) {
      // Modification avec FormData
      AxiosInstance.put(`produits/${editingProduit.id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
        .then(() => {
          setSnackbar({ open: true, message: 'Produit modifié avec succès', severity: 'success' })
          fetchData()
          handleCloseDialog()
          setImageLoading(false)
        })
        .catch((err) => {
          console.error('Error updating produit:', err.response?.data || err)
          setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' })
          setImageLoading(false)
        })
    } else {
      // Ajout avec FormData
      AxiosInstance.post('produits/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
        .then(() => {
          setSnackbar({ open: true, message: 'Produit ajouté avec succès', severity: 'success' })
          fetchData()
          handleCloseDialog()
          setImageLoading(false)
        })
        .catch((err) => {
          console.error('Error adding produit:', err.response?.data || err)
          setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' })
          setImageLoading(false)
        })
    }
  }

  // Supprimer un produit
  const handleDelete = () => {
    if (produitToDelete) {
      AxiosInstance.delete(`produits/${produitToDelete.id}/`)
        .then(() => {
          setSnackbar({ open: true, message: 'Produit supprimé avec succès', severity: 'success' })
          fetchData()
          handleCloseDeleteDialog()
        })
        .catch((err) => {
          console.error('Error deleting produit:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
        })
    }
  }

  // Filtrer les produits
  const filteredProduits = produits.filter(produit => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produit.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategorie = !filterCategorie || produit.categorie == filterCategorie
    const matchesStock = !filterStock || 
                        (filterStock === 'low' && produit.stock_faible) ||
                        (filterStock === 'out' && produit.en_rupture) ||
                        (filterStock === 'normal' && !produit.stock_faible && !produit.en_rupture)
    const matchesFournisseur = !filterFournisseur || produit.fournisseur == filterFournisseur
    
    return matchesSearch && matchesCategorie && matchesStock && matchesFournisseur
  })

  // Statistiques
  const stats = {
    total: produits.length,
    en_rupture: produits.filter(p => p.en_rupture).length,
    stock_faible: produits.filter(p => p.stock_faible && !p.en_rupture).length,
    avecImages: produits.filter(p => p.image_url || p.thumbnail_url).length,
    totalValeurStock: produits.reduce((acc, p) => acc + (p.stock_actuel * p.prix_achat), 0),
    margeMoyenne: produits.length > 0 
      ? produits.reduce((acc, p) => acc + ((p.prix_vente - p.prix_achat) / p.prix_achat * 100), 0) / produits.length 
      : 0
  }

  // Composant de carte de statistique amélioré
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary', progress = null }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      transition: 'all 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                {subtitle}
              </Typography>
            )}
            {progress !== null && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette[color].main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette[color].main,
                      borderRadius: 3
                    }
                  }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                  {progress}% complété
                </Typography>
              </Box>
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
              justifyContent: 'center',
              ml: 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  // Avatar personnalisé pour les produits (avec image)
  const ProductAvatar = ({ produit, size = 'medium' }) => {
    const sizes = {
      small: { width: 40, height: 40, fontSize: 16 },
      medium: { width: 60, height: 60, fontSize: 20 },
      large: { width: 80, height: 80, fontSize: 24 }
    }
    
    const { width, height, fontSize } = sizes[size]
    
    if (produit.thumbnail_url || produit.image_url) {
      const imageUrl = produit.thumbnail_url || produit.image_url
      return (
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            produit.en_rupture ? (
              <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
            ) : produit.stock_faible ? (
              <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
            ) : null
          }
        >
          <Avatar
            src={imageUrl}
            sx={{ 
              width, 
              height,
              borderRadius: 2,
              border: `2px solid ${produit.en_rupture 
                ? theme.palette.error.main 
                : produit.stock_faible 
                  ? theme.palette.warning.main 
                  : theme.palette.success.main}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              }
            }}
            variant="rounded"
            onClick={() => {
              setZoomImage(imageUrl)
              setImageDialogOpen(true)
            }}
          />
        </Badge>
      )
    }
    
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          produit.en_rupture ? (
            <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
          ) : produit.stock_faible ? (
            <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
          ) : null
        }
      >
        <Avatar
          sx={{
            bgcolor: produit.en_rupture 
              ? theme.palette.error.main 
              : produit.stock_faible 
                ? theme.palette.warning.main 
                : theme.palette.success.main,
            width,
            height,
            borderRadius: 2,
            fontSize: fontSize
          }}
          variant="rounded"
        >
          <InventoryIcon sx={{ fontSize: fontSize * 0.6 }} />
        </Avatar>
      </Badge>
    )
  }

  // Calculer la marge
  const calculateMarge = (prixAchat, prixVente) => {
    if (!prixAchat || !prixVente) return 0
    const marge = ((prixVente - prixAchat) / prixAchat * 100)
    return marge.toFixed(1)
  }

  // Calculer le niveau de stock
  const getStockLevel = (stock, stockAlerte) => {
    if (stock <= 0) return { level: 0, color: 'error', label: 'Rupture' }
    if (stock <= stockAlerte) return { level: 33, color: 'warning', label: 'Faible' }
    if (stock <= stockAlerte * 2) return { level: 66, color: 'info', label: 'Moyen' }
    return { level: 100, color: 'success', label: 'Bon' }
  }

  // Section d'upload d'image
  const ImageUploadSection = () => (
    <Grid item xs={12}>
      <Card 
        variant="outlined" 
        sx={{ 
          p: 3, 
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          borderRadius: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => document.getElementById('image-upload').click()}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        
        {imagePreview ? (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{
                maxHeight: 250,
                maxWidth: '100%',
                borderRadius: 2,
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
              <Tooltip title="Agrandir">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomImage(imagePreview)
                    setImageDialogOpen(true)
                  }}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : editingProduit && (editingProduit.thumbnail_url || editingProduit.image_url) ? (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={editingProduit.thumbnail_url || editingProduit.image_url}
              alt="Image actuelle"
              sx={{
                maxHeight: 250,
                maxWidth: '100%',
                borderRadius: 2,
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
              <Tooltip title="Agrandir">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoomImage(editingProduit.thumbnail_url || editingProduit.image_url)
                    setImageDialogOpen(true)
                  }}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
              Image actuelle du produit. Cliquez pour changer.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              Ajouter une image produit
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Glissez-déposez ou cliquez pour télécharger
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Formats supportés: JPG, PNG, GIF • Taille max: 5MB
            </Typography>
          </>
        )}
      </Card>
    </Grid>
  )

  // Modal pour zoomer sur l'image
  const ZoomImageModal = () => (
    <Dialog
      open={imageDialogOpen}
      onClose={() => setImageDialogOpen(false)}
      maxWidth="lg"
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton
          onClick={() => setImageDialogOpen(false)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            },
            zIndex: 1
          }}
          size="large"
        >
          <DeleteForeverIcon />
        </IconButton>
        <Box
          component="img"
          src={zoomImage}
          alt="Zoom"
          sx={{
            maxWidth: '85vw',
            maxHeight: '85vh',
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            objectFit: 'contain'
          }}
        />
      </Box>
    </Dialog>
  )

  // Tabs pour filtrer
  const TabsSection = () => (
    <Box sx={{ mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48
          }
        }}
      >
        <Tab icon={<InventoryIcon />} iconPosition="start" label="Tous les produits" />
        <Tab icon={<WarningIcon />} iconPosition="start" label="Stock faible" />
        <Tab icon={<StoreIcon />} iconPosition="start" label="En rupture" />
        <Tab icon={<ImageIcon />} iconPosition="start" label="Avec images" />
      </Tabs>
    </Box>
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
        <Typography variant="h5" color="textSecondary">
          Chargement des produits...
        </Typography>
        <LinearProgress sx={{ width: 300, borderRadius: 5 }} />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease-in; }
      `}</style>

      {/* En-tête avec titre et bouton d'ajout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: '900',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Gestion des Produits
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon fontSize="small" />
            Gérez votre catalogue produits efficacement
          </Typography>
        </Box>
        <Tooltip title="Ajouter un nouveau produit">
          <Fab 
            color="primary" 
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              width: 56,
              height: 56,
              '&:hover': {
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.6)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Cartes de statistiques améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<InventoryIcon sx={{ fontSize: 32 }} />}
            title="TOTAL PRODUITS"
            value={stats.total}
            subtitle={`${stats.avecImages} avec images`}
            color="primary"
            progress={(stats.avecImages / stats.total * 100) || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<WarningIcon sx={{ fontSize: 32 }} />}
            title="STOCK FAIBLE"
            value={stats.stock_faible}
            subtitle={`${((stats.stock_faible / stats.total) * 100).toFixed(1)}% du total`}
            color="warning"
            progress={(stats.stock_faible / stats.total * 100) || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<StoreIcon sx={{ fontSize: 32 }} />}
            title="EN RUPTURE"
            value={stats.en_rupture}
            subtitle="Produits indisponibles"
            color="error"
            progress={(stats.en_rupture / stats.total * 100) || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            title="MARGE MOY."
            value={`${stats.margeMoyenne.toFixed(1)}%`}
            subtitle="Bénéfice moyen"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <TabsSection />

      {/* Barres de recherche et filtres améliorés */}
      <Card sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par code, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.primary.main }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filterCategorie}
                label="Catégorie"
                onChange={(e) => setFilterCategorie(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Toutes</MenuItem>
                {categories.map((categorie) => (
                  <MenuItem key={categorie.id} value={categorie.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon fontSize="small" />
                      {categorie.nom}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Fournisseur</InputLabel>
              <Select
                value={filterFournisseur}
                label="Fournisseur"
                onChange={(e) => setFilterFournisseur(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous</MenuItem>
                {fournisseurs.map((fournisseur) => (
                  <MenuItem key={fournisseur.id} value={fournisseur.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShippingIcon fontSize="small" />
                      {fournisseur.nom}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>État stock</InputLabel>
              <Select
                value={filterStock}
                label="État stock"
                onChange={(e) => setFilterStock(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="normal">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                    Normal
                  </Box>
                </MenuItem>
                <MenuItem value="low">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    Faible
                  </Box>
                </MenuItem>
                <MenuItem value="out">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                    Rupture
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('')
                setFilterCategorie('')
                setFilterStock('')
                setFilterFournisseur('')
              }}
              sx={{
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4191 100%)'
                }
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des produits amélioré */}
      <Card sx={{ 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '& th': { 
                  fontWeight: '800', 
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  py: 2
                }
              }}>
                <TableCell width="300">PRODUIT</TableCell>
                <TableCell width="150">CATÉGORIE</TableCell>
                <TableCell align="right" width="120">PRIX ACHAT</TableCell>
                <TableCell align="right" width="120">PRIX VENTE</TableCell>
                <TableCell align="center" width="100">MARGE</TableCell>
                <TableCell align="center" width="150">STOCK</TableCell>
                <TableCell align="center" width="120">STATUT</TableCell>
                <TableCell align="center" width="140">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProduits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 3 }} />
                      <Typography variant="h5" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                        {searchTerm || filterCategorie || filterStock || filterFournisseur ? 'Aucun produit trouvé' : 'Aucun produit enregistré'}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        {!searchTerm && !filterCategorie && !filterStock && !filterFournisseur 
                          ? 'Commencez par ajouter votre premier produit à l\'aide du bouton "+" en haut à droite'
                          : 'Essayez de modifier vos critères de recherche ou ajoutez un nouveau produit'
                        }
                      </Typography>
                      {!searchTerm && !filterCategorie && !filterStock && !filterFournisseur && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog()}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5
                          }}
                        >
                          Ajouter un produit
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProduits.map((produit) => {
                  const stockLevel = getStockLevel(produit.stock_actuel, produit.stock_alerte)
                  const marge = calculateMarge(produit.prix_achat, produit.prix_vente)
                  
                  return (
                    <TableRow 
                      key={produit.id} 
                      hover 
                      sx={{ 
                        '&:last-child td': { borderBottom: 0 },
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`
                        },
                        animation: 'fadeIn 0.3s ease-in',
                        animationDelay: `${produit.id % 10 * 0.05}s`
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <ProductAvatar produit={produit} size="medium" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight="700" noWrap sx={{ color: 'text.primary' }}>
                                {produit.nom}
                              </Typography>
                              {(produit.image_url || produit.thumbnail_url) && (
                                <Tooltip title="Avec image">
                                  <ImageIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                              Code: {produit.code}
                            </Typography>
                            {produit.description && (
                              <Tooltip title={produit.description}>
                                <Typography variant="caption" color="textSecondary" sx={{ 
                                  display: 'block',
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mt: 0.5
                                }}>
                                  📝 {produit.description}
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<CategoryIcon fontSize="small" />}
                          label={produit.categorie_nom || 'Non catégorisé'}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 1,
                            fontWeight: 500,
                            borderColor: alpha(theme.palette.primary.main, 0.3)
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="700" sx={{ color: 'text.primary' }}>
                          {parseFloat(produit.prix_achat).toFixed(2)} €
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Coût unitaire
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="700" sx={{ color: 'success.main' }}>
                          {parseFloat(produit.prix_vente).toFixed(2)} €
                        </Typography>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                          Prix de vente
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${marge}%`}
                          size="small"
                          color={parseFloat(marge) > 50 ? 'success' : parseFloat(marge) > 20 ? 'info' : 'warning'}
                          variant="filled"
                          sx={{ 
                            fontWeight: 700,
                            borderRadius: 1,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h5" fontWeight="800" color={stockLevel.color}>
                            {produit.stock_actuel || 0}
                          </Typography>
                          <Box sx={{ width: '100%', maxWidth: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={stockLevel.level} 
                              color={stockLevel.color}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Alerte: {produit.stock_alerte || 5}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={produit.en_rupture ? <StoreIcon /> : <InventoryIcon />}
                          label={produit.en_rupture ? 'RUPTURE' : produit.stock_faible ? 'STOCK FAIBLE' : 'DISPONIBLE'}
                          color={produit.en_rupture ? 'error' : produit.stock_faible ? 'warning' : 'success'}
                          size="small"
                          sx={{ 
                            fontWeight: 700, 
                            borderRadius: 1,
                            px: 1,
                            boxShadow: `0 2px 8px ${alpha(
                              produit.en_rupture ? theme.palette.error.main : 
                              produit.stock_faible ? theme.palette.warning.main : 
                              theme.palette.success.main, 0.2
                            )}`
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenDialog(produit)}
                              sx={{ 
                                background: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { 
                                  background: alpha(theme.palette.primary.main, 0.2),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteDialog(produit)}
                              sx={{ 
                                background: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { 
                                  background: alpha(theme.palette.error.main, 0.2),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          {(produit.image_url || produit.thumbnail_url) && (
                            <Tooltip title="Voir l'image">
                              <IconButton 
                                color="info" 
                                onClick={() => {
                                  setZoomImage(produit.image_url || produit.thumbnail_url)
                                  setImageDialogOpen(true)
                                }}
                                sx={{ 
                                  background: alpha(theme.palette.info.main, 0.1),
                                  '&:hover': { 
                                    background: alpha(theme.palette.info.main, 0.2),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog pour ajouter/modifier un produit */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3
        }}>
          <InventoryIcon />
          {editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Section d'upload d'image */}
            <ImageUploadSection />
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code produit *"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du produit *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
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
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre produit..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="categorie"
                  value={formData.categorie}
                  label="Catégorie"
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Sélectionner une catégorie</MenuItem>
                  {categories.map((categorie) => (
                    <MenuItem key={categorie.id} value={categorie.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon fontSize="small" />
                        {categorie.nom}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fournisseur</InputLabel>
                <Select
                  name="fournisseur"
                  value={formData.fournisseur}
                  label="Fournisseur"
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Sélectionner un fournisseur</MenuItem>
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur.id} value={fournisseur.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon fontSize="small" />
                        {fournisseur.nom}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix d'achat *"
                name="prix_achat"
                type="number"
                value={formData.prix_achat}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Prix de vente *"
                name="prix_vente"
                type="number"
                value={formData.prix_vente}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUpIcon color="action" />
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Stock d'alerte"
                name="stock_alerte"
                type="number"
                value={formData.stock_alerte}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WarningIcon color="action" />
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 4,
              borderColor: alpha(theme.palette.text.secondary, 0.3),
              '&:hover': {
                borderColor: theme.palette.text.secondary,
              }
            }}
            disabled={imageLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.code.trim() || !formData.nom.trim() || !formData.prix_achat || !formData.prix_vente || imageLoading}
            sx={{ 
              borderRadius: 2,
              px: 5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: alpha(theme.palette.text.disabled, 0.5),
                boxShadow: 'none'
              }
            }}
          >
            {imageLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingProduit ? (
              'Modifier le produit'
            ) : (
              'Créer le produit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de suppression moderne */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
          }
        }}
      >
        <DialogContent sx={{ p: 5, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              margin: '0 auto 24px',
              border: `2px dashed ${alpha(theme.palette.error.main, 0.3)}`
            }}
          >
            <DeleteIcon sx={{ fontSize: 50, color: 'error.main' }} />
          </Box>
          
          <Typography variant="h4" gutterBottom sx={{ fontWeight: '800', color: 'error.main' }}>
            Confirmer la suppression
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer définitivement le produit <strong>"{produitToDelete?.nom}"</strong> ? 
            Cette action est irréversible et toutes les données associées seront perdues.
          </Typography>

          {produitToDelete && (
            <Card variant="outlined" sx={{ 
              mb: 4, 
              p: 3, 
              textAlign: 'left',
              borderRadius: 2,
              borderColor: alpha(theme.palette.divider, 0.3),
              backgroundColor: alpha(theme.palette.background.default, 0.5)
            }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Code:</strong> {produitToDelete.code}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Catégorie:</strong> {produitToDelete.categorie_nom || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Prix de vente:</strong> {parseFloat(produitToDelete.prix_vente).toFixed(2)} €
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Stock actuel:</strong> {produitToDelete.stock_actuel}
                  </Typography>
                </Grid>
                {(produitToDelete.image_url || produitToDelete.thumbnail_url) && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Image:</strong> ✓ Présente (sera également supprimée)
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 4, justifyContent: 'center', gap: 3 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              minWidth: 140,
              px: 4,
              py: 1.5,
              borderColor: alpha(theme.palette.text.secondary, 0.3),
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.text.secondary, 0.04)
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 2, 
              minWidth: 140,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de zoom sur l'image */}
      <ZoomImageModal />

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
            fontWeight: 500,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Produits