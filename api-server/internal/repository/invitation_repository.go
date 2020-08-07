package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// InvitationRepository data access layer for invitations.
type InvitationRepository interface {
	Save(ctx context.Context, invite model.Invitation) error
}

// NewInvitationRepository creates an InvitationRepository using the default implementation.
func NewInvitationRepository(db *sql.DB) InvitationRepository {
	return &invitationRepo{
		db: db,
	}
}

type invitationRepo struct {
	db *sql.DB
}

const saveInvitationQuery = `
	INSERT INTO invitation(id, email, role, status, created_by_id, account_id, created_at, valid_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

func (r *invitationRepo) Save(ctx context.Context, invite model.Invitation) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "invitation_repo_save")
	defer span.Finish()

	_, err := r.db.ExecContext(ctx, saveInvitationQuery,
		invite.ID, invite.Email, invite.Role, invite.Status,
		invite.CreatedByID, invite.Account.ID,
		invite.CreatedAt, invite.ValidTo,
	)
	if err != nil {
		return fmt.Errorf("failed to save %s: %w", invite, err)
	}

	return nil
}
