ALTER TABLE `bookings` ADD `paid_at` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `paid_by` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `payment_expires_at` text;--> statement-breakpoint
ALTER TABLE `editions` ADD `version` integer DEFAULT 0 NOT NULL;