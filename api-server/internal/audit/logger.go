package audit

import (
	"context"
	"fmt"

	"github.com/CzarSimon/httputil/logger"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"go.uber.org/zap"
)

var log = logger.GetDefaultLogger("api-server/audit")

// Auditable activities
const (
	CreateActivity = "CREATE"
	ReadActivity   = "READ"
)

// Logger interface for logging of AuditEvents.
type Logger interface {
	Create(ctx context.Context, userID, resourcePattern string, args ...interface{})
	Read(ctx context.Context, userID, resourcePattern string, args ...interface{})
	Log(ctx context.Context, event model.AuditEvent)
}

// NewLogger creates a new Logger using the default implementation.
func NewLogger(namespace string, repo repository.AuditEventRepository) Logger {
	return &dbLogger{
		namespace: namespace + ":",
		repo:      repo,
	}
}

type dbLogger struct {
	namespace string
	repo      repository.AuditEventRepository
}

func (l *dbLogger) Create(ctx context.Context, userID, resourcePattern string, args ...interface{}) {
	event := l.createEvent(userID, CreateActivity, resourcePattern, args...)
	l.Log(ctx, event)
}

func (l *dbLogger) Read(ctx context.Context, userID, resourcePattern string, args ...interface{}) {
	event := l.createEvent(userID, ReadActivity, resourcePattern, args...)
	l.Log(ctx, event)
}

func (l *dbLogger) Log(ctx context.Context, event model.AuditEvent) {
	log.Info(event.String())
	err := l.repo.Save(ctx, event)
	if err != nil {
		log.Error("storing audit event failed", zap.Error(err))
	}
}

func (l *dbLogger) createEvent(userID, activity, resourcePattern string, args ...interface{}) model.AuditEvent {
	resource := fmt.Sprintf(l.namespace+resourcePattern, args...)
	return model.NewAuditEvent(userID, activity, resource)
}
