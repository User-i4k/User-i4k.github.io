// guard.js
(function () {
  // LocalStorage'dan kullanıcı adını al
  const username = localStorage.getItem("username");

  // Eğer kullanıcı adı yoksa, giriş sayfasına yönlendir
  if (!username) {
    alert("Lütfen önce kullanıcı adınızı girin.");
    window.location.href = "index.html";
    return;
  }

  // Eğer kullanıcı adı varsa, body'e kullanıcı adını ekle (isteğe bağlı)
  document.addEventListener("DOMContentLoaded", () => {
    const playerNameTag = document.getElementById("playerName");
    if (playerNameTag) playerNameTag.textContent = username;
  });
})();
