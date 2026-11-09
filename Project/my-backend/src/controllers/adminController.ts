import { type Request, type Response } from "express";
import { pool } from "../config/database.js";

// same presigned upload idea as the profile pictures (userController.ts)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

// allowed image types and the file extension to save them with
const allowedImageTypes: Record<string, string> = {
   "image/jpeg": "jpg",
   "image/png": "png",
   "image/webp": "webp",
   // (no svg on purpose, an svg served from my own domain can run scripts if someone opens it directly)
};
// the only 2 folders the admin can upload into (inside images/, which the frontend deploy never deletes)
const allowedFolders = ["logos", "banners"];

// * small helpers so every route checks the input the same way
const cleanText = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const isHttpsUrl = (value: string) => /^https:\/\/\S+$/.test(value);
const toIdList = (value: unknown): number[] =>
   Array.isArray(value) ? value.map((id) => parseInt(String(id), 10)).filter(Number.isFinite) : [];

//. Everything the admin page needs in one request (restaurants with both languages, tags, sponsors)
export const getAdminOverview = async (req: Request, res: Response) => {
   try {
      const restaurantsQuery = `
      SELECT
         r.id,
         r.restaurant_logo,
         en.name AS name_en,
         en.description AS description_en,
         ar.name AS name_ar,
         ar.description AS description_ar,
         COALESCE(ARRAY_AGG(rt.tag_id) FILTER (WHERE rt.tag_id IS NOT NULL), '{}') AS tag_ids
      FROM restaurants AS r
         LEFT JOIN restaurant_translations AS en ON en.restaurant_id = r.id AND en.language_code = 'en'
         LEFT JOIN restaurant_translations AS ar ON ar.restaurant_id = r.id AND ar.language_code = 'ar'
         LEFT JOIN restaurant_tags AS rt ON rt.restaurant_id = r.id
      GROUP BY r.id, en.name, en.description, ar.name, ar.description
      ORDER BY r.id DESC;`;

      const sponsorsQuery = `
      SELECT s.id, s.restaurant_id, s.banner_image_url, s.is_active, s.display_order, en.name AS restaurant_name
      FROM sponsorships AS s
         LEFT JOIN restaurant_translations AS en ON en.restaurant_id = s.restaurant_id AND en.language_code = 'en'
      ORDER BY s.display_order DESC, s.id DESC;`;

      // pool has max: 1 connection, so these run one after the other (not Promise.all)
      const { rows: restaurants } = await pool.query(restaurantsQuery);
      const { rows: tags } = await pool.query(`SELECT id, tagname FROM tags ORDER BY tagname;`);
      const { rows: sponsors } = await pool.query(sponsorsQuery);

      return res.status(200).json({ restaurants, tags, sponsors });
   } catch (error) {
      console.error("Admin overview went wrong", error);
      res.status(500).json({ message: "Fetching admin data went wrong." });
   }
};

//. Presigned URL to upload a logo or banner straight from the browser to S3
// GET /api/admin/upload-url?folder=logos&contentType=image/png
export const getAdminUploadUrl = async (req: Request, res: Response) => {
   try {
      const folder = req.query.folder as string;
      const contentType = req.query.contentType as string;
      const ext = allowedImageTypes[contentType];

      if (!allowedFolders.includes(folder)) {
         return res.status(400).json({ message: "folder must be logos or banners" });
      }
      if (!ext) {
         return res.status(400).json({ message: "Only jpg, png and webp are allowed" });
      }

      // images go in the site bucket (same one CloudFront serves), falls back to the uploads bucket if they're the same
      const bucket = process.env.SITE_BUCKET || process.env.UPLOADS_BUCKET;
      const publicBase = process.env.PUBLIC_SITE_URL; // EX: https://trendbites.yasserswdev.com
      if (!bucket) throw new Error("SITE_BUCKET is not defined");
      if (!publicBase) throw new Error("PUBLIC_SITE_URL is not defined");

      // random name so a new upload never overwrites an old file (and CloudFront never shows a cached old image)
      const key = `images/${folder}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

      const command = new PutObjectCommand({
         Bucket: bucket,
         Key: key,
         ContentType: contentType,
         // the name is unique so the browser/CloudFront can keep it for a year
         CacheControl: "public,max-age=31536000,immutable",
      });
      // link is only valid for 5 minutes and only for this exact file
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

      // publicUrl is what gets saved in the database after the upload finishes
      return res.status(200).json({ uploadUrl, publicUrl: `${publicBase.replace(/\/$/, "")}/${key}` });
   } catch (error) {
      console.error("Error creating admin upload URL:", error);
      res.status(500).json({ message: "An internal server error occurred." });
   }
};

//. Add a new restaurant (logo + english + arabic + tags) in ONE transaction
// if any insert fails nothing is saved, so there's never a restaurant without its translations
export const createRestaurant = async (req: Request, res: Response) => {
   const logoUrl = cleanText(req.body.logoUrl);
   const nameEn = cleanText(req.body.nameEn);
   const descriptionEn = cleanText(req.body.descriptionEn);
   const nameAr = cleanText(req.body.nameAr);
   const descriptionAr = cleanText(req.body.descriptionAr);
   const tagIds = toIdList(req.body.tagIds);

   // both languages are required, the restaurants list only shows a restaurant if it has the current language
   if (!nameEn || !descriptionEn || !nameAr || !descriptionAr) {
      return res.status(400).json({ message: "English and Arabic name + description are required." });
   }
   if (logoUrl && !isHttpsUrl(logoUrl)) {
      return res.status(400).json({ message: "Logo must be an https URL." });
   }

   const client = await pool.connect();
   try {
      await client.query("BEGIN");

      const { rows } = await client.query(`INSERT INTO restaurants (restaurant_logo) VALUES ($1) RETURNING id;`, [
         logoUrl || null,
      ]);
      const restaurantId = rows[0].id;

      await client.query(
         `INSERT INTO restaurant_translations (restaurant_id, language_code, name, description)
          VALUES ($1, 'en', $2, $3), ($1, 'ar', $4, $5);`,
         [restaurantId, nameEn, descriptionEn, nameAr, descriptionAr]
      );

      if (tagIds.length > 0) {
         // UNNEST turns the array into rows so all tags are inserted with one query
         await client.query(
            `INSERT INTO restaurant_tags (restaurant_id, tag_id) SELECT $1, UNNEST($2::int[]) ON CONFLICT DO NOTHING;`,
            [restaurantId, tagIds]
         );
      }

      await client.query("COMMIT");
      return res.status(201).json({ message: "Restaurant added.", id: restaurantId });
   } catch (error) {
      await client.query("ROLLBACK");
      // 23503 = foreign key error, meaning one of the tag ids doesn't exist
      if ((error as { code?: string }).code === "23503") {
         return res.status(400).json({ message: "One of the selected tags doesn't exist anymore." });
      }
      console.error("Creating restaurant went wrong", error);
      res.status(500).json({ message: "Adding the restaurant went wrong." });
   } finally {
      // always give the connection back (pool max is 1, a leaked connection would freeze the Lambda)
      client.release();
   }
};

//. Edit a restaurant, only the fields that are sent get changed
export const updateRestaurant = async (req: Request, res: Response) => {
   const restaurantId = parseInt(req.params.id as string, 10);
   if (!Number.isFinite(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id." });
   }

   const { logoUrl, nameEn, descriptionEn, nameAr, descriptionAr, tagIds } = req.body;
   if (logoUrl !== undefined && cleanText(logoUrl) && !isHttpsUrl(cleanText(logoUrl))) {
      return res.status(400).json({ message: "Logo must be an https URL." });
   }

   const client = await pool.connect();
   try {
      await client.query("BEGIN");

      const { rowCount } = await client.query(`SELECT 1 FROM restaurants WHERE id = $1;`, [restaurantId]);
      if (!rowCount) {
         await client.query("ROLLBACK");
         return res.status(404).json({ message: "Restaurant not found." });
      }

      if (logoUrl !== undefined) {
         await client.query(`UPDATE restaurants SET restaurant_logo = $1 WHERE id = $2;`, [
            cleanText(logoUrl) || null,
            restaurantId,
         ]);
      }

      // upsert = update the translation if it exists, insert it if it doesn't (unique on restaurant_id + language_code)
      const upsertTranslation = async (lang: "en" | "ar", name: unknown, description: unknown) => {
         if (name === undefined && description === undefined) return;
         const cleanName = cleanText(name);
         const cleanDesc = cleanText(description);
         if (!cleanName || !cleanDesc) throw new Error(`Both ${lang} name and description are required`);
         await client.query(
            `INSERT INTO restaurant_translations (restaurant_id, language_code, name, description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (restaurant_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`,
            [restaurantId, lang, cleanName, cleanDesc]
         );
      };
      await upsertTranslation("en", nameEn, descriptionEn);
      await upsertTranslation("ar", nameAr, descriptionAr);

      // tags are replaced as a whole (the page always sends the full list of checked tags)
      if (tagIds !== undefined) {
         await client.query(`DELETE FROM restaurant_tags WHERE restaurant_id = $1;`, [restaurantId]);
         const ids = toIdList(tagIds);
         if (ids.length > 0) {
            await client.query(
               `INSERT INTO restaurant_tags (restaurant_id, tag_id) SELECT $1, UNNEST($2::int[]) ON CONFLICT DO NOTHING;`,
               [restaurantId, ids]
            );
         }
      }

      await client.query("COMMIT");
      return res.status(200).json({ message: "Restaurant updated." });
   } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23503") {
         return res.status(400).json({ message: "One of the selected tags doesn't exist anymore." });
      }
      console.error("Updating restaurant went wrong", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Updating the restaurant went wrong." });
   } finally {
      client.release();
   }
};

//. Add a new tag (tags must be lowercase, there's a CHECK on the table)
export const createTag = async (req: Request, res: Response) => {
   const tagname = cleanText(req.body.tagname).toLowerCase();
   if (!tagname) {
      return res.status(400).json({ message: "Tag name is required." });
   }
   try {
      const { rows } = await pool.query(
         `INSERT INTO tags (tagname) VALUES ($1) ON CONFLICT (tagname) DO NOTHING RETURNING id, tagname;`,
         [tagname]
      );
      if (rows.length === 0) {
         return res.status(409).json({ message: "That tag already exists." });
      }
      return res.status(201).json({ message: "Tag added.", tag: rows[0] });
   } catch (error) {
      console.error("Creating tag went wrong", error);
      res.status(500).json({ message: "Adding the tag went wrong." });
   }
};

//. Add a sponsor banner for an existing restaurant
export const createSponsor = async (req: Request, res: Response) => {
   const restaurantId = parseInt(req.body.restaurantId, 10);
   const bannerUrl = cleanText(req.body.bannerUrl);
   const displayOrder = parseInt(req.body.displayOrder, 10) || 0; // higher shows first

   if (!Number.isFinite(restaurantId) || !isHttpsUrl(bannerUrl)) {
      return res.status(400).json({ message: "A restaurant and an https banner URL are required." });
   }
   try {
      const { rows } = await pool.query(
         `INSERT INTO sponsorships (restaurant_id, banner_image_url, display_order)
          SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM restaurants WHERE id = $1)
          RETURNING id;`,
         [restaurantId, bannerUrl, displayOrder]
      );
      if (rows.length === 0) {
         return res.status(404).json({ message: "Restaurant not found." });
      }
      return res.status(201).json({ message: "Sponsor added.", id: rows[0].id });
   } catch (error) {
      console.error("Creating sponsor went wrong", error);
      res.status(500).json({ message: "Adding the sponsor went wrong." });
   }
};

//. Turn a sponsor on/off or change its order (keeps the history instead of deleting)
export const updateSponsor = async (req: Request, res: Response) => {
   const sponsorId = parseInt(req.params.id as string, 10);
   if (!Number.isFinite(sponsorId)) {
      return res.status(400).json({ message: "Invalid sponsor id." });
   }
   const isActive = typeof req.body.isActive === "boolean" ? req.body.isActive : null;
   const displayOrder = req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder, 10) : null;

   try {
      // COALESCE keeps the old value when that field wasn't sent
      const { rowCount } = await pool.query(
         `UPDATE sponsorships
          SET is_active = COALESCE($1, is_active), display_order = COALESCE($2, display_order)
          WHERE id = $3;`,
         [isActive, Number.isFinite(displayOrder) ? displayOrder : null, sponsorId]
      );
      if (!rowCount) {
         return res.status(404).json({ message: "Sponsor not found." });
      }
      return res.status(200).json({ message: "Sponsor updated." });
   } catch (error) {
      console.error("Updating sponsor went wrong", error);
      res.status(500).json({ message: "Updating the sponsor went wrong." });
   }
};

//. Remove a sponsor completely
export const deleteSponsor = async (req: Request, res: Response) => {
   const sponsorId = parseInt(req.params.id as string, 10);
   if (!Number.isFinite(sponsorId)) {
      return res.status(400).json({ message: "Invalid sponsor id." });
   }
   try {
      const { rowCount } = await pool.query(`DELETE FROM sponsorships WHERE id = $1;`, [sponsorId]);
      if (!rowCount) {
         return res.status(404).json({ message: "Sponsor not found." });
      }
      return res.status(200).json({ message: "Sponsor removed." });
   } catch (error) {
      console.error("Deleting sponsor went wrong", error);
      res.status(500).json({ message: "Removing the sponsor went wrong." });
   }
};
