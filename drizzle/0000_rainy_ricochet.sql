CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`edition_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`people` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'awaiting_payment' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `editions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_request_id_unique` ON `bookings` (`request_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `booking_email_edition` ON `bookings` (`email`,`edition_id`);--> statement-breakpoint
CREATE INDEX `booking_edition_status` ON `bookings` (`edition_id`,`status`);--> statement-breakpoint
CREATE TABLE `editions` (
	`id` text PRIMARY KEY NOT NULL,
	`round_id` text NOT NULL,
	`title` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`location` text NOT NULL,
	`address` text NOT NULL,
	`price_cents` integer NOT NULL,
	`capacity` integer NOT NULL,
	`open` integer DEFAULT false NOT NULL,
	`closes_at` text NOT NULL,
	`payment_url` text,
	FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`theme` text NOT NULL
);
