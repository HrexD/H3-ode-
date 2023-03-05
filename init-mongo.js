db.createUser(
    {
        user: "anon",
        pwd: "marbleCake",
        roles: [
            {
                role: "readWrite",
                db: "my_db"
            }
        ]
    }
);
db.createCollection("users");

db.users.insertOne({
    "name": "admin",
    "email": "admin@example.com",
    "password": {
        "salt": '19f7e5a4764f',
        // password = admin
        "password": 'df09bc7a6be1d13a7858f0771f66bcd54aa5f95c5b0eeb264f34a812dde70d9764976878821f8ce62d95b79da9555acc115d8eaa31482b78ca70ce464e6e6806'
    },
    "role": "admin",
    "registrationDate": new Date(),
    "updated_at": new Date()
});