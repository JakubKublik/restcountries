const express = require('express');
const axios = require('axios');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3000; 

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
      kontynent: country.region,
    }));

    const connection = await mysql.createConnection(dbConfig);

    for (const country of countriesData) {
      const [existingRows] = await connection.query('SELECT * FROM kraje WHERE nazwa = ?', [country.nazwa]);

      if (existingRows.length === 0) {
        await connection.query('INSERT INTO kraje (nazwa, populacja, stolica, powierzchnia, kontynent) VALUES (?, ?, ?, ?, ?)', [
          country.nazwa,
          country.populacja,
          country.stolica,
          country.powierzchnia,
          country.kontynent,
        ]);

        console.log(`Dodano kraj do bazy danych: ${country.nazwa}`);
      } else {
        await connection.query(
          'UPDATE kraje SET populacja = ?, stolica = ?, powierzchnia = ?, kontynent = ? WHERE nazwa = ?',
          [country.populacja, country.stolica, country.powierzchnia, country.kontynent, country.nazwa]
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


   

    



      
  
    app.get('/co/:region', async (req, res) => {
      const region = req.params.region;
    
      try {
        const connection = await mysql.createConnection(dbConfig);
    
        const [rows, fields] = await connection.query('SELECT * FROM kraje WHERE region = ?', [region]);
    
        connection.end();
    
        
        res.json(rows);
      } catch (error) {
        console.error('Błąd:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas pobierania danych z bazy danych.' });
      }
    });





    app.get('/cou/:minPopulation', async (req, res) => {
      const { minPopulation } = req.query;
    
      try {
        const connection = await mysql.createConnection(dbConfig);
    
        const [rows] = await connection.query('SELECT * FROM kraje WHERE populacja > ?', [minPopulation]);
    
        connection.end();
    
       res.json(rows);
      } catch (error) {
        console.error('Błąd:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas pobierania danych z bazy danych.' });
      }
    });
    
    app.listen(port, () => {
      console.log(`Server działa na porcie ${port}`);
    });