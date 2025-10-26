from flask import request, jsonify, session
from models import User
from extensions import db

def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        session['role'] = user.role
        session['department'] = user.department
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'role': user.role,
                'department': user.department
            }
        })

    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

def logout():
    session.clear()
    return jsonify({'success': True})

def register_user(name, email, password, role, department=None):
    if User.query.filter_by(email=email).first():
        return {'success': False, 'message': 'Email already exists'}
    
    user = User(name=name, email=email, role=role, department=department)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    return {'success': True, 'message': 'User registered successfully'}