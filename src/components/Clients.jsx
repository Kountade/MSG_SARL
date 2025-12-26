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
  alpha,
  Avatar,
  InputAdornment,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CorporateFare as CorporateIcon,
  Group as GroupIcon
} from '@mui/icons-material'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')

  // Couleurs de l'entreprise
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'
  const black = '#000000'

  // Formulaire client
  const [formData, setFormData] = useState({
    nom: '',
    type_client: 'particulier',
    telephone: '',
    email: '',
    adresse: '',
    entreprise: '',
    notes: ''
  })

  // Récupérer la liste des clients
  const fetchClients = () => {
    setLoading(true)
    AxiosInstance.get('clients/')
      .then((res) => {
        setClients(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching clients:', err)
        setSnackbar({ open: true, message: 'Erreur lors du chargement des clients', severity: 'error' })
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // Ouvrir le dialog pour ajouter/modifier
  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        nom: client.nom || '',
        type_client: client.type_client || 'particulier',
        telephone: client.telephone || '',
        email: client.email || '',
        adresse: client.adresse || '',
        entreprise: client.entreprise || '',
        notes: client.notes || ''
      })
    } else {
      setEditingClient(null)
      setFormData({
        nom: '',
        type_client: 'particulier',
        telephone: '',
        email: '',
        adresse: '',
        entreprise: '',
        notes: ''
      })
    }
    setOpenDialog(true)
  }

  // Fermer le dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingClient(null)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (client) => {
    setClientToDelete(client)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setClientToDelete(null)
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Soumettre le formulaire (ajout ou modification)
  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      setSnackbar({ open: true, message: 'Le nom est obligatoire', severity: 'error' })
      return
    }

    if (editingClient) {
      // Modification
      AxiosInstance.put(`clients/${editingClient.id}/`, formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Client modifié avec succès', severity: 'success' })
          fetchClients()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error updating client:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' })
        })
    } else {
      // Ajout
      AxiosInstance.post('clients/', formData)
        .then(() => {
          setSnackbar({ open: true, message: 'Client ajouté avec succès', severity: 'success' })
          fetchClients()
          handleCloseDialog()
        })
        .catch((err) => {
          console.error('Error adding client:', err)
          setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' })
        })
    }
  }

  // Supprimer un client
  const handleDelete = () => {
    if (clientToDelete) {
      AxiosInstance.delete(`clients/${clientToDelete.id}/`)
        .then(() => {
          setSnackbar({ open: true, message: 'Client supprimé avec succès', severity: 'success' })
          fetchClients()
          handleCloseDeleteDialog()
        })
        .catch((err) => {
          console.error('Error deleting client:', err)
          setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' })
        })
    }
  }

  // Filtrer les clients selon la recherche
  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm) ||
    (client.entreprise && client.entreprise.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Statistiques
  const stats = {
    total: clients.length,
    particuliers: clients.filter(c => c.type_client === 'particulier').length,
    professionnels: clients.filter(c => c.type_client === 'professionnel').length
  }

  // Composant de carte de statistique amélioré
  const StatsCard = ({ icon, title, value, subtitle }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${alpha(darkCayn, 0.1)} 0%, ${alpha(vividOrange, 0.05)} 100%)`,
      border: `1px solid ${alpha(darkCayn, 0.2)}`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': { 
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(darkCayn, 0.15)}`,
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: darkCayn }}>
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
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
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

  // Avatar personnalisé pour les clients
  const ClientAvatar = ({ client }) => (
    <Avatar
      sx={{
        bgcolor: client.type_client === 'particulier' ? darkCayn : vividOrange,
        width: 40,
        height: 40
      }}
    >
      {client.nom ? client.nom.charAt(0).toUpperCase() : 'C'}
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
        <CircularProgress size={60} sx={{ color: darkCayn }} />
        <Typography variant="h6" color="textSecondary">
          Chargement des clients...
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
            background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Gestion des Clients
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez votre portefeuille clients efficacement
          </Typography>
        </Box>
        <Tooltip title="Ajouter un nouveau client">
          <Fab 
            onClick={() => handleOpenDialog()}
            sx={{
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
              boxShadow: `0 4px 20px ${alpha(darkCayn, 0.3)}`,
              '&:hover': {
                boxShadow: `0 8px 30px ${alpha(darkCayn, 0.4)}`,
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
            icon={<GroupIcon sx={{ fontSize: 28 }} />}
            title="TOTAL CLIENTS"
            value={stats.total}
            subtitle="Clients actifs"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<PersonIcon sx={{ fontSize: 28 }} />}
            title="PARTICULIERS"
            value={stats.particuliers}
            subtitle={`${stats.total > 0 ? Math.round((stats.particuliers / stats.total) * 100) : 0}% du total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            icon={<BusinessIcon sx={{ fontSize: 28 }} />}
            title="PROFESSIONNELS"
            value={stats.professionnels}
            subtitle={`${stats.total > 0 ? Math.round((stats.professionnels / stats.total) * 100) : 0}% du total`}
          />
        </Grid>
      </Grid>

      {/* Barre de recherche améliorée */}
      <Card sx={{ 
        mb: 3, 
        p: 2,
        borderRadius: 3,
        border: `1px solid ${alpha(darkCayn, 0.1)}`
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un client par nom, email, téléphone ou entreprise..."
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
      </Card>

      {/* Tableau des clients amélioré */}
      <Card sx={{ 
        boxShadow: `0 4px 20px ${alpha(darkCayn, 0.1)}`, 
        borderRadius: 3,
        border: `1px solid ${alpha(darkCayn, 0.1)}`
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha(darkCayn, 0.04),
                '& th': { 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem',
                  color: darkCayn,
                  borderBottom: `2px solid ${alpha(darkCayn, 0.2)}`
                }
              }}>
                <TableCell>CLIENT</TableCell>
                <TableCell>TYPE</TableCell>
                <TableCell>CONTACT</TableCell>
                <TableCell>ENTREPRISE</TableCell>
                <TableCell>ADRESSE</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!searchTerm && 'Commencez par ajouter votre premier client'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    hover 
                    sx={{ 
                      '&:last-child td': { borderBottom: 0 },
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(darkCayn, 0.02),
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ClientAvatar client={client} />
                        <Box>
                          <Typography variant="body1" fontWeight="600" color={darkCayn}>
                            {client.nom}
                          </Typography>
                          {client.email && (
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 12 }} />
                              {client.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.type_client === 'particulier' ? 'Particulier' : 'Professionnel'}
                        sx={{ 
                          fontWeight: 600,
                          borderRadius: 1,
                          backgroundColor: client.type_client === 'particulier' ? alpha(darkCayn, 0.1) : alpha(vividOrange, 0.1),
                          color: client.type_client === 'particulier' ? darkCayn : vividOrange,
                          border: `1px solid ${client.type_client === 'particulier' ? alpha(darkCayn, 0.3) : alpha(vividOrange, 0.3)}`
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {client.telephone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: darkCayn }} />
                          <Typography variant="body2">
                            {client.telephone}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Non renseigné
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.entreprise ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CorporateIcon sx={{ fontSize: 16, color: darkCayn }} />
                          <Typography variant="body2" fontWeight="500" color={darkCayn}>
                            {client.entreprise}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.adresse ? (
                        <Tooltip title={client.adresse}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon sx={{ fontSize: 16, color: darkCayn }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 150, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap' 
                              }}
                            >
                              {client.adresse}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Modifier le client">
                          <IconButton 
                            onClick={() => handleOpenDialog(client)}
                            sx={{ 
                              color: darkCayn,
                              background: alpha(darkCayn, 0.1),
                              '&:hover': { 
                                background: alpha(darkCayn, 0.2),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer le client">
                          <IconButton 
                            onClick={() => handleOpenDeleteDialog(client)}
                            sx={{ 
                              color: '#d32f2f',
                              background: alpha('#d32f2f', 0.1),
                              '&:hover': { 
                                background: alpha('#d32f2f', 0.2),
                                transform: 'scale(1.1)'
                              }
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

      {/* Dialog pour ajouter/modifier un client */}
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
          {editingClient ? 'Modifier le client' : 'Nouveau client'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom complet *"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: darkCayn,
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type de client"
                name="type_client"
                value={formData.type_client}
                onChange={handleInputChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: darkCayn,
                    },
                  }
                }}
              >
                <MenuItem value="particulier">Particulier</MenuItem>
                <MenuItem value="professionnel">Professionnel</MenuItem>
              </TextField>
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
                      <PhoneIcon sx={{ color: darkCayn }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: darkCayn,
                    },
                  }
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
                      <EmailIcon sx={{ color: darkCayn }} />
                    </InputAdornment>
                  ),
                }}
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
                label="Entreprise"
                name="entreprise"
                value={formData.entreprise}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CorporateIcon sx={{ color: darkCayn }} />
                    </InputAdornment>
                  ),
                }}
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
                label="Adresse"
                name="adresse"
                multiline
                rows={2}
                value={formData.adresse}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: darkCayn }} />
                    </InputAdornment>
                  ),
                }}
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
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Informations supplémentaires sur le client..."
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
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
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
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.nom.trim()}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
              '&:disabled': {
                background: alpha(darkCayn, 0.3)
              }
            }}
          >
            {editingClient ? 'Modifier le client' : 'Créer le client'}
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
              backgroundColor: alpha('#d32f2f', 0.1),
              margin: '0 auto 20px'
            }}
          >
            <DeleteIcon sx={{ fontSize: 40, color: '#d32f2f' }} />
          </Box>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: darkCayn }}>
            Confirmer la suppression
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Êtes-vous sûr de vouloir supprimer le client <strong>"{clientToDelete?.nom}"</strong> ? 
            Cette action est irréversible.
          </Typography>

          {clientToDelete && (
            <Card variant="outlined" sx={{ 
              mb: 3, 
              p: 2, 
              textAlign: 'left',
              borderColor: alpha(darkCayn, 0.2)
            }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Nom:</strong> {clientToDelete.nom}
              </Typography>
              {clientToDelete.email && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Email:</strong> {clientToDelete.email}
                </Typography>
              )}
              {clientToDelete.telephone && (
                <Typography variant="body2" color="textSecondary">
                  <strong>Téléphone:</strong> {clientToDelete.telephone}
                </Typography>
              )}
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              minWidth: 120,
              borderColor: darkCayn,
              color: darkCayn,
              '&:hover': {
                borderColor: vividOrange,
                backgroundColor: alpha(vividOrange, 0.04)
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              minWidth: 120,
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
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
            maxWidth: 400,
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Clients