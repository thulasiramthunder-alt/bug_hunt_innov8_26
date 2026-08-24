USE defaultdb;

ALTER TABLE teams
	DROP COLUMN IF EXISTS member2_name,
	DROP COLUMN IF EXISTS member2_batch,
	DROP COLUMN IF EXISTS member2_email;