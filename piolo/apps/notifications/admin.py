from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient', 'kind', 'priority', 'is_read', 'created_at')
    list_filter = ('kind', 'priority', 'is_read', 'is_archived')
    search_fields = ('title', 'body', 'recipient__email', 'entity_id')
    readonly_fields = ('id', 'created_at', 'read_at', 'archived_at')
    date_hierarchy = 'created_at'
