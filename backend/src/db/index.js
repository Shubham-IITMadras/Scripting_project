import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect("mongodb+srv://raomohit0168_db_user:mohit0168@cluster0.nbhm10k.mongodb.net/libraryDB")
        console.log(`Mongo DB Connected Succefully || Db Host : ${connectionInstance.connection.host}`)

    }catch(error){
        console.log("Mongo DB Connection failed ", error)
        process.exit(1);
    }
}

export default connectDB