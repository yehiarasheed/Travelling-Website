const button = document.querySelector('#wanttogo');

button.addEventListener('click', async () => {
  const navbarBrand = document.querySelector('.navbar-brand');
  
  const brandText = navbarBrand.textContent;
  
  try {
      const response = await fetch('/addDestination', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ destination: brandText })
      });

      const result = await response.json();
      if (result.success) {
          alert('Destination added successfully!');
      } else {
          alert('Error: ' + result.err);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the destination.');
  }
});
