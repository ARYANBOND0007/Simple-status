import jwt from "jsonwebtoken";
import * as authService from "../services/auth.service.js";

export const  signup = (req,res,next) => {
    try{

        const {email,password,fullname} = req.body;
         
        const {user,organization} = await authService.registerUserWithOrganization(email,password,fullname)

        const token = jwt.sign(
            {sub : user.id , email : user.email},
            process.env.JWT_SECRET,
            {expiresIn : "7d"}
        );

        res.cookie("token" , token ,{
            httpOnly : true,
            secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(201).json({
            message: "Account created successfully",
      user: { id: user.id, email: user.email, fullName: user.fullName },
      organization: { id: organization.id, name: organization.name, slug: organization.slug }
        });
    }  
    catch(error){
        next(error);
    }


};