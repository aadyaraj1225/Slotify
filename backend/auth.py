import time
from typing import Optional, Dict, Any, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from config import settings
from database import get_db
import models

security = HTTPBearer(auto_error=False)


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a Supabase JWT access token.
    Raises HTTPException 401 on missing, expired, invalid, or malformed tokens.
    """
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    jwt_secret = settings.SUPABASE_JWT_SECRET
    if not jwt_secret:
        # If no secret configured in testing or environment, inspect unverified claims
        # or reject if not test token.
        try:
            claims = jwt.get_unverified_claims(token)
            exp = claims.get("exp")
            if exp and exp < time.time():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return claims
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or malformed authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    try:
        # Supabase access tokens are signed with HMAC-SHA256 by default (HS256)
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_profile(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> models.Profile:
    """
    Validates token and returns user profile from database.
    Ensures role is strictly read and verified from backend database.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    claims = decode_access_token(token)

    # Supabase JWTs contain the auth.users UUID in the "sub" claim
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Lookup profile in database
    profile = db.query(models.Profile).filter(models.Profile.id == user_id).first()
    if not profile:
        # Check by email as fallback if id differed during initial signup
        email = claims.get("email")
        if email:
            profile = db.query(models.Profile).filter(models.Profile.email == email.lower()).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not found in database",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return profile


class RoleChecker:
    """
    Dependency for enforcing role-based access control on routes.
    Returns 401 if unauthenticated, 403 if authenticated user lacks required role.
    """
    def __init__(self, allowed_roles: List[models.UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: models.Profile = Depends(get_current_user_profile)) -> models.Profile:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{current_user.role.value}' does not have sufficient permissions.",
            )
        return current_user


# Role-specific dependencies
require_candidate = RoleChecker([models.UserRole.CANDIDATE])
require_interviewer = RoleChecker([models.UserRole.INTERVIEWER])
require_coordinator = RoleChecker([models.UserRole.COORDINATOR])
require_any_authenticated = get_current_user_profile
