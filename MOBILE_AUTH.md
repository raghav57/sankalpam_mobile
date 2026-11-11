# SANK-106 mobile authentication

AuthProvider wraps the Router stack. Home and Poojas remain public. Home's
Account / Sign in button opens the account screen; signin and signup also link
to each other and the public catalog. No dependencies were added; SecureStore
and its app.json config plugin were already installed/configured.

The token is saved only with expo-secure-store, with device-only iOS Keychain
access. On startup and return to foreground, /me validates the stored token.
Invalid sessions are cleared. Network failures retain the secure token and show
a retry on Account without treating the user as authenticated. Public browsing
is available during restoration. Signout waits for server revocation before
removing the local token; network failure reports an error and permits retry.
SecureStore failures are surfaced. There is no web token storage fallback.

## Run

Start the backend after its migration is approved and applied. In PowerShell,
set the backend address for this terminal only (replace the example LAN IP):

```powershell
cd D:\Ideas\HinduPoojaApp\sankalpam_mobile
$env:EXPO_PUBLIC_API_BASE_URL = 'http://192.168.1.10:3000'
npm start
```

Use a backend address reachable by the device, and allow port 3000 through the
local firewall. Release builds require HTTPS. Do not put credentials in this
public URL. Existing .env values are not modified by these commands.

Open the QR code with a compatible Expo Go on Android/iOS, or press `a` for an
installed Android emulator. `npm run android` starts Expo for Android;
`npm run ios` requires macOS with an iOS simulator. Windows can serve Expo to a
physical iPhone. Restart Metro after changing the public environment variable.

## Validate

```sh
npx tsc --noEmit
npm run lint
```

Both checks pass. Native and live backend checks could not be executed here;
the backend migration remains unapplied. After approval, verify on both platforms:

1. Browse Home and Poojas before signing in, including during session restoration.
2. Create a test account; check Account displays name/email. Duplicate signup and
   invalid credentials should show safe errors. Existing website password users
   should sign in without creating another User row.
3. Force-close and relaunch the app; Account should restore through SecureStore
   and /me. Repeat with a temporary network outage; retry should restore the
   session when the backend returns.
4. Sign out; Account should offer signin. Relaunch and confirm it stays signed out.
5. In an approved test environment, expire/revoke a test session; reopen the app
   and confirm /me rejects it and Account offers signin. Never log/copy tokens
   into reports or use production users for this test.
6. Test failed/offline signout: the app should show an error until revocation can
   succeed, then remove the SecureStore token.
