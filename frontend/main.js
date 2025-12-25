function main() {
    const username = localStorage.getItem("username") || "用户";
    document.getElementById("username").innerText = `欢迎，${username}`;
    loadPage("home");
}

function setActive(type) {
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
        if (li.dataset.type === type) {
            li.classList.add("active");
        }
    });
}

function loadPage(type) {
    const content = document.getElementById("content");
    setActive(type);

    // 先淡出
    content.style.opacity = 0;

    setTimeout(() => {
        switch (type) {
            case "home":
                content.innerHTML = `
                    <div class="dashboard-cards">
                        <div class="dashboard-card">
                            <h4>订单总览</h4>
                            <p>—</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>销售额</h4>
                            <p>—</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>用户数量</h4>
                            <p>—</p>
                        </div>
                        <div class="dashboard-card">
                            <h4>商品数量</h4>
                            <p>—</p>
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
                break;

            case "orders":
                content.innerHTML = `
                    <div class="card">
                        <h2>订单管理</h2>
                        <div class="toolbar">
                            <input placeholder="订单号">
                            <input placeholder="用户名">
                            <select>
                                <option>全部状态</option>
                                <option>待付款</option>
                                <option>待发货</option>
                                <option>已完成</option>
                            </select>
                            <button>查询</button>
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
                            <tbody></tbody>
                        </table>
                    </div>
                `;
                break;

            case "products":
                content.innerHTML = `
                    <div class="card">
                        <h2>商品管理</h2>
                        <div class="toolbar">
                            <input placeholder="商品名称">
                            <button>搜索</button>
                            <button>新增商品</button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>商品名</th>
                                    <th>价格</th>
                                    <th>库存</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `;
                break;

            case "users":
                content.innerHTML = `
                    <div class="card">
                        <h2>用户管理</h2>
                        <div class="toolbar">
                            <input placeholder="用户名">
                            <button>查询</button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>用户名</th>
                                    <th>角色</th>
                                    <th>状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `;
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

document.addEventListener("DOMContentLoaded", main);
