import secrets

# Generate a secure SECRET_KEY for JWT
secret_key = secrets.token_urlsafe(32)
print("\n" + "="*60)
print("Your SECRET_KEY for Vercel Environment Variables:")
print("="*60)
print(secret_key)
print("="*60)
print("\nCopy the above key and paste it in Vercel's SECRET_KEY environment variable")
print("\n")
