// utils/pdfGenerator.js
import jsPDF from 'jspdf';

// Fonction utilitaire pour formater les nombres
const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number || 0);
};

// Fonction utilitaire pour gérer les valeurs manquantes
const safeGet = (obj, property, defaultValue = 'N/A') => {
  if (!obj) return defaultValue;
  const value = obj[property];
  return value !== undefined && value !== null ? value : defaultValue;
};

export const generateVentePDF = (vente, options = {}) => {
  try {
    // Valider les données d'entrée
    if (!vente) {
      throw new Error('Aucune donnée de vente fournie');
    }

    // Configuration par défaut
    const config = {
      title: `Facture ${safeGet(vente, 'numero_vente', 'N/A')}`,
      companyName: 'StockMaster Pro',
      companyAddress: '123 Rue des Entreprises, 75000 Paris',
      companyEmail: 'contact@stockmaster.com',
      companyPhone: '01 23 45 67 89',
      tauxTVA: 0.2,
      logoUrl: null,
      ...options
    };

    // Créer le document PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dimensions
    const pageWidth = 210;
    const pageHeight = 297;
    const margins = {
      left: 20,
      right: 20,
      top: 30,
      bottom: 30
    };

    // Couleurs
    const colors = {
      primary: [25, 118, 210],
      secondary: [156, 39, 176],
      success: [46, 125, 50],
      warning: [237, 108, 2],
      error: [211, 47, 47],
      grey: [158, 158, 158],
      lightGrey: [245, 245, 245]
    };

    // Variables de position
    let yPos = margins.top;

    // ==================== EN-TÊTE ====================
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Titre
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', pageWidth / 2, 20, { align: 'center' });
    
    // Numéro et date
    doc.setFontSize(10);
    doc.text(`N°: ${safeGet(vente, 'numero_vente', 'N/A')}`, pageWidth / 2, 30, { align: 'center' });
    
    const dateVente = vente.created_at || vente.date || new Date();
    doc.text(`Date: ${new Date(dateVente).toLocaleDateString('fr-FR')}`, pageWidth / 2, 36, { align: 'center' });

    yPos = 55;

    // ==================== ENTREPRISE ====================
    doc.setTextColor(...colors.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(config.companyName.toUpperCase(), margins.left, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const companyLines = [
      config.companyAddress,
      `Tél: ${config.companyPhone}`,
      `Email: ${config.companyEmail}`
    ];
    
    companyLines.forEach((line, index) => {
      doc.text(line, margins.left, yPos + 5 + (index * 4));
    });

    // ==================== CLIENT ====================
    const clientX = pageWidth - 100;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('CLIENT', clientX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const clientLines = [
      `Nom: ${safeGet(vente, 'client_nom', 'Non spécifié')}`,
      `Adresse: ${safeGet(vente, 'client_adresse', 'Non spécifiée')}`,
      vente.client_telephone ? `Tél: ${vente.client_telephone}` : '',
      vente.client_email ? `Email: ${vente.client_email}` : ''
    ].filter(line => line.trim() !== '');
    
    clientLines.forEach((line, index) => {
      doc.text(line, clientX, yPos + 5 + (index * 4));
    });

    yPos += Math.max(companyLines.length, clientLines.length) * 4 + 15;

    // ==================== TABLEAU DES PRODUITS ====================
    // En-tête du tableau
    doc.setFillColor(...colors.lightGrey);
    doc.rect(margins.left, yPos, pageWidth - margins.left - margins.right, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const colPositions = {
      produit: margins.left + 2,
      entrepot: margins.left + 70,
      quantite: margins.left + 105,
      prix: margins.left + 125,
      total: margins.left + 155
    };
    
    doc.text('PRODUIT', colPositions.produit, yPos + 5);
    doc.text('ENTREPÔT', colPositions.entrepot, yPos + 5);
    doc.text('QTÉ', colPositions.quantite, yPos + 5);
    doc.text('PRIX U.', colPositions.prix, yPos + 5, { align: 'right' });
    doc.text('SOUS-TOTAL', colPositions.total, yPos + 5, { align: 'right' });
    
    yPos += 12;
    
    // Lignes des produits
    const lignesVente = vente.lignes_vente || vente.lignes || [];
    let totalProduits = 0;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    if (lignesVente.length === 0) {
      doc.text('Aucun produit dans cette vente', margins.left, yPos);
      yPos += 8;
    } else {
      lignesVente.forEach((ligne, index) => {
        // Vérifier s'il faut ajouter une nouvelle page
        if (yPos > pageHeight - margins.bottom) {
          doc.addPage();
          yPos = margins.top;
          
          // Réafficher l'en-tête du tableau sur la nouvelle page
          doc.setFillColor(...colors.lightGrey);
          doc.rect(margins.left, yPos, pageWidth - margins.left - margins.right, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.text('PRODUIT', colPositions.produit, yPos + 5);
          doc.text('ENTREPÔT', colPositions.entrepot, yPos + 5);
          doc.text('QTÉ', colPositions.quantite, yPos + 5);
          doc.text('PRIX U.', colPositions.prix, yPos + 5, { align: 'right' });
          doc.text('SOUS-TOTAL', colPositions.total, yPos + 5, { align: 'right' });
          yPos += 12;
          doc.setFont('helvetica', 'normal');
        }
        
        const produitNom = safeGet(ligne, 'produit_nom', safeGet(ligne, 'produit', 'Produit non spécifié'));
        const entrepotNom = safeGet(ligne, 'entrepot_nom', safeGet(ligne, 'entrepot', 'N/A'));
        const quantite = parseInt(safeGet(ligne, 'quantite', 0)) || 0;
        const prixUnitaire = parseFloat(safeGet(ligne, 'prix_unitaire', 0)) || 0;
        const sousTotal = quantite * prixUnitaire;
        totalProduits += sousTotal;
        
        // Nom du produit (avec gestion du débordement)
        const maxProduitWidth = 60;
        let produitText = produitNom;
        if (doc.getTextWidth(produitText) > maxProduitWidth) {
          produitText = produitText.substring(0, 20) + '...';
        }
        
        doc.text(produitText, colPositions.produit, yPos);
        doc.text(entrepotNom, colPositions.entrepot, yPos);
        doc.text(quantite.toString(), colPositions.quantite, yPos);
        doc.text(formatNumber(prixUnitaire) + ' €', colPositions.prix, yPos, { align: 'right' });
        doc.text(formatNumber(sousTotal) + ' €', colPositions.total, yPos, { align: 'right' });
        
        yPos += 6;
      });
    }
    
    yPos += 10;
    
    // ==================== CALCULS ====================
    const remise = parseFloat(safeGet(vente, 'remise', 0)) || 0;
    const montantHT = Math.max(0, totalProduits - remise);
    const tva = montantHT * config.tauxTVA;
    const totalTTC = montantHT + tva;
    
    const calculX = pageWidth - margins.right - 60;
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(calculX, yPos, pageWidth - margins.right, yPos);
    yPos += 8;
    
    // Sous-total
    doc.setFontSize(9);
    doc.text('Sous-total:', calculX, yPos);
    doc.text(formatNumber(totalProduits) + ' €', pageWidth - margins.right, yPos, { align: 'right' });
    yPos += 6;
    
    // Remise
    if (remise > 0) {
      doc.text('Remise:', calculX, yPos);
      doc.setTextColor(colors.error[0], colors.error[1], colors.error[2]);
      doc.text('-' + formatNumber(remise) + ' €', pageWidth - margins.right, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    }
    
    // Total HT
    doc.setFont('helvetica', 'bold');
    doc.text('Total HT:', calculX, yPos);
    doc.text(formatNumber(montantHT) + ' €', pageWidth - margins.right, yPos, { align: 'right' });
    yPos += 6;
    
    // TVA
    doc.setFont('helvetica', 'normal');
    doc.text(`TVA (${(config.tauxTVA * 100).toFixed(0)}%):`, calculX, yPos);
    doc.text(formatNumber(tva) + ' €', pageWidth - margins.right, yPos, { align: 'right' });
    yPos += 6;
    
    // Ligne de séparation finale
    doc.setDrawColor(150, 150, 150);
    doc.line(calculX, yPos, pageWidth - margins.right, yPos);
    yPos += 10;
    
    // Total TTC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.success);
    doc.text('TOTAL TTC:', calculX, yPos);
    doc.text(formatNumber(totalTTC) + ' €', pageWidth - margins.right, yPos, { align: 'right' });
    
    // ==================== PIED DE PAGE ====================
    const footerY = pageHeight - margins.bottom + 10;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.grey);
    
    // Ligne de séparation
    doc.setDrawColor(220, 220, 220);
    doc.line(margins.left, footerY - 15, pageWidth - margins.right, footerY - 15);
    
    // Informations de pied de page
    doc.text(config.companyName, pageWidth / 2, footerY - 10, { align: 'center' });
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`, pageWidth / 2, footerY - 5, { align: 'center' });
    
    // Numéro de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    return doc;
    
  } catch (error) {
    console.error('Erreur détaillée lors de la génération du PDF:', error);
    throw error;
  }
};

export const exportVenteToPDF = (vente, options = {}) => {
  try {
    console.log('Données reçues pour le PDF:', vente);
    
    // Valider les données minimales
    if (!vente) {
      throw new Error('Aucune donnée de vente fournie');
    }
    
    // S'assurer que les lignes de vente existent
    if (!vente.lignes_vente && !vente.lignes) {
      vente.lignes_vente = [];
    }
    
    // Générer le PDF
    const doc = generateVentePDF(vente, options);
    
    // Nom du fichier
    const numeroVente = vente.numero_vente || 
                       vente.numero || 
                       `vente-${new Date(vente.created_at || Date.now()).getTime()}`;
    const fileName = options.fileName || `facture-${numeroVente}.pdf`;
    
    // Télécharger
    doc.save(fileName);
    
    return { 
      success: true, 
      fileName,
      message: 'PDF généré avec succès'
    };
    
  } catch (error) {
    console.error('Erreur dans exportVenteToPDF:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.stack
    };
  }
};

// Fonction pour déboguer les données
export const debugVenteData = (vente) => {
  console.group('=== DEBUG DONNÉES VENTE ===');
  console.log('Vente complète:', vente);
  console.log('Numéro:', vente.numero_vente);
  console.log('Client:', vente.client_nom);
  console.log('Date:', vente.created_at);
  console.log('Lignes de vente:', vente.lignes_vente);
  console.log('Nombre de lignes:', vente.lignes_vente?.length || 0);
  console.groupEnd();
  return vente;
};