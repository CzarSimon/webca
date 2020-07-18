FROM golang:1.14.6-alpine3.12 AS build

# Copy source
WORKDIR /app/api-server
COPY . .

# Download dependencies application
RUN go mod download

# Build application.
WORKDIR /app/api-server/cmd
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build

FROM alpine:3.12 AS run

WORKDIR /etc/api-server/migrations
COPY ./resources/db/mysql/ .

WORKDIR /opt/app
RUN ls /etc/api-server/migrations
COPY --from=build /app/api-server/cmd/cmd api-server
ENV GIN_MODE release
CMD ["./api-server"]