import { usersModel } from "../../db/models/users.model.js";
import { hashPassword, comparePassword } from "../../utils/bcrypt.js";

export default class UsersManager {
    async loginUser(user) {
        try {
            const { email, password } = user;
            const userLogged = await usersModel.findOne({ email }).populate('carts');
            if (!userLogged) {
                return false;
            } else {
                const isMatch = await comparePassword(password, userLogged.password);
                if (isMatch) {
                    return userLogged;
                } else {
                    return false;
                }
            }
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    async getAllUsers() {
        try {
            const users = await usersModel
                .findById()
                .populate('carts')
            return users;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    async getUserById(id) {
        try {
            const user = await usersModel
                .findById(id)
                .populate('carts')
            return user;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    async createUser(objUser) {
        try {
            const newUser = await usersModel.create(objUser)
            return newUser
        } catch (error) {
            console.log(error);
        }
    }

    async updateUser(idUser, obj) {
        try {
            const response = usersModel.updateOne({ id: idUser }, { $set: obj })
            return response
        } catch (error) {
            console.log(error);
        }
    }

    async deletUser(idUser) {
        try {
            const response = await usersModel.deleteOne({ id: idUser })
            return response
        } catch (error) {
            console.log(error);
        }
    }

}