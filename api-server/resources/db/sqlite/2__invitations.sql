-- +migrate Up
CREATE TABLE `invitation_status` (
    `name` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`name`)
);
CREATE TABLE `invitation` (
    `id` VARCHAR(50) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_by_id` VARCHAR(50) NOT NULL,
    `account_id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `valid_to` DATETIME NOT NULL,
    `accepted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`role`) REFERENCES `role` (`name`),
    FOREIGN KEY (`status`) REFERENCES `invitation_status` (`name`),
    FOREIGN KEY (`created_by_id`) REFERENCES `user_account` (`id`),
    FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
);
INSERT INTO `invitation_status`(`name`, `created_at`)
VALUES ('CREATED', CURRENT_TIMESTAMP),
    ('ACCEPTED', CURRENT_TIMESTAMP);
-- +migrate Down
DROP TABLE IF EXISTS `invitation`;
DROP TABLE IF EXISTS `invitation_status`;