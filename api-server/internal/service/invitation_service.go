package service

import (
	"context"
	"fmt"
	"time"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/opentracing/opentracing-go"
)

// InvitationService service responsible for invitation business logic.
type InvitationService struct {
	AuditLog       audit.Logger
	InvitationRepo repository.InvitationRepository
	UserRepo       repository.UserRepository
}

// Create creates an invitation.
func (i *InvitationService) Create(ctx context.Context, principal jwt.User, req model.InvitationCreationRequest) (model.Invitation, error) {
	span, _ := opentracing.StartSpanFromContext(ctx, "invitation_service_create")
	defer span.Finish()

	invite, err := i.createNewInviation(ctx, req, principal.ID)
	if err != nil {
		return model.Invitation{}, err
	}

	err = i.InvitationRepo.Save(ctx, invite)
	if err != nil {
		return model.Invitation{}, err
	}

	i.logNewInvitation(ctx, invite, principal.ID)
	return invite, nil
}

func (i *InvitationService) createNewInviation(ctx context.Context, req model.InvitationCreationRequest, userID string) (model.Invitation, error) {
	user, err := i.findUser(ctx, userID)
	if err != nil {
		return model.Invitation{}, err
	}

	now := timeutil.Now()
	return model.Invitation{
		ID:          id.New(),
		Email:       req.Email,
		Role:        req.Role,
		Status:      model.InvitationCreated,
		CreatedByID: user.ID,
		Account:     user.Account,
		CreatedAt:   now,
		ValidTo:     now.Add(24 * time.Hour),
	}, nil
}

func (i *InvitationService) findUser(ctx context.Context, userID string) (model.User, error) {
	user, exists, err := i.UserRepo.Find(ctx, userID)
	if err != nil {
		return model.User{}, httputil.InternalServerError(err)
	}

	if !exists {
		err := fmt.Errorf("unable to find User(id=%s) even though an authenticated user id was provided", userID)
		return model.User{}, httputil.UnauthorizedError(err)
	}

	return user, nil
}

func (i *InvitationService) logNewInvitation(ctx context.Context, invite model.Invitation, userID string) {
	i.AuditLog.Create(ctx, userID, "invitation:%s", invite.ID)
}
