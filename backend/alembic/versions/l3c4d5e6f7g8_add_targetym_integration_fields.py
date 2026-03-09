"""add_targetym_integration_fields

Revision ID: l3c4d5e6f7g8
Revises: k2b3c4d5e6f7
Create Date: 2026-03-06

Ajoute les champs d'intégration Targetym sur le modèle Company :
- targetym_tenant_id : ID du tenant lié sur Targetym
- targetym_api_key   : Clé API Targetym (stockée chiffrée)
- targetym_linked_at : Date de liaison des deux comptes
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = 'l3c4d5e6f7g8'
down_revision = 'c8f9e3d1b2a4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Utilisation de IF NOT EXISTS pour idempotence (DB déjà existante sans alembic)
    op.execute("""
        ALTER TABLE companies
            ADD COLUMN IF NOT EXISTS targetym_tenant_id INTEGER,
            ADD COLUMN IF NOT EXISTS targetym_api_key VARCHAR,
            ADD COLUMN IF NOT EXISTS targetym_linked_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS company_api_key VARCHAR
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_companies_targetym_tenant_id
            ON companies (targetym_tenant_id)
    """)
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_companies_company_api_key
            ON companies (company_api_key)
    """)


def downgrade() -> None:
    op.drop_index('ix_companies_company_api_key', table_name='companies')
    op.drop_column('companies', 'company_api_key')
    op.drop_index('ix_companies_targetym_tenant_id', table_name='companies')
    op.drop_column('companies', 'targetym_linked_at')
    op.drop_column('companies', 'targetym_api_key')
    op.drop_column('companies', 'targetym_tenant_id')
