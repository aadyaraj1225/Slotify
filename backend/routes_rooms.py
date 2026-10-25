from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
import models
from schemas import (
    RoomCreate,
    RoomUpdate,
    RoomRead,
)
from auth import require_any_authenticated, require_coordinator

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("", response_model=List[RoomRead])
def list_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    min_capacity: Optional[int] = Query(None, ge=1),
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    List rooms with pagination and capacity filtering. Accessible to authenticated users.
    """
    query = db.query(models.Room)
    if min_capacity is not None:
        query = query.filter(models.Room.capacity >= min_capacity)
    return query.order_by(models.Room.name.asc()).offset(skip).limit(limit).all()


@router.post("", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Create a new interview room. Restricted to Coordinators.
    """
    # Check for unique room name
    existing = db.query(models.Room).filter(models.Room.name == payload.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Room with name '{payload.name}' already exists.",
        )

    room = models.Room(
        name=payload.name.strip(),
        location=payload.location,
        capacity=payload.capacity,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.get("/{room_id}", response_model=RoomRead)
def get_room_by_id(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_any_authenticated),
):
    """
    Get room details by ID. Accessible to authenticated users.
    """
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room with ID '{room_id}' not found.",
        )
    return room


@router.patch("/{room_id}", response_model=RoomRead)
def update_room(
    room_id: str,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Update room details. Restricted to Coordinators.
    """
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room with ID '{room_id}' not found.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != room.name:
        existing = db.query(models.Room).filter(models.Room.name == update_data["name"].strip()).first()
        if existing and existing.id != room_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Room name '{update_data['name']}' is already in use.",
            )
        room.name = update_data["name"].strip()

    if "location" in update_data:
        room.location = update_data["location"]
    if "capacity" in update_data:
        room.capacity = update_data["capacity"]

    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: models.Profile = Depends(require_coordinator),
):
    """
    Delete room. Restricted to Coordinators.
    """
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room with ID '{room_id}' not found.",
        )

    db.delete(room)
    db.commit()
    return None
