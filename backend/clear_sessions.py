from app.database import engine
from sqlalchemy import text

def clear_embeddings():
    print("Clearing all embeddings and sessions...")
    with engine.connect() as conn:
        try:
            # Delete all rows from the embedding table
            conn.execute(text("TRUNCATE TABLE langchain_pg_embedding"))
            conn.commit()
            print("Successfully cleared all embeddings.")
        except Exception as e:
            print(f"Error clearing table: {e}")
            # Fallback if table doesn't exist or other error
            try:
                conn.execute(text("DELETE FROM langchain_pg_embedding"))
                conn.commit()
                print("Deleted rows via DELETE.")
            except Exception as e2:
                print(f"Delete failed: {e2}")

if __name__ == "__main__":
    clear_embeddings()
