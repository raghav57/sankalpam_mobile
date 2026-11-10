# Sankalpam mobile

Expo SDK 58 / React Native / TypeScript, with Expo Router. The welcome screen opens `/poojas`, a read-only catalog backed by `GET /api/mobile/poojas`.

## Configure the backend address

1. Run `ipconfig` on the Windows laptop. Find the **IPv4 Address** under the active Wi-Fi adapter (not a VPN, virtual adapter, or default gateway).
2. Copy `.env.example` to `.env.local` in this mobile project:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Edit `.env.local`, replacing the placeholder:

   ```dotenv
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAPTOP_LAN_IP:3000
   ```

Use the backend origin only, without `/api` or `/api/mobile/poojas`. Do not use `localhost`, `127.0.0.1`, or `0.0.0.0` as the phone's host. `0.0.0.0` is a server listening address, not a destination. No LAN IP is committed to this project.

`EXPO_PUBLIC_` variables are visible in the app bundle. Never put database URLs, passwords, or other secrets in them. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/). `.env.local` is already ignored by Git. Restart Expo and fully reload Expo Go after changing this value.

## Start both development servers

Keep these running in separate PowerShell terminals.

Backend (uses the existing backend `.env` and Prisma connection):

```powershell
cd D:\Ideas\HinduPoojaApp\sankalpam
npm run dev -- --webpack --hostname 0.0.0.0 --port 3000
```

Webpack is used because Turbopack stalled during the earlier local API test. No backend configuration changes are required.

Mobile:

```powershell
cd D:\Ideas\HinduPoojaApp\sankalpam_mobile
npx expo start --lan
```

## Test on a physical iPhone

1. Connect the laptop and iPhone to the same Wi-Fi network.
2. In iPhone Safari, open `http://YOUR_LAPTOP_LAN_IP:3000/api/mobile/poojas`. Confirm it returns JSON with a `poojas` array. This checks phone-to-backend reachability independently of Expo.
3. Scan Expo's QR code using the iPhone Camera and open it in Expo Go. Allow local-network access if prompted.
4. Tap **Explore Poojas**. Confirm the catalog displays the real names, descriptions, durations in minutes, and prices in INR. Use the header back button or swipe back to return to the welcome screen.
5. Stop the backend, leave and reopen the catalog, and confirm an error and **Retry** appear (requests time out after 20 seconds). Restart the backend and tap **Retry** to recover.
6. The loading spinner appears during requests. A successful `{ "poojas": [] }` response shows the empty state with Retry; validate this using a mock response if needed, without deleting database data.

If Safari cannot reach the API, check the LAN IP, the backend terminal, Windows Firewall access for Node.js on the private network/port 3000, and Wi-Fi client isolation or VPN routing. If Safari works but Expo Go cannot connect, check Expo Go's iOS Local Network permission and reload the app. An Expo tunnel does not expose the backend API.

The catalog validates the JSON shape, handles HTTP/network/invalid-response errors, and cancels requests when leaving the screen. It never uses hardcoded pooja records or displays backend error bodies. No authentication, bookings, payments, or priest selection are included. Native mobile requests need no CORS changes; the separate Expo web preview is outside this LAN/iPhone setup.

## Checks

```powershell
npx tsc --noEmit
npx expo lint
```

Laptop HTTP checks and mocked API-client checks do not establish that the app works on a physical phone. Complete the steps above to verify the iPhone end to end.
