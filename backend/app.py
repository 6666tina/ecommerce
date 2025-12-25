from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# 初始化数据库（第一次运行用）
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    print("【REGISTER 收到的数据】", data)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "用户名或密码不能为空"}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = get_db()
        cursor = conn.cursor()
        # 先检查用户名是否存在
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"msg": "用户名已存在"}), 400

        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"msg": "注册成功"}), 200

    except Exception as e:
        print("【REGISTER 错误】", e)
        return jsonify({"msg": "注册失败"}), 500


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    print("【LOGIN 收到的数据】", data)

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "用户名或密码不能为空"}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        print("【LOGIN 查到的用户】", dict(user) if user else None)

        if user is None or not check_password_hash(user["password_hash"], password):
            return jsonify({"msg": "用户名或密码错误"}), 401

        return jsonify({"msg": "登录成功"}), 200

    except Exception as e:
        print("【LOGIN 错误】", e)
        return jsonify({"msg": "登录失败"}), 500


@app.route("/test")
def test():
    return jsonify({"msg": "backend ok"})


if __name__ == "__main__":
    print("数据库路径：", DB_PATH)
    init_db()
    app.run(debug=True)
