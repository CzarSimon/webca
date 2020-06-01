package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// KeyPairRepository data access layer for key paris.
type KeyPairRepository interface {
	Save(ctx context.Context, key model.KeyPair) error
	FindByCertificateID(ctx context.Context, certificateID string) (model.KeyPair, bool, error)
	FindByAccountID(ctx context.Context, accountID string) ([]model.KeyPair, error)
}

// NewKeyPairRepository creates an KeyPairRepository using the default implementation.
func NewKeyPairRepository(db *sql.DB) KeyPairRepository {
	return &keyPairRepo{
		db: db,
	}
}

type keyPairRepo struct {
	db *sql.DB
}

const findKeyPairByCertificateIDQuery = `
	SELECT 
		k.id, 
		k.public_key,
		k.private_key,
		k.format,
		k.type,
		k.encryption_salt,
		k.password,
		k.password_salt,
		k.account_id,
		k.created_at
	FROM 
		key_pair k
		INNER JOIN certificate c ON k.id = c.key_pair_id
	WHERE
		c.id = ?`

func (r *keyPairRepo) FindByCertificateID(ctx context.Context, certificateID string) (model.KeyPair, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "key_pair_repo_find_by_certificate_id")
	defer span.Finish()

	var k model.KeyPair
	err := r.db.QueryRowContext(ctx, findKeyPairByCertificateIDQuery, certificateID).Scan(
		&k.ID,
		&k.PublicKey,
		&k.PrivateKey,
		&k.Format,
		&k.Algorithm,
		&k.EncryptionSalt,
		&k.Credentials.Password,
		&k.Credentials.Salt,
		&k.AccountID,
		&k.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return model.KeyPair{}, false, nil
	}
	if err != nil {
		return model.KeyPair{}, false, fmt.Errorf("failed to query key_pair for certificate(id=%s): %w", certificateID, err)
	}

	return k, true, nil
}

const findKeyPairsByAccountIDQuery = `
	SELECT 
		id, 
		public_key,
		private_key,
		format,
		type,
		encryption_salt,
		password,
		password_salt,
		account_id,
		created_at
	FROM 
		key_pair
	WHERE
		account_id = ?`

func (r *keyPairRepo) FindByAccountID(ctx context.Context, accountID string) ([]model.KeyPair, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "key_pair_repo_find_by_account_id")
	defer span.Finish()

	keys := make([]model.KeyPair, 0)
	rows, err := r.db.QueryContext(ctx, findKeyPairsByAccountIDQuery, accountID)
	if err != nil {
		return nil, fmt.Errorf("failed to query key_pair for account(id=%s): %w", accountID, err)
	}
	defer rows.Close()

	var k model.KeyPair
	for rows.Next() {
		err = rows.Scan(&k.ID, &k.PublicKey, &k.PrivateKey, &k.Format, &k.Algorithm, &k.EncryptionSalt, &k.Credentials.Password, &k.Credentials.Salt, &k.AccountID, &k.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row for key_pairfor account(id=%s): %w", accountID, err)
		}
		keys = append(keys, k)
	}

	return keys, nil
}

const saveKeyPairQuery = `
	INSERT INTO key_pair(id, public_key, private_key, format, type, encryption_salt, password, password_salt, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

func (r *keyPairRepo) Save(ctx context.Context, key model.KeyPair) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "key_pair_repo_save")
	defer span.Finish()

	_, err := r.db.ExecContext(ctx, saveKeyPairQuery,
		key.ID, key.PublicKey, key.PrivateKey, key.Format, key.Algorithm, key.EncryptionSalt,
		key.Credentials.Password, key.Credentials.Salt, key.AccountID, key.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to save %s: %w", key, err)
	}

	return nil
}
