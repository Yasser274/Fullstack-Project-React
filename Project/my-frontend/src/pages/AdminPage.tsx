import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext&Global";
import { API_BASE_URL } from "../config/config";
import { notify } from "../utils/notify";
import Loading from "../assets/icons/Loading";
import { AlertIcon, CameraIcon, CloseIcon, LockIcon, PencilIcon, TagIcon, UtensilsIcon } from "../assets/icons/Icons";
import styles from "../components/styles/Admin.module.css";

// .Admin page (/en/admin)
// add restaurants, upload logos/banners to S3 and manage sponsors without touching the database console
// * only works for the user ids in ADMIN_USER_IDS (Lambda env var), the backend checks it on every request
// * english only on purpose, it's a tool for me not for visitors

interface Tag {
   id: number;
   tagname: string;
}
interface AdminRestaurant {
   id: number;
   restaurant_logo: string | null;
   name_en: string | null;
   description_en: string | null;
   name_ar: string | null;
   description_ar: string | null;
   tag_ids: number[];
}
interface AdminSponsor {
   id: number;
   restaurant_id: number;
   restaurant_name: string | null;
   banner_image_url: string;
   is_active: boolean;
   display_order: number;
}

// * one fetch helper for every admin request (adds the token + turns errors into readable messages)
const adminFetch = async (path: string, options: RequestInit = {}) => {
   const token = localStorage.getItem("token");
   const response = await fetch(`${API_BASE_URL}/api/admin${path}`, {
      ...options,
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
         ...options.headers,
      },
   });
   const data = await response.json().catch(() => ({}));
   if (!response.ok) {
      // status attached so the page can tell "not admin" (403) apart from other errors
      throw Object.assign(new Error(data.message || "Request failed"), { status: response.status });
   }
   return data;
};

// * same 2 step upload as the profile picture: get a presigned link, then PUT the file straight to S3
const uploadImage = async (file: File, folder: "logos" | "banners"): Promise<string> => {
   const { uploadUrl, publicUrl } = await adminFetch(
      `/upload-url?folder=${folder}&contentType=${encodeURIComponent(file.type)}`
   );
   const s3Response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type }, // must match the type the link was signed for
      body: file,
   });
   if (!s3Response.ok) throw new Error("Uploading the image to S3 failed");
   return publicUrl;
};

const MAX_IMAGE_MB = 5;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

// .Image picker with preview (used for logos and banners)
const ImagePicker = ({
   label,
   currentUrl,
   file,
   onPick,
   wide,
}: {
   label: string;
   currentUrl?: string | null;
   file: File | null;
   onPick: (file: File | null) => void;
   wide?: boolean; // banners are wide (about 4.4:1), logos are square
}) => {
   const inputRef = useRef<HTMLInputElement>(null);
   const [preview, setPreview] = useState<string | null>(null);

   // show the picked file before it's uploaded (and free the memory when it changes)
   useEffect(() => {
      if (!file) {
         setPreview(null);
         return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
   }, [file]);

   const shown = preview || currentUrl || null;

   return (
      <div className={styles.field}>
         <span className={styles.label}>{label}</span>
         <button
            type="button"
            className={`${styles.imagePicker} ${wide ? styles.imagePickerWide : ""}`}
            onClick={() => inputRef.current?.click()}
         >
            {shown ? (
               <img src={shown} alt="" />
            ) : (
               <span className={styles.imagePickerEmpty}>
                  <CameraIcon size={24} />
                  {wide ? "1920 × 440" : "256 × 256"}
               </span>
            )}
            <span className={styles.imagePickerBadge}>
               <PencilIcon size={14} />
            </span>
         </button>
         <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            hidden
            onChange={(e) => {
               const picked = e.target.files?.[0] ?? null;
               e.target.value = ""; // so picking the same file again still works
               if (picked && picked.size > MAX_IMAGE_MB * 1024 * 1024) {
                  notify.error(`Image must be smaller than ${MAX_IMAGE_MB}MB`);
                  return;
               }
               onPick(picked);
            }}
         />
      </div>
   );
};

// .Empty form values
const emptyRestaurantForm = {
   nameEn: "",
   descriptionEn: "",
   nameAr: "",
   descriptionAr: "",
   tagIds: [] as number[],
};

const AdminPage = () => {
   const { user } = useAuth();
   const { i18n } = useTranslation();

   const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
   const [tags, setTags] = useState<Tag[]>([]);
   const [sponsors, setSponsors] = useState<AdminSponsor[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [accessError, setAccessError] = useState<string | null>(null);

   // * restaurant form (add OR edit, editingId null = adding a new one)
   const [editingId, setEditingId] = useState<number | null>(null);
   const [form, setForm] = useState(emptyRestaurantForm);
   const [logoFile, setLogoFile] = useState<File | null>(null);
   const [newTag, setNewTag] = useState("");
   const [isSaving, setIsSaving] = useState(false);
   const formRef = useRef<HTMLFormElement>(null);

   // * sponsor form
   const [sponsorRestaurantId, setSponsorRestaurantId] = useState("");
   const [sponsorOrder, setSponsorOrder] = useState("0");
   const [bannerFile, setBannerFile] = useState<File | null>(null);
   const [isSavingSponsor, setIsSavingSponsor] = useState(false);

   const editingRestaurant = restaurants.find((r) => r.id === editingId);

   const loadOverview = useCallback(async () => {
      try {
         const data = await adminFetch("/overview");
         setRestaurants(data.restaurants);
         setTags(data.tags);
         setSponsors(data.sponsors);
         setAccessError(null);
      } catch (error) {
         const status = (error as { status?: number }).status;
         setAccessError(
            status === 403
               ? "This account isn't an admin."
               : status === 401
                 ? "Your session expired, log in again."
                 : (error as Error).message
         );
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      if (user) loadOverview();
      else setIsLoading(false);
   }, [user, loadOverview]);

   const resetRestaurantForm = () => {
      setEditingId(null);
      setForm(emptyRestaurantForm);
      setLogoFile(null);
   };

   // load a restaurant into the form and scroll up to it
   const startEditing = (restaurant: AdminRestaurant) => {
      setEditingId(restaurant.id);
      setForm({
         nameEn: restaurant.name_en ?? "",
         descriptionEn: restaurant.description_en ?? "",
         nameAr: restaurant.name_ar ?? "",
         descriptionAr: restaurant.description_ar ?? "",
         tagIds: restaurant.tag_ids ?? [],
      });
      setLogoFile(null);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
   };

   const toggleTag = (tagId: number) => {
      setForm((prev) => ({
         ...prev,
         tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
      }));
   };

   const addTag = async () => {
      if (!newTag.trim()) return;
      try {
         const data = await adminFetch("/tags", { method: "POST", body: JSON.stringify({ tagname: newTag }) });
         setTags((prev) => [...prev, data.tag].sort((a, b) => a.tagname.localeCompare(b.tagname)));
         setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, data.tag.id] })); // select it right away
         setNewTag("");
      } catch (error) {
         notify.error((error as Error).message);
      }
   };

   const saveRestaurant = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         // upload the logo first (only if a new one was picked), then save everything with its URL
         const logoUrl = logoFile ? await uploadImage(logoFile, "logos") : undefined;
         const body = { ...form, ...(logoUrl !== undefined ? { logoUrl } : {}) };

         if (editingId) {
            await adminFetch(`/restaurants/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
            notify.success("Restaurant updated");
         } else {
            await adminFetch("/restaurants", { method: "POST", body: JSON.stringify(body) });
            notify.success("Restaurant added");
         }
         resetRestaurantForm();
         await loadOverview();
      } catch (error) {
         notify.error((error as Error).message);
      } finally {
         setIsSaving(false);
      }
   };

   const saveSponsor = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!bannerFile || !sponsorRestaurantId) {
         notify.error("Pick a restaurant and a banner image");
         return;
      }
      setIsSavingSponsor(true);
      try {
         const bannerUrl = await uploadImage(bannerFile, "banners");
         await adminFetch("/sponsors", {
            method: "POST",
            body: JSON.stringify({ restaurantId: Number(sponsorRestaurantId), bannerUrl, displayOrder: sponsorOrder }),
         });
         notify.success("Sponsor added");
         setBannerFile(null);
         setSponsorRestaurantId("");
         setSponsorOrder("0");
         await loadOverview();
      } catch (error) {
         notify.error((error as Error).message);
      } finally {
         setIsSavingSponsor(false);
      }
   };

   const updateSponsor = async (id: number, changes: { isActive?: boolean; displayOrder?: number }) => {
      try {
         await adminFetch(`/sponsors/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
         // update the list right away instead of refetching everything
         setSponsors((prev) =>
            prev.map((s) =>
               s.id === id
                  ? {
                       ...s,
                       ...(changes.isActive !== undefined ? { is_active: changes.isActive } : {}),
                       ...(changes.displayOrder !== undefined ? { display_order: changes.displayOrder } : {}),
                    }
                  : s
            )
         );
      } catch (error) {
         notify.error((error as Error).message);
      }
   };

   const deleteSponsor = async (id: number) => {
      // simple confirm is fine here (admin only page)
      if (!window.confirm("Remove this sponsor? (Use the switch to just hide it)")) return;
      try {
         await adminFetch(`/sponsors/${id}`, { method: "DELETE" });
         setSponsors((prev) => prev.filter((s) => s.id !== id));
         notify.success("Sponsor removed");
      } catch (error) {
         notify.error((error as Error).message);
      }
   };

   // * not logged in / not admin / loading
   if (!user || accessError) {
      return (
         <div className={styles.blockedCon}>
            <title>Admin</title>
            {user ? <AlertIcon size={44} /> : <LockIcon size={44} />}
            <h1>Admin</h1>
            <p>{user ? accessError : "Log in with an admin account to use this page."}</p>
            <Link to={`/${i18n.language}`} className={styles.secondaryBtn}>
               Back to home
            </Link>
         </div>
      );
   }
   if (isLoading) {
      return (
         <div className={styles.blockedCon}>
            <Loading></Loading>
         </div>
      );
   }

   return (
      <div className={styles.adminCon}>
         <title>Admin</title>
         <header className={styles.pageHeader}>
            <h1>Admin</h1>
            <p>
               {restaurants.length} restaurants · {tags.length} tags · {sponsors.filter((s) => s.is_active).length}{" "}
               active sponsors
            </p>
         </header>

         {/* ================= Restaurant form ================= */}
         <form className={styles.card} onSubmit={saveRestaurant} ref={formRef}>
            <div className={styles.cardHeader}>
               <h2>
                  <UtensilsIcon size={20} />
                  {editingId ? `Edit: ${editingRestaurant?.name_en ?? `#${editingId}`}` : "Add restaurant"}
               </h2>
               {editingId ? (
                  <button type="button" className={styles.ghostBtn} onClick={resetRestaurantForm}>
                     <CloseIcon size={16} /> Cancel edit
                  </button>
               ) : null}
            </div>

            <div className={styles.restaurantFormGrid}>
               <ImagePicker
                  label="Logo"
                  currentUrl={editingRestaurant?.restaurant_logo}
                  file={logoFile}
                  onPick={setLogoFile}
               />

               <div className={styles.langColumns}>
                  {/* english */}
                  <div className={styles.langColumn}>
                     <span className={styles.langBadge}>EN</span>
                     <label className={styles.field}>
                        <span className={styles.label}>Name</span>
                        <input
                           className={styles.input}
                           value={form.nameEn}
                           onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                           required
                        />
                     </label>
                     <label className={styles.field}>
                        <span className={styles.label}>Description</span>
                        <textarea
                           className={styles.input}
                           rows={4}
                           value={form.descriptionEn}
                           onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                           required
                        />
                     </label>
                  </div>
                  {/* arabic (dir rtl so typing arabic looks right even on the english page) */}
                  <div className={styles.langColumn} dir="rtl">
                     <span className={styles.langBadge}>AR</span>
                     <label className={styles.field}>
                        <span className={styles.label}>الاسم</span>
                        <input
                           className={styles.input}
                           value={form.nameAr}
                           onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                           required
                        />
                     </label>
                     <label className={styles.field}>
                        <span className={styles.label}>الوصف</span>
                        <textarea
                           className={styles.input}
                           rows={4}
                           value={form.descriptionAr}
                           onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                           required
                        />
                     </label>
                  </div>
               </div>
            </div>

            {/* tags as toggle chips + add a new tag inline */}
            <div className={styles.field}>
               <span className={styles.label}>
                  <TagIcon size={14} /> Tags
               </span>
               <div className={styles.tagChips}>
                  {tags.map((tag) => (
                     <button
                        type="button"
                        key={tag.id}
                        className={`${styles.tagChip} ${form.tagIds.includes(tag.id) ? styles.tagChipOn : ""}`}
                        onClick={() => toggleTag(tag.id)}
                        aria-pressed={form.tagIds.includes(tag.id)}
                     >
                        {tag.tagname}
                     </button>
                  ))}
                  <span className={styles.newTagCon}>
                     <input
                        className={styles.newTagInput}
                        placeholder="new tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        // Enter adds the tag instead of submitting the whole form
                        onKeyDown={(e) => {
                           if (e.key === "Enter") {
                              e.preventDefault();
                              addTag();
                           }
                        }}
                     />
                     <button type="button" className={styles.ghostBtn} onClick={addTag}>
                        Add
                     </button>
                  </span>
               </div>
            </div>

            <div className={styles.formActions}>
               <button type="submit" className={styles.primaryBtn} disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Save changes" : "Add restaurant"}
               </button>
            </div>
         </form>

         {/* ================= Restaurants list ================= */}
         <section className={styles.card}>
            <div className={styles.cardHeader}>
               <h2>Restaurants</h2>
            </div>
            {restaurants.length === 0 ? <p className={styles.muted}>No restaurants yet.</p> : null}
            <ul className={styles.list}>
               {restaurants.map((r) => (
                  <li key={r.id} className={`${styles.listRow} ${editingId === r.id ? styles.listRowActive : ""}`}>
                     {r.restaurant_logo ? (
                        <img src={r.restaurant_logo} alt="" className={styles.rowLogo} />
                     ) : (
                        <span className={styles.rowLogo} />
                     )}
                     <div className={styles.rowText}>
                        <strong>{r.name_en ?? "(no english name)"}</strong>
                        <span dir="rtl">{r.name_ar ?? "(لا يوجد اسم عربي)"}</span>
                     </div>
                     {/* a restaurant missing a language doesn't show on that language's list, so flag it */}
                     {!r.name_en || !r.name_ar ? <span className={styles.warnBadge}>missing language</span> : null}
                     <span className={styles.rowId}>#{r.id}</span>
                     <button type="button" className={styles.ghostBtn} onClick={() => startEditing(r)}>
                        <PencilIcon size={16} /> Edit
                     </button>
                  </li>
               ))}
            </ul>
         </section>

         {/* ================= Sponsors ================= */}
         <section className={styles.card}>
            <div className={styles.cardHeader}>
               <h2>Sponsors</h2>
            </div>

            <form className={styles.sponsorForm} onSubmit={saveSponsor}>
               <ImagePicker label="Banner" file={bannerFile} onPick={setBannerFile} wide />
               <div className={styles.sponsorFields}>
                  <label className={styles.field}>
                     <span className={styles.label}>Restaurant</span>
                     <select
                        className={styles.input}
                        value={sponsorRestaurantId}
                        onChange={(e) => setSponsorRestaurantId(e.target.value)}
                        required
                     >
                        <option value="">Choose...</option>
                        {restaurants.map((r) => (
                           <option key={r.id} value={r.id}>
                              {r.name_en ?? r.name_ar ?? `#${r.id}`}
                           </option>
                        ))}
                     </select>
                  </label>
                  <label className={styles.field}>
                     <span className={styles.label}>Order (higher shows first)</span>
                     <input
                        className={styles.input}
                        type="number"
                        value={sponsorOrder}
                        onChange={(e) => setSponsorOrder(e.target.value)}
                     />
                  </label>
                  <button type="submit" className={styles.primaryBtn} disabled={isSavingSponsor}>
                     {isSavingSponsor ? "Uploading..." : "Add sponsor"}
                  </button>
               </div>
            </form>

            <ul className={styles.list}>
               {sponsors.map((s) => (
                  <li key={s.id} className={`${styles.listRow} ${!s.is_active ? styles.listRowOff : ""}`}>
                     <img src={s.banner_image_url} alt="" className={styles.rowBanner} />
                     <div className={styles.rowText}>
                        <strong>{s.restaurant_name ?? `Restaurant #${s.restaurant_id}`}</strong>
                        <span>{s.is_active ? "Showing on the home page" : "Hidden"}</span>
                     </div>
                     <label className={styles.orderInputCon}>
                        <span className={styles.label}>Order</span>
                        <input
                           className={styles.orderInput}
                           type="number"
                           defaultValue={s.display_order}
                           // saves when leaving the field (not on every key press)
                           onBlur={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (Number.isFinite(value) && value !== s.display_order) {
                                 updateSponsor(s.id, { displayOrder: value });
                              }
                           }}
                        />
                     </label>
                     {/* on/off switch, hiding keeps the sponsor so it can come back later */}
                     <button
                        type="button"
                        role="switch"
                        aria-checked={s.is_active}
                        aria-label="Show on home page"
                        className={`${styles.activeSwitch} ${s.is_active ? styles.activeSwitchOn : ""}`}
                        onClick={() => updateSponsor(s.id, { isActive: !s.is_active })}
                     >
                        <span />
                     </button>
                     <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={() => deleteSponsor(s.id)}
                        aria-label="Remove sponsor"
                     >
                        <CloseIcon size={16} />
                     </button>
                  </li>
               ))}
            </ul>
         </section>
      </div>
   );
};

export default AdminPage;
