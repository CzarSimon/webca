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
	Find(ctx context.Context, id string) (model.Invitation, bool, error)
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

const findInvitationQuery = `
	SELECT 
		i.id, 
		i.email, 
		i.role,
		i.status, 
		i.created_by_id,
		i.created_at,
		i.valid_to,
		i.accepted_at,
		a.id,
		a.name,
		a.created_at,
		a.updated_at
	FROM 
		invitation i 
		INNER JOIN account a ON a.id = i.account_id
	WHERE 
		i.id = ?`

func (r *invitationRepo) Find(ctx context.Context, id string) (model.Invitation, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "invitation_repo_find")
	defer span.Finish()

	var i model.Invitation
	var acceptedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, findInvitationQuery, id).Scan(
		&i.ID,
		&i.Email,
		&i.Role,
		&i.Status,
		&i.CreatedByID,
		&i.CreatedAt,
		&i.ValidTo,
		&acceptedAt,
		&i.Account.ID,
		&i.Account.Name,
		&i.Account.CreatedAt,
		&i.Account.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return model.Invitation{}, false, nil
	}
	if err != nil {
		return model.Invitation{}, false, fmt.Errorf("failed to query inivtation by id=%s: %w", id, err)
	}

	i.AcceptedAt = acceptedAt.Time
	return i, true, nil
}
