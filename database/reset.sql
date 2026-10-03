-- =========================================================
-- reset.sql
-- Wipes the database and rebuilds it from scratch.
-- Run this whenever your data is messy and you want a clean slate.
-- =========================================================

-- 1. Drop tables in REVERSE dependency order
--    (Borrow depends on Members & Books, Books depends on Author & Categories)
DROP TABLE IF EXISTS Borrow;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Author;
DROP TABLE IF EXISTS Members;

-- 2. Recreate structure
SOURCE structure.sql;

-- 3. Reload seed data
SOURCE seed.sql;
