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
  Card,
  CardContent,
  Grid,
  Tooltip,
  Fab,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Chip,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState(null)
  const [categorieToDelete, setCategorieToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const theme = useTheme()

  // Formulaire catégorie
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    couleur: '#667eea'
  })

  // Couleurs prédéfinies pour les catégories
  const PREDEFINED_COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#a8edea', '#fed6e3'
  ]

  // Récupérer la liste des catégories
  const fetchCategories = () => {
    setLoading(true)
    AxiosInstance.get('categories/')
      .then((res) => {
        setCategories(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching categories:', err)
        setSnackbar({ open: true, message: 'Erreur lors du chargement des catégories', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Ouvrir le dialog pour ajouter/modifier
  const handleOpenDialog = (categorie = null) => {
    if (categorie) {
      setEditingCategorie(categorie)
      setFormData({
        nom: categorie.nom || '',
        description: categorie.description || '',
        couleur: categorie.couleur || '#667eea'
      })
    } else {
      setEditingCategorie(null)
      setFormData({
        nom: '',
        description: '',
        couleur: '#667eea'
      })
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCategorie(null)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (categorie) => {
    setCategorieToDelete(categorie)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setCategorieToDelete(null)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      setSnackbar({ open: true, message: 'Le nom est obligatoire', severity: 'error' })
      return
    }

    if (editingCategorie) {
      // Modification
      AxiosInstance.put(`categories/${editingCategorie.id}/`, formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Catégorie modifiée avec succès', severity: 'success' })
          fetchCategories()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error updating categorie:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' })
        })
    } else {
      // Ajout
      AxiosInstance.post('categories/', formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Catégorie ajoutée avec succès', severity: 'success' })
          fetchCategories()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error adding categorie:', err)
          setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' })
        })
    }
  }

  // Supprimer une catégorie
  const handleDelete = () => {
    if (categorieToDelete) {
      AxiosInstance.delete(`categories/${categorieToDelete.id}/`)
        .then(() => {
          setSnackbar({ open: true, message: 'Catégorie supprimée avec succès', severity: 'success' })
          fetchCategories()
          handleCloseDeleteDialog()
        })
        .catch((err) => {
          console.error('Error deleting categorie:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
        })
    }
  }

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(categorie =>
    categorie.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categorie.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Composant de carte de statistique amélioré
  const StatsCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
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

  // Avatar personnalisé pour les catégories
  const CategoryAvatar = ({ categorie }) => (
    <Avatar
      sx={{
        bgcolor: categorie.couleur || theme.palette.primary.main,
        width: 48,
        height: 48,
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}
    >
      {categorie.nom ? categorie.nom.charAt(0).toUpperCase() : 'C'}
    </Avatar>
  )

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
          Chargement des catégories...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
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
            Gestion des Catégories
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Organisez vos produits par catégories
          </Typography>
        </Box>
        <Tooltip title="Ajouter une nouvelle catégorie">
          <Fab 
            color="primary" 
            onClick={() => handleOpenDialog()}
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

      {/* Cartes de statistiques améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<CategoryIcon sx={{ fontSize: 28 }} />}
            title="TOTAL CATÉGORIES"
            value={categories.length}
            subtitle="Catégories actives"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            title="PRODUITS MOY."
            value={Math.round(categories.length > 0 ? categories.reduce((acc, cat) => acc + (cat.nombre_produits || 0), 0) / categories.length : 0)}
            subtitle="Produits par catégorie"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<PersonIcon sx={{ fontSize: 28 }} />}
            title="UTILISÉES PAR"
            value={new Set(categories.map(cat => cat.created_by_email)).size}
            subtitle="Utilisateurs différents"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Barre de recherche améliorée */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une catégorie par nom ou description..."
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
      </Card>

      {/* Tableau des catégories amélioré */}
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
                <TableCell>CATÉGORIE</TableCell>
                <TableCell>DESCRIPTION</TableCell>
                <TableCell>PRODUITS</TableCell>
                <TableCell>CRÉÉ PAR</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie enregistrée'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!searchTerm && 'Commencez par ajouter votre première catégorie'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((categorie) => (
                  <TableRow 
                    key={categorie.id} 
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
                        <CategoryAvatar categorie={categorie} />
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {categorie.nom}
                          </Typography>
                          {categorie.couleur && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: categorie.couleur,
                                  border: `1px solid ${alpha('#000', 0.1)}`
                                }}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {categorie.couleur}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {categorie.description ? (
                        <Tooltip title={categorie.description}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <DescriptionIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 300, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {categorie.description}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          Aucune description
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categorie.nombre_produits || 0}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {categorie.created_by_email || 'Système'}
                        </Typography>
                      </Box>
                      {categorie.created_at && (
                        <Typography variant="caption" color="textSecondary">
                          {new Date(categorie.created_at).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Modifier la catégorie">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(categorie)}
                            sx={{ 
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer la catégorie">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(categorie)}
                            sx={{ 
                              background: alpha(theme.palette.error.main, 0.1),
                              '&:hover': { background: alpha(theme.palette.error.main, 0.2) }
                            }}
                          >
                            <DeleteIcon />
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
      </Card>

      {/* Dialog pour ajouter/modifier une catégorie */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
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
          {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de la catégorie *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon color="action" />
                    </InputAdornment>
                  ),
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
                placeholder="Description de la catégorie..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 600 }}>
                Couleur de la catégorie
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PREDEFINED_COLORS.map((color) => (
                  <Tooltip key={color} title={color}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: formData.couleur === color ? `3px solid ${theme.palette.primary.main}` : `2px solid ${alpha('#000', 0.1)}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          border: `3px solid ${theme.palette.primary.main}`
                        }
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, couleur: color }))}
                    />
                  </Tooltip>
                ))}
              </Box>
              <TextField
                fullWidth
                label="Ou saisir une couleur personnalisée"
                name="couleur"
                value={formData.couleur}
                onChange={handleInputChange}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: formData.couleur,
                          border: `1px solid ${alpha('#000', 0.2)}`
                        }}
                      />
                    </InputAdornment>
                  ),
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
            disabled={!formData.nom.trim()}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {editingCategorie ? 'Modifier la catégorie' : 'Créer la catégorie'}
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
            Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{categorieToDelete?.nom}"</strong> ? 
            {categorieToDelete?.nombre_produits > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontWeight: 600 }}>
                ⚠️ Attention: {categorieToDelete.nombre_produits} produit(s) associé(s) à cette catégorie
              </Typography>
            )}
          </Typography>

          {categorieToDelete && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Nom:</strong> {categorieToDelete.nom}
              </Typography>
              {categorieToDelete.description && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Description:</strong> {categorieToDelete.description}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                <strong>Produits associés:</strong> {categorieToDelete.nombre_produits || 0}
              </Typography>
            </Card>
          )}
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
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
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
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Categories