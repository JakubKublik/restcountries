document.addEventListener('DOMContentLoaded', function () {
    // Pobieramy listę kontynentów z serwera i tworzymy checkboxy
    fetch('/continents')
      .then(response => response.json())
      .then(data => {
        const continentCheckboxes = document.getElementById('continentCheckboxes');
  
        data.forEach(continent => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'continents';
          checkbox.value = continent.kontynent;
          checkbox.id = `continent_${continent.kontynent}`;
          const label = document.createElement('label');
          label.htmlFor = `continent_${continent.kontynent}`;
          label.appendChild(document.createTextNode(continent.kontynent));
          continentCheckboxes.appendChild(checkbox);
          continentCheckboxes.appendChild(label);
        });
      })
      .catch(error => {
        console.error('Błąd:', error);
      });
  
    // Obsługa formularza po kliknięciu "Filter"
    const continentForm = document.getElementById('continentForm');
    continentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const selectedContinents = Array.from(document.querySelectorAll('input[name=continents]:checked')).map(checkbox => checkbox.value);
      
      try {
        const response = await fetch(`/co/${selectedContinents.join(',')}`);
        const data = await response.json();
        
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<h2>Filtered Countries:</h2>';
        if (data.length === 0) {
          resultDiv.innerHTML += '<p>No countries found for the selected continents.</p>';
        } else {
          const ul = document.createElement('ul');
          data.forEach(country => {
            const li = document.createElement('li');
            li.textContent = country.nazwa;
            ul.appendChild(li);
          });
          resultDiv.appendChild(ul);
        }
      } catch (error) {
        console.error('Error fetching filtered countries:', error);
      }
    });
  });
  