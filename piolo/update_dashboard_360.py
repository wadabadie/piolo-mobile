import re

with open('templates/accounts/dashboard_bailleur.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add "Visite 360" button in the actions area
btn_action_old = """                  <form action="{% url 'properties:archive' prop.slug %}" method="POST" style="display:inline;" onsubmit="return confirm('Voulez-vous archiver cette annonce ?');">
                    {% csrf_token %}
                    <button type="submit" class="btn-ico danger" title="Archiver" style="border:none; background:none; cursor:pointer;">
                      <svg viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                    </button>
                  </form>
                </div>"""

btn_action_new = """                  <form action="{% url 'properties:archive' prop.slug %}" method="POST" style="display:inline;" onsubmit="return confirm('Voulez-vous archiver cette annonce ?');">
                    {% csrf_token %}
                    <button type="submit" class="btn-ico danger" title="Archiver" style="border:none; background:none; cursor:pointer;">
                      <svg viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
                    </button>
                  </form>
                  <a href="{% url 'properties:tour_editor' prop.slug %}" class="btn-ico tour-360-btn" data-slug="{{ prop.slug }}" title="Visite 360°" style="color:var(--or);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"></path><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"></path><path d="M2 12h20"></path></svg>
                  </a>
                </div>"""

content = content.replace(btn_action_old, btn_action_new)

# 2. Add Onboarding Modal at the end of body
modal_html = """
<!-- MODAL ONBOARDING VISITE 360 -->
<div id="onboarding-360-overlay" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
  <div class="modal-content" style="background:#fff; border-radius:16px; width:450px; max-width:90%; padding:30px; text-align:center; position:relative; animation: slideUp 0.4s ease;">
    <button onclick="document.getElementById('onboarding-360-overlay').style.display='none'" style="position:absolute; right:20px; top:20px; background:none; border:none; font-size:24px; cursor:pointer; color:#999;">&times;</button>
    
    <div style="width:70px; height:70px; background:rgba(212,175,55,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px;">
      <svg width="32" height="32" fill="none" stroke="var(--or)" stroke-width="2" viewBox="0 0 24 24">
        <path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"></path>
        <path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"></path>
        <path d="M2 12h20"></path>
      </svg>
    </div>
    
    <h2 style="font-family:'Poppins', sans-serif; font-size:22px; margin-bottom:12px; color:var(--bleu);">Félicitations pour votre publication !</h2>
    <p style="color:var(--gris-f); font-size:14px; margin-bottom:24px; line-height:1.6;">
      Saviez-vous que les biens avec une <strong>Visite Virtuelle 360°</strong> sont loués 3 fois plus vite ?<br><br>
      Cliquez sur l'icône <span style="color:var(--or); font-weight:bold;">Visite 360°</span> à côté de votre bien pour créer une visite interactive et immersive en quelques clics.
    </p>
    
    <button onclick="highlight360Button()" style="background:linear-gradient(135deg, var(--or), var(--or-l)); color:#000; border:none; padding:12px 24px; border-radius:8px; font-family:'Poppins', sans-serif; font-weight:600; font-size:15px; cursor:pointer; width:100%; box-shadow:0 4px 12px rgba(212,175,55,0.3);">
      Découvrir l'outil 360°
    </button>
  </div>
</div>

<style>
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulseHighlight { 
  0% { box-shadow: 0 0 0 0 rgba(212,175,55,0.7); transform: scale(1); }
  50% { box-shadow: 0 0 0 15px rgba(212,175,55,0); transform: scale(1.1); }
  100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); transform: scale(1); }
}
.highlight-360-btn { animation: pulseHighlight 1.5s infinite; background: rgba(212,175,55,0.1); border-radius: 50%; }
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters for just_published
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('just_published')) {
    document.getElementById('onboarding-360-overlay').style.display = 'flex';
    // Remove the param from URL without reloading
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

function highlight360Button() {
  document.getElementById('onboarding-360-overlay').style.display = 'none';
  const firstBtn = document.querySelector('.tour-360-btn');
  if (firstBtn) {
    firstBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstBtn.classList.add('highlight-360-btn');
    setTimeout(() => { firstBtn.classList.remove('highlight-360-btn'); }, 4500);
  }
}
</script>
</body>
"""

content = content.replace('</body>', modal_html)

with open('templates/accounts/dashboard_bailleur.html', 'w', encoding='utf-8') as f:
    f.write(content)
