CREATE TABLE metalspace_posts (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_id INTEGER REFERENCES metalspace_users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT now()
);
