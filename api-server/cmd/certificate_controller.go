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

func (e *env) createCertificate(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_create_certificate")
	defer span.Finish()

	var body model.CertificateRequest
	err := c.BindJSON(&body)
	if err != nil {
		err = httputil.BadRequestError(fmt.Errorf("failed to parse request body. %w", err))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	principal, ok := httputil.GetPrincipal(c)
	if !ok {
		err = httputil.InternalServerError(fmt.Errorf("failed to parse prinipal from authenticated request"))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	body.UserID = principal.ID
	cert, err := e.certificateService.Create(ctx, body)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, cert)
}

func (e *env) getCertificate(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_get_certificate")
	defer span.Finish()

	principal, ok := httputil.GetPrincipal(c)
	if !ok {
		err := httputil.InternalServerError(fmt.Errorf("failed to parse prinipal from authenticated request"))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	certID := c.Param("id")
	cert, err := e.certificateService.GetCertificate(ctx, principal, certID)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, cert)
}

func (e *env) getCertificateOptions(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_get_certificate_options")
	defer span.Finish()

	opts, err := e.certificateService.GetOptions(ctx)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, opts)
}
