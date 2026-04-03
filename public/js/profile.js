setTimeout(() => {
    const popup = document.getElementById("successPopup");
    if (popup) popup.style.display = "none";
}, 3000);

async function getLocation(){
    if(!navigator.geolocation){
        alert("Geolocation not supported");
        return;
    }
    const button = event.target;
    button.innerText = "Fetching...";
    navigator.geolocation.getCurrentPosition(async(position)=>{
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try{
            const res = await fetch(`/get-address?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            document.getElementById("city").value = data.city || "";
            document.getElementById("pincode").value = data.pincode || "";
            document.getElementById("address").value = data.fullAddress || "";
        }catch(err){
            alert("Failed to Fetch Data");
        }
        button.innerText = "📍 Use Current Location";
    },()=>{
        alert("Permission denied");
        button.innerText = "📍 Use Current Location";
    }
  );
}
