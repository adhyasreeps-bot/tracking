"""
URL routing for the expenses app.

All routes are prefixed with /api/ in the root urls.py.

Route map:
  POST   /api/register/                → RegisterView (public)
  GET    /api/expenses/                → ExpenseViewSet.list
  POST   /api/expenses/                → ExpenseViewSet.create
  GET    /api/expenses/<id>/           → ExpenseViewSet.retrieve
  PUT    /api/expenses/<id>/           → ExpenseViewSet.update
  PATCH  /api/expenses/<id>/           → ExpenseViewSet.partial_update
  DELETE /api/expenses/<id>/           → ExpenseViewSet.destroy
  GET    /api/expenses/monthly-total/  → MonthlyTotalView
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, RegisterView, MonthlyTotalView

router = DefaultRouter()
router.register(r"expenses", ExpenseViewSet, basename="expense")

urlpatterns = [
    # ── Public: User Registration ─────────────────────────────────
    path("register/", RegisterView.as_view(), name="register"),

    # ── Protected: Monthly Total (must be before router to avoid conflict) ─
    path("expenses/monthly-total/", MonthlyTotalView.as_view(), name="monthly-total"),

    # ── Protected: Expense CRUD (via DRF Router) ──────────────────
    path("", include(router.urls)),
]
