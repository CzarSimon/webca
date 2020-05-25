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

func (e *env) signup(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "authentication_controller_signup")
	defer span.Finish()

	var body model.AuthenticationRequest
	err := c.BindJSON(&body)
	if err != nil {
		err = httputil.BadRequestError(fmt.Errorf("failed to parse request body. %w", err))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	res, err := e.accountService.Signup(ctx, body)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func (e *env) login(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "authentication_controller_login")
	defer span.Finish()

	var body model.AuthenticationRequest
	err := c.BindJSON(&body)
	if err != nil {
		err = httputil.BadRequestError(fmt.Errorf("failed to parse request body. %w", err))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	res, err := e.accountService.Login(ctx, body)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, res)
}
