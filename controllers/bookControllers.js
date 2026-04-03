const axios = require("axios");

exports.searchBooks = async(req,res) =>{
  const query = req.query.q;
  if(!query){
    return res.json([]);
  }
  try{
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${query}`
    );
    const books = response.data.items?.map(item => {
      const info = item.volumeInfo;
      return {
        title: info.title || "",
        authors: info.authors || "",
        description: info.description || "",
        thumbnail: info.imageLinks?.thumbnail || "",
        publishedDate: info.publishedDate || "",
        id: item.id
      };
    }) || [];
    res.json(books);
  }catch(err){
    console.log("Google Api Error",err.message);
    res.status(500).json([]);
  }
};