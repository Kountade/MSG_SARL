import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  TablePagination,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material'

const Rapports = () => {
  const [loading, setLoading] = useState(false)
  const [rapportsData, setRapportsData] = useState(null)
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    typeRapport: 'ventes',
    categorie: '',
    vendeur: ''
  })
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const theme = useTheme()

  // Données pour les sélecteurs
  const [categories, setCategories] = useState([])
  const [vendeurs, setVendeurs] = useState([])

  // Récupérer les données initiales
  useEffect(() => {
    fetchDonneesInitiales()
  }, [])

  const fetchDonneesInitiales = async () => {
    try {
      setLoading(true)
      const [categoriesRes, vendeursRes] = await Promise.all([
        AxiosInstance.get('categories/'),
        AxiosInstance.get('users/')
      ])
      
      setCategories(categoriesRes.data)
      setVendeurs(vendeursRes.data.filter(user => user.role === 'vendeur'))
    } catch (error) {
      console.error('Erreur chargement données initiales:', error)
    } finally {
      setLoading(false)
    }
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

  // Générer les rapports
  const genererRapports = async () => {
    if (!filters.dateDebut || !filters.dateFin) {
      alert('Veuillez sélectionner une période')
      return
    }

    setLoading(true)
    try {
      let endpoint = ''
      const params = {
        date_debut: filters.dateDebut,
        date_fin: filters.dateFin
      }

      // Ajouter les filtres supplémentaires selon le type de rapport
      if (filters.categorie) params.categorie = filters.categorie
      if (filters.vendeur) params.vendeur = filters.vendeur

      switch (filters.typeRapport) {
        case 'ventes':
          endpoint = 'rapports/ventes/'
          break
        case 'stocks':
          endpoint = 'rapports/stocks/'
          break
        case 'clients':
          endpoint = 'rapports/clients/'
          break
        case 'mouvements':
          endpoint = 'rapports/mouvements-stock/'
          break
        default:
          endpoint = 'rapports/ventes/'
      }

      const response = await AxiosInstance.get(endpoint, { params })
      setRapportsData(response.data)
    } catch (error) {
      console.error('Erreur génération rapports:', error)
      alert('Erreur lors de la génération des rapports')
    } finally {
      setLoading(false)
    }
  }

  // Exporter les rapports
  const exporterRapport = () => {
    if (!rapportsData) return

    let contenu = ''
    const dateExport = new Date().toLocaleDateString('fr-FR')

    switch (filters.typeRapport) {
      case 'ventes':
        contenu = genererCSVVentes()
        break
      case 'stocks':
        contenu = genererCSVStocks()
        break
      case 'clients':
        contenu = genererCSVClients()
        break
      case 'mouvements':
        contenu = genererCSVMouvements()
        break
      default:
        return
    }

    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport_${filters.typeRapport}_${dateExport}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const genererCSVVentes = () => {
    let csv = 'Rapport Ventes\n\n'
    csv += `Période: ${filters.dateDebut} - ${filters.dateFin}\n\n`
    
    // Statistiques
    if (rapportsData.stats) {
      csv += 'STATISTIQUES\n'
      csv += `Total Ventes,${rapportsData.stats.total_ventes}\n`
      csv += `Chiffre d'Affaires Total,${rapportsData.stats.chiffre_affaires_total}\n`
      csv += `Vendeur Top,${rapportsData.stats.top_vendeur}\n`
      csv += `Produit Top,${rapportsData.stats.top_produit}\n\n`
    }

    // Détails des ventes
    if (rapportsData.ventes_detaillees) {
      csv += 'DÉTAILS DES VENTES\n'
      csv += 'Date,Numéro Vente,Client,Vendeur,Montant,Statut\n'
      rapportsData.ventes_detaillees.forEach(vente => {
        csv += `${new Date(vente.created_at).toLocaleDateString('fr-FR')},${vente.numero_vente},${vente.client_nom || 'N/A'},${vente.created_by_email},${vente.montant_total},${vente.statut}\n`
      })
    }

    return csv
  }

  const genererCSVStocks = () => {
    let csv = 'Rapport Stocks\n\n'
    
    if (rapportsData.produits_stock) {
      csv += 'ÉTAT DES STOCKS\n'
      csv += 'Produit,Code,Catégorie,Stock Actuel,Stock Alerte,Statut,Prix Achat,Prix Vente\n'
      rapportsData.produits_stock.forEach(produit => {
        csv += `${produit.nom},${produit.code},${produit.categorie_nom},${produit.stock_actuel},${produit.stock_alerte},${produit.statut},${produit.prix_achat},${produit.prix_vente}\n`
      })
    }

    return csv
  }

  const genererCSVClients = () => {
    let csv = 'Rapport Clients\n\n'
    
    if (rapportsData.clients) {
      csv += 'CLIENTS\n'
      csv += 'Nom,Type,Téléphone,Email,Total Achats,Nombre Commandes\n'
      rapportsData.clients.forEach(client => {
        csv += `${client.nom},${client.type_client},${client.telephone},${client.email || 'N/A'},${client.total_achats || 0},${client.nombre_commandes || 0}\n`
      })
    }

    return csv
  }

  const genererCSVMouvements = () => {
    let csv = 'Rapport Mouvements de Stock\n\n'
    
    if (rapportsData.mouvements) {
      csv += 'MOUVEMENTS DE STOCK\n'
      csv += 'Date,Produit,Type,Quantité,Motif,Utilisateur\n'
      rapportsData.mouvements.forEach(mouvement => {
        csv += `${new Date(mouvement.created_at).toLocaleDateString('fr-FR')},${mouvement.produit_nom},${mouvement.type_mouvement},${mouvement.quantite},${mouvement.motif},${mouvement.created_by_email}\n`
      })
    }

    return csv
  }

  // Gestion des changements de filtre
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

  // Composant pour les statistiques amélioré
  const StatsCards = ({ data }) => {
    if (!data || !data.stats) return null

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ReceiptIcon sx={{ fontSize: 28 }} />}
            title="TOTAL VENTES"
            value={data.stats.total_ventes}
            subtitle="Transactions"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            title="CHIFFRE D'AFFAIRES"
            value={`${parseFloat(data.stats.chiffre_affaires_total || 0).toFixed(0)}€`}
            subtitle="Revenus totaux"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            title="CLIENTS ACTIFS"
            value={data.stats.clients_actifs || 0}
            subtitle="Clients uniques"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            title="PRODUITS VENDUS"
            value={data.stats.total_produits_vendus || 0}
            subtitle="Articles écoulés"
            color="warning"
          />
        </Grid>
      </Grid>
    )
  }

  // Obtenir le libellé du type de rapport
  const getRapportLabel = (type) => {
    switch (type) {
      case 'ventes': return 'Ventes'
      case 'stocks': return 'Stocks'
      case 'clients': return 'Clients'
      case 'mouvements': return 'Mouvements'
      default: return type
    }
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* En-tête avec titre */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Rapports et Statistiques
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
          Analysez vos performances commerciales
        </Typography>
      </Box>

      {/* Filtres améliorés */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Paramètres du Rapport
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type de rapport</InputLabel>
              <Select
                value={filters.typeRapport}
                label="Type de rapport"
                onChange={(e) => handleFilterChange('typeRapport', e.target.value)}
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <AnalyticsIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="ventes">Ventes</MenuItem>
                <MenuItem value="stocks">Stocks</MenuItem>
                <MenuItem value="clients">Clients</MenuItem>
                <MenuItem value="mouvements">Mouvements Stock</MenuItem>
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
              InputLabelProps={{
                shrink: true,
              }}
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
              InputLabelProps={{
                shrink: true,
              }}
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

          {filters.typeRapport === 'ventes' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={filters.categorie}
                    label="Catégorie"
                    onChange={(e) => handleFilterChange('categorie', e.target.value)}
                    sx={{ borderRadius: 2 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.nom}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Vendeur</InputLabel>
                  <Select
                    value={filters.vendeur}
                    label="Vendeur"
                    onChange={(e) => handleFilterChange('vendeur', e.target.value)}
                    sx={{ borderRadius: 2 }}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {vendeurs.map(vendeur => (
                      <MenuItem key={vendeur.id} value={vendeur.id}>{vendeur.email}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <BarChartIcon />}
              onClick={genererRapports}
              disabled={loading || !filters.dateDebut || !filters.dateFin}
              fullWidth
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '56px'
              }}
            >
              {loading ? 'Génération...' : 'Générer'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {rapportsData && (
        <>
          {/* En-tête du rapport avec bouton d'export */}
          <Card sx={{ mb: 3, p: 2, background: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Rapport {getRapportLabel(filters.typeRapport)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Période: {filters.dateDebut} - {filters.dateFin}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Exporter en CSV">
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exporterRapport}
                    sx={{ borderRadius: 2 }}
                  >
                    CSV
                  </Button>
                </Tooltip>
                <Tooltip title="Exporter en PDF">
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    sx={{ 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    PDF
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Card>

          {/* Statistiques */}
          <StatsCards data={rapportsData} />

          {/* Contenu des rapports par type */}
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {filters.typeRapport === 'ventes' && 'Détails des Ventes'}
                  {filters.typeRapport === 'stocks' && 'État des Stocks'}
                  {filters.typeRapport === 'clients' && 'Rapport Clients'}
                  {filters.typeRapport === 'mouvements' && 'Mouvements de Stock'}
                </Typography>
              </Box>

              {filters.typeRapport === 'ventes' && (
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
                        <TableCell>DATE</TableCell>
                        <TableCell>N° VENTE</TableCell>
                        <TableCell>CLIENT</TableCell>
                        <TableCell>VENDEUR</TableCell>
                        <TableCell align="right">MONTANT</TableCell>
                        <TableCell align="center">STATUT</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rapportsData.ventes_detaillees?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vente) => (
                        <TableRow key={vente.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(vente.created_at).toLocaleTimeString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {vente.numero_vente}
                            </Typography>
                          </TableCell>
                          <TableCell>{vente.client_nom || 'N/A'}</TableCell>
                          <TableCell>{vente.created_by_email}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {parseFloat(vente.montant_total).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={vente.statut}
                              color={
                                vente.statut === 'confirmee' ? 'success' :
                                vente.statut === 'brouillon' ? 'warning' : 'error'
                              }
                              size="small"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {filters.typeRapport === 'stocks' && (
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
                        <TableCell>PRODUIT</TableCell>
                        <TableCell>CODE</TableCell>
                        <TableCell>CATÉGORIE</TableCell>
                        <TableCell align="center">STOCK ACTUEL</TableCell>
                        <TableCell align="center">STOCK ALERTE</TableCell>
                        <TableCell align="center">STATUT</TableCell>
                        <TableCell align="right">PRIX ACHAT</TableCell>
                        <TableCell align="right">PRIX VENTE</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rapportsData.produits_stock?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((produit) => (
                        <TableRow key={produit.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {produit.nom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={produit.code} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{produit.categorie_nom}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={
                                produit.stock_actuel <= 0 ? 'error' :
                                produit.stock_actuel <= produit.stock_alerte ? 'warning' : 'success'
                              }
                            >
                              {produit.stock_actuel}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {produit.stock_alerte}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={produit.statut}
                              color={
                                produit.statut === 'normal' ? 'success' :
                                produit.statut === 'faible' ? 'warning' : 'error'
                              }
                              size="small"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {parseFloat(produit.prix_achat).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {parseFloat(produit.prix_vente).toFixed(2)} €
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {filters.typeRapport === 'clients' && (
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
                        <TableCell>CLIENT</TableCell>
                        <TableCell>TYPE</TableCell>
                        <TableCell>TÉLÉPHONE</TableCell>
                        <TableCell>EMAIL</TableCell>
                        <TableCell align="right">TOTAL ACHATS</TableCell>
                        <TableCell align="center">NOMBRE COMMANDES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rapportsData.clients?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => (
                        <TableRow key={client.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {client.nom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={client.type_client === 'particulier' ? 'Particulier' : 'Professionnel'}
                              color={client.type_client === 'particulier' ? 'primary' : 'secondary'}
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>{client.telephone}</TableCell>
                          <TableCell>{client.email || 'N/A'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {parseFloat(client.total_achats || 0).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={client.nombre_commandes || 0}
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {filters.typeRapport === 'mouvements' && (
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
                        <TableCell>DATE</TableCell>
                        <TableCell>PRODUIT</TableCell>
                        <TableCell>TYPE</TableCell>
                        <TableCell align="center">QUANTITÉ</TableCell>
                        <TableCell>MOTIF</TableCell>
                        <TableCell>UTILISATEUR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rapportsData.mouvements?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((mouvement) => (
                        <TableRow key={mouvement.id} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(mouvement.created_at).toLocaleDateString('fr-FR')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {mouvement.produit_nom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={mouvement.type_mouvement}
                              color={
                                mouvement.type_mouvement === 'entree' ? 'success' :
                                mouvement.type_mouvement === 'sortie' ? 'error' : 'warning'
                              }
                              size="small"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={mouvement.type_mouvement === 'entree' ? 'success.main' : 'error.main'}
                            >
                              {mouvement.type_mouvement === 'entree' ? '+' : '-'}{mouvement.quantite}
                            </Typography>
                          </TableCell>
                          <TableCell>{mouvement.motif}</TableCell>
                          <TableCell>{mouvement.created_by_email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={
                  filters.typeRapport === 'ventes' ? rapportsData.ventes_detaillees?.length || 0 :
                  filters.typeRapport === 'stocks' ? rapportsData.produits_stock?.length || 0 :
                  filters.typeRapport === 'clients' ? rapportsData.clients?.length || 0 :
                  rapportsData.mouvements?.length || 0
                }
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page"
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {!rapportsData && !loading && (
        <Card sx={{ textAlign: 'center', py: 8, background: alpha(theme.palette.primary.main, 0.02) }}>
          <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Aucun rapport généré
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sélectionnez une période et cliquez sur "Générer" pour afficher les rapports
          </Typography>
        </Card>
      )}

      {loading && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Génération des rapports en cours...
          </Typography>
          <LinearProgress sx={{ mt: 2, mx: 4 }} />
        </Card>
      )}
    </Box>
  )
}

export default Rapports