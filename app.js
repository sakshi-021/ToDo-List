const express = require("express");
const bodyparser = require("body-parser");
const path= require("path");
// const gate=require(__dirname+"/date.js")
const mangoose= require("mongoose");
const _=require("lodash")


const app = express();
var publicDirectoryPath = path.join(__dirname,'public')
app.use(express.static(publicDirectoryPath))
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }))

const itemschema={
    name:String
};
const Item =mangoose.model("Item",itemschema);

 const item1=new Item({
    name:"Welcome to your To-Do list!!"
 })
 const item2=new Item({
    name:"Hit the + button to add a new item"
 })
 const item3=new Item({
    name:"<-- Hit this to delete the item"
 })
const defaualtArray=[item1,item2,item3];
const listschema={
    name:String,
    items:[itemschema]
}
const List=mangoose.model("List",listschema);

// mangoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false});
mangoose.connect("mongodb+srv://username:password@cluster0.3t4y6.mongodb.net/todoListDB",{useUnifiedTopology: true,useNewUrlParser: true,useFindAndModify: false})

let listitems=["today"];
let listtile=[];

app.get("/", function (req, res) {
    // var day=gate()
    List.find({},{name:1},function(err,listtitles){
        if(err){
            console.log("error");
        }else{
            console.log(listtitles);
            //
            listitems=listtitles.slice(1,listtitles.length)
            console.log(listitems);
        }
    })
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaualtArray,function(err){
                    if(err){
                        console.log("error!");
                    } else {
                     console.log("succesful");   
                    }
                res.redirect("/");
                });
        }else{
            listtile=foundItems;
        }
        res.render("index", { listTitle: "Today",newItem:listtile ,listItems:listitems});
    })

})


app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listname=req.body.list;
    const item =new Item({
        name:itemName
    });
    if(listname==="Today"){
        item.save();
         res.redirect("/");
    }else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listname)
        })
    }
    
})
app.post("/delete",function(req,res){
   
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName[0];
    console.log(listName);
     if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("removed succesfully!!")
                res.redirect("/");
            }
        })
    }else{
                List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
                    if(!err){
                        res.redirect("/"+ listName )
                    }
                })
    }       
})
       
    
        

app.get("/:paramname",function(req,res){
    const customlist=_.capitalize(req.params.paramname);
    
    List.findOne({name:customlist},function(err,foundlist){
        if(!err){
            if(!foundlist){
                //new list
                const list= new List({
                    name:customlist,
                    items:defaualtArray
                    })
                    list.save(function(err, result){

                        // res.redirect("/" + customlist);
                        setTimeout(function(){res.redirect('/' + customlist);},1);
                
                        });
                    // res.redirect("/"+customlist);
            }else{
                //old list
              
                res.render("index", { listTitle:foundlist.name,newItem:foundlist.items,listItems:listitems });

            }
        }
    })
});
    

app.listen(process.env.PORT , function () {
    console.log("server started a succesfully");
})