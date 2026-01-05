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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  alpha,
  useTheme,
  Avatar,
  InputAdornment,
  Divider,
  TablePagination,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  PointOfSale as PointOfSaleIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  Person as PersonIcon,
  Warehouse as WarehouseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import logo from '../assets/logo.png'

const Ventes = () => {
  const [ventes, setVentes] = useState([])
  const [clients, setClients] = useState([])
  const [produits, setProduits] = useState([])
  const [entrepots, setEntrepots] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPaiementDialog, setOpenPaiementDialog] = useState(false)
  const [selectedVente, setSelectedVente] = useState(null)
  const [editingVente, setEditingVente] = useState(null)
  const [venteToDelete, setVenteToDelete] = useState(null)
  const [ventePourPaiement, setVentePourPaiement] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterEntrepot, setFilterEntrepot] = useState('')
  const [filterStatutPaiement, setFilterStatutPaiement] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Couleurs de l'entreprise
  const darkCayn = '#003C3f'
  const vividOrange = '#DA4A0E'
  const black = '#000000'

  // Formulaire vente
  const [formData, setFormData] = useState({
    client: '',
    remise: 0,
    mode_paiement: '',
    montant_paye: 0,
    date_echeance: '',
    notes: '',
    lignes_vente: [{ produit: '', entrepot: '', quantite: 1, prix_unitaire: '' }]
  })

  // Formulaire paiement
  const [formPaiement, setFormPaiement] = useState({
    montant: 0,
    mode_paiement: '',
    reference: '',
    notes: ''
  })

  // Récupérer les données
  const fetchData = () => {
    setLoading(true)
    Promise.all([
      AxiosInstance.get('ventes/'),
      AxiosInstance.get('clients/'),
      AxiosInstance.get('produits/'),
      AxiosInstance.get('entrepots/')
    ])
    .then(([ventesRes, clientsRes, produitsRes, entrepotsRes]) => {
      setVentes(ventesRes.data)
      setClients(clientsRes.data)
      console.log("Clients chargés:", clientsRes.data)
      setProduits(produitsRes.data)
      setEntrepots(entrepotsRes.data.filter(e => e.actif))
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

  // Fonction pour rafraîchir les données d'une vente spécifique
  const refreshVenteDetails = async (venteId) => {
    try {
      const response = await AxiosInstance.get(`ventes/${venteId}/`)
      console.log("Données de la vente rafraîchies:", response.data)
      console.log("Client dans les données:", response.data.client)
      return response.data
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error)
      return null
    }
  }

  // Vérifier les stocks disponibles pour un produit dans un entrepôt
  const checkStockDisponible = async (produitId, entrepotId) => {
    if (!produitId || !entrepotId) return null
    
    try {
      const response = await AxiosInstance.get(`stock-disponible/?produit=${produitId}`)
      const stock = response.data.stocks.find(s => s.entrepot_id === parseInt(entrepotId))
      return stock ? stock.quantite_disponible : 0
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error)
      return 0
    }
  }

  // Composant de carte de statistique
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

  // Ouvrir le dialog pour ajouter une vente
  const handleOpenDialog = () => {
    setFormData({
      client: '',
      remise: 0,
      mode_paiement: '',
      montant_paye: 0,
      date_echeance: '',
      notes: '',
      lignes_vente: [{ produit: '', entrepot: '', quantite: 1, prix_unitaire: '' }]
    })
    setActiveStep(0)
    setOpenDialog(true)
  }

  // Ouvrir le dialog pour modifier une vente - CORRIGÉ
  const handleOpenEditDialog = async (vente) => {
    setEditingVente(vente)
    
    try {
      // Récupérer les données actualisées de la vente
      const venteActualisee = await refreshVenteDetails(vente.id) || vente
      
      // Décodage sécurisé du client
      let clientId = ''
      if (venteActualisee.client) {
        // Si client est un objet
        if (typeof venteActualisee.client === 'object' && venteActualisee.client !== null) {
          clientId = venteActualisee.client.id || venteActualisee.client.toString()
        } 
        // Si client est juste un ID
        else if (typeof venteActualisee.client === 'number' || typeof venteActualisee.client === 'string') {
          clientId = venteActualisee.client.toString()
        }
      }
      
      // Préparer les données du formulaire
      const formData = {
        client: clientId,
        remise: parseFloat(venteActualisee.remise) || 0,
        mode_paiement: venteActualisee.mode_paiement || '',
        montant_paye: parseFloat(venteActualisee.montant_paye) || 0,
        date_echeance: venteActualisee.date_echeance || '',
        notes: venteActualisee.notes || '',
        lignes_vente: venteActualisee.lignes_vente.map(ligne => ({
          produit: ligne.produit?.id?.toString() || ligne.produit?.toString() || '',
          entrepot: ligne.entrepot?.id?.toString() || ligne.entrepot?.toString() || '',
          quantite: parseInt(ligne.quantite),
          prix_unitaire: parseFloat(ligne.prix_unitaire)
        }))
      }
      
      console.log("Données de modification préparées:", {
        venteClient: venteActualisee.client,
        clientId: clientId,
        formDataClient: formData.client,
        clientsDisponibles: clients
      })
      
      setFormData(formData)
      setActiveStep(0)
      setOpenEditDialog(true)
    } catch (error) {
      console.error('Erreur lors de la préparation des données:', error)
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données de la vente', severity: 'error' })
    }
  }

  // Fermer les dialogs
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setOpenEditDialog(false)
    setActiveStep(0)
    setSubmitting(false)
    setEditingVente(null)
  }

  // Ouvrir le dialog de détails
  const handleOpenDetailsDialog = async (vente) => {
    // Rafraîchir les données de la vente avant d'afficher les détails
    const venteActualisee = await refreshVenteDetails(vente.id) || vente
    setSelectedVente(venteActualisee)
    setOpenDetailsDialog(true)
  }

  // Fermer le dialog de détails
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false)
    setSelectedVente(null)
  }

  // Ouvrir la modal de suppression
  const handleOpenDeleteDialog = (vente) => {
    setVenteToDelete(vente)
    setOpenDeleteDialog(true)
  }

  // Fermer la modal de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setVenteToDelete(null)
  }

  // Ouvrir le dialog de paiement
  const handleOpenPaiementDialog = async (vente) => {
    // Rafraîchir les données de la vente avant d'afficher le dialog de paiement
    const venteActualisee = await refreshVenteDetails(vente.id) || vente
    setVentePourPaiement(venteActualisee)
    setFormPaiement({
      montant: parseFloat(venteActualisee.montant_restant) || 0,
      mode_paiement: venteActualisee.mode_paiement || '',
      reference: '',
      notes: ''
    })
    setOpenPaiementDialog(true)
  }

  // Fermer le dialog de paiement
  const handleClosePaiementDialog = () => {
    setOpenPaiementDialog(false)
    setVentePourPaiement(null)
    setFormPaiement({
      montant: 0,
      mode_paiement: '',
      reference: '',
      notes: ''
    })
  }

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remise' || name === 'montant_paye' ? parseFloat(value) || 0 : value
    }))
  }

  // Gérer les changements du formulaire de paiement
  const handlePaiementChange = (e) => {
    const { name, value } = e.target
    setFormPaiement(prev => ({
      ...prev,
      [name]: name === 'montant' ? parseFloat(value) || 0 : value
    }))
  }

  // Gérer les changements des lignes de vente
  const handleLigneChange = async (index, field, value) => {
    const updatedLignes = [...formData.lignes_vente]
    
    if (field === 'produit' && value) {
      const produitSelectionne = produits.find(p => p.id == value)
      if (produitSelectionne) {
        updatedLignes[index] = {
          ...updatedLignes[index],
          produit: value,
          prix_unitaire: produitSelectionne.prix_vente,
          entrepot: updatedLignes[index].entrepot || '' // Reset entrepot si changement de produit
        }
      }
    } else if (field === 'entrepot' && value && updatedLignes[index].produit) {
      updatedLignes[index] = {
        ...updatedLignes[index],
        entrepot: value
      }
      
      // Vérifier le stock disponible
      const stock = await checkStockDisponible(updatedLignes[index].produit, value)
      if (stock !== null && stock < updatedLignes[index].quantite) {
        setSnackbar({ 
          open: true, 
          message: `Stock insuffisant dans cet entrepôt: ${stock} unités disponibles`, 
          severity: 'warning' 
        })
      }
    } else {
      updatedLignes[index] = {
        ...updatedLignes[index],
        [field]: field === 'quantite' ? parseInt(value) || 1 : 
                 field === 'prix_unitaire' ? parseFloat(value) || 0 : value
      }
    }

    setFormData(prev => ({
      ...prev,
      lignes_vente: updatedLignes
    }))
  }

  // Ajouter une ligne de vente
  const addLigneVente = () => {
    setFormData(prev => ({
      ...prev,
      lignes_vente: [...prev.lignes_vente, { produit: '', entrepot: '', quantite: 1, prix_unitaire: '' }]
    }))
  }

  // Supprimer une ligne de vente
  const removeLigneVente = (index) => {
    if (formData.lignes_vente.length > 1) {
      setFormData(prev => ({
        ...prev,
        lignes_vente: prev.lignes_vente.filter((_, i) => i !== index)
      }))
    }
  }

  // Calculer le total de la vente
  const calculerTotal = () => {
    const totalLignes = formData.lignes_vente.reduce((total, ligne) => {
      if (ligne.produit && ligne.entrepot && ligne.quantite && ligne.prix_unitaire) {
        return total + (ligne.quantite * parseFloat(ligne.prix_unitaire))
      }
      return total
    }, 0)
    
    return totalLignes - parseFloat(formData.remise || 0)
  }

  // Valider l'étape client
  const validerEtapeClient = () => {
    const lignesValides = formData.lignes_vente.filter(ligne => 
      ligne.produit && ligne.entrepot && ligne.quantite > 0 && ligne.prix_unitaire
    )
    
    if (lignesValides.length === 0) {
      setSnackbar({ open: true, message: 'Ajoutez au moins un produit à la vente', severity: 'error' })
      return false
    }

    setActiveStep(1)
    return true
  }

  // Soumettre la vente (création)
  const handleSubmit = async () => {
    const lignesValides = formData.lignes_vente.filter(ligne => 
      ligne.produit && ligne.entrepot && ligne.quantite > 0 && ligne.prix_unitaire
    )

    if (lignesValides.length === 0) {
      setSnackbar({ open: true, message: 'Ajoutez au moins un produit valide', severity: 'error' })
      return
    }

    setSubmitting(true)

    const submitData = {
      client: formData.client || null,
      remise: parseFloat(formData.remise || 0),
      mode_paiement: formData.mode_paiement || null,
      montant_paye: parseFloat(formData.montant_paye || 0),
      date_echeance: formData.date_echeance || null,
      notes: formData.notes || '',
      lignes_vente: lignesValides.map(ligne => ({
        produit: parseInt(ligne.produit),
        entrepot: parseInt(ligne.entrepot),
        quantite: parseInt(ligne.quantite),
        prix_unitaire: parseFloat(ligne.prix_unitaire)
      }))
    }

    console.log("Données soumises (création):", submitData)

    AxiosInstance.post('ventes/', submitData)
      .then((response) => {
        setSnackbar({ open: true, message: 'Vente créée avec succès', severity: 'success' })
        fetchData()
        handleCloseDialog()
      })
      .catch((err) => {
        console.error('Erreur création vente:', err.response?.data || err)
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           'Erreur lors de la création de la vente'
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Modifier une vente
  const handleEditSubmit = async () => {
    const lignesValides = formData.lignes_vente.filter(ligne => 
      ligne.produit && ligne.entrepot && ligne.quantite > 0 && ligne.prix_unitaire
    )

    if (lignesValides.length === 0) {
      setSnackbar({ open: true, message: 'Ajoutez au moins un produit valide', severity: 'error' })
      return
    }

    setSubmitting(true)

    const submitData = {
      client: formData.client || null,
      remise: parseFloat(formData.remise || 0),
      mode_paiement: formData.mode_paiement || null,
      montant_paye: parseFloat(formData.montant_paye || 0),
      date_echeance: formData.date_echeance || null,
      notes: formData.notes || '',
      lignes_vente: lignesValides.map(ligne => ({
        produit: parseInt(ligne.produit),
        entrepot: parseInt(ligne.entrepot),
        quantite: parseInt(ligne.quantite),
        prix_unitaire: parseFloat(ligne.prix_unitaire)
      }))
    }

    console.log("Données soumises (modification):", submitData)
    console.log("Vente ID:", editingVente.id)

    // Utiliser PATCH
    AxiosInstance.patch(`ventes/${editingVente.id}/`, submitData)
      .then(async (response) => {
        setSnackbar({ open: true, message: 'Vente modifiée avec succès', severity: 'success' })
        
        // Rafraîchir les données de cette vente spécifique
        await refreshVenteDetails(editingVente.id)
        
        // Rafraîchir toutes les données
        fetchData()
        
        handleCloseDialog()
      })
      .catch((err) => {
        console.error('Erreur modification vente:', err.response?.data || err)
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           err.response?.data?.lignes_vente?.[0] ||
                           'Erreur lors de la modification de la vente'
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Enregistrer un paiement
  const handleEnregistrerPaiement = async () => {
    if (!ventePourPaiement) return
    
    setSubmitting(true)
    
    AxiosInstance.post(`ventes/${ventePourPaiement.id}/enregistrer_paiement/`, formPaiement)
      .then(async (response) => {
        setSnackbar({ open: true, message: 'Paiement enregistré avec succès', severity: 'success' })
        
        // Rafraîchir les données de cette vente spécifique
        await refreshVenteDetails(ventePourPaiement.id)
        
        // Rafraîchir toutes les données
        fetchData()
        
        handleClosePaiementDialog()
      })
      .catch((err) => {
        console.error('Erreur enregistrement paiement:', err)
        const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         err.response?.data?.message || 
                         'Erreur lors de l\'enregistrement du paiement'
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Formatage des nombres
  const formatNumber = (number) => {
    if (typeof number !== 'number') number = parseFloat(number) || 0
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number)
  }

  // Obtenir les entrepôts disponibles pour un produit
  const getEntrepotsForProduit = (produitId) => {
    if (!produitId) return entrepots
    
    // Dans une implémentation réelle, on filtrerait les entrepôts qui ont ce produit en stock
    return entrepots
  }

  // Générer un PDF
const generatePDF = async (vente) => {
  try {
    const venteActualisee = await refreshVenteDetails(vente.id) || vente;
    
    if (!venteActualisee) {
      setSnackbar({ 
        open: true, 
        message: 'Impossible de récupérer les données de la vente', 
        severity: 'error' 
      });
      return false;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = { left: 10, right: 10, top: 15, bottom: 10 };
    const contentWidth = pageWidth - margins.left - margins.right;
    
    let yPosition = margins.top;
    
    try {
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const logoWidth = 50;
          const logoHeight = 25;
          
          canvas.width = logoWidth * 4;
          canvas.height = logoHeight * 4;
          
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          const dataURL = canvas.toDataURL('image/png');
          
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(margins.left, yPosition, logoWidth, logoHeight, 'S');
          
          doc.addImage(dataURL, 'PNG', margins.left, yPosition, logoWidth, logoHeight);
          
          resolve();
        };
        
        img.onerror = () => {
          const logoWidth = 50;
          const logoHeight = 25;
          
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(margins.left, yPosition, logoWidth, logoHeight, 'S');
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('MGS', margins.left + (logoWidth / 2), yPosition + 8, { align: 'center' });
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('SARL', margins.left + (logoWidth / 2), yPosition + 14, { align: 'center' });
          doc.text('Stock', margins.left + (logoWidth / 2), yPosition + 19, { align: 'center' });
          
          resolve();
        };
        
        img.src = logo;
        img.crossOrigin = 'anonymous';
      });
      
    } catch (error) {
      console.warn('Erreur avec le logo, utilisation du texte:', error);
      const logoWidth = 50;
      const logoHeight = 25;
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margins.left, yPosition, logoWidth, logoHeight, 'S');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('MGS', margins.left + (logoWidth / 2), yPosition + 8, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SARL', margins.left + (logoWidth / 2), yPosition + 14, { align: 'center' });
      doc.text('Stock', margins.left + (logoWidth / 2), yPosition + 19, { align: 'center' });
    }
    
    const infoSocieteY = yPosition + 2;
    const infoSocieteX = pageWidth - margins.right - 95;
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const infoBoxWidth = 97;
    const infoBoxHeight = 40;
    
    doc.rect(infoSocieteX, infoSocieteY - 2, infoBoxWidth, infoBoxHeight, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('INFORMATION DE LA SOCIÉTÉ', infoSocieteX + (infoBoxWidth / 2), infoSocieteY + 4, { align: 'center' });
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(infoSocieteX + 8, infoSocieteY + 6, infoSocieteX + infoBoxWidth - 8, infoSocieteY + 6);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let infoY = infoSocieteY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Nom:', infoSocieteX + 6, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text('MSG SARL', infoSocieteX + 18, infoY);
    infoY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Adresse:', infoSocieteX + 6, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text('LYMANYA', infoSocieteX + 25, infoY);
    infoY += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Tél:', infoSocieteX + 6, infoY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('+225 05 45 75 18 / 05 79 51 75', infoSocieteX + 14, infoY);
    doc.setFontSize(10);
    infoY += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', infoSocieteX + 6, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text('jallowrimkaz@gmail.com', infoSocieteX + 20, infoY);
    
    yPosition = Math.max(infoSocieteY + infoBoxHeight + 5, yPosition + 35);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 8;
    
    const sectionTop = yPosition;
    
    // SECTION INFOS CLIENT (DROITE)
    let clientY = sectionTop + 5;
    const clientRightMargin = pageWidth - margins.right - 60;

    // Titre "CLIENT" avec soulignement
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CLIENT', clientRightMargin + 7, clientY, { align: 'center' });

    // Soulignement sous "CLIENT"
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    const clientTitleWidth = doc.getTextWidth('CLIENT');
    doc.line(clientRightMargin + (15 - clientTitleWidth) / 2, clientY + 1, clientRightMargin + (17 - clientTitleWidth) / 2 + clientTitleWidth, clientY + 1);

    clientY += 8;

    // Informations client - TOUT EN NOIR
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont('helvetica', 'bold');
    doc.text('Dénomination :', clientRightMargin, clientY);
    doc.setFont('helvetica', 'normal');
    const clientNom = venteActualisee.client_nom || venteActualisee.client?.nom || 'Non spécifié';
    doc.text(clientNom, clientRightMargin + 32, clientY);
    clientY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Adresse :', clientRightMargin, clientY);
    doc.setFont('helvetica', 'normal');
    const clientAdresse = venteActualisee.client_adresse || venteActualisee.client?.adresse || '';
    doc.text(clientAdresse, clientRightMargin + 32, clientY);
    clientY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone :', clientRightMargin, clientY);
    doc.setFont('helvetica', 'normal');
    const clientTel = venteActualisee.client_telephone || venteActualisee.client?.telephone || '';
    doc.text(clientTel, clientRightMargin + 32, clientY);
    clientY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Email :', clientRightMargin, clientY);
    doc.setFont('helvetica', 'normal');
    const clientEmail = venteActualisee.client_email || venteActualisee.client?.email || '';
    doc.text(clientEmail, clientRightMargin + 32, clientY);
    clientY += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Mode de paiement :', clientRightMargin, clientY);
    doc.setFont('helvetica', 'normal');
    const modePaiement = venteActualisee.mode_paiement || 'Non spécifié';
    doc.text(modePaiement, clientRightMargin + 44, clientY);
    
    // SECTION INFOS FACTURE (GAUCHE)
    let factureY = sectionTop + 5;
    const factureLeftMargin = margins.left + 5;

    // 1. FACTURE VENTE et statut (première position)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const statutVente = venteActualisee.statut === 'confirmee' && 
                       parseFloat(venteActualisee.montant_restant || 0) === 0 
                       ? 'SOLDÉ' : 'NON SOLDÉ';

    doc.setTextColor(0, 0, 0);
    const factureText = 'FACTURE VENTE ';
    doc.text(factureText, factureLeftMargin, factureY);

    const factureTextWidth = doc.getTextWidth(factureText);
    const statutX = factureLeftMargin + factureTextWidth;

    const statutTextWidth = doc.getTextWidth(statutVente);
    const padding = 5;
    const rectWidth = statutTextWidth + (padding * 2);
    const rectHeight = 6;

    doc.setDrawColor(255, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.rect(statutX - -1, factureY - rectHeight + 1, rectWidth, rectHeight, 'FD');

    doc.setTextColor(255, 0, 0);
    doc.text(statutVente, statutX + padding - 3, factureY - 1);
    
    factureY += 8;

    // 2. DATE (deuxième position)
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE :', factureLeftMargin, factureY);
    doc.setFont('helvetica', 'normal');
    const dateFacture = venteActualisee.date_facturation || venteActualisee.created_at;
    doc.text(new Date(dateFacture).toLocaleDateString('fr-FR'), factureLeftMargin + 20, factureY);
    factureY += 5;

    // 3. FACTURE N° (troisième position)
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE N° :', factureLeftMargin, factureY);
    doc.setFont('helvetica', 'normal');
    const factureNum = venteActualisee.numero_vente || 'N/A';
    doc.text(factureNum, factureLeftMargin + 30, factureY);
    factureY += 5;

    // 4. N° Client (quatrième position)
    doc.setFont('helvetica', 'bold');
    doc.text('N° Client :', factureLeftMargin, factureY);
    doc.setFont('helvetica', 'normal');
    const clientCode = venteActualisee.client?.id || `CLI${venteActualisee.id?.toString().padStart(6, '0')}`;
    doc.text(clientCode, factureLeftMargin + 30, factureY);

    // Déterminer la position Y la plus basse
    yPosition = Math.max(factureY + 5, clientY + 10);
    
    const colWidths = {
      code: 35,
      designation: 55,
      qte: 10,
      pu: 28,
      remise: 23,
      montant: 40
    };

    const colPositions = {
      code: margins.left,
      designation: margins.left + colWidths.code,
      qte: margins.left + colWidths.code + colWidths.designation,
      pu: margins.left + colWidths.code + colWidths.designation + colWidths.qte,
      remise: margins.left + colWidths.code + colWidths.designation + colWidths.qte + colWidths.pu,
      montant: margins.left + colWidths.code + colWidths.designation + colWidths.qte + colWidths.pu + colWidths.remise
    };

    const ligneHeight = 8;
    const tableTop = yPosition;

    // Tableau des produits - BORDURE EXTERIEURE
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margins.left, tableTop, contentWidth, ligneHeight, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    // Lignes verticales intérieures pour l'en-tête
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(colPositions.designation, tableTop, colPositions.designation, tableTop + ligneHeight);
    doc.line(colPositions.qte, tableTop, colPositions.qte, tableTop + ligneHeight);
    doc.line(colPositions.pu, tableTop, colPositions.pu, tableTop + ligneHeight);
    doc.line(colPositions.remise, tableTop, colPositions.remise, tableTop + ligneHeight);
    doc.line(colPositions.montant - 1, tableTop, colPositions.montant - 1, tableTop + ligneHeight);

    const headerTextY = tableTop + 5;
    doc.text('CODE', colPositions.code + (colWidths.code / 2), headerTextY, { align: 'center' });
    doc.text('DÉSIGNATION', colPositions.designation + (colWidths.designation / 2), headerTextY, { align: 'center' });
    doc.text('QTE', colPositions.qte + (colWidths.qte / 2), headerTextY, { align: 'center' });
    doc.text('P.U', colPositions.pu + (colWidths.pu / 2), headerTextY, { align: 'center' });
    doc.text('REMISE', colPositions.remise + (colWidths.remise / 2), headerTextY, { align: 'center' });
    doc.text('MONTANT', colPositions.montant + (colWidths.montant / 2), headerTextY, { align: 'center' });

    yPosition = tableTop + ligneHeight;

    const formatNombre = (nombre) => {
      const num = parseFloat(nombre) || 0;
      const parts = num.toFixed(2).split('.');
      const entier = parts[0];
      const decimal = parts[1] || '00';
      
      const entierFormate = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      
      return `${entierFormate},${decimal}`;
    };

    const formatPourcentage = (pourcentage) => {
      const num = parseFloat(pourcentage) || 0;
      return num.toFixed(1).replace('.', ',') + '';
    };

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    if (venteActualisee.lignes_vente && venteActualisee.lignes_vente.length > 0) {
      venteActualisee.lignes_vente.forEach((ligne, index) => {
        if (yPosition + ligneHeight > 270) {
          doc.addPage();
          yPosition = margins.top + 15;
          
          // Bordure extérieure pour le tableau sur nouvelle page
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S');
          
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text('CODE', colPositions.code + (colWidths.code / 2), yPosition + 5, { align: 'center' });
          doc.text('DÉSIGNATION', colPositions.designation + (colWidths.designation / 2), yPosition + 5, { align: 'center' });
          doc.text('QTE', colPositions.qte + (colWidths.qte / 2), yPosition + 5, { align: 'center' });
          doc.text('P.U', colPositions.pu + (colWidths.pu / 2), yPosition + 5, { align: 'center' });
          doc.text('REMISE', colPositions.remise + (colWidths.remise / 2), yPosition + 5, { align: 'center' });
          doc.text('MONTANT', colPositions.montant + (colWidths.montant / 2), yPosition + 5, { align: 'center' });
          
          // Lignes verticales intérieures pour l'en-tête sur nouvelle page
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.line(colPositions.designation, yPosition, colPositions.designation, yPosition + ligneHeight);
          doc.line(colPositions.qte, yPosition, colPositions.qte, yPosition + ligneHeight);
          doc.line(colPositions.pu, yPosition, colPositions.pu, yPosition + ligneHeight);
          doc.line(colPositions.remise, yPosition, colPositions.remise, yPosition + ligneHeight);
          doc.line(colPositions.montant - 1, yPosition, colPositions.montant - 1, yPosition + ligneHeight);
          
          yPosition += ligneHeight;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
        }
        
        const quantite = parseInt(ligne.quantite) || 0;
        const prixUnitaire = parseFloat(ligne.prix_unitaire) || 0;
        const remisePourcentage = parseFloat(ligne.remise) || 0;
        const montantApresRemise = quantite * prixUnitaire * (1 - remisePourcentage / 100);
        
        const codeProduit = ligne.produit_code || ligne.produit_id || 
                           `PROD${(index + 1).toString().padStart(3, '0')}`;
        
        let nomProduit = ligne.produit_nom?.trim() || 'Produit sans nom';
        const entrepot = ligne.entrepot_nom || ligne.entrepot || '';
        if (entrepot) {
          nomProduit += ` (${entrepot})`;
        }
        
        const puFormatted = formatNombre(prixUnitaire);
        const montantFormatted = formatNombre(montantApresRemise);
        const remiseFormatted = formatPourcentage(remisePourcentage);
        
        // CELLULES DU TABLEAU AVEC BORDURE COMPLÈTE
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        
        // Bordure extérieure de la ligne
        doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S');
        
        // Lignes verticales intérieures
        doc.line(colPositions.designation, yPosition, colPositions.designation, yPosition + ligneHeight);
        doc.line(colPositions.qte, yPosition, colPositions.qte, yPosition + ligneHeight);
        doc.line(colPositions.pu, yPosition, colPositions.pu, yPosition + ligneHeight);
        doc.line(colPositions.remise, yPosition, colPositions.remise, yPosition + ligneHeight);
        doc.line(colPositions.montant - 1, yPosition, colPositions.montant - 1, yPosition + ligneHeight);
        
        const cellPaddingY = 5;
        
        doc.text(codeProduit.toString(), colPositions.code + (colWidths.code / 2), yPosition + cellPaddingY, { align: 'center' });
        
        let designationAffichee = nomProduit;
        const maxCaracteres = 45;
        if (designationAffichee.length > maxCaracteres) {
          designationAffichee = designationAffichee.substring(0, maxCaracteres - 3) + '...';
        }
        doc.text(designationAffichee, colPositions.designation + 3, yPosition + cellPaddingY);
        
        doc.text(quantite.toString(), colPositions.qte + (colWidths.qte / 2), yPosition + cellPaddingY, { align: 'center' });
        
        doc.text(`${puFormatted} CFA`, colPositions.pu + colWidths.pu - 3, yPosition + cellPaddingY, { align: 'right' });
        
        doc.setTextColor(80, 80, 80);
        doc.text(remiseFormatted, colPositions.remise + colWidths.remise - 3, yPosition + cellPaddingY, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${montantFormatted} CFA`, colPositions.montant + colWidths.montant - 5, yPosition + cellPaddingY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        yPosition += ligneHeight;
      });
    } else {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.1);
      doc.rect(margins.left, yPosition, contentWidth, ligneHeight, 'S');
      doc.setTextColor(150, 150, 150);
      doc.text('Aucun produit dans cette vente', margins.left + contentWidth / 2, yPosition + 4, { align: 'center' });
      yPosition += ligneHeight;
    }

    // Section des totaux - BORDURE COLLÉE À CELLE DU TABLEAU DES PRODUITS
    const totalSectionTop = yPosition; // Suppression de l'espace (+5)
    
    const formatNumber = (num) => {
      const number = parseFloat(num) || 0;
      const parts = number.toFixed(2).split('.');
      const entier = parts[0];
      const decimal = parts[1] || '00';
      
      const entierFormate = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      
      return `${entierFormate},${decimal}`;
    };
    
    const totalHT = parseFloat(venteActualisee.montant_total || 0) - parseFloat(venteActualisee.remise || 0);
    const montantPaye = parseFloat(venteActualisee.montant_paye || 0);
    const montantRestant = parseFloat(venteActualisee.montant_restant || 0);
    const totalTTC = totalHT;
    
    const nombreEnLettres = (montant) => {
      const nombres = {
        0: 'zéro', 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq',
        6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix',
        11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze',
        16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf',
        20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante',
        60: 'soixante', 70: 'soixante-dix', 80: 'quatre-vingt', 90: 'quatre-vingt-dix',
        100: 'cent', 1000: 'mille'
      };

      const entier = Math.floor(montant);
      
      if (entier === 11000) return 'Onze Mille';
      if (entier === 10000) return 'Dix Mille';
      if (entier === 5000) return 'Cinq Mille';
      if (entier === 15000) return 'Quinze Mille';
      if (entier === 20000) return 'Vingt Mille';
      if (entier === 25000) return 'Vingt-cinq Mille';
      if (entier === 30000) return 'Trente Mille';
      if (entier === 50000) return 'Cinquante Mille';
      if (entier === 100000) return 'Cent Mille';
      
      if (entier < 1000) {
        if (nombres[entier]) return nombres[entier];
        if (entier < 100) {
          const dizaine = Math.floor(entier / 10) * 10;
          const unite = entier % 10;
          return unite === 0 ? nombres[dizaine] : `${nombres[dizaine]}-${nombres[unite]}`;
        }
        return `${entier}`;
      } else if (entier < 1000000) {
        const milliers = Math.floor(entier / 1000);
        const reste = entier % 1000;
        
        let texteMilliers = '';
        if (milliers === 1) {
          texteMilliers = 'Mille';
        } else if (milliers < 1000) {
          if (nombres[milliers]) {
            texteMilliers = `${nombres[milliers]} Mille`;
          } else {
            texteMilliers = `${milliers} Mille`;
          }
        }
        
        if (reste > 0) {
          return `${texteMilliers} ${nombreEnLettres(reste)}`;
        }
        
        return texteMilliers;
      }
      
      return `${entier}`;
    };
    
    const totalColX = pageWidth - margins.right - 95;
    const totalColWidth = 95;
    
    doc.setFontSize(11);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    const totalBoxHeight = 42;
    
    // BORDURE COLLÉE À CELLE DU TABLEAU DES PRODUITS
    doc.rect(totalColX, totalSectionTop, totalColWidth, totalBoxHeight, 'S');
    
    // Lignes horizontales intérieures pour les séparations
    let currentY = totalSectionTop + 12;
    for (let i = 0; i < 3; i++) {
      doc.line(totalColX + 2, currentY, totalColX + totalColWidth - 2, currentY);
      currentY += 10.5;
    }
    
    yPosition = totalSectionTop + 9;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL HT:', totalColX + 8, yPosition);
    doc.setFontSize(12);
    doc.text(`${formatNumber(totalHT)} CFA`, totalColX + totalColWidth - 8, yPosition, { align: 'right' });
    yPosition += 10.5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    
    const montantTotalLabel = 'MONTANT TOTAL:';
    const montantTotalValue = `${formatNumber(totalTTC)} CFA`;
    
    doc.text(montantTotalLabel, totalColX + 8, yPosition);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(montantTotalValue, totalColX + totalColWidth - 8, yPosition, { align: 'right' });
    
    yPosition += 10.5;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Montant payé:', totalColX + 8, yPosition);
    doc.setFontSize(11);
    doc.text(`${formatNumber(montantPaye)} CFA`, totalColX + totalColWidth - 8, yPosition, { align: 'right' });
    yPosition += 10.5;
    
    doc.setFontSize(11);
    doc.text('Reste à payer:', totalColX + 8, yPosition);
    doc.setFontSize(11);
    doc.text(`${formatNumber(montantRestant)} CFA`, totalColX + totalColWidth - 8, yPosition, { align: 'right' });
    
    // SECTION : "Arrêtée la présente facture..."
    yPosition = totalSectionTop + totalBoxHeight + 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const montantEnLettres = nombreEnLettres(totalTTC);
    const texteComplet = `Arrêtée la présente facture à la somme de : `;
    const montantTexte = `${montantEnLettres} Franc CFA`;
    
    doc.setFont('helvetica', 'normal');
    const texteCompletWidth = doc.getTextWidth(texteComplet);
    doc.setFont('helvetica', 'bold');
    const montantTexteWidth = doc.getTextWidth(montantTexte);
    const largeurTotale = texteCompletWidth + montantTexteWidth;
    
    const startX = (pageWidth - largeurTotale) / 2;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(texteComplet, startX, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text(montantTexte, startX + texteCompletWidth, yPosition);
    
    // Pied de page
    const piedPageY = pageHeight - 5;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(margins.left, piedPageY - 8, pageWidth - margins.right, piedPageY - 8);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const infoSocietePied = `RCCM : ; Adresse : LYMANYA ; Tél : +225 05 45 08 75 1008 05 79 51 7`;
    doc.text(infoSocietePied, pageWidth / 2, piedPageY - 4, { align: 'center' });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.line(margins.left, piedPageY - 8, pageWidth - margins.right, piedPageY - 8);
      
      doc.text(infoSocietePied, pageWidth / 2, piedPageY - 4, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, piedPageY, { align: 'center' });
    }
    
    const fileName = `Facture-${venteActualisee.numero_vente || venteActualisee.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    
    setSnackbar({ 
      open: true, 
      message: 'Facture PDF générée avec succès', 
      severity: 'success' 
    });
    
    return true;
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    setSnackbar({ 
      open: true, 
      message: 'Erreur lors de la génération du PDF', 
      severity: 'error' 
    });
    return false;
  }
};

  // Confirmer une vente
  const handleConfirmerVente = async (venteId) => {
    try {
      const response = await AxiosInstance.post(`ventes/${venteId}/confirmer/`, {})
      setSnackbar({ 
        open: true, 
        message: response.data?.message || 'Vente confirmée avec succès', 
        severity: 'success' 
      })
      
      // Rafraîchir les données de cette vente spécifique
      await refreshVenteDetails(venteId)
      
      // Rafraîchir toutes les données
      fetchData()
    } catch (err) {
      console.error('Error confirming vente:', err)
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         err.response?.data?.message ||
                         'Erreur lors de la confirmation'
      setSnackbar({ open: true, message: errorMessage, severity: 'error' })
    }
  }

  // Supprimer une vente
  const handleDeleteVente = async () => {
    if (venteToDelete) {
      try {
        await AxiosInstance.delete(`ventes/${venteToDelete.id}/`)
        setSnackbar({ open: true, message: 'Vente supprimée avec succès', severity: 'success' })
        fetchData()
        handleCloseDeleteDialog()
      } catch (err) {
        console.error('Error deleting vente:', err)
        const errorMessage = err.response?.data?.error || 'Erreur lors de la suppression'
        setSnackbar({ open: true, message: errorMessage, severity: 'error' })
      }
    }
  }

  // Obtenir la couleur du statut de paiement
  const getStatutPaiementColor = (statutPaiement, vente) => {
    switch (statutPaiement) {
      case 'paye': return 'success'
      case 'partiel': return 'warning'
      case 'retard': return 'error'
      case 'non_paye':
        // Vérifier si la vente est en retard
        if (vente.date_echeance) {
          const echeance = new Date(vente.date_echeance)
          const aujourdhui = new Date()
          if (echeance < aujourdhui) return 'error'
        }
        return 'default'
      default: return 'default'
    }
  }

  // Obtenir le libellé du statut de paiement
  const getStatutPaiementLabel = (vente) => {
    const statut = vente.statut_paiement
    
    switch (statut) {
      case 'paye': return 'Payé'
      case 'partiel': return 'Partiel'
      case 'non_paye':
        if (vente.date_echeance) {
          const echeance = new Date(vente.date_echeance)
          const aujourdhui = new Date()
          if (echeance < aujourdhui) return 'En retard'
        }
        return 'Non payé'
      case 'retard': return 'En retard'
      default: return statut || 'Non payé'
    }
  }

  // Calculer le pourcentage payé
  const getPourcentagePaye = (vente) => {
    if (parseFloat(vente.montant_total) === 0) return 0
    return Math.round((parseFloat(vente.montant_paye || 0) / parseFloat(vente.montant_total)) * 100)
  }

  // Filtrer les ventes
  const filteredVentes = ventes.filter(vente => {
    const matchesSearch = 
      vente.numero_vente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vente.client_nom && vente.client_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vente.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatut = !filterStatut || vente.statut === filterStatut
    const matchesEntrepot = !filterEntrepot || 
      (vente.entrepots_noms && vente.entrepots_noms.some(nom => 
        nom.toLowerCase().includes(filterEntrepot.toLowerCase())))
    
    const matchesStatutPaiement = !filterStatutPaiement || 
      (filterStatutPaiement === 'retard' 
        ? (vente.statut_paiement === 'non_paye' && vente.date_echeance && new Date(vente.date_echeance) < new Date())
        : vente.statut_paiement === filterStatutPaiement)
    
    return matchesSearch && matchesStatut && matchesEntrepot && matchesStatutPaiement
  })

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Données paginées
  const paginatedVentes = filteredVentes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Statistiques
  const stats = {
    total: ventes.length,
    confirmees: ventes.filter(v => v.statut === 'confirmee').length,
    brouillons: ventes.filter(v => v.statut === 'brouillon').length,
    annulees: ventes.filter(v => v.statut === 'annulee').length,
    chiffre_affaires: ventes.filter(v => v.statut === 'confirmee')
      .reduce((sum, v) => sum + parseFloat(v.montant_total || 0), 0),
    montant_a_recouvrer: ventes.filter(v => v.statut === 'confirmee')
      .reduce((sum, v) => sum + parseFloat(v.montant_restant || 0), 0),
    entrepots_utilises: new Set(ventes.flatMap(v => v.entrepots_noms || [])).size
  }

  // Obtenir la couleur du statut
  const getStatutColor = (statut) => {
    switch (statut) {
      case 'confirmee': return 'success'
      case 'brouillon': return 'warning'
      case 'annulee': return 'error'
      default: return 'default'
    }
  }

  // Obtenir le libellé du statut
  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'confirmee': return 'Confirmée'
      case 'brouillon': return 'Brouillon'
      case 'annulee': return 'Annulée'
      default: return statut
    }
  }

  // Avatar pour les ventes
  const VenteAvatar = ({ vente }) => (
    <Avatar
      sx={{
        bgcolor: getStatutColor(vente.statut) === 'success' ? darkCayn :
                 getStatutColor(vente.statut) === 'warning' ? vividOrange :
                 getStatutColor(vente.statut) === 'error' ? '#d32f2f' :
                 alpha(darkCayn, 0.8),
        width: 40,
        height: 40
      }}
    >
      <ReceiptIcon sx={{ fontSize: 20 }} />
    </Avatar>
  )

  // Effet pour déboguer l'affichage du client dans le formulaire de modification
  useEffect(() => {
    if (openEditDialog) {
      console.log("FormData client (dans useEffect):", formData.client)
      console.log("Client correspondant:", clients.find(c => c.id == formData.client))
    }
  }, [openEditDialog, formData.client, clients])

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
          Chargement des ventes...
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
            Gestion des Ventes
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
            Gérez vos transactions commerciales multi-entrepôts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Actualiser les données">
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
          <Tooltip title="Nouvelle vente">
            <Fab 
              onClick={handleOpenDialog}
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
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<ReceiptIcon sx={{ fontSize: 28 }} />}
            title="TOTAL VENTES"
            value={stats.total}
            subtitle="Toutes transactions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
            title="CONFIRMÉES"
            value={stats.confirmees}
            subtitle={`${stats.total > 0 ? Math.round((stats.confirmees / stats.total) * 100) : 0}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            title="CHIFFRE D'AFFAIRES"
            value={`${formatNumber(stats.chiffre_affaires)}€`}
            subtitle="Ventes confirmées"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<MoneyIcon sx={{ fontSize: 28 }} />}
            title="À RECOUVRER"
            value={`${formatNumber(stats.montant_a_recouvrer)}€`}
            subtitle="Montant non payé"
          />
        </Grid>
      </Grid>

      {/* Barres de recherche et filtres */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, border: `1px solid ${alpha(darkCayn, 0.1)}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par numéro, client..."
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkCayn }}>Statut</InputLabel>
              <Select
                value={filterStatut}
                label="Statut"
                onChange={(e) => setFilterStatut(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkCayn,
                  }
                }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="brouillon">Brouillon</MenuItem>
                <MenuItem value="confirmee">Confirmée</MenuItem>
                <MenuItem value="annulee">Annulée</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkCayn }}>Statut Paiement</InputLabel>
              <Select
                value={filterStatutPaiement}
                label="Statut Paiement"
                onChange={(e) => setFilterStatutPaiement(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkCayn,
                  }
                }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="non_paye">Non payé</MenuItem>
                <MenuItem value="partiel">Payé partiellement</MenuItem>
                <MenuItem value="paye">Payé</MenuItem>
                <MenuItem value="retard">En retard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkCayn }}>Entrepôt</InputLabel>
              <Select
                value={filterEntrepot}
                label="Entrepôt"
                onChange={(e) => setFilterEntrepot(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkCayn,
                  }
                }}
              >
                <MenuItem value="">Tous les entrepôts</MenuItem>
                {entrepots.map((entrepot) => (
                  <MenuItem key={entrepot.id} value={entrepot.nom}>
                    {entrepot.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setFilterStatut('')
                setFilterEntrepot('')
                setFilterStatutPaiement('')
                setSearchTerm('')
              }}
              sx={{ 
                height: '56px', 
                borderRadius: 2,
                borderColor: darkCayn,
                color: darkCayn,
                '&:hover': {
                  borderColor: vividOrange,
                  backgroundColor: alpha(vividOrange, 0.04)
                }
              }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Tableau des ventes */}
      <Card sx={{ 
        boxShadow: `0 4px 20px ${alpha(darkCayn, 0.1)}`, 
        borderRadius: 3, 
        overflow: 'hidden',
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
                <TableCell>VENTE</TableCell>
                <TableCell>CLIENT</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>ENTREPÔTS</TableCell>
                <TableCell align="right">MONTANT</TableCell>
                <TableCell align="center">STATUT</TableCell>
                <TableCell align="center">PAIEMENT</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {searchTerm || filterStatut || filterEntrepot || filterStatutPaiement ? 'Aucune vente trouvée' : 'Aucune vente enregistrée'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {!searchTerm && !filterStatut && !filterEntrepot && !filterStatutPaiement && 'Commencez par créer votre première vente'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVentes.map((vente) => (
                  <TableRow 
                    key={vente.id} 
                    hover 
                    sx={{ 
                      '&:last-child td': { borderBottom: 0 },
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(darkCayn, 0.02),
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VenteAvatar vente={vente} />
                        <Box>
                          <Typography variant="body1" fontWeight="600" color={darkCayn}>
                            {vente.numero_vente}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vente.lignes_vente?.length || 0} produit(s)
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: darkCayn }} />
                        <Typography variant="body2">
                          {vente.client_nom || 'Aucun client'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(vente.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(vente.entrepots_noms || []).slice(0, 2).map((nom, index) => (
                          <Chip
                            key={index}
                            label={nom}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              borderColor: alpha(darkCayn, 0.3),
                              color: darkCayn
                            }}
                          />
                        ))}
                        {(vente.entrepots_noms || []).length > 2 && (
                          <Tooltip title={(vente.entrepots_noms || []).slice(2).join(', ')}>
                            <Chip
                              label={`+${(vente.entrepots_noms || []).length - 2}`}
                              size="small"
                              sx={{ 
                                fontSize: '0.7rem',
                                backgroundColor: alpha(vividOrange, 0.1),
                                color: vividOrange
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight="bold" color={darkCayn}>
                        {formatNumber(parseFloat(vente.montant_total || 0))} €
                      </Typography>
                      {vente.remise > 0 && (
                        <Typography variant="caption" color="textSecondary">
                          dont {formatNumber(parseFloat(vente.remise))} € de remise
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatutLabel(vente.statut)}
                        color={getStatutColor(vente.statut)}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          borderRadius: 1,
                          minWidth: 100
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={getStatutPaiementLabel(vente)}
                          color={getStatutPaiementColor(vente.statut_paiement, vente)}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 1,
                            minWidth: 100
                          }}
                        />
                        {vente.statut_paiement === 'partiel' && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={getPourcentagePaye(vente)} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(darkCayn, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: vividOrange
                                }
                              }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {getPourcentagePaye(vente)}% payé
                            </Typography>
                          </Box>
                        )}
                        {vente.montant_restant > 0 && vente.statut_paiement !== 'paye' && (
                          <Typography variant="caption" color="textSecondary">
                            Reste: {formatNumber(parseFloat(vente.montant_restant))} €
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton 
                            onClick={() => handleOpenDetailsDialog(vente)}
                            sx={{ 
                              color: darkCayn,
                              background: alpha(darkCayn, 0.1),
                              '&:hover': { background: alpha(darkCayn, 0.2) }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Générer facture PDF">
                          <IconButton 
                            onClick={() => generatePDF(vente)}
                            sx={{ 
                              color: vividOrange,
                              background: alpha(vividOrange, 0.1),
                              '&:hover': { background: alpha(vividOrange, 0.2) }
                            }}
                          >
                            <PdfIcon />
                          </IconButton>
                        </Tooltip>

                        {vente.statut === 'brouillon' && (
                          <>
                            <Tooltip title="Modifier la vente">
                              <IconButton 
                                onClick={() => handleOpenEditDialog(vente)}
                                sx={{ 
                                  color: darkCayn,
                                  background: alpha(darkCayn, 0.1),
                                  '&:hover': { background: alpha(darkCayn, 0.2) }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Confirmer la vente">
                              <IconButton 
                                color="success" 
                                onClick={() => handleConfirmerVente(vente.id)}
                                sx={{ 
                                  background: alpha('#4caf50', 0.1),
                                  '&:hover': { background: alpha('#4caf50', 0.2) }
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer la vente">
                              <IconButton 
                                color="error" 
                                onClick={() => handleOpenDeleteDialog(vente)}
                                sx={{ 
                                  background: alpha('#d32f2f', 0.1),
                                  '&:hover': { background: alpha('#d32f2f', 0.2) }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {vente.statut === 'confirmee' && (
                          <>
                            {vente.statut_paiement !== 'paye' && (
                              <Tooltip title="Enregistrer paiement">
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleOpenPaiementDialog(vente)}
                                  sx={{ 
                                    background: alpha('#4caf50', 0.1),
                                    '&:hover': { background: alpha('#4caf50', 0.2) }
                                  }}
                                >
                                  <PointOfSaleIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredVentes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: darkCayn
            }
          }}
        />
      </Card>

      {/* Dialog pour ajouter une vente */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
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
          Nouvelle Vente
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Étape 1: Sélection des produits */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Sélection des Produits et Entrepôts
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Ajoutez les produits à votre vente avec leur entrepôt source.
                  </Typography>
                  
                  {formData.lignes_vente.map((ligne, index) => (
                    <Card key={index} sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: `1px solid ${alpha(darkCayn, 0.2)}`, 
                      borderRadius: 2,
                      backgroundColor: alpha(darkCayn, 0.02)
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: darkCayn }}>Produit *</InputLabel>
                            <Select
                              value={ligne.produit}
                              label="Produit *"
                              onChange={(e) => handleLigneChange(index, 'produit', e.target.value)}
                              required
                              sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: darkCayn,
                                }
                              }}
                            >
                              <MenuItem value="">Sélectionner un produit</MenuItem>
                              {produits.map((produit) => (
                                <MenuItem key={produit.id} value={produit.id}>
                                  {produit.nom} - {produit.prix_vente} €
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: darkCayn }}>Entrepôt *</InputLabel>
                            <Select
                              value={ligne.entrepot}
                              label="Entrepôt *"
                              onChange={(e) => handleLigneChange(index, 'entrepot', e.target.value)}
                              required
                              disabled={!ligne.produit}
                              sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: darkCayn,
                                }
                              }}
                            >
                              <MenuItem value="">Sélectionner un entrepôt</MenuItem>
                              {getEntrepotsForProduit(ligne.produit).map((entrepot) => (
                                <MenuItem key={entrepot.id} value={entrepot.id}>
                                  {entrepot.nom}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Quantité *"
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                            inputProps={{ min: 1 }}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: darkCayn,
                                },
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Prix unitaire *"
                            type="number"
                            value={ligne.prix_unitaire}
                            onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: darkCayn,
                                },
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={1}>
                          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: darkCayn }}>
                            {ligne.produit && ligne.quantite && ligne.prix_unitaire 
                              ? formatNumber(ligne.quantite * parseFloat(ligne.prix_unitaire))
                              : '0.00'} €
                          </Typography>
                        </Grid>
                        
                        {formData.lignes_vente.length > 1 && (
                          <Grid item xs={12} md={1}>
                            <IconButton 
                              color="error" 
                              onClick={() => removeLigneVente(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </Card>
                  ))}

                  <Button 
                    onClick={addLigneVente} 
                    startIcon={<AddIcon />}
                    sx={{ 
                      mt: 1,
                      color: darkCayn,
                      borderColor: darkCayn,
                      '&:hover': {
                        borderColor: vividOrange,
                        backgroundColor: alpha(vividOrange, 0.04)
                      }
                    }}
                    variant="outlined"
                  >
                    Ajouter une ligne
                  </Button>

                  <Card sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: alpha(darkCayn, 0.04), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(darkCayn, 0.2)}`
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                      Total provisoire: {formatNumber(calculerTotal())} €
                    </Typography>
                  </Card>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={validerEtapeClient}
                      disabled={formData.lignes_vente.filter(l => l.produit && l.entrepot && l.quantite && l.prix_unitaire).length === 0}
                      sx={{
                        background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                        '&:disabled': {
                          background: alpha(darkCayn, 0.3)
                        }
                      }}
                    >
                      Continuer vers la finalisation
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Étape 2: Client et finalisation */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Finalisation de la Vente
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
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
                          <MenuItem value="">Aucun client</MenuItem>
                          {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              {client.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date d'échéance"
                        name="date_echeance"
                        type="date"
                        value={formData.date_echeance}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
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
                        label="Notes"
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

                  <Card sx={{ 
                    mt: 3, 
                    p: 3, 
                    backgroundColor: alpha(darkCayn, 0.04), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(darkCayn, 0.2)}`
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: darkCayn }}>
                      Récapitulatif de la vente
                    </Typography>
                    {formData.lignes_vente.filter(l => l.produit && l.entrepot && l.quantite && l.prix_unitaire).map((ligne, index) => {
                      const produit = produits.find(p => p.id == ligne.produit)
                      const entrepot = entrepots.find(e => e.id == ligne.entrepot)
                      return (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box>
                            <Typography variant="body2">
                              {produit?.nom} x{ligne.quantite}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Entrepôt: {entrepot?.nom}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="600" color={darkCayn}>
                            {formatNumber(ligne.quantite * parseFloat(ligne.prix_unitaire))} €
                          </Typography>
                        </Box>
                      )
                    })}
                    {formData.remise > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Remise</Typography>
                        <Typography variant="body2" color={vividOrange} fontWeight="600">
                          -{formatNumber(parseFloat(formData.remise))} €
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1, borderColor: alpha(darkCayn, 0.2) }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color={darkCayn}>Total</Typography>
                      <Typography variant="h6" color={darkCayn} fontWeight="bold">
                        {formatNumber(calculerTotal())} €
                      </Typography>
                    </Box>
                  </Card>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      onClick={() => setActiveStep(0)} 
                      variant="outlined"
                      disabled={submitting}
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
                      Retour aux produits
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSubmit}
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
                      sx={{ 
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                        '&:disabled': {
                          background: alpha(darkCayn, 0.3)
                        }
                      }}
                    >
                      {submitting ? 'Création en cours...' : 'Créer la vente'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier une vente */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${vividOrange} 0%, ${darkCayn} 100%)`,
          color: 'white',
          fontWeight: 'bold'
        }}>
          Modifier la Vente {editingVente?.numero_vente}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 2 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Modification des Produits et Entrepôts
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Modifiez les produits et entrepôts de votre vente.
                  </Typography>
                  
                  {formData.lignes_vente.map((ligne, index) => (
                    <Card key={index} sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: `1px solid ${alpha(darkCayn, 0.2)}`, 
                      borderRadius: 2,
                      backgroundColor: alpha(darkCayn, 0.02)
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: darkCayn }}>Produit *</InputLabel>
                            <Select
                              value={ligne.produit}
                              label="Produit *"
                              onChange={(e) => handleLigneChange(index, 'produit', e.target.value)}
                              required
                              sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: darkCayn,
                                }
                              }}
                            >
                              <MenuItem value="">Sélectionner un produit</MenuItem>
                              {produits.map((produit) => (
                                <MenuItem key={produit.id} value={produit.id.toString()}>
                                  {produit.nom} - {produit.prix_vente} €
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: darkCayn }}>Entrepôt *</InputLabel>
                            <Select
                              value={ligne.entrepot}
                              label="Entrepôt *"
                              onChange={(e) => handleLigneChange(index, 'entrepot', e.target.value)}
                              required
                              disabled={!ligne.produit}
                              sx={{
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: darkCayn,
                                }
                              }}
                            >
                              <MenuItem value="">Sélectionner un entrepôt</MenuItem>
                              {getEntrepotsForProduit(ligne.produit).map((entrepot) => (
                                <MenuItem key={entrepot.id} value={entrepot.id.toString()}>
                                  {entrepot.nom}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Quantité *"
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => handleLigneChange(index, 'quantite', e.target.value)}
                            inputProps={{ min: 1 }}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: darkCayn,
                                },
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="Prix unitaire *"
                            type="number"
                            value={ligne.prix_unitaire}
                            onChange={(e) => handleLigneChange(index, 'prix_unitaire', e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: darkCayn,
                                },
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={1}>
                          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: darkCayn }}>
                            {ligne.produit && ligne.quantite && ligne.prix_unitaire 
                              ? formatNumber(ligne.quantite * parseFloat(ligne.prix_unitaire))
                              : '0.00'} €
                          </Typography>
                        </Grid>
                        
                        {formData.lignes_vente.length > 1 && (
                          <Grid item xs={12} md={1}>
                            <IconButton 
                              color="error" 
                              onClick={() => removeLigneVente(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        )}
                      </Grid>
                    </Card>
                  ))}

                  <Button 
                    onClick={addLigneVente} 
                    startIcon={<AddIcon />}
                    sx={{ 
                      mt: 1,
                      color: darkCayn,
                      borderColor: darkCayn,
                      '&:hover': {
                        borderColor: vividOrange,
                        backgroundColor: alpha(vividOrange, 0.04)
                      }
                    }}
                    variant="outlined"
                  >
                    Ajouter une ligne
                  </Button>

                  <Card sx={{ 
                    mt: 3, 
                    p: 2, 
                    backgroundColor: alpha(darkCayn, 0.04), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(darkCayn, 0.2)}`
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                      Total provisoire: {formatNumber(calculerTotal())} €
                    </Typography>
                  </Card>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={validerEtapeClient}
                      disabled={formData.lignes_vente.filter(l => l.produit && l.entrepot && l.quantite && l.prix_unitaire).length === 0}
                      sx={{
                        background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
                        '&:disabled': {
                          background: alpha(darkCayn, 0.3)
                        }
                      }}
                    >
                      Continuer vers la finalisation
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Étape 2: Client et finalisation */}
              <Step>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: darkCayn }}>
                    Finalisation de la Modification
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
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
                          <MenuItem value="">Aucun client</MenuItem>
                          {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              {client.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date d'échéance"
                        name="date_echeance"
                        type="date"
                        value={formData.date_echeance}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
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
                        label="Notes"
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

                  <Card sx={{ 
                    mt: 3, 
                    p: 3, 
                    backgroundColor: alpha(darkCayn, 0.04), 
                    borderRadius: 2,
                    border: `1px solid ${alpha(darkCayn, 0.2)}`
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: darkCayn }}>
                      Récapitulatif de la vente
                    </Typography>
                    {formData.lignes_vente.filter(l => l.produit && l.entrepot && l.quantite && l.prix_unitaire).map((ligne, index) => {
                      const produit = produits.find(p => p.id == ligne.produit)
                      const entrepot = entrepots.find(e => e.id == ligne.entrepot)
                      return (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box>
                            <Typography variant="body2">
                              {produit?.nom} x{ligne.quantite}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Entrepôt: {entrepot?.nom}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="600" color={darkCayn}>
                            {formatNumber(ligne.quantite * parseFloat(ligne.prix_unitaire))} €
                          </Typography>
                        </Box>
                      )
                    })}
                    {formData.remise > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Remise</Typography>
                        <Typography variant="body2" color={vividOrange} fontWeight="600">
                          -{formatNumber(parseFloat(formData.remise))} €
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1, borderColor: alpha(darkCayn, 0.2) }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" color={darkCayn}>Total</Typography>
                      <Typography variant="h6" color={darkCayn} fontWeight="bold">
                        {formatNumber(calculerTotal())} €
                      </Typography>
                    </Box>
                  </Card>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                      onClick={() => setActiveStep(0)} 
                      variant="outlined"
                      disabled={submitting}
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
                      Retour aux produits
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleEditSubmit}
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
                      {submitting ? 'Modification en cours...' : 'Modifier la vente'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails de vente */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog} 
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
          Détails de la vente {selectedVente?.numero_vente}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedVente && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Client</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: darkCayn }} />
                      <Typography variant="body1" fontWeight="600" color={darkCayn}>
                        {selectedVente.client_nom || 'Aucun client'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Date</Typography>
                    <Typography variant="body1" fontWeight="600" color={darkCayn}>
                      {new Date(selectedVente.created_at).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(selectedVente.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Statut</Typography>
                    <Chip
                      label={getStatutLabel(selectedVente.statut)}
                      color={getStatutColor(selectedVente.statut)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Créé par</Typography>
                    <Typography variant="body1" fontWeight="600" color={darkCayn}>
                      {selectedVente.created_by_email}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Statut Paiement</Typography>
                    <Chip
                      label={getStatutPaiementLabel(selectedVente)}
                      color={getStatutPaiementColor(selectedVente.statut_paiement, selectedVente)}
                      sx={{ fontWeight: 600 }}
                    />
                    {selectedVente.montant_paye > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={getPourcentagePaye(selectedVente)} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: alpha(darkCayn, 0.1),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: vividOrange
                            }
                          }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {getPourcentagePaye(selectedVente)}% payé
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>Mode de paiement</Typography>
                    <Typography variant="body1" fontWeight="600" color={darkCayn}>
                      {selectedVente.mode_paiement ? 
                        selectedVente.mode_paiement.charAt(0).toUpperCase() + selectedVente.mode_paiement.slice(1).replace('_', ' ') 
                        : 'Non spécifié'}
                    </Typography>
                  </Card>
                </Grid>
                {selectedVente.date_echeance && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2, borderColor: alpha(darkCayn, 0.2) }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>Échéance de paiement</Typography>
                      <Typography variant="body1" fontWeight="600" color={darkCayn}>
                        {new Date(selectedVente.date_echeance).toLocaleDateString('fr-FR')}
                        {new Date(selectedVente.date_echeance) < new Date() && selectedVente.statut_paiement !== 'paye' && (
                          <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                            (En retard)
                          </Typography>
                        )}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: darkCayn }}>Produits de la vente</Typography>
              {selectedVente.lignes_vente && selectedVente.lignes_vente.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ 
                  borderRadius: 2,
                  borderColor: alpha(darkCayn, 0.2)
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(darkCayn, 0.04) }}>
                        <TableCell sx={{ fontWeight: 600, color: darkCayn }}>Produit</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: darkCayn }}>Entrepôt</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: darkCayn }}>Quantité</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: darkCayn }}>Prix unitaire</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: darkCayn }}>Sous-total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedVente.lignes_vente.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500" color={darkCayn}>
                              {ligne.produit_nom}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarehouseIcon fontSize="small" sx={{ color: darkCayn }} />
                              <Typography variant="body2" color={darkCayn}>
                                {ligne.entrepot_nom}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={ligne.quantite} 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha(vividOrange, 0.1),
                                color: vividOrange,
                                border: `1px solid ${alpha(vividOrange, 0.3)}`
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color={darkCayn}>
                              {formatNumber(parseFloat(ligne.prix_unitaire))} €
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="600" color={darkCayn}>
                              {ligne.sous_total ? formatNumber(parseFloat(ligne.sous_total)) : formatNumber(ligne.quantite * parseFloat(ligne.prix_unitaire))} €
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  Aucun produit dans cette vente
                </Typography>
              )}

              <Card sx={{ 
                mt: 3, 
                p: 3, 
                background: alpha(darkCayn, 0.04), 
                borderRadius: 2,
                border: `1px solid ${alpha(darkCayn, 0.2)}`
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Montant total:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="h6" fontWeight="bold" color={darkCayn}>
                      {formatNumber(parseFloat(selectedVente.montant_total || 0))} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Remise appliquée:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight="600" color={darkCayn}>
                      {formatNumber(parseFloat(selectedVente.remise || 0))} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Montant payé:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" color={vividOrange} fontWeight="600">
                      {formatNumber(parseFloat(selectedVente.montant_paye || 0))} €
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" color={darkCayn}>Montant restant:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="h4" color={selectedVente.montant_restant > 0 ? vividOrange : darkCayn} fontWeight="bold">
                      {formatNumber(parseFloat(selectedVente.montant_restant || 0))} €
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDetailsDialog}
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
            Fermer
          </Button>
          {selectedVente && selectedVente.statut_paiement !== 'paye' && (
            <Button 
              variant="contained" 
              startIcon={<PointOfSaleIcon />}
              onClick={() => handleOpenPaiementDialog(selectedVente)}
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${vividOrange} 0%, ${darkCayn} 100%)`,
              }}
            >
              Enregistrer Paiement
            </Button>
          )}
          {selectedVente && (
            <Button 
              variant="contained" 
              startIcon={<PdfIcon />}
              onClick={() => generatePDF(selectedVente)}
              sx={{ 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${darkCayn} 0%, ${vividOrange} 100%)`,
              }}
            >
              Générer Facture PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog pour enregistrer un paiement */}
      <Dialog
        open={openPaiementDialog}
        onClose={handleClosePaiementDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${vividOrange} 0%, ${darkCayn} 100%)`,
          color: 'white',
          fontWeight: 'bold'
        }}>
          Enregistrer un Paiement
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {ventePourPaiement && (
            <Box sx={{ pt: 2 }}>
              <Card sx={{ 
                mb: 3, 
                p: 2, 
                backgroundColor: alpha(darkCayn, 0.05),
                border: `1px solid ${alpha(darkCayn, 0.2)}`
              }}>
                <Typography variant="subtitle2" color="textSecondary">Vente</Typography>
                <Typography variant="h6" fontWeight="600" color={darkCayn}>
                  {ventePourPaiement.numero_vente}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Client: {ventePourPaiement.client_nom || 'Aucun client'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color={darkCayn}>
                    Total: {formatNumber(parseFloat(ventePourPaiement.montant_total || 0))} €
                  </Typography>
                  <Typography variant="body2" color={vividOrange}>
                    Payé: {formatNumber(parseFloat(ventePourPaiement.montant_paye || 0))} €
                  </Typography>
                  <Typography variant="body2" color={darkCayn}>
                    Reste: {formatNumber(parseFloat(ventePourPaiement.montant_restant || 0))} €
                  </Typography>
                </Box>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Montant du paiement *"
                    name="montant"
                    type="number"
                    value={formPaiement.montant}
                    onChange={handlePaiementChange}
                    inputProps={{ 
                      min: 0,
                      max: parseFloat(ventePourPaiement.montant_restant || 0),
                      step: 0.01
                    }}
                    required
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
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: darkCayn }}>Mode de paiement *</InputLabel>
                    <Select
                      name="mode_paiement"
                      value={formPaiement.mode_paiement}
                      label="Mode de paiement *"
                      onChange={handlePaiementChange}
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: darkCayn,
                        }
                      }}
                    >
                      <MenuItem value="especes">Espèces</MenuItem>
                      <MenuItem value="carte_bancaire">Carte bancaire</MenuItem>
                      <MenuItem value="cheque">Chèque</MenuItem>
                      <MenuItem value="virement">Virement</MenuItem>
                      <MenuItem value="mobile_money">Mobile Money</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Référence (optionnel)"
                    name="reference"
                    value={formPaiement.reference}
                    onChange={handlePaiementChange}
                    placeholder="N° chèque, référence virement..."
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
                    value={formPaiement.notes}
                    onChange={handlePaiementChange}
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

              {ventePourPaiement.date_echeance && (
                <Alert severity="info" sx={{ mt: 2, border: `1px solid ${alpha(darkCayn, 0.2)}` }}>
                  Échéance: {new Date(ventePourPaiement.date_echeance).toLocaleDateString('fr-FR')}
                  {new Date(ventePourPaiement.date_echeance) < new Date() && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Date d'échéance dépassée!
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClosePaiementDialog}
            variant="outlined"
            disabled={submitting}
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
            variant="contained" 
            onClick={handleEnregistrerPaiement}
            disabled={submitting || formPaiement.montant <= 0 || !formPaiement.mode_paiement}
            startIcon={submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${vividOrange} 0%, ${darkCayn} 100%)`,
              '&:disabled': {
                background: alpha(darkCayn, 0.3)
              }
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de suppression */}
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
            Êtes-vous sûr de vouloir supprimer la vente <strong>"{venteToDelete?.numero_vente}"</strong> ? 
            Cette action est irréversible.
          </Typography>

          {venteToDelete && (
            <Card variant="outlined" sx={{ 
              mb: 3, 
              p: 2, 
              textAlign: 'left',
              borderColor: alpha(darkCayn, 0.2)
            }}>
              <Typography variant="body2" color="textSecondary">
                <strong>Numéro:</strong> {venteToDelete.numero_vente}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Client:</strong> {venteToDelete.client_nom || 'Aucun client'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Montant:</strong> {formatNumber(parseFloat(venteToDelete.montant_total || 0))} €
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Statut:</strong> {getStatutLabel(venteToDelete.statut)}
              </Typography>
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
            onClick={handleDeleteVente}
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

export default Ventes