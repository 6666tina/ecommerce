async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = "";

    if (!username || !password || !confirmPassword) {
        errorMsg.textContent = "用户名和密码不能为空";
        return;
    }
    if (password !== confirmPassword) {
        errorMsg.textContent = "两次密码不一致";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("注册成功");
        } else {
            errorMsg.textContent = data.msg || "注册失败";
        }
    } catch (err) {
        console.error(err);
        errorMsg.textContent = "网络错误，请稍后再试";
    }
}
