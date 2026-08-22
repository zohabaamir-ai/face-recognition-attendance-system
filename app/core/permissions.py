from enum import Enum


class Permission(str, Enum):
    VIEW_DASHBOARD = "view_dashboard"

    VIEW_PERSONS = "view_persons"
    MANAGE_PERSONS = "manage_persons"
    DELETE_PERSONS = "delete_persons"

    VIEW_REPORTS = "view_reports"
    EXPORT_REPORTS = "export_reports"

    VIEW_TERMINALS = "view_terminals"
    MANAGE_TERMINALS = "manage_terminals"

    CREATE_USERS = "create_users"
    MANAGE_USERS = "manage_users"

    MANAGE_SETTINGS = "manage_settings"


ROLE_PERMISSIONS = {
    "operator": {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_PERSONS,
        Permission.MANAGE_PERSONS,
        Permission.VIEW_REPORTS,
        Permission.VIEW_TERMINALS,
    },

    "admin": {
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_PERSONS,
        Permission.MANAGE_PERSONS,
        Permission.DELETE_PERSONS,

        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,

        Permission.VIEW_TERMINALS,
        Permission.MANAGE_TERMINALS,
    },

    "super_admin": {
        Permission.VIEW_DASHBOARD,

        Permission.VIEW_PERSONS,
        Permission.MANAGE_PERSONS,
        Permission.DELETE_PERSONS,

        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,

        Permission.VIEW_TERMINALS,
        Permission.MANAGE_TERMINALS,

        Permission.CREATE_USERS,
        Permission.MANAGE_USERS,
        Permission.MANAGE_SETTINGS,
    },
}


def has_permission(
    role: str,
    permission: Permission,
) -> bool:
    return permission in ROLE_PERMISSIONS.get(
        role,
        set(),
    )