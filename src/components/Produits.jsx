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
  Grid,
  Tooltip,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material'

const Produits = () => {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingProduit, setEditingProduit] = useState(null)
  const [produitToDelete, setProduitToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  
  // États pour l'image
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Formulaire
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    categorie: '',
    prix_achat: '',
    prix_vente: '',
    stock_alerte: 5
  })

  // Récupérer les données
  const fetchData = async () => {
    setLoading(true)
    try {
      const [produitsRes, categoriesRes] = await Promise.all([
        AxiosInstance.get('produits/'),
        AxiosInstance.get('categories/')
      ])
      setProduits(produitsRes.data)
      setCategories(categoriesRes.data)
    } catch (err) {
      console.error('Erreur:', err.response || err)
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.detail || 'Erreur lors du chargement', 
        severity: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Gérer l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.match('image.*')) {
        setSnackbar({ open: true, message: 'Format image invalide', severity: 'error' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ open: true, message: "Image trop volumineuse (max 5MB)", severity: 'error' })
        return
      }
      
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Ouvrir/fermer dialogs
  const handleOpenDialog = (produit = null) => {
    if (produit) {
      setEditingProduit(produit)
      setFormData({
        code: produit.code,
        nom: produit.nom,
        description: produit.description || '',
        categorie: produit.categorie || '',
        prix_achat: produit.prix_achat,
        prix_vente: produit.prix_vente,
        stock_alerte: produit.stock_alerte || 5
      })
      setImagePreview(produit.thumbnail_url || produit.image_url || null)
    } else {
      setEditingProduit(null)
      setFormData({
        code: '', nom: '', description: '', categorie: '',
        prix_achat: '', prix_vente: '', stock_alerte: 5
      })
      setImagePreview(null)
    }
    setSelectedImage(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduit(null)
    setImagePreview(null)
    setSelectedImage(null)
  }

  const handleOpenDeleteDialog = (produit) => {
    setProduitToDelete(produit)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setProduitToDelete(null)
  }

  // Gérer formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Soumettre
  const handleSubmit = async () => {
    // Validation
    if (!formData.code.trim() || !formData.nom.trim() || !formData.prix_achat || !formData.prix_vente) {
      setSnackbar({ open: true, message: 'Tous les champs obligatoires doivent être remplis', severity: 'error' })
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('code', formData.code)
    formDataToSend.append('nom', formData.nom)
    formDataToSend.append('description', formData.description || '')
    if (formData.categorie) formDataToSend.append('categorie', formData.categorie)
    formDataToSend.append('prix_achat', parseFloat(formData.prix_achat))
    formDataToSend.append('prix_vente', parseFloat(formData.prix_vente))
    formDataToSend.append('stock_alerte', parseInt(formData.stock_alerte))
    
    if (selectedImage) {
      formDataToSend.append('image', selectedImage)
    }

    try {
      if (editingProduit) {
        await AxiosInstance.put(`produits/${editingProduit.id}/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSnackbar({ open: true, message: 'Produit modifié', severity: 'success' })
      } else {
        await AxiosInstance.post('produits/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSnackbar({ open: true, message: 'Produit ajouté', severity: 'success' })
      }
      
      fetchData()
      handleCloseDialog()
    } catch (err) {
      console.error('Erreur:', err.response || err)
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.detail || 'Erreur lors de l\'enregistrement', 
        severity: 'error' 
      })
    }
  }

  // Supprimer
  const handleDelete = async () => {
    if (!produitToDelete) return
    
    try {
      await AxiosInstance.delete(`produits/${produitToDelete.id}/`)
      setSnackbar({ open: true, message: 'Produit supprimé', severity: 'success' })
      fetchData()
      handleCloseDeleteDialog()
    } catch (err) {
      console.error('Erreur:', err)
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
    }
  }

  // Filtrer produits
  const filteredProduits = produits.filter(produit => 
    produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produit.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Avatar produit
  const ProductAvatar = ({ produit }) => {
    const imageUrl = produit.thumbnail_url || produit.image_url
    if (imageUrl) {
      return <Avatar src={imageUrl} sx={{ width: 50, height: 50 }} />
    }
    return (
      <Avatar sx={{ bgcolor: produit.en_rupture ? 'error.main' : 'primary.main' }}>
        <InventoryIcon />
      </Avatar>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Produits</Typography>
        <Fab color="primary" onClick={() => handleOpenDialog()}>
          <AddIcon />
        </Fab>
      </Box>

      {/* Recherche */}
      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
      </Card>

      {/* Tableau */}
      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Code</TableCell>
              <TableCell align="right">Prix Achat</TableCell>
              <TableCell align="right">Prix Vente</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProduits.map((produit) => (
              <TableRow key={produit.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ProductAvatar produit={produit} />
                    <Box>
                      <Typography fontWeight="bold">{produit.nom}</Typography>
                      {produit.categorie_nom && (
                        <Chip label={produit.categorie_nom} size="small" />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{produit.code}</TableCell>
                <TableCell align="right">{parseFloat(produit.prix_achat).toFixed(2)} €</TableCell>
                <TableCell align="right">{parseFloat(produit.prix_vente).toFixed(2)} €</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={produit.stock_actuel} 
                    color={
                      produit.en_rupture ? 'error' :
                      produit.stock_faible ? 'warning' : 'success'
                    }
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleOpenDialog(produit)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(produit)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog produit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduit ? 'Modifier' : 'Nouveau'} produit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Image */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('image-input').click()}
              >
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <Box component="img" src={imagePreview} sx={{ maxHeight: 150, borderRadius: 1 }} />
                ) : (
                  <>
                    <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography>Ajouter une image</Typography>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Code *"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
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
                >
                  <MenuItem value="">Sélectionner</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.nom}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock alerte"
                name="stock_alerte"
                type="number"
                value={formData.stock_alerte}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix d'achat *"
                name="prix_achat"
                type="number"
                value={formData.prix_achat}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix de vente *"
                name="prix_vente"
                type="number"
                value={formData.prix_vente}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.code || !formData.nom || !formData.prix_achat || !formData.prix_vente}
          >
            {editingProduit ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogContent>
          <Typography>
            Supprimer "{produitToDelete?.nom}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Produits