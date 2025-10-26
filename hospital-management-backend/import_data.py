import json
import os
from datetime import datetime
from models import db, User, Patient, Appointment, Consultation, Billing, VitalSigns, Queue
from extensions import create_app

def import_data():
    app = create_app()

    with app.app_context():
        # Load exported data
        with open('sqlite_data_export.json', 'r') as f:
            data = json.load(f)

        print("Starting data import...")

        # Import users
        for user_data in data['user']:
            # Convert boolean fields
            user_data['is_active'] = bool(user_data.get('is_active', True))

            # Remove fields that don't exist in the model anymore
            user_data.pop('status', None)

            # Convert datetime strings back to datetime objects
            if 'created_at' in user_data and user_data['created_at']:
                try:
                    user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
                except:
                    user_data['created_at'] = datetime.utcnow()

            user = User(**user_data)
            db.session.add(user)

        # Import patients
        for patient_data in data['patient']:
            if 'created_at' in patient_data and patient_data['created_at']:
                try:
                    patient_data['created_at'] = datetime.fromisoformat(patient_data['created_at'])
                except:
                    patient_data['created_at'] = datetime.utcnow()

            patient = Patient(**patient_data)
            db.session.add(patient)

        # Import appointments
        for apt_data in data['appointment']:
            if 'date' in apt_data and apt_data['date']:
                apt_data['date'] = datetime.strptime(apt_data['date'], '%Y-%m-%d').date()
            if 'time' in apt_data and apt_data['time']:
                apt_data['time'] = datetime.strptime(apt_data['time'], '%H:%M:%S').time()
            if 'created_at' in apt_data and apt_data['created_at']:
                try:
                    apt_data['created_at'] = datetime.fromisoformat(apt_data['created_at'])
                except:
                    apt_data['created_at'] = datetime.utcnow()

            appointment = Appointment(**apt_data)
            db.session.add(appointment)

        # Import consultations
        for cons_data in data['consultation']:
            if 'created_at' in cons_data and cons_data['created_at']:
                try:
                    cons_data['created_at'] = datetime.fromisoformat(cons_data['created_at'])
                except:
                    cons_data['created_at'] = datetime.utcnow()

            consultation = Consultation(**cons_data)
            db.session.add(consultation)

        # Import billing
        for bill_data in data['billing']:
            if 'created_at' in bill_data and bill_data['created_at']:
                try:
                    bill_data['created_at'] = datetime.fromisoformat(bill_data['created_at'])
                except:
                    bill_data['created_at'] = datetime.utcnow()

            billing = Billing(**bill_data)
            db.session.add(billing)

        # Import vital signs
        for vitals_data in data['vital_signs']:
            if 'created_at' in vitals_data and vitals_data['created_at']:
                try:
                    vitals_data['created_at'] = datetime.fromisoformat(vitals_data['created_at'])
                except:
                    vitals_data['created_at'] = datetime.utcnow()

            # Handle blood_pressure field (was changed from separate systolic/diastolic)
            if 'blood_pressure_systolic' in vitals_data:
                vitals_data.pop('blood_pressure_systolic', None)
            if 'blood_pressure_diastolic' in vitals_data:
                vitals_data.pop('blood_pressure_diastolic', None)

            vitals = VitalSigns(**vitals_data)
            db.session.add(vitals)

        # Import queue
        for queue_data in data['queue']:
            if 'created_at' in queue_data and queue_data['created_at']:
                try:
                    queue_data['created_at'] = datetime.fromisoformat(queue_data['created_at'])
                except:
                    queue_data['created_at'] = datetime.utcnow()

            queue = Queue(**queue_data)
            db.session.add(queue)

        # Commit all changes
        db.session.commit()
        print("Data import completed successfully!")

        # Print summary
        print(f"Imported {len(data['user'])} users")
        print(f"Imported {len(data['patient'])} patients")
        print(f"Imported {len(data['appointment'])} appointments")
        print(f"Imported {len(data['consultation'])} consultations")
        print(f"Imported {len(data['billing'])} billing records")
        print(f"Imported {len(data['vital_signs'])} vital signs records")
        print(f"Imported {len(data['queue'])} queue records")

if __name__ == '__main__':
    import_data()