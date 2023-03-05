import { Router } from 'express';
import { comparePassword } from '../Services/HashService';
import { User, removePassword } from '../models/User';
import { generateToken } from './AuthService';
import type LoginDTO from '../DTO/LoginDTO';
import { loginSchema } from '../DTO/LoginDTO';

const router = Router()

router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body)
  if (error != null) {
    return res.status(400).json({ error: error.message })
  }

  const loginDTO = req.body as LoginDTO

  const connectedUser = await User.findOne( {email: loginDTO.email, username: loginDTO.username} );
  if ((connectedUser == null) || !comparePassword(loginDTO.password, connectedUser?.password)) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const userWithToken = generateToken(connectedUser.toObject());
  const userWithoutPwd = removePassword(userWithToken);
  (req.session as any).user = userWithoutPwd;
  res.status(200).json(userWithoutPwd);
})
  
// Route pour se déconnecter
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: "Erreur de déconnexion" });
      }
      res.clearCookie("user");
      res.json({ message: "Vous êtes maintenant déconnecté" });
    });
});

export default router