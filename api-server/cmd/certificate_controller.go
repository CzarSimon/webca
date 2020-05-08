package main

import (
	"fmt"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/opentracing/opentracing-go"
	tracelog "github.com/opentracing/opentracing-go/log"
)

func (e *env) createCertificate(c *gin.Context) {
	span, _ := opentracing.StartSpanFromContext(c.Request.Context(), "certificate_controller_create_certificate")
	defer span.Finish()

	var body model.CertificateRequest
	err := c.BindJSON(&body)
	if err != nil {
		err = httputil.BadRequestError(fmt.Errorf("failed to parse request body. %w", err))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	httputil.SendOK(c)
}
