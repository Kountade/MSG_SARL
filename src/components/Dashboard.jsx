// src/components/Dashboard.jsx
import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'; 
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
  Chip,
  CircularProgress,
  Alert,
  Button,
  alpha,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Refresh as RefreshIcon,
  Warehouse as WarehouseIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  CheckCircle as CheckCircleIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Couleurs de l'entreprise
  const DARK_CYAN = '#003C3f'
  const VIVID_ORANGE = '#DA4A0E'
  const BLACK = '#000000'
  const LIGHT_CYAN = alpha(DARK_CYAN, 0.1)
  const LIGHT_ORANGE = alpha(VIVID_ORANGE, 0.1)

  // Fonction pour charger les données
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('Token')
      if (!token) {
        throw new Error('Session expirée')
      }

      const response = await AxiosInstance.get('dashboard/')
      
      if (response.data) {
        setDashboardData(response.data)
      } else {
        throw new Error('Données non disponibles')
      }
      
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de chargement')
      setDashboardData(getDemoData())
    } finally {
      setLoading(false)
    }
  }

  // Données de démo
  const getDemoData = () => ({
    stats: {
      total_ventes: 156,
      chiffre_affaires: 45678.90,
      total_clients: 42,
      total_produits: 123,
      total_entrepots: 3,
      valeur_stock_total: 23456.78,
      chiffre_affaires_mois: 12345.67,
      chiffre_affaires_semaine: 4567.89,
      ventes_ce_mois: 23,
      croissance_ventes: 27.8,
      objectif_mois: 50000,
      realisation_objectif: 91
    },
    produits_low_stock: [
      { id: 1, nom: 'Smartphone X', stock_actuel: 2, stock_alerte: 5, statut: 'faible', code: 'SMX001', entrepot: 'Principal' },
      { id: 2, nom: 'Ordinateur Portable', stock_actuel: 0, stock_alerte: 3, statut: 'rupture', code: 'LAP002', entrepot: 'Principal' },
      { id: 3, nom: 'Écran 24"', stock_actuel: 4, stock_alerte: 10, statut: 'faible', code: 'MON003', entrepot: 'Secondaire' },
      { id: 4, nom: 'Clavier Mécanique', stock_actuel: 1, stock_alerte: 5, statut: 'faible', code: 'KEY004', entrepot: 'Régional' }
    ],
    dernieres_ventes: [
      { id: 1, numero_vente: 'V20250115001', client_nom: 'Entreprise Tech', montant_total: 456.78, created_at: new Date().toISOString(), statut: 'confirmee' },
      { id: 2, numero_vente: 'V20250115002', client_nom: 'SARL Informatique', montant_total: 1234.56, created_at: new Date().toISOString(), statut: 'confirmee' },
      { id: 3, numero_vente: 'V20250115003', client_nom: 'Particulier Dupont', montant_total: 789.12, created_at: new Date().toISOString(), statut: 'confirmee' },
      { id: 4, numero_vente: 'V20250115004', client_nom: 'Société Innovation', montant_total: 2345.67, created_at: new Date().toISOString(), statut: 'confirmee' },
      { id: 5, numero_vente: 'V20250115005', client_nom: 'Startup Digital', montant_total: 567.89, created_at: new Date().toISOString(), statut: 'confirmee' }
    ],
    entrepots: [
      { id: 1, nom: 'Entrepôt Principal', valeur_stock: 12345.67, produits_count: 56, statut: 'actif', occupation: 56 },
      { id: 2, nom: 'Entrepôt Secondaire', valeur_stock: 6789.01, produits_count: 34, statut: 'actif', occupation: 68 },
      { id: 3, nom: 'Entrepôt Régional', valeur_stock: 4321.09, produits_count: 23, statut: 'actif', occupation: 58 }
    ],
    top_produits: [
      { id: 1, nom: 'Smartphone X', total_vendu: 45, chiffre_affaires: 22500, croissance: 15 },
      { id: 2, nom: 'Ordinateur Portable', total_vendu: 32, chiffre_affaires: 25600, croissance: 8 },
      { id: 3, nom: 'Écran 24"', total_vendu: 28, chiffre_affaires: 11200, croissance: 22 }
    ]
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Formatage
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <CircularProgress size={60} sx={{ color: VIVID_ORANGE }} />
      </Box>
    )
  }

  const { stats, produits_low_stock, dernieres_ventes, entrepots, top_produits } = dashboardData || {}

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      overflow: 'auto',
      py: 2,
      px: 2
    }}>
      {/* Bannière objectif */}
      <Paper sx={{ 
        bgcolor: DARK_CYAN, 
        color: 'white',
        p: 3,
        mb: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute',
          right: -20,
          top: -20,
          width: 150,
          height: 150,
          bgcolor: alpha(VIVID_ORANGE, 0.2),
          borderRadius: '50%'
        }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Suivez vos performances en temps réel
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Objectif mensuel : {formatMoney(stats?.objectif_mois || 0)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" fontWeight="bold" color={VIVID_ORANGE}>
                {stats?.realisation_objectif || 0}%
              </Typography>
              <Typography variant="body2">Réalisé</Typography>
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <LinearProgress 
                variant="determinate" 
                value={stats?.realisation_objectif || 0}
                sx={{
                  height: 16,
                  borderRadius: 8,
                  bgcolor: alpha('#fff', 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: VIVID_ORANGE,
                    borderRadius: 8
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {stats?.ventes_ce_mois || 0}
              </Typography>
              <Typography variant="body2">Ventes ce mois</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold">
                {formatMoney(stats?.chiffre_affaires_semaine || 0)}
              </Typography>
              <Typography variant="body2">CA cette semaine</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenu principal - 2 colonnes */}
      <Grid container spacing={3}>
        {/* Colonne gauche - 8/12 pour grand écran, 12/12 pour mobile */}
        <Grid item xs={12} lg={8}>
          {/* Statistiques principales - 4 cartes */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Carte CA */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
                borderTop: `4px solid ${DARK_CYAN}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: alpha(DARK_CYAN, 0.1), 
                      p: 1.5, 
                      borderRadius: 2 
                    }}>
                      <MoneyIcon sx={{ color: DARK_CYAN, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color={DARK_CYAN}>
                        {formatMoney(stats?.chiffre_affaires)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Chiffre d'affaires
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <ArrowUpwardIcon sx={{ color: VIVID_ORANGE }} />
                    <Typography variant="body2" color={VIVID_ORANGE} fontWeight="600">
                      +{stats?.croissance_ventes}% vs mois précédent
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Ventes */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
                borderTop: `4px solid ${VIVID_ORANGE}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: alpha(VIVID_ORANGE, 0.1), 
                      p: 1.5, 
                      borderRadius: 2 
                    }}>
                      <ReceiptIcon sx={{ color: VIVID_ORANGE, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color={VIVID_ORANGE}>
                        {stats?.total_ventes}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Ventes totales
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    {stats?.ventes_ce_mois} ce mois
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Clients */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
                borderTop: `4px solid ${BLACK}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: alpha(BLACK, 0.1), 
                      p: 1.5, 
                      borderRadius: 2 
                    }}>
                      <PeopleIcon sx={{ color: BLACK, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color={BLACK}>
                        {stats?.total_clients}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Clients actifs
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Base clientèle
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Stock */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: '100%',
                borderTop: `4px solid ${DARK_CYAN}`
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: alpha(DARK_CYAN, 0.1), 
                      p: 1.5, 
                      borderRadius: 2 
                    }}>
                      <WarehouseIcon sx={{ color: DARK_CYAN, fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color={DARK_CYAN}>
                        {formatMoney(stats?.valeur_stock_total)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Valeur stock
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    {stats?.total_produits} produits
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tableau des dernières ventes */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 3
              }}>
                <Typography variant="h5" fontWeight="bold" color={DARK_CYAN} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CartIcon /> Dernières ventes
                </Typography>
               <Button 
  component={Link}
  to="/ventes"
  variant="outlined" 
  startIcon={<VisibilityIcon />}
  sx={{ 
    borderColor: DARK_CYAN,
    color: DARK_CYAN,
    '&:hover': { 
      borderColor: VIVID_ORANGE,
      bgcolor: alpha(VIVID_ORANGE, 0.05)
    }
  }}
>
  Voir toutes
</Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ 
                      bgcolor: LIGHT_CYAN,
                      '& th': { 
                        fontWeight: 'bold',
                        color: DARK_CYAN,
                        fontSize: '1rem',
                        py: 2,
                        borderBottom: `2px solid ${DARK_CYAN}`
                      }
                    }}>
                      <TableCell>N° VENTE</TableCell>
                      <TableCell>CLIENT</TableCell>
                      <TableCell>DATE</TableCell>
                      <TableCell align="right">MONTANT</TableCell>
                      <TableCell align="center">STATUT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dernieres_ventes?.map((vente, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:hover': { bgcolor: LIGHT_CYAN },
                          '& td': { 
                            py: 2,
                            fontSize: '1rem'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body1" fontWeight="600">
                            {vente.numero_vente}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {vente.client_nom}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" color="textSecondary">
                            {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color={DARK_CYAN}>
                            {formatMoney(vente.montant_total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label="Confirmé"
                            icon={<CheckCircleIcon />}
                            sx={{
                              bgcolor: alpha('#4caf50', 0.1),
                              color: '#4caf50',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              px: 1
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Colonne droite - 4/12 pour grand écran, 12/12 pour mobile */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Alertes stock */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" color={VIVID_ORANGE} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <WarningIcon /> Alertes stock
                </Typography>

                <Stack spacing={2}>
                  {produits_low_stock?.map((produit, index) => (
                    <Paper 
                      key={index}
                      sx={{ 
                        p: 2.5,
                        borderRadius: 2,
                        border: `2px solid ${alpha(VIVID_ORANGE, 0.3)}`,
                        bgcolor: alpha(VIVID_ORANGE, 0.05)
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {produit.nom}
                        </Typography>
                        <Chip
                          label={produit.statut === 'rupture' ? 'RUPTURE' : 'FAIBLE'}
                          sx={{
                            bgcolor: alpha(VIVID_ORANGE, 0.2),
                            color: VIVID_ORANGE,
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="textSecondary">
                          Code: {produit.code} • {produit.entrepot}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="bold">
                          Stock: {produit.stock_actuel}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Seuil: {produit.stock_alerte}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
                
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<InventoryIcon />}
                  sx={{
                    mt: 3,
                    bgcolor: VIVID_ORANGE,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: alpha(VIVID_ORANGE, 0.9) }
                  }}
                >
                  Gérer le stock
                </Button>
              </CardContent>
            </Card>

            {/* Entrepôts */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" color={DARK_CYAN} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <WarehouseIcon /> Entrepôts
                </Typography>

                <Stack spacing={2}>
                  {entrepots?.map((entrepot, index) => (
                    <Paper 
                      key={index}
                      sx={{ 
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(DARK_CYAN, 0.2)}`,
                        bgcolor: LIGHT_CYAN
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {entrepot.nom}
                        </Typography>
                        <Chip
                          label="ACTIF"
                          size="small"
                          sx={{
                            bgcolor: alpha('#4caf50', 0.1),
                            color: '#4caf50',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Valeur stock
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color={DARK_CYAN}>
                              {formatMoney(entrepot.valeur_stock)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Produits
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {entrepot.produits_count}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Occupation
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {entrepot.occupation}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={entrepot.occupation}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(DARK_CYAN, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: DARK_CYAN,
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Top produits */}
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" color={VIVID_ORANGE} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrendingUpIcon /> Top produits
                </Typography>

                <Stack spacing={2}>
                  {top_produits?.map((produit, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(VIVID_ORANGE, 0.05),
                        border: `1px solid ${alpha(VIVID_ORANGE, 0.1)}`
                      }}
                    >
                      <Avatar sx={{ 
                        bgcolor: index === 0 ? VIVID_ORANGE : alpha(VIVID_ORANGE, 0.1),
                        color: index === 0 ? 'white' : VIVID_ORANGE,
                        mr: 2,
                        width: 40,
                        height: 40,
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {produit.nom}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {produit.total_vendu} vendus • +{produit.croissance}%
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" fontWeight="bold" color={DARK_CYAN}>
                        {formatMoney(produit.chiffre_affaires)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard