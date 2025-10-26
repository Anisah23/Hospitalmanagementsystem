from flask import Blueprint, request, jsonify, session
from models import Patient, Appointment, Billing, Queue, User
from extensions import db
from datetime import datetime, date

receptionist_bp = Blueprint('receptionist', __name__)

@receptionist_bp.route('/dashboard-summary')
def dashboard_summary():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from datetime import timedelta
    
    # Get date parameters
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    # Default to today if no dates provided
    if not start_date or not end_date:
        today = datetime.now().date()
        start_date = end_date = today
    else:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    # Get patients registered in date range
    if start_date == end_date == date.today():
        patients_registered = Patient.query.filter(
            db.func.date(Patient.created_at) == date.today()
        ).count()
    else:
        patients_registered = Patient.query.filter(
            db.func.date(Patient.created_at) >= start_date,
            db.func.date(Patient.created_at) <= end_date
        ).count()
    
    # Debug: also get total patients for comparison
    total_patients = Patient.query.count()
    print(f"Total patients in system: {total_patients}")
    print(f"Patients registered for date range {start_date} to {end_date}: {patients_registered}")
    
    # Get appointments scheduled in date range
    if start_date == end_date == date.today():
        appointments_count = Appointment.query.filter(
            Appointment.date == date.today()
        ).count()
    else:
        appointments_count = Appointment.query.filter(
            Appointment.date >= start_date,
            Appointment.date <= end_date
        ).count()
    
    # Get current pending queue (all waiting patients regardless of date)
    pending_queue = Queue.query.filter_by(status='waiting').count()
    
    # Get today's billing records
    billing_records = db.session.query(
        Patient.name.label('patient'),
        Patient.department,
        Billing.amount,
        Billing.status
    ).join(Patient, Billing.patient_id == Patient.id).filter(
        db.func.date(Billing.created_at) == date.today()
    ).order_by(
        Billing.created_at.desc()
    ).all()
    
    billing_summary = [{
        'patient': record.patient,
        'department': record.department,
        'amount': float(record.amount),
        'status': record.status
    } for record in billing_records]
    
    return jsonify({
        'stats': {
            'patientsRegistered': patients_registered,
            'totalAppointments': appointments_count,
            'pendingQueue': pending_queue
        },
        'billingSummary': billing_summary
    })

@receptionist_bp.route('/dashboard')
def dashboard():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    today_patients = Patient.query.filter(Patient.created_at >= datetime.now().date()).count()
    pending_bills = Billing.query.filter_by(status='pending').count()
    
    queue_length = Queue.query.filter_by(status='waiting').count()
    
    return jsonify({
        'today_patients': today_patients,
        'pending_bills': pending_bills,
        'queue_length': queue_length
    })

@receptionist_bp.route('/register-patient', methods=['POST'])
def register_patient():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    patient = Patient(
        name=data['name'],
        age=data['age'],
        gender=data['gender'],
        phone=data['phone'],
        address=data.get('address'),
        department=data['department']
    )
    
    db.session.add(patient)
    db.session.commit()
    
    return jsonify({'success': True, 'patient_id': patient.id})

@receptionist_bp.route('/create-appointment', methods=['POST'])
def create_appointment():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # Find patient and doctor by name
    patient = Patient.query.filter_by(name=data['patientName']).first()
    doctor = User.query.filter_by(name=data['doctorName'], role='doctor').first()
    
    if not patient or not doctor:
        return jsonify({'error': 'Patient or Doctor not found'}), 400
    
    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time=datetime.strptime(data['time'], '%H:%M').time()
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({'success': True})

@receptionist_bp.route('/patients')
def get_patients():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Consultation
    patients = Patient.query.all()
    
    result = []
    for p in patients:
        last_consultation = Consultation.query.filter_by(patient_id=p.id)\
            .order_by(Consultation.created_at.desc()).first()
        
        result.append({
            'id': p.id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'phone': p.phone,
            'department': p.department,
            'created_at': p.created_at.isoformat(),
            'last_session': last_consultation.created_at.isoformat() if last_consultation else None
        })
    
    return jsonify(result)

@receptionist_bp.route('/billing')
def get_billing():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        from models import Consultation
        bills = db.session.query(Billing, Patient, User)\
            .join(Patient, Billing.patient_id == Patient.id)\
            .join(Consultation, Billing.consultation_id == Consultation.id)\
            .join(User, Consultation.doctor_id == User.id)\
            .order_by(Billing.created_at.desc()).all()
        
        return jsonify([{
            'id': record.Billing.id,
            'patient_name': record.Patient.name,
            'doctor_name': record.User.name,
            'amount': float(record.Billing.amount),
            'status': record.Billing.status,
            'payment_method': record.Billing.payment_method,
            'created_at': record.Billing.created_at.isoformat()
        } for record in bills])
    except Exception as e:
        # Fallback to simple billing query if consultation join fails
        bills = Billing.query.order_by(Billing.created_at.desc()).all()
        return jsonify([{
            'id': bill.id,
            'patient_name': bill.patient.name,
            'doctor_name': 'Unknown',
            'amount': float(bill.amount),
            'status': bill.status,
            'payment_method': bill.payment_method,
            'created_at': bill.created_at.isoformat()
        } for bill in bills])

@receptionist_bp.route('/mark-paid/<int:bill_id>', methods=['POST'])
def mark_paid(bill_id):
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    bill = Billing.query.get_or_404(bill_id)
    bill.status = 'paid'
    bill.payment_method = data.get('payment_method', 'cash')
    
    db.session.commit()
    return jsonify({'success': True})

@receptionist_bp.route('/doctors/<department>')
def get_doctors_by_department(department):
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctors = User.query.filter_by(role='doctor', department=department).all()
    return jsonify([{
        'id': d.id,
        'name': d.name
    } for d in doctors])

@receptionist_bp.route('/appointments')
def get_appointments():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    appointments = Appointment.query.all()
    return jsonify([{
        'id': a.id,
        'patient_name': a.patient.name,
        'doctor_name': a.doctor.name,
        'department': a.patient.department,
        'appointment_date': a.date.isoformat(),
        'appointment_time': a.time.isoformat(),
        'status': a.status
    } for a in appointments])

@receptionist_bp.route('/queue')
def get_queue():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Queue
    queue = Queue.query.order_by(Queue.created_at).all()
    result = []
    for q in queue:
        if q.patient and q.doctor:
            result.append({
                'id': q.id,
                'patient_name': q.patient.name,
                'doctor_name': q.doctor.name,
                'department': q.doctor.department if q.doctor.department else q.patient.department,
                'status': q.status
            })
    return jsonify(result)

@receptionist_bp.route('/add-to-queue', methods=['POST'])
def add_to_queue():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    from models import Queue
    
    # Find patient and doctor by name
    patient = Patient.query.filter_by(name=data['patientName']).first()
    doctor = User.query.filter_by(name=data['doctorName'], role='doctor').first()
    
    if not patient or not doctor:
        return jsonify({'error': 'Patient or Doctor not found'}), 400
    
    queue_entry = Queue(
        patient_id=patient.id,
        doctor_id=doctor.id,
        priority=0,
        status='waiting'
    )
    
    db.session.add(queue_entry)
    db.session.commit()
    
    return jsonify({'success': True})

@receptionist_bp.route('/patient-names')
def get_patient_names():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patients = Patient.query.all()
    return jsonify([p.name for p in patients])

@receptionist_bp.route('/patient-details/<int:patient_id>')
def get_patient_details(patient_id):
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Consultation
    patient = Patient.query.get_or_404(patient_id)
    bills = Billing.query.filter_by(patient_id=patient_id).all()
    
    # Get last consultation date
    last_consultation = Consultation.query.filter_by(patient_id=patient_id)\
        .order_by(Consultation.created_at.desc()).first()
    
    return jsonify({
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'phone': patient.phone,
        'address': patient.address,
        'department': patient.department,
        'last_session': last_consultation.created_at.isoformat() if last_consultation else None,
        'bills': [{
            'amount': float(bill.amount),
            'status': bill.status,
            'created_at': bill.created_at.isoformat()
        } for bill in bills]
    })

@receptionist_bp.route('/doctor-names')
def get_doctor_names():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    doctors = User.query.filter_by(role='doctor').all()
    return jsonify([d.name for d in doctors])

@receptionist_bp.route('/all-billing')
def get_all_billing():
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Consultation
    bills = db.session.query(Billing, Patient, User)\
        .join(Patient, Billing.patient_id == Patient.id)\
        .join(Consultation, Billing.consultation_id == Consultation.id)\
        .join(User, Consultation.doctor_id == User.id)\
        .order_by(Billing.created_at.desc()).all()
    
    return jsonify([{
        'id': record.Billing.id,
        'patient_name': record.Patient.name,
        'doctor_name': record.User.name,
        'amount': float(record.Billing.amount),
        'status': record.Billing.status,
        'payment_method': record.Billing.payment_method,
        'created_at': record.Billing.created_at.isoformat()
    } for record in bills])

@receptionist_bp.route('/remove-from-queue/<int:queue_id>', methods=['DELETE'])
def remove_from_queue(queue_id):
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from models import Queue
    queue_entry = Queue.query.get_or_404(queue_id)
    db.session.delete(queue_entry)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Patient removed from queue'})

@receptionist_bp.route('/cancel-appointment/<int:appointment_id>', methods=['DELETE'])
def cancel_appointment(appointment_id):
    if session.get('role') != 'receptionist':
        return jsonify({'error': 'Unauthorized'}), 403
    
    appointment = Appointment.query.get_or_404(appointment_id)
    db.session.delete(appointment)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Appointment cancelled'})