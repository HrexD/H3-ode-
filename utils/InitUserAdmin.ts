import { User } from "../Models/User";

// create a default admin user
const adminUser = {
  name: 'admin',
  email: 'admin@example.com',
  password: 'adminMDP',
  role: 'admin'
};

// create the user in the database
User.create(adminUser)
  .then(user => {
    console.log('Default admin user created successfully!');
  })
  .catch(err => {
    console.error('Error creating default admin user:', err);
  });