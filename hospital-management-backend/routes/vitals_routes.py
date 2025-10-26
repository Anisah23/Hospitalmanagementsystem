from flask import Blueprint, request, jsonify, session
from models import VitalSigns, Patient
from extensions import db
from datetime import datetime

vitals_bp = Blueprint('vitals', __name__)

@vitals_bp.route('/record/<int:patient_id>', methods=['POST'])
def record_vitals(patient_id):
    if session.get('role') not in ['receptionist', 'doctor']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    vitals = VitalSigns(
        patient_id=patient_id,
        blood_pressure=data.get('blood_pressure'),
        heart_rate=data.get('heart_rate'),
        temperature=data.get('temperature'),
        weight=data.get('weight'),
        height=data.get('height'),
        oxygen_saturation=data.get('oxygen_saturation'),
        recorded_by=session.get('user_id')
    )
    
    db.session.add(vitals)
    db.session.commit()
    
    return jsonify({'success': True})

@vitals_bp.route('/patient/<int:patient_id>')
def get_patient_vitals(patient_id):
    if session.get('role') not in ['receptionist', 'doctor', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    vitals = VitalSigns.query.filter_by(patient_id=patient_id).order_by(VitalSigns.created_at.desc()).all()
    
    return jsonify([{
        'id': v.id,
        'blood_pressure': v.blood_pressure or 'N/A',
        'heart_rate': v.heart_rate,
        'temperature': v.temperature,
        'weight': v.weight,
        'height': v.height,
        'oxygen_saturation': v.oxygen_saturation,
        'recorded_by': v.recorder.name if v.recorder else 'Unknown',
        'created_at': v.created_at.isoformat()
    } for v in vitals])

@vitals_bp.route('/latest/<int:patient_id>')
def get_latest_vitals(patient_id):
    if session.get('role') not in ['receptionist', 'doctor', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    vitals = VitalSigns.query.filter_by(patient_id=patient_id).order_by(VitalSigns.created_at.desc()).first()
    
    if not vitals:
        return jsonify({'vitals': None})
    
    return jsonify({
        'vitals': {
            'blood_pressure': vitals.blood_pressure,
            'heart_rate': vitals.heart_rate,
            'temperature': vitals.temperature,
            'weight': vitals.weight,
            'height': vitals.height,
            'oxygen_saturation': vitals.oxygen_saturation,
            'recorded_by': vitals.recorder.name,
            'created_at': vitals.created_at.isoformat()
        }
    })