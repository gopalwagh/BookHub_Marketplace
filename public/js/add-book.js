// this is a custom alert logic
function showAlert(message,type="error"){
    const alertBox = document.getElementById("customAlert");
    alertBox.innerText = message;
    alertBox.className = "fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white text-sm z-50";

    if(type === "success"){
        alertBox.classList.add("bg-green-500");
    }else if(type ==="warning"){
        alertBox.classList.add("bg-yellow-500");
    }else{
        alertBox.classList.add("bg-red-500");
    }
    alertBox.classList.remove("hidden");
    setTimeout(()=>{
        alertBox.classList.add("hidden");
    },3000);
}

// this is a fetch Book Data Logic
async function fetchBookData(){
    const title = document.getElementById("title").value;
    const autoBtn = document.getElementById("auto");
    autoBtn.innerText = "Fetching Data..." 
    if(!title){
        showAlert("Enter title first","warning");
        autoBtn.innerText = "Auto" 
        return;
    }
    try{
        const res = await fetch(`/search-books?q=${title}`);
        const books = await res.json();
        if(books.length==0){
            showAlert("No Book Found", "warning");
            autoBtn.innerText = "Auto";
            return;
        }
        // this is a first result
        const book = books[0];
        document.getElementById("author").value = book.authors?.join(", ") || "";
        document.getElementById("description").value = book.description || "";
        autoBtn.innerText = "Auto";
    }catch(err){
        console.log("error fetching Book data",err);
        showAlert("Error fetching book data", "error");
        autoBtn.innerText = "Auto";
    }
}