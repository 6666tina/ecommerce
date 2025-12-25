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

// 模拟商品数据
const products = [
    { id: 1, name: "手机", price: 2999 },
    { id: 2, name: "耳机", price: 199 },
    { id: 3, name: "键盘", price: 399 },
    { id: 4, name: "鼠标", price: 129 }
];

// 渲染商品列表
const productList = document.getElementById("product-list");

products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
        <h3>${product.name}</h3>
        <p>价格：¥${product.price}</p>
        <button onclick="addToCart(${product.id})">加入购物车</button>
    `;

    productList.appendChild(div);
});

// 模拟订单数据
const orders = [];

// 加入购物车
function addToCart(id) {
    const product = products.find(p => p.id === id);
    orders.push(product);
    alert(`已加入购物车：${product.name}`);
    renderOrders();
}

// 渲染订单列表
function renderOrders() {
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    orders.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `订单 ${index + 1}：${item.name} - ¥${item.price}`;
        orderList.appendChild(li);
    });
}
