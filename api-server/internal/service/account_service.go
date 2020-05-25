package service

import (
	"context"
	"fmt"
	"time"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/opentracing/opentracing-go"
)

const tokenLifetime = 12 * time.Hour

// AccountService service responsible for account and authentication business logic.
type AccountService struct {
	JwtIssuer       jwt.Issuer
	AuditLog        audit.Logger
	AccountRepo     repository.AccountRepository
	UserRepo        repository.UserRepository
	PasswordService *password.Service
}

// Signup signs up a user if not present.
func (a *AccountService) Signup(ctx context.Context, req model.AuthenticationRequest) (model.AuthenticationResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "account_service_signup")
	defer span.Finish()

	err := a.assertNewUser(ctx, req)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	user, err := a.createUser(ctx, req)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	token, err := a.JwtIssuer.Issue(user.JWTUser(), tokenLifetime)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	return model.AuthenticationResponse{
		Token: token,
		User:  user,
	}, nil
}

// Login logs a user in if they exist and have provided correct credentials.
func (a *AccountService) Login(ctx context.Context, req model.AuthenticationRequest) (model.AuthenticationResponse, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "account_service_login")
	defer span.Finish()

	user, err := a.findUser(ctx, req)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	err = a.PasswordService.Verify(ctx, user.Credentials, req.Password)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	token, err := a.JwtIssuer.Issue(user.JWTUser(), tokenLifetime)
	if err != nil {
		return model.AuthenticationResponse{}, err
	}

	a.AuditLog.Read(ctx, user.ID, "user:%s", user.ID)
	return model.AuthenticationResponse{
		Token: token,
		User:  user,
	}, nil
}

func (a *AccountService) createUser(ctx context.Context, req model.AuthenticationRequest) (model.User, error) {
	credentials, err := a.PasswordService.Hash(ctx, req.Password)
	if err != nil {
		return model.User{}, err
	}

	account, existed, err := a.getOrCreateAccount(ctx, req.AccountName)
	if err != nil {
		return model.User{}, err
	}

	role := model.UserRole
	if !existed {
		role = model.AdminRole
	}

	user := model.NewUser(req.Email, role, credentials, account)
	err = a.UserRepo.Save(ctx, user)
	if err != nil {
		return model.User{}, httputil.InternalServerError(err)
	}

	a.logNewUser(ctx, user, !existed)
	return user, nil
}

func (a *AccountService) getOrCreateAccount(ctx context.Context, name string) (model.Account, bool, error) {
	account, exists, err := a.AccountRepo.FindByName(ctx, name)
	if err != nil {
		return model.Account{}, false, httputil.InternalServerError(err)
	}

	if exists {
		return account, true, nil
	}

	account = model.NewAccount(name)
	err = a.AccountRepo.Save(ctx, account)
	if err != nil {
		return model.Account{}, false, httputil.InternalServerError(err)
	}

	return account, false, nil
}

func (a *AccountService) assertNewUser(ctx context.Context, req model.AuthenticationRequest) error {
	user, found, err := a.UserRepo.FindByAccountNameAndEmail(ctx, req.AccountName, req.Email)
	if err != nil {
		return err
	}

	if found {
		err = fmt.Errorf("%s already exists", user)
		return httputil.ConflictError(err)
	}

	return nil
}

func (a *AccountService) findUser(ctx context.Context, req model.AuthenticationRequest) (model.User, error) {
	user, found, err := a.UserRepo.FindByAccountNameAndEmail(ctx, req.AccountName, req.Email)
	if err != nil {
		return model.User{}, err
	}

	if !found {
		err = fmt.Errorf("no such user found for account(name=%s)", req.AccountName)
		return model.User{}, httputil.UnauthorizedError(err)
	}

	return user, nil
}

func (a *AccountService) logNewUser(ctx context.Context, user model.User, newAccount bool) {
	if newAccount {
		a.AuditLog.Create(ctx, user.ID, "account:%s", user.Account.ID)
	} else {
		a.AuditLog.Read(ctx, user.ID, "account:%s", user.Account.ID)
	}

	a.AuditLog.Create(ctx, user.ID, "user:%s", user.ID)
}
