"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # ── JWT Authentication Endpoints ──────────────────────────────
    # POST /api/token/          → Login: returns access + refresh tokens
    # POST /api/token/refresh/  → Exchange refresh token for a new access token
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ── Expense App Routes ────────────────────────────────────────
    path("api/", include("expenses.urls")),
]
