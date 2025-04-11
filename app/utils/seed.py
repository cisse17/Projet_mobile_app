from faker import Faker
import random
from sqlalchemy.orm import Session
from app.models import models
from app.utils.utils import hash_password
from app.database import get_db, engine
from datetime import datetime, timedelta
import pytz

fake = Faker(['fr_FR'])  # Utilisation du locale français

# Liste d'instruments de musique
INSTRUMENTS = [
    "Guitare", "Piano", "Batterie", "Basse", "Violon",
    "Saxophone", "Trompette", "Flûte", "Violoncelle", "Harmonica",
    "Synthétiseur", "Ukulélé", "Accordéon", "Harpe", "Clarinette"
]

# Liste de genres musicaux
GENRES = [
    "Rock", "Jazz", "Blues", "Classique", "Pop",
    "Hip-hop", "Rap", "Électro", "Folk", "Metal",
    "Reggae", "Soul", "Funk", "Country", "World Music"
]

# Liste de villes françaises
CITIES = [
    "Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse",
    "Nantes", "Strasbourg", "Lille", "Montpellier", "Rennes",
    "Nice", "Rouen", "Grenoble", "Dijon", "Angers"
]

# Liste de lieux d'événements
VENUES = [
    "Le Zénith", "L'Olympia", "La Cigale", "Le Trianon", "L'Élysée Montmartre",
    "Le New Morning", "Le Bataclan", "La Maroquinerie", "Le Point Ephémère",
    "Salle Pleyel", "L'Aéronef", "Le Bikini", "Le Krakatoa", "Le Chabada"
]

# Types d'événements
EVENT_TYPES = [
    "Concert", "Jam Session", "Master Class", "Festival", "Showcase",
    "Open Mic", "Concert Acoustique", "Session d'Improvisation"
]

def create_fake_user(db: Session) -> models.User:
    # Générer des données aléatoires
    first_name = fake.first_name()
    last_name = fake.last_name()
    username = f"{first_name.lower()}.{last_name.lower()}"
    email = f"{username}@{fake.domain_name()}"
    
    # Sélectionner des instruments aléatoires (1 à 3)
    num_instruments = random.randint(1, 3)
    instruments = ", ".join(random.sample(INSTRUMENTS, num_instruments))
    
    # Sélectionner des genres musicaux aléatoires (1 à 4) et les ajouter à la description
    num_genres = random.randint(1, 4)
    musical_genres = random.sample(GENRES, num_genres)
    
    # Créer une description réaliste
    experience_years = random.randint(1, 15)
    city = random.choice(CITIES)
    is_female = random.choice([True, False])
    gender_suffix = 'ne' if is_female else ''
    e_suffix = 'e' if is_female else ''
    
    description = f"Musicien{gender_suffix} passionné{e_suffix} avec {experience_years} ans d'expérience. "
    description += f"Basé{e_suffix} à {city}. "
    description += f"Styles musicaux : {', '.join(musical_genres)}. "
    description += fake.text(max_nb_chars=100)

    # Créer l'utilisateur
    user = models.User(
        username=username,
        email=email,
        password=hash_password("password123"),  # Mot de passe par défaut
        description=description,
        instruments_played=instruments
    )
    
    db.add(user)
    return user

def create_fake_event(db: Session, organizer_id: int) -> models.Event:
    # Générer une date future aléatoire (entre demain et dans 6 mois)
    future_date = datetime.now(pytz.UTC) + timedelta(
        days=random.randint(1, 180),
        hours=random.randint(0, 23),
        minutes=random.choice([0, 15, 30, 45])
    )
    
    # Choisir un type d'événement et un genre musical
    event_type = random.choice(EVENT_TYPES)
    music_genre = random.choice(GENRES)
    city = random.choice(CITIES)
    venue = random.choice(VENUES)
    
    # Créer le titre
    title = f"{event_type} {music_genre} - {venue} {city}"
    
    # Créer une description détaillée
    description = f"{event_type} de musique {music_genre} au {venue} de {city}. "
    description += fake.text(max_nb_chars=200)
    
    # Créer la localisation complète
    location = f"{venue}, {city}"
    
    # Créer l'événement
    event = models.Event(
        title=title,
        description=description,
        date=future_date,
        location=location,
        organizer_id=organizer_id
    )
    
    db.add(event)
    return event

def seed_database(num_users: int = 20, min_events_per_user: int = 1, max_events_per_user: int = 3):
    """Remplit la base de données avec des utilisateurs et événements factices"""
    print(f"Création de {num_users} utilisateurs factices...")
    
    # Créer les tables si elles n'existent pas
    models.Base.metadata.create_all(bind=engine)
    
    db = next(get_db())
    try:
        # Créer les utilisateurs
        users = []
        for i in range(num_users):
            user = create_fake_user(db)
            users.append(user)
            print(f"Utilisateur créé: {user.username} ({user.email})")
        
        # Commit pour avoir les IDs des utilisateurs
        db.commit()
        
        # Créer des événements pour chaque utilisateur
        total_events = 0
        for user in users:
            num_events = random.randint(min_events_per_user, max_events_per_user)
            for _ in range(num_events):
                event = create_fake_event(db, user.id)
                total_events += 1
                print(f"Événement créé: {event.title}")
        
        # Commit final
        db.commit()
        print(f"Base de données remplie avec succès! ({num_users} utilisateurs, {total_events} événements)")
        
    except Exception as e:
        print(f"Erreur lors du remplissage de la base de données: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 