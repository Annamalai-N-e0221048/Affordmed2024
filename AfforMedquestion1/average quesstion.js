fetch('http://localhost:9876/numbers/p')
  .then(response => response.json())
  .then(data => {
    console.log('Numbers:', data.numbers);
    console.log('Window Previous State:', data.windowPrevState);
    console.log('Window Current State:', data.windowCurrState);
    console.log('Average:', data.avg);
  })
  .catch(error => {
    console.error('Error:', error);
  });