from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from config import settings

Base = declarative_base()

_engine = None
_SessionFactory = None


def get_database_url() -> str:
    if not settings.DATABASE_URL:
        raise ValueError(
            "DATABASE_URL is not set. Please set DATABASE_URL in backend/.env "
            "pointing to your Supabase PostgreSQL database."
        )
    url = settings.DATABASE_URL
    # Normalize postgres:// to postgresql:// if needed for SQLAlchemy compatibility
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def get_engine(db_url: str = None):
    global _engine
    target_url = db_url or get_database_url()
    if _engine is None or db_url is not None:
        # Configuration parameters suitable for PostgreSQL / Supabase connection poolers
        connect_args = {}
        # Enable pool_pre_ping to automatically recover from stale pool connections
        engine_instance = create_engine(
            target_url,
            pool_pre_ping=True,
            connect_args=connect_args,
        )
        if db_url is None:
            _engine = engine_instance
        return engine_instance
    return _engine


def get_session_factory(engine=None):
    global _SessionFactory
    eng = engine or get_engine()
    if _SessionFactory is None or engine is not None:
        factory = sessionmaker(autocommit=False, autoflush=False, bind=eng)
        if engine is None:
            _SessionFactory = factory
        return factory
    return _SessionFactory


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session and safely closes it.
    """
    session_factory = get_session_factory()
    db: Session = session_factory()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context(engine=None) -> Generator[Session, None, None]:
    """
    Context manager for database sessions outside request contexts.
    """
    session_factory = get_session_factory(engine=engine)
    db: Session = session_factory()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
