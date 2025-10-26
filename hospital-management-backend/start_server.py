#!/usr/bin/env python3
from app import create_app
from extensions import db
from models import User

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default users if they don't exist
        if not User.query.filter_by(email='admin@hospital.com').first():
            admin = User(name='System Administrator', email='admin@hospital.com', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
        
        if not User.query.filter_by(email='receptionist@hospital.com').first():
            receptionist = User(name='Test Receptionist', email='receptionist@hospital.com', role='receptionist')
            receptionist.set_password('receptionist123')
            db.session.add(receptionist)
        
        if not User.query.filter_by(email='doctor@hospital.com').first():
            doctor = User(name='Test Doctor', email='doctor@hospital.com', role='doctor', department='eye')
            doctor.set_password('doctor123')
            db.session.add(doctor)
        
        db.session.commit()
    
    print("Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)