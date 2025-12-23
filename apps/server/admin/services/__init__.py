"""Admin services module - re-exports services from various locations"""

# Re-export manager service from auth.services
from admin.auth.services import manager

__all__ = ["manager"]

