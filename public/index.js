const error = document.getElementById("error");
const shortUrl = document.getElementById("shortUrl");

const urlRegex = new RegExp("^https?://");
const urlxcfRegex = new RegExp("^https?://urlx.cf"); 

document.getElementById("submit").onclick = () => {
    error.innerHTML = "";
  if (document.getElementById("fullUrl").value == null || document.getElementById("fullUrl").value == "") {
    error.innerHTML = "You need to put a link.";
  } else if (urlRegex.test(document.getElementById("fullUrl").value) == false) {
    error.innerHTML = "Your link needs to start with http:// or https://";
  } else if (urlxcfRegex.test(document.getElementById("fullUrl").value) == true) {
    error.innerHTML = "Your link can't contain urlx.cf";
  } else {
    (async () => {
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullUrl: document.getElementById("fullUrl").value }),
      });
      const r = await response.json();
      shortUrl.innerHTML = `<a href="${r.shortUrl}" class="shortUrl" id="shortUrla">https://urlx.cf/${r.shortUrl}</a>`;
      document.getElementById("clipboard").classList.remove("hidden");
    })();
  }
};

document.getElementById("clipboard").onclick = () => {
    navigator.clipboard.writeText(document.getElementById("shortUrla").innerText);
    document.getElementById("clipboard").classList.remove("fa-clipboard");
    document.getElementById("clipboard").classList.add("fa-clipboard-check");
    setTimeout(async() => {
        document.getElementById("clipboard").classList.remove("fa-clipboard-check");
        document.getElementById("clipboard").classList.add("fa-clipboard");
    }, 1500)
}
