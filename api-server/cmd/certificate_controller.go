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

const (
	privKeyPwdHeader = "X-Private-Key-Password"
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

	principal, err := httputil.MustGetPrincipal(c)
	if err != nil {
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

	principal, err := httputil.MustGetPrincipal(c)
	if err != nil {
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

func (e *env) getCertificates(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_get_certificate")
	defer span.Finish()

	accountID, err := httputil.ParseQueryValue(c, "accountId")
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

	certs, err := e.certificateService.GetCertificates(ctx, principal, accountID)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, certs)
}

func (e *env) getCertificateBody(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_get_certificate_body")
	defer span.Finish()

	principal, err := httputil.MustGetPrincipal(c)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	certID := c.Param("id")
	attachment, err := e.certificateService.GetCertificateBody(ctx, principal, certID)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, attachment)
}

func (e *env) getCertificatePrivateKey(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_get_certificate_private_key")
	defer span.Finish()

	principal, err := httputil.MustGetPrincipal(c)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	password := c.GetHeader(privKeyPwdHeader)
	if password == "" {
		err := httputil.BadRequestError(fmt.Errorf("missing required header. %s", privKeyPwdHeader))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	certID := c.Param("id")
	attachment, err := e.certificateService.GetCertificatePrivateKey(ctx, principal, certID, password)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, attachment)
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
