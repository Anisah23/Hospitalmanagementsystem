from app import create_app
from extensions import db
from models import User

app = create_app()  # <- Flask CLI sees this

# Optional: code to create default admin only runs when script is executed directly
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin if it doesn't exist
        if not User.query.filter_by(email='admin@hospital.com').first():
            admin = User(
                name='System Administrator',
                email='admin@hospital.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
    
    app.run(debug=True)
