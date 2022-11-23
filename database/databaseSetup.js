import sqlite3 from 'sqlite3';

const crypto = await import("node:crypto");
const AP_count = 2;
let db = new sqlite3.Database('Emergency-Net-DB.db', (err)=>{
    if(err){
        return console.error(err.message);
    }
    console.log('An empty database is generated.');
});

db.run(`CREATE TABLE public_keys (mac_id text PRIMARY KEY,
                                public_key text NOT NULL);`);




for(let i = 0; i<AP_count; i++){
    await crypto.generateKeyPair('rsa',{
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: 'top secret'
        }
      }, (err, publicKey, privateKey) => { // Callback function
             if(!err)
             {
                let mac = "mac_".concat(i);
                console.log(mac);
               db.run(`INSERT INTO public_keys (mac_id, public_key) VALUES (?, ?);`, mac, publicKey);
             }
             else
             {
               // Prints error
               console.log("Errr is: ", err);
             }
               
        });

};


