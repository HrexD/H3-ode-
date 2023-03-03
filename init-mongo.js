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