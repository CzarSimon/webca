package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// UserRepository data access layer for user accounts.
type UserRepository interface {
	Save(ctx context.Context, user model.User) error
	FindByAccountNameAndEmail(ctx context.Context, accountName, email string) (model.User, bool, error)
}

// NewUserRepository creates an UserRepository using the default implementation.
func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepo{
		db: db,
	}
}

type userRepo struct {
	db *sql.DB
}

const findUserByAccountNameAndEmailQuery = `
	SELECT 
		u.id, 
		u.email, 
		u.password, 
		u.salt,
		u.created_at,
		u.updated_at,
		a.id,
		a.name,
		a.created_at,
		a.updated_at
	FROM 
		user_account u 
		INNER JOIN account a ON a.id = u.account_id
	WHERE 
		u.email = ?
		AND a.name = ?`

func (r *userRepo) FindByAccountNameAndEmail(ctx context.Context, accountName, email string) (model.User, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "user_repo_find_by_email")
	defer span.Finish()

	var u model.User
	err := r.db.QueryRowContext(ctx, findUserByAccountNameAndEmailQuery, email, accountName).Scan(
		&u.ID,
		&u.Email,
		&u.Credentials.Password,
		&u.Credentials.Salt,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.Account.ID,
		&u.Account.Name,
		&u.Account.CreatedAt,
		&u.Account.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return model.User{}, false, nil
	}
	if err != nil {
		return model.User{}, false, fmt.Errorf("failed to query user by email and accountName=%s: %w", accountName, err)
	}

	return u, true, nil
}

const saveUserQuery = `
	INSERT INTO user_account(id, email, role, account_id, created_at, updated_at, password, salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

func (r *userRepo) Save(ctx context.Context, user model.User) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "user_repo_save")
	defer span.Finish()

	_, err := r.db.ExecContext(ctx, saveUserQuery,
		user.ID, user.Email, user.Role, user.Account.ID, user.CreatedAt, user.UpdatedAt,
		user.Credentials.Password, user.Credentials.Salt,
	)
	if err != nil {
		return fmt.Errorf("failed to save %s: %w", user, err)
	}

	return nil
}
