import sys

from oauth2client import client

# Bearer Tokens from Gmail Actions will always be issued to this authorized party.
GMAIL_AUTHORIZED_PARTY = 'gmail@system.gserviceaccount.com'

# Intended audience of the token, based on the sender's domain
AUDIENCE = 'https://ewallet2.fly.dev/'

try:
    # Get this value from the request's Authorization HTTP header.
    # For example, for "Authorization: Bearer AbCdEf123456" use "AbCdEf123456"
    bearer_token = 'AbCdEf123456'

    # Verify valid token, signed by google.com, intended for a third party.
    token = client.verify_id_token(bearer_token, AUDIENCE)
    print('Token details: %s' % token)

    if token['azp'] != GMAIL_AUTHORIZED_PARTY:
        sys.exit('Invalid authorized party')
except:
    sys.exit('Invalid token')

# Token originates from Google and is targeted to a specific client.
print('The token is valid')
