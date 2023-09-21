const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000
app.use(cors())
const axios = require('axios');
const  mysql = require('mysql2/promise')




const dbConfig = {
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'world', 
  };
  
  app.get('/c', async (req, res) => {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
  
      const countriesData = response.data.map((country) => ({
        nazwa: country.name.common, 
        populacja: country.population, 
        stolica: country.capital && country.capital[0], 
        powierzchnia: country.area, 
      }));
  
      const connection = await mysql.createConnection(dbConfig);
  
      for (const country of countriesData) {
        const [existingRows] = await connection.query('SELECT * FROM kraje WHERE nazwa = ?', [country.nazwa]);
  
        if (existingRows.length === 0) {
          await connection.query('INSERT INTO kraje (nazwa, populacja, stolica, powierzchnia) VALUES (?, ?, ?, ?)', [
            country.nazwa,
            country.populacja,
            country.stolica,
            country.powierzchnia,
          ]);
  
          console.log(`Dodano kraj do bazy danych: ${country.nazwa}`);
        } else {
          await connection.query(
            'UPDATE kraje SET populacja = ?, stolica = ?, powierzchnia = ? WHERE nazwa = ?',
            [country.populacja, country.stolica, country.powierzchnia, country.nazwa]
          );
  
          console.log(`Zaktualizowano kraj w bazie danych: ${country.nazwa}`);
        }
      }
  
      connection.end();
  
      res.json({ message: 'Countries saved/updated in the database' });
    } catch (error) {
      console.error('Błąd:', error);
      res.status(500).json({ error: 'Wystąpił błąd podczas pobierania danych lub zapisu do bazy danych.' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server działa na porcie ${port}`);
  });