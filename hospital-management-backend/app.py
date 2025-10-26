from flask import Flask, request, jsonify, session, make_response
from extensions import db, migrate, cors
from config import Config
from auth import login, logout

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Fix CORS: allow multiple local dev origins and handle credentials
    cors.init_app(app, 
                  origins=["http://localhost:3000", "http://localhost:3002"], 
                  supports_credentials=True,
                  allow_headers=["Content-Type", "Authorization"],
                  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Import models
    from models import User, Patient, Appointment, Consultation, Billing, Queue, VitalSigns
    
    # Register blueprints
    from routes.admin_routes import admin_bp
    from routes.receptionist_routes import receptionist_bp
    from routes.doctor_routes import doctor_bp
    from routes.vitals_routes import vitals_bp
    
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(receptionist_bp, url_prefix='/api/receptionist')
    app.register_blueprint(doctor_bp, url_prefix='/api/doctor')
    app.register_blueprint(vitals_bp, url_prefix='/api/vitals')
    
    # Auth routes
    @app.route('/api/login', methods=['POST'])
    def login_route():
        return login()
    
    @app.route('/api/logout', methods=['POST'])
    def logout_route():
        return logout()
    
    @app.route('/api/change-password', methods=['POST'])
    def change_password_route():
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        user = User.query.get(session['user_id'])
        
        if not user.check_password(data['current_password']):
            return jsonify({'success': False, 'message': 'Current password incorrect'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'success': True})
    
    return app
