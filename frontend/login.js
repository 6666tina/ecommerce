function main() {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            errorMsg.textContent = "用户名和密码不能为空";
            return;
        }

        errorMsg.textContent = "";

        try {
            const res = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert("登录成功，即将跳转到首页");
                // 跳转到首页或你想去的页面
                window.location.href = "main.html";
            } else {
                errorMsg.textContent = data.msg || "登录失败";
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "网络错误";
        }
    });
}

document.addEventListener("DOMContentLoaded", main);
