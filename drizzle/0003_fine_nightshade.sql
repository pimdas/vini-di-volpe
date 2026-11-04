CREATE TABLE `contacts` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`invite` integer DEFAULT true NOT NULL,
	`source` text DEFAULT 'Import' NOT NULL,
	`updated_at` text NOT NULL
);
