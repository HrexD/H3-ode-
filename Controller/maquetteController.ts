const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Maquette = require('../models/maquette');
const Manager = require('../models/manager');
const express = require('express');

const router = express.Router();

router.post('/maquettes', upload.single('maquette'), (req: Request, res: Response) => {
  const { title } = req.body;
  const artistId = req.user._id;
  const fileName = req.file.filename;

  const maquette = new Maquette({
    title,
    artistId,
    fileName
  });

  maquette.save((err, maquette) => {
    if (err) {
      return res.status(500).send(err);
    }

    return res.status(200).json(maquette);
  });
});

router.get('/maquettes', async (req: Request, res: Response) => {
    try {
      // Récupérer l'ID de l'artiste actuellement connecté depuis le JWT
      const artistId = req.user.id;
  
      // Récupérer toutes les maquettes soumises par l'artiste
      const maquettes = await Maquette.find({ artiste: artistId });
  
      res.json(maquettes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Une erreur est survenue' });
    }
  });



export default router;