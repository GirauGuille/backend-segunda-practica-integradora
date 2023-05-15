import { Router } from "express";
import UsersManager from "../Dao/ManagerMongo/UsersManagerMongo.js";
import passport from 'passport';

const router = Router();
const usersManager = new UsersManager();

// register with passport- sesion
router.post('/register', passport.authenticate('Register', {
    successRedirect: '/login',
    failureRedirect: '/errorRegister',
    passReqToCallback: true,
}));

router.post('/login', async (req, res) => {
    try {
        const user = req.body;
        const userLogged = await usersManager.loginUser(user);
        if (userLogged) {
            for (const key in user) {
                req.session[key] = user[key];
            }
            req.session.userId = userLogged._id;
            req.session.logged = true;
            if (userLogged.email === 'adminCoder@coder.com' && userLogged.password === 'adminCod3r123') {
                req.session.isAdmin = true;
            } else {
                req.session.isAdmin = false;
                req.session.role = 'user';
            }
            res.redirect('/products');
        } else {
            res.redirect('/errorLogin');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/login');
        }
    })
});

// Register with passport github strategy
router.get('/github', passport.authenticate('Github', { scope: ['user:email'] }));

// Login with passport github strategy
router.get('/github/callback', passport.authenticate('Github', {
    // successRedirect: '/products',
    failureRedirect: '/errorRegister',
}), (req, res) => {
    req.session.email = req.user.email;
    req.session.logged = true;
    req.session.userId = req.user._id;
    req.session.isAdmin = false;
    req.session.role = 'user';
    res.redirect('/products');
});


// Login with passport google strategy
router.get('/google',passport.authenticate('googleSignup', { scope: ['profile'] }))
router.get('/googleCallback',passport.authenticate('googleSignup'),(req,res)=>{
    res.send('logged with google')
})

router.get('/', async (req,res) => {
    const users = await usersManager.getAllUsers()
    res.json({ message: 'Users', users})
})

router.get ('/:idUser'), async (req, res) => {
    const {idUser} = req.params
    const user = await usersManager.getUserById(idUser)
    res.json({message:'User', user})
}

router.post('/', async (req, res)=>{
    const{password} = req.body
    const hashPassword = hashPassword (password)
    const newObj = {...req.body, password: hashPassword}
    const newUser = await usersManager.createUser(newObj)
    res.json({message:'User created', user: newUser})
})


export default router;