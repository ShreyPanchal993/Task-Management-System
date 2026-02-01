import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d"});
};

const roleDetermine = (adminInviteToken) => {
    let role = "member";
    if( adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
        role = "admin";
    };
    console.log("Determined Role:", role);
    return role;
};

export { generateToken, roleDetermine };