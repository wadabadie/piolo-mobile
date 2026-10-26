from rest_framework.throttling import ScopedRateThrottle


class AuthRateThrottle(ScopedRateThrottle):
    """Rate limit shared by login and registration endpoints."""
    scope = 'auth'


class PasswordResetRateThrottle(ScopedRateThrottle):
    scope = 'password_reset'


class ChatRateThrottle(ScopedRateThrottle):
    scope = 'chat'
