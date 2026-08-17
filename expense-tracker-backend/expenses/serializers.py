"""
Serializers for the expenses app.

Converts model instances ↔ JSON and handles validation.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Expense


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new user accounts (registration).

    The `password` field is write-only so it is never included in responses.
    We override `create()` to use Django's `create_user()` helper, which
    properly hashes the password instead of storing it as plain text.
    """

    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        """Create and return a new User with a hashed password."""
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for the Expense model.

    `owner` is read-only and is automatically set from `request.user`
    inside the ViewSet's `perform_create()` method — users cannot
    forge ownership of another user's records.
    """

    # Show the owner's username in GET responses; hidden on write
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "amount",
            "category",
            "description",
            "date",
            "owner",
            "owner_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "owner_username", "created_at", "updated_at"]
