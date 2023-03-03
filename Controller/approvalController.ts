const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Maquette = require('../models/maquette');
const Manager = require('../models/manager');
const express = require('express');

const router = express.Router();

router.post('/maquettes/:maquetteId/approbation', async (req, res) => {
  const { commentaire, approbation } = req.body;
  const maquetteId = req.params.maquetteId;

  try {
    const manager = await Manager.findById(req.user.id);
    const maquette = await Maquette.findById(maquetteId);

    if (!manager) {
      return res.status(401).json({ message: 'Manager not found' });
    }

    if (!maquette) {
      return res.status(404).json({ message: 'Maquette not found' });
    }

    const approbationObj = { approbation, commentaire, manager: manager.id };
    maquette.approbations.push(approbationObj);
    await maquette.save();

    res.status(200).json({ message: 'Approvation saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/maquettes/:maquetteId/approbations', async (req, res) => {
    const maquetteId = req.params.maquetteId;
  
    try {
      const maquette = await Maquette.findById(maquetteId).populate({
        path: 'approbations',
        populate: {
          path: 'manager',
          select: 'email pseudo',
        },
      });
  
      if (!maquette) {
        return res.status(404).json({ message: 'Maquette not found' });
      }
  
      res.status(200).json({ approbations: maquette.approbations });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
