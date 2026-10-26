import re

with open('templates/accounts/profile_complete_bailleur.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject CSS styles
css_styles = """
  .file-drop-area {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background-color: #f9fafb;
    transition: all 0.2s ease;
    cursor: pointer;
    text-align: center;
    overflow: hidden;
  }
  .file-drop-area:hover, .file-drop-area.dragover {
    border-color: var(--or);
    background-color: rgba(212, 175, 55, 0.05);
  }
  .file-drop-icon {
    margin-bottom: 12px;
    color: #9ca3af;
  }
  .file-drop-text {
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 4px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
  }
  .file-drop-subtext {
    font-size: 12px;
    color: #6b7280;
  }
  .file-drop-input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }
  .file-preview-badge {
    display: inline-flex;
    align-items: center;
    background: #ecfdf5;
    color: #059669;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 12px;
    border: 1px solid #a7f3d0;
    z-index: 3;
  }
  .file-name-display {
    color: var(--bleu);
    font-weight: 600;
    font-size: 13px;
    margin-top: 8px;
    word-break: break-all;
  }
"""

content = content.replace('</style>', f'{css_styles}\n</style>')

# 2. Define the SVG icon
upload_svg = """<svg class="file-drop-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="17 8 12 3 7 8"></polyline>
  <line x1="12" y1="3" x2="12" y2="15"></line>
</svg>"""

# 3. Replace CNI Recto
cni_recto_old = """<div class="form-group">
            <label>Pièce d'identité (Recto) *</label>
            <input type="file" name="cni_recto" class="form-control" accept="image/*,application/pdf" {% if not dossier.cni_recto %}required{% endif %}>
            {% if dossier.cni_recto %}
              <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.cni_recto.name|slice:"10:" }}</small>
            {% endif %}
          </div>"""

cni_recto_new = f"""<div class="form-group">
            <label>Pièce d'identité (Recto) *</label>
            <div class="file-drop-area" id="drop-recto">
              {upload_svg}
              <div class="file-drop-text">Cliquez ou glissez le fichier ici</div>
              <div class="file-drop-subtext">JPG, PNG ou PDF (Max 5MB)</div>
              <input type="file" name="cni_recto" class="file-drop-input" accept="image/*,application/pdf" {{% if not dossier.cni_recto %}}required{{% endif %}} onchange="updateFileName(this, 'preview-recto')">
              <div id="preview-recto" class="file-name-display"></div>
            </div>
            {{% if dossier.cni_recto %}}
              <div class="file-preview-badge">✓ Fichier actuel : {{{{ dossier.cni_recto.name|slice:"10:" }}}}</div>
            {{% endif %}}
          </div>"""

content = content.replace(cni_recto_old, cni_recto_new)

# 4. Replace CNI Verso
cni_verso_old = """<div class="form-group">
            <label>Pièce d'identité (Verso) *</label>
            <input type="file" name="cni_verso" class="form-control" accept="image/*,application/pdf" {% if not dossier.cni_verso %}required{% endif %}>
            {% if dossier.cni_verso %}
              <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.cni_verso.name|slice:"10:" }}</small>
            {% endif %}
          </div>"""

cni_verso_new = f"""<div class="form-group">
            <label>Pièce d'identité (Verso) *</label>
            <div class="file-drop-area" id="drop-verso">
              {upload_svg}
              <div class="file-drop-text">Cliquez ou glissez le fichier ici</div>
              <div class="file-drop-subtext">JPG, PNG ou PDF (Max 5MB)</div>
              <input type="file" name="cni_verso" class="file-drop-input" accept="image/*,application/pdf" {{% if not dossier.cni_verso %}}required{{% endif %}} onchange="updateFileName(this, 'preview-verso')">
              <div id="preview-verso" class="file-name-display"></div>
            </div>
            {{% if dossier.cni_verso %}}
              <div class="file-preview-badge">✓ Fichier actuel : {{{{ dossier.cni_verso.name|slice:"10:" }}}}</div>
            {{% endif %}}
          </div>"""

content = content.replace(cni_verso_old, cni_verso_new)

# 5. Replace Selfie
selfie_old = """<div class="form-group">
          <label>Selfie avec la pièce d'identité visible *</label>
          <input type="file" name="selfie" class="form-control" accept="image/*" {% if not dossier.selfie %}required{% endif %}>
          {% if dossier.selfie %}
            <small style="color:var(--vert); display:block; margin-top:5px;">✓ Fichier actuel : {{ dossier.selfie.name|slice:"12:" }}</small>
          {% endif %}
        </div>"""

selfie_new = f"""<div class="form-group">
          <label>Selfie avec la pièce d'identité visible *</label>
          <div class="file-drop-area" id="drop-selfie">
            <svg class="file-drop-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <div class="file-drop-text">Cliquez ou glissez votre selfie ici</div>
            <div class="file-drop-subtext">JPG ou PNG uniquement</div>
            <input type="file" name="selfie" class="file-drop-input" accept="image/*" {{% if not dossier.selfie %}}required{{% endif %}} onchange="updateFileName(this, 'preview-selfie')">
            <div id="preview-selfie" class="file-name-display"></div>
          </div>
          {{% if dossier.selfie %}}
            <div class="file-preview-badge">✓ Fichier actuel : {{{{ dossier.selfie.name|slice:"12:" }}}}</div>
          {{% endif %}}
        </div>"""

content = content.replace(selfie_old, selfie_new)

# 6. Inject JS function for filename update
js_code = """
<script>
function updateFileName(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    preview.innerHTML = "📸 " + input.files[0].name;
    // Hide the default text and icon for a cleaner look
    const area = input.parentElement;
    area.querySelector('.file-drop-icon').style.display = 'none';
    area.querySelector('.file-drop-text').style.display = 'none';
    area.querySelector('.file-drop-subtext').style.display = 'none';
    area.style.borderStyle = 'solid';
    area.style.borderColor = 'var(--or)';
    area.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
  } else {
    preview.innerHTML = "";
  }
}
</script>
</body>
"""

content = content.replace('</body>', js_code)

with open('templates/accounts/profile_complete_bailleur.html', 'w', encoding='utf-8') as f:
    f.write(content)
