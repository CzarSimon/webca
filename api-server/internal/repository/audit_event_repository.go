package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// AuditEventRepository data access layer for audit log events.
type AuditEventRepository interface {
	Save(ctx context.Context, event model.AuditEvent) error
	FindByResource(ctx context.Context, resource string) ([]model.AuditEvent, error)
}

// NewAuditEventRepository creates an AuditEventRepository using the default implementation.
func NewAuditEventRepository(db *sql.DB) AuditEventRepository {
	return &auditRepo{
		db: db,
	}
}

type auditRepo struct {
	db *sql.DB
}

const findAuditEventsByResourceQuery = `
	SELECT 
		id, 
		user_id,
		activity,
		resource,
		created_at
	FROM 
		audit_log
	WHERE 
		resource = ?`

func (r *auditRepo) FindByResource(ctx context.Context, resource string) ([]model.AuditEvent, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "audit_repo_find_by_resource")
	defer span.Finish()

	events := make([]model.AuditEvent, 0)
	rows, err := r.db.QueryContext(ctx, findAuditEventsByResourceQuery, resource)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit_log by resource=%s: %w", resource, err)
	}
	defer rows.Close()

	var e model.AuditEvent
	for rows.Next() {
		err = rows.Scan(&e.ID, &e.UserID, &e.Activity, &e.Resource, &e.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row for audit_log by resource=%s: %w", resource, err)
		}
		events = append(events, e)
	}

	return events, nil
}

const saveAuditEventQuery = `
	INSERT INTO audit_log(id, user_id, activity, resource, created_at) VALUES (?, ?, ?, ?, ?)`

func (r *auditRepo) Save(ctx context.Context, event model.AuditEvent) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "audit_repo_save")
	defer span.Finish()

	_, err := r.db.ExecContext(ctx, saveAuditEventQuery, event.ID, event.UserID, event.Activity, event.Resource, event.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to save %s: %w", event, err)
	}

	return nil
}
