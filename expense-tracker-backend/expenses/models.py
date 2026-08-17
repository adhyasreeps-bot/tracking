"""
Expense model — the core data entity of this application.

Security guarantee: every Expense row is tied to a specific User via the
`owner` ForeignKey. ViewSets must filter by `owner=request.user` so that
no user can ever access another user's data.
"""

from django.db import models
from django.contrib.auth.models import User


class Expense(models.Model):
    """A single expense entry logged by a user."""

    CATEGORY_CHOICES = [
        ("food", "Food & Dining"),
        ("transport", "Transport"),
        ("shopping", "Shopping"),
        ("entertainment", "Entertainment"),
        ("health", "Health & Medical"),
        ("utilities", "Utilities & Bills"),
        ("education", "Education"),
        ("travel", "Travel"),
        ("other", "Other"),
    ]

    # ── Core Fields ───────────────────────────────────────────────
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Expense amount in the user's local currency.",
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="other",
        help_text="Broad category for grouping expenses.",
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="Short description or note about the expense.",
    )
    date = models.DateField(
        help_text="The date on which this expense occurred.",
    )

    # ── Ownership (Security) ──────────────────────────────────────
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="expenses",
        help_text="The user who owns this expense record.",
    )

    # ── Metadata ──────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self):
        return f"{self.owner.username} | {self.category} | ${self.amount} on {self.date}"
