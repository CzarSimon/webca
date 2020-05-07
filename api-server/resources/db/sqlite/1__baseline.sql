-- +migrate Up
CREATE TABLE `account` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE(`name`)
);
CREATE TABLE `role` (
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`name`)
);
CREATE TABLE `user_account` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `account_id` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE(`email`, `account_id`),
  FOREIGN KEY (`role`) REFERENCES `role` (`name`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
);
CREATE TABLE `certificate_type` (
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`name`)
);
CREATE TABLE `key_pair` (
  `id` VARCHAR(50) NOT NULL,
  `public_key` TEXT NOT NULL,
  `private_key` TEXT NOT NULL,
  `format` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `account_id` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE(`public_key`),
  UNIQUE(`private_key`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
);
CREATE TABLE `certificate` (
  `id` VARCHAR(50) NOT NULL,
  `signature` VARCHAR(50) NOT NULL,
  `format` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `key_pair_id` VARCHAR(50) NOT NULL,
  `signatory_id` VARCHAR(50) NOT NULL,
  `account_id` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE(`signature`),
  FOREIGN KEY (`key_pair_id`) REFERENCES `key_pair` (`id`),
  FOREIGN KEY (`type`) REFERENCES `certificate_type` (`name`),
  FOREIGN KEY (`signatory_id`) REFERENCES `certificate` (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
);
CREATE TABLE `audit_log` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `activity` VARCHAR(50) NOT NULL,
  `resource` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `certificate_type`(`name`, `created_at`)
VALUES
  ('ROOT_CA', CURRENT_TIMESTAMP),
  ('INTERMEDIATE_CA', CURRENT_TIMESTAMP),
  ('CERTIFICATE', CURRENT_TIMESTAMP);
INSERT INTO `role`(`name`, `created_at`)
VALUES
  ('ADMIN', CURRENT_TIMESTAMP),
  ('USER', CURRENT_TIMESTAMP);
-- +migrate Down
  DROP TABLE IF EXISTS `certificate`;
DROP TABLE IF EXISTS `certificate_type`;
DROP TABLE IF EXISTS `private_key`;
DROP TABLE IF EXISTS `user_account`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `account`;
DROP TABLE IF EXISTS `audit_log`;