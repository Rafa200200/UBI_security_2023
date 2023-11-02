const SERVER_URL = "http://localhost:3333";

async function postRequest(url, body) {
  const response = await fetch(`${SERVER_URL}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return response.json();
}

async function getRequest(url) {
  const response = await fetch(`${SERVER_URL}${url}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return response.json();
}

async function deleteRequest(url) {
  const response = await fetch(`${SERVER_URL}${url}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return response.json();
}

function handleIsLogged() {
  const logged = window.localStorage.getItem("logged");
  if (logged === "true") {
    return true;
  }
  return false;
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const body = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  postRequest("/login", body).then((data) => {
    console.log(data);
    if (data.message === "Login realizado com sucesso") {
      window.localStorage.setItem("logged", "true");
      document.location.href = "/dashboard";
    } else {
      alert("Erro ao fazer login");
    }
  });
}

function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const body = {
    password: formData.get("password"),
    email: formData.get("email"),
    hmac_type: Number(formData.get("hmac_type")),
    cipher_type: formData.get("cipher_type"),
  };

  postRequest("/register", body).then((data) => {
    console.log(data);
    if (data.id) {
      document.location.href = "/";
    } else {
      alert("Erro ao se cadastrar");
    }
  });
}

function handleLogout(e) {
  deleteRequest("/logout").then((data) => {
    window.localStorage.setItem("logged", "false");

    document.location.href = "/";
  });
}

function writeTextOnCleanText(text) {
  const cleanText = document.getElementById("clean-text");
  cleanText.innerHTML = text;
}

function handleGetPostById(id) {
  getRequest(`/posts/${id}`).then((data) => {
    console.log(data);
    writeTextOnCleanText(data.message);
  });
}

function createPostHtml(post) {
  return `
    <div class="w-full mb-4 border-b-gray-400 border-b p-4">
      <p class="text-lg text-justify break-all">${post.text}</p>
      <p class="text-md">Criado em: ${Intl.DateTimeFormat("pt-PT", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(post.createdAt)}</p>
      <button onclick="handleGetPostById('${
        post.id
      }')" class="p-2 bg-green-400 w-full text-white">Decifrar</button>
      ${
        post.invalid === true
          ? `<p class="text-red-500">HMAC inválido. O texto foi comprometido ou modificado.</p>`
          : `<p class="text-green-500">HMAC válido. O texto não foi comprometido ou modificado.</p>`
      }
    </div>
  `;
}

function handleGetAllPosts() {
  getRequest("/posts").then((data) => {
    console.log(data);
    const texts = document.getElementById("texts");
    texts.innerHTML = "";
    data.reverse().forEach((post) => {
      texts.innerHTML += createPostHtml(post);
    });
  });
}

function handleCreatePost(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const body = {
    text: formData.get("text"),
  };

  postRequest("/posts", body).then((data) => {
    console.log(data);
    handleGetAllPosts();
  });
}

function start() {
  if (document.location.pathname.includes("dashboard")) {
    if (!handleIsLogged()) {
      document.location.href = "/";
    } else {
      handleGetAllPosts();
    }
  }
}

start();

function hack() {
  getRequest("/hack").then((data) => {});
}
