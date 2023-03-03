// Import des modèles de données
import  Artist  from "../models/artist";
import  Manager from "../models/manager";
import  Approval  from "../models/approval";

// Import de la fonction de vérification du rôle
import { verifyRole } from "../middleware/verifyRole";

// Définition de la route
router.delete('/users/:id', verifyRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    // Vérification de l'existence de l'utilisateur
    const user = await Artist.findById(id) || await Manager.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Si l'utilisateur est un artiste, suppression de ses maquettes associées
    if (user instanceof Artist) {
      await Approval.deleteMany({ artist: id });
    }

    // Suppression de l'utilisateur
    await user.delete();

    return res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Une erreur est survenue lors de la suppression de l'utilisateur" });
  }
});

router.put('/artists/:id/ban', verifyRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    // Vérification de l'existence de l'artiste
    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: "Artiste non trouvé" });
    }

    // Bannissement de l'artiste
    artist.banned = true;
    await artist.save();

    return res.status(200).json({ message: "Artiste banni avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Une erreur est survenue lors du bannissement de l'artiste" });
  }
});