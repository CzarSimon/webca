package main

import (
	"fmt"
	"net/http"

	"github.com/CzarSimon/httputil"
	"github.com/gin-gonic/gin"
	"github.com/opentracing/opentracing-go"
	tracelog "github.com/opentracing/opentracing-go/log"
)

func (e *env) getUser(c *gin.Context) {
	span, ctx := opentracing.StartSpanFromContext(c.Request.Context(), "user_controller_get_user")
	defer span.Finish()

	principal, ok := httputil.GetPrincipal(c)
	if !ok {
		err := httputil.InternalServerError(fmt.Errorf("failed to parse prinipal from authenticated request"))
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	userID := c.Param("id")
	user, err := e.userService.GetUser(ctx, principal, userID)
	if err != nil {
		span.LogFields(tracelog.Error(err))
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, user)
}
