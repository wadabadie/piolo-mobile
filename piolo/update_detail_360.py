import re

with open('templates/properties/detail.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert the button before the Description block
old_text = """      <!-- Description -->
      <div class="detail-card">"""

new_text = """      {% if property.virtual_tours.exists and property.virtual_tours.first.scenes.exists %}
      <!-- BOUTON VISITE 360 -->
      <div class="virtual-tour-cta" style="margin-bottom:24px; display:flex; justify-content:center;">
        <a href="{% url 'properties:tour_viewer' property.slug %}" class="btn-360-shake">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"></path><path d="M15 2.46A10 10 0 0 0 22 12a10 10 0 0 0-7-9.54"></path><path d="M2 12h20"></path></svg>
          Effectuer la visite 360° interactive
        </a>
      </div>
      <style>
      @keyframes bell-shake {
        0% { transform: rotate(0); }
        15% { transform: rotate(5deg); }
        30% { transform: rotate(-5deg); }
        45% { transform: rotate(4deg); }
        60% { transform: rotate(-4deg); }
        75% { transform: rotate(2deg); }
        85% { transform: rotate(-2deg); }
        92% { transform: rotate(1deg); }
        100% { transform: rotate(0); }
      }
      .btn-360-shake {
        background: linear-gradient(135deg, var(--or, #D4AF37), var(--or-l, #f3d46a));
        color: #000;
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 16px;
        padding: 16px 32px;
        border-radius: 12px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 24px rgba(212,175,55,0.4);
        transition: all 0.3s ease;
        animation: bell-shake 3s infinite;
        transform-origin: center top;
      }
      .btn-360-shake:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 32px rgba(212,175,55,0.5);
        animation: none;
      }
      .btn-360-shake svg {
        width: 24px;
        height: 24px;
      }
      </style>
      {% endif %}

      <!-- Description -->
      <div class="detail-card">"""

content = content.replace(old_text, new_text)

with open('templates/properties/detail.html', 'w', encoding='utf-8') as f:
    f.write(content)
