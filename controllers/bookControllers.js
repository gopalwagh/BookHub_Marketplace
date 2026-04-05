const axios = require("axios");
require("dotenv").config();

exports.searchBooks = async(req,res) =>{
  const query = req.query.q;
  if(!query){
    return res.json([]);
  }
  try{
    console.log("first api checked")
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.GOOGLE_API_KEY}`
    );
    console.log("second api check")
    const books = response.data.items?.map(item => {
      const info = item.volumeInfo;
      return {
        title: info.title || "",
        authors: info.authors || "",
        description: info.description || "",
        thumbnail: info.imageLinks?.thumbnail || "",
        publishedDate: info.publishedDate || "",
        id: item.id,
        categories: info.categories || "fill by own"
      };
    }) || [];
    res.json(books);
  }catch(err){
    console.log("Google Api Error",err.message);
    res.status(500).json([]);
  }
};