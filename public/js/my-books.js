console.log("it's working")
function openDeleteModal(bookId){
  document.getElementById("deleteModal").classList.remove("hidden");
  document.getElementById("deleteForm").action = "/host/delete-book/" + bookId;
}

function closeDeleteModal(){
  document.getElementById("deleteModal").classList.add("hidden");
}

// search ka code 
const searchInput = document.getElementById("searchInput");
const noResultsMessage = document.getElementById("noResultsMessage");

searchInput.addEventListener("keyup", function () {
  const searchValue = searchInput.value.toLowerCase();
  const books = document.querySelectorAll(".book-card");
  let anyVisible = false;

  books.forEach(function (book) {
    const title = book.dataset.title;
    const author = book.dataset.author;

    if (title.includes(searchValue) || author.includes(searchValue)) {
      book.style.display = "block";
      anyVisible = true;
    } else {
      book.style.display = "none";
    }
  });

  // Show message if no books are visible
  if (!anyVisible) {
    noResultsMessage.classList.remove("hidden");
  } else {
    noResultsMessage.classList.add("hidden");
  }
});

// Function to close the message
function closeNoResultsMessage() {
  noResultsMessage.classList.add("hidden");
  searchInput.value = ""; // clear search box
  const books = document.querySelectorAll(".book-card");
  books.forEach(book => book.style.display = "block"); // show all books again
}

// filter ka code 
const filterSelect = document.getElementById("stockFilter");
const books = document.querySelectorAll(".book-card");
filterSelect.addEventListener("change", function () {

  const filterValue = this.value;
  books.forEach(function(book){
    const stock = parseInt(book.dataset.stock);
    if(filterValue === "all"){
      book.style.display = "block";
    }
    else if(filterValue === "low"){
      if(stock > 0 && stock < 5){
        book.style.display = "block";
      }else{
        book.style.display = "none";
      }
    }
    else if(filterValue === "out"){
      if(stock === 0){
        book.style.display = "block";
      }else{
        book.style.display = "none";
      }
    }
  });
});

function changeSort(value){
  const url = new URL(window.location.href);
  url.searchParams.set("sort", value);
  window.location.href = url.toString();
}