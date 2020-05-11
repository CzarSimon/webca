package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// CertificateRepository data access layer for certificates.
type CertificateRepository interface {
	Save(ctx context.Context, cert model.Certificate) error
	FindByNameAndAccountID(ctx context.Context, name, accountID string) (model.Certificate, bool, error)
}

// NewCertificateRepository creates an CertificateRepository using the default implementation.
func NewCertificateRepository(db *sql.DB) CertificateRepository {
	return &certRepo{
		db: db,
	}
}

type certRepo struct {
	db *sql.DB
}

const saveCertificateQuery = `
	INSERT INTO certificate(id, name, subject, body, format, type, key_pair_id, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

func (r *certRepo) Save(ctx context.Context, cert model.Certificate) error {
	span, _ := opentracing.StartSpanFromContext(ctx, "key_pair_repo_save")
	defer span.Finish()

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transtaction: %w", err)
	}

	_, err = tx.ExecContext(ctx, saveCertificateQuery,
		cert.ID, cert.Name, cert.Subject.CommonName, "-", cert.Format, cert.Type, cert.KeyPair.ID, cert.AccountID, cert.CreatedAt,
	)
	if err != nil {
		dbutil.Rollback(tx)
		return fmt.Errorf("failed to insert %s: %w", cert, err)
	}

	key := cert.KeyPair
	_, err = tx.ExecContext(ctx, saveKeyPairQuery,
		key.ID, key.PublicKey, key.PrivateKey, key.Format, key.Algorithm, key.EncryptionSalt,
		key.Credentials.Password, key.Credentials.Salt, key.AccountID, key.CreatedAt,
	)
	if err != nil {
		dbutil.Rollback(tx)
		return fmt.Errorf("failed to save %s: %w", key, err)
	}

	return tx.Commit()
}

const findCertificateByNameAndAccountIDQuery = `
	SELECT 
		id, 
		name,
		body,
		format,
		type,
		key_pair_id,
		signatory_id,
		account_id,
		created_at
	FROM 
		certificate
	WHERE
		name = ?
		AND account_id = ?`

func (r *certRepo) FindByNameAndAccountID(ctx context.Context, name, accountID string) (model.Certificate, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "key_pair_repo_find_by_account_id")
	defer span.Finish()

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return model.Certificate{}, false, fmt.Errorf("failed to start transtaction: %w", err)
	}

	var c model.Certificate
	var keyPairID string
	sigID := sql.NullString{}
	err = tx.QueryRowContext(ctx, findCertificateByNameAndAccountIDQuery, name, accountID).Scan(
		&c.ID, &c.Name, &c.Body, &c.Format, &c.Type, &keyPairID, &sigID, &c.AccountID, &c.CreatedAt,
	)
	if err == sql.ErrNoRows {
		dbutil.Rollback(tx)
		return model.Certificate{}, false, nil
	}
	if err != nil {
		dbutil.Rollback(tx)
		return model.Certificate{}, false, fmt.Errorf("failed to query certificate(name=%s, account_id=%s): %w", name, accountID, err)
	}

	keyPair, found, err := findKeyPair(ctx, tx, keyPairID)
	if !found || err != nil {
		dbutil.Rollback(tx)
		return model.Certificate{}, found, err
	}

	c.KeyPair = keyPair
	c.SignatoryID = sigID.String
	return c, true, tx.Commit()
}

const findKeyPairsQuery = `
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
		id = ?`

func findKeyPair(ctx context.Context, tx *sql.Tx, id string) (model.KeyPair, bool, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "repository_find_key_pair")
	defer span.Finish()

	var k model.KeyPair
	err := tx.QueryRowContext(ctx, findKeyPairsQuery, id).Scan(
		&k.ID, &k.PublicKey, &k.PrivateKey, &k.Format, &k.Algorithm, &k.EncryptionSalt, &k.Credentials.Password, &k.Credentials.Salt, &k.AccountID, &k.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return model.KeyPair{}, false, nil
	}
	if err != nil {
		return model.KeyPair{}, false, fmt.Errorf("failed to query key_pair(id=%s): %w", id, err)
	}

	return k, true, nil
}
