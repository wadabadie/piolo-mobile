/**
 * PIOLO — property_create.js (v2.0 — Moderne & Robuste)
 * Gestion du formulaire de publication étape par étape avec UX premium.
 */

'use strict';

class PropertyForm {
  constructor(options = {}) {
    this.form = document.getElementById('property-form');
    if (!this.form) return;
    
    // Configuration
    this.config = {
      animationDuration: 300,
      errorDisplayDuration: 5000,
      reviewUpdateDebounce: 200,
      ...options
    };
    
    // Éléments DOM
    this.elements = {
      steps: document.querySelectorAll('.form-step'),
      progressSteps: document.querySelectorAll('.progress-step'),
      btnPrev: document.getElementById('btn-prev'),
      btnNext: document.getElementById('btn-next'),
      btnSubmit: document.getElementById('btn-submit'),
      errors: document.getElementById('form-errors'),
      userPoints: document.getElementById('user-points'),
      review: {
        title: document.getElementById('review-title'),
        type: document.getElementById('review-type'),
        price: document.getElementById('review-price'),
        location: document.getElementById('review-location'),
        area: document.getElementById('review-area')
      }
    };
    
    // État
    this.state = {
      currentStep: 1,
      totalSteps: this.elements.steps.length,
      isSubmitting: false,
      validationErrors: {}
    };
    
    this.init();
  }
  
  init() {
    this.bindNavigation();
    this.bindModal();
    this.bindImagePreview();
    this.bindReviewUpdate();
    this.bindFormSubmit();
    this.bindRealtimeValidation();
    this.updateProgress();
    this.updateReview();
    
    console.log('✅ PropertyForm initialized');
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Navigation entre étapes
  // ─────────────────────────────────────────────────────────────────────
  
  bindNavigation() {
    this.elements.btnPrev?.addEventListener('click', () => this.prevStep());
    this.elements.btnNext?.addEventListener('click', () => this.nextStep());
    
    // Support clavier : Enter pour avancer, Shift+Enter pour reculer
    this.form?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.nextStep();
      }
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        this.prevStep();
      }
    });
  }
  
  nextStep() {
    if (this.state.isSubmitting) return;
    
    const isValid = this.validateStep(this.state.currentStep);
    if (!isValid) {
      this.scrollToFirstError();
      return;
    }
    
    if (this.state.currentStep < this.state.totalSteps) {
      this.showStep(this.state.currentStep + 1);
      this.animateStepTransition('forward');
    }
  }
  
  prevStep() {
    if (this.state.isSubmitting) return;
    
    if (this.state.currentStep > 1) {
      this.showStep(this.state.currentStep - 1);
      this.animateStepTransition('backward');
    }
  }
  
  showStep(stepNumber) {
    // Mise à jour visuelle des étapes
    this.elements.steps.forEach((step, index) => {
      step.classList.toggle('active', index + 1 === stepNumber);
      step.setAttribute('aria-hidden', index + 1 !== stepNumber);
    });
    
    this.elements.progressSteps.forEach((progress, index) => {
      progress.classList.toggle('active', index + 1 <= stepNumber);
      progress.classList.toggle('completed', index + 1 < stepNumber);
    });
    
    // Mise à jour des boutons
    this.state.currentStep = stepNumber;
    this.elements.btnPrev.disabled = (stepNumber === 1);
    
    if (stepNumber === this.state.totalSteps) {
      this.elements.btnNext.style.display = 'none';
      this.elements.btnSubmit.style.display = 'inline-flex';
      this.updateReview();
    } else {
      this.elements.btnNext.style.display = 'inline-flex';
      this.elements.btnSubmit.style.display = 'none';
    }
    
    // Scroll smooth vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Focus sur le premier champ requis de la nouvelle étape
    const activeStep = this.elements.steps[stepNumber - 1];
    const firstRequired = activeStep?.querySelector('[required]:not([disabled])');
    firstRequired?.focus();
  }
  
  animateStepTransition(direction) {
    const activeStep = this.elements.steps[this.state.currentStep - 1];
    if (!activeStep) return;
    
    activeStep.style.opacity = '0';
    activeStep.style.transform = `translateX(${direction === 'forward' ? '20px' : '-20px'})`;
    
    setTimeout(() => {
      activeStep.style.transition = `opacity ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`;
      activeStep.style.opacity = '1';
      activeStep.style.transform = 'translateX(0)';
    }, 50);
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────────────
  
  validateStep(stepNumber) {
    const fieldset = this.elements.steps[stepNumber - 1];
    if (!fieldset) return true;
    
    this.state.validationErrors = {};
    let isValid = true;
    
    // Validation des champs requis
    const requiredFields = fieldset.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();
      
      if (!value) {
        isValid = false;
        this.state.validationErrors[field.name] = `${this.getFieldLabel(field)} est requis`;
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
      }
    });
    
    // Validations spécifiques par étape
    if (stepNumber === 2) {
      // Étape localisation : vérifier coordonnées GPS
      const lat = document.getElementById('id_latitude')?.value;
      const lng = document.getElementById('id_longitude')?.value;
      if (!lat || !lng) {
        isValid = false;
        this.state.validationErrors.location = 'Veuillez placer le marqueur sur la carte';
        this.showError('Localisation : Veuillez placer le marqueur sur la carte');
      }
    }
    
    if (stepNumber === 4) {
      // Étape photo : vérifier qu'une image est sélectionnée
      const imageInput = document.getElementById('id_main_image');
      if (imageInput && !imageInput.files?.length) {
        isValid = false;
        this.state.validationErrors.main_image = 'Image principale requise';
        this.showError('Veuillez sélectionner une image principale');
      }
    }
    
    if (!isValid) {
      const errorCount = Object.keys(this.state.validationErrors).length;
      this.showError(`${errorCount} erreur${errorCount > 1 ? 's' : ''} à corriger`);
    }
    
    return isValid;
  }
  
  validateAll() {
    let allValid = true;
    for (let step = 1; step <= this.state.totalSteps; step++) {
      if (!this.validateStep(step)) allValid = false;
    }
    return allValid;
  }
  
  getFieldLabel(field) {
    const label = field.closest('.form-group')?.querySelector('label');
    return label?.textContent.replace('*', '').trim() || field.name;
  }
  
  scrollToFirstError() {
    const firstError = this.form?.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus?.();
    }
  }
  
  showError(message, type = 'error') {
    if (!this.elements.errors) return;
    
    this.elements.errors.textContent = message;
    this.elements.errors.className = `form-errors ${type}`;
    this.elements.errors.style.display = 'block';
    this.elements.errors.setAttribute('role', 'alert');
    
    // Animation d'apparition
    this.elements.errors.style.opacity = '0';
    this.elements.errors.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
      this.elements.errors.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      this.elements.errors.style.opacity = '1';
      this.elements.errors.style.transform = 'translateY(0)';
    });
    
    // Auto-hide après délai
    if (type !== 'success') {
      setTimeout(() => {
        this.elements.errors.style.opacity = '0';
        setTimeout(() => {
          this.elements.errors.style.display = 'none';
        }, 300);
      }, this.config.errorDisplayDuration);
    }
  }
  
  clearErrors() {
    this.form?.querySelectorAll('.error').forEach(field => {
      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');
    });
    if (this.elements.errors) {
      this.elements.errors.style.display = 'none';
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Validation en temps réel
  // ─────────────────────────────────────────────────────────────────────
  
  bindRealtimeValidation() {
    // Validation au blur pour les champs requis
    this.form?.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => {
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        if (!value) {
          field.classList.add('error');
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.classList.remove('error');
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });
    
    // Validation du prix en temps réel
    const priceInput = document.getElementById('id_price');
    priceInput?.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (value > 0 && value < 10000) {
        e.target.setCustomValidity('Le prix minimum est de 10 000 FCFA');
      } else {
        e.target.setCustomValidity('');
      }
    });
    
    // Validation de la surface
    const areaInput = document.getElementById('id_area');
    areaInput?.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      if (value > 0 && value < 10) {
        e.target.setCustomValidity('Surface minimale : 10 m²');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Récapitulatif dynamique
  // ─────────────────────────────────────────────────────────────────────
  
  bindReviewUpdate() {
    const fields = ['title', 'transaction_type', 'property_type', 'price', 'area', 'city', 'neighborhood'];
    
    fields.forEach(fieldName => {
      const input = document.getElementById(`id_${fieldName}`);
      if (!input) return;
      
      // Debounce pour éviter trop d'appels
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.updateReview(), this.config.reviewUpdateDebounce);
      });
      
      // Mise à jour immédiate pour les select
      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => this.updateReview());
      }
    });
  }
  
  updateReview() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      if (!el) return '—';
      if (el.tagName === 'SELECT') {
        return el.options[el.selectedIndex]?.text || '—';
      }
      return el.value?.trim() || '—';
    };
    
    // Mise à jour des valeurs
    if (this.elements.review.title) {
      this.elements.review.title.textContent = getVal('id_title');
    }
    
    if (this.elements.review.type) {
      const transaction = getVal('id_transaction_type');
      const type = getVal('id_property_type');
      this.elements.review.type.textContent = `${transaction} — ${type}`;
    }
    
    if (this.elements.review.price) {
      const price = parseInt(getVal('id_price')) || 0;
      this.elements.review.price.textContent = price > 0 
        ? `${price.toLocaleString('fr-FR')} FCFA` 
        : '—';
    }
    
    if (this.elements.review.location) {
      const neighborhood = getVal('id_neighborhood');
      const city = getVal('id_city');
      const parts = [neighborhood, city].filter(v => v && v !== '—');
      this.elements.review.location.textContent = parts.length > 0 ? parts.join(', ') : '—';
    }
    
    if (this.elements.review.area) {
      const area = parseInt(getVal('id_area')) || 0;
      this.elements.review.area.textContent = area > 0 ? `${area} m²` : '—';
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Prévisualisation d'image
  // ─────────────────────────────────────────────────────────────────────
  
  bindImagePreview() {
    const input = document.getElementById('id_main_image');
    const preview = document.getElementById('main-image-preview');
    const zone = document.getElementById('main-image-zone');
    
    if (!input || !preview || !zone) return;
    
    // Drag & drop support
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.add('drag-over'));
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.remove('drag-over'));
    });
    
    zone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files?.[0]) {
        input.files = files;
        this.handleImageFile(files[0], preview);
      }
    });
    
    // Click & file input
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this.handleImageFile(file, preview);
    });
  }
  
  handleImageFile(file, previewElement) {
    // Validation côté client
    if (!file.type.startsWith('image/')) {
      this.showError('Veuillez sélectionner une image valide (JPG, PNG, WebP)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image trop volumineuse (max 5 Mo)');
      return;
    }
    
    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      previewElement.innerHTML = `
        <img src="${e.target.result}" alt="Prévisualisation" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
        <button type="button" class="image-remove" aria-label="Supprimer l'image">&times;</button>
      `;
      previewElement.style.display = 'block';
      
      // Bouton supprimer
      previewElement.querySelector('.image-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('id_main_image').value = '';
        previewElement.style.display = 'none';
      });
    };
    reader.readAsDataURL(file);
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Modal de géolocalisation
  // ─────────────────────────────────────────────────────────────────────
  
  bindModal() {
    const modal = document.getElementById('geo-modal');
    if (!modal) return;
    
    const closeBtn = document.getElementById('modal-close');
    const allowBtn = document.getElementById('geo-allow');
    const manualBtn = document.getElementById('geo-manual');
    
    // Afficher le modal à l'étape 2 si pas de coordonnées
    const observer = new MutationObserver(() => {
      const step2 = this.elements.steps[1];
      if (step2?.classList.contains('active')) {
        const lat = document.getElementById('id_latitude')?.value;
        const lng = document.getElementById('id_longitude')?.value;
        if (!lat || !lng) {
          this.showModal(modal);
        }
      }
    });
    
    if (this.elements.steps[1]) {
      observer.observe(this.elements.steps[1], { attributes: true, attributeFilter: ['class'] });
    }
    
    // Fermeture
    const closeModal = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    
    allowBtn?.addEventListener('click', () => {
      closeModal();
      window.propertyMap?.requestGeolocation?.();
    });
    
    manualBtn?.addEventListener('click', () => {
      closeModal();
      window.propertyMap?.showManualInput?.();
    });
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // Fermer avec Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });
  }
  
  showModal(modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
    
    // Focus sur le premier bouton pour accessibilité
    setTimeout(() => {
      modal.querySelector('button')?.focus();
    }, 100);
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Soumission du formulaire
  // ─────────────────────────────────────────────────────────────────────
  
  bindFormSubmit() {
    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }
  
  async handleSubmit() {
    if (this.state.isSubmitting) return;
    
    // Validation finale
    if (!this.validateAll()) {
      this.scrollToFirstError();
      return;
    }
    
    // Confirmation des points
    const currentPoints = parseInt(this.elements.userPoints?.textContent || '0');
    if (currentPoints < 20) {
      this.showError('Solde insuffisant. Rechargez vos points pour publier.');
      return;
    }
    
    const confirmed = confirm(
      `Publier cette annonce déduira 20 points de votre solde.\n` +
      `Solde actuel : ${currentPoints} pts → Après publication : ${currentPoints - 20} pts\n\n` +
      `Confirmer la publication ?`
    );
    
    if (!confirmed) return;
    
    // ═══════════════════════════════════════════════════════════════
    // ✅ 1. CRÉER LE FORMDATA AVANT DE DÉSACTIVER LES CHAMPS
    // ═══════════════════════════════════════════════════════════════
    const formData = new FormData(this.form);

    if (window.propertyGallery) {
        formData.delete('secondary_images'); // vider l'input natif (vide de toute façon)
        window.propertyGallery.getFiles().forEach(file => {
            formData.append('secondary_images', file);
        });
        console.log(`📸 ${window.propertyGallery.getFiles().length} image(s) secondaire(s) ajoutée(s)`);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ✅ 2. NETTOYAGE DES CHAMPS NUMÉRIQUES (une seule fois suffit)
    // ═══════════════════════════════════════════════════════════════
    ['price', 'area', 'bedrooms', 'bathrooms'].forEach(field => {
        const raw = formData.get(field);
        if (raw !== null) {
            // Supprimer TOUT sauf les chiffres
            const clean = String(raw).replace(/\D/g, '');
            formData.set(field, clean || '0');
        }
    });

    // Debug : log des valeurs envoyées
    console.log('📤 Données nettoyées envoyées :');
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ 3. ENSUITE ON DÉSACTIVE LES CHAMPS (état de chargement)
    // ═══════════════════════════════════════════════════════════════
    this.setSubmittingState(true);
    
    try {
      const response = await fetch('/properties/api/create/', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': this.getCsrfToken(),
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        // Succès : mise à jour des points et redirection
        if (this.elements.userPoints && result.points_remaining !== undefined) {
          this.elements.userPoints.textContent = result.points_remaining;
        }
        
        this.showSuccess(result.message || 'Annonce publiée avec succès !');
        
        // Redirection avec petit délai pour afficher le message
        setTimeout(() => {
          window.location.href = result.redirect || '/accounts/bailleur/dashboard/#annonces';
        }, 1500);
        
      } else {
        // Erreurs de validation
        if (result.errors) {
          this.handleValidationErrors(result.errors);
        } else {
          this.showError(result.error || 'Une erreur est survenue. Veuillez réessayer.');
        }
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      this.showError('Erreur de connexion. Vérifiez votre réseau et réessayez.');
      
    } finally {
      this.setSubmittingState(false);
    }
  }
  
  setSubmittingState(isSubmitting) {
    this.state.isSubmitting = isSubmitting;
    
    if (isSubmitting) {
      this.elements.btnSubmit.disabled = true;
      this.elements.btnSubmit.innerHTML = `
        <span class="spinner"></span>
        <span>Publication en cours...</span>
      `;
      this.form?.querySelectorAll('input, select, textarea, button').forEach(el => {
        if (el !== this.elements.btnSubmit) el.disabled = true;
      });
    } else {
      this.elements.btnSubmit.disabled = false;
      this.elements.btnSubmit.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        Publier mon annonce (-20 pts)
      `;
      this.form?.querySelectorAll('input, select, textarea, button').forEach(el => {
        el.disabled = false;
      });
    }
  }
  
  handleValidationErrors(errors) {
    let errorMsg = 'Corrections nécessaires :\n';
    
    Object.entries(errors).forEach(([field, message]) => {
      errorMsg += `• ${this.getFieldLabel(document.querySelector(`[name="${field}"]`)) || field}: ${message}\n`;
      
      // Highlight du champ concerné
      const fieldEl = this.form?.querySelector(`[name="${field}"]`);
      if (fieldEl) {
        fieldEl.classList.add('error');
        fieldEl.setAttribute('aria-invalid', 'true');
        fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    this.showError(errorMsg.trim());
  }
  
  showSuccess(message) {
    this.showError(message, 'success');
  }
  
  getCsrfToken() {
    const name = 'csrftoken';
    for (const cookie of document.cookie.split(';')) {
      const [k, v] = cookie.trim().split('=');
      if (k === name) return decodeURIComponent(v);
    }
    return '';
  }
  
  // ─────────────────────────────────────────────────────────────────────
  // Utilitaires
  // ─────────────────────────────────────────────────────────────────────
  
  updateProgress() {
    this.elements.progressSteps.forEach((step, index) => {
      if (index + 1 < this.state.currentStep) {
        step.classList.add('completed');
      }
    });
  }
  
  destroy() {
    // Cleanup des event listeners si nécessaire
    this.form?.removeEventListener('submit', this.handleSubmit);
    // ... autres cleanups
  }
}

// ───────────────────────────────────────────────────────────────────────
// Initialisation
// ───────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('property-form')) {
    window.propertyForm = new PropertyForm();
    
    // Cleanup au beforeunload (optionnel)
    window.addEventListener('beforeunload', () => {
      window.propertyForm?.destroy?.();
    });
  }
});


/**
 * PIOLO — PropertyGallery (images secondaires)
 * Gestion dynamique de la galerie photo avec ajout/suppression + drag & drop.
 */

class PropertyGallery {
  constructor(options = {}) {
    this.config = {
      maxImages: 10,
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      ...options
    };

    this.grid = document.getElementById('gallery-grid');
    this.addCard = document.getElementById('gallery-add-card');
    this.fileInput = document.getElementById('id_secondary_images');
    this.countEl = document.getElementById('gallery-count');

    /** @type {Array<{id: string, file: File, url: string}>} */
    this.images = [];

    if (!this.grid) return;
    this.init();
  }

  init() {
    this.bindFileInput();
    this.bindDragDrop();
    this.updateCount();
    console.log('✅ PropertyGallery initialized');
  }

  // ─────────────────────────────────────────────────────────
  // Sélection de fichiers
  // ─────────────────────────────────────────────────────────

  bindFileInput() {
    this.fileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      this.addFiles(files);
      // Reset l'input pour pouvoir re-sélectionner les mêmes fichiers
      this.fileInput.value = '';
    });
  }

  bindDragDrop() {
    if (!this.addCard) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
      this.addCard.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(evt => {
      this.addCard.addEventListener(evt, () => {
        this.addCard.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      this.addCard.addEventListener(evt, () => {
        this.addCard.classList.remove('drag-over');
      });
    });

    this.addCard.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      this.addFiles(files);
    });
  }

  // ─────────────────────────────────────────────────────────
  // Ajout de fichiers
  // ─────────────────────────────────────────────────────────

  addFiles(files) {
    const remaining = this.config.maxImages - this.images.length;

    if (remaining <= 0) {
      this.showToast(`Maximum ${this.config.maxImages} photos secondaires autorisées`, 'error');
      return;
    }

    // Limiter au nombre de places restantes
    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      this.showToast(`Seulement ${remaining} place(s) restante(s)`, 'error');
    }

    toAdd.forEach(file => {
      // Validation type
      if (!this.config.allowedTypes.includes(file.type)) {
        this.showToast(`"${file.name}" : format non supporté (JPG, PNG, WebP uniquement)`, 'error');
        return;
      }

      // Validation taille
      if (file.size > this.config.maxSizeMB * 1024 * 1024) {
        this.showToast(`"${file.name}" : trop volumineux (max ${this.config.maxSizeMB} Mo)`, 'error');
        return;
      }

      // Créer l'URL de prévisualisation
      const url = URL.createObjectURL(file);
      const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      this.images.push({ id, file, url });
      this.renderImage(this.images.length - 1);
    });

    this.updateCount();
    this.updateVisibility();
  }

  // ─────────────────────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────────────────────

  renderImage(index) {
    const item = this.images[index];
    if (!item) return;

    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.dataset.imageId = item.id;
    el.dataset.index = index;

    el.innerHTML = `
      <span class="gallery-item-order">${index + 1}</span>
      <img src="${item.url}" alt="Photo ${index + 1}">
      <div class="gallery-item-overlay">
        <button type="button" class="gallery-item-btn btn-move btn-up" title="Déplacer à gauche" ${index === 0 ? 'disabled style="opacity:.3"' : ''}>
          <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button type="button" class="gallery-item-btn btn-move btn-down" title="Déplacer à droite" ${index === this.images.length - 1 ? 'disabled style="opacity:.3"' : ''}>
          <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
        <button type="button" class="gallery-item-btn btn-remove" title="Supprimer">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;

    // Bouton supprimer
    el.querySelector('.btn-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeImage(item.id);
    });

    // Boutons déplacer
    el.querySelector('.btn-up').addEventListener('click', (e) => {
      e.stopPropagation();
      this.moveImage(item.id, -1);
    });

    el.querySelector('.btn-down').addEventListener('click', (e) => {
      e.stopPropagation();
      this.moveImage(item.id, 1);
    });

    // Insérer AVANT le bouton "Ajouter"
    this.grid.insertBefore(el, this.addCard);
  }

  // ─────────────────────────────────────────────────────────
  // Suppression
  // ─────────────────────────────────────────────────────────

  removeImage(id) {
    const index = this.images.findIndex(img => img.id === id);
    if (index === -1) return;

    // Révoquer l'URL pour libérer la mémoire
    URL.revokeObjectURL(this.images[index].url);
    this.images.splice(index, 1);

    // Re-rendre toute la grille (plus simple que manipuler le DOM)
    this.rerenderAll();
    this.updateCount();
    this.updateVisibility();
  }

  // ─────────────────────────────────────────────────────────
  // Déplacement (ordre)
  // ─────────────────────────────────────────────────────────

  moveImage(id, direction) {
    const index = this.images.findIndex(img => img.id === id);
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= this.images.length) return;

    // Swap
    [this.images[index], this.images[newIndex]] = [this.images[newIndex], this.images[index]];

    this.rerenderAll();
  }

  // ─────────────────────────────────────────────────────────
  // Re-rendu complet
  // ─────────────────────────────────────────────────────────

  rerenderAll() {
    // Supprimer tous les .gallery-item existants
    this.grid.querySelectorAll('.gallery-item').forEach(el => el.remove());

    // Re-rendre dans l'ordre actuel
    this.images.forEach((_, idx) => this.renderImage(idx));
  }

  // ─────────────────────────────────────────────────────────
  // Mise à jour du compteur et visibilité
  // ─────────────────────────────────────────────────────────

  updateCount() {
    if (!this.countEl) return;
    const count = this.images.length;
    this.countEl.textContent = `${count} / ${this.config.maxImages}`;
    this.countEl.classList.toggle('full', count >= this.config.maxImages);
  }

  updateVisibility() {
    if (!this.addCard) return;
    const isFull = this.images.length >= this.config.maxImages;
    this.addCard.classList.toggle('hidden', isFull);
  }

  // ─────────────────────────────────────────────────────────
  // Récupérer les fichiers pour le FormData
  // ─────────────────────────────────────────────────────────

  getFiles() {
    return this.images.map(img => img.file);
  }

  // ─────────────────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────────────────

  showToast(message, type = 'info') {
    // Utiliser la méthode showError du PropertyForm si disponible
    if (window.propertyForm?.showError) {
      window.propertyForm.showError(message, type === 'error' ? 'error' : 'success');
    } else {
      console.warn(`[Gallery] ${message}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Cleanup
  // ─────────────────────────────────────────────────────────

  destroy() {
    this.images.forEach(img => URL.revokeObjectURL(img.url));
    this.images = [];
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('gallery-grid')) {
    window.propertyGallery = new PropertyGallery();
  }
});