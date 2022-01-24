import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
    Name: String,
    message: String,
    product: String,
    receiver: Boolean
});

export default mongoose.model("messagecontents", whatsappSchema);