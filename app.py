from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from extensions import db, bcrypt, jwt
from models import User, Stock
from flask_cors import CORS



app = Flask(__name__)

# Configure the app
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'r@ndom#123$'

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


@app.route('/')
def landing():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity={'username': user.username})
    return jsonify({'access_token': access_token}), 200

@app.route('/dashboard', methods=['GET'])
def dashboard_page():
    # Serve the dashboard HTML
    return render_template('dashboard.html')

@app.before_request
def log_request_info():
    print(f"Request Headers: {request.headers}") 

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    print("here",user)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Fetch portfolio and metrics for the user
    portfolio = [
        stock.to_dict() for stock in Stock.query.filter_by(user_id=user.id).all()
    ]
    total_value = sum(stock.quantity * get_stock_price(stock.symbol) for stock in portfolio)

    return jsonify({
        'message': f"Welcome {user.username}",
        'portfolio': portfolio,
        'total_value': total_value,
        'metrics': {
            'total_stocks': len(portfolio),
            'most_tracked_stock': 'AAPL'  # Placeholder: Replace with logic
        }
    })

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Ensures database tables are created
    app.run(debug=True)





