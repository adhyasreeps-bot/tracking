"""
Admin registration for the expenses app.
"""

from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("owner", "amount", "category", "date", "description", "created_at")
    list_filter = ("category", "date", "owner")
    search_fields = ("owner__username", "description")
    date_hierarchy = "date"
    ordering = ("-date",)
