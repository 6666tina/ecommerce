from flask import Flask, request, jsonify
from db import db
from models import User, Product, Order

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecommerce.db'
db.init_app(app)

@app.before_first_request
def create_tables():
    db.create_all()

# 用户注册
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User(username=data['username'], password=data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "register success"})

# 商品列表
@app.route('/products', methods=['GET'])
def products():
    products = Product.query.all()
    return jsonify([
        {"id": p.id, "name": p.name, "price": p.price}
        for p in products
    ])

# 创建订单
@app.route('/order', methods=['POST'])
def create_order():
    data = request.json
    order = Order(
        user_id=data['user_id'],
        product_id=data['product_id'],
        quantity=data['quantity']
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({"msg": "order created"})

if __name__ == '__main__':
    app.run(debug=True)
