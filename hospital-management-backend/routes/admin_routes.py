from flask import Blueprint, request, jsonify, session
from models import User, Patient, Appointment, Consultation, Billing, VitalSigns, Queue
from extensions import db
from datetime import datetime, date

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard-summary')
def dashboard_summary():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    from datetime import timedelta
    
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
    
    # Get statistics
    total_doctors = User.query.filter_by(role='doctor').count()
    total_receptionists = User.query.filter_by(role='receptionist').count()
    total_patients = Patient.query.count()
    
    # Calculate revenue for date range
    revenue = db.session.query(db.func.sum(Billing.amount)).filter(
        db.func.date(Billing.created_at) >= start_date,
        db.func.date(Billing.created_at) <= end_date,
        Billing.status == 'paid'
    ).scalar() or 0
    
    # Get patient flow data with real-time statistics (last 7 days from today)
    patient_flow = []
    today = date.today()
    
    for i in range(7):
        flow_date = today - timedelta(days=6-i)
        
        # Count new patient registrations for this specific date
        new_patients = Patient.query.filter(
            db.func.date(Patient.created_at) == flow_date
        ).count()
        
        # Count appointments scheduled for this date
        appointments = Appointment.query.filter(
            Appointment.date == flow_date
        ).count()
        
        # Count consultations completed on this date
        consultations = Consultation.query.filter(
            db.func.date(Consultation.created_at) == flow_date
        ).count()
        
        # Total patient activity for the day
        total_activity = new_patients + appointments + consultations
        
        patient_flow.append({
            'day': flow_date.strftime('%a'),
            'patients': total_activity
        })
    
    # Get recent appointments (last 5 appointments)
    recent_appointments = db.session.query(Appointment, Patient, User)\
        .join(Patient, Appointment.patient_id == Patient.id)\
        .join(User, Appointment.doctor_id == User.id)\
        .order_by(Appointment.created_at.desc())\
        .limit(5)\
        .all()

    recentAppointments = [{
        'id': apt.Appointment.id,
        'patient_name': apt.Patient.name,
        'doctor_name': apt.User.name,
        'department': apt.User.department,
        'date': apt.Appointment.date.isoformat(),
        'time': apt.Appointment.time.isoformat(),
        'status': apt.Appointment.status
    } for apt in recent_appointments]

    return jsonify({
        'stats': {
            'totalDoctors': total_doctors,
            'receptionists': total_receptionists,
            'totalPatients': total_patients,
            'todayRevenue': int(revenue)
        },
        'patientFlow': patient_flow,
        'recentAppointments': recentAppointments
    })

@admin_bp.route('/hospital-overview')
def hospital_overview():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get comprehensive hospital statistics
    total_doctors = User.query.filter_by(role='doctor').count()
    total_receptionists = User.query.filter_by(role='receptionist').count()
    total_patients = Patient.query.count()
    total_appointments = Appointment.query.count()
    
    # Department-wise patient count
    dept_stats = db.session.query(
        Patient.department,
        db.func.count(Patient.id).label('count')
    ).group_by(Patient.department).all()
    
    return jsonify({
        'totalStaff': total_doctors + total_receptionists,
        'totalDoctors': total_doctors,
        'totalReceptionists': total_receptionists,
        'totalPatients': total_patients,
        'totalAppointments': total_appointments,
        'departmentStats': [{
            'department': dept.department,
            'patientCount': dept.count
        } for dept in dept_stats]
    })

@admin_bp.route('/all-staff')
def get_all_staff():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    staff = User.query.filter(
        User.role.in_(['doctor', 'receptionist'])
    ).all()

    return jsonify([{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'department': user.department or 'N/A',
        'schedule': getattr(user, 'schedule', None)
    } for user in staff])

@admin_bp.route('/register-doctor', methods=['POST', 'OPTIONS'])
def register_doctor():
    if request.method == 'OPTIONS':
        return '', 200
        
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        data = request.json
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            role='doctor',
            department=data['department'],
            is_active=True
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Doctor registered successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/register-receptionist', methods=['POST'])
def register_receptionist():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        role='receptionist',
        department='reception',
        is_active=True
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Receptionist registered successfully'})

@admin_bp.route('/add-staff', methods=['POST'])
def add_staff():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400
    
    # Set department for receptionist role
    department = data.get('department')
    if data['role'] == 'receptionist':
        department = 'reception'
    
    user = User(
        name=data['name'],
        email=data['email'],
        role=data['role'],
        department=department
    )
    user.set_password(data['password'])  # Use admin-provided password
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Staff member added successfully'})

@admin_bp.route('/patient-details/<int:patient_id>')
def get_patient_details(patient_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    bills = Billing.query.filter_by(patient_id=patient_id).all()
    
    return jsonify({
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'phone': patient.phone,
        'address': patient.address,
        'department': patient.department,
        'bills': [{
            'amount': float(bill.amount),
            'status': bill.status,
            'created_at': bill.created_at.isoformat()
        } for bill in bills]
    })

@admin_bp.route('/all-patients')
def get_all_patients():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patients = Patient.query.all()
    
    return jsonify([{
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'phone': patient.phone,
        'department': patient.department,
        'created_at': patient.created_at.isoformat()
    } for patient in patients])

@admin_bp.route('/appointments')
def get_all_appointments():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    appointments = db.session.query(Appointment, Patient, User)\
        .join(Patient, Appointment.patient_id == Patient.id)\
        .join(User, Appointment.doctor_id == User.id)\
        .all()
    
    return jsonify([{
        'id': apt.Appointment.id,
        'patient_name': apt.Patient.name,
        'doctor_name': apt.User.name,
        'department': apt.User.department,
        'date': apt.Appointment.date.isoformat(),
        'time': apt.Appointment.time.isoformat(),
        'status': apt.Appointment.status
    } for apt in appointments])

@admin_bp.route('/billing-overview')
def billing_overview():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    billing_records = db.session.query(Billing, Patient, User)\
        .join(Patient, Billing.patient_id == Patient.id)\
        .join(Consultation, Billing.consultation_id == Consultation.id)\
        .join(User, Consultation.doctor_id == User.id)\
        .all()
    
    return jsonify([{
        'id': record.Billing.id,
        'patient_name': record.Patient.name,
        'doctor_name': record.User.name,
        'department': record.User.department,
        'amount': float(record.Billing.amount),
        'status': record.Billing.status,
        'payment_method': record.Billing.payment_method,
        'created_at': record.Billing.created_at.isoformat()
    } for record in billing_records])



@admin_bp.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role == 'admin':
            return jsonify({'error': 'Cannot delete admin user'}), 400

        # Check for related records that would prevent deletion
        # Delete related appointments
        Appointment.query.filter_by(doctor_id=user_id).delete()

        # Delete related consultations and their billing
        consultations = Consultation.query.filter_by(doctor_id=user_id).all()
        for consultation in consultations:
            # Delete billing records for this consultation
            Billing.query.filter_by(consultation_id=consultation.id).delete()
            # Delete the consultation itself
            db.session.delete(consultation)

        # Delete related vital signs records
        VitalSigns.query.filter_by(recorded_by=user_id).delete()

        # Delete related queue entries
        Queue.query.filter_by(doctor_id=user_id).delete()

        # Finally delete the user
        db.session.delete(user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'User deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete user: {str(e)}'}), 500

@admin_bp.route('/update-user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.json
    
    user.name = data['name']
    user.email = data['email']
    user.department = data.get('department')
    if 'schedule' in data:
        user.schedule = data['schedule']

    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()

    
    return jsonify({'success': True, 'message': 'User updated successfully'})

@admin_bp.route('/update-patient/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    patient.name = data['name']
    patient.age = data['age']
    patient.gender = data['gender']
    patient.phone = data['phone']
    patient.department = data['department']
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Patient updated successfully'})

@admin_bp.route('/delete-consultation/<int:consultation_id>', methods=['DELETE'])
def delete_consultation(consultation_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    consultation = Consultation.query.get_or_404(consultation_id)
    
    # Delete related billing records first
    Billing.query.filter_by(consultation_id=consultation_id).delete()
    
    db.session.delete(consultation)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Consultation deleted successfully'})

@admin_bp.route('/delete-patient/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    
    # Delete related records first
    VitalSigns.query.filter_by(patient_id=patient_id).delete()
    Appointment.query.filter_by(patient_id=patient_id).delete()
    Queue.query.filter_by(patient_id=patient_id).delete()
    
    # Delete consultations and billing
    consultations = Consultation.query.filter_by(patient_id=patient_id).all()
    for consultation in consultations:
        Billing.query.filter_by(consultation_id=consultation.id).delete()
    Consultation.query.filter_by(patient_id=patient_id).delete()
    
    db.session.delete(patient)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Patient deleted successfully'})

