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
    op.add_column(
        'companies',
        sa.Column('targetym_tenant_id', sa.Integer(), nullable=True)
    )
    op.add_column(
        'companies',
        sa.Column('targetym_api_key', sa.String(), nullable=True)
    )
    op.add_column(
        'companies',
        sa.Column('targetym_linked_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index(
        'ix_companies_targetym_tenant_id',
        'companies',
        ['targetym_tenant_id'],
        unique=False
    )
    op.add_column(
        'companies',
        sa.Column('company_api_key', sa.String(), nullable=True)
    )
    op.create_index(
        'ix_companies_company_api_key',
        'companies',
        ['company_api_key'],
        unique=True
    )


def downgrade() -> None:
    op.drop_index('ix_companies_company_api_key', table_name='companies')
    op.drop_column('companies', 'company_api_key')
    op.drop_index('ix_companies_targetym_tenant_id', table_name='companies')
    op.drop_column('companies', 'targetym_linked_at')
    op.drop_column('companies', 'targetym_api_key')
    op.drop_column('companies', 'targetym_tenant_id')
