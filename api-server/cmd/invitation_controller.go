package main

import (
	"fmt"
	"net/http"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/opentracing/opentracing-go"
	tracelog "github.com/opentracing/opentracing-go/log"
)

func (e *env) createInvitation(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "invitation_controller_create_invitation")
	defer span.Finish()

	req, err := parseInvitaionCreationRequest(c)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	principal, err := httputil.MustGetPrincipal(c)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	invitation, err := e.invitationService.Create(ctx, principal, req)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, invitation)
}

func parseInvitaionCreationRequest(c *gin.Context) (model.InvitationCreationRequest, error) {
	var body model.InvitationCreationRequest
	err := c.BindJSON(&body)
	if err != nil {
		err = httputil.BadRequestError(fmt.Errorf("failed to parse request body. %w", err))
		return model.InvitationCreationRequest{}, err
	}

	err = body.Validate()
	if err != nil {
		return model.InvitationCreationRequest{}, httputil.BadRequestError(err)
	}

	return body, nil
}
