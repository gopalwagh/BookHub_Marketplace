setTimeout(() => {
    const toast = document.getElementById("toast");
    if(toast){
        toast.style.opcacity = "0";
        setTimeout(()=>{
            toast.remove();
        },500);
    }
}, 3000);