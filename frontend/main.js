function main() {
    const username = localStorage.getItem("username") || "用户";
    document.getElementById("username").innerText = `欢迎，${username}`;
}

function loadPage(type) {
    const content = document.getElementById("content");

    switch (type) {
        case "home":
            content.innerHTML = `
                <h2>系统首页</h2>
                <p>欢迎使用电商管理系统。</p>
            `;
            break;

        case "orders":
            content.innerHTML = `
                <h2>订单管理</h2>
                <p>这里可以查看和管理订单。</p>
            `;
            break;

        case "products":
            content.innerHTML = `
                <h2>商品管理</h2>
                <p>这里可以管理商品信息。</p>
            `;
            break;

        case "users":
            content.innerHTML = `
                <h2>用户管理</h2>
                <p>这里可以查看用户列表。</p>
            `;
            break;
    }
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", main);
