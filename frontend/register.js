function main() {
    const form = document.getElementById("registerForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");
    const errorMsg = document.getElementById("errorMsg");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        if (!username || !password || !confirm) {
            errorMsg.textContent = "所有字段均为必填";
            return;
        }

        if (password !== confirm) {
            errorMsg.textContent = "两次输入的密码不一致";
            return;
        }

        if (password.length < 6) {
            errorMsg.textContent = "密码长度不能少于 6 位";
            return;
        }

        errorMsg.textContent = "";

        // 模拟注册成功
        alert("注册成功，即将跳转到登录页面");

        // 跳转到登录页
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", main);
