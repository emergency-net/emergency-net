
## Initialization Instructions

### Prerequisites
- Ensure you have Node.js version 21.2.0 installed.
- Ensure `pnpm` package manager is installed.

### Repository Setup
1. **Clone the Repository:**
   ``
git clone https://github.com/emergency-net/emergency-net.git
  ``

3. **Frontend Setup:**
- Navigate to the frontend directory:
  ``
  cd ./frontend
  ``
- Install dependencies:
  ``
  pnpm i
  ``

4. **Backend Setup:**
- Navigate to the backend directory:
  ``
  cd ../backend
  ``
- Install dependencies:
  ``
  pnpm i
  ``
 - add .env file to backend directory, example:
	```
	PUBLIC_KEY_PATH=./bin/keys/apPublicKey.pem
	PRIVATE_KEY_PATH=./bin/keys/apPrivateKey.pem
	ADMIN_PUBLIC_KEY_PATH=./bin/keys/adminPublicKey.pem
	ADMIN_PRIVATE_KEY_PATH=./bin/keys/adminPrivateKey.pem
	CERT_PATH=./bin/keys/cert.txt
	PU_PATH=./PU
	AP_ID=ortabayir
	PORT=3000
	```
### Key Generation
1. **Generate Admin Keys:**
``
pnpm genadmin
``

- **Important:** Remove the admin private key from `/bin/keys` and securely store it in a different location.

2. **Generate AP Keys:**
	  ``
	pnpm genkeys
	  ``


4. **Generate AP Certificate:**
	``
	pnpm gencert
	``


## Development

- **Start the Backend:**
  `pnpm dev`

- **Navigate to Frontend and Start It:**
  - Change to the frontend directory:
    `cd ./frontend`
  - Start the frontend:
    `pnpm dev`

- **Access the Project:**
  - Open a web browser and go to:
    `localhost:3001` to view the project.



## Production

- **Build the Frontend Code:**
  `pnpm build`

- **Go to Backend and Copy `dist` with this Script:**
  `pnpm copy-dist`

- **Run the Code:**
  `pnpm start`

- **Start a Caddy Server (or another one you prefer):**
`caddy start`

  - Keep in mind that the WebCrypto API requires a secure context (HTTPS).
