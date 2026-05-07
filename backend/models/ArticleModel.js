import {Schema,model,Types} from 'mongoose'

//Create Comment Schema
const commentSchema=new Schema({
    user:{
        type: Types.ObjectId,
        ref:"user",
        required:[true,"User ID Required"]
    },
    comment:{
        type:String,
        required:[true,"Enter Comment"]
    },
},
{
    versionKey:false,
    timestamps:true,
    strict:"throw"
});

//Create Article Schema
const articleSchema=new Schema({
    author:{
        type:Types.ObjectId,
        ref:"user",
        required:[true,"Author ID is Required"]
    },
    title:{
        type:String,
        required:[true,"Title is Required"]
    },
    category:{
        type:String,
        required:[true,"Category is required"],

    },
    content:{
        type: String,
        required: [true,"Content is required"]
    },
    comments:[{type: commentSchema,default:[]}]
    ,
    isArticleActive:{
        type:Boolean,
        default:true
    }
},{
    versionKey:false,
    timestamps:true,
    strict:"throw"
})

//Create Article Model
export const ArticleModel=model("article",articleSchema)