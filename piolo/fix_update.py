import re

with open('templates/properties/update.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<title>Piolo — Publier une annonce</title>', '<title>Piolo — Modifier mon annonce</title>')
content = content.replace('Publier une nouvelle annonce', 'Modifier l\'annonce')
content = content.replace('Publication = <strong>20 pts</strong>', 'Modification gratuite')

# Inject value attrs
content = re.sub(r'(<input type="text" id="id_title"[^>]*?)>', r'\1 value="{{ property.title|default_if_none:\'\' }}">\n', content)
content = re.sub(r'(<input type="text" id="id_price"[^>]*?)>', r'\1 value="{{ property.price|default_if_none:\'\' }}">\n', content)
content = re.sub(r'(<input type="number" id="id_avance_mois"[^>]*?)(value="0")', r'\1 value="{{ property.avance_mois|default_if_none:\'0\' }}"', content)
content = re.sub(r'(<input type="number" id="id_caution_mois"[^>]*?)(value="0")', r'\1 value="{{ property.caution_mois|default_if_none:\'0\' }}"', content)
content = re.sub(r'(<input type="checkbox" name="price_negotiable" id="id_price_negotiable")', r'\1 {% if property.price_negotiable %}checked{% endif %}', content)

content = re.sub(r'(<textarea id="id_description"[^>]*?>)(.*?)(</textarea>)', r'\1{{ property.description|default_if_none:\'\' }}\3', content, flags=re.DOTALL)

with open('templates/properties/update.html', 'w', encoding='utf-8') as f:
    f.write(content)
