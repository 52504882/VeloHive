import { readFileSync } from "fs";
import path from "path";

describe("supabase migrations", () => {
  it("allows removed listings to clear images while enforcing one to nine images otherwise", () => {
    const storageMigration = readFileSync(
      path.join(__dirname, "../supabase/migrations/202607230002_storage.sql"),
      "utf8"
    );

    expect(storageMigration).toContain("listings_image_urls_count");
    expect(storageMigration).toContain("status = 'removed' and cardinality(image_urls) = 0");
    expect(storageMigration).toContain("status <> 'removed' and cardinality(image_urls) between 1 and 9");
  });

  it("defines an atomic listing review decision RPC", () => {
    const moderationMigration = readFileSync(
      path.join(__dirname, "../supabase/migrations/202607230003_moderation.sql"),
      "utf8"
    );

    expect(moderationMigration).toContain("create or replace function public.submit_listing_review_decision");
    expect(moderationMigration).toContain("update public.listings");
    expect(moderationMigration).toContain("insert into public.audit_logs");
    expect(moderationMigration).toContain("grant execute on function public.submit_listing_review_decision");
    expect(moderationMigration).toContain("status = 'pending_review'");
    expect(moderationMigration).toContain(
      "coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') not in ('admin', 'moderator')"
    );
  });
});
