fetch('http://127.0.0.1:5500/products')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('productList');
    data.forEach(p => {
      const li = document.createElement('li');
      li.innerText = p.name + " - ￥" + p.price;
      list.appendChild(li);
    });
  });
