import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { usersModel } from "../db/models/users.model.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";

// configurar passport para usar una estrategia local (para logear usuarios con email y contraseña)
passport.use(
    "local",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email, password, done) => {
            const user = await usersModel.findOne({ email });
            if (!user) {
                return done(null, false, { message: "Incorrect email" });
            }
            if (!(await comparePassword(password, user.password))) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        }
    )
);

// configurar passport para usar una estrategia local (para autenticar usuarios con email y contraseña)
passport.use(
    "Register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            const user = await usersModel.findOne({ email });
            if (user) {
                return done(null, false, {
                    message: "Email already registered",
                });
            }
            const newUser = new usersModel({
                email,
                password: await hashPassword(password),
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                age: req.body.age,
            });
            await newUser.save();
            return done(null, newUser);
        }
    )
);

//passport google outh
passport.use(
    'googleSignup',
    new GoogleStrategy({
        clientID: '483775154318-omsdp7r63j0d0e6cgt3nom7dorulell0.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:8080/users/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        done(null, false)
    })
);



//paspot github
passport.use(
    "Github",
    new GithubStrategy({
            clientID: "Iv1.177093801811a958",
            clientSecret: "a88c5766772af144422aba3929fb32c378f142d4",
            callbackURL: "http://localhost:8080/api/users/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await usersModel.findOne({ email: profile._json.email });
            if (user) {
                return done(null, user);
            }
            const newUser = new usersModel({
                email: profile._json.email,
                password: ' ',
                first_name: profile._json.name.split(' ')[0],
                last_name: profile._json.name.split(' ')[1] || ' ',
                age: 0,
            });
            await newUser.save();
            return done(null, newUser);
        }
    )
);

// Secret key
const secret = "EOsecretkey";
const { fromExtractors, fromAuthHeaderAsBearerToken } = ExtractJwt

// configurar passport para usar una estrategia con JWT (para autenticar usuarios con JWT)
passport.use(
    "current",
    new JWTStrategy(
        {
            jwtFromRequest: fromExtractors([(req) => req.cookies.token, fromAuthHeaderAsBearerToken()]),
            // jwtFromRequest: (req) => req.cookies.token,
            // jwtFromRequest: ExtractJwt.fromExtractors([
            //     ExtractJwt.fromAuthHeaderAsBearerToken(),
            //     ExtractJwt.fromUrlQueryParameter("token"),
            //     ExtractJwt.fromBodyField("token"),
            // ]),
            // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        },
        async (jwtPayload, done) => {
            try {
                const user = await usersModel.findById(jwtPayload.id);
                console.log(user);
                console.log(jwtPayload);
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {

                return done(error, false);
            }
        }
    )
)

// serializar el usuario para almacenarlo en la sesión
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// deserializar el usuario para obtenerlo de la sesión
passport.deserializeUser(async (id, done) => {
    const user = await usersModel.findById(id);
    done(null, user);
});