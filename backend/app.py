from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from models import db,Product,Order

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///ecommerce.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_order_data():
    with app.app_context():
        if Order.query.count() == 0:
            orders = [
                Order(order_no="1001", user="张三", amount=120, status="待付款"),
                Order(order_no="1002", user="李四", amount=350, status="待发货"),
                Order(order_no="1003", user="王五", amount=220, status="已完成"),
                Order(order_no="1004", user="赵六", amount=150, status="待付款"),
                Order(order_no="1005", user="孙七", amount=410, status="待发货"),
                Order(order_no="1006", user="孙七", amount=200, status="待发货"),
                Order(order_no="1007", user="赵六", amount=50, status="待付款"),
            ]
            db.session.add_all(orders)
            db.session.commit()
            print("【订单初始化完成】")



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

@app.route("/api/products", methods=["POST"])
def add_product():
    data = request.json

    name = data.get("name")
    price = data.get("price")
    stock = data.get("stock")

    if not name or price is None or stock is None:
        return jsonify({"msg": "参数不完整"}), 400

    product = Product(name=name, price=price, stock=stock)
    db.session.add(product)
    db.session.commit()

    return jsonify({"msg": "商品新增成功"})

@app.route("/api/products", methods=["GET"])
def search_products():
    keyword = request.args.get("keyword", "")

    products = Product.query.filter(
        Product.name.contains(keyword)
    ).all()

    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "stock": p.stock
        })

    return jsonify(result)

@app.route("/api/products/total-stock", methods=["GET"])
def get_total_stock():
    products = Product.query.all()
    total_stock = sum(p.stock for p in products)
    return jsonify({"total": total_stock})

@app.route("/api/products/<int:pid>", methods=["DELETE"])
def delete_product(pid):
    product = Product.query.get(pid)
    if not product:
        return jsonify({"msg": "商品不存在"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"msg": "删除成功"})

@app.route("/api/orders")
def get_orders():
    order_no = request.args.get("order_no", "")
    user = request.args.get("user", "")
    status = request.args.get("status", "")

    query = Order.query

    if order_no:
        query = query.filter(Order.order_no.contains(order_no))
    if user:
        query = query.filter(Order.user.contains(user))
    if status:
        query = query.filter(Order.status == status)

    orders = query.all()

    return jsonify([
        {
            "id": o.id,
            "order_no": o.order_no,
            "user": o.user,
            "amount": o.amount,
            "status": o.status
        } for o in orders
    ])

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json()
    status = data.get("status")

    if not status:
        return jsonify({"msg": "状态不能为空"}), 400

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"msg": "订单不存在"}), 404

    order.status = status
    db.session.commit()

    return jsonify({"msg": "订单状态更新成功"})

@app.route("/api/products/<int:pid>/stock", methods=["PUT"])
def change_product_stock(pid):
    data = request.get_json()
    delta = data.get("delta")

    if delta is None:
        return jsonify({"success": False, "msg": "参数缺失"}), 400

    product = Product.query.get(pid)
    if not product:
        return jsonify({"success": False, "msg": "商品不存在"}), 404

    if product.stock + delta < 0:
        return jsonify({"success": False, "msg": "库存不足"}), 400

    product.stock += delta
    db.session.commit()

    return jsonify({"success": True})

@app.route("/api/products/<int:pid>/stock-direct", methods=["PUT"])
def set_product_stock(pid):
    data = request.get_json()
    stock = data.get("stock")

    if stock is None or stock < 0:
        return jsonify({"success": False, "msg": "库存值非法"}), 400

    product = Product.query.get(pid)
    if not product:
        return jsonify({"success": False, "msg": "商品不存在"}), 404

    product.stock = stock
    db.session.commit()

    return jsonify({"success": True})

if __name__ == "__main__":
    print("数据库路径：", DB_PATH)
    init_db()
    init_order_data() 
    app.run(debug=True)
