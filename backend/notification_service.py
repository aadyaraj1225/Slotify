"""
Notification Service for Slotify
Safely creates in-app notifications for candidates, interviewers, and coordinators.
"""

from typing import Optional
from sqlalchemy.orm import Session

import models


def create_in_app_notification(
    db: Session,
    recipient_profile_id: str,
    title: str,
    message: str,
    notification_type: models.NotificationType,
    booking_id: Optional[str] = None,
) -> models.Notification:
    """
    Creates an in-app notification record idempotently.
    Avoids duplicate identical notifications for the same booking and status.
    """
    existing = (
        db.query(models.Notification)
        .filter(
            models.Notification.recipient_profile_id == recipient_profile_id,
            models.Notification.booking_id == booking_id,
            models.Notification.notification_type == notification_type,
        )
        .first()
    )
    if existing:
        return existing

    notif = models.Notification(
        recipient_profile_id=recipient_profile_id,
        booking_id=booking_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=0,
    )
    db.add(notif)
    db.flush()
    return notif
