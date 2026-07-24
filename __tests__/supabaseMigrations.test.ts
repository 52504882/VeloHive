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
});
