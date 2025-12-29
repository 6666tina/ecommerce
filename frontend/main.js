let orders = [];

function loadOrders(callback) {
    fetch("http://127.0.0.1:5000/api/orders")
        .then(res => res.json())
        .then(data => {
            orders = data;
            if (callback) callback();
        });
}

function main() {
    const username = localStorage.getItem("username") || "用户";
    document.getElementById("username").innerText = `欢迎，${username}`;

    // 关键：先加载订单，再进首页
    loadOrders(() => {
        loadPage("home");
    });
}


function setActive(type) {
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
        if (li.dataset.type === type) {
            li.classList.add("active");
        }
    });
}

function loadTotalStock() {
    fetch("http://127.0.0.1:5000/api/products/total-stock")
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById("totalStock");
            if (el) {
                el.innerText = data.total;
            }
        })
        .catch(err => {
            console.error("获取商品库存失败", err);
        });
}


function filterOrders() {
    const orderNo = document.getElementById("orderInput").value.trim();
    const username = document.getElementById("userInput").value.trim();
    const status = document.getElementById("statusSelect").value;

    const filtered = orders.filter(o => {
        return (!orderNo || o.order_no.includes(orderNo)) &&
               (!username || o.user.includes(username)) &&
               (!status || o.status === status);
    });

    renderOrders(filtered);
}


function loadPage(type) {
    const content = document.getElementById("content");
    setActive(type);

    // 先淡出
    content.style.opacity = 0;

    setTimeout(() => {
        switch (type) {
            case "home":
                const totalOrders = orders.length;
                const totalSales = orders.reduce((sum, o) => sum + o.amount, 0);
                const uniqueUsers = new Set(orders.map(o => o.user));
                const userCount = uniqueUsers.size;

                content.innerHTML = `
                    <div class="dashboard-cards">
                        <div class="dashboard-card">
                            <h4>订单总数</h4>
                            <p id="totalOrders">${orders.length}</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>销售额</h4>
                            <p id="totalSales">${orders.reduce((sum, o) => sum + o.amount, 0)}</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>用户数量</h4>
                            <p id="totalUsers">${userCount}</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>商品数量</h4>
                            <p id="totalStock">—</p>
                        </div>
                    </div>

                    <div class="card">
                        <h3>系统提示</h3>
                        <ul>
                            <li>请及时处理待发货订单</li>
                            <li>注意商品库存变化</li>
                        </ul>
                    </div>
                `;
                loadTotalStock();
                break;
                case "orders":
                    content.innerHTML = `
                        <div class="card">
                            <h2>订单管理</h2>

                            <div class="toolbar">
                                <input id="orderInput" placeholder="订单号">
                                <input id="userInput" placeholder="用户名">
                                <select id="statusSelect">
                                    <option value="">全部状态</option>
                                    <option value="待付款">待付款</option>
                                    <option value="待发货">待发货</option>
                                    <option value="已完成">已完成</option>
                                </select>
                                <button onclick="filterOrders()">查询</button>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>订单号</th>
                                        <th>用户</th>
                                        <th>金额</th>
                                        <th>状态</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody id="orderTable"></tbody>
                            </table>
                        </div>
                    `;
                    if (orders.length === 0) 
                    {
                        loadOrders(() => renderOrders(orders));
                    } else {
                        renderOrders(orders);
                    }
                    break;


           case "products":
                content.innerHTML = `
                    <div class="card">
                        <h2>商品管理</h2>

                        <!-- 工具栏 -->
                        <div class="toolbar">
                            <input id="searchInput" placeholder="商品名称">
                            <button onclick="searchProducts()">搜索</button>
                            <button onclick="openAddProductModal()">新增商品</button>
                        </div>

                        <!-- 商品表格 -->
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>商品名</th>
                                    <th>价格</th>
                                    <th>库存</th>
                                </tr>
                            </thead>
                            <tbody id="productTable"></tbody>
                        </table>
                    </div>

                    <!-- 新增商品弹窗 -->
                    <div id="productModal" class="modal" style="display:none;">
                        <div class="modal-content">
                            <h3>新增商品</h3>

                            <input id="modalName" placeholder="商品名称">
                            <input id="modalPrice" type="number" placeholder="价格">
                            <input id="modalStock" type="number" placeholder="库存">

                            <div class="modal-actions">
                                <button onclick="submitProduct()">确认</button>
                                <button onclick="closeAddProductModal()">取消</button>
                            </div>
                        </div>
                    </div>
                `;

                searchProducts();
                break;

        }
        // 淡入
        content.style.opacity = 1;
    }, 120);
}


function logout() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

function searchProducts() {
    const keyword = document.getElementById("searchInput").value || "";

    fetch(`http://127.0.0.1:5000/api/products?keyword=${keyword}`)
        .then(res => res.json())
        .then(data => {
            renderProductTable(data);
        })
        .catch(err => {
            console.error("获取商品失败", err);
        });
}

function openAddProductModal() {
    document.getElementById("productModal").style.display = "flex";
}

function closeAddProductModal() {
    document.getElementById("productModal").style.display = "none";

    // 清空输入框
    document.getElementById("modalName").value = "";
    document.getElementById("modalPrice").value = "";
    document.getElementById("modalStock").value = "";
}

function submitProduct() {
    const name = document.getElementById("modalName").value.trim();
    const price = document.getElementById("modalPrice").value;
    const stock = document.getElementById("modalStock").value;

    if (!name || !price || !stock) {
        alert("请填写完整商品信息");
        return;
    }

    fetch("http://127.0.0.1:5000/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            price: Number(price),
            stock: Number(stock)
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.msg);
        closeAddProductModal();
        searchProducts(); // 刷新商品列表
    });
}


function addProduct() {
    const name = document.getElementById("pname").value.trim();
    const price = document.getElementById("pprice").value;
    const stock = document.getElementById("pstock").value;

    if (!name || !price || !stock) {
        alert("请填写完整商品信息");
        return;
    }

    fetch("http://127.0.0.1:5000/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            price: Number(price),
            stock: Number(stock)
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.msg);
        searchProducts();   // 刷新表格
    });
}

function renderProductTable(list) {
    const tbody = document.getElementById("productTable");
    tbody.innerHTML = "";

    list.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td>${p.stock}</td>
            </tr>
        `;
    });
}

function renderOrders(list) {
    const tbody = document.getElementById("orderTable");
    tbody.innerHTML = "";

    list.forEach(o => {
        tbody.innerHTML += `
            <tr>
                <td>${o.order_no}</td>
                <td>${o.user}</td>
                <td>${o.amount}</td>
                <td>${o.status}</td>
                <td>
                    ${o.status === "待付款" ? 
                        '<span>不可修改</span>' : 
                        `<select id="statusSelect_${o.id}">
                            <option value="待发货" ${o.status==="待发货"?"selected":""}>待发货</option>
                            <option value="已完成" ${o.status==="已完成"?"selected":""}>已完成</option>
                        </select>
                        <button onclick="changeOrderStatus(${o.id})">修改</button>`
                    }
                </td>
            </tr>
        `;
    });
}


function changeOrderStatus(orderId) {
    const select = document.getElementById(`statusSelect_${orderId}`);
    const newStatus = select.value;

    fetch(`http://127.0.0.1:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.msg);
        loadOrders(() => renderOrders(orders));
    })
    .catch(err => {
        console.error("修改订单状态失败", err);
    });
}


document.addEventListener("DOMContentLoaded", main);
