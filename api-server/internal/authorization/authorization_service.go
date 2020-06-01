package authorization

import (
	"context"
	"fmt"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/opentracing/opentracing-go"
)

var (
	userAccessRoles = []string{model.AdminRole, model.UserRole}
)

// Service responsible for authorizing users to access resources in the system.
type Service struct {
	userRepo repository.UserRepository
}

// NewService creates a new authorizatoin service.
func NewService(userRepo repository.UserRepository) *Service {
	return &Service{
		userRepo: userRepo,
	}
}

// AssertAccountAccess assert a principals access to an account.
func (s *Service) AssertAccountAccess(ctx context.Context, principal jwt.User, accountID string) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "authorization_service_assert_account_access")
	defer span.Finish()

	user, err := s.findUser(ctx, principal.ID)
	if err != nil {
		return err
	}

	if user.Account.ID != accountID {
		err = fmt.Errorf("%s is not alowed to access certificates for account(id=%s)", user, accountID)
		return httputil.ForbiddenError(err)
	}

	return nil
}

// AssertUserAccess assert a principals access to a user.
func (s *Service) AssertUserAccess(ctx context.Context, principal jwt.User, userID string) error {
	span, ctx := opentracing.StartSpanFromContext(ctx, "authorization_service_assert_user_access")
	defer span.Finish()

	err := assertUserAccessRole(principal)
	if err != nil {
		return err
	}

	if principal.ID == userID {
		return nil
	}

	if !principal.HasRole(model.AdminRole) {
		err := fmt.Errorf("%s is forbidden to access user with id = %s", principal, userID)
		return httputil.ForbiddenError(err)
	}

	user, err := s.findUser(ctx, userID)
	if err != nil {
		return err
	}

	return s.AssertAccountAccess(ctx, principal, user.Account.ID)
}

func (s *Service) findUser(ctx context.Context, userID string) (model.User, error) {
	user, exists, err := s.userRepo.Find(ctx, userID)
	if err != nil {
		return model.User{}, httputil.InternalServerError(err)
	}

	if !exists {
		err := fmt.Errorf("unable to find User(id=%s) even though an authenticated user id was provided", userID)
		return model.User{}, httputil.UnauthorizedError(err)
	}

	return user, nil
}

func assertUserAccessRole(principal jwt.User) error {
	for _, role := range userAccessRoles {
		if principal.HasRole(role) {
			return nil
		}
	}

	err := fmt.Errorf("%s is missing required roles: %v", principal, userAccessRoles)
	return httputil.ForbiddenError(err)
}
