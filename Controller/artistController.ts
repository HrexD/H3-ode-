const express = require('express');
const Artist = require('../models/artist');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, username, password, dateOfBirth } = req.body;

  // Vérifie si l'email ou le nom d'utilisateur existe déjà
  const emailExists = await Artist.exists({ email });
  const usernameExists = await Artist.exists({ username });

  if (emailExists || usernameExists) {
    return res.status(400).json({ message: 'Email ou nom d\'utilisateur déjà utilisé' });
  }

  // Création d'un nouvel artiste
  const artist = new Artist({
    email,
    username,
    password,
    dateOfBirth,
  });

  // Enregistrement de l'artiste dans la base de données
  try {
    const savedArtist = await artist.save();
    res.json(savedArtist);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'enregistrement de l\'artiste', error });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Vérification si l'email existe dans la base de données
    const artist = await Artist.findOne({ email: email });
    if (!artist) {
      return res.status(404).json({ message: 'L\'email ou le mot de passe est incorrect.' });
    }
    // Vérification du mot de passe
    const isMatch = password === artist.password;
    if (!isMatch) {
      return res.status(404).json({ message: 'L\'email ou le mot de passe est incorrect.' });
    }
    res.json({ artist });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
export { router as artistRegisterRouter };