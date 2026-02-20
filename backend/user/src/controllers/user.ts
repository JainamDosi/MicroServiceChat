import TryCatch from "../config/TryCatch.js";
import { redisClient } from '../index.js';
import { publishToQueue } from "../config/rabbitmq.js";
import { User } from "../models/user.js";
import { generateToken } from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";

export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;

    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later",
        });
        return;

    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpkey = `otp:${email}`;
    await redisClient.set(otpkey, otp, {
        EX: 300,
    });
    await redisClient.set(rateLimitKey, "1", {
        EX: 60,
    });

    const message = {
        to: email,
        subject: "OTP for login",
        body: `Your OTP is ${otp}`,
    };

    await publishToQueue("send-otp", message);
    res.status(200).json({
        success: true,
        message: "OTP sent successfully",
    });

});


export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "email or otp required"
        });
    }
    const otpkey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpkey);
    if (!storedOtp) {
        res.status(400).json({
            message: "OTP expired or invalid"
        });
        return;
    }
    if (storedOtp !== enteredOtp) {
        res.status(400).json({
            message: "Invalid OTP"
        });
        return;
    }
    await redisClient.del(otpkey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.split("@")[0];
        user = await User.create({ email, name });
    }
    const token = generateToken(user);
    res.status(200).json({
        success: true,
        user,
        token,
        message: "OTP verified successfully",
    });
});


export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});


export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) {
        res.status(400).json({
            message: "Please login",

        });
        return;
    }

    user.name = req.body.name;

    await user.save();

    const token = generateToken(user)

    res.json({
        message: "User Updated",
        user,
        token
    })


});


export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.find();

    res.status(200).json({
        success: true,
        user,
    });
});


export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        user,
    });
})