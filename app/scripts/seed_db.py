import sys
import os

# Ajouter le répertoire parent au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.utils.seed import seed_database

if __name__ == "__main__":
    try:
        num_users = int(sys.argv[1]) if len(sys.argv) > 1 else 20
        seed_database(num_users)
    except ValueError:
        print("Erreur: Le nombre d'utilisateurs doit être un entier")
    except Exception as e:
        print(f"Erreur lors du seeding: {str(e)}") 