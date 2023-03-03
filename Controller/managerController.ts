import express from 'express';
import { checkJwt, checkRole } from '../middlewares/auth';
import Manager from '../models/manager';
import Maquette from '../models/maquette';

const router = express.Router();

// Ajouter un nouveau manager
router.post('/', [checkJwt, checkRole(['admin'])], async (req, res) => {
  try {
    const { email } = req.body;
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists' });
    }
    const newManager = new Manager({ email });
    await newManager.save();
    res.json(newManager);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Supprimer un manager
router.delete('/:id', [checkJwt, checkRole(['admin'])], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedManager = await Manager.findByIdAndDelete(id);
    if (!deletedManager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.json(deletedManager);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Obtenir toutes les maquettes soumises
router.get('/maquettes', [checkJwt, checkRole(['manager'])], async (req: Request, res: Response) => {
  try {
    const maquettes = await Maquette.find({});
    res.json(maquettes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;