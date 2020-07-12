-- +migrate Up
ALTER TABLE `certificate`
ADD COLUMN `expires_at` DATETIME;
-- +migrate Down
ALTER TABLE `certificate` DROP COLUMN `expires_at`;