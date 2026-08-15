CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX articles_published_idx ON public.articles (status, published_at DESC);

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles" ON public.articles
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Admins can read all articles" ON public.articles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert articles" ON public.articles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update articles" ON public.articles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete articles" ON public.articles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.articles (title, slug, excerpt, content, category, status, published_at) VALUES
('The Quiet Discipline of Morning Pages','the-quiet-discipline-of-morning-pages','Three pages, longhand, before the day has a chance to argue with you.','Three pages, longhand, first thing in the morning. No editing, no audience, no purpose beyond the act itself.

The practice is older than the name. What it does is simple: it moves the noise from the back of your mind onto the page, where it becomes far less frightening and far more workable.

Most people quit in the first week because nothing happens. Nothing is supposed to happen. The pages are a drain, not a fountain. What matters is what is left behind once the sediment has run out.

Give it a month. You will not become a better writer. You will become a calmer one, which is often the same thing wearing different clothes.','Habits','published', now() - interval '1 day'),
('On Reading Slowly in a Fast Century','on-reading-slowly-in-a-fast-century','Speed reading is a solved problem. Slow reading is the harder art.','We have optimized reading the way we optimized eating: for throughput. Words per minute, books per year, a shelf as a scoreboard.

But a sentence you sprint past leaves nothing behind. The purpose of reading is not acquisition. It is company — the sense of another mind working carefully beside your own.

Try this: read one essay a day. Read it twice. Underline nothing the first time. The second pass will show you which lines were actually yours all along.','Essays','published', now() - interval '3 days'),
('A Short Case for the Evening Walk','a-short-case-for-the-evening-walk','Twenty minutes, no destination, no headphones. The oldest cure there is.','There is a particular kind of thinking that only happens at walking pace. Not the sharp problem-solving of a desk, but something looser — the sort that arrives sideways.

Leave the headphones. The point is not stimulation; it is the absence of it. Let the day settle in the order it wants to.

You will come back with nothing to show for it. That is the feature.','Living','published', now() - interval '6 days'),
('Notes on Keeping a Commonplace Book','notes-on-keeping-a-commonplace-book','A centuries-old habit that makes everything you read stay.','Before the notebook app, there was the commonplace book: a running collection of quotations, observations, and fragments worth keeping.

The value is not in the collecting. It is in the copying — the physical act of moving a sentence through your hand, which is slow enough to make you notice why you liked it.

Keep it messy. Date the entries. Reread it every few months and be gently embarrassed by who you were.','Habits','published', now() - interval '10 days');