"""
Tests for notification endpoints (/api/notifications/*).

Covers: list, unread-count, mark as read, mark all as read, delete.
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import User, Notification, NotificationType


pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _create_notification(
    db: AsyncSession,
    user_id: int,
    *,
    title: str = "Test notification",
    message: str = "This is a test notification",
    notification_type: NotificationType = NotificationType.SYSTEM,
    is_read: bool = False,
) -> Notification:
    """Insert a notification directly into the DB and return it."""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        is_read=is_read,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


# ===========================================================================
# GET /api/notifications — list notifications
# ===========================================================================


class TestListNotifications:
    """GET /api/notifications"""

    async def test_list_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/notifications")
        assert response.status_code == 401

    async def test_list_empty(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Authenticated user with no notifications gets empty list."""
        response = await client.get(
            "/api/notifications", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        data = response.json()
        assert data["notifications"] == []
        assert data["total"] == 0
        assert data["unread_count"] == 0

    async def test_list_with_notifications(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Returns notifications belonging to the authenticated user."""
        await _create_notification(
            test_db, candidate_user.id, title="Notif 1", message="First"
        )
        await _create_notification(
            test_db, candidate_user.id, title="Notif 2", message="Second"
        )

        response = await client.get(
            "/api/notifications", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["notifications"]) == 2

    async def test_list_pagination(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Pagination via limit and offset works."""
        for i in range(5):
            await _create_notification(
                test_db, candidate_user.id, title=f"Notif {i}", message=f"Msg {i}"
            )

        response = await client.get(
            "/api/notifications",
            headers=auth_headers_candidate,
            params={"limit": 2, "offset": 0},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert len(data["notifications"]) == 2

    async def test_list_unread_only(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Filter unread_only=true returns only unread notifications."""
        await _create_notification(
            test_db, candidate_user.id, title="Unread", message="Unread", is_read=False
        )
        await _create_notification(
            test_db, candidate_user.id, title="Read", message="Read", is_read=True
        )

        response = await client.get(
            "/api/notifications",
            headers=auth_headers_candidate,
            params={"unread_only": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["notifications"]) == 1
        assert data["notifications"][0]["title"] == "Unread"

    async def test_list_does_not_leak_other_users(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        employer_user: User,
        test_db: AsyncSession,
    ):
        """User A cannot see User B's notifications."""
        await _create_notification(
            test_db, employer_user.id, title="Employer notif", message="Private"
        )

        response = await client.get(
            "/api/notifications", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["notifications"] == []


# ===========================================================================
# GET /api/notifications/unread-count
# ===========================================================================


class TestUnreadCount:
    """GET /api/notifications/unread-count"""

    async def test_unread_count_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.get("/api/notifications/unread-count")
        assert response.status_code == 401

    async def test_unread_count_zero(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """No notifications returns unread_count 0."""
        response = await client.get(
            "/api/notifications/unread-count", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        assert response.json()["unread_count"] == 0

    async def test_unread_count_correct(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Returns the correct count of unread notifications."""
        await _create_notification(
            test_db, candidate_user.id, title="U1", message="Unread 1", is_read=False
        )
        await _create_notification(
            test_db, candidate_user.id, title="U2", message="Unread 2", is_read=False
        )
        await _create_notification(
            test_db, candidate_user.id, title="R1", message="Read 1", is_read=True
        )

        response = await client.get(
            "/api/notifications/unread-count", headers=auth_headers_candidate
        )

        assert response.status_code == 200
        assert response.json()["unread_count"] == 2


# ===========================================================================
# PUT /api/notifications/{id}/read — mark single as read
# ===========================================================================


class TestMarkAsRead:
    """PUT /api/notifications/{notification_id}/read"""

    async def test_mark_as_read_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.put("/api/notifications/1/read")
        assert response.status_code == 401

    async def test_mark_as_read_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Marking an unread notification as read succeeds."""
        notif = await _create_notification(
            test_db, candidate_user.id, title="To read", message="Mark me"
        )

        response = await client.put(
            f"/api/notifications/{notif.id}/read",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        assert "marquée comme lue" in response.json()["message"].lower()

        # Verify unread count went down
        count_resp = await client.get(
            "/api/notifications/unread-count", headers=auth_headers_candidate
        )
        assert count_resp.json()["unread_count"] == 0

    async def test_mark_as_read_not_found(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Marking a non-existent notification returns 404."""
        response = await client.put(
            "/api/notifications/99999/read",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404

    async def test_mark_as_read_other_user(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        employer_user: User,
        test_db: AsyncSession,
    ):
        """Cannot mark another user's notification as read (404)."""
        notif = await _create_notification(
            test_db, employer_user.id, title="Not mine", message="Other user"
        )

        response = await client.put(
            f"/api/notifications/{notif.id}/read",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404


# ===========================================================================
# PUT /api/notifications/mark-all-read
# ===========================================================================


class TestMarkAllAsRead:
    """PUT /api/notifications/mark-all-read"""

    async def test_mark_all_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.put("/api/notifications/mark-all-read")
        assert response.status_code == 401

    async def test_mark_all_as_read_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """All unread notifications are marked as read."""
        await _create_notification(
            test_db, candidate_user.id, title="N1", message="First", is_read=False
        )
        await _create_notification(
            test_db, candidate_user.id, title="N2", message="Second", is_read=False
        )

        response = await client.put(
            "/api/notifications/mark-all-read",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200

        # Verify unread count is now 0
        count_resp = await client.get(
            "/api/notifications/unread-count", headers=auth_headers_candidate
        )
        assert count_resp.json()["unread_count"] == 0

    async def test_mark_all_as_read_empty(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Mark-all-read succeeds even when there are no notifications."""
        response = await client.put(
            "/api/notifications/mark-all-read",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200


# ===========================================================================
# DELETE /api/notifications/{id}
# ===========================================================================


class TestDeleteNotification:
    """DELETE /api/notifications/{notification_id}"""

    async def test_delete_unauthenticated(self, client: AsyncClient):
        """Unauthenticated request returns 401."""
        response = await client.delete("/api/notifications/1")
        assert response.status_code == 401

    async def test_delete_success(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        test_db: AsyncSession,
    ):
        """Deleting an own notification succeeds."""
        notif = await _create_notification(
            test_db, candidate_user.id, title="To delete", message="Remove me"
        )

        response = await client.delete(
            f"/api/notifications/{notif.id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 200
        assert "supprimée" in response.json()["message"].lower()

        # Verify it is gone
        list_resp = await client.get(
            "/api/notifications", headers=auth_headers_candidate
        )
        assert list_resp.json()["total"] == 0

    async def test_delete_not_found(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
    ):
        """Deleting a non-existent notification returns 404."""
        response = await client.delete(
            "/api/notifications/99999",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404

    async def test_delete_other_user(
        self,
        client: AsyncClient,
        auth_headers_candidate: dict,
        candidate_user: User,
        employer_user: User,
        test_db: AsyncSession,
    ):
        """Cannot delete another user's notification (404)."""
        notif = await _create_notification(
            test_db, employer_user.id, title="Not mine", message="Other user"
        )

        response = await client.delete(
            f"/api/notifications/{notif.id}",
            headers=auth_headers_candidate,
        )

        assert response.status_code == 404
