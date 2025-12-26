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
  Alert,
  Snackbar,
  Fab,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Divider,
  Badge
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ShoppingCart as SellerIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Security as SecurityIcon
} from '@mui/icons-material'

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const theme = useTheme()

  // États pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Filtres et recherche
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  })

  // Formulaire utilisateur
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    role: 'vendeur',
    telephone: '',
    adresse: '',
    birthday: ''
  })

  // Options pour les rôles
  const roleOptions = [
    { value: 'admin', label: 'Administrateur', icon: <AdminIcon />, color: 'error' },
    { value: 'vendeur', label: 'Vendeur', icon: <SellerIcon />, color: 'primary' }
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

  // Récupérer les utilisateurs
  const fetchUtilisateurs = async () => {
    setLoading(true)
    try {
      const response = await AxiosInstance.get('users/')
      setUtilisateurs(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUtilisateurs()
  }, [])

  // Gestion des notifications
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Gestion des filtres
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Ouvrir le dialog pour ajouter/modifier un utilisateur
  const handleOpenDialog = (user = null) => {
    if (user) {
      // Mode édition
      setEditingUser(user)
      setFormData({
        email: user.email || '',
        username: user.username || '',
        role: user.role || 'vendeur',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        birthday: user.birthday || ''
      })
    } else {
      // Mode création
      setEditingUser(null)
      setFormData({
        email: '',
        username: '',
        role: 'vendeur',
        telephone: '',
        adresse: '',
        birthday: ''
      })
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setSubmitting(false)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setUserToDelete(null)
  }

  // Gestion des changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Valider le formulaire
  const validateForm = () => {
    if (!formData.email) {
      showSnackbar('L\'email est obligatoire', 'error')
      return false
    }

    if (!formData.role) {
      showSnackbar('Le rôle est obligatoire', 'error')
      return false
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showSnackbar('Format d\'email invalide', 'error')
      return false
    }

    return true
  }

  // Créer un utilisateur
  const handleCreateUser = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const response = await AxiosInstance.post('register/', {
        email: formData.email,
        password: 'password123', // Mot de passe par défaut
        role: formData.role,
        username: formData.username,
        telephone: formData.telephone,
        adresse: formData.adresse,
        birthday: formData.birthday
      })

      showSnackbar('Utilisateur créé avec succès')
      fetchUtilisateurs()
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur création utilisateur:', error)
      const errorMessage = error.response?.data?.email?.[0] || 
                          error.response?.data?.detail || 
                          'Erreur lors de la création'
      showSnackbar(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Modifier un utilisateur
  const handleUpdateUser = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const response = await AxiosInstance.put(`users/${editingUser.id}/`, formData)
      showSnackbar('Utilisateur modifié avec succès')
      fetchUtilisateurs()
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur modification utilisateur:', error)
      const errorMessage = error.response?.data?.email?.[0] || 
                          error.response?.data?.detail || 
                          'Erreur lors de la modification'
      showSnackbar(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await AxiosInstance.delete(`users/${userToDelete.id}/`)
      showSnackbar('Utilisateur supprimé avec succès')
      fetchUtilisateurs()
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      const errorMessage = error.response?.data?.detail || 
                          'Erreur lors de la suppression'
      showSnackbar(errorMessage, 'error')
    }
  }

  // Réinitialiser le mot de passe
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Réinitialiser le mot de passe de "${user.email}" ? Le nouveau mot de passe sera "password123"`)) {
      return
    }

    try {
      await AxiosInstance.post(`users/${user.id}/reset-password/`, {
        new_password: 'password123'
      })
      showSnackbar('Mot de passe réinitialisé avec succès')
    } catch (error) {
      console.error('Erreur réinitialisation mot de passe:', error)
      showSnackbar('Fonctionnalité non implémentée', 'warning')
    }
  }

  // Utilisateurs filtrés
  const filteredUsers = utilisateurs.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(filters.search.toLowerCase())) ||
      (user.telephone && user.telephone.includes(filters.search))

    const matchesRole = !filters.role || user.role === filters.role

    return matchesSearch && matchesRole
  })

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Obtenir les informations du rôle
  const getRoleInfo = (role) => {
    return roleOptions.find(option => option.value === role) || roleOptions[1]
  }

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  // Avatar personnalisé pour les utilisateurs
  const UserAvatar = ({ user }) => {
    const roleInfo = getRoleInfo(user.role)
    return (
      <Avatar
        sx={{
          bgcolor: theme.palette[roleInfo.color].main,
          width: 48,
          height: 48,
          fontWeight: 'bold'
        }}
      >
        {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  // Statistiques
  const stats = {
    total: utilisateurs.length,
    admins: utilisateurs.filter(u => u.role === 'admin').length,
    vendeurs: utilisateurs.filter(u => u.role === 'vendeur').length,
    actifs: utilisateurs.filter(u => u.is_active).length
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
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez les accès et permissions de votre équipe
          </Typography>
        </Box>
        <Tooltip title="Nouvel utilisateur">
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
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<PersonIcon sx={{ fontSize: 28 }} />}
              title="TOTAL UTILISATEURS"
              value={stats.total}
              subtitle="Comptes actifs"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<AdminIcon sx={{ fontSize: 28 }} />}
              title="ADMINISTRATEURS"
              value={stats.admins}
              subtitle={`${stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}% du total`}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<SellerIcon sx={{ fontSize: 28 }} />}
              title="VENDEURS"
              value={stats.vendeurs}
              subtitle={`${stats.total > 0 ? Math.round((stats.vendeurs / stats.total) * 100) : 0}% du total`}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<SecurityIcon sx={{ fontSize: 28 }} />}
              title="COMPTES ACTIFS"
              value={stats.actifs}
              subtitle="Utilisateurs connectés"
              color="success"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Filtres améliorés */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Rechercher un utilisateur..."
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
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={filters.role}
                label="Rôle"
                onChange={(e) => handleFilterChange('role', e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Tous les rôles</MenuItem>
                {roleOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Actualiser la liste">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchUtilisateurs}
                  sx={{ borderRadius: 2 }}
                >
                  Actualiser
                </Button>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des utilisateurs amélioré */}
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
                <TableCell>UTILISATEUR</TableCell>
                <TableCell>CONTACT</TableCell>
                <TableCell>RÔLE</TableCell>
                <TableCell>INFORMATIONS</TableCell>
                <TableCell>STATUT</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={60} />
                      <Typography variant="h6" color="textSecondary">
                        Chargement des utilisateurs...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {filters.search || filters.role
                          ? 'Aucun utilisateur ne correspond aux critères'
                          : 'Aucun utilisateur enregistré'
                        }
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!filters.search && !filters.role && 'Commencez par ajouter votre premier utilisateur'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role)
                  return (
                    <TableRow 
                      key={user.id} 
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
                          <UserAvatar user={user} />
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.username || 'Aucun nom d\'utilisateur'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {user.telephone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {user.telephone}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={roleInfo.icon}
                          label={roleInfo.label}
                          color={roleInfo.color}
                          sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                        {user.is_superuser && (
                          <Chip 
                            label="Super Admin" 
                            size="small" 
                            color="warning" 
                            sx={{ mt: 0.5, fontWeight: 600 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {user.birthday && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CakeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatDate(user.birthday)}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" color="textSecondary">
                            Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            label={user.is_active ? 'Actif' : 'Inactif'}
                            color={user.is_active ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          {user.last_login && (
                            <Typography variant="caption" color="textSecondary">
                              Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Modifier l'utilisateur">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(user)}
                              sx={{ 
                                background: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer l'utilisateur">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(user)}
                              disabled={user.is_superuser}
                              sx={{ 
                                background: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { background: alpha(theme.palette.error.main, 0.2) }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Réinitialiser le mot de passe">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleResetPassword(user)}
                              sx={{ 
                                borderRadius: 2,
                                minWidth: 'auto',
                                px: 1,
                                background: alpha(theme.palette.warning.main, 0.1)
                              }}
                            >
                              🔑
                            </Button>
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
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredUsers.length}
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

      {/* Dialog pour ajouter/modifier un utilisateur amélioré */}
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
          {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Adresse email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Nom d'utilisateur"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Rôle *</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Rôle *"
                onChange={handleInputChange}
                required
                sx={{ borderRadius: 2 }}
              >
                {roleOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Adresse"
              name="adresse"
              multiline
              rows={2}
              value={formData.adresse}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Date de naissance"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {!editingUser && (
              <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                Un mot de passe par défaut "password123" sera attribué à l'utilisateur.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={submitting}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {submitting ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Créer l\'utilisateur')}
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
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>"{userToDelete?.email}"</strong> ? 
            Cette action est irréversible.
          </Typography>

          {userToDelete && (
            <Card variant="outlined" sx={{ mb: 3, p: 2, textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Email:</strong> {userToDelete.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Rôle:</strong> {getRoleInfo(userToDelete.role).label}
              </Typography>
              {userToDelete.username && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Nom d'utilisateur:</strong> {userToDelete.username}
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary">
                <strong>Créé le:</strong> {new Date(userToDelete.created_at).toLocaleDateString('fr-FR')}
              </Typography>
            </Card>
          )}

          {userToDelete?.is_superuser && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ Cet utilisateur est un Super Administrateur
            </Alert>
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
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={userToDelete?.is_superuser}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
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

// Composant Grid
const Grid = ({ children, container = false, item = false, ...props }) => {
  if (container) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 3,
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
  
  if (item) {
    return (
      <Box
        sx={{
          gridColumn: `span ${props.xs || 12}`,
          '@media (min-width: 600px)': {
            gridColumn: `span ${props.sm || props.xs || 6}`
          },
          '@media (min-width: 900px)': {
            gridColumn: `span ${props.md || props.sm || props.xs || 4}`
          },
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }

  return <Box {...props}>{children}</Box>
}

export default Utilisateurs