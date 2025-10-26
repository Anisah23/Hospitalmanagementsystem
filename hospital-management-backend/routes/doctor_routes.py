from flask import Blueprint, request, jsonify, session
from models import Patient, Appointment, Consultation, Billing, Queue, User
from extensions import db
from datetime import datetime, date, timedelta
import json

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/dashboard')
def dashboard():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor_id = session.get('user_id')
    if not doctor_id:
        return jsonify({'error': 'No user session'}), 403
    
    # Get date parameters
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Default to today if no dates provided
    if not start_date or not end_date:
        today = date.today()
        start_date = end_date = today
    else:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    try:
        # Get doctor info
        doctor = User.query.get(doctor_id)
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Get queue count (current)
        queue_count = Queue.query.filter_by(doctor_id=doctor_id).count()
        
        # Get appointments in date range
        appointments_count = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.date >= start_date,
            Appointment.date <= end_date
        ).count()
        
        # Get total patients from doctor's department
        total_patients = Patient.query.filter_by(department=doctor.department).count()
        
        # Get completed consultations in date range
        completed_consultations = Consultation.query.filter(
            Consultation.doctor_id == doctor_id,
            db.func.date(Consultation.created_at) >= start_date,
            db.func.date(Consultation.created_at) <= end_date
        ).count()
        
        # Get consultation data with real-time statistics (last 7 days from end_date)
        consultation_data = []
        today = date.today()
        
        for i in range(7):
            chart_date = today - timedelta(days=6-i)
            
            # Count completed consultations for this specific date
            consultations = Consultation.query.filter(
                Consultation.doctor_id == doctor_id,
                db.func.date(Consultation.created_at) == chart_date
            ).count()
            
            # Count appointments scheduled for this date
            appointments = Appointment.query.filter(
                Appointment.doctor_id == doctor_id,
                Appointment.date == chart_date
            ).count()
            
            # Total doctor activity for the day
            total_activity = consultations + appointments
            
            consultation_data.append({
                'day': chart_date.strftime('%a'),
                'consultations': total_activity
            })
        
        return jsonify({
            'todayAppointments': appointments_count,
            'totalPatients': total_patients,
            'queueLength': queue_count,
            'completedConsultations': completed_consultations,
            'consultationData': consultation_data,
            'department': doctor.department
        })
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({
            'todayAppointments': 0,
            'totalPatients': 0,
            'queueLength': 0,
            'completedConsultations': 0,
            'consultationData': [],
            'department': 'general'
        }), 200

@doctor_bp.route('/start-consultation/<int:queue_id>', methods=['POST'])
def start_consultation(queue_id):
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    queue_entry = Queue.query.get_or_404(queue_id)
    queue_entry.status = 'in_progress'
    db.session.commit()
    
    return jsonify({
        'success': True,
        'patient': {
            'id': queue_entry.patient.id,
            'name': queue_entry.patient.name,
            'age': queue_entry.patient.age,
            'gender': queue_entry.patient.gender,
            'department': queue_entry.patient.department
        }
    })

@doctor_bp.route('/save-consultation', methods=['POST'])
def save_consultation():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.json
        doctor_id = session['user_id']
        patient_id = data['patient_id']
        
        # Create consultation record
        consultation = Consultation(
            patient_id=patient_id,
            doctor_id=doctor_id,
            symptoms=data.get('symptoms', ''),
            diagnosis=data.get('diagnosis', ''),
            prescription=data.get('prescription', ''),
            tests=data.get('exam_data', ''),  # Store exam data in tests field
            notes=data.get('notes', '')
        )
        db.session.add(consultation)
        db.session.flush()
        
        # Create billing record
        if data.get('amount'):
            billing = Billing(
                consultation_id=consultation.id,
                patient_id=patient_id,
                amount=float(data['amount']),
                payment_method=data.get('payment_method', 'cash'),
                status='pending'
            )
            db.session.add(billing)
        
        # Delete ALL queue entries for this patient with this doctor
        Queue.query.filter_by(
            patient_id=patient_id,
            doctor_id=doctor_id
        ).delete()
        
        # Mark appointments as completed
        Appointment.query.filter_by(
            patient_id=patient_id,
            doctor_id=doctor_id,
            date=date.today()
        ).update({'status': 'completed'})
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Consultation completed successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@doctor_bp.route('/patient-history/<int:patient_id>')
def patient_history(patient_id):
    if session.get('role') not in ['doctor', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    consultations = db.session.query(Consultation, Billing).outerjoin(
        Billing, Consultation.id == Billing.consultation_id
    ).filter(Consultation.patient_id == patient_id).order_by(
        Consultation.created_at.desc()
    ).all()
    
    return jsonify({
        'patient': {
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'gender': patient.gender,
            'phone': patient.phone,
            'email': getattr(patient, 'email', ''),
            'address': patient.address,
            'department': patient.department
        },
        'consultations': [{
            'id': record.Consultation.id,
            'patient_id': patient_id,
            'symptoms': record.Consultation.symptoms,
            'diagnosis': record.Consultation.diagnosis,
            'prescription': record.Consultation.prescription,
            'tests': record.Consultation.tests,
            'notes': record.Consultation.notes,
            'amount': float(record.Billing.amount) if record.Billing else 0,
            'doctor_name': record.Consultation.doctor.name,
            'doctor_id': record.Consultation.doctor_id,
            'created_at': record.Consultation.created_at.isoformat()
        } for record in consultations]
    })

@doctor_bp.route('/my-patients')
def my_patients():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor_id = session['user_id']
    
    # Get all patients who have had consultations, appointments, or queue entries with this doctor
    patient_ids = set()
    
    # From consultations
    consultation_patients = db.session.query(Consultation.patient_id).filter_by(doctor_id=doctor_id).distinct().all()
    patient_ids.update([p[0] for p in consultation_patients])
    
    # From appointments
    appointment_patients = db.session.query(Appointment.patient_id).filter_by(doctor_id=doctor_id).distinct().all()
    patient_ids.update([p[0] for p in appointment_patients])
    
    # From queue
    queue_patients = db.session.query(Queue.patient_id).filter_by(doctor_id=doctor_id).distinct().all()
    patient_ids.update([p[0] for p in queue_patients])
    
    # Get patient details
    patients = Patient.query.filter(Patient.id.in_(patient_ids)).all() if patient_ids else []
    
    result = []
    for p in patients:
        # Get last consultation for this patient with this doctor
        last_consultation = Consultation.query.filter_by(
            patient_id=p.id,
            doctor_id=doctor_id
        ).order_by(Consultation.created_at.desc()).first()
        
        result.append({
            'id': p.id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'phone': p.phone,
            'last_visit': last_consultation.created_at.isoformat() if last_consultation else None
        })
    
    return jsonify(result)

@doctor_bp.route('/queue')
def get_queue():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor_id = session['user_id']
    queue = Queue.query.filter_by(
        doctor_id=doctor_id
    ).order_by(Queue.created_at.asc()).all()
    
    return jsonify([{
        'id': q.id,
        'patient_id': q.patient_id,
        'patient_name': q.patient.name,
        'status': q.status or 'waiting'
    } for q in queue])

@doctor_bp.route('/appointments')
def get_appointments():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor_id = session['user_id']
    appointments = Appointment.query.filter_by(
        doctor_id=doctor_id
    ).all()
    
    return jsonify([{
        'id': a.id,
        'patient_id': a.patient_id,
        'patient_name': a.patient.name,
        'appointment_date': a.date.isoformat(),
        'appointment_time': a.time.isoformat(),
        'status': a.status
    } for a in appointments])

@doctor_bp.route('/patient-details/<int:patient_id>')
def get_patient_details(patient_id):
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    
    return jsonify({
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'phone': patient.phone,
        'address': patient.address,
        'department': patient.department
    })

@doctor_bp.route('/update-consultation/<int:consultation_id>', methods=['PUT'])
def update_consultation(consultation_id):
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    consultation = Consultation.query.get_or_404(consultation_id)
    
    # Only allow the doctor who created the consultation to edit it
    if consultation.doctor_id != session['user_id']:
        return jsonify({'error': 'You can only edit your own consultations'}), 403
    
    data = request.json
    consultation.symptoms = data.get('symptoms', consultation.symptoms)
    consultation.diagnosis = data.get('diagnosis', consultation.diagnosis)
    consultation.prescription = data.get('prescription', consultation.prescription)
    consultation.tests = data.get('exam_data', consultation.tests)
    consultation.notes = data.get('notes', consultation.notes)
    
    db.session.commit()
    return jsonify({'success': True, 'message': 'Consultation updated successfully'})

@doctor_bp.route('/doctor-info')
def get_doctor_info():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctor_id = session.get('user_id')
    doctor = User.query.get(doctor_id)
    
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    return jsonify({
        'id': doctor.id,
        'name': doctor.name,
        'department': doctor.department
    })

@doctor_bp.route('/change-password', methods=['POST'])
def change_password():
    if session.get('role') != 'doctor':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    user = User.query.get(session['user_id'])
    
    if not user.check_password(data['current_password']):
        return jsonify({'success': False, 'message': 'Current password incorrect'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'success': True})