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
  CircularProgress,
  Divider
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material'

const Fournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingFournisseur, setEditingFournisseur] = useState(null)
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const theme = useTheme()

  // Formulaire fournisseur
  const [formData, setFormData] = useState({
    nom: '',
    contact: '',
    telephone: '',
    email: '',
    adresse: '',
    site_web: '',
    notes: ''
  })

  // Récupérer la liste des fournisseurs
  const fetchFournisseurs = () => {
    setLoading(true)
    AxiosInstance.get('fournisseurs/')
      .then((res) => {
        setFournisseurs(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching fournisseurs:', err)
        setSnackbar({ open: true, message: 'Erreur lors du chargement des fournisseurs', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchFournisseurs()
  }, [])

  // Ouvrir le dialog pour ajouter/modifier
  const handleOpenDialog = (fournisseur = null) => {
    if (fournisseur) {
      setEditingFournisseur(fournisseur)
      setFormData({
        nom: fournisseur.nom || '',
        contact: fournisseur.contact || '',
        telephone: fournisseur.telephone || '',
        email: fournisseur.email || '',
        adresse: fournisseur.adresse || '',
        site_web: fournisseur.site_web || '',
        notes: fournisseur.notes || ''
      })
    } else {
      setEditingFournisseur(null)
      setFormData({
        nom: '',
        contact: '',
        telephone: '',
        email: '',
        adresse: '',
        site_web: '',
        notes: ''
      })
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingFournisseur(null)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (fournisseur) => {
    setFournisseurToDelete(fournisseur)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setFournisseurToDelete(null)
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
    if (!formData.nom.trim() || !formData.contact.trim()) {
      setSnackbar({ open: true, message: 'Le nom et le contact sont obligatoires', severity: 'error' })
      return
    }

    if (editingFournisseur) {
      // Modification
      AxiosInstance.put(`fournisseurs/${editingFournisseur.id}/`, formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Fournisseur modifié avec succès', severity: 'success' })
          fetchFournisseurs()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error updating fournisseur:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' })
        })
    } else {
      // Ajout
      AxiosInstance.post('fournisseurs/', formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Fournisseur ajouté avec succès', severity: 'success' })
          fetchFournisseurs()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error adding fournisseur:', err)
          setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' })
        })
    }
  }

  // Supprimer un fournisseur
  const handleDelete = () => {
    if (fournisseurToDelete) {
      AxiosInstance.delete(`fournisseurs/${fournisseurToDelete.id}/`)
        .then(() => {
          setSnackbar({ open: true, message: 'Fournisseur supprimé avec succès', severity: 'success' })
          fetchFournisseurs()
          handleCloseDeleteDialog()
        })
        .catch((err) => {
          console.error('Error deleting fournisseur:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
        })
    }
  }

  // Filtrer les fournisseurs selon la recherche
  const filteredFournisseurs = fournisseurs.filter(fournisseur =>
    fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fournisseur.telephone && fournisseur.telephone.includes(searchTerm))
  )

  // Statistiques
  const stats = {
    total: fournisseurs.length,
    avecEmail: fournisseurs.filter(f => f.email).length,
    avecTelephone: fournisseurs.filter(f => f.telephone).length
  }

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

  // Avatar personnalisé pour les fournisseurs
  const FournisseurAvatar = ({ fournisseur }) => (
    <Avatar
      sx={{
        bgcolor: theme.palette.primary.main,
        width: 48,
        height: 48,
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}
    >
      {fournisseur.nom ? fournisseur.nom.charAt(0).toUpperCase() : 'F'}
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
          Chargement des fournisseurs...
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
            Gestion des Fournisseurs
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez vos partenaires et approvisionnements
          </Typography>
        </Box>
        <Tooltip title="Ajouter un nouveau fournisseur">
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
            icon={<BusinessIcon sx={{ fontSize: 28 }} />}
            title="TOTAL FOURNISSEURS"
            value={stats.total}
            subtitle="Partenaires actifs"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<EmailIcon sx={{ fontSize: 28 }} />}
            title="AVEC EMAIL"
            value={stats.avecEmail}
            subtitle={`${stats.total > 0 ? Math.round((stats.avecEmail / stats.total) * 100) : 0}% du total`}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<PhoneIcon sx={{ fontSize: 28 }} />}
            title="AVEC TÉLÉPHONE"
            value={stats.avecTelephone}
            subtitle={`${stats.total > 0 ? Math.round((stats.avecTelephone / stats.total) * 100) : 0}% du total`}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Barre de recherche améliorée */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un fournisseur par nom, contact, email ou téléphone..."
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

      {/* Tableau des fournisseurs amélioré */}
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
                <TableCell>FOURNISSEUR</TableCell>
                <TableCell>CONTACT</TableCell>
                <TableCell>COORDONNÉES</TableCell>
                <TableCell>ADRESSE</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFournisseurs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur enregistré'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!searchTerm && 'Commencez par ajouter votre premier fournisseur'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFournisseurs.map((fournisseur) => (
                  <TableRow 
                    key={fournisseur.id} 
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
                        <FournisseurAvatar fournisseur={fournisseur} />
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {fournisseur.nom}
                          </Typography>
                          {fournisseur.site_web && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                              {fournisseur.site_web}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="500">
                          {fournisseur.contact}
                        </Typography>
                      </Box>
                      {fournisseur.notes && (
                        <Tooltip title={fournisseur.notes}>
                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            sx={{ 
                              display: 'block',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {fournisseur.notes}
                          </Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {fournisseur.telephone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">
                            {fournisseur.telephone}
                          </Typography>
                        </Box>
                      )}
                      {fournisseur.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="body2">
                            {fournisseur.email}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {fournisseur.adresse ? (
                        <Tooltip title={fournisseur.adresse}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.25 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {fournisseur.adresse}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          Non renseignée
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Modifier le fournisseur">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(fournisseur)}
                            sx={{ 
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer le fournisseur">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(fournisseur)}
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

      {/* Dialog pour ajouter/modifier un fournisseur */}
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
          {editingFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du fournisseur *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personne à contacter *"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site web"
                name="site_web"
                value={formData.site_web}
                onChange={handleInputChange}
                placeholder="https://..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalShippingIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                multiline
                rows={2}
                value={formData.adresse}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes supplémentaires"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informations complémentaires sur le fournisseur..."
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
            disabled={!formData.nom.trim() || !formData.contact.trim()}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {editingFournisseur ? 'Modifier le fournisseur' : 'Créer le fournisseur'}
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
            Êtes-vous sûr de vouloir supprimer le fournisseur <strong>"{fournisseurToDelete?.nom}"</strong> ? 
            Cette action est irréversible.
          </Typography>

          {fournisseurToDelete && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Nom:</strong> {fournisseurToDelete.nom}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Contact:</strong> {fournisseurToDelete.contact}
              </Typography>
              {fournisseurToDelete.telephone && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Téléphone:</strong> {fournisseurToDelete.telephone}
                </Typography>
              )}
              {fournisseurToDelete.email && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Email:</strong> {fournisseurToDelete.email}
                </Typography>
              )}
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

export default Fournisseurs