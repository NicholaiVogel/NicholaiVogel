-- Add name field to visitors table
-- Allows Hubert to save the visitor's name when they share it

ALTER TABLE visitors ADD COLUMN name TEXT;
