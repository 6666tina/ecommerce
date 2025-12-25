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

function main() {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            errorMsg.style.display = "block";
            return;
        }

        errorMsg.style.display = "none";

        // 模拟登录成功
        alert("登录成功");
        localStorage.setItem("username", username);
        window.location.href = "main.html";
    });
}

// 程序入口
document.addEventListener("DOMContentLoaded", main);
