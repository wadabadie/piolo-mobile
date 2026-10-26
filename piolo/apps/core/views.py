# apps/core/views.py
from django.views.generic import TemplateView
from django.shortcuts import render


class HomeView(TemplateView):
    """Page d'accueil principale"""
    template_name = 'core/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = 'Accueil - Piolo'

        # Données d'exemple temporaires (à remplacer par queryset Property)
        context['sample_properties'] = [
            {
                'id': 1,
                'title': 'Spacieux Appartement',
                'price': 42000000,
                'location': 'Bonapriso, Douala',
                'bedrooms': 4,
                'bathrooms': 2,
                'area': 120,
                'image_url': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
                'transaction_type': 'À vendre',
                'is_rental': False,
                'is_favorited': False,
                'has_virtual_tour': True,   # ← champ requis par le template
            },
            {
                'id': 2,
                'title': 'Habers Villa',
                'price': 120000,
                'location': 'Bastos, Yaoundé',
                'bedrooms': 5,
                'bathrooms': 3,
                'area': 240,
                'image_url': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
                'transaction_type': 'À louer',
                'is_rental': True,
                'is_favorited': True,
                'has_virtual_tour': True,
            },
            {
                'id': 3,
                'title': 'Villa Architecte',
                'price': 85000000,
                'location': 'Bonanjo, Douala',
                'bedrooms': 4,
                'bathrooms': 3,
                'area': 180,
                'image_url': 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80',
                'transaction_type': 'À vendre',
                'is_rental': False,
                'is_favorited': False,
                'has_virtual_tour': False,
            },
            {
                'id': 4,
                'title': 'Chambre Meublée',
                'price': 30000,
                'location': 'Bonamoussadi, Douala',
                'bedrooms': 1,
                'bathrooms': 1,
                'area': 35,
                'image_url': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
                'transaction_type': 'À louer',
                'is_rental': True,
                'is_favorited': False,
                'has_virtual_tour': False,
            },
        ]
        return context


class PropertySearchReactView(TemplateView):
    """Point d'entrée du catalogue React pendant la migration progressive."""

    template_name = 'core/search_react.html'


class AboutView(TemplateView):
    """Page À propos"""
    template_name = 'core/about.html'


class ContactView(TemplateView):
    """Page Contact"""
    template_name = 'core/contact.html'


class PrivacyView(TemplateView):
    """Page Politique de confidentialité"""
    template_name = 'core/privacy.html'


class TermsView(TemplateView):
    """Page Conditions d'utilisation"""
    template_name = 'core/terms.html'


# Pages d'erreur personnalisées
def error_404(request, exception):
    return render(request, 'core/404.html', status=404)


def error_500(request):
    return render(request, 'core/500.html', status=500)


def robots_txt(request):
    from django.http import HttpResponse
    lines = [
        "# Robots.txt officiel Piolo SAS",
        "User-agent: *",
        "Allow: /",
        "Allow: /properties/",
        "Allow: /recherche/",
        "Allow: /about/",
        "Allow: /contact/",
        "Allow: /privacy/",
        "Allow: /terms/",
        "",
        "# Interdire le crawl des zones privées, de l'API et de l'administration",
        "Disallow: /admin/",
        "Disallow: /api/",
        "Disallow: /accounts/",
        "Disallow: /dashboard/",
        "Disallow: /messages/",
        "Disallow: /social/",
        "Disallow: /media/avatars/",
        "Disallow: /media/dossiers/",
        "",
        "# Bloquer les outils d'aspiration de site agressifs",
        "User-agent: HTTrack",
        "Disallow: /",
        "",
        "User-agent: HTTrack 3.0",
        "Disallow: /",
        "",
        "User-agent: WebReaper",
        "Disallow: /",
        "",
        "User-agent: WebCopier",
        "Disallow: /",
        "",
        "User-agent: TeleportPro",
        "Disallow: /",
        "",
        "User-agent: EmailCollector",
        "Disallow: /",
        "",
        "User-agent: Scrapy",
        "Disallow: /",
        "",
        "Crawl-delay: 5",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")

