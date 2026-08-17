"""
Views for the expenses app.

Three main views:
  1. RegisterView       — Public endpoint to create a new user account.
  2. ExpenseViewSet     — Full CRUD for Expense; scoped to the logged-in user.
  3. MonthlyTotalView   — Returns the sum of expenses for the current calendar month.

Security model:
  - DRF's global permission class (IsAuthenticated) is enforced on all views
    except RegisterView, which explicitly allows any user (AllowAny).
  - ExpenseViewSet.get_queryset() filters strictly by owner=request.user so
    that authenticated users can never read or modify another user's data.
"""

from datetime import date

from django.db.models import Sum
from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense
from .serializers import ExpenseSerializer, UserSerializer


# ─────────────────────────────────────────────────────────────────────────────
# User Registration
# ─────────────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/register/

    Public endpoint — anyone can create an account.
    Returns the newly created user's id and username (password excluded).
    """
    serializer_class = UserSerializer
    # Override the global IsAuthenticated permission for this endpoint only
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────────────────────────────────────────────────────
# Expense CRUD ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    Provides list / create / retrieve / update / destroy for Expense objects.

    Endpoints (registered via router in urls.py):
      GET    /api/expenses/          → list all expenses for the current user
      POST   /api/expenses/          → create a new expense
      GET    /api/expenses/<id>/     → retrieve a single expense
      PUT    /api/expenses/<id>/     → full update
      PATCH  /api/expenses/<id>/     → partial update
      DELETE /api/expenses/<id>/     → delete

    Data scoping:
      get_queryset() returns ONLY rows where owner == request.user.
      This prevents any possibility of horizontal privilege escalation.
    """
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        """
        Return only expenses that belong to the currently authenticated user.

        This is the critical security filter — it must not be removed or
        bypassed. Users should never see each other's expense records.
        """
        return Expense.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically assign the current user as the owner on creation.

        This ensures the owner field cannot be spoofed by the client even if
        they pass an `owner` value in the request body (it is read-only in
        the serializer, but we enforce it here as well).
        """
        serializer.save(owner=self.request.user)


# ─────────────────────────────────────────────────────────────────────────────
# Monthly Total Aggregation
# ─────────────────────────────────────────────────────────────────────────────

class MonthlyTotalView(APIView):
    """
    GET /api/expenses/monthly-total/

    Returns the sum of all expense amounts logged by the current user for
    the current calendar month (based on server UTC date).

    Response format:
      {
        "month": 8,
        "year": 2024,
        "total": "1234.56"
      }
    """

    def get(self, request):
        today = date.today()

        # Filter to the current user's expenses in the current month/year
        aggregate = (
            Expense.objects.filter(
                owner=request.user,
                date__year=today.year,
                date__month=today.month,
            )
            .aggregate(total=Sum("amount"))
        )

        total = aggregate["total"] or 0

        return Response(
            {
                "month": today.month,
                "year": today.year,
                "total": str(total),
            }
        )
