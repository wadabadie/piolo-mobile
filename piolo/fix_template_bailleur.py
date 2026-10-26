import re

with open('templates/accounts/profile_complete_bailleur.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add rejection alert at the top of the form
alert_html = """
        {% if dossier and dossier.status == 'REJECTED' %}
        <div style="background: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin:0 0 5px 0;">Dossier refusé</h4>
          <p style="margin:0; font-size:14px;"><strong>Motif :</strong> {{ dossier.rejection_reason }}</p>
          <p style="margin:5px 0 0 0; font-size:13px;">Veuillez corriger ces informations et soumettre à nouveau votre dossier.</p>
        </div>
        {% endif %}
        """

content = content.replace('<form method="POST" enctype="multipart/form-data">', f'<form method="POST" enctype="multipart/form-data">\n{alert_html}')

# Add KYC fields before the submit button
kyc_html = """
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
        <div class="form-header">
          <h3 style="font-family: 'Poppins', sans-serif; color: var(--bleu); font-size: 20px; margin-bottom: 8px;">Vérification d'identité (KYC)</h3>
          <p style="color: var(--gris-f); font-size: 14px; margin-bottom: 20px;">Ces informations sont requises pour valider votre compte Bailleur.</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="document_type">Type de pièce d'identité *</label>
            <select id="document_type" name="document_type" class="form-control" required>
              <option value="CNI" {% if dossier.document_type == 'CNI' %}selected{% endif %}>Carte Nationale d'Identité</option>
              <option value="PASSEPORT" {% if dossier.document_type == 'PASSEPORT' %}selected{% endif %}>Passeport biométrique</option>
              <option value="SEJOUR" {% if dossier.document_type == 'SEJOUR' %}selected{% endif %}>Titre de séjour</option>
            </select>
          </div>
          <div class="form-group">
            <label for="document_number">Numéro de la pièce *</label>
            <input type="text" id="document_number" name="document_number" class="form-control" value="{{ dossier.document_number|default:'' }}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Pièce d'identité (Recto) *</label>
            <input type="file" name="cni_recto" class="form-control" accept="image/*,application/pdf" {% if not dossier.cni_recto %}required{% endif %}>
            {% if dossier.cni_recto %}
              <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.cni_recto.name|slice:"10:" }}</small>
            {% endif %}
          </div>
          <div class="form-group">
            <label>Pièce d'identité (Verso) *</label>
            <input type="file" name="cni_verso" class="form-control" accept="image/*,application/pdf" {% if not dossier.cni_verso %}required{% endif %}>
            {% if dossier.cni_verso %}
              <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.cni_verso.name|slice:"10:" }}</small>
            {% endif %}
          </div>
        </div>

        <div class="form-group">
          <label>Selfie avec la pièce d'identité visible *</label>
          <input type="file" name="selfie" class="form-control" accept="image/*" {% if not dossier.selfie %}required{% endif %}>
          {% if dossier.selfie %}
            <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.selfie.name|slice:"12:" }}</small>
          {% endif %}
        </div>

        <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
        <div class="form-header">
          <h3 style="font-family: 'Poppins', sans-serif; color: var(--bleu); font-size: 20px; margin-bottom: 8px;">Votre Patrimoine Immobilier</h3>
        </div>

        <div class="form-group">
          <label for="neighborhoods">Dans quels quartiers se trouvent vos biens ? *</label>
          <input type="text" id="neighborhoods" name="neighborhoods" class="form-control" value="{{ dossier.neighborhoods|default:'' }}" placeholder="Ex: Bastos, Bonapriso, Akwa..." required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="property_count">Nombre approximatif de biens *</label>
            <input type="number" id="property_count" name="property_count" class="form-control" value="{{ dossier.property_count|default:'1' }}" min="1" required>
          </div>
          <div class="form-group">
            <label for="property_types">Types de biens proposés *</label>
            <input type="text" id="property_types" name="property_types" class="form-control" value="{{ dossier.property_types|default:'' }}" placeholder="Ex: Appartements, Studios, Villas..." required>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description de votre activité de bailleur</label>
          <textarea id="description" name="description" class="form-control" rows="4" placeholder="Parlez-nous un peu de vos biens et de votre façon de gérer...">{{ dossier.description|default:'' }}</textarea>
        </div>

        <button type="submit" class="btn-submit">Soumettre mon dossier pour vérification</button>
"""

content = re.sub(r'<button type="submit" class="btn-submit">.*?</button>', kyc_html, content, flags=re.DOTALL)

with open('templates/accounts/profile_complete_bailleur.html', 'w', encoding='utf-8') as f:
    f.write(content)
