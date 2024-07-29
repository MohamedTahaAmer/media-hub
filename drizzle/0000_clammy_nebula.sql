CREATE TABLE `thumbnails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text,
	`stats` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thumbnails_key_unique` ON `thumbnails` (`key`);