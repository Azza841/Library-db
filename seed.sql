-- =========================================================
-- Sample data for the library database
-- Order matters: parent tables first, then tables with
-- foreign keys (Books depends on Author & Categories,
-- Borrow depends on Members & Books).
-- =========================================================

-- 1. Members
INSERT INTO Members (idMember, First_name, Last_name, Email, Registration_date, Date_of_birth, Adress) VALUES
(1, 'Amine', 'Ben Salah', 'amine.bs@email.com', '2023-01-15', '1998-04-12', '12 Rue de Marseille, Tunis'),
(2, 'Yasmine', 'Trabelsi', 'yasmine.t@email.com', '2023-03-22', '2000-09-05', '5 Avenue Habib Bourguiba, Sousse'),
(3, 'Karim', 'Hammami', 'karim.h@email.com', '2023-05-10', '1995-11-30', '8 Rue Ibn Khaldoun, Sfax'),
(4, 'Nour', 'Gharbi', 'nour.g@email.com', '2024-02-18', '2002-07-21', '3 Rue de la Liberte, Bizerte'),
(5, 'Sami', 'Jlassi', 'sami.j@email.com', '2024-06-01', '1999-02-14', '20 Avenue Jean Jaures, Ariana');

-- 2. Author
INSERT INTO Author (idAuthor, First_name, Last_name, nationality) VALUES
(1, 'Victor', 'Hugo', 'French'),
(2, 'Jane', 'Austen', 'British'),
(3, 'Haruki', 'Murakami', 'Japanese'),
(4, 'Gabriel', 'Garcia Marquez', 'Colombian'),
(5, 'Agatha', 'Christie', 'British');

-- 3. Categories
INSERT INTO Categories (idCategory, name, Description) VALUES
(1, 'Classic Literature', 'Timeless novels and literary works'),
(2, 'Mystery', 'Detective and crime fiction'),
(3, 'Fantasy', 'Fiction involving magical or supernatural elements'),
(4, 'Romance', 'Fiction centered on romantic relationships'),
(5, 'Contemporary Fiction', 'Modern-era fictional works');

-- 4. Books (needs idAuthor and idCategory to already exist)
INSERT INTO Books (idBooks, Title, Publication_year, Editor, Available, idAuthor, idCategory) VALUES
(1, 'Les Miserables', 1862, 'Gallimard', TRUE, 1, 1),
(2, 'Pride and Prejudice', 1813, 'Penguin Classics', TRUE, 2, 4),
(3, 'Norwegian Wood', 1987, 'Vintage', FALSE, 3, 5),
(4, 'One Hundred Years of Solitude', 1967, 'Harper Perennial', TRUE, 4, 3),
(5, 'Murder on the Orient Express', 1934, 'HarperCollins', TRUE, 5, 2),
(6, 'Notre-Dame de Paris', 1831, 'Gallimard', TRUE, 1, 1),
(7, 'Kafka on the Shore', 2002, 'Vintage', TRUE, 3, 3);

-- 5. Borrow (needs idMember and idBooks to already exist)
-- return_date left NULL for books not yet returned
INSERT INTO Borrow (idMember, idBooks, loan_date, return_date) VALUES
(1, 1, '2024-09-01', '2024-09-15'),
(1, 3, '2024-10-05', NULL),
(2, 2, '2024-09-20', '2024-10-01'),
(3, 5, '2024-11-02', '2024-11-16'),
(4, 4, '2024-11-10', NULL),
(5, 7, '2024-12-01', '2024-12-20');
