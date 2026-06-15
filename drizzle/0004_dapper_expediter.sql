CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text,
	"count" integer,
	"last_request" bigint
);
--> statement-breakpoint
ALTER TABLE "gallery_image" ADD COLUMN "size" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_image" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo_url" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "provider" text;--> statement-breakpoint
ALTER TABLE "gallery_image" ADD CONSTRAINT "gallery_image_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_image_organizationId_idx" ON "gallery_image" USING btree ("organization_id");