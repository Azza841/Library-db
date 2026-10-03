CREATE TABLE Members(
   idMember INT,
   First_name VARCHAR(50),
   Email VARCHAR(50),
   Registration_date DATE,
   Last_name VARCHAR(50),
   Date_of_birth DATE,
   Adress TEXT,
   PRIMARY KEY(idMember)
);

CREATE TABLE Author(
   idAuthor INT,
   First_name VARCHAR(50),
   Last_name VARCHAR(50),
   nationality VARCHAR(50),
   PRIMARY KEY(idAuthor)
);

CREATE TABLE Categories(
   idCategory INT,
   name VARCHAR(50),
   Description VARCHAR(100),
   PRIMARY KEY(idCategory)
);

CREATE TABLE Books(
   idBooks INT,
   Title VARCHAR(50),
   Publication_year INT,
   Editor VARCHAR(50),
   Available BOOLEAN,
   idAuthor INT NOT NULL,
   idCategory INT NOT NULL,
   PRIMARY KEY(idBooks),
   FOREIGN KEY(idAuthor) REFERENCES Author(idAuthor),
   FOREIGN KEY(idCategory) REFERENCES Categories(idCategory)
);

CREATE TABLE Borrow(
   idMember INT,
   idBooks INT,
   loan_date DATE,
   return_date DATE,
   PRIMARY KEY(idMember, idBooks),
   FOREIGN KEY(idMember) REFERENCES Members(idMember),
   FOREIGN KEY(idBooks) REFERENCES Books(idBooks)
);
