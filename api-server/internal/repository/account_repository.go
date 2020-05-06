package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// AccountRepository data access layer for accounts.
type AccountRepository interface {
	Save(ctx context.Context, account model.Account) error
	FindByName(ctx context.Context, name string) (model.Account, bool, error)
}

// NewAccountRepository creates an AccountRepository using the default implementation.
func NewAccountRepository(db *sql.DB) AccountRepository {
	return &accountRepo{
		db: db,
	}
}

type accountRepo struct {
	db *sql.DB
}

const findAccountByNameQuery = `
	SELECT id, name, created_at, updated_at FROM account WHERE name = ?`

func (r *accountRepo) FindByName(ctx context.Context, name string) (model.Account, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "account_repo_find_by_name")
	defer span.Finish()

	var a model.Account
	err := r.db.QueryRowContext(ctx, findAccountByNameQuery, name).Scan(&a.ID, &a.Name, &a.CreatedAt, &a.UpdatedAt)
	if err == sql.ErrNoRows {
		return model.Account{}, false, nil
	}
	if err != nil {
		return model.Account{}, false, fmt.Errorf("failed to query account by name=%s: %w", name, err)
	}

	return a, true, nil
}

const saveAccountQuery = `
	INSERT INTO account(id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`

func (r *accountRepo) Save(ctx context.Context, account model.Account) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "account_repo_save")
	defer span.Finish()

	_, err := r.db.ExecContext(ctx, saveAccountQuery, account.ID, account.Name, account.CreatedAt, account.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to save %s: %w", account, err)
	}

	return nil
}
