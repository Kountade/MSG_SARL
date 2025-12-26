// src/components/Statistiques.jsx
import AxiosInstance from './AxiosInstance'
import { React, useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  TextField
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  Euro as EuroIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const Statistiques = () => {
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState(0)
  const [stats, setStats] = useState(null)
  const [rapportsData, setRapportsData] = useState({
    ventes: [],
    produits: [],
    entrepots: [],
    clients: []
  })
  const [dateRange, setDateRange] = useState({
    debut: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })
  const theme = useTheme()

  // Fonction pour formater la date au format YYYY-MM-DD
  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Récupérer les statistiques du dashboard
  const fetchStats = () => {
    setLoading(true)
    
    // Récupérer d'abord les données du dashboard
    AxiosInstance.get('dashboard/')
      .then((response) => {
        console.log('Données dashboard:', response.data)
        setStats(response.data)
        
        // Utiliser les dates formatées pour les rapports
        const dateDebut = formatDateForAPI(dateRange.debut)
        const dateFin = formatDateForAPI(dateRange.fin)
        
        // Récupérer les rapports détaillés
        return Promise.all([
          // Pour les ventes - utiliser l'endpoint /rapports/ventes/
          AxiosInstance.get(`rapports/ventes/?date_debut=${dateDebut}&date_fin=${dateFin}`),
          // Pour les stocks - utiliser l'endpoint /produits/ avec query params
          AxiosInstance.get('produits/'),
          // Pour les entrepôts - utiliser l'endpoint /entrepots/
          AxiosInstance.get('entrepots/'),
          // Pour les clients - utiliser l'endpoint /clients/ avec possible filtrage
          AxiosInstance.get('clients/')
        ])
      })
      .then(([ventesRes, produitsRes, entrepotsRes, clientsRes]) => {
        console.log('Données chargées:', {
          ventes: ventesRes.data,
          produits: produitsRes.data,
          entrepots: entrepotsRes.data,
          clients: clientsRes.data
        })

        // Traiter les données pour les adapter à votre interface
        let ventesData = []
        if (ventesRes.data && ventesRes.data.ventes_detaillees) {
          ventesData = ventesRes.data.ventes_detaillees
        } else if (Array.isArray(ventesRes.data)) {
          ventesData = ventesRes.data
        }

        // Pour les produits, récupérer les stocks depuis l'endpoint /stock-entrepot/
        AxiosInstance.get('stock-entrepot/')
          .then(stocksRes => {
            setRapportsData({
              ventes: ventesData,
              produits: stocksRes.data || [],
              entrepots: entrepotsRes.data || [],
              clients: clientsRes.data || []
            })
          })
          .catch(stockErr => {
            console.error('Error fetching stocks:', stockErr)
            setRapportsData({
              ventes: ventesData,
              produits: produitsRes.data || [],
              entrepots: entrepotsRes.data || [],
              clients: clientsRes.data || []
            })
          })
          .finally(() => {
            setLoading(false)
          })
      })
      .catch((err) => {
        console.error('Error fetching stats:', err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Rafraîchir quand la période change
  useEffect(() => {
    if (!loading) {
      const fetchRapportsWithDate = () => {
        const dateDebut = formatDateForAPI(dateRange.debut)
        const dateFin = formatDateForAPI(dateRange.fin)
        
        AxiosInstance.get(`rapports/ventes/?date_debut=${dateDebut}&date_fin=${dateFin}`)
          .then(response => {
            let ventesData = []
            if (response.data && response.data.ventes_detaillees) {
              ventesData = response.data.ventes_detaillees
            } else if (Array.isArray(response.data)) {
              ventesData = response.data
            }
            
            setRapportsData(prev => ({
              ...prev,
              ventes: ventesData
            }))
          })
          .catch(err => {
            console.error('Error fetching ventes by date:', err)
          })
      }
      
      fetchRapportsWithDate()
    }
  }, [dateRange])

  // Formatage de date pour affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Données pour l'évolution (à adapter avec vos données réelles)
    const evolutionData = [
      { date: 'Lun', ventes: 4, chiffre_affaires: 1250 },
      { date: 'Mar', ventes: 6, chiffre_affaires: 1850 },
      { date: 'Mer', ventes: 3, chiffre_affaires: 950 },
      { date: 'Jeu', ventes: 8, chiffre_affaires: 2450 },
      { date: 'Ven', ventes: 10, chiffre_affaires: 3150 },
      { date: 'Sam', ventes: 7, chiffre_affaires: 2150 },
      { date: 'Dim', ventes: 5, chiffre_affaires: 1650 }
    ]

    // Top produits (à partir des données réelles)
    const topProduits = rapportsData.produits
      .slice(0, 5)
      .map(prod => ({
        name: prod.produit_nom || prod.nom || 'Produit',
        valeur: (prod.quantite_disponible || 0) * (prod.produit?.prix_achat || 1)
      }))

    // Répartition des stocks par statut
    const stockStatutsData = [
      { name: 'Normal', value: rapportsData.produits.filter(p => !p.en_rupture && !p.stock_faible).length },
      { name: 'Faible', value: rapportsData.produits.filter(p => p.stock_faible).length },
      { name: 'Rupture', value: rapportsData.produits.filter(p => p.en_rupture).length }
    ]

    return {
      evolutionData,
      topProduits,
      stockStatutsData
    }
  }

  const chartData = prepareChartData()

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B']

  // Composant de carte de statistique
  const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {typeof value === 'number' ? 
                (color === 'success' || color === 'warning' ? 
                  `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : 
                  value.toLocaleString('fr-FR')
                ) : value}
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
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? 
              <TrendingUpIcon color="success" sx={{ fontSize: 18 }} /> : 
              <TrendingDownIcon color="error" sx={{ fontSize: 18 }} />
            }
            <Typography 
              variant="caption" 
              color={trend > 0 ? 'success.main' : 'error.main'} 
              sx={{ ml: 0.5, fontWeight: 'medium' }}
            >
              {trend > 0 ? '+' : ''}{trend}% vs période précédente
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

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
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Chargement des statistiques...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
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
            Tableau de Bord Statistique
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Analysez les performances de votre entreprise
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Actualiser les données">
            <IconButton 
              onClick={fetchStats} 
              color="primary"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Période de filtrage */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date début"
              value={dateRange.debut}
              onChange={(e) => setDateRange({...dateRange, debut: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date fin"
              value={dateRange.fin}
              onChange={(e) => setDateRange({...dateRange, fin: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={fetchStats}
            >
              Appliquer la période
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Onglets */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { py: 2 }
          }}
        >
          <Tab label="Aperçu" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Ventes" icon={<ShoppingCartIcon />} iconPosition="start" />
          <Tab label="Produits" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Entrepôts" icon={<WarehouseIcon />} iconPosition="start" />
          <Tab label="Clients" icon={<PeopleIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Onglet Aperçu */}
      {selectedTab === 0 && (
        <>
          {/* Cartes de statistiques principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="CHIFFRE D'AFFAIRES TOTAL"
                value={stats?.stats?.chiffre_affaires || 0}
                icon={<EuroIcon sx={{ fontSize: 28 }} />}
                color="success"
                subtitle={`Mois: ${(stats?.stats?.chiffre_affaires_mois || 0).toFixed(2)} €`}
                trend={15.5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="VENTES TOTALES"
                value={stats?.stats?.total_ventes || 0}
                icon={<ShoppingCartIcon sx={{ fontSize: 28 }} />}
                color="primary"
                subtitle="Transactions confirmées"
                trend={8.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="CLIENTS ACTIFS"
                value={stats?.stats?.total_clients || 0}
                icon={<PeopleIcon sx={{ fontSize: 28 }} />}
                color="info"
                subtitle="Clients enregistrés"
                trend={12.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="VALEUR STOCK TOTAL"
                value={stats?.stats?.valeur_stock_total || 0}
                icon={<InventoryIcon sx={{ fontSize: 28 }} />}
                color="warning"
                subtitle={`${stats?.stats?.total_entrepots || 0} entrepôts`}
                trend={-3.2}
              />
            </Grid>
          </Grid>

          {/* Graphiques en ligne */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: 400, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Évolution du chiffre d'affaires (semaine)
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={chartData.evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value} €`}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => {
                        if (name === 'chiffre_affaires') return [`${value} €`, 'Chiffre d\'affaires']
                        return [value, 'Nombre de ventes']
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="chiffre_affaires"
                      name="Chiffre d'affaires"
                      stroke={theme.palette.success.main}
                      fill={alpha(theme.palette.success.main, 0.3)}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 400, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Répartition des stocks par statut
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={chartData.stockStatutsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.stockStatutsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} produits`, 'Quantité']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>

          {/* Dernières ventes */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon />
                  Dernières ventes
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {stats?.dernieres_ventes?.length || 0} ventes récentes
                </Typography>
              </Box>
              {stats?.dernieres_ventes && stats.dernieres_ventes.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>RÉFÉRENCE</TableCell>
                        <TableCell>CLIENT</TableCell>
                        <TableCell>MONTANT</TableCell>
                        <TableCell>DATE</TableCell>
                        <TableCell>STATUT</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.dernieres_ventes.slice(0, 10).map((vente) => (
                        <TableRow key={vente.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {vente.numero_vente}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {vente.client_nom || 'Vente directe'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {parseFloat(vente.montant_total || 0).toLocaleString('fr-FR', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })} €
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(vente.created_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={vente.statut === 'confirmee' ? 'CONFIRMÉE' : (vente.statut || '').toUpperCase()}
                              color={vente.statut === 'confirmee' ? 'success' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  Aucune vente récente
                </Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Onglet Ventes */}
      {selectedTab === 1 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon />
                    Rapport des ventes
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Période: {dateRange.debut} au {dateRange.fin}
                  </Typography>
                </Box>
                {rapportsData.ventes.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>RÉFÉRENCE</TableCell>
                          <TableCell>CLIENT</TableCell>
                          <TableCell>MONTANT</TableCell>
                          <TableCell>DATE</TableCell>
                          <TableCell>STATUT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rapportsData.ventes.slice(0, 20).map((vente) => (
                          <TableRow key={vente.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {vente.numero_vente}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {vente.client_nom || 'Non spécifié'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {parseFloat(vente.montant_total || 0).toLocaleString('fr-FR', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })} €
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(vente.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vente.statut === 'confirmee' ? 'CONFIRMÉE' : (vente.statut || '').toUpperCase()}
                                color={vente.statut === 'confirmee' ? 'success' : 'warning'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucune vente trouvée pour cette période
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Onglet Produits */}
      {selectedTab === 2 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Top produits par valeur de stock
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={chartData.topProduits}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `${value} €`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} €`, 'Valeur stock']}
                    />
                    <Bar 
                      dataKey="valeur" 
                      name="Valeur stock (€)" 
                      fill={theme.palette.primary.main}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: 400, p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Produits avec stock faible/rupture
                </Typography>
                {rapportsData.produits.filter(p => p.stock_faible || p.en_rupture).length > 0 ? (
                  <TableContainer sx={{ maxHeight: 320 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>PRODUIT</TableCell>
                          <TableCell>STOCK</TableCell>
                          <TableCell>ENTREPÔT</TableCell>
                          <TableCell>STATUT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rapportsData.produits
                          .filter(p => p.stock_faible || p.en_rupture)
                          .slice(0, 10)
                          .map((produit, index) => (
                            <TableRow key={produit.id || index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {produit.produit_nom || produit.nom || 'Produit'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {produit.produit_code || produit.code || ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={produit.quantite_disponible || produit.stock_actuel || 0}
                                  color={produit.en_rupture ? 'error' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {produit.entrepot_nom || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={produit.en_rupture ? 'RUPTURE' : 'FAIBLE'}
                                  color={produit.en_rupture ? 'error' : 'warning'}
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun produit en stock faible ou rupture
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Onglet Entrepôts */}
      {selectedTab === 3 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarehouseIcon />
                    Statistiques des entrepôts
                  </Typography>
                </Box>
                {rapportsData.entrepots.length > 0 ? (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    {rapportsData.entrepots.map((entrepot) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={entrepot.id}>
                        <Card sx={{ 
                          height: '100%',
                          borderLeft: `4px solid ${
                            entrepot.actif ? theme.palette.success.main : theme.palette.error.main
                          }`
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <WarehouseIcon color="primary" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {entrepot.nom}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {entrepot.responsable_email || entrepot.responsable || 'N/A'}
                                </Typography>
                              </Box>
                              <Chip
                                label={entrepot.actif ? 'ACTIF' : 'INACTIF'}
                                color={entrepot.actif ? 'success' : 'error'}
                                size="small"
                              />
                            </Box>
                            
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Valeur stock:
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  {(entrepot.stock_total_valeur || 0).toLocaleString('fr-FR', { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })} €
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="textSecondary">
                                  Produits:
                                </Typography>
                                <Typography variant="h6">
                                  {entrepot.produits_count || 0}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun entrepôt trouvé
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Onglet Clients */}
      {selectedTab === 4 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon />
                    Rapport clients
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {rapportsData.clients.length} clients
                  </Typography>
                </Box>
                {rapportsData.clients.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>CLIENT</TableCell>
                          <TableCell>TYPE</TableCell>
                          <TableCell>CONTACT</TableCell>
                          <TableCell>COMMANDES</TableCell>
                          <TableCell>TOTAL ACHATS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rapportsData.clients
                          .slice(0, 20)
                          .map((client) => (
                            <TableRow key={client.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {client.nom}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={client.type_client === 'professionnel' ? 'PRO' : 'PART'}
                                  color={client.type_client === 'professionnel' ? 'primary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {client.telephone}
                                </Typography>
                                {client.email && (
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    {client.email}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label="N/A"
                                  color="info"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  N/A €
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun client trouvé
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default Statistiques