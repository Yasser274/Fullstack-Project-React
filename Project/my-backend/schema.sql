--
-- PostgreSQL database dump
--

\restrict 2wC2qTBfLrtjAg4DjLI70JxEkcG4bOEm74w7IdPiPD1uYMAx91rvoU4SzngrBG4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: restaurant_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_reviews (
    user_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    rating smallint NOT NULL,
    reviewed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    comment character varying(1300),
    CONSTRAINT restaurant_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.restaurant_reviews OWNER TO postgres;

--
-- Name: restaurant_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_tags (
    restaurant_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.restaurant_tags OWNER TO postgres;

--
-- Name: restaurant_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_translations (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    language_code character(2) NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.restaurant_translations OWNER TO postgres;

--
-- Name: restaurant_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurant_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_translations_id_seq OWNER TO postgres;

--
-- Name: restaurant_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurant_translations_id_seq OWNED BY public.restaurant_translations.id;


--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id integer NOT NULL,
    restaurant_logo text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    average_rating numeric(3,2) DEFAULT 0.00 NOT NULL,
    rating_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- Name: restaurants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restaurants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurants_id_seq OWNER TO postgres;

--
-- Name: restaurants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restaurants_id_seq OWNED BY public.restaurants.id;


--
-- Name: sponsorships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sponsorships (
    id integer NOT NULL,
    restaurant_id integer NOT NULL,
    banner_image_url text NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sponsorships OWNER TO postgres;

--
-- Name: sponsorships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sponsorships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sponsorships_id_seq OWNER TO postgres;

--
-- Name: sponsorships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sponsorships_id_seq OWNED BY public.sponsorships.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    tagname character varying(80) NOT NULL,
    CONSTRAINT tags_tagname_check CHECK (((tagname)::text = lower((tagname)::text)))
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture_url character varying(255) DEFAULT 'images/default-avatar.png'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: restaurant_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_translations ALTER COLUMN id SET DEFAULT nextval('public.restaurant_translations_id_seq'::regclass);


--
-- Name: restaurants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants ALTER COLUMN id SET DEFAULT nextval('public.restaurants_id_seq'::regclass);


--
-- Name: sponsorships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships ALTER COLUMN id SET DEFAULT nextval('public.sponsorships_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: restaurant_reviews restaurant_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_reviews
    ADD CONSTRAINT restaurant_reviews_pkey PRIMARY KEY (user_id, restaurant_id);


--
-- Name: restaurant_tags restaurant_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_tags
    ADD CONSTRAINT restaurant_tags_pkey PRIMARY KEY (tag_id, restaurant_id);


--
-- Name: restaurant_translations restaurant_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_translations
    ADD CONSTRAINT restaurant_translations_pkey PRIMARY KEY (id);


--
-- Name: restaurant_translations restaurant_translations_restaurant_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_translations
    ADD CONSTRAINT restaurant_translations_restaurant_id_language_code_key UNIQUE (restaurant_id, language_code);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: sponsorships sponsorships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_tagname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tagname_key UNIQUE (tagname);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: restaurant_reviews restaurant_reviews_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_reviews
    ADD CONSTRAINT restaurant_reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_reviews restaurant_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_reviews
    ADD CONSTRAINT restaurant_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: restaurant_tags restaurant_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_tags
    ADD CONSTRAINT restaurant_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: restaurant_translations restaurant_translations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_translations
    ADD CONSTRAINT restaurant_translations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: sponsorships sponsorships_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sponsorships
    ADD CONSTRAINT sponsorships_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2wC2qTBfLrtjAg4DjLI70JxEkcG4bOEm74w7IdPiPD1uYMAx91rvoU4SzngrBG4

